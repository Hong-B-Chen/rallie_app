# Rallie Landing Page

Open `index.html` in a browser, or serve this folder with any static host.

## Court Capture

The page captures the court from the URL. Use this format for QR codes:

```text
index.html?court=Golden%20Gate%20Park%20Tennis%20Courts&courtId=ggp-tennis
```

Supported court parameters:

- `court`
- `courtName`
- `location`
- `c`

Supported court ID parameters:

- `courtId`
- `id`

Every form submission includes:

- name
- email
- phone
- court
- courtId
- preferences
- consent
- sourceUrl
- queryParams
- submittedAt

## Connecting Real Collection

For demo testing, submissions are saved in the visitor's browser local storage under:

```text
rallieLeadSubmissions
```

To collect real submissions, open `script.js` and set:

```js
const FORM_ENDPOINT = "https://your-form-or-api-endpoint";
```

That endpoint should accept a JSON `POST`.
