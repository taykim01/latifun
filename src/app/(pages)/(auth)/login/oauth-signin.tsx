"use client";

import { Provider } from "@supabase/supabase-js";

import { oAuthSignIn } from "../actions";
import Icons from "@/presentation/components/icons";
import { Button } from "@/presentation/shadcn/button";
import React from "react";

type OAuthProvider = {
  name: Provider;
  displayName: string;
  icon?: JSX.Element;
};

export function OAuthButtons({ lastSignedInMethod }: { lastSignedInMethod?: string }) {
  const oAuthProviders: OAuthProvider[] = [
    {
      name: "google",
      displayName: "구글",
      icon: <Icons.GoogleIcon />,
    },
  ];

  return (
    <>
      {oAuthProviders.map((provider) => (
        <Button
          key={provider.name}
          className="relative w-full flex items-center justify-center gap-2"
          variant="outline"
          onClick={async () => {
            await oAuthSignIn(provider.name);
          }}
        >
          {provider.icon}
          {provider.displayName} 로그인하기
          {lastSignedInMethod === "google" && (
            <div className="absolute top-1/2 -translate-y-1/2 left-full whitespace-nowrap ml-8 bg-accent px-4 py-1 rounded-md text-xs text-foreground/80">
              <div className="absolute -left-5 top-0 border-background border-[12px] border-r-accent" />
              최근 로그인
            </div>
          )}
        </Button>
      ))}
    </>
  );
}
