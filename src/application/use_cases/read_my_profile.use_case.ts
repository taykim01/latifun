"use server";

import getUser from "@/data/infrastructures/supabase/get_user";
import { serverClient } from "@/data/infrastructures/supabase/server";

export default async function readMyProfile(id?: string) {
  const supabase = serverClient();
  if (!id) {
    const userData = await getUser();
    if (!userData) throw new Error("User not found");
    id = userData.id;
  }
  const { data, error } = await supabase.from("profile").select().eq("id", id).single();
  if (error) throw error;
  return data;
}
