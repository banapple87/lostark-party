import React, { useEffect, useMemo, useRef, useState } from "react";

// Vite 기준 예시
// src/data/characters.js
// src/data/classMeta.js
// src/data/raids.js
import { CHARACTERS } from "./data/characters";
import { CLASS_META } from "./data/classMeta";
import { RAIDS } from "./data/raids";

const ROLE_SLOT_RULE = {
  4: { DPS: 3, SUPPORT: 1 },
  8: { DPS: 6, SUPPORT: 2 },
};

// 보기 좋은 출력 순서
const RAID_DISPLAY_ORDER = [
  "cathedral_1",
  "serka_normal",
  "end_normal",
  "cathedral_2",
  "serka_hard",
  "end_hard",
  "cathedral_3",
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

// Google Apps Script 웹앱 URL을 여기에 넣으면 공유 상태 저장/불러오기가 동작한다.
// 예: https://script.google.com/macros/s/xxxx/exec
const SHEET_STATE_API_URL = import.meta.env.VITE_SHEET_STATE_API_URL ?? "";

const SHARED_STATE_VERSION = 1;

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
  },
  partyHeader: {
    padding: "10px 12px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
    gap: "8px",
    padding: "10px",
  },
  raidSubPartyMemberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
    gap: "8px",
    padding: "10px",
  },
  charCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "9px",
    background: "#ffffff",
    boxShadow: "none",
  },
  emptySlot: {
    border: "1px dashed #d1d5db",
    borderRadius: "12px",
    padding: "9px",
    background: "#f9fafb",
    color: "#9ca3af",
    minHeight: "78px",
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
    gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
    gap: "18px",
  },
  input: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "10px 12px",
    outline: "none",
    fontWeight: 800,
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
    // 수동 선택은 minLevel만 만족하면 가능. 고렙 캐릭터가 노말로 내려가는 용도.
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
  return Number(character.power ?? 0);
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

  // 백헤드 시너지는 백/헤드 딜러가 있는 파티를 강하게 선호한다.
  if (characterHasBackHeadSynergy && partyBackHeadDealerCount > 0) {
    score -= Math.min(partyBackHeadDealerCount, 3) * 420;
  }

  // 백/헤드 딜러는 백헤드 시너지가 있는 파티를 선호한다.
  if (characterIsBackHeadDealer && partyBackHeadSynergyCount > 0) {
    score -= Math.min(partyBackHeadSynergyCount, 1) * 420;
  }

  // 백헤드 시너지만 있고 받을 딜러가 없으면 살짝 불리하게 한다.
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
  const powers = members.map((member) => Number(member.power ?? 0));
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

