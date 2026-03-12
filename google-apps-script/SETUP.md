# Google Apps Script Setup

## Steps

1. Go to https://sheets.google.com and create a new spreadsheet
2. Name it "Nocturnist Survey Responses"
3. Click Extensions → Apps Script
4. Delete the default code in Code.gs
5. Paste the entire contents of `google-apps-script/receiver.gs`
6. Click Deploy → New Deployment
7. Type: Web app
8. Execute as: Me
9. Who has access: Anyone
10. Click Deploy
11. Copy the Web app URL
12. Paste the URL into `config.js` as the value of `APPS_SCRIPT_URL`
13. Commit and push — submissions will now auto-deliver to your spreadsheet

## Testing

1. Open survey.html in a browser
2. Complete the survey
3. On the final screen, the submission should show a green "Submitted automatically" message
4. Check the Google Sheet — a new row should appear in the "survey" tab

## Troubleshooting

- If you get a CORS error: redeploy the Apps Script and make sure "Who has access" is set to "Anyone"
- If you get "Script function not found": make sure the function is named exactly `doPost`
- Each time you edit receiver.gs, you must create a NEW deployment (not update the old one) for changes to take effect
