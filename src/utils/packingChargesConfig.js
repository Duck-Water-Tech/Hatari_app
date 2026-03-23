// Items that have NO packing charges
export const NO_PACKING_ITEMS = [
  'Chicken Momo ( Fried)',
  'Chicken Lolipop',
  'Crunchy Fried Chicken',
  'Crispy Chicken',
  'Crispy Fish',
  'Golden Fried Baby Corn',
  'Crispy Golden Prawn',
  'Fried Prawns Small',
  'Crispy Veg',
  'Tandoori Chicken',
  'Tandoori Roti',
  'Butter Roti',
  'Masala Kulcha',
  'Butter Naan',
  'Plain Naan',
  'kabuli Naan',
  'Aloo Paratha',
  'Peas Paratha',
  'Plain Paratha',
  'Fried Fish With Chips',
  'Fish Fingers',
  'French Fry',
];

/**
 * Normalize item names so small API differences still match.
 */
const normalizeItemName = name => {
  if (!name) return '';

  return String(name)
    .toLowerCase()
    .replace(/[()]/g, ' ') // keep words inside parentheses but ignore the brackets
    .replace(/[^a-z0-9\s]/g, ' ') // remove punctuation/special chars
    .replace(/\s+/g, ' ')
    .trim();
};

// Optional aliases for common API naming differences.
const NO_PACKING_ALIASES = [
  'chicken lollipop',
  'chicken momo fried',
  'kabuli naan',
  'french fries',
];

const NORMALIZED_NO_PACKING_ITEMS = [
  ...NO_PACKING_ITEMS,
  ...NO_PACKING_ALIASES,
].map(normalizeItemName);

const isExemptItem = itemName => {
  if (!itemName) return false;

  const normalizedInputName = normalizeItemName(itemName);
  if (!normalizedInputName) return false;

  return NORMALIZED_NO_PACKING_ITEMS.includes(normalizedInputName);
};

/**
 * Determine if an item should have packing charges
 * LOGIC:
 * - Only items explicitly listed in NO_PACKING_ITEMS/NO_PACKING_ALIASES → NO packing charge (₹0)
 * - All other API items → APPLY packing charge from backend settings
 * 
 * @param {string} itemName - The name of the item from API
 * @param {number} packingChargePerItem - The per-item packing charge from delivery settings
 * @returns {number} - The packing charge amount (0 if exempt, otherwise the per-item charge)
 */
export const getPackingCharge = (itemName, packingChargePerItem = 0) => {
  if (!itemName) return packingChargePerItem;

  const isExempt = isExemptItem(itemName);

  return isExempt ? 0 : packingChargePerItem;
};

/**
 * Calculate total packing charges for all items in cart
 * 
 * LOGIC:
 * - For each item in cart:
 *   - If item name exactly matches the whitelist after normalization → charge = ₹0
 *   - If item is from API/not in whitelist → charge = packingChargePerItem × quantity
 * - Returns total packing fee for the entire order
 * 
 * @param {Array} cartItems - Array of cart items from Redux
 * @param {number} packingChargePerItem - The per-item packing charge from API settings (delivery_settings)
 * @returns {number} - Total packing charge for the order
 */
export const calculateTotalPackingCharge = (cartItems, packingChargePerItem = 0) => {
  return cartItems.reduce((total, item) => {
    // Check if this item is exempt from packing charges
    const itemPackingCharge = getPackingCharge(item.name, packingChargePerItem);
    
    // Multiply by quantity (packing charge per item × item quantity)
    return total + (itemPackingCharge * item.quantity);
  }, 0);
};
