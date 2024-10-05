"use client";

import { Button } from "@/presentation/shadcn/button";

export default function ExecuteBar() {
  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 p-5 rounded-lg bg-white border border-gray-100 shadow flex items-center gap-5">
      <Button>노드 만들기</Button>
      <Button>기능 만들기</Button>
      <Button>스키마 생성하기</Button>
      <Button>기능 코드 생성하기</Button>
      <Button>UI 코드 생성하기</Button>
    </div>
  );
}
