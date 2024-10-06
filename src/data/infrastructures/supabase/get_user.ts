"use server";

import { clientClient } from "./client";
import { serverClient } from "./server";

export default async function getUser(from?: "server" | "client") {
  let database;
  if (from === "client") {
    database = clientClient();
  } else {
    database = serverClient();
  }
  const {
    data: { user },
  } = await database.auth.getUser();
  return user;
}
