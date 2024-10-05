"use client";

import { NODE_TYPE, NodeOptions } from "@/presentation/components/node";
import { Button } from "@/presentation/shadcn/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/shadcn/select";
import React from "react";
import { useState } from "react";
import Components from ".";
import { ACTIONS } from "@/core/constants/actions";

export type ActionOptions = (typeof ACTIONS)[number];

export default function ExecuteBar(props: { onClick: (e: NodeOptions) => void; action: (e: ActionOptions) => void }) {
  const [popup, setPopup] = useState(false);
  return (
    <>
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 p-5 rounded-lg bg-white border border-gray-100 shadow flex items-center gap-5">
        <Select onValueChange={(e: NodeOptions) => props.onClick(e)}>
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

        <Button onClick={() => setPopup(true)}>Do Some Action</Button>
      </div>

      <Components.ActionPopup
        popup={popup}
        setPopup={setPopup}
        clickContinue={(e) => {
          props.action(e);
          setPopup(false);
        }}
      />
    </>
  );
}
