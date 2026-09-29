import { useState, useEffect } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiSettings, FiInfo, FiLayout, FiSmartphone } from "react-icons/fi";
import { FaWhatsapp, FaMotorcycle, FaUtensils, FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { useTranslation } from "react-i18next";

/* ================= Toast ================= */
function Toast({ type, message }: { type: "success" | "error"; message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 30, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-0 left-1/2 z-200 px-10 py-5 rounded-full shadow-premium text-white font-black flex items-center gap-4 backdrop-blur-xl border border-white/20 transition-all ${type === "success" ? "bg-emerald-500/95" : "bg-secondary/95"}`}
        >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                {type === "success" ? <FiCheck /> : "×"}
            </div>
            <span className="text-sm tracking-wide">{message}</span>
        </motion.div>
    );
}

/* ================= Simple Components ================= */
const inputClass = "w-full bg-gray-50 border border-gray-100 rounded-xl h-11 px-4 text-[13px] font-bold outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-300";

function ServiceCheckbox({ title, enabled, onToggle, value, setValue, disabled, icon: Icon, required, isWaMode }: any) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const showPhoneInput = isWaMode && enabled;

    return (
        <motion.div
            whileHover={!disabled ? { y: -2 } : {}}
            className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${enabled
                ? "bg-white border-primary/20 shadow-soft"
                : "bg-gray-50 border-gray-100 opacity-70 hover:opacity-100"
                } ${disabled ? "opacity-40 grayscale pointer-events-none" : ""}`}
        >
            <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all shrink-0 ${enabled
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-white text-gray-400 border border-gray-100"
                        }`}>
                        <Icon size={17} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-black text-[13px] sm:text-sm text-gray-900 tracking-tight truncate">{title}</span>
                        {required && enabled && !value.trim() && (
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-[9px] font-black text-secondary uppercase tracking-widest mt-0.5 bg-secondary/5 px-2 py-0.5 rounded-md w-fit border border-secondary/10"
                            >
                                {t('admin.required') || "مطلوب"}
                            </motion.span>
                        )}
                        {!isWaMode && enabled && (
                            <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest mt-0.5">
                                {t('admin.dashboard_managed') || "تدار عبر اللوحة"}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={onToggle}
                    disabled={disabled}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 border shrink-0 ${enabled ? "bg-emerald-500 border-emerald-600" : "bg-gray-200 border-gray-300"
                        }`}
                >
                    <motion.span
                        animate={{ x: enabled ? (isRtl ? 2 : 22) : (isRtl ? 22 : 2) }}
                        className="absolute top-[3px] left-0 w-[18px] h-[18px] rounded-full bg-white shadow-md z-10"
                    />
                </button>
            </div>

            <AnimatePresence>
                {showPhoneInput && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden relative z-10"
                    >
                        <div className="relative">
                            <div className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100`}>
                                <FaWhatsapp size={14} />
                            </div>
                            <input
                                type="tel"
                                value={value}
                                onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
                                placeholder={t('admin.whatsapp_placeholder')}
                                className={`${inputClass} ${isRtl ? 'pr-12 pl-3' : 'pl-12 pr-3'} ${required && !value.trim() ? 'border-secondary/30 bg-secondary/5' : ''}`}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ================= Modal ================= */
export default function OrderSettingsModal({ setShowOrderSettings, orderSettings: initialSettings, onSave }: any) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [orderSystem, setOrderSystem] = useState(true);
    const [orderMode, setOrderMode] = useState<"dashboard" | "whatsapp">("dashboard");
    const [inPhone, setInPhone] = useState("");
    const [outPhone, setOutPhone] = useState("");
    const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");
    const [footer, setFooter] = useState({ address: "", phone: "", whatsapp: "", facebook: "", instagram: "", tiktok: "" });
    const [dineInEnabled, setDineInEnabled] = useState(true);
    const [takeawayEnabled, setTakeawayEnabled] = useState(true);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<any>(null);

    useEffect(() => {
        if (!initialSettings) return;
        setOrderSystem(initialSettings.orderSystem ?? true);
        const s = initialSettings.orderSettings ?? {};
        setOrderMode(initialSettings.orderMode || "dashboard");
        setInPhone(s.inPhone || "");
        setOutPhone(s.outPhone || "");
        setComplaintsWhatsapp(initialSettings.complaintsWhatsapp || "");
        setFooter(initialSettings.footerInfo || {});

        const modes = initialSettings.orderModes || { dineInEnabled: true, takeawayEnabled: true };
        setDineInEnabled(!!modes.dineInEnabled);
        setTakeawayEnabled(!!modes.takeawayEnabled);

        setLoading(false);
    }, [initialSettings]);

    if (loading) return null;

    const handleSave = async () => {
        if (orderMode === "whatsapp") {
            const enabledAnyService = dineInEnabled || takeawayEnabled;
            if (!enabledAnyService) {
                setToast({ type: "error", message: t('admin.no_service_enabled') || "يجب تفعيل خدمة واحدة على الأقل" });
                setTimeout(() => setToast(null), 3000);
                return;
            }

            if ((dineInEnabled && inPhone.trim() === "") || (takeawayEnabled && outPhone.trim() === "")) {
                setToast({ type: "error", message: t('admin.whatsapp_required') });
                setTimeout(() => setToast(null), 3000);
                return;
            }
        }

        const newSettings = {
            orderSystem,
            orderMode,
            orderSettings: {
                inRestaurant: dineInEnabled,
                takeaway: takeawayEnabled,
                inPhone,
                outPhone
            },
            complaintsWhatsapp,
            footerInfo: footer,
            orderModes: {
                dineInEnabled,
                takeawayEnabled
            }
        };

        try {
            setSaving(true);
            await update(ref(db, "settings"), newSettings);
            onSave?.(newSettings);
            setToast({ type: "success", message: t('admin.settings_saved_success') });
            setTimeout(() => setShowOrderSettings(false), 1500);
        } catch (error) {
            setToast({ type: "error", message: t('admin.settings_save_error') });
            setSaving(false);
        }
    };

    return (
        <div className="admin-wrap fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderSettings(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.98 }}
                className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-gray-100 shadow-premium flex flex-col max-h-[92dvh] overflow-hidden z-10"
            >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-lg shadow-lg shadow-primary/20 shrink-0">
                            <FiSettings size={17} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-[15px] sm:text-base font-black text-gray-900 tracking-tight truncate">{t('admin.system_settings')}</h2>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate">{t('admin.system_config_desc')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowOrderSettings(false)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-all border border-gray-100 shrink-0"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar admin-dense-scroll">
                    {/* Order Module Toggle */}
                    <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${orderSystem ? "bg-primary text-white" : "bg-white text-gray-300"}`}>
                                <FiSmartphone size={17} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-black text-[13px] text-gray-900 leading-tight truncate">{t('admin.enable_web_ordering')}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{orderSystem ? "النظام مفعل حالياً" : "النظام معطل"}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setOrderSystem((p) => !p)}
                            className={`relative w-12 h-[26px] rounded-full transition-all duration-300 border shrink-0 ${orderSystem ? "bg-emerald-500 border-emerald-600" : "bg-gray-200 border-gray-300"}`}
                        >
                            <motion.span animate={{ x: orderSystem ? (isRtl ? 2 : 24) : (isRtl ? 24 : 2) }} className="absolute top-[3px] left-0 w-[18px] h-[18px] rounded-full bg-white shadow-md" />
                        </button>
                    </div>

                    {/* Order Source Mode Switcher */}
                    <div className="space-y-2.5">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400 px-0.5">{t('admin.order_source_mode') || "طريقة استقبال الطلبات"}</h3>
                        <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                            <button
                                onClick={() => setOrderMode("dashboard")}
                                className={`flex items-center gap-2.5 p-3 rounded-xl transition-all duration-300 ${orderMode === "dashboard"
                                    ? "bg-white text-primary shadow-soft border border-primary/10"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all shrink-0 ${orderMode === "dashboard" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-100"}`}>
                                    <FiLayout size={15} />
                                </div>
                                <div className="text-right min-w-0">
                                    <span className="font-black text-[13px] block truncate">{t('admin.mode_dashboard')}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">لوحة التحكم</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setOrderMode("whatsapp")}
                                className={`flex items-center gap-2.5 p-3 rounded-xl transition-all duration-300 ${orderMode === "whatsapp"
                                    ? "bg-white text-emerald-600 shadow-soft border border-emerald-500/10"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all shrink-0 ${orderMode === "whatsapp" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-gray-100"}`}>
                                    <FaWhatsapp size={15} />
                                </div>
                                <div className="text-right min-w-0">
                                    <span className="font-black text-[13px] block truncate">{t('admin.mode_whatsapp')}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">واتساب مباشر</span>
                                </div>
                            </button>
                        </div>
                        <AnimatePresence>
                            {orderMode === "whatsapp" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700 shadow-sm mx-2"
                                >
                                    <FiInfo className="shrink-0" />
                                    <p className="text-[10px] font-bold leading-relaxed">{t('admin.mode_warning')}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Modes (Services) Control */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-0.5">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">{t('admin.order_modes') || "الخدمات المتاحة"}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <ServiceCheckbox
                                title={t('admin.dine_in_mode') || "داخل الصالة"}
                                enabled={dineInEnabled}
                                onToggle={() => setDineInEnabled(!dineInEnabled)}
                                icon={FaUtensils}
                                isWaMode={orderMode === "whatsapp"}
                                value={inPhone}
                                setValue={setInPhone}
                                required={orderMode === "whatsapp"}
                            />
                            <ServiceCheckbox
                                title={t('admin.takeaway_mode') || "طلب خارجي / سفري"}
                                enabled={takeawayEnabled}
                                onToggle={() => setTakeawayEnabled(!takeawayEnabled)}
                                icon={FaMotorcycle}
                                isWaMode={orderMode === "whatsapp"}
                                value={outPhone}
                                setValue={setOutPhone}
                                required={orderMode === "whatsapp"}
                            />
                        </div>
                    </div>

                    {/* Complaints */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/5 border border-secondary/10 space-y-3 relative overflow-hidden">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/20 shrink-0">
                                <FiInfo size={17} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-black text-[13px] text-gray-900 tracking-tight truncate">{t('admin.complaints_whatsapp')}</h3>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest truncate">{t('admin.feedback_channel') || "قناة التواصل للشكاوى والملاحظات"}</p>
                            </div>
                        </div>
                        <div className="relative">
                            <FaWhatsapp size={15} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-secondary z-10`} />
                            <input
                                value={complaintsWhatsapp}
                                onChange={(e) => setComplaintsWhatsapp(e.target.value.replace(/\D/g, ""))}
                                placeholder={t('admin.whatsapp_placeholder')}
                                className={`${inputClass} ${isRtl ? 'pr-11 pl-3' : 'pl-11 pr-3'}`}
                            />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center border border-gray-100 shrink-0">
                                <FiLayout size={17} />
                            </div>
                            <h3 className="font-black text-[13px] text-gray-900 tracking-tight">{t('admin.footer_info')}</h3>
                        </div>

                        <div className="space-y-2.5">
                            <div className="relative group">
                                <FiLayout size={14} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-primary`} />
                                <input placeholder={t('admin.address_detail')} value={footer.address} onChange={(e) => setFooter({ ...footer, address: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-11' : 'pl-11'} bg-white!`} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="relative group">
                                    <FiSmartphone size={14} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-primary`} />
                                    <input placeholder={t('admin.primary_phone')} value={footer.phone} onChange={(e) => setFooter({ ...footer, phone: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-11' : 'pl-11'} bg-white!`} />
                                </div>
                                <div className="relative group">
                                    <FaWhatsapp size={14} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-emerald-500`} />
                                    <input placeholder={t('admin.contact_whatsapp')} value={footer.whatsapp} onChange={(e) => setFooter({ ...footer, whatsapp: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-11' : 'pl-11'} bg-white!`} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="relative group">
                                    <FaFacebook size={13} className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-blue-600`} />
                                    <input placeholder="FB" value={footer.facebook} onChange={(e) => setFooter({ ...footer, facebook: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-2' : 'pl-10 pr-2'} bg-white! text-xs`} />
                                </div>
                                <div className="relative group">
                                    <FaInstagram size={13} className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-pink-500`} />
                                    <input placeholder="IG" value={footer.instagram} onChange={(e) => setFooter({ ...footer, instagram: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-2' : 'pl-10 pr-2'} bg-white! text-xs`} />
                                </div>
                                <div className="relative group">
                                    <FaTiktok size={13} className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-black`} />
                                    <input placeholder="TT" value={footer.tiktok} onChange={(e) => setFooter({ ...footer, tiktok: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-2' : 'pl-10 pr-2'} bg-white! text-xs`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Save */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className={`admin-btn w-full h-11 rounded-xl font-black text-white shadow-lg flex items-center justify-center gap-2 transition-all ${saving
                            ? "bg-emerald-500/50 cursor-not-allowed"
                            : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
                            }`}
                    >
                        {saving ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                        ) : (
                            <FiCheck size={17} />
                        )}
                        <span className="text-[13px] uppercase tracking-widest">{t('admin.save_changes')}</span>
                    </motion.button>
                </div>

                <AnimatePresence>
                    {toast && (
                        <Toast type={toast.type} message={toast.message} />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
