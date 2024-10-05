"use client";

import Popup from "@/presentation/components/popup";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/presentation/shadcn/select";
import { ActionOptions } from "./execute_bar";
import { useState } from "react";
import { ACTIONS } from "@/core/constants/actions";

export default function ActionPopup(props: {
  popup: boolean;
  setPopup: (e: boolean) => void;
  clickContinue: (action: ActionOptions) => void;
}) {
  const [action, setAction] = useState<ActionOptions>(ACTIONS[0]);

  return (
    <Popup
      open={props.popup}
      onClose={() => props.setPopup(false)}
      title={action + "?"}
      buttons={{
        back: {
          onClick: () => props.setPopup(false),
          text: "Cancel",
        },
        next: {
          onClick: () => props.clickContinue(action),
          text: "Let's Go!",
        },
      }}
    >
      <Select defaultValue={ACTIONS[0]} onValueChange={(e: ActionOptions) => setAction(e)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Do Some Action" />
        </SelectTrigger>
        <SelectContent style={{ zIndex: 9999 }}>
          {ACTIONS.map((action, index) => {
            return (
              <SelectItem key={index} value={action}>
                {action}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </Popup>
  );
}
