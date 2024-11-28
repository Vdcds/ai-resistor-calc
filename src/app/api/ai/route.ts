import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const googleApiKey = process.env.GOOGLE_API_KEY;

  if (!googleApiKey) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt } = await req.json();
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemPrompt = {
      role: "system",
      content: `You are an electrical engineering expert. Based on the following power consumption data:
      ${prompt}

      Provide exactly 3 energy-saving tips that are:
      1. Practical and specific
      2. Focused on cost savings
      3. Each under 100 characters
      4. Related to the actual power consumption provided`,
    };

    const result = await model.generateContent(systemPrompt.content);
    const response = result.response.text();

    const tips = response
      .split(/\d+\.\s+/)
      .filter((tip) => tip.trim())
      .map((tip) => tip.trim())
      .slice(0, 3);

    return new Response(JSON.stringify(tips), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate tips",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
