// The game the visitor picked, shared by every section so the page speaks one game at a time.
import type { GameKey } from "../data/worlds";

export type Selection = GameKey | null;
let current: Selection = null;

export const getGame = () => current;

export function setGame(game: Selection, source: string) {
  if (game === current) return;
  current = game;
  document.dispatchEvent(
    new CustomEvent("hb:game", { detail: { game, source } }),
  );
}

export function onGame(fn: (game: Selection, source: string) => void) {
  document.addEventListener("hb:game", (e) => {
    const { game, source } = (e as CustomEvent).detail;
    fn(game, source);
  });
}
