import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // Retrieve the Google API key from environment variables
  const googleApiKey = process.env.GOOGLE_API_KEY;

  if (!googleApiKey) {
    return new Response(
      JSON.stringify({
        error:
          "Google API key is missing. Please set GOOGLE_API_KEY in your .env file.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Initialize GoogleGenerativeAI with the API key
    const genAI = new GoogleGenerativeAI(googleApiKey);

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Parse the incoming request
    const context = await req.json();

    // Use the prompt from the request, or a default prompt
    const prompt = context.prompt || "Explain how AI works";

    // Generate content
    const result = await model.generateContent(prompt);

    // Return the response
    return new Response(
      JSON.stringify({
        text: result.response.text(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in AI generation:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while generating content",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
