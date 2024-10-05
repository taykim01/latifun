// 로그아웃을 처리하는 use case
"use server";

import { serverClient } from "@/data/infrastructures/supabase/server";

export default async function signOutUseCase() {
  const supabase = serverClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
