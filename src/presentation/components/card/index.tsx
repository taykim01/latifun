"use client";

import { useRouter } from "next/navigation";
import "./card.css";
import { ReactNode } from "react";

export default function Card(props: {
  front: {
    title: string | ReactNode;
    content: string | ReactNode;
  };
  back: {
    title?: string | ReactNode;
    content?: string | ReactNode;
  };
  clickURL: string;
}) {
  const router = useRouter();

  const toProject = () => router.push(props.clickURL);
  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <div className="text-lg font-semibold">{props.front.title}</div>
          <div className="text-sm">{props.front.content}</div>
        </div>
        <div className="flip-card-back cursor-pointer" onClick={toProject}>
          <div className="text-sm">{props.back.title}</div>
          <div>{props.back.content}</div>
        </div>
      </div>
    </div>
  );
}
