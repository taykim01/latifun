// /(pages) 구조 생성하는 use case
"use server";

import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

interface PresentationComponentSpecResponse {
  filename: string;
  filepath: string;
  description: string;
}

export default async function generatePresentationComponentSpecUseCase(
  inputJson: string,
  extraData: string,
  projectID: string
) {
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
          text: 'You are a expert software engineer. You need to define client component\'s spec that given page needs of web application. The product could be any kind of web application.\n- Our framework is nextjs14 using app router with server side rendering (aka server component), page structure should be stick to it.\n- We define client component at _components folder inside same page.tsx file path\n-- The _components folder only has components that used at page.tsx\n--example: url: /projects/[project_id] -> filepath of this components: src/app/(main)/projects/[project_id]/_components/example.tsx\n- component file name should be \bskewer case, and component name should be pascal case.\n- component for layout, which is used repeatedly over pages, do not considered in this case. we already add it to layout.tsx, like header or footer etc\n- We always use Shadcn UI for UI components, specify what component could be used at description.\n-- List of Shadcn UI components: \naccordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip\n\n[{"filename": file name of component, "filepath": detailed filepath for this page, "description": what props and state should this component have, what UI logic, what shadcn componentn it uses}]\n- description should be very detailed that any programmer could write page.tsx code without your help.\n- Do not write code yet.',
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
    {
      role: "user",
      content: [
        {
          type: "text",
          text: extraData,
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
        schema: {
          type: "object",
          required: [],
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                required: ["filename", "filepath", "description"],
                properties: {
                  filename: {
                    type: "string",
                    description: "file name of this component",
                  },
                  filepath: {
                    type: "string",
                    description: "relative filepath of this page, starts with src/",
                  },
                  description: {
                    type: "number",
                    description:
                      "what props and state should this component have, what UI logic, what shadcn componentn it uses",
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

  const componentSpecJSON: string = response.choices[0].message.content!;

  // const useCasesJSON = await llmRepository(input);

  const componentSpecs: PresentationComponentSpecResponse[] = JSON.parse(componentSpecJSON).results;
  return componentSpecs;
}
