"use client";

import { cn } from "@/lib/utils";
import { EditIcon } from "lucide-react";
import { RefObject, useDeferredValue, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";

interface ElementPickerOverlayProps {
  containerRef: RefObject<HTMLElement | null>;
  onPick?: (element: HTMLElement) => void;
  canPick?: (element: HTMLElement) => boolean;
}

const PREVIEW_PADDING = 6;

export function ElementPickerOverlay({ containerRef, onPick, canPick }: ElementPickerOverlayProps) {
  const [status, setStatus] = useState<"idle" | "picking" | "picked">("idle");

  const [interestElement, setInterestElement] = useState<HTMLElement | null>(null);
  const [previewBound, setPreviewBound] = useState<DOMRect | null>(null);
  const deferredPreviewBound = useDeferredValue(previewBound);

  useEffect(() => {
    if (!interestElement) {
      setPreviewBound(null);
      return;
    }

    setPreviewBound(padDomRect(interestElement.getBoundingClientRect(), PREVIEW_PADDING));

    const resizeObserver = new ResizeObserver(() => {
      // TODO: this is causing a weird issue will fix up bit latter
      setPreviewBound(padDomRect(interestElement.getBoundingClientRect(), PREVIEW_PADDING));
    });

    resizeObserver.observe(interestElement);

    return () => resizeObserver.disconnect();
  }, [interestElement]);

  useEffect(() => {
    if (status !== "picking") return;

    const target = containerRef.current;
    if (!target) return;

    const controller = new AbortController();

    target.addEventListener(
      "mousemove",
      (event) => {
        const elementAtMouse = document.elementFromPoint(event.clientX, event.clientY);
        if (elementAtMouse instanceof HTMLElement) {
          if (canPick?.(elementAtMouse) === false) {
            return;
          }
          setInterestElement(elementAtMouse);
        }
      },
      { passive: true, signal: controller.signal },
    );

    target.addEventListener(
      "mousedown",
      (event) => {
        const elementAtMouse = document.elementFromPoint(event.clientX, event.clientY);
        if (elementAtMouse instanceof HTMLElement) {
          if (canPick?.(elementAtMouse) === false) {
            return;
          }
          setInterestElement(elementAtMouse);
          setStatus("picked");
          onPick?.(elementAtMouse);
        }
      },
      { passive: true, signal: controller.signal },
    );

    return () => controller.abort();
  }, [status, containerRef]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      <Button
        hidden={status === "picking"}
        size="icon"
        className="absolute bottom-4 right-4 rounded-full z-50"
        onClick={() => {
          setInterestElement(null);
          setStatus("picking");
        }}
      >
        <EditIcon />
        <span className="sr-only">Edit</span>
      </Button>
      {status === "picking" && (
        <style>
          {`:is(*, ::before, ::after) {
                cursor: crosshair !important;
            }`}
        </style>
      )}
      <div
        hidden={deferredPreviewBound === null || status === "idle"}
        className={cn(
          "pointer-events-none rounded-sm border absolute top-0 left-0 transition-[transform,width,height] duration-100",
          status === "picked" && "border-cyan-400",
          status === "picking" && "bg-cyan-400/25 border-dashed border-black",
        )}
        style={{
          width: deferredPreviewBound?.width,
          height: deferredPreviewBound?.height,
          transform: `translate(${deferredPreviewBound?.left}px, ${deferredPreviewBound?.top}px) translateZ(0)`,
        }}
      />
    </>,
    document.body,
  );
}

function padDomRect(rect: DOMRect, padding: number): DOMRect {
  rect.width = rect.width + padding * 2;
  return Object.assign({}, rect, {
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
    left: rect.left - padding,
    top: rect.top - padding,
  });
}


