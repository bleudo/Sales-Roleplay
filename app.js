import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const initialPromptEN = `You are participating in a sales roleplay to help me practice my sales skills. I am a beginner in sales aspiring to join a large sales corporation and earn substantial compensation. My role is to reach out to a potential customer (you), and you are an important CEO. We have to navigate through a realistic sales interaction; you should have a more difficult role. It should not be easy for me as the seller for you to buy the product. You will act as the customer, providing objections, smokescreens, negotiation tactics, and typical customer behaviors throughout the interaction. Don't prolong the conversation unnecessarily; when you feel it's enough and that I haven't reached any point, end the conversation by hanging up the phone. I will begin the roleplay by making initial contact with you. Then you respond, and we will continue the conversation.`;

const initialPromptES = `Estás participando en un juego de roles de ventas para ayudarme a practicar mis habilidades. Soy un principiante en ventas que aspira a unirse a una gran corporación y obtener una compensación sustancial. Mi objetivo es contactar a un cliente potencial (tú) que eres un director ejecutivo importante. Debemos simular una interacción de ventas realista en la que tú actuarás como un cliente con objeciones, tácticas de negociación y comportamientos típicos. 

El objetivo es que logre agendar una llamada breve para mostrarte el producto. La llamada no debe ser fácil pero tampoco demasiado difícil. Si la conversación no avanza, cierra la llamada de manera apropiada. Si la conversación va bien y logro convencerte de coordinar una llamada, infórmame. 

Cuando decidas terminar la interacción, ya sea que se haya agendado una cita o no, el último mensaje debe ser: "Haz click  en el boton Finish Roleplay". Comenzaré el juego de roles con el contacto inicial y luego responderás para continuar la conversación.`;

let conversationHistory = [];

app.get("/", (req, res) => {
  res.render("index.ejs", { response: null });
});

app.post("/process-speech", async (req, res) => {
  const { text, language } = req.body;
  console.log("Received request:", text, "Language:", language);

  conversationHistory.push({ role: "user", parts: [{ text }] });
  console.log("User input pushed", conversationHistory);

  try {
    let chat;
    if (conversationHistory.length === 1) { 
      const initialPrompt = language === "es-ES" ? initialPromptES : initialPromptEN;
      console.log("Seleced language: ", language);

      chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: initialPrompt }] },
          { role: "model", parts: [{ text: "" }] },
        ],
      });
    } else {
      chat = model.startChat({
        history: conversationHistory,
      });
    }

    const result = await chat.sendMessage(text);
    const aiResponse = result.response.text();

    conversationHistory.push({ role: "model", parts: [{ text: aiResponse }] });
    console.log("AI Response:", aiResponse);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error generating message:", error);
    res
      .status(500)
      .json({ error: "Failed to process the message", details: error.message });
  }
});

app.post("/generate-feedback", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const { language } = req.body;

    const conversationString = conversationHistory
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.parts[0].text}`)
      .join("\n");

    const promptES = `Eres un experto en ventas. Basándote en la siguiente conversación, proporciona retroalimentación sobre el desempeño del usuario en el juego de roles de ventas:
${conversationString}

La retroalimentación debe incluir:
1. Desempeño general
2. Fortalezas demostradas
3. Áreas de mejora
4. Ejemplos específicos de la conversación
5. Sugerencias para práctica futura

Dame la respuesta organizada en un solo párrafo. Trata de abarcar la mayor cantidad de informacion siempre y cuando sea importante.`;

    const promptEN = `You are an expert in sales. Based on the following conversation, provide feedback on the user's performance in the sales roleplay:

${conversationString}

Feedback should include:
1. Overall performance
2. Strengths demonstrated
3. Areas for improvement
4. Specific examples from the conversation
5. Suggestions for future practice

give me the answer organized in just one paragraph. Try to cover as much information as possible as long as it is important.`;

    const prompt = language === "es-ES" ? promptES : promptEN;

    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    conversationHistory = [];

    res.json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:", error);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});