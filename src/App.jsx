import React, { useEffect, useMemo, useRef, useState } from "react";
import { toBlob } from "html-to-image";


import { CLASS_META } from "./data/classMeta";
import { RAIDS } from "./data/raids";

const ROLE_SLOT_RULE = {
  4: { DPS: 3, SUPPORT: 1 },
  8: { DPS: 6, SUPPORT: 2 },
};


const RAID_DISPLAY_ORDER = [
  "cathedral_3",
  "cathedral_2",
  "cathedral_1",
  "serka_hard",
  "serka_normal",
  "end_hard",
  "end_normal",
];

const RAID_FAMILIES = [
  {
    id: "cathedral",
    label: "성당",
    keys: ["cathedral_1", "cathedral_2", "cathedral_3"],
  },
  {
    id: "serka",
    label: "세르카",
    keys: ["serka_normal", "serka_hard"],
  },
  {
    id: "end",
    label: "종막",
    keys: ["end_normal", "end_hard"],
  },
];


const SHEET_STATE_API_URL = "https://script.google.com/macros/s/AKfycbwmCdm0iY4EXs96avcrrLUCh6B9sfpSlua6G5D2Eb-ebvEQQYduJAJmQpBnWW8FzPbYQA/exec";

const SHARED_STATE_VERSION = 1;
const DISCORD_WEBHOOK_STORAGE_KEY = "lostark_party_discord_webhook_url";

const DISCORD_OWNER_MENTIONS = {
  영수: "<@417696097444691968>",
  찬범: "<@334625304691605514>",
  재진: "<@385005540092280842>",
  강찬: "<@327454010854604801>",
  준형: "<@420241555111149570>",
  준혁: "<@327822837270446082>",
  혁준: "<@264369748626767872>",
  혜연: "<@483844597500346378>",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7f9",
    padding: "14px",
    color: "#111827",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  container: {
    maxWidth: "1500px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "18px 20px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  },
  title: {
    fontSize: "30px",
    fontWeight: 950,
    margin: 0,
    letterSpacing: "-0.05em",
    color: "#111827",
    lineHeight: 1.05,
  },
  desc: {
    color: "#475569",
    lineHeight: 1.35,
    margin: "7px 0 0",
    fontSize: "12px",
    fontWeight: 750,
  },
  topRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "18px",
    flexWrap: "wrap",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  button: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#1f2937",
    padding: "7px 10px",
    borderRadius: "10px",
    fontWeight: 850,
    cursor: "pointer",
    boxShadow: "none",
  },
  activeButton: {
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    padding: "7px 10px",
    borderRadius: "10px",
    fontWeight: 850,
    cursor: "pointer",
    boxShadow: "none",
  },
  miniButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    padding: "3px 7px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: 850,
    cursor: "pointer",
    lineHeight: 1.2,
    boxShadow: "none",
    whiteSpace: "nowrap",
  },
  miniActiveButton: {
    border: "1px solid #1f2937",
    background: "#1f2937",
    color: "#ffffff",
    padding: "3px 7px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: 900,
    cursor: "pointer",
    lineHeight: 1.2,
    boxShadow: "none",
    whiteSpace: "nowrap",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
  },
  cardPad: {
    padding: "12px",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: 850,
  },
  statValue: {
    marginTop: "6px",
    fontSize: "23px",
    fontWeight: 950,
    letterSpacing: "-0.04em",
    color: "#0f172a",
  },
  raidSelectBox: {
    position: "sticky",
    top: "8px",
    zIndex: 50,
    background: "rgba(255, 255, 255, 0.94)",
    backdropFilter: "blur(10px)",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "12px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
  },
  raidButtonWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "8px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 900,
    margin: 0,
    letterSpacing: "-0.03em",
  },
  smallText: {
    color: "#64748b",
    fontSize: "11px",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  partyHeader: {
    padding: "10px 12px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "8px",
    padding: "10px",
  },
  raidSubPartyMemberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "8px",
    padding: "10px",
  },
  charCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "9px",
    background: "#ffffff",
    boxShadow: "none",
    minWidth: 0,
  },
  emptySlot: {
    border: "1px dashed #d1d5db",
    borderRadius: "12px",
    padding: "9px",
    background: "#f9fafb",
    color: "#9ca3af",
    minHeight: "78px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    fontWeight: 900,
  },
  charName: {
    fontWeight: 900,
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  badgeWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginTop: "6px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#374151",
    borderRadius: "999px",
    padding: "2px 7px",
    fontSize: "11px",
    fontWeight: 850,
  },
  goodBadge: {
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#15803d",
  },
  warnBadge: {
    border: "1px solid #fde68a",
    background: "#fffbeb",
    color: "#b45309",
  },
  dangerBadge: {
    border: "1px solid #fecdd3",
    background: "#fff1f2",
    color: "#be123c",
  },
  blueBadge: {
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#1d4ed8",
  },
  purpleBadge: {
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#374151",
  },
  splitGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(min(720px, 100%), 1.45fr) minmax(min(320px, 100%), 0.55fr)",
    gap: "18px",
    alignItems: "start",
  },
  input: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "10px 12px",
    outline: "none",
    fontWeight: 800,
    background: "#ffffff",
    boxShadow: "none",
  },
  miniInput: {
    width: "240px",
    maxWidth: "100%",
    height: "28px",
    minWidth: 0,
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "5px 10px",
    outline: "none",
    fontSize: "11px",
    fontWeight: 850,
    background: "#ffffff",
    boxShadow: "none",
  },
  issue: {
    border: "1px solid #fde68a",
    background: "#fffbeb",
    color: "#92400e",
    borderRadius: "10px",
    padding: "10px",
    fontSize: "11px",
    fontWeight: 700,
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(360px, 100%), 360px))",
    gap: "10px",
    justifyContent: "start",
  },
  overviewGridWide: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(360px, 100%), 360px))",
    gap: "10px",
    justifyContent: "start",
  },
  overviewRaidCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "10px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
  },
  overviewPartyCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "8px",
    background: "#f9fafb",
  },
  overviewMember: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "5px 6px",
    background: "#ffffff",
    minWidth: 0,
  },
  overviewMemberName: {
    fontSize: "11px",
    fontWeight: 900,
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  overviewMemberClass: {
    marginTop: "2px",
    fontSize: "10px",
    color: "#6b7280",
    fontWeight: 750,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

function getClassMeta(character) {
  if (character.className === "발키리" && character.roleOverride) {
    if (character.roleOverride === "SUPPORT") {
      return CLASS_META?.["발키리"]?.builds?.["해방자"] ?? {
        role: "SUPPORT",
        synergies: ["서폿"],
      };
    }

    return CLASS_META?.["발키리"]?.builds?.["빛의 기사"] ?? {
      role: "DPS",
      synergies: ["치피증"],
    };
  }

  return CLASS_META?.[character.className]?.builds?.[character.build] ?? {
    role: "DPS",
    synergies: [],
  };
}

function getCharacterId(character) {
  return `${character.owner}::${character.name}`;
}

function getClassIdentity(character) {
  const meta = getClassMeta(character);
  return `${character.className}::${meta.role}`;
}

function getRoleOverrideKey(raidKey, character) {
  return `${raidKey}::${getCharacterId(character)}`;
}

function getOwnerToggleKey(raidKey, owner) {
  return `${raidKey}::${owner}`;
}

function getPartyDoneKey(party) {
  return `${party.raid.key}::${party.id}`;
}

function getRaidPreferenceKey(character, raidKey) {
  return `${getCharacterId(character)}::${raidKey}`;
}

function getRaidPreference(raidPreferences, character, raidKey) {
  return raidPreferences[getRaidPreferenceKey(character, raidKey)] ?? "AUTO";
}

function getRaidByKey(raidKey) {
  return RAIDS.find((raid) => raid.key === raidKey);
}

function getAvailableRaidsForFamily(character, family) {
  return family.keys
    .map(getRaidByKey)
    .filter(Boolean)
    
    .filter((raid) => character.level >= raid.minLevel);
}

function getDefaultRaidForFamily(character, family) {
  const eligibleRaids = family.keys
    .map(getRaidByKey)
    .filter(Boolean)
    .filter((raid) => character.level >= raid.minLevel && character.level <= raid.maxLevel);

  return eligibleRaids[0] ?? null;
}

function isRaidFamilyExcluded(character, family, raidPreferences) {
  const availableRaids = getAvailableRaidsForFamily(character, family);
  if (!availableRaids.length) return false;

  return availableRaids.every(
    (raid) => getRaidPreference(raidPreferences, character, raid.key) === "EXCLUDE"
  );
}

function getSelectedRaidForFamily(character, family, raidPreferences) {
  if (isRaidFamilyExcluded(character, family, raidPreferences)) return null;

  const forcedKey = family.keys.find(
    (raidKey) => getRaidPreference(raidPreferences, character, raidKey) === "FORCE"
  );

  if (forcedKey) return getRaidByKey(forcedKey);
  return getDefaultRaidForFamily(character, family);
}

function getRaidFamilyButtonText(character, family, raidPreferences) {
  const availableRaids = getAvailableRaidsForFamily(character, family);
  if (!availableRaids.length) return `${family.label} 불가`;

  if (isRaidFamilyExcluded(character, family, raidPreferences)) {
    return `${family.label} 안감`;
  }

  const selectedRaid = getSelectedRaidForFamily(character, family, raidPreferences);
  if (!selectedRaid) return `${family.label} 자동`;

  const isForced = getRaidPreference(raidPreferences, character, selectedRaid.key) === "FORCE";
  const shortName = selectedRaid.name
    .replace("지평의 성당 ", "")
    .replace("세르카 ", "")
    .replace("종막 ", "");

  return `${family.label} ${shortName}${isForced ? "*" : ""}`;
}

function canCharacterEnterRaid(character, raid, raidPreferences = {}) {
  const preference = getRaidPreference(raidPreferences, character, raid.key);

  if (preference === "EXCLUDE") return false;

  if (preference === "FORCE") {
    return character.level >= raid.minLevel;
  }

  return character.level >= raid.minLevel && character.level <= raid.maxLevel;
}

function isOwnerEnabledForRaid(ownerToggles, raidKey, owner) {
  return ownerToggles[getOwnerToggleKey(raidKey, owner)] !== false;
}

function applyRoleOverrides(character, roleOverrides, raidKey) {
  if (character.className !== "발키리") return character;

  const overrideRole = roleOverrides[getRoleOverrideKey(raidKey, character)];
  if (!overrideRole) return character;

  return {
    ...character,
    roleOverride: overrideRole,
    build: overrideRole === "SUPPORT" ? "해방자" : "빛의 기사",
  };
}

function getRaidOrderValue(raid) {
  const index = RAID_DISPLAY_ORDER.indexOf(raid.key);
  return index === -1 ? 999 : index;
}

function getOrderedRaids(raids = RAIDS) {
  return [...raids].sort((a, b) => getRaidOrderValue(a) - getRaidOrderValue(b));
}

function getEligibleRaids(character, selectedRaidKeys, raidPreferences = {}) {
  return getOrderedRaids().filter(
    (raid) => selectedRaidKeys.includes(raid.key) && canCharacterEnterRaid(character, raid, raidPreferences)
  );
}

function getEffectivePower(character) {
  const value = Number(character.power ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function formatNumber(value, maxDigits = 2) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) return "0";

  return number.toLocaleString("ko-KR", {
    maximumFractionDigits: maxDigits,
  });
}

function formatLevel(value) {
  return formatNumber(value, 2);
}

function formatPower(value) {
  return formatNumber(value, 2);
}

function formatGold(value) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number) || number <= 0) return "";

  return number.toLocaleString("ko-KR", {
    maximumFractionDigits: 0,
  });
}

function makeDiscordImageFileName(title) {
  return `${String(title || "lostark-party")
    .replace(/[\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80)}.png`;
}

function getDiscordOwnerMention(owner) {
  return DISCORD_OWNER_MENTIONS[owner] ?? `@${owner}`;
}

function getUniqueMembers(members = []) {
  const map = new Map();

  for (const member of members) {
    if (!member) continue;
    const id = getCharacterId(member);
    if (!map.has(id)) map.set(id, member);
  }

  return [...map.values()];
}

function getPartiesMembers(parties = []) {
  return getUniqueMembers(parties.flatMap((party) => getPartyMembers(party)));
}

function getGroupsMembers(groups = []) {
  return getPartiesMembers(groups.flatMap((group) => group.parties ?? []));
}

function getConcurrentItemsMembers(items = []) {
  return getPartiesMembers(items.map((item) => item.party).filter(Boolean));
}

function makeDiscordShareContent(title, members = []) {
  const owners = [...new Set(getUniqueMembers(members).map((member) => member.owner).filter(Boolean))];
  const mentionText = owners.map(getDiscordOwnerMention).join(" ");

  return [title, mentionText].filter(Boolean).join("\n");
}

function normalizeText(value) {
  return String(value ?? "").split(" ").join("").toLowerCase();
}

function hasBackHeadSynergy(character) {
  const meta = getClassMeta(character);
  const text = normalizeText([
    character.name,
    character.className,
    character.build,
    ...(meta.synergies ?? []),
  ].join(" "));

  return text.includes("백헤드받피증");
}

function isBackHeadDealer(character) {
  const meta = getClassMeta(character);
  const text = normalizeText([
    character.name,
    character.className,
    character.build,
    character.attackType,
    character.position,
    character.dealerType,
    meta.attackType,
    meta.position,
    meta.dealerType,
    ...(meta.tags ?? []),
    ...(meta.synergies ?? []),
  ].join(" "));

  return (
    text.includes("백어택") ||
    text.includes("헤드어택") ||
    text.includes("백딜") ||
    text.includes("헤드딜") ||
    text.includes("백사멸") ||
    text.includes("헤드사멸")
  );
}

function getBackHeadPairScore(party, character) {
  const members = getPartyMembers(party);
  const characterHasBackHeadSynergy = hasBackHeadSynergy(character);
  const characterIsBackHeadDealer = isBackHeadDealer(character);

  const partyBackHeadSynergyCount = members.filter(hasBackHeadSynergy).length;
  const partyBackHeadDealerCount = members.filter(isBackHeadDealer).length;

  let score = 0;

  
  if (characterHasBackHeadSynergy && partyBackHeadDealerCount > 0) {
    score -= Math.min(partyBackHeadDealerCount, 3) * 420;
  }

  
  if (characterIsBackHeadDealer && partyBackHeadSynergyCount > 0) {
    score -= Math.min(partyBackHeadSynergyCount, 1) * 420;
  }

  
  if (characterHasBackHeadSynergy && partyBackHeadDealerCount === 0 && members.length > 0) {
    score += 180;
  }

  return score;
}

function getRoleSlotRule(raid) {
  return ROLE_SLOT_RULE[raid.partySize] ?? {
    DPS: Math.max(0, raid.partySize - 1),
    SUPPORT: 1,
  };
}

function makeSlots(raid) {
  const rule = getRoleSlotRule(raid);
  const slots = [];

  if (raid.partySize === 8) {
    for (const group of ["A", "B"]) {
      for (let index = 0; index < rule.DPS / 2; index += 1) {
        slots.push({ role: "DPS", group, member: null });
      }
      for (let index = 0; index < rule.SUPPORT / 2; index += 1) {
        slots.push({ role: "SUPPORT", group, member: null });
      }
    }
    return slots;
  }

  for (let index = 0; index < rule.DPS; index += 1) {
    slots.push({ role: "DPS", group: "A", member: null });
  }
  for (let index = 0; index < rule.SUPPORT; index += 1) {
    slots.push({ role: "SUPPORT", group: "A", member: null });
  }

  return slots;
}

function getPartyMembers(party) {
  return party.slots.map((slot) => slot.member).filter(Boolean);
}

function summarizeParty(party) {
  const members = Array.isArray(party) ? party : getPartyMembers(party);

  
  
  const dpsMembersForAverage = members.filter(
    (member) => getClassMeta(member).role !== "SUPPORT"
  );
  const powers = dpsMembersForAverage.map((member) => Number(member.power ?? 0));
  const avgPower = powers.length
    ? Math.round(powers.reduce((sum, value) => sum + value, 0) / powers.length)
    : 0;

  const roles = members.reduce((acc, member) => {
    const meta = getClassMeta(member);
    acc[meta.role] = (acc[meta.role] ?? 0) + 1;
    return acc;
  }, {});

  const synergyCounts = members.reduce((acc, member) => {
    const meta = getClassMeta(member);
    for (const synergy of meta.synergies ?? []) {
      if (synergy === "서폿") continue;
      acc[synergy] = (acc[synergy] ?? 0) + 1;
    }
    return acc;
  }, {});

  return {
    avgPower,
    supportCount: roles.SUPPORT ?? 0,
    dpsCount: roles.DPS ?? 0,
    synergyCounts,
  };
}

function getDpsMembersFromParty(party) {
  return getPartyMembers(party).filter((member) => getClassMeta(member).role !== "SUPPORT");
}

function getPartyDpsAvgPower(party) {
  const dpsMembers = getDpsMembersFromParty(party);
  if (!dpsMembers.length) return 0;

  return Math.round(
    dpsMembers.reduce((sum, member) => sum + getEffectivePower(member), 0) / dpsMembers.length
  );
}

function getRaidDpsSpread(raidGroup) {
  const averages = raidGroup.parties
    .map(getPartyDpsAvgPower)
    .filter((value) => value > 0);

  if (averages.length <= 1) return 0;
  return Math.max(...averages) - Math.min(...averages);
}

function canSwapExactSlots(partyA, slotA, partyB, slotB) {
  if (!slotA.member || !slotB.member) return false;
  if (slotA.role !== "DPS" || slotB.role !== "DPS") return false;

  const memberA = slotA.member;
  const memberB = slotB.member;

  slotA.member = memberB;
  slotB.member = memberA;
  rebuildSynergyCounts(partyA);
  rebuildSynergyCounts(partyB);

  const valid = isPartyValidByOwnerAndClass(partyA) && isPartyValidByOwnerAndClass(partyB);

  slotA.member = memberA;
  slotB.member = memberB;
  rebuildSynergyCounts(partyA);
  rebuildSynergyCounts(partyB);

  return valid;
}

