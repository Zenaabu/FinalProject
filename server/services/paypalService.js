const axios = require("axios");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL;

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

// a function that create PayPal order
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
