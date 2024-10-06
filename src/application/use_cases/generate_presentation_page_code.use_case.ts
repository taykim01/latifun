// 레이아웃, 컨트롤러를 포함하는 각 페이지 생성하는 use case
"use server";

import OpenAI from "openai";
import { serverClient } from "@/data/infrastructures/supabase/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { TablesInsert } from "../dao/database.types";
import { createCode, createLLMResponse } from "./generate_application_code.use_case";

interface ComponentCodeResponse {
  filename: string;
  filepath: string;
  code: string;
}

export default async function generatePresenationPageCodeUseCase(
  pageSpecNodeJson: string,
  componentCodeNodeJson: string,
  useCaseCodeNodesJson: string,
  schemaNodesJson: string,
  projectId: string
) {
  // presentation 관련 node 가져와서 레이아웃, 컨트롤러를 포함하는 각 페이지 생성
  const supabase = serverClient();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: [
        {
          type: "text",
          text: 'You are a expert software engineer. You need to write client component that given component spec\'s of web application. The product could be any kind of web application.\n- Our framework is nextjs14 using app router with server side rendering (aka server component), page structure should be stick to it.\n- always use "use client" directive at top of code.\n- use import { serverClient } from "@/data/infrastructures/supabase/server";\n- always get user data by supabase client. Example: ```const supabase = createClient(); const {data: { user },} = await supabase.auth.getUser();```\n- component file name should be same as component spec, STICK TO PLAN!\n- We always use Shadcn UI for UI components, specify what component could be used at description.\n- path of shadcn ui always @/presentation/shadcn/[component].tsx. shadcn components are all seperated files, so import seperately.\n-- List of Shadcn UI components: \naccordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip\n- every const and variable\'s should be defined type, there are no any type.\n- very type safe code with using supabase types. path always: @/application/dao/database.types.ts\n- use typescript generic type at supabase types, like Tables<"table_name"> or TablesInsert<"table_name"> etc.\nBut do not use type at supabase client, it occurs error. for example, WRONG CASE) supabase.from<Tables[\'todos\'], TablesInsert[\'todos\']>(\'todos\') | RIGHT CASE) upabase.from(\'todos\')\n- consider carefully db schema, page\'s spec and component\'s spec that match each of data type is properly matched.\n- if UI component have to invoke business logic, we should use use-case code that already written. also all event should use use-case function.\n- path of use-case always: @/application/use_cases/[use-case].ts\n\n[{"filename": file name of component, "filepath": detailed filepath for this page, "code": our component]',
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `[Page Spec]\n${pageSpecNodeJson}`,
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `[Component Code]\n${componentCodeNodeJson}`,
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `[Use-Case Code]\n${useCaseCodeNodesJson}`,
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `[Schema Nodes]\n${schemaNodesJson}`,
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
        name: "generated_component_code_schema_code",
        strict: false,
        schema: {
          type: "object",
          required: ["filename", "filepath", "code"],
          properties: {
            filename: {
              type: "string",
              description: "file name of this component",
            },
            filepath: {
              type: "string",
              description: "relative filepath of this page, starts with src/",
            },
            code: {
              type: "string",
              description: "code of our component",
            },
          },
        },
      },
    },
  });

  // const response = await llmRepository(input);
  const componentCodeJSON: string = response.choices[0].message.content!;

  const componentCode: ComponentCodeResponse = JSON.parse(componentCodeJSON);
  console.log(componentCode);

  const { data: updateCodeData, error: updateCodeError } = await supabase
    .from("code")
    .update({ latest: false })
    .eq("filepath", componentCode.filepath)
    .eq("project_id", projectId)
    .eq("latest", true);

  const code: TablesInsert<"code"> = {
    content: componentCode.code,
    extension: ".tsx",
    filepath: componentCode.filepath,
    metadata: "",
    project_id: projectId,
    latest: true,
    sha1sum: "",
  };

  await createCode(code);

  // llm_response에 저장
  const llmData: TablesInsert<"llm_response"> = {
    input: JSON.stringify(messages),
    origin: "page_code",
    output: componentCodeJSON,
    project_id: projectId,
  };

  await createLLMResponse(llmData);
  return componentCode;
}
