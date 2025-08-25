"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { JsxEditor } from "@/components/editor/jsx-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon, Share2Icon } from "lucide-react";

export default function PreviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const [code, setCode] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState<"idle" | "debouncing" | "saving">("idle");
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: `Preview ${id}`, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    } catch {}
  };

  return (
    <div className="w-screen h-screen">
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between border-b bg-background/80 backdrop-blur px-4 py-2">
        <div className="text-sm text-muted-foreground">Preview • {id}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2Icon />
            <span>Share</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/") }>
            <PlusIcon />
            <span>New</span>
          </Button>
          <Badge variant={copied || saving === "saving" ? "default" : "outline"}>
            {copied ? "Link copied" : saving === "saving" ? "Saving…" : saving === "debouncing" ? "Pending" : "Saved"}
          </Badge>
        </div>
      </header>
      <div className="pt-12 h-full">
        <JsxEditor code={code} onChange={debouncedSave} />
      </div>
    </div>
  );
}


