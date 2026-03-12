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
  try {
    var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : null;

    if (!sheetName) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "alive" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Sheet '" + sheetName + "' not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "ok", rows: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var headers = data[0];
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      rows.push(row);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", rows: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
