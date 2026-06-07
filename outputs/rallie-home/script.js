const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxMOXF4q7DfoSRudoo36c8u4mPmKy0Vizm0KCv-KpqBO2lebUoKeFnL80w_oQSpOKwxsw/exec";
const STORAGE_KEY = "rallieHomeLeads";

const params = new URLSearchParams(window.location.search);
const courtName = (
  params.get("court") ||
  params.get("courtName") ||
  params.get("location") ||
  params.get("c") ||
  "Unknown court"
).trim();

document.querySelector("#previewCourt").textContent = courtName;
document.querySelector("#sourceUrl").value = window.location.href;

const form = document.querySelector("#leadForm");
const message = document.querySelector("#message");
const stepOne = document.querySelector('[data-step="1"]');
const stepTwo = document.querySelector('[data-step="2"]');
const successStep = document.querySelector('[data-step="success"]');
const continueButton = document.querySelector("#continueButton");
const skipPhoneButton = document.querySelector("#skipPhoneButton");
const anotherReservationButton = document.querySelector("#anotherReservationButton");
const phoneField = document.querySelector("[data-phone-field]");
const requiredStepOneFields = [
  document.querySelector('[name="name"]'),
  document.querySelector('[name="email"]'),
];

continueButton.addEventListener("click", () => {
  const isStepOneValid = requiredStepOneFields.every((field) => field.reportValidity());

  if (!isStepOneValid) {
    return;
  }

  showPhoneStep();
});

anotherReservationButton.addEventListener("click", () => {
  form.reset();
  resetHiddenFields();
  message.textContent = "";
  successStep.classList.remove("active");
  stepTwo.classList.remove("active");
  stepOne.classList.add("active");
  document.querySelector('[name="name"]').focus();
});

skipPhoneButton.addEventListener("click", () => {
  phoneField.value = "";
  submitLead({ requirePhone: false });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (stepOne.classList.contains("active")) {
    const isStepOneValid = requiredStepOneFields.every((field) => field.reportValidity());

    if (isStepOneValid) {
      showPhoneStep();
    }

    return;
  }

  submitLead({ requirePhone: true });
});

async function submitLead({ requirePhone } = { requirePhone: true }) {
  const isStepOneValid = requiredStepOneFields.every((field) => field.reportValidity());

  if (!isStepOneValid) {
    stepTwo.classList.remove("active");
    stepOne.classList.add("active");
    return;
  }

  if (requirePhone && !phoneField.value.trim()) {
    phoneField.setCustomValidity("Add a phone number, or choose Skip for now.");
    phoneField.reportValidity();
    phoneField.addEventListener("input", clearPhoneValidation, { once: true });
    return;
  }

  phoneField.setCustomValidity("");

  const formData = new FormData(form);
  const lead = {
    name: String(formData.get("name")).trim(),
    email: String(formData.get("email")).trim(),
    phone: String(formData.get("phone")).trim(),
    preferences: formData.getAll("preferences"),
    smsConsent: formData.get("smsConsent") === "on",
    sourceUrl: window.location.href,
    submittedAt: new Date().toISOString(),
  };

  try {
    if (FORM_ENDPOINT) {
      await sendLeadToEndpoint(lead);
    }

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    existing.push(lead);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    form.reset();
    resetHiddenFields();
    message.textContent = "";
    stepOne.classList.remove("active");
    stepTwo.classList.remove("active");
    successStep.classList.add("active");
  } catch {
    message.textContent = "Something went wrong. Please try again.";
  }
}

function resetHiddenFields() {
  document.querySelector("#sourceUrl").value = window.location.href;
}

function showPhoneStep() {
  message.textContent = "";
  stepOne.classList.remove("active");
  successStep.classList.remove("active");
  stepTwo.classList.add("active");
  phoneField.focus();
}

function clearPhoneValidation() {
  phoneField.setCustomValidity("");
}

async function sendLeadToEndpoint(lead) {
  if (FORM_ENDPOINT.includes("script.google.com")) {
    await fetch(FORM_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(lead),
    });
    return;
  }

  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    throw new Error("Lead submission failed");
  }
}
