import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase
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

const mic = document.getElementById("micCircle");
const status = document.getElementById("status");

// 🎤 MIC CLICK
mic.onclick = () => {
  recognition.start();
  mic.classList.add("active");
  status.innerText = "Listening...";
};

// 🎙️ RESULT
recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript.toLowerCase();
  status.innerText = text;

  const object = getObject(text);
  const location = getLocation(text);

  if (!object || !location) {
    speak("I couldn't understand");
    mic.classList.remove("active");
    return;
  }

  await addDoc(collection(db, "memories"), {
    object,
    location,
    timestamp: Date.now()
  });

  speak("Saved");
  mic.classList.remove("active");
};

// 🧠 GET OBJECT (FIXED)
function getObject(text) {
  const words = text.split(" ");
  const ignore = ["i","kept","my","in","on","at","the"];

  for (let w of words) {
    if (!ignore.includes(w)) return w;
  }
  return null;
}

// 📍 GET LOCATION
function getLocation(text) {
  if (text.includes("in")) return text.split("in")[1].trim();
  if (text.includes("on")) return text.split("on")[1].trim();
  if (text.includes("at")) return text.split("at")[1].trim();
  return null;
}

// 🔍 SEARCH (FIXED STRONG LOGIC)
async function searchMemory() {
  const query = document.getElementById("query").value.toLowerCase();

  let object = null;

  // Extract object from question
  if (query.includes("my")) {
    object = query.split("my")[1].trim().split(" ")[0];
  }

  const snapshot = await getDocs(collection(db, "memories"));

  let latest = null;

  snapshot.forEach(doc => {
    const data = doc.data();

    if (data.object === object) {
      if (!latest || data.timestamp > latest.timestamp) {
        latest = data;
      }
    }
  });

  let answer = "Not found";

  if (latest) {
    answer = `${latest.object} is on ${latest.location}`;
  }

  document.getElementById("result").innerText = answer;
  speak(answer);
}

// 🔊 SPEAK
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
}

window.searchMemory = searchMemory;
