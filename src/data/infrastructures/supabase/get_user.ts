"use server";

import { serverClient } from "./server";

export default async function getUser(from?: "server" | "client") {
  if (from === "client") {
    const database = serverClient();
  }
  const database = serverClient();
  const {
    data: { user },
  } = await database.auth.getUser();
  return user;
}
