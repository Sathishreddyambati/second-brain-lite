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

  await addDoc(collection(db, "memories"), {
    text: text,
    timestamp: Date.now()
  });

  speak("Saved");
  mic.classList.remove("active");
};

// 🧠 SIMPLE AI MATCHING FUNCTION
function scoreMatch(query, text) {
  const qWords = query.split(" ");
  const tWords = text.split(" ");

  let score = 0;

  qWords.forEach(q => {
    tWords.forEach(t => {
      // match singular/plural + partial
      if (t.includes(q) || q.includes(t)) {
        score++;
      }
    });
  });

  return score;
}

// 🔍 SEARCH (AI SMART)
async function searchMemory() {
  const query = document.getElementById("query").value.toLowerCase();

  const snapshot = await getDocs(collection(db, "memories"));

  let best = null;
  let bestScore = 0;

  snapshot.forEach(doc => {
    const data = doc.data();

    const score = scoreMatch(query, data.text);

    if (score > bestScore) {
      bestScore = score;
      best = data;
    }
  });

  let answer = "❌ Not found";

  if (best && bestScore > 0) {
    answer = formatAnswer(best.text);
  }

  document.getElementById("result").innerText = answer;
  speak(answer);
}

// 🧠 FORMAT NICE ANSWER
function formatAnswer(text) {
  // extract location after in/on/at
  let location = "";

  if (text.includes("in")) location = text.split("in")[1];
  else if (text.includes("on")) location = text.split("on")[1];
  else if (text.includes("at")) location = text.split("at")[1];

  location = location?.replace("my", "").trim();

  // extract object (last word before in/on)
  let object = text.split("in")[0].split("on")[0].split("at")[0];
  object = object.replace("i kept", "").replace("my", "").trim();

  return `${object} is in ${location}`;
}

// 🔊 SPEAK
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
}

window.searchMemory = searchMemory;
