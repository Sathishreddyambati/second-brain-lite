import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDW1OHe8pfRrJFM1UUaIkCca57CppVJD3k",
  authDomain: "secondbrain-87cd7.firebaseapp.com",
  projectId: "secondbrain-87cd7",
  storageBucket: "secondbrain-87cd7.firebasestorage.app",
  messagingSenderId: "414645241950",
  appId: "1:414645241950:web:dbeca811bc59ad56404ccf",
  measurementId: "G-1JGYEEBJML"
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🎤 Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Button click → start recording
document.getElementById("recordBtn").onclick = () => {
  recognition.start();
};

// When speech is captured
recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript;
  document.getElementById("textOutput").innerText = text;

  const keywords = text.toLowerCase().split(" ");

  try {
    await addDoc(collection(db, "memories"), {
      text: text,
      keywords: keywords,
      timestamp: Date.now()
    });

    speak("Saved successfully");
  } catch (error) {
    console.error("Error saving:", error);
    speak("Error saving data");
  }
};

// 🔍 SEARCH FUNCTION
async function searchMemory() {
  const query = document.getElementById("query").value.toLowerCase();

  try {
    const snapshot = await getDocs(collection(db, "memories"));

    let found = "I couldn't find anything";

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.keywords.some(k => query.includes(k))) {
        found = data.text;
      }
    });

    document.getElementById("result").innerText = found;
    speak(found);

  } catch (error) {
    console.error("Error fetching:", error);
    speak("Error retrieving data");
  }
}

// 🔊 TEXT TO SPEECH
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
}

// Make function accessible from HTML
window.searchMemory = searchMemory;
