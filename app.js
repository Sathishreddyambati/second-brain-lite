import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}
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

const mic = document.getElementById("micCircle");
const status = document.getElementById("status");

// 🎤 RECORD MEMORY
mic.onclick = () => {
  recognition.start();
  mic.classList.add("active");
  status.innerText = "Listening...";
};

// 🎙️ SAVE MEMORY
recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript.toLowerCase();
  status.innerText = text;

  await addDoc(collection(db, "users", user.uid, "memories"), {
    text: text,
    timestamp: Date.now()
  });

  speak("Saved");
  mic.classList.remove("active");
};

// 🔍 SEARCH MEMORY (FINAL FIX)
async function searchMemory() {
  let query = document.getElementById("query").value.toLowerCase();

  // remove symbols (?, . , etc)
  query = query.replace(/[^\w\s]/gi, "");

  let object = null;

  if (query.includes("my")) {
    object = query.split("my")[1].trim().split(" ")[0];
  }

  if (!object) {
    document.getElementById("result").innerText = "❌ Couldn't understand";
    return;
  }

  const snapshot = await getDocs(collection(db, "memories"));

  let found = null;

  snapshot.forEach(doc => {
    const data = doc.data();

    const cleanText = data.text.toLowerCase().replace(/[^\w\s]/gi, "");

    if (cleanText.includes(object)) {
      found = data;
    }
  });

  let answer = "❌ Not found";

  if (found) {
    answer = formatAnswer(found.text);
  }

  document.getElementById("result").innerText = answer;
  speak(answer);
}

// 🧠 FORMAT ANSWER
function formatAnswer(text) {
  let clean = text.toLowerCase();

  // remove extra words
  clean = clean.replace("i kept", "").trim();

  // extract object + location properly
  let objectPart = "";
  let locationPart = "";

  if (clean.includes("in")) {
    const parts = clean.split("in");
    objectPart = parts[0];
    locationPart = parts[1];
  } else if (clean.includes("on")) {
    const parts = clean.split("on");
    objectPart = parts[0];
    locationPart = parts[1];
  } else if (clean.includes("at")) {
    const parts = clean.split("at");
    objectPart = parts[0];
    locationPart = parts[1];
  }

  // clean object
  let object = objectPart.replace("my", "").trim();

  // clean location
  let location = locationPart
    .replace("my", "")
    .replace("the", "")
    .trim();

  return `${object} is in ${location}`;
}

// 🔊 SPEAK
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
}

window.searchMemory = searchMemory;
