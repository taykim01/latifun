"use server";

import OpenAI from "openai";
import { serverClient } from "@/data/infrastructures/supabase/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Tables, TablesInsert, TablesUpdate } from "../dao/database.types";
import { updateUseCase } from "./generate_application.use_case";
// import llmRepository from "@/data/repositories/llm.repository";
async function readUseCaseByNodeId(nodeId: string) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("use_case").select("*").eq("node_id", nodeId).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createLLMResponse(llmData: TablesInsert<"llm_response">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("llm_response").insert(llmData).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createCode(codeData: TablesInsert<"code">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("code").insert(codeData).select().single();
  if (error) throw new Error(error.message);
  return data;
}

interface UsecaseCodeResponse {
  code_id: string;
  node_id: string;
  name: string;
  code: string;
}

export default async function generateApplicationCodeUseCase(inputJson: string, projectId: string) {
  const supabase = serverClient();

  // use_case row에 있는 정보를 바탕으로 use case 코드 생성 -> code에 저장
  // llm_response에 저장
  const inputs = JSON.parse(inputJson);
  // type="USE_CASE"인 경우만 가져오기
  const useCaseNodes = inputs.filter((node: any) => node.type === "USE_CASE");

  const useCaseCodes: UsecaseCodeResponse[] = [];

  if (!useCaseNodes.length) return useCaseCodes;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  for (const node of useCaseNodes) {
    console.log("node", node);
    // use_case node 하나씩 실행
    const useCaseData = await readUseCaseByNodeId(node.id);
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: `You are a full-stack senior developer in Next.js who is so good at developing that your code never causes any error.\nYou are writing ${useCaseData.title} use-case function, which is business logic of our web application.\nFollow the domain-driven design principles and typescript.\n- based on given sql schema, user-flow and use-case, you should write code properly for a domain use case.\n- use "use server" directive and it is always async function.\n- Write the code in a clean, efficient way and type-safe.\n- use import { serverClient } from "@/data/infrastructures/supabase/server";\n- make sure use try-catch logic for error handling, with error type always specified to any.\n- every const and variable\'s should be defined type, there are no any type.\n- very type safe code with using supabase types. path always: @/application/dao/database.types.ts\n- use typescript generic type for supabase types, like Tables<"table_name"> or TablesInsert<"table_name"> etc.\nBut do not specify type when using supabase client, it occurs error. you don't need to specify types at supabase client. for example, use '''await supabase.from(\'todos\').update({ is_completed: isCompleted })''' instead of '''await supabase.from<Tables[\'todos\'], TablesInsert[\'todos\']>(\'todos\').update<Tables["todos"]>({ is_completed: isCompleted })'''\n- write comment at top of the function that describes what does this use-case function do.\n- use case function always must be export and async\n---\n[metadata]\nfile name: ${useCaseData.title}.ts\n---\n[Example]\n"use server";\n\nimport { serverClient } from "@/data/infrastructures/supabase/server";\nimport { ChatCompletionMessageParam } from "openai/resources/index.mjs";\nimport { Tables, TablesInsert } from "@/application/dao/database.types";\nimport llmRepository from "@/data/repositories/llm.repository";\n\nasync function readUseCaseByNodeId(nodeId: string) {\n\`\`\`\ncomments\n\`\`\`\n  const supabase = serverClient();\n  const { data, error } = await supabase.from("use_case").select("*").eq("node_id", nodeId).single();\n  if (error) throw new Error(error.message);\n  return data;\n}\n\n---\nReturn the result in the following JSON format:\n[{ "name": "name of file same as use-case title", "code": use-case code},{ "name": "name of file same as use-case title", "code": use-case code} ...]`,
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

    // const response = await llmRepository(input);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 2048,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "generated_db_schema_code",
          strict: false,
          schema: {
            type: "object",
            required: ["name", "code"],
            properties: {
              code: {
                type: "string",
                description: "code of use-case, business logic of project",
              },
              name: {
                type: "string",
                description: "The name of file, same as use-case name",
              },
            },
          },
        },
      },
    });

    const useCaseCodeJSON: string = response.choices[0].message.content!;

    const useCaseCode: UsecaseCodeResponse = JSON.parse(useCaseCodeJSON);
    console.log("useCaseCode", useCaseCode);
    const filePath = "src/application/use_cases/" + useCaseCode.name + ".ts";
    const { data: updatedCodeData, error: codeError } = await supabase
      .from("code")
      .update({ latest: false })
      .eq("filepath", filePath)
      .eq("project_id", projectId)
      .eq("latest", true);

    const code: TablesInsert<"code"> = {
      content: useCaseCode.code,
      extension: ".ts",
      filepath: filePath,
      metadata: "",
      project_id: projectId,
    };

    const codeRow = await createCode(code);
    useCaseCode.code_id = codeRow.id;
    useCaseCode.node_id = node.id;
    useCaseCodes.push(useCaseCode);

    // use_case row 업데이트
    const _updateUseCase: TablesUpdate<"use_case"> = {
      code_id: codeRow.id,
    };
    await updateUseCase(_updateUseCase, useCaseData.id);

    // llm_response에 저장
    const llmData: TablesInsert<"llm_response"> = {
      input: JSON.stringify(messages),
      origin: "use_case",
      output: useCaseCodeJSON,
      project_id: projectId,
    };

    await createLLMResponse(llmData);
  }
  return useCaseCodes;
}
