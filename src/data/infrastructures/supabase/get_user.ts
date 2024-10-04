"use server";

import { createClient } from "./server";

export default async function getUserID() {
    const database = createClient();
    const {
        data: { user },
    } = await database.auth.getUser();
    return user;
}
