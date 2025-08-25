"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { JsxEditor } from "@/components/editor/jsx-editor";
import { Badge } from "@/components/ui/badge";

export default function PreviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [code, setCode] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState<"idle" | "debouncing" | "saving">("idle");

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch(`/api/preview/${id}`);
      const text = await res.text();
      if (!active) return;
      setCode(text);
      setLoaded(true);
    }
    if (id) load();
    return () => { active = false; };
  }, [id]);

  const saveTimer = useRef<number | null>(null);
  const debouncedSave = useCallback((next: string) => {
    if (!id) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setSaving("debouncing");
    saveTimer.current = window.setTimeout(async () => {
      setSaving("saving");
      await fetch(`/api/component/${id}`, {
        method: "PUT",
        headers: { "content-type": "text/plain; charset=utf-8" },
        body: next,
      });
      setSaving("idle");
    }, 300);
  }, [id]);

  if (!loaded) return null;

  return (
    <div className="w-screen h-screen">
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between border-b bg-background/80 backdrop-blur px-4 py-2">
        <div className="text-sm text-muted-foreground">Preview • {id}</div>
        <div>
          <Badge variant={saving === "saving" ? "default" : "outline"}>
            {saving === "saving" ? "Saving…" : saving === "debouncing" ? "Pending" : "Saved"}
          </Badge>
        </div>
      </header>
      <div className="pt-12 h-full">
        <JsxEditor code={code} onChange={debouncedSave} />
      </div>
    </div>
  );
}


