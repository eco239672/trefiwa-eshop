"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

/** Keeps keyboard focus inside an active modal and closes it with Escape. */
export function useDialogFocus(active: boolean, container: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!active || !container.current) return;
    const focusable = () => Array.from(container.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []).filter((element) => !element.hasAttribute("hidden"));
    const elements = focusable();
    elements[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const current = focusable();
      if (!current.length) { event.preventDefault(); return; }
      const first = current[0];
      const last = current[current.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, container, onClose]);
}
