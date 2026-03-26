import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDW1OHe8pfRrJFM1UUaIkCca57CppVJD3k",
  authDomain: "secondbrain-87cd7.firebaseapp.com",
  projectId: "secondbrain-87cd7",
  storageBucket: "secondbrain-87cd7.firebasestorage.app",
  messagingSenderId: "414645241950",
  appId: "1:414645241950:web:dbeca811bc59ad56404ccf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Speech
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

let mode = "save";

const recordBtn = document.getElementById("recordBtn");
const status = document.getElementById("status");

// 🎤 SAVE
recordBtn.onclick = () => {
  mode = "save";
  recognition.start();
  recordBtn.classList.add("listening");
  status.innerText = "Listening...";
};

// 🎤 ASK MIC
document.getElementById("askMicBtn").onclick = () => {
  mode = "ask";
  recognition.start();
  status.innerText = "Ask your question...";
};

// 🎙️ RESULT
recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript.toLowerCase();
  document.getElementById("textOutput").innerText = text;

  if (mode === "save") {
    const object = extractObject(text);
    const location = extractLocation(text);

    if (!object || !location) {
      showToast("❌ Couldn't understand");
      resetUI();
      return;
    }

    await addDoc(collection(db, "memories"), {
      object,
      location,
      text,
      timestamp: Date.now()
    });

    showToast("✅ Memory Saved");
    speak("Saved");

  } else {
    document.getElementById("query").value = text;
    searchMemory();
  }

  resetUI();
};

// RESET UI
function resetUI() {
  recordBtn.classList.remove("listening");
  status.innerText = "";
}

// 🧠 BETTER OBJECT
function extractObject(text) {
  const words = text.split(" ");
  const ignore = ["i", "kept", "my", "in", "on", "at", "the"];
  return words.find(w => !ignore.includes(w));
}

// 📍 LOCATION
function extractLocation(text) {
  if (text.includes("in")) return text.split("in")[1].trim();
  if (text.includes("on")) return text.split("on")[1].trim();
  if (text.includes("at")) return text.split("at")[1].trim();
  return null;
}

// 🔍 SEARCH
async function searchMemory() {
  const query = document.getElementById("query").value.toLowerCase();
  const object = extractObject(query);

  const snapshot = await getDocs(collection(db, "memories"));

  let best = null;

  snapshot.forEach(doc => {
    const data = doc.data();

    if (data.object.includes(object) || object.includes(data.object)) {
      best = data;
    }
  });

  let result = "❌ Not found";

  if (best) {
    result = `📍 Your ${best.object} is ${best.location}`;
  }

  document.getElementById("result").innerText = result;
  speak(result);
}

// 🔊 VOICE
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
}

// 🔔 TOAST
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

window.searchMemory = searchMemory;
