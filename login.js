import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDW1OHe8pfRrJFM1UUaIkCca57CppVJD3k",
  authDomain: "secondbrain-87cd7.firebaseapp.com",
  projectId: "secondbrain-87cd7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔥 INIT RECAPTCHA (IMPORTANT)
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha', {
  size: 'normal',
  callback: () => {
    console.log("Recaptcha verified");
  }
});

// 📲 SEND OTP
window.sendOTP = async function () {
  let phone = document.getElementById("phone").value;

  // 🔥 AUTO ADD +91
  if (!phone.startsWith("+91")) {
    phone = "+91" + phone;
  }

  try {
    const appVerifier = window.recaptchaVerifier;

    const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);

    window.confirmationResult = confirmationResult;

    alert("✅ OTP Sent Successfully");

  } catch (error) {
    console.error(error);
    alert("❌ Failed to send OTP: " + error.message);
  }
};

// 🔐 VERIFY OTP
window.verifyOTP = async function () {
  const otp = document.getElementById("otp").value;

  try {
    const result = await window.confirmationResult.confirm(otp);

    const user = result.user;

    // Save user locally
    localStorage.setItem("user", JSON.stringify(user));

    alert("✅ Login Successful");

    window.location.href = "index.html";

  } catch (error) {
    console.error(error);
    alert("❌ Invalid OTP");
  }
};
