"use client";

import { NODE_TYPE, NodeOptions } from "@/presentation/components/node";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/shadcn/select";

export default function ExecuteBar(props: { onClick?: (e: NodeOptions) => void }) {
  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 p-5 rounded-lg bg-white border border-gray-100 shadow flex items-center gap-5">
      <Select onValueChange={(e: NodeOptions) => props.onClick?.(e)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Create New Node" />
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
    </div>
  );
}
