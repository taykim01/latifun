"use client";

import Icons from "@/presentation/components/icons";
import { useState, useEffect } from "react";

export default function ResultsBar(props: { open: boolean; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (props.open) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [props.open]);

  return (
    <div
      className={`
        fixed top-5 bottom-5
        bg-white max-w-[400px] w-full
        flex flex-col items-center gap-10
        transition-all duration-1000 ease-in-out
        ${isVisible ? "right-5" : "-right-[400px]"}
        rounded-xl border border-100
      `}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full h-full p-8 flex flex-col gap-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-100 overflow-scroll">
        <div className="w-full flex justify-between">
          <div className="text-xl font-semibold">Need Help?</div>
          <div style={{ scale: "1.2" }} onClick={props.onClose}>
            <Icons.X />
          </div>
        </div>
        <hr />
        <div className="flex flex-col gap-3">
          <div className="text-lg font-semibold">How to use Latifun Whiteboard:</div>
          <ol className="text-sm list-decimal flex pl-5 flex-col gap-3">
            <li>
              Create a new node by selecting the type from the dropdown and clicking the "Create New Node" button.
            </li>
            <li>Connect two nodes by dragging from one node to another.</li>
            <li>Delete a node or edge by selecting it and clicking the "Delete" button on your keyboard.</li>
            <li>Click the "Do Some Action" button to make some actions.</li>
          </ol>
        </div>
        <hr />
        <div className="flex flex-col gap-3">
          <div className="text-lg font-semibold">Explaining Each Node Type</div>
          <ul className="text-sm list-disc flex pl-5 flex-col gap-3">
            <li>
              <span className="font-semibold">IDEA:</span> Represents an idea. You can add a title and description to
              it.
            </li>
            <li>
              <span className="font-semibold">USER_FLOW_PAGE:</span> Represents a page in the user flow. You can add a
              title and description to it.
            </li>
            <li>
              <span className="font-semibold">USER_FLOW_ACTION:</span> Represents an action in the user flow. You can
              add a title and description to it.
            </li>
            <li>
              <span className="font-semibold">USE_CASE:</span> Represents a use case in the user flow. You can add a
              title and description to it.
            </li>
            <li>
              <span className="font-semibold">SCHEMA_TABLE:</span> Represents a table in the schema. You can add a title
              and description to it.
            </li>
            <li>
              <span className="font-semibold">PRESENTATION_PAGE:</span> Represents a page in the presentation. You can
              add a title and description to it.
            </li>
            <li>
              <span className="font-semibold">PRESENTATION_COMPONENT:</span> Represents a component in the presentation.
              You can add a title and description to it.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
