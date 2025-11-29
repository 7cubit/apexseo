import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn("OPENAI_API_KEY is not set in environment variables.");
}

export const openai = new OpenAI({
    apiKey: apiKey || "dummy-key", // Fallback to avoid crash during build if env is missing
});

export async function analyzeText(text: string, prompt: string) {
    if (!apiKey || apiKey === "dummy-key") {
        return "OpenAI API Key is missing or invalid. Cannot perform analysis.";
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert SEO analyst. Analyze the provided text based on the user's prompt.",
                },
                {
                    role: "user",
                    content: `Prompt: ${prompt}\n\nText to analyze:\n${text.substring(0, 15000)}`, // Limit context window
                },
            ],
            max_tokens: 1000,
        });

        return response.choices[0].message.content || "No analysis generated.";
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return "Error occurred during analysis.";
    }
}
