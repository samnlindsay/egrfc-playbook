// netlify/functions/log-login.js
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const payload = JSON.parse(event.body);
    const { username, timestamp, page } = payload;

    // GA4 measurement protocol requires: measurement_id, api_secret, client_id
    const MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID; // e.g. G-XXXXXXX
    const API_SECRET = process.env.GA_API_SECRET; // from GA UI
    if (!MEASUREMENT_ID || !API_SECRET) {
      console.error("GA env missing");
      return { statusCode: 500, body: "Server misconfigured" };
    }

    // client_id: if you can receive from client side (gtag cookie) send it; otherwise set server-generated uuid
    // We'll set a uid to help GA dedupe; more correct approach is to pass client_id from client
    const client_id = payload.client_id || "server-" + Math.random().toString(36).slice(2,10);

    const eventBody = {
      client_id,
      events: [
        {
          name: "site_login",
          params: {
            username: username,
            page_path: page,
            login_time: timestamp
          }
        }
      ]
    };

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(eventBody),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("GA MP error", res.status, text);
      return { statusCode: 500, body: "GA error" };
    }

    return { statusCode: 204, body: "" };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
};
