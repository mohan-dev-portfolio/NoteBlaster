import { GoogleGenAI, Type } from "@google/genai";
import type { StudyContent, Question, FillInTheBlankQuestion } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const studyContentSchema = {
  type: Type.OBJECT,
  properties: {
    notes: {
      type: Type.ARRAY,
      description: "A list of summarized key points, concepts, and definitions from the text. Each point should be a concise string.",
      items: { type: Type.STRING },
    },
    questions: {
      type: Type.ARRAY,
      description: "A list of 8-10 multiple-choice questions that test understanding of the material.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The question text." },
          options: {
            type: Type.ARRAY,
            description: "An array of 4 possible answers as strings.",
            items: { type: Type.STRING },
          },
          answer: {
            type: Type.STRING,
            description: "The correct answer, which must exactly match one of the strings in the 'options' array.",
          },
        },
        required: ["question", "options", "answer"],
      },
    },
    fillInTheBlankQuestions: {
      type: Type.ARRAY,
      description: "A list of 5-8 fill-in-the-blank or short-answer questions, perfect for a typing game. The answer should be a single word or short phrase.",
      items: {
          type: Type.OBJECT,
          properties: {
              question: { type: Type.STRING, description: "The question text, often with a '____' to indicate the blank." },
              answer: { type: Type.STRING, description: "The single word or short phrase that correctly fills the blank."}
          },
          required: ["question", "answer"]
      }
    }
  },
  required: ["notes", "questions", "fillInTheBlankQuestions"],
};


export async function generateStudyContent(text: string): Promise<StudyContent> {
  let processedText = text.replace(/\s+/g, ' ').trim();
  
  // Truncate very long text to avoid hitting token limits
  if(processedText.length > 45000) {
      console.warn("Input text is very long, truncating to ~45000 characters.");
      processedText = processedText.substring(0, 45000);
  }
  
  const prompt = `You are an expert study assistant. Based on the following text, please do three things:
1.  Extract and summarize the most important key points, concepts, and definitions into a concise list of notes.
2.  Create a list of 8-10 challenging multiple-choice questions. For each, provide four distinct options and the correct answer.
3.  Create a list of 5-8 "fill-in-the-blank" questions where the answer is a single key term or short phrase.

Ensure your entire response is a single, valid JSON object that strictly adheres to the provided schema.

Text to analyze:
---
${processedText}
---
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: studyContentSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);

    if (!parsedJson.notes || !parsedJson.questions) {
        throw new Error("AI response is missing required 'notes' or 'questions' fields.");
    }
    
    // Sanitize and validate multiple-choice questions
    const validQuestions: Question[] = parsedJson.questions.map((q: any) => {
        if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length < 2 || !q.answer) return null;
        let correctedAnswer = q.answer;
        if (!q.options.includes(q.answer)) {
            const bestMatch = q.options.find((opt: string) => q.answer.includes(opt) || opt.includes(q.answer));
            if (bestMatch) correctedAnswer = bestMatch;
            else return null;
        }
        const uniqueOptions = [...new Set(q.options.map((opt: any) => String(opt)))];
        if (uniqueOptions.length < 2) return null;
        return { question: String(q.question), options: uniqueOptions, answer: correctedAnswer };
    }).filter((q: Question | null): q is Question => q !== null);

    if (validQuestions.length === 0) {
        throw new Error("The AI failed to generate any valid multiple-choice questions.");
    }

    // Sanitize and validate fill-in-the-blank questions
    const validFillInTheBlank: FillInTheBlankQuestion[] = (parsedJson.fillInTheBlankQuestions || []).map((q: any) => {
        if (!q.question || !q.answer || typeof q.question !== 'string' || typeof q.answer !== 'string' || q.answer.trim().length === 0) {
            return null;
        }
        return { question: q.question.trim(), answer: q.answer.trim() };
    }).filter((q: FillInTheBlankQuestion | null): q is FillInTheBlankQuestion => q !== null);
    
    return {
        notes: parsedJson.notes,
        questions: validQuestions,
        fillInTheBlankQuestions: validFillInTheBlank,
    } as StudyContent;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("valid questions")) {
        throw error;
    }
    throw new Error("The AI failed to generate study content. The provided document might be too complex or not contain enough text.");
  }
}
