"use server";

import { serverClient } from "@/data/infrastructures/supabase/server";

async function readNodeByProjectID(project_id: string) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("node").select().eq("project_id", project_id).neq("type", "EDGE");
  if (error) throw new Error(error.message);
  return data;
}

async function readEdgeByProjectID(project_id: string) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("node").select().eq("project_id", project_id).eq("type", "EDGE");
  if (error) throw new Error(error.message);
  return data;
}

export async function readProjectNodesUseCase(projectID: string) {
  const nodes = await readNodeByProjectID(projectID);
  return nodes;
}

export async function readProjectEdgesUseCase(projectID: string) {
  const edges = await readEdgeByProjectID(projectID);
  return edges;
}
