"use client";

import Icons from "@/presentation/components/icons";
import { useState, useEffect } from "react";

export default function ResultsBar(props: {
  result: string;
  open: boolean;
  onClose: () => void;
  onChange: (value: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  let isResultJson = false;
  try {
    JSON.parse(props.result);
    isResultJson = true;
  } catch (error) {
    isResultJson = false;
  }
  const result = isResultJson ? JSON.parse(props.result) : props.result;
  const [text, setText] = useState(result?.code ? result.code : JSON.stringify(props.result, null, 2));

  const handleChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    props.onChange(e.target.value);
  };

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
        bg-white max-w-[40vw] w-full
        flex flex-col items-center gap-10
        transition-all duration-1000 ease-in-out
        ${isVisible ? "right-5" : "-right-[40vw]"}
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
        <div className="flex flex-col gap-5 flex-grow break-words overflow-scroll rounded-md h-full">
          <textarea
            style={{
              backgroundColor: "#282C34",
              color: "#ABB2BF",
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              fontSize: "12px",
              lineHeight: "1.5",
              overflowWrap: "break-word",
            }}
            className="flex-grow resize-none rounded-md whitespace-pre-wrap overflow-scroll w-full border-none p-4"
            value={text}
            onChange={handleChangeText}
          />
        </div>
      </div>
    </div>
  );
}
