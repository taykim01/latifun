"use server";

import { serverClient } from "@/data/infrastructures/supabase/server";
import { Tables } from "../dao/database.types";

async function deleteNode(id: string) {
  const supabase = serverClient();
  const { error } = await supabase.from("node").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export default async function deleteNodeUseCase(id: string) {
  await deleteNode(id);
}
