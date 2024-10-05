"use client";

import { useEffect, useState } from "react";
import ProfileTooltip from "./profile_tooltip";
import getUser from "@/data/infrastructures/supabase/get_user";
import { useRouter } from "next/navigation";

export default function ProfileGroup() {
  const router = useRouter();

  const [tooltip, setTooltip] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [name, setName] = useState("");

  const checkLogged = async () => {
    const userData = await getUser("client");
    if (userData) {
      setIsLogged(true);
      const name = (userData as any).identities[0].identity_data.name;
      setName(name);
    }
  };

  const toggleTooltip = () => {
    if (!isLogged) {
      router.push("/login");
      return;
    }
    setTooltip(!tooltip);
  };

  useEffect(() => {
    checkLogged();
  }, []);

  const logInText = isLogged ? name : "로그인하기";

  return (
    <div
      className="cursor-pointer flex items-center gap-2 relative hover:bg-gray-100 p-1 rounded-lg mt-[-4px] ml-[-4px]"
      onClick={toggleTooltip}
    >
      <div className="rounded-full w-8 h-8 bg-gray-300" />
      <div className="text-md">{logInText}</div>
      {tooltip && <ProfileTooltip />}
    </div>
  );
}
