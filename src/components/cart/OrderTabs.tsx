import { useState } from "react";
import type { RefObject } from "react";
import { FiUser, FiGrid, FiMessageSquare, FiPhone } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FaMotorcycle, FaUtensils } from "react-icons/fa";
import { useMenuStore } from "../../store/useMenuStore";

interface OrderTabsProps {
    onConfirm: (
        type: "in" | "out",
        customerData: { name: string; table?: string; phone?: string; address?: string; notes?: string; },
        message: string
    ) => void;
    firstInputRef?: RefObject<HTMLInputElement | null>;
    disableSend?: boolean;
    submitting?: boolean;
}

export default function OrderTabs({ onConfirm, firstInputRef, disableSend, submitting }: OrderTabsProps) {
    const { items, totalPrice } = useCart();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [activeTab, setActiveTab] = useState<"in" | "out">("in");
    const [form, setForm] = useState({ name: "", table: "", phone: "", notes: "" });
    const [error, setError] = useState<string | null>(null);

    const { orderModesConfig } = useMenuStore();
    const canDineIn = orderModesConfig.dineInEnabled;
    const canTakeaway = orderModesConfig.takeawayEnabled;

    // Auto-switch tab if only one is enabled
    useState(() => {
        if (!canDineIn && canTakeaway) setActiveTab("out");
        else if (canDineIn && !canTakeaway) setActiveTab("in");
    });

    const validateForm = () => {
        if (!form.name.trim()) { setError(t('common.name_required')); return false; }
        if (activeTab === "in" && !form.table.trim()) { setError(t('common.table_required')); return false; }
        if (activeTab === "out" && !form.phone.trim()) { setError(t('common.phone_required')); return false; }
        if (items.length === 0) { setError(t('common.empty_cart')); return false; }
        setError(null);
        return true;
    };

    const buildMessage = () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString(isRtl ? "ar-EG" : "en-US");
        const timeStr = now.toLocaleTimeString(isRtl ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" });
        const list = items.map(i => {
            const nm = isRtl ? (i as any).nameAr || i.name : (i as any).nameEn || i.name;
            return `🔹 ${i.qty} × ${nm} → ${i.selectedPrice * i.qty}₪`;
        }).join("\n");

        const orderTypeStr = activeTab === "in" ? t('common.dine_in') : t('common.takeaway');
        const locationInfo = activeTab === "in"
            ? `🍽️ *${t('whatsapp.table_number')}:* ${form.table}`
            : `📱 *${t('whatsapp.phone')}:* ${form.phone}`;

        return `✨ *${orderTypeStr}* ✨\n========================\n${list}\n========================\n💰 *${t('common.total')}:* ${totalPrice}₪\n========================\n\n👤 *${t('whatsapp.customer_name')}:* ${form.name}\n${locationInfo}\n📝 *${t('whatsapp.notes')}:* ${form.notes || "—"}\n\n⏰ *${t('whatsapp.time')}:* ${timeStr}\n📅 *${t('whatsapp.date')}:* ${dateStr}\n\n💵 ${t('whatsapp.payment_cashier')}\n========================`;
    };

    const submit = () => {
        if (!validateForm()) return;
        onConfirm(activeTab, { name: form.name, table: form.table, phone: form.phone, notes: form.notes }, buildMessage());
    };

    const inputCls = `w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-4 focus:ring-primary/8 transition-all shadow-sm`;
    const iconCls = `absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`;

    return (
        <div className="space-y-5">
            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="text-xs font-bold text-secondary bg-secondary-50 px-4 py-3 rounded-2xl text-center border border-secondary-100"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            {canDineIn && canTakeaway && (
                <div className="flex bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
                    <button
                        onClick={() => { setActiveTab("in"); setError(null); }}
                        className={`flex-1 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all ${activeTab === "in" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        <FaUtensils size={14} />
                        {t('common.dine_in')}
                    </button>
                    <button
                        onClick={() => { setActiveTab("out"); setError(null); }}
                        className={`flex-1 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all ${activeTab === "out" ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        <FaMotorcycle size={16} />
                        {t('common.takeaway')}
                    </button>
                </div>
            )}

            {/* Fields */}
            <div className="space-y-3">
                <div className="relative">
                    <FiUser className={`${iconCls} ${isRtl ? 'right-4' : 'left-4'}`} size={16} />
                    <input
                        ref={firstInputRef}
                        placeholder={t('common.customer_name')}
                        className={inputCls + (isRtl ? ' pr-11 pl-5' : ' pl-11 pr-5')}
                        value={form.name}
                        onChange={e => { setError(null); setForm({ ...form, name: e.target.value }); }}
                    />
                </div>

                {activeTab === "in" ? (
                    <div className="relative">
                        <FiGrid className={`${iconCls} ${isRtl ? 'right-4' : 'left-4'}`} size={16} />
                        <input
                            placeholder={t('common.table_number')}
                            className={inputCls + (isRtl ? ' pr-11 pl-5' : ' pl-11 pr-5')}
                            value={form.table}
                            onChange={e => { setError(null); setForm({ ...form, table: e.target.value }); }}
                        />
                    </div>
                ) : (
                    <div className="relative">
                        <FiPhone className={`${iconCls} ${isRtl ? 'right-4' : 'left-4'}`} size={16} />
                        <input
                            type="tel"
                            placeholder={t('common.phone_number')}
                            className={inputCls + (isRtl ? ' pr-11 pl-5' : ' pl-11 pr-5')}
                            value={form.phone}
                            onChange={e => { setError(null); setForm({ ...form, phone: e.target.value }); }}
                        />
                    </div>
                )}

                <div className="relative">
                    <FiMessageSquare className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-4 text-gray-400 pointer-events-none`} size={16} />
                    <textarea
                        placeholder={t('common.notes_optional')}
                        rows={2}
                        className={inputCls + " resize-none " + (isRtl ? 'pr-11 pl-5' : 'pl-11 pr-5')}
                        value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                    />
                </div>
            </div>

            {/* Submit */}
            <button
                onClick={submit}
                disabled={disableSend || submitting}
                className="w-full py-5 rounded-3xl bg-primary text-white font-black text-base shadow-xl shadow-primary/25 hover:bg-primary-600 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
                {submitting ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : t('common.confirm_order')}
            </button>
        </div>
    );
}
