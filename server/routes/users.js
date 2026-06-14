const express = require("express");
const router = express.Router();
const axios = require("axios");

const { validateUpdateMyDetails } = require("../validations/usersValidations");
const { requireLogin } = require("../validations/authValidation");

const userQ = require("../queries/usersQueries");

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

module.exports = router;
