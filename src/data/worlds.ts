// One entry per supported game. Each game has a "world": the palette, typeface and
// ambient motif the page takes on when that game is selected.

export type GameKey = "genshin" | "hsr" | "zzz" | "honkai" | "tot";

export interface World {
  game: GameKey;
  name: string; // official game title (not translated)
  short: string; // compact label under the hero emblem
  place: string; // the world's name, set in the world's typeface
  font: string;
  scale: number; // optical size correction so every place name fits one line
  textCase: "none" | "uppercase";
  tracking: string;
  weight: number;
  italic: boolean;
  // The world fonts are Latin-only. CJK place names get a typeface (per script) and
  // weight/tracking with the same feel; a missing font keeps the system CJK fallback.
  cjk: {
    zh?: string;
    ja?: string;
    ko?: string;
    weight: number;
    tracking: string;
  };
  bg: string;
  fg: string;
  mute: string;
  accent: string;
  ring: string; // the game icon's key color, outlining its hero emblem
}

export const WORLDS: World[] = [
  {
    game: "genshin",
    name: "Genshin Impact",
    short: "Genshin",
    place: "Teyvat",
    font: '"Marcellus", Georgia, serif',
    scale: 1,
    textCase: "none",
    tracking: "0em",
    weight: 400,
    italic: false,
    cjk: {
      zh: '"Noto Serif SC", serif',
      ja: '"Shippori Mincho", serif',
      ko: '"Gowun Batang", serif',
      weight: 500,
      tracking: ".06em",
    },
    bg: "#0E1A1F",
    fg: "#F1E9D2",
    mute: "rgba(241,233,210,.64)",
    accent: "#D8B66A",
    ring: "#5664C8",
  },
  {
    game: "hsr",
    name: "Honkai: Star Rail",
    short: "Star Rail",
    place: "the Astral Express",
    font: '"Michroma", system-ui, sans-serif',
    scale: 0.58,
    textCase: "none",
    tracking: "-.02em",
    weight: 400,
    italic: false,
    cjk: { ko: '"Orbit", sans-serif', weight: 300, tracking: ".2em" },
    bg: "#0B0D1E",
    fg: "#F3EEDF",
    mute: "rgba(243,238,223,.62)",
    accent: "#E3C27E",
    ring: "#80F4FF",
  },
  {
    game: "zzz",
    name: "Zenless Zone Zero",
    short: "ZZZ",
    place: "New Eridu",
    font: '"Anton", Impact, sans-serif',
    scale: 1.08,
    textCase: "uppercase",
    tracking: ".01em",
    weight: 400,
    italic: false,
    cjk: {
      zh: '"ZCOOL QingKe HuangYou", sans-serif',
      ja: '"Dela Gothic One", sans-serif',
      ko: '"Black Han Sans", sans-serif',
      weight: 400,
      tracking: ".02em",
    },
    bg: "#121315",
    fg: "#F2F2EE",
    mute: "rgba(242,242,238,.6)",
    accent: "#F2D22E",
    ring: "#F0790D",
  },
  {
    game: "honkai",
    name: "Honkai Impact 3rd",
    short: "HI3",
    place: "Hyperion",
    font: '"Chakra Petch", system-ui, sans-serif',
    scale: 0.92,
    textCase: "uppercase",
    tracking: ".04em",
    weight: 600,
    italic: false,
    cjk: {
      zh: '"Stick", sans-serif',
      ja: '"Stick", sans-serif',
      ko: '"Gugi", sans-serif',
      weight: 400,
      tracking: ".06em",
    },
    bg: "#101A30",
    fg: "#E4EAF6",
    mute: "rgba(228,234,246,.62)",
    accent: "#7397FF",
    ring: "#FFD02E",
  },
  {
    game: "tot",
    name: "Tears of Themis",
    short: "Themis",
    place: "Stellis",
    font: '"Cormorant Garamond", Georgia, serif',
    scale: 1.15,
    textCase: "none",
    tracking: "-.01em",
    weight: 500,
    italic: true,
    cjk: {
      zh: '"Hina Mincho", serif',
      ja: '"Hina Mincho", serif',
      ko: '"Nanum Myeongjo", serif',
      weight: 400,
      tracking: ".1em",
    },
    bg: "#26121D",
    fg: "#F7E4EC",
    mute: "rgba(247,228,236,.62)",
    accent: "#EE8FB3",
    ring: "#E0D85A",
  },
];

export const WORLD = Object.fromEntries(
  WORLDS.map((w) => [w.game, w]),
) as Record<GameKey, World>;

/** CSS custom properties that turn an element into a world (or back to neutral with null). */
export function worldVars(w: World | null): Record<string, string> {
  if (!w)
    return {
      "--bg": "",
      "--fg": "",
      "--mute": "",
      "--accent": "",
      "--wf": "",
      "--ws": "",
      "--wc": "",
      "--wt": "",
      "--ww": "",
      "--wi": "",
    };
  return {
    "--bg": w.bg,
    "--fg": w.fg,
    "--mute": w.mute,
    "--accent": w.accent,
    "--wf": w.font,
    "--ws": String(w.scale),
    "--wc": w.textCase,
    "--wt": w.tracking,
    "--ww": String(w.weight),
    "--wi": w.italic ? "italic" : "normal",
  };
}
