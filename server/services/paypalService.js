const axios = require("axios");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL;
// the CRA dev server the browser actually navigates — the order's approve
// link must redirect back into it, not into this API's own origin/port
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// a function that gets PayPal access token
async function getAccessToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data.access_token;
}

// a function that create PayPal order.
// application_context.return_url is where PayPal sends the browser back to
// after the user approves the payment (with ?token=<order_id> appended) —
// the client's enroll page reads that token and calls captureOrder with it.
async function createOrder(amount, course_id) {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: String(course_id),
          amount: {
            currency_code: "ILS",
            value: Number(amount).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${CLIENT_URL}/user/courses/${course_id}/paypal/return`,
        cancel_url: `${CLIENT_URL}/user/courses`,
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}

// capture PayPal order
async function captureOrder(order_id) {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${order_id}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}

module.exports = {
  createOrder,
  captureOrder,
};
