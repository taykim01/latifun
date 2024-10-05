"use server";

import { serverClient } from "@/data/infrastructures/supabase/server";
import { Tables } from "../dao/database.types";
import { NodeOptions } from "@/presentation/components/node";

async function updateNode(id: string, nodeData: Partial<Tables<"node">>) {
  const supabase = serverClient();
  const { error } = await supabase.from("node").update(nodeData).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function moveNodeUseCase(id: string, coordinates: { x: number; y: number }) {
  const newPosition = { x: coordinates.x, y: coordinates.y };
  const newNode = {
    position: JSON.stringify(newPosition),
  };

  await updateNode(id, newNode);
}

export async function modifyNodeTypeUseCase(id: string, type: NodeOptions) {
  const newNode = {
    type: type,
  };

  await updateNode(id, newNode);
}

export async function modifyNodeDataUseCase(id: string, data: string) {
  const newNode = {
    data: data,
  };

  await updateNode(id, newNode);
}
