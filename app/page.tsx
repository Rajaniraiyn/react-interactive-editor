"use client";

import { ElementPicker } from "@/components/element-picker";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { useDeferredValue, useRef, useState } from "react";
import JsxParser from "react-jsx-parser";

export default function Home() {
  const [reactCode, setReactCode] = useState(EXAMPLE_REACT_CODE);
  const deferredReactCode = useDeferredValue(reactCode);

  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-screen h-screen">
      <ResizablePanelGroup
        direction="horizontal"
        storage={typeof window !== "undefined" ? localStorage : undefined}
      >
        <ResizablePanel
          minSize={20}
          maxSize={50}
          defaultSize={20}
          className="flex flex-col gap-2"
        >
          <h2 className="text-lg font-bold">React Code</h2>
          <Textarea
            value={reactCode}
            onChange={(e) => setReactCode(e.target.value)}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <h2 className="text-lg font-bold">Preview</h2>
          <div ref={previewRef}>
            <JsxParser jsx={deferredReactCode} />
          </div>
          <ElementPicker targetRef={previewRef} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

const EXAMPLE_REACT_CODE = `
<div style={{ padding: "2rem", backgroundColor: "#f0f4f8" }}>
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
