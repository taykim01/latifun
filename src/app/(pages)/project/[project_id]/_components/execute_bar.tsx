"use client";

import { NODE_TYPE, NodeOptions } from "@/presentation/components/node";
import { Button } from "@/presentation/shadcn/button";
import React from "react";
import { useState } from "react";
import Components from ".";
import { ACTIONS } from "@/core/constants/actions";
import { Popover, PopoverContent, PopoverTrigger } from "@/presentation/shadcn/popover";
import { Label } from "@/presentation/shadcn/label";

export type ActionOptions = (typeof ACTIONS)[number];

export default function ExecuteBar(props: { onClick: (e: NodeOptions) => void; action: (e: ActionOptions) => void }) {
  const [popup, setPopup] = useState(false);
  return (
    <>
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 p-5 rounded-lg bg-white border border-gray-100 shadow flex items-center gap-5">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="h-full transition-all duration-300" variant="outline">
              Create New Node
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col rounded-lg">
            <Label className="text-sm pb-4 px-4">Select Node Type</Label>
            <hr className="border-gray-200 mb-2 ml-4" style={{ width: "calc(100% - 32px)" }} />
            <div className="flex flex-col gap-2 items-start">
              {NODE_TYPE.map((type, index) => {
                if (type === "EDGE") return;
                return (
                  <Button
                    className="w-full justify-start"
                    variant="ghost"
                    key={index}
                    onClick={() => props.onClick(type)}
                  >
                    {type}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <Button className="transition-all duration-300" onClick={() => setPopup(true)}>
          Do Some Action
        </Button>
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
