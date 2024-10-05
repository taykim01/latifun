import { Handle, Position } from "@xyflow/react";

export default function Node(props: { data: { defaultLabel: string; defaultText: string } }) {
  return (
    <div className="px-3 py-2 bg-white border border-gray-100 rounded shadow flex flex-col gap-2 box-border w-[250px] min-h-[250px]">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <input className="outline-none text-md" defaultValue={props.data.defaultLabel} />
      <hr />
      <textarea className="outline-none text-xs resize-none" defaultValue={props.data.defaultText} />
    </div>
  );
}
