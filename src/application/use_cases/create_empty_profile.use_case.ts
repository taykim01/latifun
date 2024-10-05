// 유저 프로필 생성하는 use case
"use server";

import { serverClient } from "@/data/infrastructures/supabase/server";
import TABLES from "@/data/infrastructures/supabase/tables";
import { Tables } from "../dao/database.types";
import getUserAndProjectID from "@/core/utils/get_project_and_user_id";
import getUser from "@/data/infrastructures/supabase/get_user";

async function createProfile(profileData: Omit<Tables<"profile">, "id">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from(TABLES.PROFILE).insert(profileData).select("id");
  if (error) throw new Error(error.message);
  return data;
}

export default async function createEmptyProfileUseCase(name: string) {
  // 비어있는 유저 프로필 생성
  const userData = await getUser();
  if (!userData) throw new Error("User not found");
  const emptyProfile: Tables<"profile"> = {
    created_at: new Date().toISOString(),
    email: userData.email!,
    name: name,
    profile_img: null,
    id: userData.id,
  };
  await createProfile(emptyProfile);
}

// 태은
