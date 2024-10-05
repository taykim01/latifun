"use client";

import signOutUseCase from "@/application/use_cases/sign_out.use_case";
import Button from "@/presentation/components/button";

export default function LogOutButton() {
  const logOut = async () => {
    await signOutUseCase();
    window.location.reload();
  };
  return <Button.LogOut onClick={logOut} />;
}
