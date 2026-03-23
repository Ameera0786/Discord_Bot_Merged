/**
 * Performs a weighted random roll from a gacha pool.
 * @param {Object} pool - A pool from GACHA_POOLS
 * @returns {Object} - The rolled item
 */
function rollGacha(pool) {
  const totalWeight = pool.items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const item of pool.items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  // Fallback (should never happen)
  return pool.items[0];
}

/**
 * Returns a rarity color for embeds
 */
function rarityColor(rarity) {
  const colors = {
    Common:    0x9e9e9e,
    Rare:      0x2196f3,
    Epic:      0x9c27b0,
    Legendary: 0xff9800,
  };
  return colors[rarity] ?? 0xffffff;
}

/**
 * Returns a rarity star string
 */
function rarityStars(rarity) {
  const stars = { Common: "⭐", Rare: "⭐⭐", Epic: "⭐⭐⭐", Legendary: "⭐⭐⭐⭐" };
  return stars[rarity] ?? "⭐";
}

/**
 * Given an array of inventory items for a category, returns the best one.
 */
function getBestItem(items) {
  if (!items || items.length === 0) return null;
  return items.reduce((best, item) => item.multiplier > best.multiplier ? item : best);
}

/**
 * Format a multiplier for display
 */
function fmtMultiplier(mult) {
  return `x${mult.toFixed(1)}`;
}

module.exports = { rollGacha, rarityColor, rarityStars, getBestItem, fmtMultiplier };
