// Pre-rendered variants stacked in one grid cell (see .stack): the container is always as
// tall as its tallest variant, so switching games never shifts the layout.

export function showVariant(stack: HTMLElement, key: string) {
  for (const el of stack.querySelectorAll<HTMLElement>(":scope > [data-v]")) {
    const on = el.dataset.v === key;
    el.classList.toggle("on", on);
    if (on) el.removeAttribute("aria-hidden");
    else el.setAttribute("aria-hidden", "true");
  }
}

export function applyVars(el: HTMLElement, vars: Record<string, string>) {
  for (const [k, v] of Object.entries(vars)) {
    if (v) el.style.setProperty(k, v);
    else el.style.removeProperty(k);
  }
}
