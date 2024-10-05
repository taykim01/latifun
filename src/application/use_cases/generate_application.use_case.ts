// Use Case 생성하는 use case
"use server";

import getUserAndProjectID from "@/core/utils/get_project_and_user_id";
import { Tables } from "../dao/database.types";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import llmRepository from "@/data/repositories/llm.repository";
import { serverClient } from "@/data/infrastructures/supabase/server";
import { createLLMResponse } from "./generate_application_code.use_case";

interface UseCaseResponse {
  title: string;
  description: string;
}

export async function createUseCase(useCaseData: Tables<"use_case">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("use_case").insert(useCaseData).single();
  if (error) throw new Error(error.message);
  return data;
}

export default async function generateApplicationUseCase(nodes: Tables<"node">[]) {
  // 유저가 입력한 node 정보를 조합해서 use case 생성 -> use_case row 저장
  // llm_response에 저장
  const { projectID } = await getUserAndProjectID();

  const nodesJSON = JSON.stringify(nodes);

  const input: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
            [role] You are a web product designer who is very good at developing.
            You need to write the name of the use case and its description based on the nodes that the user provides.
            The use case must be written in camelCase and the description in a clear and concise way.
            Remember, you are not coding yet, just writing the use case name(in camelCase) and description(in natual language).
            You need to write a PostgreSQL schema code for the use cases that the user provides.
            Return the result in the following JSON format:
            [
                {
                    "title": ...name of the use case in camelCase...,
                    "description": ...
                },
                {
                    "title": ...name of the use case in camelCase...,
                    "description": ...
                },
                ...
            ]
            Do NOT any other information in the code.
    `,
    },
    { role: "user", content: nodesJSON },
  ];

  const useCasesJSON = await llmRepository(input);

  const useCases: UseCaseResponse[] = JSON.parse(useCasesJSON);

  useCases.forEach(async (useCase) => {
    const useCaseData: Tables<"use_case"> = {
      code_id: null,
      created_at: new Date().toISOString(),
      description: useCase.description,
      id: "",
      project_id: projectID,
      test_code_id: null,
      test_success: false,
      title: useCase.title,
    };
    await createUseCase(useCaseData);
  });

  const llmData: Tables<"llm_response"> = {
    created_at: new Date().toISOString(),
    id: "",
    input: JSON.stringify(input),
    origin: "use_case",
    output: useCasesJSON,
    project_id: projectID,
  };

  await createLLMResponse(llmData);
}

// 태은
