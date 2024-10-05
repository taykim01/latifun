"use server";

import { serverClient } from "@/data/infrastructures/supabase/server";
import { Tables } from "../dao/database.types";

async function createNode(nodeData: Omit<Tables<"node">, "id" | "created_at">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("node").insert(nodeData).select("id");
  if (error) throw new Error(error.message);
  return data[0].id;
}

export default async function createEmptyNodeUseCase({ type }: { type: string }) {
  const newNode: Omit<Tables<"node">, "id" | "created_at"> = {
    data: "",
    project_id: "3dc43c94-7103-41fe-b554-a507cc172f39",
    type: type,
    position: JSON.stringify({ x: 0, y: 0 }),
  };

  const nodeID = await createNode(newNode);
  return nodeID;
}
