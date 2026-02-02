import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export const maxDuration = 30;

const languageInstructions: Record<string, string> = {
  en: "Respond in English.",
  hi: "हिंदी में जवाब दें। (Respond in Hindi language using Devanagari script)",
  mr: "मराठीत उत्तर द्या। (Respond in Marathi language using Devanagari script)",
};

// Calculate potential savings based on tip and consumption data
const calculateSavings = (tip: string, consumptionData: string): number => {
  // Extract power consumption data
  const powerMatch = consumptionData.match(/(\d+\.?\d*)kW/);
  const dailyCostMatch = consumptionData.match(/₹(\d+\.?\d*)\s*per day/);
  const monthlyCostMatch = consumptionData.match(/₹(\d+\.?\d*)\s*per month/);

  if (!powerMatch || !dailyCostMatch || !monthlyCostMatch) {
    return 0;
  }


  const monthlyCost = parseFloat(monthlyCostMatch[1]);

  // Estimate savings based on common efficiency improvements
  let savingsPercent = 0;

  // LED bulbs (typically 60-80% savings)
  if (tip.toLowerCase().includes('led') || tip.toLowerCase().includes('bulb')) {
    savingsPercent = 0.7;
  }
  // 5-star rated appliances (typically 20-30% savings)
  else if (tip.toLowerCase().includes('star') || tip.toLowerCase().includes('rated')) {
    savingsPercent = 0.25;
  }
  // Inverter AC (typically 30-40% savings)
  else if (tip.toLowerCase().includes('inverter') || tip.toLowerCase().includes('ac')) {
    savingsPercent = 0.35;
  }
  // Smart plugs/timers (typically 10-15% savings)
  else if (tip.toLowerCase().includes('timer') || tip.toLowerCase().includes('smart')) {
    savingsPercent = 0.12;
  }
  // General efficiency improvement (10-20% savings)
  else {
    savingsPercent = 0.15;
  }

  const monthlySavings = monthlyCost * savingsPercent;
  const yearlySavings = monthlySavings * 12;

  return yearlySavings;
};

export async function POST(req: NextRequest) {
  const googleApiKey = process.env.GOOGLE_API_KEY;

  if (!googleApiKey) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt, language = "en" } = await req.json();
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const langInstruction =
      languageInstructions[language] || languageInstructions.en;

    const systemPrompt = {
      role: "system",
      content: `You are an electrical engineering expert. ${langInstruction}

Based on the following power consumption data:
      ${prompt}

Provide exactly 3 energy-saving tips that are:
1. Practical and specific
2. Focused on cost savings
3. Each under 100 characters
4. Related to the actual power consumption provided
5. Suggest actual alternative products or methods where applicable for example "Use [company/product name] instead of [current product name]".

${langInstruction}`,
    };

    const result = await model.generateContent(systemPrompt.content);
    const response = result.response.text();

    const tips = response
      .split(/\d+\.\s+/)
      .filter((tip) => tip.trim())
      .map((tip) => tip.trim())
      .slice(0, 3);

    // Calculate potential savings for each tip
    const tipsWithSavings = tips.map(tip => {
      // Try to extract appliance suggestions and calculate savings
      const savingsEstimate = calculateSavings(tip, prompt);
      return {
        tip,
        savings: savingsEstimate
      };
    });

    return new Response(JSON.stringify(tipsWithSavings), {
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
      },
    );
  }
}
