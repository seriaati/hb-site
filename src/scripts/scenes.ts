// Ambient canvas motifs, one per game world, drawable into any rectangle.
import { WORLD, type GameKey } from "../data/worlds";

const TAU = Math.PI * 2;
const R = (a: number, b: number) => a + Math.random() * (b - a);
const hash = (a: number, b: number, c: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

export const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface Pointer {
  x: number;
  y: number;
  vx: number; // px/s
  vy: number;
  live: boolean; // a real mouse is over the canvas (not the idle wander)
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Particle = Record<string, number>;
interface Pop {
  i: number; // TV column and row
  j: number;
  corner: number; // 0 top-left, then clockwise
  t0: number;
}

interface SceneState {
  game: GameKey;
  extras: boolean; // the hero's set pieces: a Seelie, the Astral Express, bangboos
  seelie?: Seelie | null;
  train?: number; // the Express's distance along its run
  wait?: number; // seconds since it left the screen
  sparks?: Particle[];
  steam?: Particle[];
  pop?: Pop | null;
  nextPop?: number;
  avoid?: () => Rect[]; // areas covered by page content, in canvas pixels
  p?: Particle[];
  stars?: Particle[];
  planets?: Particle[];
  streaks?: Particle[];
  bokeh?: Particle[];
  petals?: Particle[];
  bearing?: number;
}

const many = (n: number, f: () => Particle) => Array.from({ length: n }, f);

// A moving cursor shoves particles the way it travels, like a hand through sand.
// They keep the push and coast to a stop instead of springing back.
function shove(
  p: Particle,
  X: number,
  Y: number,
  m: Pointer,
  r: Rect,
  dt: number,
  reach: number,
  weight: number,
) {
  const sp = Math.hypot(m.vx, m.vy);
  if (m.live && sp > 30) {
    const dx = X - m.x,
      dy = Y - m.y,
      d = Math.hypot(dx, dy);
    if (d < reach) {
      const f = ((1 - d / reach) * dt * 9) / weight,
        n = d || 1;
      p.kx = (p.kx ?? 0) + (m.vx * 0.7 + (dx / n) * sp * 0.45) * f;
      p.ky = (p.ky ?? 0) + (m.vy * 0.7 + (dy / n) * sp * 0.45) * f;
    }
  }
  if (!p.kx && !p.ky) return;
  const k = Math.exp(-dt * 2.6);
  p.kx *= k;
  p.ky *= k;
  if (Math.abs(p.kx) + Math.abs(p.ky) < 0.5) p.kx = p.ky = 0;
  p.u += (p.kx * dt) / r.w;
  p.v += (p.ky * dt) / r.h;
}

function seed(game: GameKey, extras: boolean): SceneState {
  const st: SceneState = { game, extras };
  if (extras && game === "hsr") {
    st.sparks = [];
    st.steam = [];
  }
  if (extras && game === "zzz") {
    st.pop = null;
    st.nextPop = 0;
  }
  if (game === "genshin")
    st.p = many(90, () => ({
      u: R(0, 1),
      v: R(0, 1),
      r: R(0.6, 2.4),
      vx: R(-4, 8),
      vy: R(6, 22),
      ph: R(0, TAU),
    }));
  if (game === "hsr") {
    st.stars = many(220, () => ({
      u: R(0, 1),
      v: R(0, 1),
      r: R(0.4, 1.5),
      ph: R(0, TAU),
    }));
    st.planets = [
      { ring: 0, a: R(0, TAU), s: 0.09 },
      { ring: 2, a: R(0, TAU), s: -0.045 },
      { ring: 3, a: R(0, TAU), s: 0.025 },
    ];
    st.streaks = many(16, () => ({
      a: R(0, TAU),
      d: R(0, 1),
      s: R(0.06, 0.2),
    }));
    st.bearing = 0;
  }
  if (game === "tot") {
    st.bokeh = many(16, () => ({
      u: R(0, 1),
      v: R(0, 1),
      rr: R(0.05, 0.13),
      vx: R(-6, 6),
      vy: R(-5, 5),
      z: R(0.2, 1),
    }));
    st.petals = many(18, () => ({
      u: R(0, 1),
      v: R(0, 1),
      rot: R(0, TAU),
      vr: R(-0.9, 0.9),
      s: R(4, 8),
      vx: R(4, 14),
      vy: R(8, 20),
      ph: R(0, TAU),
    }));
  }
  return st;
}

function draw(
  ctx: CanvasRenderingContext2D,
  st: SceneState,
  r: Rect,
  t: number,
  dt: number,
  m: Pointer,
  fill: boolean,
) {
  if (r.w < 1 || r.h < 1) return;
  const { x: px, y: py } = m;
  if (fill) {
    ctx.fillStyle = WORLD[st.game].bg;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  if (st.game === "genshin") {
    for (const p of st.p!) {
      p.u += (p.vx * dt) / r.w;
      p.v -= (p.vy * dt) / r.h;
      if (p.v < -0.03) {
        p.v = 1.03;
        p.u = R(0, 1);
      }
      if (p.v > 1.05) p.v = -0.02;
      if (p.u > 1.02) p.u = -0.02;
      if (p.u < -0.02) p.u = 1.02;
      const X = r.x + p.u * r.w + Math.sin(t * 0.8 + p.ph) * 8,
        Y = r.y + p.v * r.h;
      shove(p, X, Y, m, r, dt, 120, p.r);
      const a = 0.5 + 0.5 * Math.sin(t * 1.4 + p.ph);
      ctx.fillStyle = `rgba(216,182,106,${0.08 * a})`;
      ctx.beginPath();
      ctx.arc(X, Y, p.r * 5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(244,226,170,${0.35 + 0.55 * a})`;
      ctx.beginPath();
      ctx.arc(X, Y, p.r, 0, TAU);
      ctx.fill();
    }
    if (st.extras) drawSeelie(ctx, st, r, t, dt, m);
  } else if (st.game === "hsr") {
    for (const p of st.stars!) {
      const X = r.x + ((((p.u - t * 0.002) % 1) + 1) % 1) * r.w,
        Y = r.y + (((p.v % 1) + 1) % 1) * r.h;
      shove(p, X, Y, m, r, dt, 110, p.r);
      ctx.fillStyle = `rgba(243,238,223,${(0.3 + 0.7 * Math.abs(Math.sin(t * 0.8 + p.ph))) * 0.75})`;
      ctx.fillRect(X, Y, p.r, p.r);
    }
    const cx = r.x + r.w / 2,
      cy = r.y + r.h / 2,
      M = Math.hypot(r.w, r.h) / 2;
    const rings = [0.2, 0.31, 0.45, 0.63].map((k) => k * Math.min(M, 900));
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(227,194,126,.16)";
    for (const rr of rings) {
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, TAU);
      ctx.stroke();
    }
    const n = 120,
      rot = t * 0.025;
    ctx.strokeStyle = "rgba(227,194,126,.3)";
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * TAU,
        l = i % 10 ? 4 : 11,
        c = Math.cos(a),
        s = Math.sin(a);
      ctx.moveTo(cx + c * rings[1], cy + s * rings[1]);
      ctx.lineTo(cx + c * (rings[1] + l), cy + s * (rings[1] + l));
    }
    ctx.stroke();
    const target = Math.atan2(py - cy, px - cx);
    let diff = target - st.bearing!;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    st.bearing! += diff * Math.min(1, dt * 3);
    const b = st.bearing!;
    ctx.strokeStyle = "rgba(227,194,126,.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rings[2], b - 0.16, b + 0.16);
    ctx.stroke();
    const bx = cx + Math.cos(b) * rings[2],
      by = cy + Math.sin(b) * rings[2];
    ctx.fillStyle = "rgba(227,194,126,.9)";
    ctx.beginPath();
    ctx.moveTo(bx, by - 5);
    ctx.lineTo(bx + 5, by);
    ctx.lineTo(bx, by + 5);
    ctx.lineTo(bx - 5, by);
    ctx.fill();
    for (const p of st.planets!) {
      const a = p.a + t * p.s,
        X = cx + Math.cos(a) * rings[p.ring],
        Y = cy + Math.sin(a) * rings[p.ring];
      ctx.fillStyle = "rgba(227,194,126,.16)";
      ctx.beginPath();
      ctx.arc(X, Y, 10, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(243,238,223,.92)";
      ctx.beginPath();
      ctx.arc(X, Y, 2.8, 0, TAU);
      ctx.fill();
    }
    ctx.lineWidth = 1;
    for (const s of st.streaks!) {
      s.d += s.s * dt;
      if (s.d > 1) {
        s.d = 0;
        s.a = R(0, TAU);
      }
      const d0 = s.d * M * 1.1,
        len = s.d * s.d * 90;
      ctx.strokeStyle = `rgba(243,238,223,${0.4 * Math.sin(s.d * Math.PI)})`;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(s.a) * d0, cy + Math.sin(s.a) * d0);
      ctx.lineTo(
        cx + Math.cos(s.a) * (d0 + len),
        cy + Math.sin(s.a) * (d0 + len),
      );
      ctx.stroke();
    }
    if (st.extras) drawExpress(ctx, st, r, dt);
  } else if (st.game === "zzz") {
    const tw = 70,
      th = 52,
      g = 12;
    const cols = Math.ceil((r.w + g) / (tw + g)) + 1,
      rows = Math.ceil((r.h + g) / (th + g)) + 1;
    const x0 = r.x + (r.w - (cols * (tw + g) - g)) / 2,
      y0 = r.y + (r.h - (rows * (th + g) - g)) / 2,
      fl = Math.floor(t * 2);
    const lit: [number, number, number][] = [];
    ctx.lineWidth = 1;
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const X = x0 + i * (tw + g),
          Y = y0 + j * (th + g);
        let on = Math.pow(
          Math.max(0, 1 - Math.hypot(X + tw / 2 - px, Y + th / 2 - py) / 230),
          1.4,
        );
        if (hash(i, j, fl) > 0.985) on = Math.max(on, 0.5);
        if (m.live && on > 0.5) lit.push([i, j, on]);
        if (st.pop && st.pop.i === i && st.pop.j === j) on = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(X, Y, tw, th, 7);
        else ctx.rect(X, Y, tw, th);
        if (on > 0.04) {
          ctx.fillStyle = `rgba(242,210,46,${on * 0.1})`;
          ctx.fill();
          ctx.fillStyle = `rgba(242,242,238,${on * 0.45})`;
          for (let n = 0; n < 12; n++)
            ctx.fillRect(
              X + 6 + Math.random() * (tw - 18),
              Y + 5 + Math.random() * (th - 10),
              R(2, 10),
              1.5,
            );
          ctx.strokeStyle = `rgba(242,210,46,${on * 0.9})`;
        } else ctx.strokeStyle = "rgba(242,242,238,.075)";
        ctx.stroke();
      }
    if (st.extras) {
      // Only TVs clear of the page's text and controls, with room around them, qualify.
      const looking = !st.pop && lit.length && t >= st.nextPop!;
      const clear = looking ? (st.avoid?.() ?? []) : [];
      const free = lit.filter(([i, j]) => {
        const X = x0 + i * (tw + g) - 30,
          Y = y0 + j * (th + g) - 30;
        return !clear.some(
          (c) =>
            X < c.x + c.w &&
            X + tw + 60 > c.x &&
            Y < c.y + c.h &&
            Y + th + 60 > c.y,
        );
      });
      popBangboo(st, free, t);
      if (st.pop)
        drawBangboo(
          ctx,
          st.pop,
          x0 + st.pop.i * (tw + g),
          y0 + st.pop.j * (th + g),
          tw,
          th,
          t,
        );
    }
    ctx.fillStyle = "rgba(255,255,255,.022)";
    for (let y = r.y; y < r.y + r.h; y += 3) ctx.fillRect(r.x, y, r.w, 1);
  } else if (st.game === "honkai") {
    const rr = 26,
      hw = Math.sqrt(3) * rr,
      cx = r.x + r.w / 2,
      cy = r.y + r.h / 2;
    ctx.lineWidth = 1;
    for (
      let row = 0, y = r.y - rr;
      y < r.y + r.h + rr * 2;
      row++, y += rr * 1.5
    )
      for (
        let x = r.x + ((row % 2) * hw) / 2 - hw;
        x < r.x + r.w + hw;
        x += hw
      ) {
        const near = Math.max(0, 1 - Math.hypot(x - px, y - py) / 220);
        const wave =
          Math.max(0, Math.sin(Math.hypot(x - cx, y - cy) * 0.012 - t * 1.2)) *
          0.06;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i + Math.PI / 6;
          const hx = x + rr * 0.94 * Math.cos(a),
            hy = y + rr * 0.94 * Math.sin(a);
          if (i) ctx.lineTo(hx, hy);
          else ctx.moveTo(hx, hy);
        }
        ctx.closePath();
        if (near > 0) {
          ctx.fillStyle = `rgba(115,151,255,${near * 0.16})`;
          ctx.fill();
        }
        ctx.strokeStyle = `rgba(160,185,240,${0.07 + near * 0.4 + wave})`;
        ctx.stroke();
      }
  } else if (st.game === "tot") {
    const D = Math.hypot(r.w, r.h) * 0.5;
    for (const p of st.bokeh!) {
      p.u += (p.vx * dt) / r.w;
      p.v += (p.vy * dt) / r.h;
      if (p.u < -0.15) p.u += 1.3;
      if (p.u > 1.15) p.u -= 1.3;
      if (p.v < -0.15) p.v += 1.3;
      if (p.v > 1.15) p.v -= 1.3;
      const rad = p.rr * D;
      const X = r.x + p.u * r.w,
        Y = r.y + p.v * r.h;
      shove(p, X, Y, m, r, dt, rad, 3 + rad / 40);
      const g = ctx.createRadialGradient(X, Y, 0, X, Y, rad);
      g.addColorStop(0, `rgba(238,143,179,${0.14 * p.z})`);
      g.addColorStop(0.7, `rgba(238,143,179,${0.06 * p.z})`);
      g.addColorStop(1, "rgba(238,143,179,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(X, Y, rad, 0, TAU);
      ctx.fill();
    }
    for (const p of st.petals!) {
      p.u += ((p.vx + Math.sin(t + p.ph) * 10) * dt) / r.w;
      p.v += (p.vy * dt) / r.h;
      p.rot += p.vr * dt;
      if (p.v > 1.04) {
        p.v = -0.04;
        p.u = R(-0.1, 1);
      }
      if (p.u > 1.04) p.u = -0.04;
      if (p.u < -0.1) p.u = 1.04;
      if (p.v < -0.1) p.v = 1.04;
      const X = r.x + p.u * r.w,
        Y = r.y + p.v * r.h;
      shove(p, X, Y, m, r, dt, 110, 1.2);
      p.rot += ((p.kx ?? 0) / 60) * dt; // a shoved petal tumbles
      ctx.save();
      ctx.translate(X, Y);
      ctx.rotate(p.rot);
      ctx.fillStyle = "rgba(238,143,179,.4)";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.s, p.s * 0.5, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
}

// A Seelie: a glowing wisp that drifts among the motes. Come close and it flits ahead, then
// waits for you to follow; after a few hops it settles into a chest that shimmers gold.
interface Seelie {
  x: number;
  y: number;
  tx: number; // where it's heading
  ty: number;
  mode: "wander" | "lead" | "wait" | "chest" | "gone";
  hops: number;
  t0: number; // when the current mode began
  trail: [number, number][];
  sparkles: Particle[];
}
const HOPS = 3;

// A random spot inside the canvas, clear of the page's content.
function openSpot(
  st: SceneState,
  r: Rect,
  near?: [number, number, number, number], // from x, y, away-from x, y
): [number, number] | null {
  const clear = st.avoid?.() ?? [];
  for (let i = 0; i < 16; i++) {
    let x: number, y: number;
    if (near) {
      const [fx, fy, ax, ay] = near,
        a = Math.atan2(fy - ay, fx - ax) + R(-0.9, 0.9),
        d = R(130, 210);
      x = fx + Math.cos(a) * d;
      y = fy + Math.sin(a) * d;
    } else {
      x = R(r.x + 60, r.x + r.w - 60);
      y = R(r.y + 80, r.y + r.h - 60);
    }
    const inside =
      x > r.x + 40 && x < r.x + r.w - 40 && y > r.y + 60 && y < r.y + r.h - 40;
    const covered = clear.some(
      (c) =>
        x > c.x - 40 &&
        x < c.x + c.w + 40 &&
        y > c.y - 40 &&
        y < c.y + c.h + 40,
    );
    if (inside && !covered) return [x, y];
  }
  return null;
}

function drawSeelie(
  ctx: CanvasRenderingContext2D,
  st: SceneState,
  r: Rect,
  t: number,
  dt: number,
  m: Pointer,
) {
  let s = st.seelie;
  if (!s) {
    const at = openSpot(st, r);
    if (!at) return;
    s = st.seelie = {
      x: at[0],
      y: at[1],
      tx: at[0],
      ty: at[1],
      mode: "wander",
      hops: 0,
      t0: t,
      trail: [],
      sparkles: [],
    };
  }
  const since = t - s.t0,
    near = m.live && Math.hypot(m.x - s.x, m.y - s.y) < 90;

  if (s.mode === "wander") {
    if (Math.hypot(s.tx - s.x, s.ty - s.y) < 8) {
      const to = openSpot(st, r, [s.x, s.y, s.x + R(-1, 1), s.y + R(-1, 1)]);
      if (to) [s.tx, s.ty] = to;
    }
    if (near) s.mode = "wait";
  }
  if ((s.mode === "wait" || s.mode === "wander") && near && since > 0.4) {
    if (s.hops >= HOPS) {
      s.mode = "chest";
      s.ty = s.y + 18;
      s.tx = s.x;
    } else {
      const to = openSpot(st, r, [s.x, s.y, m.x, m.y]);
      if (to) {
        [s.tx, s.ty] = to;
        s.mode = "lead";
        s.hops++;
      }
    }
    s.t0 = t;
  }
  // Nobody followed: go back to drifting.
  if (s.mode === "wait" && !near && since > 6) {
    s.mode = "wander";
    s.t0 = t;
  }
  if (s.mode === "lead" && Math.hypot(s.tx - s.x, s.ty - s.y) < 4) {
    s.mode = "wait";
    s.t0 = t;
  }
  if (s.mode === "chest" && since > 3.2) {
    s.mode = "gone";
    s.t0 = t;
  }
  if (s.mode === "gone") {
    if (since > 3) st.seelie = null;
    return;
  }

  // Ease toward the target: a slow drift when wandering, a quick dart when leading.
  const pull = { wander: 0.6, lead: 3.2, wait: 2, chest: 2.5 }[s.mode];
  const k = 1 - Math.exp(-dt * pull);
  s.x += (s.tx - s.x) * k;
  s.y += (s.ty - s.y) * k;
  const bob = s.mode === "chest" ? 0 : Math.sin(t * 2.2) * 4;
  const x = s.x + Math.sin(t * 1.3) * 3,
    y = s.y + bob;
  s.trail.unshift([x, y]);
  if (s.trail.length > 28) s.trail.pop();

  // The chest: fades in under the Seelie, then glows and sparkles fly.
  let fade = 1;
  if (s.mode === "chest") {
    const appear = Math.min(1, since / 0.6);
    fade = since > 2.4 ? Math.max(0, 1 - (since - 2.4) / 0.8) : 1;
    const cx = s.tx,
      cy = s.ty + 14;
    ctx.save();
    ctx.globalAlpha *= appear * fade;
    // A plain chest: one rectangle with a gold outline.
    ctx.fillStyle = "#08100f";
    ctx.strokeStyle = "rgba(216,182,106,.75)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.rect(cx - 13, cy - 15, 26, 17);
    ctx.fill();
    ctx.stroke();
    // Opening: a gold glow from the lid and sparkles drifting up.
    const open = Math.max(0, Math.min(1, (since - 0.8) / 0.4));
    if (open > 0) {
      const g = ctx.createRadialGradient(cx, cy - 12, 0, cx, cy - 12, 34);
      g.addColorStop(0, `rgba(255,226,150,${0.55 * open})`);
      g.addColorStop(1, "rgba(255,226,150,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy - 12, 34, 0, TAU);
      ctx.fill();
      if (since < 2.4 && Math.random() < dt * 30)
        s.sparkles.push({
          x: cx + R(-10, 10),
          y: cy - 12,
          vx: R(-8, 8),
          vy: R(-40, -18),
          life: 1,
        });
    }
    ctx.restore();
  }
  for (const p of s.sparkles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt / 1.2;
    ctx.fillStyle = `rgba(255,232,170,${0.9 * p.life})`;
    ctx.fillRect(p.x - 0.8, p.y - 0.8, 1.6, 1.6);
  }
  s.sparkles = s.sparkles.filter((p) => p.life > 0);

  // The Seelie: a comet tail, a soft blue-white glow and a bright core. In the chest it sinks
  // in and goes out.
  const lit = (s.mode === "chest" ? Math.max(0, 1 - since / 0.9) : 1) * fade;
  if (lit <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  for (let i = 1; i < s.trail.length; i++) {
    const f = 1 - i / s.trail.length;
    ctx.strokeStyle = `rgba(170,225,255,${0.35 * f * lit})`;
    ctx.lineWidth = 4 * f;
    ctx.beginPath();
    ctx.moveTo(s.trail[i - 1][0], s.trail[i - 1][1]);
    ctx.lineTo(s.trail[i][0], s.trail[i][1]);
    ctx.stroke();
  }
  const pulse = 0.85 + 0.15 * Math.sin(t * 4),
    glow = ctx.createRadialGradient(x, y, 0, x, y, 24 * pulse);
  glow.addColorStop(0, `rgba(235,250,255,${0.9 * lit})`);
  glow.addColorStop(0.25, `rgba(150,215,255,${0.45 * lit})`);
  glow.addColorStop(1, "rgba(150,215,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 24 * pulse, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${lit})`;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// The Astral Express: a steam engine in silhouette crossing slowly, rising a little from
// left to right. The light is at the wheels: a few gold and violet sparks where they meet
// the rail, a short glow left on the rail behind, and a faint plume from the stack.
const SLOPE = -0.2; // radians; negative climbs to the right
const SPARK = ["255,214,128", "255,186,92", "190,140,255", "226,128,255"];
// Where sparks fly from under the train (local x), mostly beneath the locomotive.
const WHEELS = [-62, -44, -26, -62, -44, -26, -4, -90, -112, -132];
const LEN = 342; // locomotive, tender and three carriages, in local units
function drawExpress(
  ctx: CanvasRenderingContext2D,
  st: SceneState,
  r: Rect,
  dt: number,
) {
  const k = Math.max(0.5, Math.min(0.75, r.w / 1900)),
    len = LEN * k,
    dx = Math.cos(SLOPE),
    dy = Math.sin(SLOPE);
  const x0 = r.x - len - 40,
    y0 = r.y + r.h * 0.92,
    run = (r.w + 2 * len + 80) / dx;
  // First run starts a third of the way in, so the train shows soon after the world opens.
  if (st.train === undefined) st.train = run * 0.35;
  if (st.train > run) {
    st.wait = (st.wait ?? 0) + dt;
    if (st.wait < 6) return void drift(ctx, st, dt);
    st.train = st.wait = 0;
  }
  st.train += 46 * k * dt;
  const hx = x0 + dx * st.train,
    hy = y0 + dy * st.train;
  // Local train coordinates (x forward, y up negative) to the canvas.
  const at = (lx: number, ly: number) => [
    hx + (lx * dx - ly * dy) * k,
    hy + (lx * dy + ly * dx) * k,
  ];

  // A short glow left on the rail behind the train.
  const [ex, ey] = at(-LEN - 420, 0),
    [lx0, ly0] = at(6, 0.5),
    [lx1, ly1] = at(-100, 0.5);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const rail = ctx.createLinearGradient(lx0, ly0, ex, ey);
  rail.addColorStop(0, "rgba(255,214,128,.55)");
  rail.addColorStop(0.25, "rgba(226,128,255,.4)");
  rail.addColorStop(0.45, "rgba(190,140,255,.3)"); // the end of the train
  rail.addColorStop(1, "rgba(190,140,255,0)");
  ctx.strokeStyle = rail;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lx0, ly0);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  // Hot where the locomotive's wheels run.
  const hot = ctx.createLinearGradient(lx0, ly0, lx1, ly1);
  hot.addColorStop(0, "rgba(255,226,160,.55)");
  hot.addColorStop(1, "rgba(255,186,92,.15)");
  ctx.strokeStyle = hot;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(lx0, ly0);
  ctx.lineTo(lx1, ly1);
  ctx.stroke();
  ctx.restore();

  if (dt > 0) {
    // Sparks at the wheels.
    const n = Math.round(260 * dt * (0.5 + Math.random()));
    for (let q = 0; q < n; q++) {
      const [sx, sy] = at(WHEELS[Math.floor(Math.random() * WHEELS.length)], 0),
        back = R(15, 70),
        down = R(0, 35);
      st.sparks!.push({
        x: sx,
        y: sy,
        vx: -dx * back - dy * down + R(-5, 5),
        vy: -dy * back + dx * down + R(-5, 5),
        life: 1,
        dur: R(0.35, 1),
        c: Math.floor(Math.random() * SPARK.length),
        ember: Math.random() < 0.09 ? 1 : 0,
      });
    }
    // Steam from the stack.
    if (Math.random() < dt * 9) {
      const [px, py] = at(-7, -38);
      st.steam!.push({
        x: px,
        y: py,
        vx: -dx * R(10, 22),
        vy: -R(6, 14),
        life: 1,
      });
    }
  }
  drift(ctx, st, dt);

  // The silhouette: locomotive (cowcatcher, boiler, flared stack, domes, cab), tender, and
  // carriages with rounded roofs. No wheels: it rides just above its rail of light.
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(SLOPE);
  ctx.scale(k, k);
  ctx.translate(0, 6);
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(16, -6);
    ctx.lineTo(4, -15);
    ctx.lineTo(4, -6);
    ctx.closePath();
    ctx.rect(-100, -11, 106, 3);
    ctx.roundRect(-70, -27, 76, 17, [2, 8, 8, 2]);
    ctx.moveTo(-11, -27);
    ctx.lineTo(-12, -37);
    ctx.lineTo(-15, -43);
    ctx.lineTo(3, -43);
    ctx.lineTo(0, -37);
    ctx.lineTo(-1, -27);
    ctx.closePath();
    ctx.moveTo(-36, -27);
    ctx.arc(-30, -27, 6, Math.PI, 0);
    ctx.moveTo(-50, -27);
    ctx.arc(-46, -27, 4, Math.PI, 0);
    ctx.rect(-100, -38, 30, 28);
    ctx.rect(-103, -41, 36, 4);
    ctx.roundRect(-140, -27, 36, 19, [4, 4, 1, 1]);
    for (let c = 0; c < 3; c++) {
      const x = -144 - c * 66 - 62;
      ctx.roundRect(x, -28, 62, 20, [7, 7, 2, 2]);
    }
  };
  // One faint gold outline around the whole silhouette: stroke thick, then fill over it.
  ctx.strokeStyle = "rgba(227,194,126,.2)";
  ctx.lineWidth = 2 / k;
  body();
  ctx.stroke();
  ctx.fillStyle = "#03040b";
  body();
  ctx.fill();
  // A warm cab window.
  ctx.fillStyle = "rgba(255,214,128,.45)";
  ctx.fillRect(-95, -34, 9, 8);
  ctx.restore();

  // Headlight on the smokebox.
  const [lx, ly] = at(7, -13),
    glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 16 * k);
  glow.addColorStop(0, "rgba(255,240,210,.9)");
  glow.addColorStop(0.3, "rgba(255,214,128,.35)");
  glow.addColorStop(1, "rgba(255,214,128,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(lx, ly, 16 * k, 0, TAU);
  ctx.fill();
}

// Sparks and steam keep moving (and fading) after they leave the train.
function drift(ctx: CanvasRenderingContext2D, st: SceneState, dt: number) {
  for (const p of st.steam!) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt / 2.6;
    const rad = 3 + (1 - p.life) * 13;
    ctx.fillStyle = `rgba(205,195,255,${0.07 * p.life})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, rad, 0, TAU);
    ctx.fill();
  }
  st.steam = st.steam!.filter((p) => p.life > 0);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineWidth = 1;
  const drag = Math.exp(-dt * 1.6);
  for (const p of st.sparks!) {
    p.vx *= drag;
    p.vy = p.vy * drag + 26 * dt; // a little gravity
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt / p.dur;
    const a = p.life * p.life;
    if (p.ember) {
      ctx.fillStyle = `rgba(${SPARK[p.c]},${0.16 * a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(${SPARK[p.c]},${0.85 * a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1, 0, TAU);
      ctx.fill();
    } else {
      ctx.strokeStyle = `rgba(${SPARK[p.c]},${0.78 * a})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
      ctx.stroke();
    }
  }
  ctx.restore();
  st.sparks = st.sparks!.filter((p) => p.life > 0);
}

// Now and then a bangboo, in silhouette, slides out from behind a corner of a lit TV near
// the cursor, waves, and slips back.
const POP = 2.8; // seconds on screen
function popBangboo(
  st: SceneState,
  lit: [number, number, number][],
  t: number,
) {
  if (st.pop && t - st.pop.t0 > POP) {
    st.pop = null;
    st.nextPop = t + R(2.5, 5);
  }
  if (st.pop || t < st.nextPop! || !lit.length) return;
  lit.sort((a, b) => b[2] - a[2]);
  const [i, j] = lit[Math.floor(Math.random() * Math.min(4, lit.length))];
  st.pop = { i, j, corner: Math.floor(Math.random() * 4), t0: t };
}

function drawBangboo(
  ctx: CanvasRenderingContext2D,
  pop: Pop,
  X: number,
  Y: number,
  tw: number,
  th: number,
  t: number,
) {
  const e = t - pop.t0,
    ease = (k: number) => 1 - Math.pow(1 - k, 3),
    out =
      e < 0.45
        ? ease(e / 0.45)
        : e > POP - 0.4
          ? 1 - ease((e - (POP - 0.4)) / 0.4)
          : 1;
  // Corners clockwise from top-left. The bangboo peeks into the screen, never upside down:
  // from a bottom corner it leans in diagonally; from a top corner it peeks in sideways,
  // head first, just below the top edge.
  const c = pop.corner,
    right = c === 1 || c === 2,
    top = c < 2,
    side = right ? 1 : -1,
    cx = right ? X + tw : X,
    cy = top ? Y + 16 : Y + th,
    angle = -side * (top ? Math.PI / 2 : Math.PI / 4),
    H = 36,
    S = 0.8; // a little smaller, to fit inside the TV
  const ux = Math.sin(angle),
    uy = -Math.cos(angle);
  // Out of view beside the TV, then in until the whole head shows.
  const d = (-H - 8 + out * H * 1.05) * S;
  ctx.save();
  // Draw only inside this TV's screen.
  ctx.beginPath();
  ctx.roundRect(X + 1, Y + 1, tw - 2, th - 2, 6);
  ctx.clip();
  ctx.translate(cx + ux * d, cy + uy * d);
  ctx.rotate(angle);
  ctx.scale(S, S);
  // Silhouette: egg body, two long ears, stubby arms; one arm waves.
  const wave = e > 0.4 && e < POP - 0.4 ? Math.sin((e - 0.4) * 11) : 0;
  // Wave with the arm that ends up on top.
  const waving = side;
  const lift = e > 0.4 ? -2.8 + wave * 0.5 : 0.2;
  const parts = (paint: () => void) => {
    const blob = (x: number, y: number, rx: number, ry: number, rot = 0) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
      paint();
    };
    const arm = (side: number, a: number, long: number) => {
      ctx.save();
      ctx.translate(side * 10, -15);
      ctx.rotate(side * a);
      blob(side * 1.5, long - 1, 2.8, long, side * -0.15);
      ctx.restore();
    };
    blob(-5.5, -33, 3.2, 9, -0.18);
    blob(5.5, -33, 3.2, 9, 0.22);
    arm(-waving, 0.2, 5);
    arm(waving, lift, 7);
    blob(0, -14, 11, 14);
  };
  // One outline around the whole shape: stroke every part thickly, then fill them all on
  // top, so only the outer half of the stroke shows.
  ctx.strokeStyle = "rgba(242,210,46,.85)";
  ctx.lineWidth = 2.6;
  parts(() => ctx.stroke());
  ctx.fillStyle = "#050505";
  parts(() => ctx.fill());
  // Glowing eyes.
  ctx.fillStyle = "rgba(216,255,90,.95)";
  for (const ex of [-4, 4]) {
    ctx.beginPath();
    ctx.ellipse(ex, -17, 1.9, 2.4, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Full-bleed painter that crossfades between worlds.
 * Runs only while its canvas is on screen and the tab is visible.
 */
export class Painter {
  private ctx: CanvasRenderingContext2D;
  private scenes: Partial<Record<GameKey, SceneState>> = {};
  private layers: { game: GameKey; a: number; target: number }[] = [];
  private w = 0;
  private h = 0;
  private m: Pointer = {
    x: -1e4,
    y: -1e4,
    vx: 0,
    vy: 0,
    live: false,
  };
  private moved = 0;
  private raf = 0;
  private last = 0;
  private visible = false;
  private rm = reducedMotion();

  constructor(
    private canvas: HTMLCanvasElement,
    host: HTMLElement,
    private extras = false,
    private avoid?: () => Element[],
  ) {
    this.ctx = canvas.getContext("2d")!;
    host.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect(),
        x = e.clientX - r.left,
        y = e.clientY - r.top,
        m = this.m,
        gap = Math.max(8, e.timeStamp - this.moved) / 1000;
      if (m.live) {
        m.vx += ((x - m.x) / gap - m.vx) * 0.5;
        m.vy += ((y - m.y) / gap - m.vy) * 0.5;
      }
      m.x = x;
      m.y = y;
      m.live = e.pointerType === "mouse";
      this.moved = e.timeStamp;
    });
    host.addEventListener("pointerleave", () => {
      this.m.live = false;
      this.m.vx = this.m.vy = 0;
    });
    new ResizeObserver(() => {
      this.size();
      this.paintOnce();
    }).observe(canvas);
    new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.sync();
    }).observe(canvas);
    document.addEventListener("visibilitychange", () => this.sync());
  }

  set(game: GameKey | null) {
    this.layers.forEach((l) => (l.target = 0));
    if (game) {
      const l = this.layers.find((l) => l.game === game);
      if (l) l.target = 1;
      else this.layers.push({ game, a: 0, target: 1 });
    }
    this.sync();
    this.paintOnce();
  }

  // Boxes of the given elements' contents (text ink, not full-width blocks), in canvas pixels.
  private covered(): Rect[] {
    if (!this.avoid) return [];
    const c = this.canvas.getBoundingClientRect(),
      range = document.createRange();
    return this.avoid().map((el) => {
      range.selectNodeContents(el);
      const b = range.getBoundingClientRect();
      return { x: b.left - c.left, y: b.top - c.top, w: b.width, h: b.height };
    });
  }

  private size() {
    const r = this.canvas.getBoundingClientRect(),
      d = Math.min(devicePixelRatio || 1, 2);
    this.w = r.width;
    this.h = r.height;
    this.canvas.width = Math.max(1, this.w * d);
    this.canvas.height = Math.max(1, this.h * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  private paintOnce() {
    if (this.rm) this.frame(performance.now(), 0);
  }

  private sync() {
    const run =
      !this.rm && this.visible && !document.hidden && this.layers.length > 0;
    if (run && !this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    } else if (!run && this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.frame(now, dt);
    this.raf = this.layers.length ? requestAnimationFrame(this.loop) : 0;
  };

  private frame(now: number, dt: number) {
    const t = now / 1000,
      { ctx, w, h, m } = this;
    if (!m.live) {
      m.x = w * (0.5 + 0.3 * Math.sin(t * 0.23));
      m.y = h * (0.5 + 0.28 * Math.sin(t * 0.31));
    }
    // The cursor's speed fades once it stops moving.
    const still = Math.exp(-dt * 14);
    m.vx *= still;
    m.vy *= still;
    ctx.clearRect(0, 0, w, h);
    for (const l of this.layers) {
      const step = this.rm ? 1 : dt / 0.55;
      l.a += Math.max(-step, Math.min(step, l.target - l.a));
      if (l.a > 0.001) {
        const st = (this.scenes[l.game] ??= seed(l.game, this.extras));
        st.avoid ??= () => this.covered();
        ctx.globalAlpha = l.a;
        draw(ctx, st, { x: 0, y: 0, w, h }, t, this.rm ? 0 : dt, m, false);
      }
    }
    ctx.globalAlpha = 1;
    this.layers = this.layers.filter((l) => l.a > 0.001 || l.target > 0);
  }
}
