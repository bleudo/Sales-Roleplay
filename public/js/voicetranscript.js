const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  console.log("SpeechRecognition is available in this browser.");

  const recognition = new SpeechRecognition();
  
  let finalTranscript = "";
  let isListening = false;
  
  const startBtn = document.getElementById("start-record-btn");
  const transcriptParagraph = document.getElementById("transcript");
  const feedbackContent = document.getElementById("feedbackContent");
  const finishBtn = document.getElementById("finishBtn");
  const aiResponse = document.getElementById("ai-response");
  const languageSelected = document.getElementById("language")

  recognition.lang = languageSelected.value;
  recognition.interimResults = true;
  recognition.continuous = true;

languageSelected.addEventListener('change', () => {
  recognition.lang = languageSelected.value;
  console.log("Recognition language changed to:", recognition.lang);
});

  const inactivityTimeout = 3000;
  let inactivityTimer;

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      if (isListening) {
        recognition.stop();
        console.log("Recognition stopped due to inactivity.");
        isListening = false;
        startBtn.disabled = false;
      }
    }, inactivityTimeout);
  };

  startBtn.addEventListener("click", () => {
    finalTranscript = "";
    recognition.lang = languageSelected.value;
    recognition.start();
    isListening = true;
    console.log("Recognition started.");
    startBtn.disabled = true;
    resetInactivityTimer();
  });

  finishBtn.addEventListener("click", generateFeedback);

  recognition.addEventListener("result", (event) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + " ";
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    if(languageSelected.value === "en-US"){
      transcriptParagraph.innerHTML =
        "You: " +
        finalTranscript +
        '<i style="color:#999;">' +
        interimTranscript +
        "</i>";
    }else{
      transcriptParagraph.innerHTML =
      "Tú: " +
      finalTranscript +
      '<i style="color:#999;">' +
      interimTranscript +
      "</i>";
    }
    resetInactivityTimer();
  });

  recognition.addEventListener("end", () => {
    console.log("Recognition service disconnected.");
    if (finalTranscript) {
      sendToServer(finalTranscript);
    }
    if (isListening) {
      setTimeout(() => {
        recognition.start();
      }, 1000);
    } else {
      startBtn.disabled = false;
    }
  });

  recognition.addEventListener("error", (event) => {
    console.error("Speech recognition error:", event.error);
    isListening = false;
    startBtn.disabled = true;
  });

  function sendToServer(finalTranscript) {
    let selectedLanguage = languageSelected.value

    console.log("Sending to server:", finalTranscript);
    fetch("/process-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: finalTranscript,
        language: languageSelected.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from API:", data.response);
        aiResponse.innerText =  selectedLanguage === "en-US" ? "Customer: " + data.response : "Cliente: " + data.response;
        speakText(data.response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function restartConversation(){
    finalTranscript = '';
    transcriptParagraph.innerHTML = '';
    aiResponse.innerText = '';
  }

  async function generateFeedback() {
    const selectedLanguage = languageSelected.value;

    try {
      const response = await fetch("/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language: selectedLanguage }),
      });
      const data = await response.json();
      feedbackContent.innerHTML = data.feedback;
      console.log(data);
      if (languageSelected.value === "en-US") {
        alert(
          "Roleplay finished.📞 \n\nTake a look at  the feedback below ⬇ \n\nThen click the talk button to start a new roleplay!🚩"
        );
      } else {
        alert(
          "Juego de rol finalizado.📞 \n\nMira la retroalimentación a debajo ⬇ \n\nLuego, haz clic en el botón talk para comenzar un nuevo juego de rol!🚩"
        );
      }
      restartConversation();
    } catch (error) {
      console.error("Error generating feedback:", error);
      {
      }
    }
  }

  function speakText(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageSelected.value;
      utterance.rate = 1.4;
      speechSynthesis.speak(utterance);
    } else {
      console.error("Web Speech API is not supported in this browser.");
    }
  }
}