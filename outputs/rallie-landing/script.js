const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxMOXF4q7DfoSRudoo36c8u4mPmKy0Vizm0KCv-KpqBO2lebUoKeFnL80w_oQSpOKwxsw/exec";
const STORAGE_KEY = "rallieLeadSubmissions";

const params = new URLSearchParams(window.location.search);
const courtFromUrl =
  params.get("court") ||
  params.get("courtName") ||
  params.get("location") ||
  params.get("c") ||
  "";
const courtIdFromUrl = params.get("courtId") || params.get("id") || "";

const courtName = cleanCourtName(courtFromUrl);
const courtId = courtIdFromUrl.trim();
const resolvedCourt = courtName || "Unknown court";

const courtPreview = document.querySelector("#courtNamePreview");
const courtChip = document.querySelector("#courtNameChip");
const courtField = document.querySelector("#courtField");
const courtIdField = document.querySelector("#courtIdField");
const sourceUrlField = document.querySelector("#sourceUrlField");
const courtDisplayField = document.querySelector("#courtDisplayField");
const leadForm = document.querySelector("#leadForm");
const formMessage = document.querySelector("#formMessage");

courtPreview.textContent = resolvedCourt;
courtChip.textContent = resolvedCourt;
courtField.value = resolvedCourt;
courtIdField.value = courtId;
sourceUrlField.value = window.location.href;
courtDisplayField.value = courtId ? `${resolvedCourt} (${courtId})` : resolvedCourt;

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  if (!leadForm.checkValidity()) {
    leadForm.reportValidity();
    showMessage("Please complete the required fields.", "error");
    return;
  }

  const formData = new FormData(leadForm);
  const submission = {
    name: String(formData.get("name")).trim(),
    email: String(formData.get("email")).trim(),
    phone: String(formData.get("phone")).trim(),
    court: resolvedCourt,
    courtId,
    preferences: formData.getAll("preferences"),
    consent: formData.get("consent") === "on",
    sourceUrl: window.location.href,
    queryParams: Object.fromEntries(params.entries()),
    submittedAt: new Date().toISOString(),
  };

  try {
    await submitLead(submission);
    saveLocalSubmission(submission);
    leadForm.reset();
    courtField.value = resolvedCourt;
    courtIdField.value = courtId;
    sourceUrlField.value = window.location.href;
    courtDisplayField.value = courtId ? `${resolvedCourt} (${courtId})` : resolvedCourt;
    showMessage("You're on the list. We'll use this court as your launch signal.", "success");
  } catch (error) {
    showMessage("Something went wrong. Please try again in a moment.", "error");
  }
});

function cleanCourtName(value) {
  return value.replace(/\+/g, " ").trim();
}

async function submitLead(submission) {
  if (!FORM_ENDPOINT) {
    return Promise.resolve();
  }

  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    throw new Error(`Submission failed: ${response.status}`);
  }
}

function saveLocalSubmission(submission) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  existing.push(submission);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

function clearMessage() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
}
