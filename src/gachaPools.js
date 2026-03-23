// ============================================================
//  GACHA POOLS
//  Add new categories and items here freely.
//  Each item needs: id, name, emoji, multiplier, rarity, weight
//  Weight controls drop chance (higher = more common)
// ============================================================

const GACHA_POOLS = {
  "eyes-of-naruto": {
    displayName: "Eyes of Naruto",
    emoji: "👁️",
    spinCost: 50,
    description: "Legendary dojutsu from the ninja world",
    items: [
      { id: "sharingan",          name: "Sharingan",              emoji: "🔴", multiplier: 1.5,  rarity: "Common",    weight: 40 },
      { id: "byakugan",           name: "Byakugan",               emoji: "⚪", multiplier: 1.8,  rarity: "Common",    weight: 35 },
      { id: "mangekyou",          name: "Mangekyou Sharingan",    emoji: "🌀", multiplier: 3.0,  rarity: "Rare",      weight: 15 },
      { id: "rinnegan",           name: "Rinnegan",               emoji: "🟣", multiplier: 5.0,  rarity: "Epic",      weight: 7  },
      { id: "tenseigan",          name: "Tenseigan",              emoji: "💠", multiplier: 6.5,  rarity: "Epic",      weight: 5  },
      { id: "eternal_mangekyou",  name: "Eternal Mangekyou",      emoji: "✨", multiplier: 8.0,  rarity: "Legendary", weight: 2  },
      { id: "juubi_rinnegan",     name: "Six Paths Rinnegan",     emoji: "🌟", multiplier: 12.0, rarity: "Legendary", weight: 1  },
    ]
  },

  "swords": {
    displayName: "Sacred Swords",
    emoji: "⚔️",
    spinCost: 75,
    description: "Mythical blades of incredible power",
    items: [
      { id: "iron_sword",     name: "Iron Sword",         emoji: "🗡️",  multiplier: 1.2,  rarity: "Common",    weight: 40 },
      { id: "steel_sword",    name: "Steel Sword",        emoji: "⚔️",  multiplier: 1.6,  rarity: "Common",    weight: 30 },
      { id: "flameblade",     name: "Flameblade",         emoji: "🔥",  multiplier: 2.5,  rarity: "Rare",      weight: 16 },
      { id: "frostbite",      name: "Frostbite",          emoji: "❄️",  multiplier: 3.5,  rarity: "Rare",      weight: 8  },
      { id: "thunderfang",    name: "Thunderfang",        emoji: "⚡",  multiplier: 5.5,  rarity: "Epic",      weight: 4  },
      { id: "excalibur",      name: "Excalibur",          emoji: "🌠",  multiplier: 10.0, rarity: "Legendary", weight: 2  },
    ]
  },

  "auras": {
    displayName: "Battle Auras",
    emoji: "💫",
    spinCost: 30,
    description: "Auras that enhance your combat presence",
    items: [
      { id: "dim_aura",       name: "Dim Aura",           emoji: "🌫️",  multiplier: 1.1,  rarity: "Common",    weight: 45 },
      { id: "flame_aura",     name: "Flame Aura",         emoji: "🔶",  multiplier: 1.4,  rarity: "Common",    weight: 30 },
      { id: "storm_aura",     name: "Storm Aura",         emoji: "🌪️",  multiplier: 2.2,  rarity: "Rare",      weight: 15 },
      { id: "divine_aura",    name: "Divine Aura",        emoji: "🌤️",  multiplier: 4.0,  rarity: "Epic",      weight: 7  },
      { id: "void_aura",      name: "Void Aura",          emoji: "🌑",  multiplier: 7.0,  rarity: "Legendary", weight: 3  },
    ]
  }
};

// ============================================================
//  MOB DEFINITIONS
//  Mobs encountered in /fight
// ============================================================

const MOBS = [
  { name: "Slime",        emoji: "🟢", minTokens: 10, maxTokens: 20, difficulty: "easy"   },
  { name: "Goblin",       emoji: "👺", minTokens: 15, maxTokens: 30, difficulty: "easy"   },
  { name: "Orc",          emoji: "👹", minTokens: 25, maxTokens: 45, difficulty: "medium" },
  { name: "Dark Knight",  emoji: "🗡️",  minTokens: 40, maxTokens: 70, difficulty: "medium" },
  { name: "Dragon",       emoji: "🐉", minTokens: 60, maxTokens: 100, difficulty: "hard"  },
  { name: "Demon Lord",   emoji: "😈", minTokens: 80, maxTokens: 130, difficulty: "hard"  },
];

// Fight cooldown in milliseconds (default: 30 seconds)
const FIGHT_COOLDOWN_MS = 3 * 1000;

module.exports = { GACHA_POOLS, MOBS, FIGHT_COOLDOWN_MS };
