import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDW1OHe8pfRrJFM1UUaIkCca57CppVJD3k",
  authDomain: "secondbrain-87cd7.firebaseapp.com",
  projectId: "secondbrain-87cd7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Recaptcha
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha', {
  size: 'normal'
});

// Send OTP
window.sendOTP = async function () {
  const phone = document.getElementById("phone").value;

  const appVerifier = window.recaptchaVerifier;

  const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);

  window.confirmationResult = confirmationResult;

  alert("OTP Sent");
};

// Verify OTP
window.verifyOTP = async function () {
  const otp = document.getElementById("otp").value;

  const result = await window.confirmationResult.confirm(otp);

  const user = result.user;

  // Save login
  localStorage.setItem("user", JSON.stringify(user));

  alert("Login Success");

  window.location.href = "index.html";
};
