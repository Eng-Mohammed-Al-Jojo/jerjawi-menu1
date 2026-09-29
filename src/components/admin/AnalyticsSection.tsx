import { useMemo } from "react";
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getChartData } from "../../utils/accountingUtils";
import { FiBarChart2, FiClock, FiLayers } from "react-icons/fi";

interface Props {
    orders: any[];
}

export default function AnalyticsSection({ orders }: Props) {
    const { t } = useTranslation();
    const data = useMemo(() => getChartData(orders), [orders]);

    const COLORS = ['#355152', '#B7303E', '#F59E0B', '#10B981'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 my-4 sm:my-6">
            
            {/* Sales Trend Line Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-soft flex flex-col gap-4 group hover:shadow-premium transition-all"
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-[11px] sm:text-xs font-black text-gray-900 uppercase tracking-[0.14em] truncate">{t('admin.sales_trend') || "اتجاه المبيعات (7 أيام)"}</h3>
                    <div className="w-9 h-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                         <FiBarChart2 size={16} />
                    </div>
                </div>
                <div className="h-44 sm:h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.dailyTrend}>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '700', fill: '#94A3B8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '700', fill: '#94A3B8' }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: '800', padding: '15px' }}
                                labelStyle={{ color: '#94A3B8', marginBottom: '6px' }}
                                cursor={{ stroke: '#355152', strokeWidth: 2, strokeDasharray: '5 5' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#355152" 
                                strokeWidth={3} 
                                dot={{ fill: '#355152', strokeWidth: 2, r: 4, stroke: '#fff' }} 
                                activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff' }}
                                animationDuration={2000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Hourly Sales Bar Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-soft flex flex-col gap-4 group hover:shadow-premium transition-all"
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-[11px] sm:text-xs font-black text-gray-900 uppercase tracking-[0.14em] truncate">{t('admin.peak_hours') || "ساعات الذروة اليوم"}</h3>
                    <div className="w-9 h-9 rounded-xl bg-secondary/5 text-secondary flex items-center justify-center">
                         <FiClock size={16} />
                    </div>
                </div>
                <div className="h-44 sm:h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.hourly}>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '700', fill: '#94A3B8' }} dy={10} />
                            <Tooltip 
                                cursor={{ fill: '#F8FAFC' }}
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: '800', padding: '15px' }}
                            />
                            <Bar dataKey="value" fill="#B7303E" radius={[6, 6, 0, 0]} barSize={22} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Order Distribution Pie Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-soft flex flex-col items-center gap-4 group hover:shadow-premium transition-all lg:col-span-2"
            >
                <div className="w-full flex justify-between items-center">
                    <h3 className="text-[11px] sm:text-xs font-black text-gray-900 uppercase tracking-[0.14em] truncate">{t('admin.order_distribution') || "توزيع الطلبات"}</h3>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/5 text-amber-500 flex items-center justify-center">
                         <FiLayers size={16} />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center w-full gap-6">
                    <div className="h-44 sm:h-52 w-full md:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={6}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {data.distribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: '800', padding: '15px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:w-1/2">
                        {data.distribution.map((entry, index) => (
                            <div key={entry.name} className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-soft">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{entry.name}</span>
                                </div>
                                <div className="text-[15px] font-black text-gray-900">{entry.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
