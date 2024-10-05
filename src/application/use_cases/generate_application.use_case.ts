// Use Case 생성하는 use case
"use server";

import OpenAI from "openai";
import { revalidatePath } from "next/cache";
import { Tables, TablesInsert } from "../dao/database.types";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import llmRepository from "@/data/repositories/llm.repository";
import { serverClient } from "@/data/infrastructures/supabase/server";
import { createLLMResponse } from "./generate_application_code.use_case";

interface UseCaseResponse {
  title: string;
  description: string;
}

export async function createUseCase(useCaseData: TablesInsert<"use_case">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("use_case").insert(useCaseData).single();
  if (error) throw new Error(error.message);
  return data;
}

export default async function generateApplicationUseCase(projectID: string) {
  // export default async function generateApplicationUseCase(nodes: Tables<"node">[]) {
  // 유저가 입력한 node 정보를 조합해서 use case 생성 -> use_case row 저장
  // llm_response에 저장
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const supabase = serverClient();
  // project_id=projectID인 node들을 가져온다.
  const { data: allNodes, error } = await supabase.from("node").select("*").eq("project_id", projectID);
  if (error) throw new Error(error.message);
  // type = "EDGE" 인 모두 따로 저장
  const edges = allNodes.filter((node) => node.type === "EDGE");
  // type = "USER_FLOW_ACTION", "USER_FLOW_PAGE"는 nodes에 남겨둔다. 다른 type 종류 매우 많음, USER_FLOW_ACTION, USER_FLOW_PAGE만 남겨둔다.
  const nodes = allNodes.filter((node) => node.type === "USER_FLOW_ACTION" || node.type === "USER_FLOW_PAGE");

  // console.log(edges);
  // console.log(nodes);

  const parsedNodes = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    data: node.data,
    position: JSON.parse(node.position),
  }));

  const parsedEdges = edges.map((edge) => {
    const data = JSON.parse(edge.data);
    return {
      id: data.id,
      type: edge.type,
      source: data.source,
      target: data.target,
    };
  });

  const combinedNodes = [...parsedNodes, ...parsedEdges];

  const nodesJSON = JSON.stringify(combinedNodes);
  // console.log(nodesJSON);

  const input: ChatCompletionMessageParam[] = [
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
          text: nodesJSON,
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: input,
    max_tokens: 2048,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "generated_use_case_text_object",
        schema: {
          type: "object",
          required: ["use_cases"],
          properties: {
            use_cases: {
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

  const useCases: UseCaseResponse[] = JSON.parse(useCasesJSON);

  useCases.forEach(async (useCase) => {
    const useCaseData: TablesInsert<"use_case"> = {
      code_id: null,
      description: useCase.description,
      project_id: projectID,
      test_code_id: null,
      test_success: false,
      title: useCase.title,
    };
    await createUseCase(useCaseData);
  });

  const llmData: TablesInsert<"llm_response"> = {
    input: JSON.stringify(input),
    origin: "use_case",
    output: useCasesJSON,
    project_id: projectID,
  };

  await createLLMResponse(llmData);

  revalidatePath("/project/" + projectID);
}

// 태은
