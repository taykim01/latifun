"use server";

import getUser from "@/data/infrastructures/supabase/get_user";
import { cookies } from "next/headers";

export default async function getUserAndProjectID() {
    const userData = await getUser();
    if (!userData) throw new Error("User not found");
    const userID = userData.id;

    const cookieStore = cookies();
    const projectIDCookie = cookieStore.get("project_id");
    if (!projectIDCookie) throw new Error("Project ID cookie not found");
    const projectID = projectIDCookie.value;

    return { userID, projectID };
}
