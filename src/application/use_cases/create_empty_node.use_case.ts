"use server";

import { serverClient } from "@/data/infrastructures/supabase/server";
import { Tables, TablesInsert } from "../dao/database.types";
import { EdgeData } from "@/app/(pages)/project/[project_id]/_components/whiteboard";
import { NodeOptions } from "@/presentation/components/node";

async function createNode(nodeData: TablesInsert<"node">) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("node").insert(nodeData).select("id");
  if (error) throw new Error(error.message);
  return data[0].id;
}

export async function createEmptyNodeUseCase({ type, projectId }: { type: NodeOptions; projectId: string }) {
  const newNode: TablesInsert<"node"> = {
    data: "",
    project_id: projectId,
    type: type,
    position: JSON.stringify({ x: 0, y: 0 }),
  };

  const nodeID = await createNode(newNode);
  return nodeID;
}

export async function createNodeUseCase({
  type,
  projectId,
  data,
}: {
  type: NodeOptions;
  projectId: string;
  data: string;
}) {
  const newNode: TablesInsert<"node"> = {
    data: data,
    project_id: projectId,
    type: type,
    position: JSON.stringify({ x: 0, y: 0 }),
  };

  const nodeID = await createNode(newNode);
  return nodeID;
}

export async function updateNodeUseCase({ id, data }: { id: string; data: string }) {
  const supabase = serverClient();
  const { error } = await supabase.from("node").update({ data }).eq("id", id);
  if (error) throw new Error(error.message);
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
