# Rallie Home Page

This is a minimal tennis-themed home page for Rallie.

Open:

```text
index.html
```

The form captures:

- name
- email
- phone
- preferences
- consent
- sourceUrl
- submittedAt

For demo testing, submissions are saved in browser local storage under:

```text
rallieHomeLeads
```

To connect real lead collection, set `FORM_ENDPOINT` in `script.js` to your form service or backend endpoint.

## Google Sheets Setup

The page can send signups to Google Sheets through a Google Apps Script web app.

1. Create a new Google Sheet named `Rallie Signups`.
2. In the Sheet, go to `Extensions` > `Apps Script`.
3. Paste the contents of `google-sheets-apps-script.js`.
4. Click `Deploy` > `New deployment`.
5. Choose `Web app`.
6. Set `Execute as` to yourself.
7. Set `Who has access` to `Anyone`.
8. Copy the Web app URL.
9. Open `script.js` and replace:

```js
const FORM_ENDPOINT = "";
```

with:

```js
const FORM_ENDPOINT = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
```

The page automatically uses the browser-safe Google Apps Script submission mode
when the endpoint includes `script.google.com`.

The Google Sheet will receive these columns:

- Received At
- Name
- Email
- Phone
- SMS Consent
- Preferences
- Source URL
- Submitted At
