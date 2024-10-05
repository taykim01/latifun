import { modifyNodeDataUseCase, modifyNodeTypeUseCase } from "@/application/use_cases/modify_node.use_case";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/shadcn/select";
import { Handle, Position } from "@xyflow/react";
import { ChangeEvent } from "react";

export const NODE_TYPE = [
  "USER_FLOW_PAGE",
  "USER_FLOW_ACTION",
  "USE_CASE",
  "SCHEMA_TABLE",
  "PRESENTATION_PAGE",
  "PRESENTATION_COMPONENT",
  "IDEA",
  "EDGE",
] as const;

export type NodeOptions = (typeof NODE_TYPE)[number];

export default function Node(props: { id: string; data: { defaultLabel: string; defaultText: string } }) {
  const changeDataChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
    const data = e.target.value;
    await modifyNodeDataUseCase(props.id, data);
  };

  const changeTypeChange = async (e: NodeOptions) => {
    await modifyNodeTypeUseCase(props.id, e);
  };

  return (
    <div className="px-3 py-2 bg-white border border-gray-100 rounded shadow flex flex-col gap-2 box-border w-[300px] min-h-[250px]">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <Select onValueChange={changeTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={props.data.defaultLabel} />
        </SelectTrigger>
        <SelectContent>
          {NODE_TYPE.map((type, index) => {
            if (type === "EDGE") return;
            return (
              <SelectItem key={index} value={type}>
                {type}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <textarea
        className="outline-none text-xs resize-none flex-grow"
        onChange={changeDataChange}
        defaultValue={props.data.defaultText}
      />
    </div>
  );
}
