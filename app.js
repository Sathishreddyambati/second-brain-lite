// 🔥 STEP 1: FIREBASE CONFIG (REPLACE THIS)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🎤 Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

document.getElementById("recordBtn").onclick = () => {
  recognition.start();
};

recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript;
  document.getElementById("textOutput").innerText = text;

  const keywords = text.toLowerCase().split(" ");

  await db.collection("memories").add({
    text: text,
    keywords: keywords,
    timestamp: Date.now()
  });

  speak("Saved!");
};

// 🔍 SEARCH FUNCTION
async function searchMemory() {
  const query = document.getElementById("query").value.toLowerCase();

  const snapshot = await db.collection("memories").get();

  let found = "Not found";

  snapshot.forEach(doc => {
    const data = doc.data();

    if (data.keywords.some(k => query.includes(k))) {
      found = data.text;
    }
  });

  document.getElementById("result").innerText = found;
  speak(found);
}

// 🔊 TEXT TO SPEECH
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
}
