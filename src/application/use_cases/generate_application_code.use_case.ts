// test code를 생성하는 use case
"use server";

import { serverClient } from "@/data/infrastructures/supabase/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Tables } from "../dao/database.types";
import llmRepository from "@/data/repositories/llm.repository";
import getUserAndProjectID from "@/core/utils/get_project_and_user_id";

async function readUseCase(useCaseID: string) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("use_case").select("*").eq("id", useCaseID).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createLLMResponse(llmData: Tables<"llm_response">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("llm_response").insert(llmData).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createCode(codeData: Tables<"code">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("code").insert(codeData).single();
  if (error) throw new Error(error.message);
  return data;
}

interface CodeRespnse {
  title: string;
  code: string;
}

export default async function generateApplicationCodeUseCase(useCaseID: string) {
  // use_case row에 있는 정보를 바탕으로 use case 코드 생성 -> code에 저장
  // llm_response에 저장
  const { projectID } = await getUserAndProjectID();

  const useCaseData: Tables<"use_case"> = await readUseCase(useCaseID);

  const input: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
        [role] You are a full-stack senior developer in Next.js who is so good at developing that your code never causes any error.
        You need to write a code for the use case that the user will provide.
        Follow the domain-driven design principles and typescript.
        You are writing the code for a domain use case, in "use server" async function.
        Write the code in a clean and efficient way.
        the name of the use case is ${useCaseData.title}.
        Return the result in the following JSON format:
        {
            "title": "${useCaseData.title}",
            "code": ...
        }
        Do NOT any other information in the code.
    `,
    },
    { role: "user", content: useCaseData.description },
  ];

  const response = await llmRepository(input);
  const output = JSON.parse(response) as CodeRespnse;

  const code: Tables<"code"> = {
    content: output.code,
    created_at: new Date().toISOString(),
    extension: ".ts",
    filepath: "src/application/use_cases/" + useCaseData.title + ".ts",
    id: "",
    metadata: "",
    project_id: projectID,
  };

  await createCode(code);

  const llmData: Tables<"llm_response"> = {
    created_at: new Date().toISOString(),
    id: "",
    input: JSON.stringify(input),
    origin: "use_case",
    output: response,
    project_id: projectID,
  };

  await createLLMResponse(llmData);
}

// 태은
