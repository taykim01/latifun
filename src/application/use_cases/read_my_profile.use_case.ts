"use server";

import { serverClient } from "@/data/infrastructures/supabase/server";

export default async function readMyProfile(id: string) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("profiles").select().eq("id", id).single();
  if (error) throw error;
  return data;
}
