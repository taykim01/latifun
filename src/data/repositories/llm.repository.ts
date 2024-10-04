"use server";

import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

export default async function llmRepository(messages: ChatCompletionMessageParam[]): Promise<string> {
    const openai = new OpenAI({
        apiKey: process.env.UPSTAGE_API_KEY!,
        baseURL: "https://api.upstage.ai/v1/solar",
    });

    const chatCompletion = await openai.chat.completions.create({
        model: "solar-pro",
        messages: messages,
        response_format: { type: "json_object" },
    });

    const response: string = chatCompletion.choices[0].message.content!;
    if (!response) throw new Error("No response from LLM");

    return response;
}
