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

// Speech setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

const mic = document.getElementById("micCircle");
const status = document.getElementById("status");

// 🎤 CLICK MIC
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

// 🧠 OBJECT EXTRACTION (FIXED)
function getObject(text) {
  const words = text.split(" ");

  const ignore = [
    "i","kept","my","in","on","at","the",
    "a","an"
  ];

  const colors = [
    "red","blue","green","black","white","yellow","pink"
  ];

  for (let word of words) {
    if (!ignore.includes(word) && !colors.includes(word)) {
      return word.trim();
    }
  }

  return null;
}

// 📍 LOCATION EXTRACTION
function getLocation(text) {
  let loc = null;

  if (text.includes("in")) loc = text.split("in")[1];
  else if (text.includes("on")) loc = text.split("on")[1];
  else if (text.includes("at")) loc = text.split("at")[1];

  if (!loc) return null;

  return loc.replace("my", "").replace("the", "").trim();
}

// 🔍 SEARCH (FIXED)
async function searchMemory() {
  const query = document.getElementById("query").value.toLowerCase();

  let object = null;

  if (query.includes("my")) {
    object = query.split("my")[1].trim().split(" ")[0];
  }

  if (!object) {
    document.getElementById("result").innerText = "❌ Couldn't understand";
    return;
  }

  const snapshot = await getDocs(collection(db, "memories"));

  let latest = null;

  snapshot.forEach(doc => {
    const data = doc.data();

    if (data.object && data.object.toLowerCase() === object) {
      if (!latest || data.timestamp > latest.timestamp) {
        latest = data;
      }
    }
  });

  let answer = "❌ Not found";

  if (latest) {
    answer = `${latest.object} is in ${latest.location}`;
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
