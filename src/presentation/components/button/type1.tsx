"use client";

import "./type1.css";

export default function Type1(props: { label: string; onClick: () => void }) {
  return (
    <div style={{ scale: "0.9" }}>
      <button onClick={props.onClick} className="ui-btn">
        <span>{props.label}</span>
      </button>
    </div>
  );
}
