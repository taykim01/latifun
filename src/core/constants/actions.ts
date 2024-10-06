import { ActionOptions } from "@/app/(pages)/project/[project_id]/_components/execute_bar";
import { NodeOptions } from "@/presentation/components/node";

export const ACTIONS = [
  "Generate Use Cases",
  "Generate Schema",
  "Generate Code for Use Cases",
  "Generate Page Spec",
  "Generate Code for UI Components",
  "Generate Code for Page UI",
] as const;

export const convertActionsToNodeType = (action: ActionOptions): NodeOptions[] => {
  const conversionTable: Record<ActionOptions, NodeOptions[]> = {
    "Generate Use Cases": ["USER_FLOW_PAGE", "USER_FLOW_ACTION"],
    "Generate Schema": ["USER_FLOW_PAGE", "USER_FLOW_ACTION", "USE_CASE"],
    "Generate Code for Use Cases": ["USER_FLOW_PAGE", "USER_FLOW_ACTION", "USE_CASE", "SCHEMA_TABLE"],
    "Generate Page Spec": ["USER_FLOW_PAGE", "USER_FLOW_ACTION", "USE_CASE", "SCHEMA_TABLE", "PRESENTATION_PAGE"],
    "Generate Code for UI Components": ["USE_CASE", "SCHEMA_TABLE"],
    "Generate Code for Page UI": ["USE_CASE", "PRESENTATION_COMPONENT", "SCHEMA_TABLE"],
  };

  return conversionTable[action];
};
