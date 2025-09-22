// netlify/functions/log-login.js
const { google } = require("googleapis");

// Load credentials from Netlify environment variables
// You can store the JSON as a single env variable, e.g. GOOGLE_SERVICE_ACCOUNT_JSON
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT;
const SHEET_ID = process.env.GOOGLE_SHEET_ID; // your sheet ID

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // Parse service account credentials
  const serviceAccount = JSON.parse(SERVICE_ACCOUNT_JSON);

  // Auth with Google Sheets
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const values = [
    [
      data.timestamp || new Date().toISOString(),
      data.username || "(unknown)",
      data.success ? "SUCCESS" : "FAIL",
      data.page || "",
    ],
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Logins!A:D", // change sheet name or range if needed
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });
    return { statusCode: 200, body: "Logged successfully" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Failed to write to Google Sheet" };
  }
};
