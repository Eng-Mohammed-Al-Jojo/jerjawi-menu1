import React, { useCallback } from "react";
import { type Item } from "./Menu";
import { FaFire } from "react-icons/fa";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiShoppingCart } from "react-icons/fi";
import { useMenuStore } from "../../store/useMenuStore";
import { getItemOrderPermissions, getMenuPricesForType } from "../../utils/priceUtils";

interface Props {
  item: Item;
  orderSystem: boolean;
  onClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

const ItemRow = React.memo(({ item, orderSystem, onClick, onDetailsClick }: Props) => {
  const { t } = useTranslation();
  const { selectedOrderMode, orderModesConfig } = useMenuStore();

  // ── Price normalization ────────────────────────────────────────
  const priceOptions = getMenuPricesForType(item, selectedOrderMode);
  const itemOrderPermissions = getItemOrderPermissions(item, orderModesConfig);

  // ── Guards ────────────────────────────────────────────────────
  const unavailable = item.visible === false;
  const itemName = item.nameAr || item.name || "";
  const description = item.ingredientsAr || item.ingredients || "";

  const isCurrentTabOrderingEnabled = itemOrderPermissions[selectedOrderMode];

  const canOrder = !unavailable && orderSystem && isCurrentTabOrderingEnabled;

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Bottom-sheet details first (beautiful + consistent)
      if (onDetailsClick) onDetailsClick(item);
      else onClick?.(item);
    },
    [item, onClick, onDetailsClick]
  );

  const handleOrderClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!canOrder) return;
      onClick?.(item);
    },
    [canOrder, item, onClick]
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        viewport={{ once: true, margin: "50px" }}
        className={`
          relative flex items-center justify-between w-full rounded-2xl border border-(--menu-border)
          min-h-[88px] py-1.5 pr-28 pl-2 bg-(--menu-card-elevated) my-1 mr-1
          transition-all duration-300 group shadow-soft
          ${unavailable ? "opacity-60 grayscale mt-4 mb-4" : "hover:bg-(--menu-surface) cursor-pointer active:scale-[0.99]"}
        `}
        onClick={handleCardClick}
      >
        {/* IMAGE */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 translate-x-1/2 w-24 h-24 z-10">
          <img
            src={item.image ? `/images/${item.image}` : "/logo.png"}
            alt={itemName}
            loading="lazy"
            className="w-full h-full rounded-2xl object-cover shadow-md border-2 border-(--menu-primary) transition-transform duration-500 group-hover:scale-105 bg-(--menu-surface)"
            onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
          />
          {(item.star || (item as any).isFeatured) && !unavailable && (
            <div className="absolute -top-1 -right-1 bg-(--menu-accent) text-(--menu-card-elevated) p-1.5 rounded-full shadow-lg border-2 border-(--menu-card-elevated)">
              <FaFire size={10} />
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 text-right overflow-hidden min-w-0">
          <h3 className="text-[15px] sm:text-base font-bold text-(--menu-text) mb-0.5 leading-snug truncate">
            {itemName}
          </h3>
          <p className="text-[11px] sm:text-xs text-(--menu-text-muted) line-clamp-1 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* PRICE + BUTTON */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 min-w-[76px] pl-1.5">
          <div className="flex flex-col items-end gap-1">
            {priceOptions.length > 0 ? (
              <div className="flex flex-row flex-wrap items-center justify-end gap-1">
                {priceOptions.map((option, idx) => (
                  <span
                    key={`${option.type}-${option.price}-${idx}`}
                    className="flex items-center gap-0.5 rounded-full bg-(--menu-surface) border border-(--menu-border) px-2 py-0.5"
                  >
                    <span className="text-(--menu-primary-800) font-black text-[13px] leading-none">
                      {option.price}
                    </span>
                    <span className="text-[9px] font-bold text-(--menu-primary-700)">₪</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] font-bold text-(--menu-text-muted)">—</span>
            )}
          </div>

          {canOrder && (
            <button
              onClick={handleOrderClick}
              className="bg-(--menu-accent) hover:bg-(--menu-accent-600) text-(--menu-card-elevated) w-8 h-8 rounded-full text-xs font-black shadow-soft transition-all active:scale-95 whitespace-nowrap flex items-center justify-center"
              aria-label={t("common.add_to_order") || "إضافة للطلب"}
            >
              <FiShoppingCart size={13} />
            </button>
          )}


          {unavailable && (
            <span className="bg-(--menu-surface) text-(--menu-text-muted) px-3 py-1 rounded-full text-[10px] font-bold">
              {t("common.unavailable")}
            </span>
          )}
        </div>
      </motion.div>

    </>
  );
});

export default ItemRow;
