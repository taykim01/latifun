// DB 스키마 생성하는 use case + Type 업데이트 해줘야 함
"use server";

import getUserAndProjectID from "@/core/utils/get_project_and_user_id";
import runCommand from "@/core/utils/run_command";
import { serverClient } from "@/data/infrastructures/supabase/server";
import llmRepository from "@/data/repositories/llm.repository";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Tables } from "../dao/database.types";
import { createCode } from "./generate_application_code.use_case";

async function readUseCaseByProjectID(projectID: string, select?: string) {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("use_case")
    .select(select || "*")
    .eq("project_id", projectID);
  if (error) throw new Error(error.message);
  return data;
}

export default async function generateSchemaCodeUseCase() {
  // use_case title/description 정보 가져와서 storage,code에 저장
  // type 업데이트하기
  // llm_response에 저장

  const { projectID } = await getUserAndProjectID();

  const useCases = await readUseCaseByProjectID(projectID, "title, description");

  const input: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
            [role] You are a backend senior developer in Supabase and PostgreSQL who is so good at developing that your code never causes any error.
            You need to write a PostgreSQL schema code for the use cases that the user provides.
            Return the result in the following JSON format:
            {
                "title": "schema for ${projectID}",
                "code": ...
            }
            Do NOT any other information in the code.
    `,
    },
    { role: "user", content: JSON.stringify(useCases) },
  ];

  const response = await llmRepository(input);

  const code: Tables<"code"> = {
    content: response,
    created_at: new Date().toISOString(),
    extension: ".sql",
    filepath: "src/data/schema/schema.sql",
    id: "",
    metadata: "",
    project_id: projectID,
    latest: true,
    sha1sum: "",
  };

  await createCode(code);

  await runCommand("npx supabase login");
  await runCommand("npx supabase init");
  await runCommand(
    'npx supabase gen types --lang=typescript --project-id "$PROJECT_REF" --schema public > database.types.ts'
  );
}

// 태은