function balanceRaidDpsPower(raidGroup) {
  
  
  let improved = true;
  let loopGuard = 0;

  while (improved && loopGuard < 80) {
    improved = false;
    loopGuard += 1;

    const currentSpread = getRaidDpsSpread(raidGroup);
    let bestSwap = null;

    for (let i = 0; i < raidGroup.parties.length; i += 1) {
      for (let j = i + 1; j < raidGroup.parties.length; j += 1) {
        const partyA = raidGroup.parties[i];
        const partyB = raidGroup.parties[j];

        for (const slotA of partyA.slots) {
          if (!slotA.member || slotA.role !== "DPS") continue;

          for (const slotB of partyB.slots) {
            if (!slotB.member || slotB.role !== "DPS") continue;
            if (!canSwapExactSlots(partyA, slotA, partyB, slotB)) continue;

            const originalA = slotA.member;
            const originalB = slotB.member;

            slotA.member = originalB;
            slotB.member = originalA;
            rebuildSynergyCounts(partyA);
            rebuildSynergyCounts(partyB);

            const nextSpread = getRaidDpsSpread(raidGroup);
            const improvement = currentSpread - nextSpread;

            slotA.member = originalA;
            slotB.member = originalB;
            rebuildSynergyCounts(partyA);
            rebuildSynergyCounts(partyB);

            if (improvement > 0 && (!bestSwap || improvement > bestSwap.improvement)) {
              bestSwap = { partyA, partyB, slotA, slotB, improvement };
            }
          }
        }
      }
    }

    if (bestSwap) {
      const temp = bestSwap.slotA.member;
      bestSwap.slotA.member = bestSwap.slotB.member;
      bestSwap.slotB.member = temp;
      rebuildSynergyCounts(bestSwap.partyA);
      rebuildSynergyCounts(bestSwap.partyB);
      improved = true;
    }
  }
}

function SynergyBadges({ synergyCounts }) {
  const entries = Object.entries(synergyCounts ?? {}).filter(
    ([synergy, count]) => synergy !== "서폿" && count > 0
  );
  if (!entries.length) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "4px",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      {entries.map(([synergy, count]) => {
        const isDuplicate = count > 1;

        return (
          <span
            key={synergy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "24px",
              padding: "0 9px",
              border: isDuplicate ? "1px solid #f59e0b" : "1px solid #e5e7eb",
              background: isDuplicate ? "#fffbeb" : "#ffffff",
              color: isDuplicate ? "#92400e" : "#374151",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 850,
              lineHeight: 1,
              whiteSpace: "nowrap",
              boxSizing: "border-box",
            }}
          >
            {synergy}
            {isDuplicate ? ` ×${count}` : ""}
          </span>
        );
      })}
    </div>
  );
}

function scorePartyForCharacter({ party, character, targetAvgPower }) {
  const members = getPartyMembers(party);
  const meta = getClassMeta(character);
  const role = meta.role === "SUPPORT" ? "SUPPORT" : "DPS";

  const synergyOverlap = (meta.synergies ?? []).reduce((sum, synergy) => {
    if (synergy === "서폿") return sum;
    return sum + (party.synergyCounts[synergy] ?? 0) * 550;
  }, 0);

  const backHeadPairScore = getBackHeadPairScore(party, character);

  const filledCount = members.length;
  const compactBonus = filledCount * -120;

  
  
  if (role === "SUPPORT") {
    return synergyOverlap + backHeadPairScore + compactBonus;
  }

  
  const dpsMembers = members.filter((member) => getClassMeta(member).role !== "SUPPORT");
  const nextDpsMembers = [...dpsMembers, character];
  const nextDpsSummary = summarizeParty(nextDpsMembers);
  const currentDpsSummary = summarizeParty(dpsMembers);

  const nextAvgPenalty = Math.abs(nextDpsSummary.avgPower - targetAvgPower) * 1.9;
  const currentAvgPenalty = dpsMembers.length
    ? Math.max(0, currentDpsSummary.avgPower - targetAvgPower) * 1.15
    : 0;

  return nextAvgPenalty + currentAvgPenalty + synergyOverlap + backHeadPairScore + compactBonus;
}

function assignCharacterToRaid({ character, raidGroup, usageMap, targetAvgPower }) {
  const role = getClassMeta(character).role === "SUPPORT" ? "SUPPORT" : "DPS";
  let best = null;

  for (const party of raidGroup.parties) {
    for (let slotIndex = 0; slotIndex < party.slots.length; slotIndex += 1) {
      const slot = party.slots[slotIndex];
      if (slot.member) continue;
      if (slot.role !== role) continue;
      if (!canPutMemberInSlotGroup(party, character, role, slot.group)) continue;

      const score = scorePartyForCharacter({ party, character, targetAvgPower });
      if (!best || score < best.score) {
        best = { party, slotIndex, score };
      }
    }
  }

  if (!best) {
    const newParty = {
      id: `${raidGroup.raid.key}-${raidGroup.parties.length + 1}`,
      raid: raidGroup.raid,
      slots: makeSlots(raidGroup.raid),
      synergyCounts: {},
    };
    raidGroup.parties.push(newParty);

    const slotIndex = newParty.slots.findIndex((slot) => slot.role === role && !slot.member);
    best = { party: newParty, slotIndex, score: 0 };
  }

  best.party.slots[best.slotIndex].member = character;
  const meta = getClassMeta(character);
  for (const synergy of meta.synergies ?? []) {
    if (synergy === "서폿") continue;
    best.party.synergyCounts[synergy] = (best.party.synergyCounts[synergy] ?? 0) + 1;
  }

  const id = getCharacterId(character);
  usageMap.set(id, (usageMap.get(id) ?? 0) + 1);
}

function rebuildSynergyCounts(party) {
  party.synergyCounts = {};

  for (const member of getPartyMembers(party)) {
    const meta = getClassMeta(member);
    for (const synergy of meta.synergies ?? []) {
      if (synergy === "서폿") continue;
      party.synergyCounts[synergy] = (party.synergyCounts[synergy] ?? 0) + 1;
    }
  }
}

function normalizePartySlots(party) {
  const groups = [...new Set(party.slots.map((slot) => slot.group))];

  for (const group of groups) {
    for (const role of ["DPS", "SUPPORT"]) {
      const roleSlots = party.slots.filter((slot) => slot.group === group && slot.role === role);
      const members = roleSlots
        .map((slot) => slot.member)
        .filter(Boolean)
        .sort((a, b) => getEffectivePower(b) - getEffectivePower(a) || b.level - a.level);

      roleSlots.forEach((slot, index) => {
        slot.member = members[index] ?? null;
      });
    }
  }

  rebuildSynergyCounts(party);
}

function normalizeRaidGroupSlots(raidGroup) {
  for (const party of raidGroup.parties) {
    normalizePartySlots(party);
  }
}

function cloneScheduleGroups(groups) {
  return groups.map((group) => ({
    ...group,
    parties: group.parties.map((party) => ({
      ...party,
      slots: party.slots.map((slot) => ({ ...slot })),
      synergyCounts: { ...(party.synergyCounts ?? {}) },
    })),
  }));
}

function isValidScheduleGroups(groups) {
  if (!Array.isArray(groups)) return false;

  return groups.every(
    (group) =>
      group &&
      group.raid &&
      group.raid.key &&
      Array.isArray(group.parties) &&
      group.parties.every(
        (party) => party && party.raid && party.raid.key && Array.isArray(party.slots)
      )
  );
}

function compactMemberForSave(member) {
  if (!member) return null;

  return {
    owner: member.owner,
    name: member.name,
    className: member.className,
    build: member.build,
    level: member.level,
    power: member.power,
    roleOverride: member.roleOverride,
  };
}

function compactScheduleGroups(groups) {
  if (!isValidScheduleGroups(groups)) return null;

  return groups.map((group) => ({
    raidKey: group.raid.key,
    parties: group.parties.map((party) => ({
      id: party.id,
      slots: party.slots.map((slot) => ({
        role: slot.role,
        group: slot.group,
        member: compactMemberForSave(slot.member),
      })),
    })),
  }));
}

function hydrateSavedScheduleGroups(savedGroups) {
  if (!Array.isArray(savedGroups)) return null;

  const hydrated = savedGroups
    .map((group) => {
      const raid = getRaidByKey(group.raidKey ?? group.raid?.key);
      if (!raid || !Array.isArray(group.parties)) return null;

      const parties = group.parties
        .map((party, partyIndex) => {
          if (!Array.isArray(party.slots)) return null;

          const normalizedParty = {
            id: party.id ?? `${raid.key}-${partyIndex + 1}`,
            raid,
            slots: party.slots.map((slot) => ({
              role: slot.role,
              group: slot.group ?? "A",
              member: slot.member ?? null,
            })),
            synergyCounts: {},
          };

          rebuildSynergyCounts(normalizedParty);
          return normalizedParty;
        })
        .filter(Boolean);

      return {
        raid,
        parties,
        targetAvgPower: 0,
      };
    })
    .filter(Boolean);

  return isValidScheduleGroups(hydrated) ? hydrated : null;
}

function cloneScheduleGroupsForEdit(groups) {
  return groups.map((group) => ({
    ...group,
    raid: group.raid,
    parties: group.parties.map((party) => ({
      ...party,
      raid: party.raid,
      synergyCounts: { ...(party.synergyCounts ?? {}) },
      slots: party.slots.map((slot) => ({
        ...slot,
        member: slot.member ? { ...slot.member } : null,
      })),
    })),
  }));
}

function removeEmptyPartiesFromGroups(groups) {
  return groups.map((group) => ({
    ...group,
    parties: group.parties.filter((party) =>
      party.slots.some((slot) => slot.member)
    ),
  }));
}

function syncGroupMembersWithCharacters(groups, characters) {
  if (!isValidScheduleGroups(groups) || !Array.isArray(characters)) return groups;

  const characterMap = new Map(
    characters.map((character) => [getCharacterId(character), character])
  );

  return groups.map((group) => ({
    ...group,
    parties: group.parties.map((party) => {
      const nextParty = {
        ...party,
        slots: party.slots.map((slot) => {
          if (!slot.member) return { ...slot };

          const latestCharacter = characterMap.get(getCharacterId(slot.member));
          if (!latestCharacter) {
            return {
              ...slot,
              member: { ...slot.member },
            };
          }

          return {
            ...slot,
            member: {
              ...latestCharacter,
              roleOverride: slot.member.roleOverride,
            },
          };
        }),
        synergyCounts: { ...(party.synergyCounts ?? {}) },
      };

      rebuildSynergyCounts(nextParty);
      return nextParty;
    }),
  }));
}


function getRaidFamilyByRaidKey(raidKey) {
  return RAID_FAMILIES.find((family) => family.keys.includes(raidKey)) ?? null;
}

function getBestCurrentRaidForFamily(character, family) {
  const currentLevelRaids = family.keys
    .map(getRaidByKey)
    .filter(Boolean)
    .filter((raid) => character.level >= raid.minLevel && character.level <= raid.maxLevel)
    .sort((a, b) => b.minLevel - a.minLevel);

  if (currentLevelRaids.length) return currentLevelRaids[0];

  const availableRaids = family.keys
    .map(getRaidByKey)
    .filter(Boolean)
    .filter((raid) => character.level >= raid.minLevel)
    .sort((a, b) => b.minLevel - a.minLevel);

  return availableRaids[0] ?? null;
}

function getDowngradeRaidWarnings(groups) {
  const warnings = [];

  for (const group of groups) {
    for (const party of group.parties) {
      for (const member of getPartyMembers(party)) {
        const family = getRaidFamilyByRaidKey(group.raid.key);
        if (!family) continue;

        const bestRaid = getBestCurrentRaidForFamily(member, family);
        if (!bestRaid) continue;
        if (bestRaid.key === group.raid.key) continue;
        if (bestRaid.minLevel <= group.raid.minLevel) continue;

        warnings.push(`${member.name}: ${bestRaid.name} → ${group.raid.name}`);
      }
    }
  }

  return [...new Set(warnings)];
}

function reconcilePresetGroupsWithCurrentData(presetGroups, characters, presetRaidPreferences = {}) {
  const characterMap = new Map(
    characters.map((character) => [getCharacterId(character), character])
  );
  const warnings = [];
  const nextRaidPreferences = { ...(presetRaidPreferences ?? {}) };

  const groups = presetGroups
    .map((group) => {
      const raid = getRaidByKey(group.raid?.key ?? group.raidKey);
      if (!raid) {
        warnings.push("알 수 없는 레이드가 프리셋에서 제외되었습니다.");
        return null;
      }

      const parties = group.parties.map((party, partyIndex) => {
        const nextParty = {
          ...party,
          raid,
          slots: party.slots.map((slot) => {
            if (!slot.member) return { ...slot, member: null };

            const latestCharacter = characterMap.get(getCharacterId(slot.member));
            if (!latestCharacter) {
              warnings.push(`${raid.name} ${partyIndex + 1}${raid.partySize === 8 ? "공대" : "파티"}: ${slot.member.name} 캐릭터를 현재 Characters 시트에서 찾을 수 없어 제외했습니다.`);
              return { ...slot, member: null };
            }

            const mergedCharacter = {
              ...latestCharacter,
              roleOverride: slot.member.roleOverride,
            };

            const family = getRaidFamilyByRaidKey(raid.key);
            if (family) {
              const bestRaid = getBestCurrentRaidForFamily(mergedCharacter, family);

              if (bestRaid && bestRaid.key !== raid.key) {
                for (const familyRaidKey of family.keys) {
                  delete nextRaidPreferences[getRaidPreferenceKey(mergedCharacter, familyRaidKey)];
                }

                nextRaidPreferences[getRaidPreferenceKey(mergedCharacter, raid.key)] = "FORCE";

                if (bestRaid.minLevel > raid.minLevel) {
                  warnings.push(`${mergedCharacter.name}: ${bestRaid.name} → ${raid.name}`);
                }
              }
            }

            return {
              ...slot,
              member: mergedCharacter,
            };
          }),
          synergyCounts: {},
        };

        rebuildSynergyCounts(nextParty);

        const partyWarning = validatePartyAfterManualSwap(nextParty);
        if (partyWarning) {
          warnings.push(`${raid.name} ${partyIndex + 1}${raid.partySize === 8 ? "공대" : "파티"}: ${partyWarning}`);
        }

        return nextParty;
      });

      return {
        raid,
        parties,
        targetAvgPower: 0,
      };
    })
    .filter(Boolean);

  return {
    groups: removeEmptyPartiesFromGroups(groups),
    raidPreferences: nextRaidPreferences,
    warnings,
  };
}

function replaceRaidGroupOnly(groups, raidKey, nextRaidGroup) {
  const nextGroups = cloneScheduleGroupsForEdit(groups);
  const index = nextGroups.findIndex((group) => group.raid.key === raidKey);

  if (index === -1) {
    return [...nextGroups, nextRaidGroup].sort(
      (a, b) => getRaidOrderValue(a.raid) - getRaidOrderValue(b.raid)
    );
  }

  nextGroups[index] = nextRaidGroup;
  return nextGroups.sort((a, b) => getRaidOrderValue(a.raid) - getRaidOrderValue(b.raid));
}

function findPartyById(groups, raidKey, partyId) {
  const group = groups.find((item) => item.raid.key === raidKey);
  if (!group) return null;
  return group.parties.find((party) => party.id === partyId) ?? null;
}

function findSlotByDragRef(groups, dragRef) {
  const party = findPartyById(groups, dragRef.raidKey, dragRef.partyId);
  if (!party) return null;
  const slot = party.slots[dragRef.slotIndex];
  if (!slot) return null;
  return { party, slot };
}

function validatePartyAfterManualSwap(party) {
  const members = getPartyMembers(party);
  const ownerSet = new Set(members.map((member) => member.owner));
  if (ownerSet.size !== members.length) {
    return "같은 파티/공대 안에 같은 사람이 중복됩니다.";
  }

  const groups = [...new Set(party.slots.map((slot) => slot.group))];
  for (const group of groups) {
    const groupMembers = getMembersInGroup(party, group);
    const classSet = new Set(groupMembers.map((member) => getClassIdentity(member)));
    if (classSet.size !== groupMembers.length) {
      return "같은 파티 안에 같은 직업이 중복됩니다.";
    }
  }

  return null;
}

function validateManualSwap(groups, fromRef, toRef) {
  if (!fromRef || !toRef) return "이동할 캐릭터 정보가 없습니다.";
  if (fromRef.raidKey !== toRef.raidKey) return "다른 레이드로는 이동할 수 없습니다.";
  if (fromRef.partyId === toRef.partyId && fromRef.slotIndex === toRef.slotIndex) {
    return "같은 위치로는 이동할 수 없습니다.";
  }

  const from = findSlotByDragRef(groups, fromRef);
  const to = findSlotByDragRef(groups, toRef);
  if (!from || !to) return "이동할 위치를 찾을 수 없습니다.";
  if (!from.slot.member) return "빈칸은 드래그할 수 없습니다.";
  if (from.slot.role !== to.slot.role) return "DPS 슬롯과 SUPPORT 슬롯은 서로 이동할 수 없습니다.";

  return null;
}

function validateAllManualGroups(groups, raidPreferences = {}) {
  const errors = [];

  for (const group of groups) {
    for (const [partyIndex, party] of group.parties.entries()) {
      const members = getPartyMembers(party);
      const ownerSet = new Set(members.map((member) => member.owner));
      if (ownerSet.size !== members.length) {
        errors.push(`${group.raid.name} ${group.raid.partySize === 8 ? "공대" : "파티"} ${partyIndex + 1}: 같은 사람이 중복됩니다.`);
      }

      for (const member of members) {
        const canEnter = canCharacterEnterRaid(member, group.raid, raidPreferences);

        if (!canEnter) {
          errors.push(`${group.raid.name}: ${member.name} 레벨이 맞지 않습니다.`);
        }
      }

      const slotGroups = [...new Set(party.slots.map((slot) => slot.group))];
      for (const slotGroup of slotGroups) {
        const groupMembers = getMembersInGroup(party, slotGroup);
        const classSet = new Set(groupMembers.map((member) => getClassIdentity(member)));
        if (classSet.size !== groupMembers.length) {
          errors.push(`${group.raid.name} ${group.raid.partySize === 8 ? `${partyIndex + 1}공대 ${slotGroup === "A" ? "1파티" : "2파티"}` : `${partyIndex + 1}파티`}: 같은 직업이 중복됩니다.`);
        }
      }
    }
  }

  return errors;
}