function SynergyBadges({ synergyCounts }) {
  const entries = Object.entries(synergyCounts ?? {});

  if (!entries.length) {
    return <Badge>시너지 없음</Badge>;
  }

  return entries.map(([synergy, count]) => (
    <Badge key={synergy} tone={count > 1 && synergy !== "서폿" ? "warn" : "default"}>
      {synergy} {count > 1 ? `x${count}` : ""}
    </Badge>
  ));
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

  // 서포터는 평균 전투력 균형 계산에서 제외한다.
  // 서포터는 전투력보다 파티/공대의 서폿칸을 안정적으로 채우는 게 우선이다.
  if (role === "SUPPORT") {
    return synergyOverlap + backHeadPairScore + compactBonus;
  }

  // 딜러만 평균 전투력 균형을 계산한다.
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
      return "같은 4인 파티 안에 같은 직업이 중복됩니다.";
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
        if (!canCharacterEnterRaid(member, group.raid, raidPreferences)) {
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

    // 대상이 캐릭터면 1대1 교환, 빈칸이면 이동으로 처리한다.
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

  raidGroup.parties.forEach((party, index) => {
    party.id = `${raidGroup.raid.key}-${index + 1}`;
    rebuildSynergyCounts(party);
  });
}

function getReserveCountForRaid(reserveRaidCounts, raidKey) {
  return reserveRaidCounts[raidKey] ?? 0;
}

function getSelectedReserveCharactersForRaid(raid, reserveCharacters, reserveRaidCounts, ownerToggles, raidPreferences) {
  const count = getReserveCountForRaid(reserveRaidCounts, raid.key);
  if (count <= 0) return [];

  return reserveCharacters
    .filter((character) => isOwnerEnabledForRaid(ownerToggles, raid.key, character.owner))
    .filter((character) => canCharacterEnterRaid(character, raid, raidPreferences))
    .sort((a, b) => getEffectivePower(b) - getEffectivePower(a))
    .slice(0, count);
}

function isReserveSelectedForRaid(character, raid, reserveCharacters, reserveRaidCounts, ownerToggles, raidPreferences) {
  return getSelectedReserveCharactersForRaid(
    raid,
    reserveCharacters,
    reserveRaidCounts,
    ownerToggles,
    raidPreferences
  ).some((reserveCharacter) => getCharacterId(reserveCharacter) === getCharacterId(character));
}

function getCharactersForRaid(raid, characters, reserveCharacters, reserveRaidCounts, ownerToggles, raidPreferences) {
  const baseCharacters = characters.filter((character) =>
    isOwnerEnabledForRaid(ownerToggles, raid.key, character.owner)
  );

  const selectedReserveCharacters = getSelectedReserveCharactersForRaid(
    raid,
    reserveCharacters,
    reserveRaidCounts,
    ownerToggles,
    raidPreferences
  );

  return [...baseCharacters, ...selectedReserveCharacters];
}

function generateSchedule({ selectedRaidKeys, roleOverrides, ownerToggles, reserveRaidCounts, raidPreferences }) {
  const characters = CHARACTERS.filter((character) => !character.reserve);
  const reserveCharacters = CHARACTERS.filter((character) => character.reserve);
  const selectedRaids = getOrderedRaids().filter((raid) => selectedRaidKeys.includes(raid.key));

  const usageMap = new Map(
    [...characters, ...reserveCharacters].map((character) => [getCharacterId(character), 0])
  );

  const raidTargetPowerMap = new Map(
    selectedRaids.map((raid) => {
      const raidCharacters = getCharactersForRaid(
        raid,
        characters,
        reserveCharacters,
        reserveRaidCounts,
        ownerToggles,
        raidPreferences
      );
      const eligibleCharacters = raidCharacters.filter((character) =>
        canCharacterEnterRaid(character, raid, raidPreferences)
      );
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

  const sortedCharacters = [...characters, ...reserveCharacters].sort((a, b) => {
    const roleDiff = getClassMeta(a).role === "SUPPORT" ? -1 : getClassMeta(b).role === "SUPPORT" ? 1 : 0;
    if (roleDiff !== 0) return roleDiff;
    return b.level - a.level || getEffectivePower(b) - getEffectivePower(a);
  });

  for (const character of sortedCharacters) {
    const eligibleRaids = getEligibleRaids(character, selectedRaidKeys, raidPreferences).filter((raid) => {
      if (!isOwnerEnabledForRaid(ownerToggles, raid.key, character.owner)) return false;
      if (character.reserve) {
        return isReserveSelectedForRaid(
          character,
          raid,
          reserveCharacters,
          reserveRaidCounts,
          ownerToggles,
          raidPreferences
        );
      }
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
      .map((party) => summarizeParty(party).avgPower)
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

  const trackedCharacters = [
    ...characters,
    ...reserveCharacters.filter(
      (character) => (usageMap.get(getCharacterId(character)) ?? 0) > 0
    ),
  ];

  const characterRuns = trackedCharacters
    .map((character) => ({
      ...character,
      runCount: usageMap.get(getCharacterId(character)) ?? 0,
      eligibleRaidCount: getEligibleRaids(character, selectedRaidKeys, raidPreferences).filter((raid) => {
        if (!isOwnerEnabledForRaid(ownerToggles, raid.key, character.owner)) return false;
        if (character.reserve) {
          return isReserveSelectedForRaid(
            character,
            raid,
            reserveCharacters,
            reserveRaidCounts,
            ownerToggles,
            raidPreferences
          );
        }
        return true;
      }).length,
    }))
    .sort((a, b) => a.runCount - b.runCount || b.level - a.level);

  const completedRunCharacterCount = characterRuns.filter(
    (character) => !character.reserve && character.runCount === 3
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
}) {
  const meta = getClassMeta(character);

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
          {slotGroup && <Badge tone="purple">{slotGroup}파티</Badge>}
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
        <Badge>Lv.{character.level}</Badge>
        <Badge tone="purple">전투력 {character.power}</Badge>
        {runCount !== null && runCount !== undefined && (
          <Badge tone={runCount === 3 ? "good" : "warn"}>{runCount}/3회</Badge>
        )}
        {(meta.synergies ?? []).map((synergy) => (
          <Badge key={synergy}>{synergy}</Badge>
        ))}
        {showRaidPreferenceControls && onChangeRaidPreference && (
          <div style={{ width: "100%", marginTop: "6px" }}>
            <div style={{ ...styles.smallText, fontWeight: 900, marginBottom: "4px" }}>
              레이드 설정
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {RAID_FAMILIES.map((family) => {
                const availableRaids = getAvailableRaidsForFamily(character, family);
                const selectedRaid = getSelectedRaidForFamily(
                  character,
                  family,
                  raidPreferences ?? {}
                );
                const disabled = availableRaids.length === 0;
                const isForced = selectedRaid
                  ? getRaidPreference(raidPreferences ?? {}, character, selectedRaid.key) === "FORCE"
                  : false;
                const isExcluded = isRaidFamilyExcluded(character, family, raidPreferences ?? {});

                return (
                  <button
                    key={`${getCharacterId(character)}-${family.id}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChangeRaidPreference(character, family)}
                    title={
                      disabled
                        ? `${family.label}: 갈 수 있는 난이도 없음`
                        : `${family.label}: 클릭하면 난이도 변경`
                    }
                    style={{
                      ...styles.miniButton,
                      ...(isForced ? styles.goodBadge : {}),
                      ...(isExcluded ? styles.warnBadge : {}),
                      opacity: disabled ? 0.45 : 1,
                    }}
                  >
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
        {slotGroup && <Badge tone="purple">{slotGroup}파티</Badge>}
        <Badge tone={role === "SUPPORT" ? "good" : "blue"}>{role}</Badge>
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

          {!isEightRaid && (
            <div style={styles.badgeWrap}>
              <SynergyBadges synergyCounts={summary.synergyCounts} />
            </div>
          )}
        </div>
      </div>

      {isEightRaid ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(520px, 1fr))", gap: "14px", padding: "16px" }}>
          {slotGroups.map((group) => {
            const groupSlots = party.slots.filter((slot) => slot.group === group);
            const groupMembers = getMembersInGroup(party, group);
            const groupSummary = summarizeParty(groupMembers);

            return (
              <div key={group} style={{ border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", background: "#ffffff" }}>
                <div style={{ padding: "12px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <strong>{group === "A" ? "1파티" : "2파티"}</strong>
                  </div>
                  <div style={{ ...styles.smallText, marginTop: "6px" }}>
                    평균 전투력 {groupSummary.avgPower}
                  </div>
                  <div style={{ ...styles.badgeWrap, marginTop: "8px" }}>
                    <SynergyBadges synergyCounts={groupSummary.synergyCounts} />
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
  const owners = useMemo(
    () => {
      const list = [
        ...new Set(
          CHARACTERS.filter((character) => !character.reserve).map((character) => character.owner)
        ),
      ];
      return list.sort((a, b) => {
        if (a === "영수") return -1;
        if (b === "영수") return 1;
        return 0;
      });
    },
    []
  );
  const [query, setQuery] = useState("");
  const [selectedRaidKeys] = useState(orderedRaids.map((raid) => raid.key));
  const [activeRaidFilters, setActiveRaidFilters] = useState(orderedRaids.map((raid) => raid.key));
  const [activeOwnerFilters, setActiveOwnerFilters] = useState(owners);
  const [roleOverrides, setRoleOverrides] = useState({});
  const [ownerToggles, setOwnerToggles] = useState({});
  const [reserveRaidCounts, setReserveRaidCounts] = useState({});
  const [raidPreferences, setRaidPreferences] = useState({});
  const [manualSwaps, setManualSwaps] = useState([]);
  const [confirmedManualSwaps, setConfirmedManualSwaps] = useState([]);
  const [draggingRef, setDraggingRef] = useState(null);
  const [manualSwapMessage, setManualSwapMessage] = useState("");
  const [completedPartyKeys, setCompletedPartyKeys] = useState([]);
  const [seed, setSeed] = useState(0);
  const [sharedSyncEnabled, setSharedSyncEnabled] = useState(true);
  const [sharedSyncStatus, setSharedSyncStatus] = useState(
    SHEET_STATE_API_URL ? "공유 동기화 준비됨" : "공유 URL 미설정"
  );
  const hasLoadedSharedStateRef = useRef(false);
  const isApplyingSharedStateRef = useRef(false);
  const lastSavedSharedStateRef = useRef("");

  const getSharedStateSnapshot = () => ({
    version: SHARED_STATE_VERSION,
    updatedAt: new Date().toISOString(),
    roleOverrides,
    ownerToggles,
    reserveRaidCounts,
    raidPreferences,
    manualSwaps,
    confirmedManualSwaps,
    completedPartyKeys,
  });

  const applySharedState = (state) => {
    if (!state || typeof state !== "object") return;

    isApplyingSharedStateRef.current = true;
    setRoleOverrides(state.roleOverrides ?? {});
    setOwnerToggles(state.ownerToggles ?? {});
    setReserveRaidCounts(state.reserveRaidCounts ?? {});
    setRaidPreferences(state.raidPreferences ?? {});
    setManualSwaps(state.manualSwaps ?? []);
    setConfirmedManualSwaps(state.confirmedManualSwaps ?? []);
    setCompletedPartyKeys(state.completedPartyKeys ?? []);

    window.setTimeout(() => {
      isApplyingSharedStateRef.current = false;
    }, 0);
  };

  const loadSharedState = async ({ silent = false } = {}) => {
    if (!SHEET_STATE_API_URL) {
      if (!silent) setSharedSyncStatus("공유 URL이 설정되지 않았습니다.");
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
    }
  };

  const saveSharedState = async ({ silent = false } = {}) => {
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
      setSharedSyncStatus(`공유 상태 저장됨 ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      setSharedSyncStatus(`저장 실패: ${error.message}`);
    }
  };

  useEffect(() => {
    loadSharedState({ silent: true });
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

  // 저장은 자동으로 하지 않는다.
  // 동기화 ON/OFF와 관계없이 공유 상태 저장은 사용자가 '저장' 버튼을 눌렀을 때만 수행한다.

  const schedule = useMemo(
    () => generateSchedule({
      selectedRaidKeys,
      roleOverrides,
      ownerToggles,
      reserveRaidCounts,
      raidPreferences,
      seed,
    }),
    [selectedRaidKeys, roleOverrides, ownerToggles, reserveRaidCounts, raidPreferences, seed]
  );

  const visibleCharacters = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return schedule.characterRuns
      .filter((character) => {
        if (!lowerQuery) return true;
        return [character.owner, character.name, character.className, character.build]
          .join(" ")
          .toLowerCase()
          .includes(lowerQuery);
      })
      .sort((a, b) => b.level - a.level || b.power - a.power);
  }, [query, schedule.characterRuns]);

  const currentPartyKeys = useMemo(
    () => schedule.groups.flatMap((group) => group.parties.map((party) => getPartyDoneKey(party))),
    [schedule.groups]
  );

  const completedGeneratedPartyCount = currentPartyKeys.filter((key) =>
    completedPartyKeys.includes(key)
  ).length;

  const remainingPartyCount = Math.max(0, currentPartyKeys.length - completedGeneratedPartyCount);

  const validation = useMemo(() => {
    const issues = [];

    for (const group of schedule.groups) {
      for (const [partyIndex, party] of group.parties.entries()) {
        const members = getPartyMembers(party);
        const emptySlots = party.slots.filter((slot) => !slot.member);
        const summary = summarizeParty(party);
        const rule = getRoleSlotRule(group.raid);
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
      if (character.reserve) continue;

      if (character.eligibleRaidCount > 0 && character.runCount < 3) {
        issues.push(`${character.name}: ${character.runCount}/3회만 편성됨`);
      }
      
    }

    return issues;
  }, [schedule]);

  const changeValkyrieRole = (raidKey, character, role) => {
    setRoleOverrides((prev) => ({
      ...prev,
      [getRoleOverrideKey(raidKey, character)]: role,
    }));
  };

  const changeRaidPreference = (character, family) => {
    setRaidPreferences((prev) => {
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

      // 클릭 순서:
      // 기본 난이도(AUTO) -> 다른 가능한 난이도들(FORCE) -> 안감(EXCLUDE) -> 기본(AUTO)
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
    });
  };

  const changeReserveCountForRaid = (raid, delta) => {
    const maxCount = CHARACTERS.filter(
      (character) =>
        character.reserve &&
        character.level >= raid.minLevel &&
        character.level <= raid.maxLevel
    ).length;

    setReserveRaidCounts((prev) => {
      const current = prev[raid.key] ?? 0;
      const next = Math.max(0, Math.min(maxCount, current + delta));
      return {
        ...prev,
        [raid.key]: next,
      };
    });
  };

  const toggleOwnerForRaid = (raidKey, owner) => {
    const key = getOwnerToggleKey(raidKey, owner);
    setOwnerToggles((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const clearManualMessage = () => {
    if (manualSwapMessage) setManualSwapMessage("");
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

  const handleManualSwap = (fromRef, toRef) => {
    const error = validateManualSwap(displayedGroups, fromRef, toRef);
    if (error) {
      setManualSwapMessage(error);
      return;
    }

    setManualSwaps((prev) => [...prev, { from: fromRef, to: toRef }]);
    setManualSwapMessage("교환 임시 적용됨");
  };

  const completeManualSwaps = () => {
    const errors = validateAllManualGroups(displayedGroups, raidPreferences);

    if (errors.length > 0) {
      setManualSwaps(confirmedManualSwaps);
      setManualSwapMessage(`조건 불일치로 이전 완료 상태로 되돌렸습니다: ${errors[0]}`);
      return;
    }

    setConfirmedManualSwaps(manualSwaps);
    setManualSwapMessage("교환 완료");
  };

  const visibleGroups = displayedGroups
    .filter((group) => activeRaidFilters.includes(group.raid.key))
    .map((group) => {
      const visibleParties = group.parties.filter((party) => {
        const partyOwners = new Set(getPartyMembers(party).map((member) => member.owner));

        for (const owner of partyOwners) {
          if (!activeOwnerFilters.includes(owner)) return false;
        }

        return true;
      });

      return {
        ...group,
        parties: visibleParties,
      };
    })
    .filter((group) => group.parties.length > 0);

  return (
    <main style={styles.page}>
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
          <div style={styles.card}>
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
          <div style={styles.card}>
            <div style={styles.cardPad}>
              <div style={styles.statLabel}>검증 결과</div>
              <div style={{ marginTop: "8px", fontSize: "20px", fontWeight: 900 }}>
                {validation.length ? `${validation.length}개 확인 필요` : "모든 조건 통과"}
              </div>
            </div>
          </div>
        </section>

        <section style={styles.raidSelectBox}>
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
            <button type="button" onClick={() => saveSharedState()} style={styles.miniButton}>
              저장
            </button>
            <span style={{ ...styles.smallText }}>{sharedSyncStatus}</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ ...styles.smallText, fontWeight: 900 }}>수동 교환</span>
            <span style={{ ...styles.smallText }}>
              같은 레이드 안에서 카드끼리 자유 교환 후, 교환 완료를 눌러 조건을 검증합니다.
            </span>
            {manualSwaps.length > 0 && (
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

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <span style={{ ...styles.smallText, fontWeight: 900 }}>레이드 필터</span>
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

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginTop: "8px" }}>
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
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {visibleGroups.map((group) => {
            const rule = getRoleSlotRule(group.raid);
            return (
              <div key={group.raid.key} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2 style={styles.sectionTitle}>{group.raid.name}</h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px", alignItems: "center" }}>
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

                      {CHARACTERS.some(
                        (character) =>
                          character.reserve &&
                          character.level >= group.raid.minLevel &&
                          character.level <= group.raid.maxLevel
                      ) && (
                        <div style={{ display: "flex", alignItems: "center", gap: "3px", marginLeft: "8px" }}>
                          <span style={{ ...styles.smallText, fontWeight: 900 }}>영수디트</span>
                          <button
                            type="button"
                            onClick={() => changeReserveCountForRaid(group.raid, -1)}
                            style={styles.miniButton}
                            title={`${group.raid.name} 영수디트 제거`}
                          >
                            -
                          </button>
                          <span style={{ ...styles.badge, minWidth: "20px", justifyContent: "center" }}>
                            {getReserveCountForRaid(reserveRaidCounts, group.raid.key)}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeReserveCountForRaid(group.raid, 1)}
                            style={styles.miniButton}
                            title={`${group.raid.name} 영수디트 추가`}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>

                {group.parties.length ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        group.raid.partySize === 8
                          ? "1fr"
                          : "repeat(auto-fit, minmax(520px, 1fr))",
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

        <section style={styles.splitGrid}>
          <div style={styles.card}>
            <div style={styles.cardPad}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <h2 style={{ ...styles.sectionTitle, fontSize: "22px" }}>캐릭터 편성 현황</h2>
                  <p style={{ ...styles.smallText, margin: "4px 0 0" }}>
                    각 캐릭터가 3회씩 들어갔는지 확인
                  </p>
                </div>
                <div style={{ width: "280px", maxWidth: "100%" }}>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="캐릭터, 직업, 유저 검색"
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
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardPad}>
              <h2 style={{ ...styles.sectionTitle, fontSize: "22px" }}>검증 상세</h2>
              <p style={{ ...styles.smallText, marginTop: "4px" }}>
                동일 인물/직업 중복, 3회 미달 캐릭터를 표시합니다.
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
        </section>
      </div>
    </main>
  );
}
