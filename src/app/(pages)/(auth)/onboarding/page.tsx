// TODO: Add onboarding basic form
import { serverClient } from "@/data/infrastructures/supabase/server";
import Image from "next/image";

export default async function Onboarding() {
  const supabase = serverClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
  }

  return (
    <section className="flex flex-1 flex-col justify-center items-center relative">
      <Image src="/images/logo.png" alt="Logo" width={200} height={100} />
      <h3 className="text-3xl font-bold mt-4">Onboarding Form</h3>
    </section>
  );
}