function applyManualSwapsToGroups(groups, manualSwaps) {
  const clonedGroups = cloneScheduleGroups(groups);

  for (const swap of manualSwaps) {
    const from = findSlotByDragRef(clonedGroups, swap.from);
    const to = findSlotByDragRef(clonedGroups, swap.to);
    if (!from || !to || !from.slot.member) continue;

    const movingMember = from.slot.member;
    const targetMember = to.slot.member ?? null;

    
    from.slot.member = targetMember;
    to.slot.member = movingMember;

    rebuildSynergyCounts(from.party);
    rebuildSynergyCounts(to.party);
  }

  return clonedGroups;
}

function getMembersInGroup(party, group) {
  return party.slots
    .filter((slot) => slot.group === group && slot.member)
    .map((slot) => slot.member);
}

function canPutMemberInSlotGroup(party, character, role, group) {
  const partyMembers = getPartyMembers(party);
  const groupMembers = getMembersInGroup(party, group);

  if (partyMembers.some((member) => member.owner === character.owner)) return false;

  if (groupMembers.some((member) => getClassIdentity(member) === getClassIdentity(character))) {
    return false;
  }

  return party.slots.some(
    (slot) => !slot.member && slot.role === role && slot.group === group
  );
}

function canPutMemberInParty(party, character, role) {
  const groups = [...new Set(party.slots.map((slot) => slot.group))];
  return groups.some((group) => canPutMemberInSlotGroup(party, character, role, group));
}

function putMemberInParty(party, character, role) {
  const groups = [...new Set(party.slots.map((slot) => slot.group))]
    .map((group) => ({
      group,
      filled: getMembersInGroup(party, group).length,
    }))
    .sort((a, b) => b.filled - a.filled);

  for (const { group } of groups) {
    if (!canPutMemberInSlotGroup(party, character, role, group)) continue;

    const slotIndex = party.slots.findIndex(
      (slot) => !slot.member && slot.role === role && slot.group === group
    );
    if (slotIndex === -1) continue;

    party.slots[slotIndex].member = character;
    rebuildSynergyCounts(party);
    return true;
  }

  return false;
}

function getFullnessScore(party) {
  const filled = getPartyMembers(party).length;
  const empty = party.slots.length - filled;
  return filled * 1000 - empty * 100;
}

function isPartyValidByOwnerAndClass(party) {
  const members = getPartyMembers(party);
  const ownerSet = new Set(members.map((member) => member.owner));
  if (ownerSet.size !== members.length) return false;

  const groups = [...new Set(party.slots.map((slot) => slot.group))];
  for (const group of groups) {
    const groupMembers = getMembersInGroup(party, group);
    const classSet = new Set(groupMembers.map((member) => getClassIdentity(member)));
    if (classSet.size !== groupMembers.length) return false;
  }

  return true;
}

function canPutMemberInExactSlot(party, character, slot) {
  const role = getClassMeta(character).role === "SUPPORT" ? "SUPPORT" : "DPS";
  if (role !== slot.role) return false;

  const partyMembers = getPartyMembers(party).filter(
    (member) => getCharacterId(member) !== getCharacterId(character)
  );
  const groupMembers = party.slots
    .filter((item) => item.group === slot.group && item.member)
    .map((item) => item.member)
    .filter((member) => getCharacterId(member) !== getCharacterId(character));

  if (partyMembers.some((member) => member.owner === character.owner)) return false;
  if (groupMembers.some((member) => getClassIdentity(member) === getClassIdentity(character))) {
    return false;
  }

  return true;
}

function getSynergyOverlapPenaltyForSlot(party, character, slot) {
  const groupMembers = getMembersInGroup(party, slot.group);
  const groupSynergyCounts = groupMembers.reduce((acc, member) => {
    const meta = getClassMeta(member);
    for (const synergy of meta.synergies ?? []) {
      if (synergy === "서폿") continue;
      acc[synergy] = (acc[synergy] ?? 0) + 1;
    }
    return acc;
  }, {});

  const meta = getClassMeta(character);
  return (meta.synergies ?? []).reduce((sum, synergy) => {
    if (synergy === "서폿") return sum;
    return sum + (groupSynergyCounts[synergy] ?? 0) * 550;
  }, 0);
}

function getMoveScore(targetParty, character, targetSlot) {
  const members = getPartyMembers(targetParty);
  const nextSummary = summarizeParty([...members, character]);
  const currentSummary = summarizeParty(members);
  const avgPenalty = members.length
    ? Math.abs(nextSummary.avgPower - currentSummary.avgPower) * 0.3
    : 0;

  return getSynergyOverlapPenaltyForSlot(targetParty, character, targetSlot) + avgPenalty;
}

function tryResolveOwnerConflictByMovingDps(targetParty, targetSlot, sourceParty, sourceSlot) {
  const supportMember = sourceSlot.member;
  if (!supportMember) return false;
  if (targetSlot.role !== "SUPPORT") return false;
  if (sourceSlot.role !== "SUPPORT") return false;

  const conflictSlot = targetParty.slots.find(
    (slot) =>
      slot.member &&
      slot.member.owner === supportMember.owner &&
      slot.role === "DPS"
  );

  if (!conflictSlot) return false;

  const conflictMember = conflictSlot.member;

  const originalTargetMember = targetSlot.member;
  const originalSourceSupport = sourceSlot.member;
  const originalConflictMember = conflictSlot.member;

  sourceSlot.member = null;
  conflictSlot.member = null;
  rebuildSynergyCounts(targetParty);
  rebuildSynergyCounts(sourceParty);

  const sourceDpsCandidates = sourceParty.slots
    .filter((slot) => {
      if (slot.member) return false;
      if (slot.role !== "DPS") return false;
      return canPutMemberInExactSlot(sourceParty, conflictMember, slot);
    })
    .map((slot) => ({
      slot,
      score: getMoveScore(sourceParty, conflictMember, slot),
    }))
    .sort((a, b) => a.score - b.score);

  if (!sourceDpsCandidates.length) {
    sourceSlot.member = originalSourceSupport;
    conflictSlot.member = originalConflictMember;
    targetSlot.member = originalTargetMember;
    rebuildSynergyCounts(targetParty);
    rebuildSynergyCounts(sourceParty);
    return false;
  }

  const sourceDpsSlot = sourceDpsCandidates[0].slot;
  const originalSourceDpsMember = sourceDpsSlot.member;

  targetSlot.member = supportMember;
  sourceDpsSlot.member = conflictMember;

  rebuildSynergyCounts(targetParty);
  rebuildSynergyCounts(sourceParty);

  const valid =
    isPartyValidByOwnerAndClass(targetParty) &&
    isPartyValidByOwnerAndClass(sourceParty);

  if (valid) return true;

  targetSlot.member = originalTargetMember;
  sourceSlot.member = originalSourceSupport;
  conflictSlot.member = originalConflictMember;
  sourceDpsSlot.member = originalSourceDpsMember;
  rebuildSynergyCounts(targetParty);
  rebuildSynergyCounts(sourceParty);
  return false;
}

function tryOneStepSwapForward(raidGroup, targetParty, targetSlot, targetIndex) {
  const candidates = [];

  for (let sourceIndex = targetIndex + 1; sourceIndex < raidGroup.parties.length; sourceIndex += 1) {
    const sourceParty = raidGroup.parties[sourceIndex];

    for (const sourceSlot of sourceParty.slots) {
      const sourceMember = sourceSlot.member;
      if (!sourceMember) continue;
      if (sourceSlot.role !== targetSlot.role) continue;

      for (let helperIndex = 0; helperIndex <= targetIndex; helperIndex += 1) {
        const helperParty = raidGroup.parties[helperIndex];

        for (const helperSlot of helperParty.slots) {
          const helperMember = helperSlot.member;
          if (!helperMember) continue;
          if (helperSlot.role !== targetSlot.role) continue;

          candidates.push({
            sourceParty,
            sourceSlot,
            sourceMember,
            helperParty,
            helperSlot,
            helperMember,
            score:
              getMoveScore(targetParty, helperMember, targetSlot) +
              getMoveScore(helperParty, sourceMember, helperSlot),
          });
        }
      }
    }
  }

  candidates.sort((a, b) => a.score - b.score);

  for (const candidate of candidates) {
    const {
      sourceParty,
      sourceSlot,
      sourceMember,
      helperParty,
      helperSlot,
      helperMember,
    } = candidate;

    const originalTargetMember = targetSlot.member;
    const originalHelperMember = helperSlot.member;
    const originalSourceMember = sourceSlot.member;

    targetSlot.member = helperMember;
    helperSlot.member = sourceMember;
    sourceSlot.member = null;

    rebuildSynergyCounts(targetParty);
    rebuildSynergyCounts(helperParty);
    rebuildSynergyCounts(sourceParty);

    const valid =
      isPartyValidByOwnerAndClass(targetParty) &&
      isPartyValidByOwnerAndClass(helperParty) &&
      isPartyValidByOwnerAndClass(sourceParty);

    if (valid) return true;

    targetSlot.member = originalTargetMember;
    helperSlot.member = originalHelperMember;
    sourceSlot.member = originalSourceMember;
    rebuildSynergyCounts(targetParty);
    rebuildSynergyCounts(helperParty);
    rebuildSynergyCounts(sourceParty);
  }

  return false;
}

function pullForwardToFillEmptySlots(raidGroup) {
  const rolesInOrder = ["SUPPORT", "DPS"];

  for (const roleToFill of rolesInOrder) {
    for (let targetIndex = 0; targetIndex < raidGroup.parties.length; targetIndex += 1) {
      const targetParty = raidGroup.parties[targetIndex];

      for (const targetSlot of targetParty.slots) {
        if (targetSlot.member) continue;
        if (targetSlot.role !== roleToFill) continue;

        let filled = false;

        for (let sourceIndex = targetIndex + 1; sourceIndex < raidGroup.parties.length; sourceIndex += 1) {
          const sourceParty = raidGroup.parties[sourceIndex];

          const movableCandidates = sourceParty.slots
            .filter((sourceSlot) => {
              if (!sourceSlot.member) return false;
              if (sourceSlot.role !== targetSlot.role) return false;
              return canPutMemberInSlotGroup(
                targetParty,
                sourceSlot.member,
                targetSlot.role,
                targetSlot.group
              );
            })
            .map((sourceSlot) => ({
              sourceSlot,
              score: getMoveScore(targetParty, sourceSlot.member, targetSlot),
            }))
            .sort((a, b) => a.score - b.score);

          if (!movableCandidates.length) {
            if (targetSlot.role === "SUPPORT") {
              const supportConflictCandidates = sourceParty.slots.filter(
                (sourceSlot) =>
                  sourceSlot.member &&
                  sourceSlot.role === "SUPPORT" &&
                  sourceSlot.member.owner &&
                  getPartyMembers(targetParty).some(
                    (member) => member.owner === sourceSlot.member.owner
                  )
              );

              const resolved = supportConflictCandidates.some((sourceSlot) =>
                tryResolveOwnerConflictByMovingDps(targetParty, targetSlot, sourceParty, sourceSlot)
              );

              if (resolved) {
                filled = true;
                break;
              }
            }

            continue;
          }

          const movableSlot = movableCandidates[0].sourceSlot;
          const originalTargetMember = targetSlot.member;
          const originalSourceMember = movableSlot.member;

          targetSlot.member = movableSlot.member;
          movableSlot.member = null;
          rebuildSynergyCounts(targetParty);
          rebuildSynergyCounts(sourceParty);

          if (!isPartyValidByOwnerAndClass(targetParty) || !isPartyValidByOwnerAndClass(sourceParty)) {
            targetSlot.member = originalTargetMember;
            movableSlot.member = originalSourceMember;
            rebuildSynergyCounts(targetParty);
            rebuildSynergyCounts(sourceParty);
            continue;
          }

          filled = true;
          break;
        }

        if (filled) continue;

        tryOneStepSwapForward(raidGroup, targetParty, targetSlot, targetIndex);
      }
    }
  }

  raidGroup.parties = raidGroup.parties.filter((party) => getPartyMembers(party).length > 0);

  raidGroup.parties.forEach((party, index) => {
    party.id = `${raidGroup.raid.key}-${index + 1}`;
    normalizePartySlots(party);
  });
}

function compactRaidGroup(raidGroup, targetAvgPower) {
  const members = raidGroup.parties.flatMap((party) => getPartyMembers(party));
  if (!members.length) {
    raidGroup.parties = [];
    return;
  }

  const rule = getRoleSlotRule(raidGroup.raid);

  const ownerCountMap = members.reduce((acc, member) => {
    acc[member.owner] = (acc[member.owner] ?? 0) + 1;
    return acc;
  }, {});

  const classCountMap = members.reduce((acc, member) => {
    const classKey = getClassIdentity(member);
    acc[classKey] = (acc[classKey] ?? 0) + 1;
    return acc;
  }, {});

  const hardFirstSort = (a, b) => {
    const ownerDiff = (ownerCountMap[b.owner] ?? 0) - (ownerCountMap[a.owner] ?? 0);
    if (ownerDiff !== 0) return ownerDiff;

    const classDiff =
      (classCountMap[getClassIdentity(b)] ?? 0) -
      (classCountMap[getClassIdentity(a)] ?? 0);
    if (classDiff !== 0) return classDiff;

    return getEffectivePower(b) - getEffectivePower(a);
  };

  const supports = members
    .filter((member) => getClassMeta(member).role === "SUPPORT")
    .sort(hardFirstSort);

  const dpsList = members
    .filter((member) => getClassMeta(member).role !== "SUPPORT")
    .sort(hardFirstSort);

  const minPartyCount = Math.max(
    Math.ceil(dpsList.length / Math.max(1, rule.DPS)),
    Math.ceil(supports.length / Math.max(1, rule.SUPPORT)),
    1
  );

  raidGroup.parties = Array.from({ length: minPartyCount }, (_, index) => ({
    id: `${raidGroup.raid.key}-${index + 1}`,
    raid: raidGroup.raid,
    slots: makeSlots(raidGroup.raid),
    synergyCounts: {},
  }));

  const place = (character) => {
    const role = getClassMeta(character).role === "SUPPORT" ? "SUPPORT" : "DPS";

    const candidates = raidGroup.parties
      .filter((party) => canPutMemberInParty(party, character, role))
      .map((party) => {
        const members = getPartyMembers(party);
        const filledCount = members.length;
        const emptyAfter = party.slots.length - (filledCount + 1);
        const balanceScore = scorePartyForCharacter({ party, character, targetAvgPower });

        const fullPartyBonus = emptyAfter === 0 ? -140 : emptyAfter === 1 ? -60 : 0;
        const compactBonus = filledCount * -25;

        return {
          party,
          score: balanceScore + fullPartyBonus + compactBonus,
        };
      })
      .sort((a, b) => a.score - b.score);

    if (candidates.length) {
      putMemberInParty(candidates[0].party, character, role);
      return;
    }

    const newParty = {
      id: `${raidGroup.raid.key}-${raidGroup.parties.length + 1}`,
      raid: raidGroup.raid,
      slots: makeSlots(raidGroup.raid),
      synergyCounts: {},
    };
    raidGroup.parties.push(newParty);
    putMemberInParty(newParty, character, role);
  };

  for (const support of supports) place(support);
  for (const dps of dpsList) place(dps);

  raidGroup.parties.sort((a, b) => {
    const filledDiff = getPartyMembers(b).length - getPartyMembers(a).length;
    if (filledDiff !== 0) return filledDiff;
    return summarizeParty(b).avgPower - summarizeParty(a).avgPower;
  });

  pullForwardToFillEmptySlots(raidGroup);
  normalizeRaidGroupSlots(raidGroup);
  balanceRaidDpsPower(raidGroup);
  normalizeRaidGroupSlots(raidGroup);

  raidGroup.parties.forEach((party, index) => {
    party.id = `${raidGroup.raid.key}-${index + 1}`;
    rebuildSynergyCounts(party);
  });
}

