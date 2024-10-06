"use client";

import { useState } from "react";
import ProfileTooltip from "./profile_tooltip";
import { useRouter } from "next/navigation";

export default function ProfileGroup(props: { userName?: string }) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState(false);

  const toggleTooltip = () => {
    if (!props.userName) {
      router.push("/login");
      return;
    }
    setTooltip(!tooltip);
  };

  const logInText = props.userName ? props.userName : "로그인하기";

  return (
    <div
      className="cursor-pointer flex items-center gap-2 relative hover:bg-gray-100 p-1 rounded-lg mt-[-4px] ml-[-4px] transition-all duration-200"
      onClick={toggleTooltip}
    >
      <div className="rounded-full w-8 h-8 bg-gray-300" />
      <div className="text-md">{logInText}</div>
      {tooltip && <ProfileTooltip />}
    </div>
  );
}
