"use client";

import { JsxEditor } from "@/components/editor/jsx-editor";

export default function Home() {
  return (
    <div className="w-screen h-screen">
      <JsxEditor code={EXAMPLE_REACT_CODE} />
    </div>
  );
}

const EXAMPLE_REACT_CODE = `
<div data-edit-id="1" style={{ padding: "2rem", backgroundColor: "#f0f4f8" }}>
  <div />
  <h1 style={{ color: "#0ea5e9", fontSize: "2.5rem", marginBottom: "1rem" }}>
    Hello, world!
  </h1>
  <p style={{ fontSize: "1.25rem", color: "#334155" }}>
    Welcome to the interactive React code previewer. You can edit this code and see the results instantly!
  </p>
  <ul style={{ marginTop: "1.5rem", paddingLeft: "1.5rem", color: "#475569" }}>
    <li>Type JSX in the left panel</li>
    <li>See the live preview on the right</li>
    <li>Try adding your own components!</li>
  </ul>
  <button
    style={{
      marginTop: "2rem",
      padding: "0.75rem 1.5rem",
      backgroundColor: "#0ea5e9",
      color: "#fff",
      border: "none",
      borderRadius: "0.375rem",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "background 0.2s"
    }}
    onClick={() => alert("You clicked the button!")}
  >
    Click Me
  </button>
</div>
`;
