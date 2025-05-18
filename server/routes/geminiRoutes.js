import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import run from "../../config/gemni.js";

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/explain", async (req, res) => {
  try {
    const { question, options, correctAnswer, selectedAnswer } = req.body;

    if (!question || !options || !correctAnswer) {
      return res.status(400).json({ message: "Question details are required" });
    }

    const isCorrect = correctAnswer === selectedAnswer;

    const model = genAI.getGenerativeModel({
      model: "models/gemini-pro",
    });

    const prompt = `
      - Question: "${question}"
      - Options: [${options.join(", ")}]
      - Correct Answer: "${correctAnswer}"
      - Selected Answer: "${selectedAnswer}"
      Please:
      1. Explain why the correct answer is correct.
      2. If the user selected the wrong answer, gently explain why that choice was incorrect.
      3. Keep it educational, friendly, and concise (like a tutor).
    `;

    const result = await run(prompt);
    const cleanedResult = result
      .replace(/\*\*(.*?)\*\*/g, "$1") // remove bold **
      .replace(/\*(.*?)\*/g, "$1") // remove italic *
      .replace(/^\s*[\d]+\.\s*/gm, "") // remove numbered list like "1. ", "2. " if needed
      .trim();
    console.log(result);
    res.json({ explanation: cleanedResult, isCorrect });
    console.log(result);
  } catch (error) {
    console.error("❌ Error generating explanation with Gemini:", error);
    res.status(500).json({ message: "Failed to generate explanation" });
  }
});

export default router;