function generateSchedule({ characters: inputCharacters, selectedRaidKeys, roleOverrides, ownerToggles, raidPreferences }) {
  const safeCharacters = Array.isArray(inputCharacters) ? inputCharacters : [];
  const characters = safeCharacters.filter((character) => character && character.owner && character.name);
  const selectedRaids = getOrderedRaids().filter((raid) => selectedRaidKeys.includes(raid.key));

  const usageMap = new Map(
    characters.map((character) => [getCharacterId(character), 0])
  );

  const raidTargetPowerMap = new Map(
    selectedRaids.map((raid) => {
      const raidCharacters = characters.filter((character) =>
        isOwnerEnabledForRaid(ownerToggles, raid.key, character.owner)
      );
      const eligibleCharacters = raidCharacters
        .filter((character) => canCharacterEnterRaid(character, raid, raidPreferences))
        .map((character) => applyRoleOverrides(character, roleOverrides, raid.key));
      const eligibleDpsCharacters = eligibleCharacters.filter(
        (character) => getClassMeta(character).role !== "SUPPORT"
      );
      const avg = Math.round(
        eligibleDpsCharacters.reduce((sum, character) => sum + getEffectivePower(character), 0) /
          Math.max(1, eligibleDpsCharacters.length)
      );
      return [raid.key, avg];
    })
  );

  const groups = selectedRaids.map((raid) => ({
    raid,
    parties: [],
    targetAvgPower: raidTargetPowerMap.get(raid.key) ?? 0,
  }));

  const groupMap = new Map(groups.map((group) => [group.raid.key, group]));
  const unableCharacters = [];

  const sortedCharacters = [...characters].sort((a, b) => {
    const roleDiff = getClassMeta(a).role === "SUPPORT" ? -1 : getClassMeta(b).role === "SUPPORT" ? 1 : 0;
    if (roleDiff !== 0) return roleDiff;
    return b.level - a.level || getEffectivePower(b) - getEffectivePower(a);
  });

  for (const character of sortedCharacters) {
    const eligibleRaids = getEligibleRaids(character, selectedRaidKeys, raidPreferences).filter((raid) => {
      if (!isOwnerEnabledForRaid(ownerToggles, raid.key, character.owner)) return false;
      return true;
    });

    if (!eligibleRaids.length) {
      unableCharacters.push({ ...character, reason: "선택된 레이드 중 입장 가능한 레이드 없음" });
      continue;
    }

    const raidsToRun = eligibleRaids.slice(0, 3);

    for (const raid of raidsToRun) {
      const raidGroup = groupMap.get(raid.key);
      const raidCharacter = applyRoleOverrides(character, roleOverrides, raid.key);
      assignCharacterToRaid({
        character: raidCharacter,
        raidGroup,
        usageMap,
        targetAvgPower: raidGroup.targetAvgPower,
      });
    }
  }

  for (const group of groups) {
    compactRaidGroup(group, group.targetAvgPower);
  }

  const allParties = groups.flatMap((group) => group.parties);

  const raidSpreads = groups.map((group) => {
    const partyAverages = group.parties
      .map(getPartyDpsAvgPower)
      .filter((value) => value > 0);
    const minAvg = partyAverages.length ? Math.min(...partyAverages) : 0;
    const maxAvg = partyAverages.length ? Math.max(...partyAverages) : 0;
    return {
      raidKey: group.raid.key,
      minAvg,
      maxAvg,
      spread: maxAvg - minAvg,
    };
  });

  const maxRaidSpread = raidSpreads.length
    ? Math.max(...raidSpreads.map((item) => item.spread))
    : 0;

  const characterRuns = characters
    .map((character) => ({
      ...character,
      runCount: usageMap.get(getCharacterId(character)) ?? 0,
      eligibleRaidCount: getEligibleRaids(character, selectedRaidKeys, raidPreferences).filter((raid) => {
        if (!isOwnerEnabledForRaid(ownerToggles, raid.key, character.owner)) return false;
        return true;
      }).length,
    }))
    .sort((a, b) => a.runCount - b.runCount || b.level - a.level);

  const completedRunCharacterCount = characterRuns.filter(
    (character) => character.runCount === 3
  ).length;

  return {
    groups,
    usageMap,
    unableCharacters,
    characterRuns,
    stats: {
      characterCount: characters.length,
      partyCount: allParties.length,
      raidSpreads,
      spread: maxRaidSpread,
      emptySlotCount: allParties.reduce(
        (sum, party) => sum + party.slots.filter((slot) => !slot.member).length,
        0
      ),
      completedRunCharacterCount,
    },
  };
}

function Badge({ children, tone = "default" }) {
  const toneStyle = {
    default: {},
    good: styles.goodBadge,
    warn: styles.warnBadge,
    danger: styles.dangerBadge,
    blue: styles.blueBadge,
    purple: styles.purpleBadge,
  }[tone];

  return <span style={{ ...styles.badge, ...toneStyle }}>{children}</span>;
}

function DiscordShareButton({ onClick, disabled = false, visible = true }) {
  if (!visible) return null;

  return (
    <button
      type="button"
      data-discord-share-hidden="true"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "1px solid #2563eb",
        background: "#eff6ff",
        color: "#1d4ed8",
        padding: "3px 8px",
        borderRadius: "8px",
        fontSize: "10px",
        fontWeight: 950,
        cursor: disabled ? "wait" : "pointer",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      공유
    </button>
  );
}

