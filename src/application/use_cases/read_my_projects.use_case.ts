"use server";

import getUser from "@/data/infrastructures/supabase/get_user";
import { serverClient } from "@/data/infrastructures/supabase/server";

async function readProjectByProfileID(profileID: string) {
  const supabase = serverClient();
  const { data, error } = await supabase.from("project").select().eq("profile_id", profileID);
  if (error) throw new Error(error.message);
  return data;
}

export default async function readMyProjectsUseCase() {
  const userData = await getUser();
  if (!userData) return;
  const projects = await readProjectByProfileID(userData.id);
  const minimizedProjects = projects.map((project: any) => {
    return {
      id: project.id,
      created_at: project.created_at,
      title: project.title,
    };
  });
  return minimizedProjects;
}
