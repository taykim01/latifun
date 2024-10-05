"use server";

import { serverClient } from "@/data/infrastructures/supabase/server";
import { Tables } from "../dao/database.types";
import { EdgeData } from "@/app/(pages)/project/[project_id]/_components/whiteboard";
import { NodeOptions } from "@/presentation/components/node";

async function createNode(nodeData: Omit<Tables<"node">, "id" | "created_at">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("node").insert(nodeData).select("id");
  if (error) throw new Error(error.message);
  return data[0].id;
}

export async function createEmptyNodeUseCase({ type }: { type: NodeOptions }) {
  const newNode: Omit<Tables<"node">, "id" | "created_at"> = {
    data: "",
    project_id: "3dc43c94-7103-41fe-b554-a507cc172f39",
    type: type,
    position: JSON.stringify({ x: 0, y: 0 }),
  };

  const nodeID = await createNode(newNode);
  return nodeID;
}

export async function createEdgeNodeUseCase(edgeData: EdgeData & { id: string }) {
  const newNode: Omit<Tables<"node">, "id" | "created_at"> = {
    data: JSON.stringify(edgeData),
    project_id: "3dc43c94-7103-41fe-b554-a507cc172f39",
    type: "EDGE",
    position: "",
  };

  const nodeID = await createNode(newNode);
  return nodeID;
}
