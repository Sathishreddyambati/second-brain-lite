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

// 🎤 Speech
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

const recordBtn = document.getElementById("recordBtn");

// 🎙️ Start recording
recordBtn.onclick = () => {
  recordBtn.innerText = "🎙️ Listening...";
  recognition.start();
};

// 🎙️ When speech received
recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript.toLowerCase();
  document.getElementById("textOutput").innerText = text;

  // 🔥 Extract object + location
  const object = extractObject(text);
  const location = extractLocation(text);

  if (!object || !location) {
    speak("I couldn't understand properly");
    recordBtn.innerText = "🎤 Speak";
    return;
  }

  await addDoc(collection(db, "memories"), {
    object,
    location,
    text,
    timestamp: Date.now()
  });

  recordBtn.innerText = "🎤 Speak";
  speak("Saved successfully");
};

// 🔍 EXTRACT OBJECT
function extractObject(text) {
  const words = text.split(" ");
  const ignore = ["i", "kept", "my", "in", "at", "on"];

  for (let word of words) {
    if (!ignore.includes(word)) {
      return word;
    }
  }
  return null;
}

// 📍 EXTRACT LOCATION
function extractLocation(text) {
  if (text.includes("in")) {
    return text.split("in")[1].trim();
  }
  return null;
}

// 🔍 SEARCH
async function searchMemory() {
  const query = document.getElementById("query").value.toLowerCase();

  const object = extractObject(query);

  const snapshot = await getDocs(collection(db, "memories"));

  let found = null;

  snapshot.forEach(doc => {
    const data = doc.data();

    if (data.object === object) {
      found = data;
    }
  });

  let resultText = "I couldn't find it";

  if (found) {
    resultText = `Your ${found.object} is in ${found.location}`;
  }

  document.getElementById("result").innerText = resultText;
  speak(resultText);
}

// 🔊 SPEAK
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
}

window.searchMemory = searchMemory;
