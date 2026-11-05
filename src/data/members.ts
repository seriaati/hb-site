import { SERIA_API_KEY } from "astro:env/server";

// Discord roles in the Hoyo Buddy server, served by seria-api.
export const ROLES = {
  team: "1378911459366666260",
  designers: "1266651937411960882",
  sponsors: "1117992633827082251",
  contributors: "1452445065929560115",
  translators: "1010181916642787503",
  guide_writers: "1459757805442568263",
} as const;

export type Role = keyof typeof ROLES;

export interface Member {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

// Avatars are shown at 40px at most: fetch a small, still frame.
function staticAvatar(url: string): string {
  const u = new URL(url);
  u.pathname = u.pathname.replace(/\.gif$/, ".png");
  u.searchParams.set("size", "128");
  return u.href;
}

// Every locale renders the same lists, so each role is fetched once per build.
const cache = new Map<Role, Promise<Member[]>>();

export function getMembers(role: Role): Promise<Member[]> {
  let members = cache.get(role);
  if (!members) {
    members = fetch(`https://api.seria.moe/roles/${ROLES[role]}/members`, {
      headers: { "x-api-key": SERIA_API_KEY },
    }).then(async (res) => {
      if (!res.ok)
        throw new Error(`seria-api: ${role} members returned ${res.status}`);
      const list: Member[] = await res.json();
      for (const m of list) m.avatar_url = staticAvatar(m.avatar_url);
      return list.sort((a, b) => a.display_name.localeCompare(b.display_name));
    });
    cache.set(role, members);
  }
  return members;
}
