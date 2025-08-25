"use client";

import { cn } from "@/lib/utils";
import { EditIcon } from "lucide-react";
import { RefObject, useDeferredValue, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ElementPickerOverlayProps {
  containerRef: RefObject<HTMLElement | null>;
  onPick?: (element: HTMLElement) => void;
  canPick?: (element: HTMLElement) => boolean;
}

const PREVIEW_PADDING = 4;

export function ElementPickerOverlay({
  containerRef,
  onPick,
  canPick,
}: ElementPickerOverlayProps) {
  const [status, setStatus] = useState<"idle" | "picking" | "picked">("idle");

  const [interestElement, setInterestElement] = useState<HTMLElement | null>(
    null,
  );
  const [previewBound, setPreviewBound] = useState<DOMRect | null>(null);
  const deferredPreviewBound = useDeferredValue(previewBound);

  useEffect(() => {
    if (!interestElement) {
      setPreviewBound(null);
      return;
    }

    setPreviewBound(
      padDomRect(interestElement.getBoundingClientRect(), PREVIEW_PADDING),
    );

    const resizeObserver = new ResizeObserver(() => {
      // TODO: this is causing a weird issue will fix up bit latter. the issue is for unknown reasons the bounds being all zero. i.e. w=h=left=top=0
      // setPreviewBound(
      //   padDomRect(interestElement.getBoundingClientRect(), PREVIEW_PADDING),
      // );
    });

    resizeObserver.observe(interestElement);

    return () => resizeObserver.disconnect();
  }, [interestElement]);

  useEffect(() => {
    if (status !== "picking") return;

    const target = containerRef.current;
    if (!target) return;

    const controller = new AbortController();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStatus("idle");
        setInterestElement(null);
      }
    };

    target.addEventListener(
      "mousemove",
      (event) => {
        const elementAtMouse = document.elementFromPoint(
          event.clientX,
          event.clientY,
        );
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
        const elementAtMouse = document.elementFromPoint(
          event.clientX,
          event.clientY,
        );
        if (elementAtMouse instanceof HTMLElement) {
          if (canPick?.(elementAtMouse) === false) {
            return;
          }
          setInterestElement(elementAtMouse);
          setStatus("picked");
          onPick?.(elementAtMouse);
          // brief visual confirmation before exiting pick mode
          setTimeout(() => setStatus("idle"), 120);
        }
      },
      { passive: true, signal: controller.signal },
    );

    window.addEventListener("keydown", onKeyDown, {
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [status, containerRef]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-pressed={status === "picking"}
            hidden={status === "picking"}
            size="lg"
            variant="outline"
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/70 px-4"
            onClick={() => {
              setInterestElement(null);
              setStatus("picking");
            }}
          >
            <EditIcon className="transition-transform duration-150 ease-out group-aria-pressed:rotate-12" />
            <span className="text-sm">Edit</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Pick element</TooltipContent>
      </Tooltip>
      {status === "picking" && (
        <style>
          {`:is(*, ::before, ::after) { cursor: crosshair !important; }`}
        </style>
      )}
      <div
        hidden={deferredPreviewBound === null}
        className={cn(
          "pointer-events-none absolute top-0 left-0 rounded-md ring-2 ring-primary/40 bg-primary/10 transition-[transform,width,height] duration-150 ease-out",
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
