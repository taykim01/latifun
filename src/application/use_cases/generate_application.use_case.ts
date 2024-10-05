// Use Case 생성하는 use case
"use server";

import OpenAI from "openai";
import { Tables, TablesInsert, TablesUpdate } from "../dao/database.types";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { serverClient } from "@/data/infrastructures/supabase/server";
import { createLLMResponse } from "./generate_application_code.use_case";

interface UseCaseResponse {
  title: string;
  description: string;
}

export async function createUseCase(useCaseData: TablesInsert<"use_case">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("use_case").insert(useCaseData).select();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateUseCase(useCaseData: TablesUpdate<"use_case">, useCaseID: string) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("use_case").update(useCaseData).eq("id", useCaseID);
  if (error) throw new Error(error.message);
  return data;
}

export default async function generateApplicationUseCase(inputJson: string, projectID: string) {
  // export default async function generateApplicationUseCase(nodes: Tables<"node">[]) {
  // 유저가 입력한 node 정보를 조합해서 use case 생성 -> use_case row 저장
  // llm_response에 저장
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: [
        {
          text: 'You are a expert software engineer. You need to write the name of the use case and its description based on the node/edge relationships of product\'s user-flow. The product could be any kind of web application.\nThe use case means business logic of application, it differs from page view or UI logic, so you should exclude page view or UI logic. Futhermore, business logic means core logic of our application and it includes interacting with database, connecting data and UI components.\nThe use case must be written in camelCase and the description in a clear and concise way.\nRemember, you are not coding yet, just writing the use case name(in camelCase) and description(in natual language). Return the result in the following JSON format:\n[{"title": ...name of the use case in camelCase..., "description": ...}, { "title": ...name of the use case in camelCase..., "description": ... }, ... ]\nDo NOT any other information in the code.',
          type: "text",
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
        name: "generated_use_case_text_object",
        schema: {
          type: "object",
          required: ["results"],
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                required: ["title", "description"],
                properties: {
                  title: {
                    type: "string",
                    description: "The name of the use case in camelCase",
                  },
                  description: {
                    type: "string",
                    description: "Description of the use case",
                  },
                },
              },
            },
          },
        },
        strict: false,
      },
    },
  });

  const useCasesJSON: string = response.choices[0].message.content!;

  // const useCasesJSON = await llmRepository(input);

  const useCases: UseCaseResponse[] = JSON.parse(useCasesJSON).results;

  const newUseCases: Tables<"use_case">[] | any[] = [];
  for (const useCase of useCases) {
    const useCaseData: TablesInsert<"use_case"> = {
      code_id: null,
      description: useCase.description,
      project_id: projectID,
      test_code_id: null,
      test_success: false,
      title: useCase.title,
    };
    const newUseCase = await createUseCase(useCaseData);
    console.log(newUseCase);
    newUseCases.push(newUseCase[0]);
  }

  const llmData: TablesInsert<"llm_response"> = {
    input: JSON.stringify(messages),
    origin: "use_case",
    output: useCasesJSON,
    project_id: projectID,
  };

  await createLLMResponse(llmData);

  return newUseCases;
}
