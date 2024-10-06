// /(pages) 구조 생성하는 use case
"use server";

import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

interface PresentationPageSpecResponse {
  url: string;
  filepath: string;
  description: string;
}

export default async function generatePresentationPageSpecUseCase(inputJson: string, projectID: string) {
  // presentation 관련 node 가져와서 페이지 구조 생성
  // llm_response에 저장
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: [
        {
          type: "text",
          text: 'You are a expert software engineer. You need to define the page structure of web application based on the node/edge relationships of product\\\'s user-flow. The product could be any kind of web application.\n- Our framework is nextjs14 using app router with server side rendering (aka server component), page structure should be stick to it. \n- The page url has to be stick to next14 app router, which is folder structure. Detailed Rule below:\n-- filepath: /src/app/page.tsx -> url: /\n-- parenthesis folder organizes routes without affecting the URL path. \nfilepath: src/app/(main)/page.tsx -> url: /\n-- filepath: src/app/(main)test/page.tsx -> url: /test\n-- filepath: src/app/(main)/project/[project_id] -> url: /project/[project_id]\n- return the result in the following JSON format:\n[{"url": relative path of url, "filepath": detailed filepath for this page, "description": what does this page do, what data should be set when server side rendering with supabse, what UI components need and its abstract layout}]\n- description should be very detailed that any programmer could write page.tsx code without your help.',
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: inputJson,
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    max_tokens: 2048,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "generated_page_spec_schema_code",
        strict: false,
        schema: {
          type: "object",
          required: [],
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                required: ["url", "filepath", "description"],
                properties: {
                  url: {
                    type: "string",
                    description: "relative url of this page",
                  },
                  filepath: {
                    type: "string",
                    description: "relative filepath of this page, starts with src/",
                  },
                  description: {
                    type: "number",
                    description:
                      "what does this page do, what data should be set when server side rendering with supabse, what UI components need and its abstract layout",
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const pageSpecJSON: string = response.choices[0].message.content!;

  // const useCasesJSON = await llmRepository(input);

  const pageSpecs: PresentationPageSpecResponse[] = JSON.parse(pageSpecJSON).results;
  return pageSpecs;
}
