/**
 * Nocturnist Survey & Preferences — Google Apps Script Receiver
 *
 * Receives POST requests from survey.html and preferences.html,
 * appends rows to the bound spreadsheet.
 */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    var source = body.source;
    var version = body.version || "";
    var timestamp = body.timestamp || new Date().toISOString();
    var respondentId = body.respondentId || "";
    var payload = body.payload || "";

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(source);
    if (!sheet) {
      sheet = ss.insertSheet(source);
      sheet.appendRow(["timestamp", "respondentId", "version", "source", "payload"]);
    }

    sheet.appendRow([timestamp, respondentId, version, source, payload]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "alive" }))
    .setMimeType(ContentService.MimeType.JSON);
}
