import File from "../model/file.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});


const getFileForAI = async (fileId) => {
    if (!fileId) {
        return { error: { status: 400, message: "File ID is required" } };
    }
    const file = await File.findById(fileId).lean();
    if (!file) {
        return { error: { status: 404, message: "File not found" } };
    }
    return { file };
};


export const getFileSummary = async (req, res) => {
    try {
        const { file, error } = await getFileForAI(req.params.id);
        if (error) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        const prompt = `
            You are an expert academic assistant.
            Generate a concise, 3-5 sentence summary for an e-learning material with the following details:
            
            Title: "${file.title}"
            Subject: "${file.subject}"
            Description: "${file.description}"

            Provide only the summary text, with no introductory phrases.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        return res.status(200).json({ success: true, data: { summary } });

    } catch (err) {
        console.error("AI Summary Error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Failed to generate AI summary",
            error: err.message,
        });
    }
};


export const getFileQuiz = async (req, res) => {
    try {
        const { file, error } = await getFileForAI(req.params.id);
        if (error) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        const prompt = `
            You are an expert quiz generator.
            Based on the following study material details, generate a 5-question multiple-choice quiz:
            
            Title: "${file.title}"
            Subject: "${file.subject}"
            Description: "${file.description}"

            Return *only* a valid JSON array. Do not include any other text, markdown, or commentary.
            The JSON array should follow this exact format:
            [
              {
                "question": "Your question text here",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "answer": "The correct option text"
              },
              ...
            ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        let parsedOutput;
        try {
            
            const cleanedText = rawText.replace(/```json\n|```/g, "").trim();
            parsedOutput = JSON.parse(cleanedText);
        } catch (err) {
            console.error("AI Quiz JSON Parse Error:", err.message);
            console.log("Raw AI Output:", rawText);
            return res.status(500).json({
                success: false,
                message: "Failed to parse AI quiz response. AI output was not valid JSON.",
                raw: rawText
            });
        }

        return res.status(200).json({ success: true, data: { quiz: parsedOutput } });

    } catch (err) {
        console.error("AI Quiz Error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Failed to generate AI quiz",
            error: err.message,
        });
    }
};