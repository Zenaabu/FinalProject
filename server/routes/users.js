const express = require("express");
const router = express.Router();
const axios = require("axios");

const {
  validateUpdateMyDetails,
  validateCanCreatePayPalOrder,
} = require("../validations/usersValidations");
const { requireLogin } = require("../validations/authValidation");

const userQ = require("../queries/usersQueries");
const paypalService = require("../services/paypalService");
const courseQ = require("../queries/courseQueries");

// PUT user details
// url: /api/user/me
router.put("/me", requireLogin, validateUpdateMyDetails, (req, res) => {
  const user_id = req.session.user.user_id;

  userQ.updateMyDetails(user_id, req.updatedUser, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  });
});

// GET weather + sea details
// url: /api/user/weather
router.get("/weather", requireLogin, async (req, res) => {
  try {
    const latitude = 32.794;
    const longitude = 34.9896;

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,rain,wind_speed_10m` +
      `&timezone=auto`;

    const marineUrl =
      `https://marine-api.open-meteo.com/v1/marine` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=wave_height` +
      `&forecast_days=1` +
      `&timezone=auto`;

    console.log("Weather URL:", weatherUrl);
    console.log("Marine URL:", marineUrl);

    const weatherRes = await axios.get(weatherUrl);
    const weatherData = weatherRes.data;

    let waveHeight = null;

    try {
      const marineRes = await axios.get(marineUrl);
      const marineData = marineRes.data;

      if (
        marineData.hourly &&
        marineData.hourly.wave_height &&
        marineData.hourly.wave_height.length > 0
      ) {
        waveHeight = marineData.hourly.wave_height[0];
      }
    } catch (marineErr) {
      console.log("Marine API failed:");
      console.log(marineErr.config?.url);
      console.log(marineErr.message);
      console.log(marineErr.response?.data);
    }

    res.json({
      success: true,
      weather: {
        temperature: weatherData.current.temperature_2m,
        isRaining: weatherData.current.rain > 0,
        rainAmount: weatherData.current.rain,
        windSpeed: weatherData.current.wind_speed_10m,
        waveHeight: waveHeight,
      },
    });
  } catch (err) {
    console.log("Weather API failed:");
    console.log(err.config?.url);
    console.log(err.message);
    console.log(err.response?.data);

    res.status(500).json({
      success: false,
      message: "Failed to get weather data",
    });
  }
});

// POST create PayPal order
// url: /api/users/courses/:course_id/paypal/create-order
router.post(
  "/courses/:course_id/paypal/create-order",
  requireLogin,
  validateCanCreatePayPalOrder,
  async (req, res) => {
    try {
      const { course_id } = req.params;
      const user_id = req.session.user.user_id;
      const course = req.course;
      const order = await paypalService.createOrder(course.price, course_id);
      const approveLink = order.links.find(
        (link) => link.rel === "approve",
      )?.href;

      userQ.createCourseReservation(
        user_id,
        course_id,
        order.id,
        (err, result) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          res.status(201).json({
            success: true,
            order_id: order.id,
            reservation_id: result.insertId,
            approve_link: approveLink,
          });
        },
      );
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

// POST capture PayPal order
// url: /api/users/courses/:course_id/paypal/capture-order
router.post(
  "/courses/:course_id/paypal/capture-order",
  requireLogin,
  async (req, res) => {
    const { course_id } = req.params;
    const user_id = req.session.user.user_id;
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Order id is required",
      });
    }

    userQ.findPendingReservation(
      order_id,
      user_id,
      course_id,
      async (err, rows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        if (!rows || rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Pending reservation not found or expired",
          });
        }

        const reservation = rows[0];

        try {
          const capture = await paypalService.captureOrder(order_id);

          if (capture.status !== "COMPLETED") {
            userQ.failReservation(reservation.reservation_id, () => {});

            return res.status(400).json({
              success: false,
              message: "Payment was not completed",
            });
          }

          const receipt_number = capture.id;

          userQ.isUserRegistered(user_id, course_id, (checkErr, regRows) => {
            if (checkErr) {
              return res.status(500).json({
                success: false,
                message: checkErr.message,
              });
            }

            if (regRows.length > 0) {
              userQ.failReservation(reservation.reservation_id, () => {});

              return res.status(409).json({
                success: false,
                message: "You are already registered to this course",
              });
            }

            userQ.getCourseTakenPlaces(course_id, (placeErr, placeRows) => {
              if (placeErr) {
                return res.status(500).json({
                  success: false,
                  message: placeErr.message,
                });
              }

              const places = placeRows[0];

              const taken =
                Number(places.registered_count) + Number(places.pending_count);

              if (taken > Number(places.capacity)) {
                userQ.failReservation(reservation.reservation_id, () => {});

                return res.status(409).json({
                  success: false,
                  message: "Course is full",
                });
              }

              userQ.completeCourseRegistration(
                user_id,
                course_id,
                reservation.reservation_id,
                receipt_number,
                (err2) => {
                  if (err2) {
                    return res.status(500).json({
                      success: false,
                      message: err2.message,
                    });
                  }

                  res.json({
                    success: true,
                    message:
                      "Payment completed and user registered successfully",
                    receipt_number,
                  });
                },
              );
            });
          });
        } catch (captureErr) {
          userQ.failReservation(reservation.reservation_id, () => {});

          res.status(500).json({
            success: false,
            message: captureErr.message,
          });
        }
      },
    );
  },
);

module.exports = router;
