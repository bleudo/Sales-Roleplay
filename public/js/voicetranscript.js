const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  console.log("SpeechRecognition is available in this browser.");

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;

  let finalTranscript = "";
  let isListening = false;

  const startBtn = document.getElementById("start-record-btn");
  const transcriptParagraph = document.getElementById("transcript");
  const feedbackContent = document.getElementById("feedbackContent");
  const finishBtn = document.getElementById("finishBtn");

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
    transcriptParagraph.innerHTML =
      "You: " +
      finalTranscript +
      '<i style="color:#999;">' +
      interimTranscript +
      "</i>";
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
    console.log("Sending to server:", finalTranscript);
    fetch("/process-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: finalTranscript,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from API:", data.response);
        document.getElementById("ai-response").innerText =
          "Customer: " + data.response;
        speakText(data.response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  async function generateFeedback() {
    try {
      const response = await fetch("/generate-feedback", { method: "POST" });
      const data = await response.json();
      feedbackContent.innerHTML = data.feedback;
      console.log(data);
    } catch (error) {
      console.error("Error generating feedback:", error);
      {
      }
    }
  }

  function speakText(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.3;
      speechSynthesis.speak(utterance);
    } else {
      console.error("Web Speech API is not supported in this browser.");
    }
  }
}
