"use client";

import Icons from "@/presentation/components/icons";
import { useState, useEffect } from "react";

export default function ResultsBar(props: { result: string; open: boolean; onClose: () => void }) {
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
        bg-white max-w-[360px] w-full
        flex flex-col items-center gap-10
        transition-all duration-1000 ease-in-out
        ${isVisible ? "right-5" : "-right-[360px]"}
        rounded-xl border border-100
      `}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full h-full p-8 flex flex-col gap-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-100">
        <div className="w-full flex justify-between">
          <div className="text-xl font-semibold">Finished Generating!</div>
          <div style={{ scale: "1.2" }} onClick={props.onClose}>
            <Icons.X />
          </div>
        </div>
        <hr />
        <div className="flex flex-col gap-5 flex-grow">{props.result}</div>
      </div>
    </div>
  );
}
