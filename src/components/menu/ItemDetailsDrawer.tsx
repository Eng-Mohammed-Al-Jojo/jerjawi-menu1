import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMinus, FiPlus, FiShoppingCart, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { Item } from "./Menu";
import { getIngredientList } from "../../utils/stringUtils";
import { useCart } from "../../context/CartContext";
import { useMenuStore } from "../../store/useMenuStore";
import { toast } from "react-hot-toast";
import { getItemOrderPermissions, getMenuPriceOptions, isPriceTypeEnabled, type PriceType } from "../../utils/priceUtils";
import PricePicker from "./PricePicker";

interface Props {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  orderSystem: boolean;
}

export default function ItemDetailsDrawer({ item, isOpen, onClose, orderSystem }: Props) {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceIdx, setSelectedPriceIdx] = useState(0);
  const { selectedOrderMode, orderModesConfig } = useMenuStore();

  useEffect(() => {
    setQuantity(1);
    setSelectedPriceIdx(0);
    setPickerOpen(false);
  }, [item?.id, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!item) return null;

  const itemName = item.nameAr || item.name || "";
  const itemDescription = item.ingredientsAr || item.ingredients || "";
  const ingredients = getIngredientList(itemDescription);

  const priceOptions = getMenuPriceOptions(item);
  const hasDualPricing = priceOptions.length > 1;
  const itemOrderPermissions = getItemOrderPermissions(item, orderModesConfig);
  const orderableOptions = priceOptions.filter((option) => isPriceTypeEnabled(option.type, itemOrderPermissions));
  const isCurrentTabOrderingEnabled = orderSystem && itemOrderPermissions[selectedOrderMode];
  const activeOption = orderableOptions[selectedPriceIdx] || orderableOptions[0];
  const imgSrc = item.image ? `/images/${item.image}` : "/logo.png";

  const commitAdd = (price: number, priceType: PriceType, qty = quantity) => {
    if (!item || isAdding) return;
    setIsAdding(true);
    addItem(item, price, qty, priceType);
    toast.success(`${itemName} ${t('common.added_to_cart')}`, {
      icon: '🛒',
      position: 'top-center',
      style: {
        borderRadius: '16px',
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-color)',
        fontFamily: 'Cairo',
        fontWeight: 'bold',
        fontSize: '13px'
      }
    });
    setTimeout(() => {
      onClose();
      setIsAdding(false);
    }, 500);
  };

  const handleAddToOrder = () => {
    if (hasDualPricing && orderableOptions.length > 1 && pickerOpen === false && selectedPriceIdx === 0 && orderableOptions.length !== 1) {
      // inline selection is visible, just commit active option
    }
    if (activeOption) commitAdd(activeOption.price, activeOption.type);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 700) onClose();
            }}
            className="relative w-full sm:max-w-md bg-(--menu-card-bg) rounded-t-[1.75rem] shadow-premium overflow-hidden border-t border-x border-(--menu-border) flex flex-col max-h-[92dvh]"
          >
            {/* Drag handle */}
            <div className="pt-2.5 pb-1 flex justify-center shrink-0 bg-(--menu-card-bg) relative z-10">
              <div className="w-10 h-1.5 rounded-full bg-(--menu-border)" />
            </div>

            {/* Hero — clearer image, taller for detail */}
            <div className="relative h-56 sm:h-64 shrink-0 overflow-hidden bg-black">
              <img
                src={imgSrc}
                alt={itemName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" />
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/65 active:scale-95 transition-all"
              >
                <FiX size={16} />
              </button>
              <div className="absolute bottom-3.5 right-4 left-4 flex items-end justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-xl text-right flex-1 min-w-0 line-clamp-2">
                  {itemName}
                </h2>
                {activeOption && (
                  <div className="flex items-center gap-1 bg-white/95 backdrop-blur px-3 py-2 rounded-full border border-white/40 shrink-0 shadow-lg">
                    <span className="text-base font-black text-(--menu-primary-800) leading-none">{activeOption.price}</span>
                    <span className="text-[10px] font-bold text-(--menu-primary-700)">₪</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-5 pt-4 pb-3 space-y-4">
              {/* Prices */}
              {orderableOptions.length > 1 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-black text-(--menu-text-muted) uppercase tracking-widest px-0.5">
                    {t("menu.choose_price") || "اختر السعر"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {orderableOptions.map((opt, idx) => (
                      <button
                        key={`${opt.type}-${opt.price}-${idx}`}
                        onClick={() => setSelectedPriceIdx(idx)}
                        className={`h-11 rounded-xl border text-sm font-black transition-all active:scale-95 flex items-center justify-center gap-1 ${selectedPriceIdx === idx
                          ? "bg-(--menu-primary) text-white border-(--menu-primary) shadow-lg shadow-primary/20"
                          : "bg-(--menu-surface) text-(--menu-text) border-(--menu-border)"
                          }`}
                      >
                        {opt.price} <span className="text-[11px] opacity-80">₪</span>
                        {opt.label && <span className="text-[10px] opacity-60 font-bold">· {opt.label}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Ingredients */}
              <div className="space-y-2">
                <p className="text-[11px] font-black text-(--menu-text-muted) uppercase tracking-widest px-0.5">
                  {t('admin.ingredients_label')}
                </p>
                {ingredients.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold text-(--menu-text) bg-(--menu-surface) border border-(--menu-border) px-2.5 py-1.5 rounded-full"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-(--menu-text-muted) italic px-0.5">
                    {t('menu.no_description')}
                  </p>
                )}
              </div>

              {/* Quantity */}
              {isCurrentTabOrderingEnabled && (
                <div className="flex items-center justify-between bg-(--menu-surface) border border-(--menu-border) rounded-2xl p-2 pr-4">
                  <span className="text-xs font-black text-(--menu-text) uppercase tracking-widest">
                    {t("common.quantity") || "الكمية"}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-xl bg-white text-(--menu-text) flex items-center justify-center shadow-sm border border-(--menu-border) active:scale-95 transition-all"
                    >
                      <FiMinus size={15} />
                    </button>
                    <span className="text-base font-black w-6 text-center text-(--menu-text)">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 rounded-xl bg-white text-(--menu-text) flex items-center justify-center shadow-sm border border-(--menu-border) active:scale-95 transition-all"
                    >
                      <FiPlus size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {isCurrentTabOrderingEnabled && activeOption && (
              <div className="p-4 pt-2 bg-(--menu-card-bg) border-t border-(--menu-border) shrink-0">
                <button
                  onClick={handleAddToOrder}
                  disabled={isAdding}
                  className="w-full h-12 bg-(--menu-primary) text-white rounded-2xl font-black text-[15px] shadow-xl shadow-primary/25 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAdding ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiShoppingCart size={17} />
                      <span>{t("common.add_to_order")}</span>
                      <span className="opacity-40">|</span>
                      <span>{activeOption.price * quantity}₪</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {hasDualPricing && (
              <PricePicker
                isOpen={pickerOpen}
                onClose={() => setPickerOpen(false)}
                options={priceOptions}
                enabledTypes={itemOrderPermissions}
                onSelect={(p, type) => commitAdd(p, type)}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
