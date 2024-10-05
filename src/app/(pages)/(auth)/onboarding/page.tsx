"use client";

import createEmptyProfileUseCase from "@/application/use_cases/create_empty_profile.use_case";
import readMyProfile from "@/application/use_cases/read_my_profile.use_case";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Onboarding() {
  const [name, setName] = useState<string>("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const createUser = async () => {
    try {
      await createEmptyProfileUseCase(name);
      router.push("/");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const readProfile = async () => {
    const profileData = await readMyProfile();
    if (profileData) router.push("/");
  };

  useEffect(() => {
    readProfile();
  }, []);

  return (
    <section className="flex flex-1 flex-col justify-center items-center relative">
      <div className="text-3xl font-bold mt-4">Onboarding</div>
      <input
        className="border border-gray-300 rounded-md p-2 mt-4"
        type="text"
        placeholder="Name"
        onChange={handleChange}
      />
      <button className="bg-gray-500 text-white rounded-md p-2 mt-4" onClick={createUser}>
        Submit
      </button>
    </section>
  );
}
