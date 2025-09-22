const { GoogleSpreadsheet } = require("google-spreadsheet");

const docId = process.env.GOOGLE_SHEET_ID; // Sheet ID
const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT); // JSON key

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const { username, page } = data;

    const doc = new GoogleSpreadsheet(docId);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle["Logins"];

    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      Username: username,
      Page: page,
      IP: event.headers["x-nf-client-connection-ip"] || "unknown",
    });

    return { statusCode: 200, body: "Logged" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Error logging login" };
  }
};