function CharacterRow({
  character,
  runCount,
  slotGroup,
  raidKey,
  roleOverrides,
  onChangeValkyrieRole,
  dragRef,
  onDragStartCharacter,
  onDropCharacter,
  showRaidPreferenceControls,
  raidPreferences,
  onChangeRaidPreference,
  clearedRaidKeys = new Set(),
  assignedRaidKeys = new Set(),
  showCharacterSynergies = false,
}) {
  const meta = getClassMeta(character);
  const characterSynergies = (meta.synergies ?? []).filter((synergy) => synergy !== "서폿");

  return (
    <div
      style={{
        ...styles.charCard,
        cursor: dragRef ? "grab" : "default",
      }}
      draggable={Boolean(dragRef)}
      onDragStart={(event) => {
        if (!dragRef) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("application/json", JSON.stringify(dragRef));
        event.dataTransfer.setData("text/plain", JSON.stringify(dragRef));
        onDragStartCharacter?.(dragRef);
      }}
      onDragOver={(event) => {
        if (!dragRef) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        if (!dragRef) return;
        event.preventDefault();
        const raw =
          event.dataTransfer.getData("application/json") ||
          event.dataTransfer.getData("text/plain");
        if (!raw) return;

        try {
          const fromRef = JSON.parse(raw);
          onDropCharacter?.(fromRef, dragRef);
        } catch (error) {
          console.error("드래그 데이터 파싱 실패", error);
        }
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
        <div>
          <div style={styles.charName}>{character.name}</div>
          <div style={styles.smallText}>{character.className}</div>
          
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
          {character.className === "발키리" && raidKey && onChangeValkyrieRole ? (
            <button
              type="button"
              title="클릭하면 발키리 역할이 DPS/SUPPORT로 전환됩니다"
              onClick={() =>
                onChangeValkyrieRole(
                  raidKey,
                  character,
                  meta.role === "SUPPORT" ? "DPS" : "SUPPORT"
                )
              }
              style={{
                ...styles.badge,
                ...(meta.role === "SUPPORT" ? styles.goodBadge : styles.blueBadge),
                cursor: "pointer",
              }}
            >
              {meta.role}
            </button>
          ) : (
            <Badge tone={meta.role === "SUPPORT" ? "good" : "blue"}>{meta.role}</Badge>
          )}
        </div>
      </div>

      <div style={styles.badgeWrap}>
        <Badge>Lv.{formatLevel(character.level)}</Badge>
        <Badge tone="purple">전투력 {formatPower(character.power)}</Badge>
        {runCount !== null && runCount !== undefined && (
          <Badge tone={runCount === 3 ? "good" : "warn"}>{runCount}회</Badge>
        )}
        {showCharacterSynergies && characterSynergies.map((synergy) => (
          <Badge key={`${getCharacterId(character)}-${synergy}`} tone="purple">
            {synergy}
          </Badge>
        ))}
        {showRaidPreferenceControls && onChangeRaidPreference && (
          <div style={{ width: "100%", marginTop: "6px" }}>
            <div style={{ ...styles.smallText, fontWeight: 900, marginBottom: "4px" }}>
              레이드 클리어 상태 및 설정
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {RAID_FAMILIES.map((family) => {
                const availableRaids = getAvailableRaidsForFamily(character, family);
                const selectedRaid = getSelectedRaidForFamily(
                  character,
                  family,
                  raidPreferences ?? {}
                );
                if (availableRaids.length === 0) return null;
                const disabled = false;
                const isForced = selectedRaid
                  ? getRaidPreference(raidPreferences ?? {}, character, selectedRaid.key) === "FORCE"
                  : false;
                const isExcluded = isRaidFamilyExcluded(character, family, raidPreferences ?? {});
                const isSelectedRaidCleared = selectedRaid
                  ? clearedRaidKeys.has(selectedRaid.key)
                  : false;
                const isSelectedRaidUnassigned = selectedRaid
                  ? !assignedRaidKeys.has(selectedRaid.key)
                  : isExcluded;

                return (
                  <button
                    key={`${getCharacterId(character)}-${family.id}`}
                    type="button"
                    
                    onClick={() => onChangeRaidPreference(character, family)}
                    title={
                      disabled
                        ? `${family.label}: 갈 수 있는 난이도 없음`
                        : `${family.label}: 클릭하면 난이도 변경`
                    }
                    style={{
                      ...styles.miniButton,
                      position: "relative",
                      ...(isForced ? styles.goodBadge : {}),
                      ...(isExcluded ? styles.warnBadge : {}),
                      opacity: isSelectedRaidCleared ? 0.45 : 1,
                    }}
                  >
                    {isSelectedRaidUnassigned && (
                        <span
                          style={{
                            position: "absolute",
                            inset: "2px",
                            pointerEvents: "none",
                            opacity: 0.85,
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: 0,
                              top: "50%",
                              width: "100%",
                              height: "1.5px",
                              background: "#dc2626",
                              transform: "rotate(18deg)",
                              transformOrigin: "center",
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              left: 0,
                              top: "50%",
                              width: "100%",
                              height: "1.5px",
                              background: "#dc2626",
                              transform: "rotate(-18deg)",
                              transformOrigin: "center",
                            }}
                          />
                        </span>
                      )}
                      {getRaidFamilyButtonText(character, family, raidPreferences ?? {})}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptySlot({ role, slotGroup, dragRef, onDropCharacter }) {
  return (
    <div
      style={{
        ...styles.emptySlot,
        cursor: dragRef ? "copy" : "default",
      }}
      onDragOver={(event) => {
        if (!dragRef) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        if (!dragRef) return;
        event.preventDefault();
        const raw =
          event.dataTransfer.getData("application/json") ||
          event.dataTransfer.getData("text/plain");
        if (!raw) return;

        try {
          const fromRef = JSON.parse(raw);
          onDropCharacter?.(fromRef, dragRef);
        } catch (error) {
          console.error("드래그 데이터 파싱 실패", error);
        }
      }}
    >
      <div>공팟</div>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
        <Badge tone={role === "SUPPORT" ? "good" : "blue"}>{role}</Badge>
      </div>
    </div>
  );
}

function getOwnerColorStyle(owner) {
  const preferredOwnerColorOrder = [
    "찬범",
    "준형",
    "강찬",
    "혁준",
    "혜연",
    "준혁",
    "재진",
    "영수",
  ];

  const ownersForColor = preferredOwnerColorOrder.includes(owner)
    ? preferredOwnerColorOrder
    : [...preferredOwnerColorOrder, owner];

  const palettes = [
    { background: "#eef6ff", border: "#60a5fa", color: "#1d4ed8" },
    { background: "#f0fdf4", border: "#4ade80", color: "#15803d" },
    { background: "#fff7ed", border: "#fb923c", color: "#c2410c" },
    { background: "#f5f3ff", border: "#a78bfa", color: "#6d28d9" },
    { background: "#fdf2f8", border: "#f472b6", color: "#be185d" },
    { background: "#ecfeff", border: "#22d3ee", color: "#0e7490" },
    { background: "#fefce8", border: "#eab308", color: "#a16207" },
    { background: "#f1f5f9", border: "#94a3b8", color: "#475569" },
    { background: "#fef2f2", border: "#f87171", color: "#b91c1c" },
    { background: "#f0fdfa", border: "#2dd4bf", color: "#0f766e" },
    { background: "#eef2ff", border: "#818cf8", color: "#4338ca" },
    { background: "#faf5ff", border: "#c084fc", color: "#7e22ce" },
  ];

  const index = Math.max(0, ownersForColor.indexOf(owner));
  return palettes[index % palettes.length];
}

function CompactMember({ slot }) {
  if (!slot.member) {
    return (
      <div
        style={{
          ...styles.overviewMember,
          borderStyle: "dashed",
          background: "#f3f4f6",
          color: "#9ca3af",
          fontWeight: 900,
          textAlign: "center",
        }}
      >
        공팟
      </div>
    );
  }

  const ownerColorStyle = getOwnerColorStyle(slot.member.owner);

  return (
    <div
      style={{
        ...styles.overviewMember,
        background: ownerColorStyle.background,
        borderColor: ownerColorStyle.border,
        color: ownerColorStyle.color,
      }}
      title={`${slot.member.owner} · ${slot.member.name} · ${slot.member.className}`}
    >
      <div style={{ ...styles.overviewMemberName, color: ownerColorStyle.color }}>
        {slot.member.name}
      </div>
      <div style={{ ...styles.overviewMemberClass, color: ownerColorStyle.color }}>
        {slot.member.className}
      </div>
    </div>
  );
}

function RaidOverview({ groups, completedPartyKeys, onTogglePartyDone, onShareDiscordElement, isDiscordSharing, showDiscordShare }) {
  const orderedGroups = [...groups].sort(
    (a, b) => getRaidOrderValue(a.raid) - getRaidOrderValue(b.raid)
  );
  const overviewMembers = getGroupsMembers(orderedGroups);

  const renderOverviewGroup = (group) => (
    <div key={`overview-${group.raid.key}`} style={styles.overviewRaidCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <strong style={{ fontSize: "14px" }}>{group.raid.name}</strong>
        {Number(group.raid.clearGold ?? 0) > 0 && (
          <span
            style={{
              ...styles.badge,
              ...styles.warnBadge,
              fontWeight: 950,
              whiteSpace: "nowrap",
            }}
          >
            {formatGold(group.raid.clearGold)}G
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {group.parties.map((party, partyIndex) => {
          const partyDoneKey = getPartyDoneKey(party);
          const isDone = completedPartyKeys.includes(partyDoneKey);
          const isEightRaid = party.raid.partySize === 8;
          const slotGroups = [...new Set(party.slots.map((slot) => slot.group))];

          return (
            <div
              key={`overview-${party.id}`}
              data-discord-share-card="true"
              style={{
                ...styles.overviewPartyCard,
                opacity: isDone ? 0.45 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", minWidth: 0 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(isDone)}
                    onChange={() => onTogglePartyDone?.(partyDoneKey)}
                    style={{ width: "13px", height: "13px", cursor: "pointer", flex: "0 0 auto" }}
                  />
                  <strong style={{ fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {isEightRaid ? `공대 ${partyIndex + 1}` : `파티 ${partyIndex + 1}`}
                  </strong>
                </label>
                <div style={{ display: "flex", gap: "4px", alignItems: "center", flex: "0 0 auto" }}>
                  <DiscordShareButton
                    visible={showDiscordShare}
                    disabled={isDiscordSharing}
                    onClick={(event) =>
                      onShareDiscordElement?.(
                        event.currentTarget.closest('[data-discord-share-card="true"]'),
                        `${group.raid.name} ${isEightRaid ? `공대 ${partyIndex + 1}` : `파티 ${partyIndex + 1}`}`,
                        getPartyMembers(party)
                      )
                    }
                  />
                </div>
              </div>

              {isEightRaid ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
                  {slotGroups.map((slotGroup) => {
                    const groupSlots = party.slots.filter((slot) => slot.group === slotGroup);
                    return (
                      <div key={slotGroup}>
                        <div style={{ ...styles.smallText, fontWeight: 900, marginBottom: "4px" }}>
                          {slotGroup === "A" ? "1파티" : "2파티"}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                          {groupSlots.map((slot, slotIndex) => (
                            <CompactMember key={`${party.id}-${slotGroup}-${slotIndex}`} slot={slot} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                  {party.slots.map((slot, slotIndex) => (
                    <CompactMember key={`${party.id}-${slotIndex}`} slot={slot} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section data-discord-share-card="true" style={styles.card}>
      <div style={styles.cardPad}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginBottom: "10px", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ ...styles.sectionTitle, fontSize: "22px" }}>레이드 현황 한눈에 보기</h2>
            <p style={{ ...styles.smallText, margin: "6px 0 0" }}>
              레이드 현황을 최소 정보로 최대한 많이 보여줍니다.
            </p>
          </div>
          <DiscordShareButton
            visible={showDiscordShare}
            disabled={isDiscordSharing}
            onClick={(event) =>
              onShareDiscordElement?.(
                event.currentTarget.closest('[data-discord-share-card="true"]'),
                "레이드 현황 한눈에 보기",
                overviewMembers
              )
            }
          />
        </div>

        <div style={styles.overviewGrid}>
          {orderedGroups.map(renderOverviewGroup)}
        </div>
      </div>
    </section>
  );
}


function getPartyOwnerList(party) {
  return [...new Set(getPartyMembers(party).map((member) => member.owner))];
}

function hasOwnerOverlap(ownerListA, ownerListB) {
  const ownerSet = new Set(ownerListA);
  return ownerListB.some((owner) => ownerSet.has(owner));
}

function buildConcurrentRunPlan(groups, completedPartyKeys) {
  const fourMemberParties = [];
  const eightMemberParties = [];
  const waitingParties = [];
  const completedParties = [];

  for (const group of groups) {
    for (const [partyIndex, party] of group.parties.entries()) {
      const members = getPartyMembers(party);
      if (!members.length) continue;

      const owners = getPartyOwnerList(party);
      const item = {
        id: `${group.raid.key}-${party.id}`,
        raid: group.raid,
        party,
        partyIndex,
        owners,
        memberCount: members.length,
        slotCount: party.slots.length,
        isFull: members.length === party.slots.length,
      };

      if (completedPartyKeys.includes(getPartyDoneKey(party))) {
        completedParties.push(item);
        continue;
      }

      if (group.raid.partySize === 8) {
        if (item.memberCount >= 6) {
          eightMemberParties.push(item);
        } else {
          waitingParties.push(item);
        }
      } else {
        fourMemberParties.push(item);
      }
    }
  }

  fourMemberParties.sort(
    (a, b) =>
      b.memberCount - a.memberCount ||
      Number(b.isFull) - Number(a.isFull) ||
      getRaidOrderValue(a.raid) - getRaidOrderValue(b.raid) ||
      a.partyIndex - b.partyIndex
  );

  const candidates = [];

  for (let i = 0; i < fourMemberParties.length; i += 1) {
    for (let j = i + 1; j < fourMemberParties.length; j += 1) {
      const first = fourMemberParties[i];
      const second = fourMemberParties[j];
      if (hasOwnerOverlap(first.owners, second.owners)) continue;

      const totalMembers = first.memberCount + second.memberCount;
      const fullCount = Number(first.isFull) + Number(second.isFull);
      const differentRaidBonus = first.raid.key !== second.raid.key ? 1 : 0;
      const score = totalMembers * 10000 + fullCount * 1000 + differentRaidBonus * 100 - i - j;

      candidates.push({
        pair: [first, second],
        totalMembers,
        score,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const usedPartyIds = new Set();
  const pairs = [];

  for (const candidate of candidates) {
    const [first, second] = candidate.pair;
    if (usedPartyIds.has(first.id) || usedPartyIds.has(second.id)) continue;

    pairs.push(candidate);
    usedPartyIds.add(first.id);
    usedPartyIds.add(second.id);
  }

  const waiting = [
    ...waitingParties,
    ...fourMemberParties.filter((item) => !usedPartyIds.has(item.id)),
  ].sort(
    (a, b) =>
      b.memberCount - a.memberCount ||
      Number(b.isFull) - Number(a.isFull) ||
      getRaidOrderValue(a.raid) - getRaidOrderValue(b.raid) ||
      a.partyIndex - b.partyIndex
  );

  const completed = completedParties.sort(
    (a, b) =>
      getRaidOrderValue(a.raid) - getRaidOrderValue(b.raid) ||
      a.partyIndex - b.partyIndex
  );

  return { eightMemberParties, pairs, waiting, completed };
}

function ConcurrentRunCard({ item, completedPartyKeys, onTogglePartyDone, onShareDiscordElement, isDiscordSharing, showDiscordShare }) {
  const isEightRaid = item.raid.partySize === 8;
  const slotGroups = [...new Set(item.party.slots.map((slot) => slot.group))];
  const partyDoneKey = getPartyDoneKey(item.party);
  const isDone = completedPartyKeys?.includes(partyDoneKey);

  return (
    <div
      data-discord-share-card="true"
      style={{
        ...styles.overviewPartyCard,
        opacity: isDone ? 0.45 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", minWidth: 0 }}>
          <input
            type="checkbox"
            checked={Boolean(isDone)}
            onChange={() => onTogglePartyDone?.(partyDoneKey)}
            style={{ width: "13px", height: "13px", cursor: "pointer", flex: "0 0 auto" }}
          />
          <strong style={{ fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.raid.name} {isEightRaid ? `공대 ${item.partyIndex + 1}` : `파티 ${item.partyIndex + 1}`}
          </strong>
        </label>
        <div style={{ display: "flex", gap: "4px", alignItems: "center", flex: "0 0 auto" }}>
          <DiscordShareButton
            visible={showDiscordShare}
            disabled={isDiscordSharing}
            onClick={(event) =>
              onShareDiscordElement?.(
                event.currentTarget.closest('[data-discord-share-card="true"]'),
                `${item.raid.name} ${isEightRaid ? `공대 ${item.partyIndex + 1}` : `파티 ${item.partyIndex + 1}`}`,
                getPartyMembers(item.party)
              )
            }
          />
        </div>
      </div>

      {isEightRaid ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
          {slotGroups.map((slotGroup) => {
            const groupSlots = item.party.slots.filter((slot) => slot.group === slotGroup);
            return (
              <div key={`${item.id}-${slotGroup}`}>
                <div style={{ ...styles.smallText, fontWeight: 900, marginBottom: "4px" }}>
                  {slotGroup === "A" ? "1파티" : "2파티"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                  {groupSlots.map((slot, slotIndex) => (
                    <CompactMember key={`${item.id}-${slotGroup}-${slotIndex}`} slot={slot} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
          {item.party.slots.map((slot, slotIndex) => (
            <CompactMember key={`${item.id}-${slotIndex}`} slot={slot} />
          ))}
        </div>
      )}
    </div>
  );
}

function ConcurrentRunOverview({ groups, completedPartyKeys, onTogglePartyDone, onShareDiscordElement, isDiscordSharing, showDiscordShare }) {
  const plan = buildConcurrentRunPlan(groups, completedPartyKeys);
  const concurrentMembers = getGroupsMembers(groups);

  const toggleRunDone = (items) => {
    const keys = items.map((item) => getPartyDoneKey(item.party));
    const isAllDone = keys.every((key) => completedPartyKeys.includes(key));

    for (const key of keys) {
      const isDone = completedPartyKeys.includes(key);
      if ((isAllDone && isDone) || (!isAllDone && !isDone)) {
        onTogglePartyDone?.(key);
      }
    }
  };

  return (
    <section data-discord-share-card="true" style={styles.card}>
      <div style={styles.cardPad}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginBottom: "10px", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ ...styles.sectionTitle, fontSize: "22px" }}>동시 진행 보기</h2>
            <p style={{ ...styles.smallText, margin: "6px 0 0" }}>
              완료되지 않은 4인 파티 중 유저가 겹치지 않는 조합을 묶어서 보여줍니다.
            </p>
          </div>
          <DiscordShareButton
            visible={showDiscordShare}
            disabled={isDiscordSharing}
            onClick={(event) =>
              onShareDiscordElement?.(
                event.currentTarget.closest('[data-discord-share-card="true"]'),
                "동시 진행 보기",
                concurrentMembers
              )
            }
          />
        </div>

        {plan.eightMemberParties.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <div style={styles.overviewGrid}>
              {plan.eightMemberParties.map((item) => (
                <ConcurrentRunCard key={`eight-${item.id}`} item={item} completedPartyKeys={completedPartyKeys} onTogglePartyDone={onTogglePartyDone} onShareDiscordElement={onShareDiscordElement} isDiscordSharing={isDiscordSharing} showDiscordShare={showDiscordShare} />
              ))}
            </div>
          </div>
        )}

        <div style={styles.overviewGrid}>
          {plan.pairs.map((pairItem, index) => {
            const pairKeys = pairItem.pair.map((item) => getPartyDoneKey(item.party));
            const isAllDone = pairKeys.every((key) => completedPartyKeys.includes(key));

            return (
              <div key={`pair-${pairItem.pair[0].id}-${pairItem.pair[1].id}`} data-discord-share-card="true" style={styles.overviewRaidCard}>
                <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isAllDone}
                      onChange={() => toggleRunDone(pairItem.pair)}
                      style={{ width: "13px", height: "13px", cursor: "pointer", flex: "0 0 auto" }}
                    />
                    <strong style={{ fontSize: "11px" }}>{index + 1}번 동시 출발</strong>
                  </label>
                  <DiscordShareButton
                    visible={showDiscordShare}
                    disabled={isDiscordSharing}
                    onClick={(event) =>
                      onShareDiscordElement?.(
                        event.currentTarget.closest('[data-discord-share-card="true"]'),
                        `${index + 1}번 동시 출발`,
                        getConcurrentItemsMembers(pairItem.pair)
                      )
                    }
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
                  {pairItem.pair.map((item) => (
                    <ConcurrentRunCard key={`pair-card-${item.id}`} item={item} completedPartyKeys={completedPartyKeys} onTogglePartyDone={onTogglePartyDone} onShareDiscordElement={onShareDiscordElement} isDiscordSharing={isDiscordSharing} showDiscordShare={showDiscordShare} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {(plan.waiting.length > 0 || plan.completed.length > 0) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))",
              gap: "10px",
              marginTop: "10px",
              alignItems: "start",
            }}
          >
            <div style={styles.overviewRaidCard}>
              <div style={{ marginBottom: "8px" }}>
                <strong style={{ fontSize: "11px" }}>대기 필요</strong>
              </div>
              {plan.waiting.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: "8px" }}>
                  {plan.waiting.map((item) => (
                    <ConcurrentRunCard key={`waiting-${item.id}`} item={item} completedPartyKeys={completedPartyKeys} onTogglePartyDone={onTogglePartyDone} onShareDiscordElement={onShareDiscordElement} isDiscordSharing={isDiscordSharing} showDiscordShare={showDiscordShare} />
                  ))}
                </div>
              ) : (
                <div style={styles.issue}>대기 필요 파티가 없습니다.</div>
              )}
            </div>

            <div style={styles.overviewRaidCard}>
              <div style={{ marginBottom: "8px" }}>
                <strong style={{ fontSize: "11px" }}>클리어 완료</strong>
              </div>
              {plan.completed.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: "8px" }}>
                  {plan.completed.map((item) => (
                    <ConcurrentRunCard key={`completed-${item.id}`} item={item} completedPartyKeys={completedPartyKeys} onTogglePartyDone={onTogglePartyDone} onShareDiscordElement={onShareDiscordElement} isDiscordSharing={isDiscordSharing} showDiscordShare={showDiscordShare} />
                  ))}
                </div>
              ) : (
                <div style={styles.issue}>클리어 완료 파티가 없거나 숨김 처리되었습니다.</div>
              )}
            </div>
          </div>
        )}

        {plan.eightMemberParties.length === 0 && plan.pairs.length === 0 && plan.waiting.length === 0 && plan.completed.length === 0 && (
          <div style={styles.issue}>진행할 미완료 파티가 없습니다.</div>
        )}
      </div>
    </section>
  );
}

function buildClearGoldRankings(groups, completedPartyKeys) {
  const ownerMap = new Map();

  for (const group of groups) {
    const clearGold = Number(group.raid.clearGold ?? 0);
    if (!Number.isFinite(clearGold) || clearGold <= 0) continue;

    for (const party of group.parties) {
      const isDone = completedPartyKeys.includes(getPartyDoneKey(party));

      for (const member of getPartyMembers(party)) {
        const owner = member.owner || "미지정";
        if (!ownerMap.has(owner)) {
          ownerMap.set(owner, {
            owner,
            clearedGold: 0,
            totalGold: 0,
            clearedCount: 0,
            totalCount: 0,
          });
        }

        const item = ownerMap.get(owner);
        item.totalGold += clearGold;
        item.totalCount += 1;

        if (isDone) {
          item.clearedGold += clearGold;
          item.clearedCount += 1;
        }
      }
    }
  }

  return [...ownerMap.values()].sort(
    (a, b) =>
      b.totalGold - a.totalGold ||
      b.clearedGold - a.clearedGold ||
      a.owner.localeCompare(b.owner, "ko")
  );
}

function ClearGoldRanking({ groups, completedPartyKeys }) {
  const rankings = buildClearGoldRankings(groups, completedPartyKeys);

  return (
    <div style={styles.card}>
      <div style={styles.cardPad}>
        <h2 style={{ ...styles.sectionTitle, fontSize: "22px" }}>클골 순위</h2>
        <p style={{ ...styles.smallText, marginTop: "4px" }}>
          현재 Planner에 편성된 파티의 클리어 골드 기준입니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
          {rankings.length ? (
            rankings.map((item, index) => (
              <div
                key={item.owner}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "9px 10px",
                  background: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  alignItems: "center",
                  minWidth: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(index < 3 ? styles.warnBadge : styles.purpleBadge),
                      fontWeight: 950,
                      minWidth: "32px",
                      justifyContent: "center",
                    }}
                  >
                    {index + 1}위
                  </span>
                  <div
                    style={{
                      fontWeight: 950,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.owner}
                  </div>
                </div>

                <div style={{ fontWeight: 950, whiteSpace: "nowrap", color: "#92400e" }}>
                  {formatGold(item.clearedGold) || "0"} / {formatGold(item.totalGold) || "0"}골드
                </div>
              </div>
            ))
          ) : (
            <div style={styles.issue}>표시할 클리어 골드가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuctionCalculator() {
  const [itemPriceInput, setItemPriceInput] = useState("0");
  const [partySize, setPartySize] = useState(4);

  const parseGoldInput = (value) => Number(String(value ?? "").replace(/[^0-9]/g, "") || 0);
  const formatGoldInput = (value) => {
    const number = parseGoldInput(value);
    return number ? number.toLocaleString("ko-KR") : "0";
  };

  const price = parseGoldInput(itemPriceInput);
  const members = Number(partySize || 4);
  const afterFeePrice = Math.floor(price * 0.95);
  const distributionBidPrice = members > 1 ? Math.floor((afterFeePrice * (members - 1)) / members) : 0;
  const distributionMyGold = Math.max(0, afterFeePrice - distributionBidPrice);
  const distributionOtherGold = members > 1 ? Math.floor(distributionBidPrice / (members - 1)) : 0;
  const preemptBidPrice = distributionBidPrice > 0 ? Math.floor(distributionBidPrice / 1.1) : 0;
  const preemptMyGold = Math.max(0, afterFeePrice - preemptBidPrice);
  const preemptOtherGold = members > 1 ? Math.floor(preemptBidPrice / (members - 1)) : 0;

  const numberInputStyle = {
    ...styles.miniInput,
    width: "140px",
    textAlign: "right",
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardPad}>
        <h2 style={{ ...styles.sectionTitle, fontSize: "22px" }}>경매 계산기</h2>
        <p style={{ ...styles.smallText, marginTop: "4px" }}>
          판매 수수료 5% 기준으로 분배 입찰가와 선점 입찰가를 계산합니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <span style={{ ...styles.smallText, fontWeight: 900 }}>물품 가격</span>
            <input
              type="text"
              inputMode="numeric"
              value={itemPriceInput}
              onChange={(event) => setItemPriceInput(formatGoldInput(event.target.value))}
              placeholder="0"
              style={numberInputStyle}
            />
            <span style={styles.smallText}>골드</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <span style={{ ...styles.smallText, fontWeight: 900 }}>인원</span>
            <button
              type="button"
              onClick={() => setPartySize(4)}
              style={partySize === 4 ? styles.miniActiveButton : styles.miniButton}
            >
              4인
            </button>
            <button
              type="button"
              onClick={() => setPartySize(8)}
              style={partySize === 8 ? styles.miniActiveButton : styles.miniButton}
            >
              8인
            </button>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "10px",
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ ...styles.smallText, fontWeight: 900 }}>분배 입찰가</span>
              <strong style={{ color: "#92400e" }}>{formatGold(distributionBidPrice) || "0"}골드</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ ...styles.smallText, fontWeight: 900 }}>내가 먹는 골드</span>
              <strong>{formatGold(distributionMyGold) || "0"}골드</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ ...styles.smallText, fontWeight: 900 }}>남이 먹는 골드</span>
              <strong>{formatGold(distributionOtherGold) || "0"}골드</strong>
            </div>
            <div style={{ height: "1px", background: "#e5e7eb", margin: "3px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ ...styles.smallText, fontWeight: 900 }}>선점 입찰가</span>
              <strong style={{ color: "#1d4ed8" }}>{formatGold(preemptBidPrice) || "0"}골드</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ ...styles.smallText, fontWeight: 900 }}>내가 먹는 골드</span>
              <strong>{formatGold(preemptMyGold) || "0"}골드</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ ...styles.smallText, fontWeight: 900 }}>남이 먹는 골드</span>
              <strong>{formatGold(preemptOtherGold) || "0"}골드</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CpmCalculator() {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [usageCount, setUsageCount] = useState(0);

  const totalSeconds = Math.max(0, Number(minutes || 0) * 60 + Number(seconds || 0));
  const safeUsageCount = Math.max(0, Number(usageCount || 0));
  const cpm = totalSeconds > 0 ? safeUsageCount / (totalSeconds / 60) : 0;
  const secondsPerUse = safeUsageCount > 0 ? totalSeconds / safeUsageCount : 0;

  const numberInputStyle = {
    ...styles.miniInput,
    width: "72px",
    textAlign: "right",
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardPad}>
        <h2 style={{ ...styles.sectionTitle, fontSize: "22px" }}>CPM 계산기</h2>
        <p style={{ ...styles.smallText, marginTop: "4px" }}>
          클리어 시간과 사용횟수 기준으로 1분당 사용횟수를 계산합니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <span style={{ ...styles.smallText, fontWeight: 900 }}>클리어 시간</span>
            <input
              type="number"
              min="0"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              style={numberInputStyle}
            />
            <span style={styles.smallText}>분</span>
            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(event) => setSeconds(event.target.value)}
              style={numberInputStyle}
            />
            <span style={styles.smallText}>초</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <span style={{ ...styles.smallText, fontWeight: 900 }}>사용횟수</span>
            <input
              type="number"
              min="0"
              value={usageCount}
              onChange={(event) => setUsageCount(event.target.value)}
              style={numberInputStyle}
            />
            <span style={styles.smallText}>번</span>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "10px",
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ ...styles.smallText, fontWeight: 900 }}>CPM</span>
              <strong>{formatNumber(cpm, 2)}회/분</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ ...styles.smallText, fontWeight: 900 }}>1회당 시간</span>
              <strong>{formatNumber(secondsPerUse, 2)}초</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartyCard({
  party,
  index,
  roleOverrides,
  onChangeValkyrieRole,
  onDragStartCharacter,
  onDropCharacter,
  completedPartyKeys,
  onTogglePartyDone,
  isNarrowScreen = false,
  onShareDiscordElement,
  isDiscordSharing,
  showDiscordShare = false,
}) {
  const summary = summarizeParty(party);
  const members = getPartyMembers(party);
  const slotGroups = [...new Set(party.slots.map((slot) => slot.group))];
  const ownerDuplicated = new Set(members.map((member) => member.owner)).size !== members.length;
  const classDuplicated = slotGroups.some((group) => {
    const groupMembers = getMembersInGroup(party, group);
    return new Set(groupMembers.map((member) => getClassIdentity(member))).size !== groupMembers.length;
  });
  const emptyCount = party.slots.filter((slot) => !slot.member).length;
  const roleRule = getRoleSlotRule(party.raid);
  const hasIssue = ownerDuplicated || classDuplicated || emptyCount > 0;
  const isEightRaid = party.raid.partySize === 8;
  const partyDoneKey = getPartyDoneKey(party);
  const isDone = completedPartyKeys?.includes(partyDoneKey);

  const renderSlots = (slots, forceTwoColumns = false) => (
    <div style={forceTwoColumns ? styles.raidSubPartyMemberGrid : styles.memberGrid}> 
      {slots.map((slot, slotIndex) => {
        const actualSlotIndex = party.slots.indexOf(slot);

        return slot.member ? (
          <CharacterRow
            key={`${getCharacterId(slot.member)}-${slot.group}-${actualSlotIndex}`}
            character={slot.member}
            runCount={null}
            slotGroup={isEightRaid ? (slot.group === "A" ? "1" : "2") : null}
            raidKey={party.raid.key}
            roleOverrides={roleOverrides}
            onChangeValkyrieRole={onChangeValkyrieRole}
            dragRef={{
              raidKey: party.raid.key,
              raid: party.raid,
              partyId: party.id,
              slotIndex: actualSlotIndex,
            }}
            onDragStartCharacter={onDragStartCharacter}
            onDropCharacter={onDropCharacter}
            showCharacterSynergies
          />
        ) : (
          <EmptySlot
            key={`empty-${party.id}-${slot.group}-${actualSlotIndex}`}
            role={slot.role}
            slotGroup={isEightRaid ? (slot.group === "A" ? "1" : "2") : null}
            dragRef={{
              raidKey: party.raid.key,
              raid: party.raid,
              partyId: party.id,
              slotIndex: actualSlotIndex,
            }}
            onDropCharacter={onDropCharacter}
          />
        );
      })}
    </div>
  );

  return (
    <div
      data-discord-share-card="true"
      style={{
        ...styles.card,
        opacity: isDone ? 0.48 : 1,
        filter: isDone ? "grayscale(0.12)" : "none",
      }}
    >
      <div style={styles.partyHeader}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={Boolean(isDone)}
                  onChange={() => onTogglePartyDone?.(partyDoneKey)}
                  style={{ width: "14px", height: "14px", cursor: "pointer" }}
                />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 900 }}>
                  {isEightRaid ? `공대 ${index + 1}` : `파티 ${index + 1}`}
                </h3>
              </label>
            </div>
            <div style={{ ...styles.smallText, marginTop: "6px" }}>
              평균 전투력 {summary.avgPower}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", flexWrap: "wrap" }}>
            {!isEightRaid && <SynergyBadges synergyCounts={summary.synergyCounts} />}
            <DiscordShareButton
              visible={showDiscordShare}
              disabled={isDiscordSharing}
              onClick={(event) =>
                onShareDiscordElement?.(
                  event.currentTarget.closest('[data-discord-share-card="true"]'),
                  `${party.raid.name} ${isEightRaid ? `공대 ${index + 1}` : `파티 ${index + 1}`}`,
                  getPartyMembers(party)
                )
              }
            />
          </div>
        </div>
      </div>

      {isEightRaid ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(520px, 100%), 1fr))", gap: "14px", padding: isNarrowScreen ? "8px" : "16px" }}>
          {slotGroups.map((group) => {
            const groupSlots = party.slots.filter((slot) => slot.group === group);
            const groupMembers = getMembersInGroup(party, group);
            const groupSummary = summarizeParty(groupMembers);

            return (
              <div key={group} style={{ border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", background: "#ffffff" }}>
                <div style={{ padding: "12px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <strong>{group === "A" ? "1파티" : "2파티"}</strong>
                      <div style={{ ...styles.smallText, marginTop: "6px" }}>
                        평균 전투력 {groupSummary.avgPower}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                      <SynergyBadges synergyCounts={groupSummary.synergyCounts} />
                    </div>
                  </div>
                </div>
                {renderSlots(groupSlots, true)}
              </div>
            );
          })}
        </div>
      ) : (
        renderSlots(party.slots, false)
      )}
    </div>
  );
}

export default function LostArkRaidPartyPlanner() {
  const orderedRaids = useMemo(() => getOrderedRaids(), []);
  const [characters, setCharacters] = useState([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);
  const [characterLoadError, setCharacterLoadError] = useState("");
  const [isRefreshingCharacters, setIsRefreshingCharacters] = useState(false);
  const hasInitializedOwnerFiltersRef = useRef(false);
  const owners = useMemo(
    () => {
      const list = [...new Set(characters.map((character) => character.owner))];
      return list.sort((a, b) => {
        if (a === "영수") return -1;
        if (b === "영수") return 1;
        return 0;
      });
    },
    [characters]
  );
  const [query, setQuery] = useState("");
  const [selectedRaidKeys] = useState(orderedRaids.map((raid) => raid.key));
  const [activeRaidFilters, setActiveRaidFilters] = useState(orderedRaids.map((raid) => raid.key));
  const [hideClearedRaids, setHideClearedRaids] = useState(false);
  const [activeOwnerFilters, setActiveOwnerFilters] = useState([]);
  const [roleOverrides, setRoleOverrides] = useState({});
  const [ownerToggles, setOwnerToggles] = useState({});
  const [raidPreferences, setRaidPreferences] = useState({});
  const [manualSwaps, setManualSwaps] = useState([]);
  const [confirmedManualSwaps, setConfirmedManualSwaps] = useState([]);
  const [draggingRef, setDraggingRef] = useState(null);
  const [manualSwapMessage, setManualSwapMessage] = useState("");
  const [manualEditPending, setManualEditPending] = useState(false);
  const [completedPartyKeys, setCompletedPartyKeys] = useState([]);
  const [savedScheduleGroups, setSavedScheduleGroups] = useState(null);
  const [showRaidOverview, setShowRaidOverview] = useState(false);
  const [showConcurrentRunOverview, setShowConcurrentRunOverview] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [raidEditOpenMap, setRaidEditOpenMap] = useState({});
  const [partySearch, setPartySearch] = useState("");
  const [isNarrowScreen, setIsNarrowScreen] = useState(() => window.innerWidth < 900);
  const [savedScheduleGroupsBeforePending, setSavedScheduleGroupsBeforePending] = useState(null);
  const [lastSyncedSavedScheduleGroups, setLastSyncedSavedScheduleGroups] = useState(null);
  const [seed, setSeed] = useState(0);
  const [sharedSyncEnabled, setSharedSyncEnabled] = useState(true);
  const [sharedSyncStatus, setSharedSyncStatus] = useState(
    SHEET_STATE_API_URL ? "공유 동기화 준비됨" : "공유 URL 미설정"
  );
  const [sharedInitialLoading, setSharedInitialLoading] = useState(Boolean(SHEET_STATE_API_URL));
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [presetStatus, setPresetStatus] = useState("");
  const [presetValidationMessages, setPresetValidationMessages] = useState([]);
  const [isPresetBusy, setIsPresetBusy] = useState(false);
  const hasLoadedSharedStateRef = useRef(false);
  const isApplyingSharedStateRef = useRef(false);
  const lastSavedSharedStateRef = useRef("");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState(() => localStorage.getItem(DISCORD_WEBHOOK_STORAGE_KEY) ?? "");
  const [discordWebhookDraft, setDiscordWebhookDraft] = useState(() => localStorage.getItem(DISCORD_WEBHOOK_STORAGE_KEY) ?? "");
  const [isDiscordSharing, setIsDiscordSharing] = useState(false);

  const syncLoadedGroups = (groups) => syncGroupMembersWithCharacters(groups, characters);

  const normalizeSheetCharacter = (character) => ({
    owner: String(character.owner ?? "").trim(),
    name: String(character.name ?? "").trim(),
    className: String(character.className ?? "").trim(),
    build: String(character.build ?? "").trim(),
    level: Number(character.level ?? 0),
    power: Number(character.power ?? 0),
  });

  const loadCharacters = async () => {
    try {
      setIsLoadingCharacters(true);
      setCharacterLoadError("");

      const response = await fetch(`${SHEET_STATE_API_URL}?action=getCharacters&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result?.ok || !Array.isArray(result.characters)) {
        throw new Error(result?.error || "Characters 시트에서 캐릭터 정보를 불러오지 못했습니다.");
      }

      const loadedCharacters = result.characters
        .map(normalizeSheetCharacter)
        .filter(
          (character) =>
            character.owner &&
            character.name &&
            character.className &&
            character.build &&
            character.level > 0
        );

      if (!loadedCharacters.length) {
        throw new Error("Characters 시트에 사용할 수 있는 캐릭터가 없습니다.");
      }

      setCharacters(loadedCharacters);
    } catch (error) {
      setCharacters([]);
      setCharacterLoadError(error.message || "캐릭터 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoadingCharacters(false);
    }
  };


  const refreshCharacters = async () => {
    if (isRefreshingCharacters) return;

    try {
      setIsRefreshingCharacters(true);
      setSharedSyncStatus("캐릭터 정보를 갱신하는 중... 잠시만 기다려주세요.");

      const response = await fetch(`${SHEET_STATE_API_URL}?action=refreshCharacters&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result?.ok) {
        throw new Error(result?.error || "캐릭터 정보 갱신에 실패했습니다.");
      }

      if (Array.isArray(result.characters)) {
        const refreshedCharacters = result.characters
          .map(normalizeSheetCharacter)
          .filter(
            (character) =>
              character.owner &&
              character.name &&
              character.className &&
              character.build &&
              character.level > 0
          );

        if (refreshedCharacters.length) {
          setCharacters(refreshedCharacters);
        }
      } else {
        await loadCharacters();
      }

      const summary = result.result;
      if (summary) {
        setSharedSyncStatus(
          `캐릭터 갱신 완료 · 갱신 ${summary.updated ?? 0}명 / 유지 ${summary.skipped ?? 0}명 / 실패 ${summary.failed ?? 0}명`
        );
      } else {
        setSharedSyncStatus("캐릭터 갱신 완료");
      }
    } catch (error) {
      setSharedSyncStatus(error.message || "캐릭터 정보 갱신에 실패했습니다.");
    } finally {
      setIsRefreshingCharacters(false);
    }
  };


  const saveDiscordWebhookUrl = () => {
    const value = discordWebhookDraft.trim();

    if (!value) {
      localStorage.removeItem(DISCORD_WEBHOOK_STORAGE_KEY);
      setDiscordWebhookUrl("");
      setDiscordWebhookDraft("");
      setSharedSyncStatus("Discord Webhook URL이 삭제되었습니다.");
      return;
    }

    localStorage.setItem(DISCORD_WEBHOOK_STORAGE_KEY, value);
    setDiscordWebhookUrl(value);
    setSharedSyncStatus("Discord Webhook URL이 저장되었습니다.");
  };

  const shareDiscordElement = async (element, title, members = []) => {
    if (!discordWebhookUrl.trim()) {
      setSharedSyncStatus("Discord Webhook URL을 먼저 저장하세요.");
      return;
    }

    if (!element || isDiscordSharing) return;

    try {
      setIsDiscordSharing(true);
      setSharedSyncStatus("디스코드 이미지 공유 중...");

      const blob = await toBlob(element, {
        backgroundColor: "#ffffff",
        pixelRatio: 1,
        cacheBust: true,
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          return node.dataset.discordShareHidden !== "true";
        },
      });

      if (!blob) {
        throw new Error("이미지 생성에 실패했습니다.");
      }

      const formData = new FormData();
      formData.append("payload_json", JSON.stringify({ content: makeDiscordShareContent(title, members) }));
      formData.append("files[0]", blob, makeDiscordImageFileName(title));

      await fetch(discordWebhookUrl.trim(), {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      setSharedSyncStatus("디스코드 공유 요청 완료");
    } catch (error) {
      setSharedSyncStatus(`디스코드 공유 실패: ${error.message}`);
    } finally {
      setIsDiscordSharing(false);
    }
  };

  const getCurrentFinalGroups = () => {
    const calculatedGroups = applyManualSwapsToGroups(schedule.groups, manualSwaps);
    const hydratedSavedGroups = hydrateSavedScheduleGroups(savedScheduleGroups);
    const baseGroups = hydratedSavedGroups ??
      (isValidScheduleGroups(savedScheduleGroups) ? savedScheduleGroups : calculatedGroups);

    return syncLoadedGroups(baseGroups);
  };

  const getSharedStateSnapshot = () => ({
    version: SHARED_STATE_VERSION,
    updatedAt: new Date().toISOString(),
    roleOverrides,
    ownerToggles,
    raidPreferences,
    manualSwaps,
    confirmedManualSwaps,
    completedPartyKeys,
    savedScheduleGroups: compactScheduleGroups(getCurrentFinalGroups()),
  });

  const getPresetStateSnapshot = () => ({
    version: SHARED_STATE_VERSION,
    updatedAt: new Date().toISOString(),
    roleOverrides,
    ownerToggles,
    raidPreferences,
    savedScheduleGroups: compactScheduleGroups(getCurrentFinalGroups()),
  });

  const applySharedState = (state) => {
    if (!state || typeof state !== "object") return;

    isApplyingSharedStateRef.current = true;
    setRoleOverrides(state.roleOverrides ?? {});
    setOwnerToggles(state.ownerToggles ?? {});
    setRaidPreferences(state.raidPreferences ?? {});
    setManualSwaps(state.manualSwaps ?? []);
    setConfirmedManualSwaps(state.confirmedManualSwaps ?? []);
    setCompletedPartyKeys(state.completedPartyKeys ?? []);
    setPresetValidationMessages([]);

    const loadedSavedGroups =
      hydrateSavedScheduleGroups(state.savedScheduleGroups) ??
      (isValidScheduleGroups(state.savedScheduleGroups) ? state.savedScheduleGroups : null);
    setSavedScheduleGroups(loadedSavedGroups);
    setLastSyncedSavedScheduleGroups(loadedSavedGroups);
    setSavedScheduleGroupsBeforePending(null);

    window.setTimeout(() => {
      isApplyingSharedStateRef.current = false;
    }, 0);
  };

  const loadSharedState = async ({ silent = false } = {}) => {
    if (!SHEET_STATE_API_URL) {
      if (!silent) setSharedSyncStatus("공유 URL이 설정되지 않았습니다.");
      setSharedInitialLoading(false);
      return;
    }

    try {
      if (!silent) setSharedSyncStatus("공유 상태 불러오는 중...");
      const response = await fetch(`${SHEET_STATE_API_URL}?t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const state = result?.state ?? result;

      if (state && Object.keys(state).length > 0) {
        applySharedState(state);
        lastSavedSharedStateRef.current = JSON.stringify(state);
        setSharedSyncStatus(`공유 상태 불러옴 ${new Date().toLocaleTimeString()}`);
      } else {
        setSharedSyncStatus("저장된 공유 상태가 없습니다.");
      }

      hasLoadedSharedStateRef.current = true;
    } catch (error) {
      setSharedSyncStatus(`불러오기 실패: ${error.message}`);
    } finally {
      setSharedInitialLoading(false);
    }
  };

  const hasPendingManualChange = () => {
    return (
      manualEditPending ||
      manualSwapMessage === "교환 임시 적용됨" ||
      manualSwaps.length > confirmedManualSwaps.length ||
      Boolean(savedScheduleGroupsBeforePending)
    );
  };

  const saveSharedState = async ({ silent = false } = {}) => {
    if (hasPendingManualChange()) {
      setSharedSyncStatus("저장 전 교환 완료를 눌러 검증해야 합니다.");
      return;
    }

    const groupsToSave = getCurrentFinalGroups();
    const validationErrors = validateAllManualGroups(groupsToSave, raidPreferences);
    if (validationErrors.length > 0) {
      setSharedSyncStatus(`저장 실패: ${validationErrors[0]}`);
      return;
    }

    if (!SHEET_STATE_API_URL) {
      if (!silent) setSharedSyncStatus("공유 URL이 설정되지 않았습니다.");
      return;
    }

    const state = getSharedStateSnapshot();
    const serialized = JSON.stringify(state);

    if (serialized === lastSavedSharedStateRef.current) return;

    try {
      if (!silent) setSharedSyncStatus("공유 상태 저장 중...");
      const response = await fetch(SHEET_STATE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: serialized,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      lastSavedSharedStateRef.current = serialized;
      setLastSyncedSavedScheduleGroups(groupsToSave);
      setSavedScheduleGroupsBeforePending(null);
      setSharedSyncStatus(`공유 상태 저장됨 ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      setSharedSyncStatus(`저장 실패: ${error.message}`);
    }
  };


  const loadPresets = async ({ silent = false } = {}) => {
    if (!SHEET_STATE_API_URL) return;

    try {
      if (!silent) setPresetStatus("프리셋 목록 불러오는 중...");
      const response = await fetch(`${SHEET_STATE_API_URL}?action=listPresets&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result?.ok || !Array.isArray(result.presets)) {
        throw new Error(result?.error || "프리셋 목록을 불러오지 못했습니다.");
      }

      setPresets(result.presets);
      if (!silent) setPresetStatus(`프리셋 ${result.presets.length}개 불러옴`);
    } catch (error) {
      setPresetStatus(error.message || "프리셋 목록을 불러오지 못했습니다.");
    }
  };

  const savePreset = async () => {
    const name = presetName.trim();
    if (!name) {
      setPresetStatus("프리셋 이름을 입력하세요.");
      return;
    }

    if (hasPendingManualChange()) {
      setPresetStatus("프리셋 저장 전 교환 완료를 눌러 검증해야 합니다.");
      return;
    }

    const groupsToSave = getCurrentFinalGroups();
    const validationErrors = validateAllManualGroups(groupsToSave, raidPreferences);
    if (validationErrors.length > 0) {
      setPresetStatus(`프리셋 저장 실패: ${validationErrors[0]}`);
      return;
    }

    try {
      setIsPresetBusy(true);
      setPresetStatus("프리셋 저장 중...");

      const response = await fetch(SHEET_STATE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "savePreset",
          name,
          state: getPresetStateSnapshot(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result?.ok) {
        throw new Error(result?.error || "프리셋 저장에 실패했습니다.");
      }

      setSelectedPresetId(result.preset?.id ?? selectedPresetId);
      setPresetStatus(`프리셋 저장됨: ${name}`);
      await loadPresets({ silent: true });
    } catch (error) {
      setPresetStatus(error.message || "프리셋 저장에 실패했습니다.");
    } finally {
      setIsPresetBusy(false);
    }
  };

  const loadPreset = async () => {
    if (!selectedPresetId) {
      setPresetStatus("불러올 프리셋을 선택하세요.");
      return;
    }

    try {
      setIsPresetBusy(true);
      setPresetStatus("프리셋 불러오는 중...");

      const response = await fetch(`${SHEET_STATE_API_URL}?action=getPreset&id=${encodeURIComponent(selectedPresetId)}&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result?.ok || !result.preset?.state) {
        throw new Error(result?.error || "프리셋을 불러오지 못했습니다.");
      }

      const presetState = result.preset.state;
      const presetGroups =
        hydrateSavedScheduleGroups(presetState.savedScheduleGroups) ??
        (isValidScheduleGroups(presetState.savedScheduleGroups) ? presetState.savedScheduleGroups : null);

      if (!presetGroups) {
        throw new Error("프리셋에 저장된 편성 정보를 읽을 수 없습니다.");
      }

      const reconciled = reconcilePresetGroupsWithCurrentData(
        presetGroups,
        characters,
        presetState.raidPreferences ?? {}
      );

      setRoleOverrides(presetState.roleOverrides ?? {});
      setOwnerToggles(presetState.ownerToggles ?? {});
      setRaidPreferences(reconciled.raidPreferences);
      setManualSwaps([]);
      setConfirmedManualSwaps([]);
      setManualEditPending(false);
      setManualSwapMessage("");
      setSavedScheduleGroups(reconciled.groups);
      setSavedScheduleGroupsBeforePending(null);
      setPresetValidationMessages(reconciled.warnings);
      setSharedSyncStatus("프리셋을 불러왔습니다. 저장 버튼을 누르면 공유됩니다.");
      setPresetStatus(
        reconciled.warnings.length
          ? `프리셋 불러옴 · 검증 ${reconciled.warnings.length}건`
          : "프리셋 불러옴"
      );
    } catch (error) {
      setPresetStatus(error.message || "프리셋을 불러오지 못했습니다.");
    } finally {
      setIsPresetBusy(false);
    }
  };

  const deletePreset = async () => {
    if (!selectedPresetId) {
      setPresetStatus("삭제할 프리셋을 선택하세요.");
      return;
    }

    const selectedPreset = presets.find((preset) => preset.id === selectedPresetId);
    const selectedPresetName = selectedPreset?.name ?? "선택한 프리셋";

    try {
      setIsPresetBusy(true);
      setPresetStatus("프리셋 삭제 중...");

      const response = await fetch(SHEET_STATE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "deletePreset",
          id: selectedPresetId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result?.ok) {
        throw new Error(result?.error || "프리셋 삭제에 실패했습니다.");
      }

      setSelectedPresetId("");
      setPresetStatus(`프리셋 삭제됨: ${selectedPresetName}`);
      await loadPresets({ silent: true });
    } catch (error) {
      setPresetStatus(error.message || "프리셋 삭제에 실패했습니다.");
    } finally {
      setIsPresetBusy(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    loadPresets({ silent: true });
  }, []);

  useEffect(() => {
    if (!owners.length || hasInitializedOwnerFiltersRef.current) return;
    setActiveOwnerFilters(owners);
    hasInitializedOwnerFiltersRef.current = true;
  }, [owners]);

  useEffect(() => {
    loadSharedState({ silent: true });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!sharedSyncEnabled || !SHEET_STATE_API_URL) return undefined;

    const timer = window.setInterval(() => {
      if (!isApplyingSharedStateRef.current) {
        loadSharedState({ silent: true });
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [sharedSyncEnabled]);

  
  

  const schedule = useMemo(
    () => generateSchedule({
      characters,
      selectedRaidKeys,
      roleOverrides,
      ownerToggles,
      raidPreferences,
      seed,
    }),
    [characters, selectedRaidKeys, roleOverrides, ownerToggles, raidPreferences, seed]
  );

  const clearedRaidKeysByCharacter = useMemo(() => {
    const map = new Map();
    const groupsForCleared = syncLoadedGroups(
      hydrateSavedScheduleGroups(savedScheduleGroups) ??
      (isValidScheduleGroups(savedScheduleGroups)
        ? savedScheduleGroups
        : applyManualSwapsToGroups(schedule.groups, manualSwaps))
    );

    for (const group of groupsForCleared) {
      for (const party of group.parties) {
        if (!completedPartyKeys.includes(getPartyDoneKey(party))) continue;

        for (const member of getPartyMembers(party)) {
          const characterId = getCharacterId(member);
          if (!map.has(characterId)) map.set(characterId, new Set());
          map.get(characterId).add(group.raid.key);
        }
      }
    }

    return map;
  }, [savedScheduleGroups, schedule.groups, manualSwaps, completedPartyKeys, characters]);

  const assignedRaidKeysByCharacter = useMemo(() => {
    const map = new Map();
    const groupsForAssigned = syncLoadedGroups(
      hydrateSavedScheduleGroups(savedScheduleGroups) ??
      (isValidScheduleGroups(savedScheduleGroups)
        ? savedScheduleGroups
        : applyManualSwapsToGroups(schedule.groups, manualSwaps))
    );

    for (const group of groupsForAssigned) {
      for (const party of group.parties) {
        for (const member of getPartyMembers(party)) {
          const characterId = getCharacterId(member);
          if (!map.has(characterId)) map.set(characterId, new Set());
          map.get(characterId).add(group.raid.key);
        }
      }
    }

    return map;
  }, [savedScheduleGroups, schedule.groups, manualSwaps, characters]);

  const visibleCharacters = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return schedule.characterRuns
      .filter((character) => {
        if (!lowerQuery) return true;
        return [character.owner, character.name]
          .join(" ")
          .toLowerCase()
          .includes(lowerQuery);
      })
      .sort((a, b) => b.level - a.level || getEffectivePower(b) - getEffectivePower(a));
  }, [query, schedule.characterRuns]);

  const currentPartyKeys = useMemo(
    () => {
      const hasValidSavedGroups =
        Array.isArray(savedScheduleGroups) &&
        savedScheduleGroups.every(
          (group) =>
            group &&
            group.raid &&
            group.raid.key &&
            Array.isArray(group.parties) &&
            group.parties.every(
              (party) => party && party.raid && party.raid.key && Array.isArray(party.slots)
            )
        );

      const groupsForCount = syncLoadedGroups(
        hasValidSavedGroups
          ? savedScheduleGroups
          : applyManualSwapsToGroups(schedule.groups, manualSwaps)
      );

      return groupsForCount.flatMap((group) =>
        group.parties.map((party) => getPartyDoneKey(party))
      );
    },
    [savedScheduleGroups, schedule.groups, manualSwaps, characters]
  );

  const completedGeneratedPartyCount = currentPartyKeys.filter((key) =>
    completedPartyKeys.includes(key)
  ).length;

  const remainingPartyCount = Math.max(0, currentPartyKeys.length - completedGeneratedPartyCount);

  const validation = useMemo(() => {
    const issues = [];
    const groupsForValidation = getCurrentFinalGroups();

    for (const group of groupsForValidation) {
      for (const [partyIndex, party] of group.parties.entries()) {
        const members = getPartyMembers(party);
        const slotGroups = [...new Set(party.slots.map((slot) => slot.group))];

        const ownerSet = new Set(members.map((member) => member.owner));
        if (ownerSet.size !== members.length) {
          issues.push(`${group.raid.name} ${group.raid.partySize === 8 ? "공대" : "파티"} ${partyIndex + 1}: 동일 인물 중복`);
        }

        for (const slotGroup of slotGroups) {
          const groupMembers = getMembersInGroup(party, slotGroup);
          const classSet = new Set(groupMembers.map((member) => getClassIdentity(member)));

          if (classSet.size !== groupMembers.length) {
            issues.push(`${group.raid.name} 파티 ${partyIndex + 1}-${slotGroup}: 동일 직업 중복`);
          }
        }
      }
    }

    for (const character of schedule.characterRuns) {
      if (character.eligibleRaidCount >= 3 && character.runCount < 3) {
        issues.push(`${character.name}: ${character.runCount}회만 편성됨`);
      }
    }

    return [
      ...new Set([
        ...presetValidationMessages,
        ...getDowngradeRaidWarnings(groupsForValidation),
        ...issues,
      ]),
    ];
  }, [schedule, presetValidationMessages, savedScheduleGroups, manualSwaps, characters, raidPreferences]);

  const changeValkyrieRole = (raidKey, character, role) => {
    clearManualSwapsForAutoRebuild();
    setRoleOverrides((prev) => ({
      ...prev,
      [getRoleOverrideKey(raidKey, character)]: role,
    }));
  };

  const getNextRaidPreferencesForFamily = (prev, character, family) => {
    const availableRaids = getAvailableRaidsForFamily(character, family);
    if (!availableRaids.length) return prev;

    const defaultRaid = getDefaultRaidForFamily(character, family);
    const forcedKey = family.keys.find(
      (raidKey) => getRaidPreference(prev, character, raidKey) === "FORCE"
    );
    const isCurrentlyExcluded = isRaidFamilyExcluded(character, family, prev);

    const next = { ...prev };
    const setFamilyAuto = () => {
      for (const raidKey of family.keys) {
        next[getRaidPreferenceKey(character, raidKey)] = "AUTO";
      }
    };

    const setFamilyExcluded = () => {
      for (const raidKey of family.keys) {
        next[getRaidPreferenceKey(character, raidKey)] = "EXCLUDE";
      }
    };

    const setFamilyForced = (raid) => {
      for (const raidKey of family.keys) {
        next[getRaidPreferenceKey(character, raidKey)] =
          raidKey === raid.key ? "FORCE" : "EXCLUDE";
      }
    };

    const defaultIndex = defaultRaid
      ? availableRaids.findIndex((raid) => raid.key === defaultRaid.key)
      : -1;

    const cycleRaids = defaultIndex >= 0
      ? [
          availableRaids[defaultIndex],
          ...availableRaids.slice(0, defaultIndex),
          ...availableRaids.slice(defaultIndex + 1),
        ]
      : availableRaids;

    if (isCurrentlyExcluded) {
      setFamilyAuto();
      return next;
    }

    const currentRaidKey = forcedKey || defaultRaid?.key || cycleRaids[0]?.key;
    const currentIndex = cycleRaids.findIndex((raid) => raid.key === currentRaidKey);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= cycleRaids.length) {
      setFamilyExcluded();
      return next;
    }

    const nextRaid = cycleRaids[nextIndex];

    if (defaultRaid && nextRaid.key === defaultRaid.key) {
      setFamilyAuto();
      return next;
    }

    setFamilyForced(nextRaid);
    return next;
  };

  const changeRaidPreference = (character, family) => {
    setRaidPreferences((prev) => {
      const prevSelectedRaid = getSelectedRaidForFamily(character, family, prev);
      const nextRaidPreferences = getNextRaidPreferencesForFamily(prev, character, family);
      if (nextRaidPreferences === prev) return prev;

      const nextSelectedRaid = getSelectedRaidForFamily(character, family, nextRaidPreferences);
      const affectedRaidKeys = [prevSelectedRaid?.key, nextSelectedRaid?.key].filter(Boolean);
      const uniqueAffectedRaidKeys = [...new Set(affectedRaidKeys)];

      if (uniqueAffectedRaidKeys.length) {
        const rebuiltSchedule = generateSchedule({
          characters,
          selectedRaidKeys,
          roleOverrides,
          ownerToggles,
          raidPreferences: nextRaidPreferences,
          seed,
        });

        const rebuiltGroups = rebuiltSchedule.groups.filter((group) =>
          uniqueAffectedRaidKeys.includes(group.raid.key)
        );

        if (rebuiltGroups.length) {
          setSavedScheduleGroups((currentSavedGroups) => {
            const baseGroups =
              hydrateSavedScheduleGroups(currentSavedGroups) ??
              (isValidScheduleGroups(currentSavedGroups) ? currentSavedGroups : finalGroups);

            return rebuiltGroups.reduce(
              (groups, rebuiltGroup) => replaceRaidGroupOnly(groups, rebuiltGroup.raid.key, rebuiltGroup),
              baseGroups
            );
          });
        }
      }

      setManualSwaps((prevSwaps) =>
        prevSwaps.filter(
          (swap) =>
            !uniqueAffectedRaidKeys.includes(swap.from?.raidKey) &&
            !uniqueAffectedRaidKeys.includes(swap.to?.raidKey)
        )
      );
      setConfirmedManualSwaps((prevSwaps) =>
        prevSwaps.filter(
          (swap) =>
            !uniqueAffectedRaidKeys.includes(swap.from?.raidKey) &&
            !uniqueAffectedRaidKeys.includes(swap.to?.raidKey)
        )
      );
      setManualSwapMessage("");
      setManualEditPending(false);
      setSavedScheduleGroupsBeforePending(null);
      setLastSyncedSavedScheduleGroups(null);

      const affectedRaidNames = uniqueAffectedRaidKeys
        .map(getRaidByKey)
        .filter(Boolean)
        .map((raid) => raid.name)
        .join(", ");
      setSharedSyncStatus(`${affectedRaidNames || family.label}만 다시 편성됨 · 저장 버튼을 누르면 공유됩니다.`);

      return nextRaidPreferences;
    });
  };

  const rebuildOnlyRaid = (raidKey) => {
    const rebuiltGroup = schedule.groups.find((group) => group.raid.key === raidKey);
    if (!rebuiltGroup) return;

    setSavedScheduleGroups((currentSavedGroups) => {
      const baseGroups =
        hydrateSavedScheduleGroups(currentSavedGroups) ??
        (isValidScheduleGroups(currentSavedGroups) ? currentSavedGroups : finalGroups);

      return replaceRaidGroupOnly(baseGroups, raidKey, rebuiltGroup);
    });

    setManualSwaps([]);
    setConfirmedManualSwaps([]);
    setManualSwapMessage("");
    setManualEditPending(false);
    setSavedScheduleGroupsBeforePending(null);
    setSharedSyncStatus(`${rebuiltGroup.raid.name}만 다시 편성됨 · 저장 버튼을 누르면 공유됩니다.`);
  };

  const toggleOwnerForRaid = (raidKey, owner) => {
    const key = getOwnerToggleKey(raidKey, owner);

    setOwnerToggles((prev) => {
      const nextOwnerToggles = {
        ...prev,
        [key]: prev[key] === false ? true : false,
      };

      const rebuiltSchedule = generateSchedule({
        characters,
        selectedRaidKeys,
        roleOverrides,
        ownerToggles: nextOwnerToggles,
        raidPreferences,
        seed,
      });

      const rebuiltGroup = rebuiltSchedule.groups.find((group) => group.raid.key === raidKey);

      if (rebuiltGroup) {
        setSavedScheduleGroups((currentSavedGroups) => {
          const baseGroups =
            hydrateSavedScheduleGroups(currentSavedGroups) ??
            (isValidScheduleGroups(currentSavedGroups) ? currentSavedGroups : finalGroups);

          return replaceRaidGroupOnly(baseGroups, raidKey, rebuiltGroup);
        });
      }

      return nextOwnerToggles;
    });

    setManualSwaps([]);
    setConfirmedManualSwaps([]);
    setManualSwapMessage("");
    setManualEditPending(false);
    setSavedScheduleGroupsBeforePending(null);
    setSharedSyncStatus("해당 레이드만 다시 반영됨 · 저장 버튼을 누르면 공유됩니다.");
  };

  const clearManualMessage = () => {
    
    
    if (manualEditPending) return;
    if (manualSwapMessage) setManualSwapMessage("");
  };

  const clearManualSwapsForAutoRebuild = () => {
    setManualSwaps([]);
    setConfirmedManualSwaps([]);
    setManualSwapMessage("");
    setManualEditPending(false);
    setSavedScheduleGroups(null);
    setSavedScheduleGroupsBeforePending(null);
    setLastSyncedSavedScheduleGroups(null);
    setSharedSyncStatus("자동 재편성됨 · 저장 버튼을 누르면 공유됩니다.");
  };

  const togglePartyDone = (partyDoneKey) => {
    setCompletedPartyKeys((prev) =>
      prev.includes(partyDoneKey)
        ? prev.filter((key) => key !== partyDoneKey)
        : [...prev, partyDoneKey]
    );
  };

  const toggleRaidFilter = (raidKey) => {
    setActiveRaidFilters((prev) =>
      prev.includes(raidKey) ? prev.filter((key) => key !== raidKey) : [...prev, raidKey]
    );
  };

  const toggleOwnerFilter = (owner) => {
    setActiveOwnerFilters((prev) =>
      prev.includes(owner) ? prev.filter((item) => item !== owner) : [...prev, owner]
    );
  };

  const displayedGroups = useMemo(
    () => applyManualSwapsToGroups(schedule.groups, manualSwaps),
    [schedule.groups, manualSwaps]
  );

  const finalGroups = syncLoadedGroups(
    hydrateSavedScheduleGroups(savedScheduleGroups) ??
    (isValidScheduleGroups(savedScheduleGroups) ? savedScheduleGroups : displayedGroups)
  )
    .slice()
    .sort((a, b) => getRaidOrderValue(a.raid) - getRaidOrderValue(b.raid));

  const handleManualSwap = (fromRef, toRef) => {
    const baseGroups = syncLoadedGroups(savedScheduleGroups ?? displayedGroups);
    const error = validateManualSwap(baseGroups, fromRef, toRef);
    if (error) {
      setManualSwapMessage(error);
      return;
    }

    setManualEditPending(true);

    
    
    if (savedScheduleGroups) {
      if (!savedScheduleGroupsBeforePending) {
        setSavedScheduleGroupsBeforePending(
          isValidScheduleGroups(lastSyncedSavedScheduleGroups)
            ? lastSyncedSavedScheduleGroups
            : savedScheduleGroups
        );
      }

      setSavedScheduleGroups((prev) => applyManualSwapsToGroups(syncLoadedGroups(prev), [{ from: fromRef, to: toRef }]));
      setManualSwapMessage("교환 임시 적용됨");
      return;
    }

    setManualSwaps((prev) => [...prev, { from: fromRef, to: toRef }]);
    setManualSwapMessage("교환 임시 적용됨");
  };

  const completeManualSwaps = () => {
    const groupsToValidate = removeEmptyPartiesFromGroups(
      syncLoadedGroups(savedScheduleGroups ?? displayedGroups)
    );

    const errors = validateAllManualGroups(groupsToValidate, raidPreferences);

    if (errors.length > 0) {
      if (savedScheduleGroups) {
        const rollbackGroups = isValidScheduleGroups(lastSyncedSavedScheduleGroups)
          ? lastSyncedSavedScheduleGroups
          : savedScheduleGroupsBeforePending;

        if (rollbackGroups) {
          setSavedScheduleGroups(rollbackGroups);
        }

        setSavedScheduleGroupsBeforePending(null);
        setManualEditPending(false);
        setManualSwapMessage(
          `조건 불일치로 저장된 최종 편성 상태로 되돌렸습니다: ${errors[0]}`
        );
        return;
      }

      setManualSwaps(confirmedManualSwaps);
      setManualEditPending(false);
      setManualSwapMessage(
        `조건 불일치로 이전 완료 상태로 되돌렸습니다: ${errors[0]}`
      );
      return;
    }

    if (!savedScheduleGroups) {
      setConfirmedManualSwaps(manualSwaps);
    } else {
      setSavedScheduleGroups(groupsToValidate);
    }

    setSavedScheduleGroupsBeforePending(null);
    setManualEditPending(false);
    setManualSwapMessage("교환 완료");
  };

  const normalizedPartySearch = partySearch.trim().toLowerCase();

  const isPartyMatchedBySearch = (party) => {
    if (!normalizedPartySearch) return true;

    return getPartyMembers(party).some((member) =>
      [member.owner, member.name]
        .join(" ")
        .toLowerCase()
        .includes(normalizedPartySearch)
    );
  };

  const isPartyMatchedByOwnerFilter = (party) => {
    const partyOwners = new Set(getPartyMembers(party).map((member) => member.owner));

    for (const owner of partyOwners) {
      if (!activeOwnerFilters.includes(owner)) return false;
    }

    return true;
  };

  const visibleGroups = finalGroups
    .filter((group) => activeRaidFilters.includes(group.raid.key))
    .map((group) => {
      const visibleParties = group.parties.filter((party) => {
        if (hideClearedRaids && completedPartyKeys.includes(getPartyDoneKey(party))) return false;
        if (!isPartyMatchedBySearch(party)) return false;
        if (!isPartyMatchedByOwnerFilter(party)) return false;

        return true;
      });

      return {
        ...group,
        parties: visibleParties,
      };
    })
    .filter((group) => group.parties.length > 0);

  if (isLoadingCharacters) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <section style={styles.hero}>
            <h1 style={styles.title}>Lost Ark Raid Planner</h1>
            <p style={styles.desc}>캐릭터 정보를 불러오는 중...</p>
          </section>
        </div>
      </main>
    );
  }

  if (characterLoadError) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <section style={styles.hero}>
            <h1 style={styles.title}>캐릭터 정보를 불러오지 못했습니다</h1>
            <p style={styles.desc}>{characterLoadError}</p>
            <button type="button" onClick={loadCharacters} style={{ ...styles.button, marginTop: "12px" }}>
              다시 불러오기
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (sharedInitialLoading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <section style={styles.hero}>
            <h1 style={styles.title}>Lost Ark Raid Planner</h1>
            <p style={styles.desc}>데이터를 불러오는 중...</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes characterRefreshSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <h1 style={styles.title}>Lost Ark Raid Planner</h1>
              <p style={styles.desc}>권왕 버프 · 스커 버프 · 도화가 버프 레츠고</p>
            </div>
          </div>
        </section>

        <section style={styles.statGrid}>
          <div
            style={{ ...styles.card, cursor: "pointer" }}
            onClick={() =>
              document
                .getElementById("character-status-section")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            <div style={styles.cardPad}>
              <div style={styles.statLabel}>캐릭터</div>
              <div style={styles.statValue}>{schedule.stats.characterCount}명</div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardPad}>
              <div style={styles.statLabel}>파티</div>
              <div style={styles.statValue}>{schedule.stats.partyCount}개</div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardPad}>
              <div style={styles.statLabel}>공팟</div>
              <div style={styles.statValue}>{schedule.stats.emptySlotCount}명</div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardPad}>
              <div style={styles.statLabel}>남은 레이드</div>
              <div style={styles.statValue}>{remainingPartyCount}개</div>
            </div>
          </div>
          <div
            style={{ ...styles.card, cursor: "pointer" }}
            onClick={() =>
              document
                .getElementById("validation-detail-section")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            <div style={styles.cardPad}>
              <div style={styles.statLabel}>검증 결과</div>
              <div style={{ marginTop: "8px", fontSize: "20px", fontWeight: 900 }}>
                {validation.length ? `${validation.length}개 확인 필요` : "모든 조건 통과"}
              </div>
            </div>
          </div>
        </section>

        <section style={styles.raidSelectBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: showFilterPanel ? "8px" : 0 }}>
            <strong style={{ fontSize: "13px" }}>필터 및 이동</strong>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setShowAdminPanel((value) => !value)}
                style={showAdminPanel ? styles.miniActiveButton : styles.miniButton}
              >
                관리자 설정
              </button>
              <button
                type="button"
                onClick={() => setShowFilterPanel((value) => !value)}
                style={styles.miniButton}
              >
                {showFilterPanel ? "접기" : "열기"}
              </button>
            </div>
          </div>

          {showFilterPanel && (
            <>

          {showAdminPanel && (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "8px",
                marginBottom: "8px",
                background: "#f9fafb",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ ...styles.smallText, fontWeight: 900 }}>공유</span>
                <button
                  type="button"
                  onClick={() => setSharedSyncEnabled((value) => !value)}
                  style={sharedSyncEnabled ? styles.miniActiveButton : styles.miniButton}
                >
                  동기화 {sharedSyncEnabled ? "ON" : "OFF"}
                </button>
                <button type="button" onClick={() => loadSharedState()} style={styles.miniButton}>
                  불러오기
                </button>
                <button
                  type="button"
                  onClick={() => saveSharedState()}
                  style={hasPendingManualChange() ? styles.miniButton : styles.miniActiveButton}
                  title={hasPendingManualChange() ? "교환 완료 후 저장할 수 있습니다" : "현재 편성을 공유 상태로 저장"}
                >
                  저장
                </button>
                <span style={{ ...styles.smallText }}>{sharedSyncStatus}</span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                <span style={{ ...styles.smallText, fontWeight: 900 }}>수동 교환</span>
                <span style={{ ...styles.smallText }}>
                  같은 레이드 안에서 캐릭터끼리 교환 후, 교환 완료를 눌러 검증합니다.
                </span>
                {hasPendingManualChange() && (
                  <button type="button" onClick={completeManualSwaps} style={styles.miniActiveButton}>
                    교환 완료
                  </button>
                )}
                {manualSwapMessage && (
                  <span
                    onClick={clearManualMessage}
                    style={{
                      ...styles.badge,
                      ...(manualSwapMessage === "교환 완료" ? styles.goodBadge : styles.warnBadge),
                      cursor: "pointer",
                    }}
                  >
                    {manualSwapMessage}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginTop: "8px" }}>
                <span style={{ ...styles.smallText, fontWeight: 900 }}>프리셋</span>
                <input
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                  placeholder="프리셋 이름"
                  style={{ ...styles.miniInput, width: "150px" }}
                />
                <button
                  type="button"
                  onClick={savePreset}
                  disabled={isPresetBusy}
                  style={styles.miniButton}
                >
                  프리셋 저장
                </button>
                <select
                  value={selectedPresetId}
                  onChange={(event) => setSelectedPresetId(event.target.value)}
                  style={{ ...styles.miniInput, width: "170px", padding: "3px 8px" }}
                >
                  <option value="">프리셋 선택</option>
                  {presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={loadPreset}
                  disabled={isPresetBusy || !selectedPresetId}
                  style={styles.miniButton}
                >
                  불러오기
                </button>
                <button
                  type="button"
                  onClick={deletePreset}
                  disabled={isPresetBusy || !selectedPresetId}
                  style={{ ...styles.miniButton, ...styles.dangerBadge }}
                >
                  삭제
                </button>
                <button
                  type="button"
                  onClick={() => loadPresets()}
                  disabled={isPresetBusy}
                  style={styles.miniButton}
                >
                  목록 새로고침
                </button>
                {presetStatus && <span style={{ ...styles.smallText }}>{presetStatus}</span>}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setCompletedPartyKeys([]);
                    setSharedSyncStatus("클리어 체크가 초기화되었습니다. 저장 버튼을 누르면 공유됩니다.");
                  }}
                  style={styles.miniButton}
                  title="모든 파티/공대 클리어 체크를 해제합니다"
                >
                  클리어 리셋
                </button>
                <button
                  type="button"
                  onClick={refreshCharacters}
                  disabled={isRefreshingCharacters}
                  style={{
                    ...styles.miniButton,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    opacity: isRefreshingCharacters ? 0.7 : 1,
                    cursor: isRefreshingCharacters ? "wait" : "pointer",
                  }}
                  title="모든 캐릭터의 레벨과 전투력을 갱신합니다."
                >
                  {isRefreshingCharacters && (
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        border: "2px solid #d1d5db",
                        borderTopColor: "#374151",
                        borderRadius: "999px",
                        display: "inline-block",
                        animation: "characterRefreshSpin 0.8s linear infinite",
                      }}
                    />
                  )}
                  {isRefreshingCharacters ? "갱신 중..." : "캐릭터 갱신"}
                </button>
                <input
                  type="password"
                  value={discordWebhookDraft}
                  onChange={(event) => setDiscordWebhookDraft(event.target.value)}
                  placeholder="Discord Webhook URL"
                  style={{ ...styles.miniInput, width: "260px" }}
                />
                <button type="button" onClick={saveDiscordWebhookUrl} style={styles.miniButton}>
                  웹후크 저장
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <span style={{ ...styles.smallText, fontWeight: 900 }}>레이드 필터</span>
            <button
              type="button"
              onClick={() => setHideClearedRaids((value) => !value)}
              style={hideClearedRaids ? styles.miniButton : styles.miniActiveButton}
              title="클리어한 파티/공대를 숨깁니다"
            >
              클리어
            </button>
            {orderedRaids.map((raid) => (
              <button
                key={`filter-${raid.key}`}
                type="button"
                onClick={() => toggleRaidFilter(raid.key)}
                style={activeRaidFilters.includes(raid.key) ? styles.miniActiveButton : styles.miniButton}
              >
                {raid.name}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              alignItems: "center",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
              <span style={{ ...styles.smallText, fontWeight: 900 }}>사람 필터</span>
              {owners.map((owner) => (
                <button
                  key={`owner-filter-${owner}`}
                  type="button"
                  onClick={() => toggleOwnerFilter(owner)}
                  style={activeOwnerFilters.includes(owner) ? styles.miniActiveButton : styles.miniButton}
                >
                  {owner}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              alignItems: "center",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
              <span style={{ ...styles.smallText, fontWeight: 900 }}>이동</span>
              {orderedRaids.map((raid) => {
                const isRaidVisible = activeRaidFilters.includes(raid.key);

                return (
                  <a
                    key={`anchor-${raid.key}`}
                    href={`#raid-section-${raid.key}`}
                    onClick={(event) => {
                      if (!isRaidVisible) event.preventDefault();
                    }}
                    style={{
                      ...styles.miniButton,
                      display: "inline-flex",
                      alignItems: "center",
                      textDecoration: "none",
                      opacity: isRaidVisible ? 1 : 0.38,
                      cursor: isRaidVisible ? "pointer" : "not-allowed",
                    }}
                  >
                    {raid.name}
                  </a>
                );
              })}
              <a
                href="#utility-tools-section"
                style={{
                  ...styles.miniButton,
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                편의도구
              </a>
            </div>

            <input
              value={partySearch}
              onChange={(event) => setPartySearch(event.target.value)}
              placeholder="캐릭터, 유저 검색"
              style={{ ...styles.miniInput, marginLeft: "auto" }}
            />
          </div>
                    </>
          )}
        </section>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setShowRaidOverview((value) => {
                const nextValue = !value;
                if (nextValue) setShowConcurrentRunOverview(false);
                return nextValue;
              });
            }}
            style={showRaidOverview ? styles.activeButton : styles.button}
          >
            레이드 현황 {showRaidOverview ? "닫기" : "한눈에 보기"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowConcurrentRunOverview((value) => {
                const nextValue = !value;
                if (nextValue) setShowRaidOverview(false);
                return nextValue;
              });
            }}
            style={showConcurrentRunOverview ? styles.activeButton : styles.button}
          >
            동시 진행 {showConcurrentRunOverview ? "닫기" : "보기"}
          </button>
        </div>

        {showRaidOverview && (
          <RaidOverview
            groups={visibleGroups}
            completedPartyKeys={completedPartyKeys}
            onTogglePartyDone={togglePartyDone}
            onShareDiscordElement={shareDiscordElement}
            isDiscordSharing={isDiscordSharing}
            showDiscordShare={Boolean(discordWebhookUrl.trim())}
          />
        )}

        {showConcurrentRunOverview && (
          <ConcurrentRunOverview
            groups={visibleGroups}
            completedPartyKeys={completedPartyKeys}
            onTogglePartyDone={togglePartyDone}
            onShareDiscordElement={shareDiscordElement}
            isDiscordSharing={isDiscordSharing}
            showDiscordShare={Boolean(discordWebhookUrl.trim())}
          />
        )}

        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {visibleGroups.map((group) => {
            const rule = getRoleSlotRule(group.raid);
            const isRaidEditOpen = raidEditOpenMap[group.raid.key] ?? false;
            const clearGold = Number(group.raid.clearGold ?? 0);
            return (
              <div
                key={group.raid.key}
                id={`raid-section-${group.raid.key}`}
                style={{ display: "flex", flexDirection: "column", gap: "8px", scrollMarginTop: "180px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <h2 style={styles.sectionTitle}>{group.raid.name}</h2>
                      <button
                        type="button"
                        onClick={() =>
                          setRaidEditOpenMap((prev) => ({
                            ...prev,
                            [group.raid.key]: !(prev[group.raid.key] ?? false),
                          }))
                        }
                        style={isRaidEditOpen ? styles.miniActiveButton : styles.miniButton}
                        title={`${group.raid.name} 수정 메뉴 ${isRaidEditOpen ? "닫기" : "열기"}`}
                      >
                        수정
                      </button>
                    </div>

                    {isRaidEditOpen && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "6px",
                          width: "100%",
                          flexWrap: "wrap",
                        }}
                      >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                          alignItems: "center",
                          minWidth: 0,
                        }}
                      >
                        <span style={{ ...styles.smallText, fontWeight: 900 }}>참여</span>
                        {owners.map((owner) => {
                          const enabled = isOwnerEnabledForRaid(ownerToggles, group.raid.key, owner);
                          return (
                            <button
                              key={`${group.raid.key}-${owner}`}
                              type="button"
                              onClick={() => toggleOwnerForRaid(group.raid.key, owner)}
                              style={enabled ? styles.miniActiveButton : styles.miniButton}
                              title={`${group.raid.name} ${owner} 참여 ${enabled ? "ON" : "OFF"}`}
                            >
                              {owner}
                            </button>
                          );
                        })}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "4px",
                          marginLeft: "auto",
                          flexWrap: "wrap",
                        }}
                      >

                        <button
                          type="button"
                          onClick={() => rebuildOnlyRaid(group.raid.key)}
                          style={styles.miniButton}
                          title={`${group.raid.name}만 다시 편성`}
                        >
                          편성
                        </button>
                      </div>
                    </div>
                    )}
                  </div>
                  {clearGold > 0 && !isRaidEditOpen && (
                    <span
                      style={{
                        ...styles.badge,
                        ...styles.warnBadge,
                        marginLeft: "auto",
                        fontWeight: 950,
                        whiteSpace: "nowrap",
                        alignSelf: "flex-end",
                      }}
                    >
                      {formatGold(clearGold)}G
                    </span>
                  )}
                </div>

                {group.parties.length ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        group.raid.partySize === 8
                          ? "1fr"
                          : "repeat(auto-fit, minmax(min(520px, 100%), 1fr))",
                      gap: "8px",
                      alignItems: "start",
                    }}
                  >
                    {group.parties.map((party, index) => (
                      <PartyCard
                        key={party.id}
                        party={party}
                        index={index}
                        roleOverrides={roleOverrides}
                        onChangeValkyrieRole={changeValkyrieRole}
                        onDragStartCharacter={setDraggingRef}
                        onDropCharacter={handleManualSwap}
                        completedPartyKeys={completedPartyKeys}
                        onTogglePartyDone={togglePartyDone}
                        isNarrowScreen={isNarrowScreen}
                        onShareDiscordElement={shareDiscordElement}
                        isDiscordSharing={isDiscordSharing}
                        showDiscordShare={Boolean(discordWebhookUrl.trim())}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      border: "1px dashed #cbd5e1",
                      borderRadius: "20px",
                      background: "white",
                      padding: "16px",
                      textAlign: "center",
                      color: "#64748b",
                      fontWeight: 800,
                    }}
                  >
                    이 레이드에 배치된 캐릭터가 없습니다.
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {visibleGroups.length === 0 && (
          <div
            style={{
              border: "1px dashed #cbd5e1",
              borderRadius: "14px",
              background: "white",
              padding: "16px",
              textAlign: "center",
              color: "#64748b",
              fontWeight: 900,
            }}
          >
            필터 조건에 맞는 레이드가 없습니다.
          </div>
        )}

        <section
          style={{
            ...styles.splitGrid,
            gridTemplateColumns: isNarrowScreen
              ? "minmax(0, 1fr)"
              : styles.splitGrid.gridTemplateColumns,
          }}
        >
          <div id="character-status-section" style={{ ...styles.card, scrollMarginTop: "180px" }}>
            <div style={styles.cardPad}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "14px",
                  minWidth: 0,
                }}
              >
                <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                  <h2 style={{ ...styles.sectionTitle, fontSize: "22px" }}>캐릭터 편성 현황</h2>
                  <p style={{ ...styles.smallText, margin: "4px 0 0" }}>
                    레이드 편성 및 설정, 클리어 현황
                  </p>
                </div>
                <div style={{ flex: "1 1 280px", maxWidth: "360px", minWidth: 0 }}>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="캐릭터, 유저 검색"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "8px" }}>
                {visibleCharacters.map((character) => (
                  <CharacterRow
                    key={getCharacterId(character)}
                    character={character}
                    runCount={character.runCount}
                    showRaidPreferenceControls
                    raidPreferences={raidPreferences}
                    onChangeRaidPreference={changeRaidPreference}
                    clearedRaidKeys={clearedRaidKeysByCharacter.get(getCharacterId(character)) ?? new Set()}
                    assignedRaidKeys={assignedRaidKeysByCharacter.get(getCharacterId(character)) ?? new Set()}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
            <div id="validation-detail-section" style={{ ...styles.card, scrollMarginTop: "180px" }}>
              <div style={styles.cardPad}>
                <h2 style={{ ...styles.sectionTitle, fontSize: "22px" }}>검증 상세</h2>
                <p style={{ ...styles.smallText, marginTop: "4px" }}>
                  동일 인물, 직업 중복, 미포함, 하향지원 캐릭터를 표시합니다.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                  {validation.length ? (
                    validation.slice(0, 50).map((issue) => (
                      <div key={issue} style={styles.issue}>
                        {issue}
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        border: "1px solid #bbf7d0",
                        background: "#f0fdf4",
                        color: "#15803d",
                        borderRadius: "10px",
                        padding: "14px",
                        fontWeight: 900,
                      }}
                    >
                      모든 조건을 만족합니다.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div id="utility-tools-section" style={{ display: "flex", flexDirection: "column", gap: "10px", scrollMarginTop: "180px" }}>
              <ClearGoldRanking
                groups={getCurrentFinalGroups()}
                completedPartyKeys={completedPartyKeys}
              />

              <AuctionCalculator />

              <CpmCalculator />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
