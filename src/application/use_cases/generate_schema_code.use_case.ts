// DB 스키마 생성하는 use case + Type 업데이트 해줘야 함
"use server";

import OpenAI from "openai";
import { serverClient } from "@/data/infrastructures/supabase/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { TablesInsert } from "../dao/database.types";
import { createCode, createLLMResponse } from "./generate_application_code.use_case";

interface SchemaResponse {
  name: string;
  description: string;
  code: string;
  sequence: number;
}

export default async function generateSchemaCodeUseCase(inputJson: string, projectId: string) {
  // use_case title/description 정보 가져와서 storage,code에 저장
  // type 업데이트하기
  // llm_response에 저장
  const supabase = serverClient();

  const { data: projectData, error: projectError } = await supabase
    .from("project")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError) {
    throw new Error(projectError.message);
  }

  const projectRef = projectData.supabase_ref;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: [
        {
          type: "text",
          text: 'You are a backend senior developer in Supabase and PostgreSQL who is so good at developing that your code never causes any error. You need to write a PostgreSQL code setting tables of the use cases that the user provides.\n- Look carefully use case descriptions, then consider what tables and columns should be needed. Make sure all case of our business logic can be dealt with.\n- All of table\'s primary key must be [id] column, type of uuid with default value of gen_random_uuid(). Also, all tables has created_at with timestamptz with default value of now().\n- If you need enum types, then create it first.\n- All string type should be [text] type.\n- Consider carefully foreign keys relationships, one-to-many or many-to-many.\n- Output execution sequence of table creation sql, because it might occur errors\n- We always consider user authentication with supabase auth table. We have [profiles] table, which definition is below: ```create table\n  public.profiles (\n    id uuid not null default gen_random_uuid (),\n    created_at timestamp with time zone not null default now(),\n    name text not null,\n    email text not null,\n    profile_img text null,\n    constraint profile_pkey primary key (id),\n    constraint profile_id_key unique (id),\n    constraint profile_id_fkey foreign key (id) references auth.users (id) on update cascade on delete set null\n  ) tablespace pg_default;```, user authentication should be based on this table, and authentication related column should be named [user_id]\n- Table name should be lower case with underscore, always plural.\n- Column name should be lower case with underscore.\nReturn the result in the following JSON format:\n[{ "name": "name of table", "code": table creation sql code, "sequence": execution sequence, description: description of table in terms of use-case}, { "name": "name of table", "code": table creation sql code, "sequence": execution sequence, description: description of table in terms of use-case}, ...]',
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
        name: "generated_db_schema_code",
        strict: false,
        schema: {
          type: "object",
          required: ["results"],
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of Table",
                  },
                  description: {
                    type: "string",
                    description: "Description of the Table",
                  },
                  code: {
                    type: "string",
                    description: "SQL code for Table creation",
                  },
                  sequence: {
                    type: "number",
                    description: "Execution sequence of sql code",
                  },
                },
                required: ["name", "description", "code", "sequence"],
              },
            },
          },
        },
      },
    },
  });

  // const response = await llmRepository(input);
  const schemasJSON: string = response.choices[0].message.content!;

  const schemas: SchemaResponse[] = JSON.parse(schemasJSON).results;
  schemas.push({
    name: "profiles",
    description: "User profile table",
    code: `create table
  public.profiles (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    name text not null,
    email text not null,
    profile_img text null,
    constraint profile_pkey primary key (id),
    constraint profile_id_fkey foreign key (id) references auth.users (id) on update cascade on delete set null
  ) tablespace pg_default;`,
    sequence: 0,
  });
  schemas.sort((a, b) => a.sequence - b.sequence);

  for (const schema of schemas) {
    console.log(schema.code);
    const sqlResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${projectData.supabase_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: schema.code,
      }),
    });
    if (!sqlResponse.ok) {
      throw new Error(`Error executing SQL query: ${sqlResponse.statusText}`);
    }
  }

  // TODO: 에러가 났다면 이를 처리하는 llm 호출

  // Generate TypeScript types
  const typesResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/types/typescript`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${projectData.supabase_api_key}`,
    },
  });

  if (!typesResponse.ok) {
    throw new Error(`Error generating TypeScript types: ${typesResponse.statusText}`);
  }

  const { types } = (await typesResponse.json()) as { types: string };

  const { data: updateCodeData, error: updateCodeError } = await supabase
    .from("code")
    .update({ latest: false })
    .eq("filepath", "src/application/dao/database.types.ts")
    .eq("project_id", projectId)
    .eq("latest", true);

  const code: TablesInsert<"code"> = {
    content: types,
    extension: ".ts",
    filepath: "src/application/dao/database.types.ts",
    metadata: "",
    project_id: projectId,
    latest: true,
    sha1sum: "",
  };

  await createCode(code);

  const llmData: TablesInsert<"llm_response"> = {
    input: JSON.stringify(messages),
    origin: "schema",
    output: schemasJSON,
    project_id: projectId,
  };

  await createLLMResponse(llmData);

  return schemas;
}
