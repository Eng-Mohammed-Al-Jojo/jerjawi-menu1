import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiMinus, FiPlus, FiShoppingCart, FiX } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
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

const sectionAnim = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

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
  const isFeatured = item.star || (item as any).isFeatured;

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
    if (activeOption) commitAdd(activeOption.price, activeOption.type);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          {/* Bottom sheet — mobile first */}
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
            className="relative w-full sm:max-w-md bg-(--menu-card-bg) rounded-t-3xl sm:rounded-3xl shadow-premium overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh]"
          >
            {/* Drag handle */}
            <div className="pt-2.5 pb-0.5 flex justify-center shrink-0 relative z-10">
              <div className="w-10 h-1.5 rounded-full bg-(--menu-border)" />
            </div>

            {/* Hero image */}
            <div className="relative h-52 sm:h-64 shrink-0 overflow-hidden bg-(--menu-surface)">
              <motion.img
                key={imgSrc}
                initial={{ scale: 1.08, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                src={imgSrc}
                alt={itemName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/65 active:scale-95 transition-all"
              >
                <FiX size={16} />
              </button>
              {isFeatured && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-(--menu-accent) text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
                  <FaFire size={11} />
                  {t("menu.featured") || "مميز"}
                </div>
              )}
            </div>

            {/* Content card overlapping hero */}
            <div className="relative -mt-6 rounded-t-3xl bg-(--menu-card-bg) flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pt-4 pb-3 space-y-5">
                {/* Title + price */}
                <motion.div {...sectionAnim} className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-black text-(--menu-text) leading-snug text-right">
                      {itemName}
                    </h2>
                    <p className="text-[11px] font-bold text-(--menu-text-muted) mt-1">
                      {ingredients.length > 0
                        ? `${ingredients.length} ${t("common.ingredients_count") || "مكوّنات"}`
                        : t('menu.no_description')}
                    </p>
                  </div>
                  {activeOption && (
                    <div className="flex items-center gap-1 bg-(--menu-primary-50) border border-(--menu-primary-200) px-3 py-2 rounded-2xl shrink-0">
                      <span className="text-xl font-black text-(--menu-primary-800) leading-none">{activeOption.price}</span>
                      <span className="text-[11px] font-bold text-(--menu-primary-700)">₪</span>
                    </div>
                  )}
                </motion.div>

                <div className="h-px bg-(--menu-border)" />

                {/* Price options */}
                {orderableOptions.length > 1 && (
                  <motion.div {...sectionAnim} transition={{ delay: 0.05 }} className="space-y-2.5">
                    <p className="text-[11px] font-black text-(--menu-text-muted) uppercase tracking-widest">
                      {t("menu.choose_price") || "اختر السعر"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {orderableOptions.map((opt, idx) => {
                        const selected = selectedPriceIdx === idx;
                        const radioBorder = selected ? "border-(--menu-primary)" : "border-(--menu-border-strong)";
                        const cardState = selected
                          ? "bg-(--menu-primary-50) border-(--menu-primary) shadow-soft"
                          : "bg-(--menu-surface) border-(--menu-border)";
                        return (
                          <button
                            key={`${opt.type}-${opt.price}-${idx}`}
                            onClick={() => setSelectedPriceIdx(idx)}
                            className={"relative h-14 rounded-2xl border-2 px-3 transition-all active:scale-95 flex items-center justify-between gap-2 " + cardState}
                          >
                            <span className="flex items-center gap-1.5 min-w-0">
                              <span className={"w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center " + radioBorder}>
                                {selected && <FiCheck size={11} className="text-(--menu-primary)" strokeWidth={4} />}
                              </span>
                              <span className="text-base font-black text-(--menu-text) leading-none">{opt.price}₪</span>
                            </span>
                            {opt.label && (
                              <span className="text-[10px] font-bold text-(--menu-text-muted) uppercase shrink-0">{opt.label}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Ingredients */}
                {ingredients.length > 0 && (
                  <motion.div {...sectionAnim} transition={{ delay: 0.1 }} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black text-(--menu-text-muted) uppercase tracking-widest">
                        {t('admin.ingredients_label')}
                      </p>
                      <span className="text-[10px] font-black text-(--menu-primary-700) bg-(--menu-primary-50) border border-(--menu-primary-200) px-2 py-0.5 rounded-full">
                        {ingredients.length}
                      </span>
                    </div>
                    <div className="bg-(--menu-surface) border border-(--menu-border) rounded-2xl divide-y divide-(--menu-border) overflow-hidden">
                      {ingredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 px-3.5 py-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-(--menu-primary) shrink-0" />
                          <span className="text-[13px] font-bold text-(--menu-text) leading-relaxed">{ing}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Quantity */}
                {isCurrentTabOrderingEnabled && (
                  <motion.div {...sectionAnim} transition={{ delay: 0.15 }} className="flex items-center justify-between bg-(--menu-surface) border border-(--menu-border) rounded-2xl py-2 px-2 pr-4">
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
                  </motion.div>
                )}

                {/* Not orderable notice */}
                {!isCurrentTabOrderingEnabled && (
                  <div className="bg-(--menu-surface) border border-(--menu-border) rounded-2xl px-4 py-3 text-center">
                    <p className="text-xs font-bold text-(--menu-text-muted)">
                      {t("common.unavailable") || "غير متاح للطلب حالياً"}
                    </p>
                  </div>
                )}
              </div>

              {/* Sticky footer */}
              {isCurrentTabOrderingEnabled && activeOption && (
                <div className="px-4 pt-2 bg-(--menu-card-bg) border-t border-(--menu-border) shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
            </div>

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
