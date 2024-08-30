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

const initialPrompt = 
`You are participating in a sales roleplay to help me practice my sales skills. I am a beginner in sales aspiring to join a large sales corporation and earn substantial compensation. My role is to reach out to a potential customer (you), and you are an important CEO with a lot of work right now. We have to navigate through a realistic sales interaction; you should have a more difficult role. It should not be easy for me as the seller for you to buy the product. You will act as the customer, providing objections, smokescreens, negotiation tactics, and typical customer behaviors throughout the interaction. When I say 'Finish the call,' the roleplay will conclude, and you will provide an overall evaluation based on the following criteria: 1. Preparation: Research, clear objective, structure. 2. Opening: Introduction, value, hook. 3. Development: Active listening, open-ended questions, personalization, solution. 4. Handling Objections: Listen, empathize, reframe, benefits. 5. Closing. I will begin the roleplay by making initial contact with you. Then you respond, and we will continue the conversation. Take Any questions before we start?`;

app.get("/", (req, res) => {
  res.render("index.ejs", { response: null });
});

app.post("/process-speech", async (req, res) => {
  const { text } = req.body;
  console.log('Received request:', text);

  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: initialPrompt }] },
        { role: "model", parts: [{ text }] }
      ],
    });

    const result = await chat.sendMessage(text);
    const aiResponse = result.response.text();

    console.log('AI Response:', aiResponse);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error generating message:", error);
    res.status(500).json({ error: "Failed to process the message", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
 