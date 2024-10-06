import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/shadcn/card";
import { redirect } from "next/navigation";
import { OAuthButtons } from "./oauth-signin";
import getUser from "@/data/infrastructures/supabase/get_user";

export default async function login() {
  const userData = await getUser("server");
  if (userData) {
    return redirect("/");
  }

  return (
    <section className="h-[calc(100vh-57px)] flex flex-1 flex-col justify-center items-center">
      <Card className="mx-auto min-w-96">
        <CardHeader>
          <CardTitle className="text-2xl">로그인</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <OAuthButtons />
        </CardContent>
      </Card>
    </section>
  );
}
