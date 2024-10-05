"use client";

import "./default.css";

export default function Default(props: { onClick: () => void; label: string }) {
  return (
    <button className="default-button" onClick={props.onClick}>
      {props.label}
    </button>
  );
}
