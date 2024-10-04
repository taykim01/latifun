// 유저 프로필 생성하는 use case
"use server";

import { createClient } from "@/data/infrastructures/supabase/server";
import TABLES from "@/data/infrastructures/supabase/tables";
import { Tables } from "../dao/database.types";

async function createProfile(profileData: Omit<Tables<"profile">, "id">) {
  const supabase = createClient();
  const { data, error } = await supabase.from(TABLES.PROFILE).insert(profileData).select("id");
  if (error) throw new Error(error.message);
  return data;
}

export default async function createEmptyProfileUseCase() {
  // 비어있는 유저 프로필 생성
  const emptyProfile: Omit<Tables<"profile">, "id"> = {
    created_at: new Date().toISOString(),
    email: "",
    name: "",
    profile_img: null,
  };
  await createProfile(emptyProfile);
}

// 태은
