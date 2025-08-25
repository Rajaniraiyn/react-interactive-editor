"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import JsxParser from "react-jsx-parser";
import { ElementPickerOverlay } from "@/components/editor/element-picker-overlay";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarSeparator,
  useSidebar,
} from "../ui/sidebar";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { Node } from "estree-jsx";
import { EDIT_MARKER } from "@/lib/jsx-ast/constants";
import { astToCode, codeWithNodeMapping } from "@/lib/jsx-ast/parse";
import { canEditText, getText, setText } from "@/lib/jsx-ast/text";
import {
  getStyleEntries,
  getStyleValue,
  setStyleValue,
} from "@/lib/jsx-ast/style";

interface JsxEditorProps {
  code: string;
  onChange?: (code: string) => void;
}

export function JsxEditor({ code: initialCode, onChange }: JsxEditorProps) {
  const [code, setCode] = useState(initialCode);

  const {
    code: processedCode,
    nodeMap,
    ast,
  } = useMemo(() => codeWithNodeMapping(code), [code]);
  const editableRegionRef = useRef<HTMLDivElement>(null);

  const [pickedElement, setPickedElement] = useState<HTMLElement | null>(null);

  const pickedNode = useMemo(() => {
    if (!pickedElement) return null;
    const editId = pickedElement.getAttribute(EDIT_MARKER);
    if (!editId) return null;
    return nodeMap.get(Number.parseInt(editId)) ?? null;
  }, [pickedElement, nodeMap]);

  return (
    <>
      <SidebarProvider defaultOpen={false}>
        <div ref={editableRegionRef} className="relative isolate z-0 h-full w-full">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.muted.DEFAULT)_0%,transparent_60%)]" />
          <JsxParser jsx={processedCode} />
        </div>
        <EditorPanel
          node={pickedNode}
          onMutate={() => {
            const next = astToCode(ast);
            setCode(next);
            onChange?.(next);
          }}
        />
      </SidebarProvider>
      <ElementPickerOverlay
        containerRef={editableRegionRef}
        canPick={(e) => e.getAttribute(EDIT_MARKER) !== null}
        onPick={setPickedElement}
      />
    </>
  );
}

interface EditorPanelProps {
  node: Node | null;
  onMutate?: () => void;
}

function EditorPanel({ node, onMutate }: EditorPanelProps) {
  const { setOpen, setOpenMobile } = useSidebar();
  const [newStyleKey, setNewStyleKey] = useState("");
  const [newStyleValue, setNewStyleValue] = useState("");

  useEffect(() => {
    if (node) {
      setOpen(true);
      setOpenMobile(true);
    }
  }, [node, setOpen, setOpenMobile]);

  return (
    <Sidebar side="right" variant="inset">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Editor
          </span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      {node && (
        <SidebarContent className="p-3 space-y-3">
          {canEditText(node) && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-medium text-muted-foreground">
                Text
              </h3>
              <Textarea
                value={getText(node)}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setText(node, e.target.value);
                  onMutate?.();
                }}
                className="min-h-24"
              />
            </div>
          )}
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <h3 className="text-xs font-medium text-muted-foreground">
                Background
              </h3>
              <Input
                type="color"
                value={getStyleValue(node, "backgroundColor") ?? "#000000"}
                onChange={(e) => {
                  setStyleValue(node, "backgroundColor", e.target.value);
                  onMutate?.();
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-xs font-medium text-muted-foreground">
                Text Color
              </h3>
              <Input
                type="color"
                value={getStyleValue(node, "color") ?? "#000000"}
                onChange={(e) => {
                  setStyleValue(node, "color", e.target.value);
                  onMutate?.();
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-xs font-medium text-muted-foreground">
                Padding
              </h3>
              <Input
                placeholder="e.g. 1rem, 16px"
                value={getStyleValue(node, "padding") ?? ""}
                onChange={(e) => {
                  setStyleValue(node, "padding", e.target.value || null);
                  onMutate?.();
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-xs font-medium text-muted-foreground">
                Margin
              </h3>
              <Input
                placeholder="e.g. 1rem, 16px"
                value={getStyleValue(node, "margin") ?? ""}
                onChange={(e) => {
                  setStyleValue(node, "margin", e.target.value || null);
                  onMutate?.();
                }}
              />
            </div>
            <div className="grid gap-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                Other styles
              </h3>
              <div className="grid gap-2">
                {getStyleEntries(node).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 gap-2 items-center">
                    <Input readOnly value={k} />
                    <Input
                      value={v}
                      onChange={(e) => {
                        setStyleValue(node, k, e.target.value || null);
                        onMutate?.();
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <Input
                  placeholder="property (e.g. borderRadius)"
                  value={newStyleKey}
                  onChange={(e) => setNewStyleKey(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="value (e.g. 8px)"
                    value={newStyleValue}
                    onChange={(e) => setNewStyleValue(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!newStyleKey) return;
                      setStyleValue(node, newStyleKey, newStyleValue || null);
                      setNewStyleKey("");
                      setNewStyleValue("");
                      onMutate?.();
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SidebarContent>
      )}
      <SidebarSeparator />
      <SidebarFooter>
        <div className="w-full px-2 py-1 text-[11px] text-muted-foreground">
          Tip: Press Esc to cancel picking
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
