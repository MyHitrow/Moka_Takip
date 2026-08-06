'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useData } from '@/context/data-context';
import { EXPENSE_CATEGORY_LABELS } from '@/lib/constants';
import { Building, Users, PieChart as PieIcon, CreditCard, Sparkles } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  personnel: '#E32636',   // Kırmızı / Pembe (Personel & Avans)
  office: '#3B82F6',      // Mavi (Ofis)
  transportation: '#10B981', // Yeşil (Ulaşım)
  food: '#F59E0B',        // Amber (Yemek)
  equipment: '#8B5CF6',   // Mor (Ekipman)
  software: '#EC4899',    // Pembe (Yazılım)
  advertising: '#06B6D4', // Cyan (Reklam)
  tax: '#6B7280',         // Gri (Vergi)
  freelance: '#F97316',   // Turuncu (Freelance)
  other: '#A855F7',       // Açık Mor (Diğer)
};

export function ExpenseChartWidget() {
  const { giderler } = useData();

  const { chartData, categoryTotals, totalExpense, officeTotal, personnelTotal } = useMemo(() => {
    const totals: Record<string, number> = {};
    let total = 0;
    let office = 0;
    let personnel = 0;

    giderler.forEach((item) => {
      const amt = Number(item.amount || 0);
      total += amt;
      const catKey = item.category || 'other';
      totals[catKey] = (totals[catKey] || 0) + amt;

      if (catKey === 'office') office += amt;
      if (catKey === 'personnel') personnel += amt;
    });

    const data = Object.entries(totals).map(([catKey, amount]) => ({
      name: EXPENSE_CATEGORY_LABELS[catKey] || catKey,
      value: amount,
      color: CATEGORY_COLORS[catKey] || '#A855F7',
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    })).sort((a, b) => b.value - a.value);

    return {
      chartData: data,
      categoryTotals: totals,
      totalExpense: total,
      officeTotal: office,
      personnelTotal: personnel,
    };
  }, [giderler]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Sol Kart: Pie / Donut Chart */}
      <Card className="lg:col-span-2 bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
        <CardHeader className="pb-3 border-b border-[#2B2D32] flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#E32636]/10 p-2 rounded-lg text-[#E32636]">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-[#F7F7F8]">Gider Dağılım Grafiği</CardTitle>
              <p className="text-[11px] text-[#73767E]">Kategorilere göre net harcama oranları</p>
            </div>
          </div>
          <span className="bg-[#1D1F23] border border-[#2B2D32] text-xs text-[#B5B7BD] rounded-md px-2.5 py-1 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Kategori Analizi
          </span>
        </CardHeader>

        <CardContent className="p-5">
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-[#73767E]">
              Grafik oluşturmak için henüz harcama kaydı bulunmuyor.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Donut Chart */}
              <div className="h-52 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#17181B" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Tutar']}
                      contentStyle={{
                        backgroundColor: '#111214',
                        borderColor: '#2B2D32',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#F7F7F8',
                        fontWeight: 'bold',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center text in donut chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-extrabold text-[#73767E] tracking-wider">TOPLAM</span>
                  <span className="text-sm font-black text-[#F7F7F8] mt-0.5">{formatCurrency(totalExpense)}</span>
                </div>
              </div>

              {/* Kategori Yüzdelik Listesi */}
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {chartData.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-semibold text-[#F7F7F8] truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-[#F7F7F8]">{formatCurrency(cat.value)}</span>
                        <span className="text-[10px] font-bold text-[#73767E] bg-[#24262B] px-1.5 py-0.5 rounded font-mono">
                          %{cat.percentage}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-[#24262B] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sağ Kart: Net Harcama Özet Kartları (Net Ofis & Net Personel/Avans) */}
      <div className="space-y-4 flex flex-col justify-between">
        {/* Net Ofis Harcamaları */}
        <Card className="p-5 bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400 border border-blue-500/20">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Ofis & Operasyon
              </span>
            </div>
            <span className="text-xs font-medium text-[#73767E] block">Net Ofis Harcamaları</span>
            <h3 className="text-2xl font-extrabold text-[#F7F7F8] mt-1 tracking-tight">
              {formatCurrency(officeTotal)}
            </h3>
          </div>
          <div className="pt-3 border-t border-[#2B2D32] mt-3 flex items-center justify-between text-xs text-[#73767E]">
            <span>Toplam Gider Payı</span>
            <span className="font-bold text-blue-400 font-mono">
              %{totalExpense > 0 ? Math.round((officeTotal / totalExpense) * 100) : 0}
            </span>
          </div>
        </Card>

        {/* Net Personel & Avans Harcamaları */}
        <Card className="p-5 bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="bg-[#E32636]/10 p-2.5 rounded-xl text-[#E32636] border border-[#E32636]/20">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#E32636] bg-[#E32636]/10 px-2 py-0.5 rounded-full border border-[#E32636]/20">
                Personel & Avans
              </span>
            </div>
            <span className="text-xs font-medium text-[#73767E] block">Net Personel / Avans Harcamaları</span>
            <h3 className="text-2xl font-extrabold text-[#F7F7F8] mt-1 tracking-tight">
              {formatCurrency(personnelTotal)}
            </h3>
          </div>
          <div className="pt-3 border-t border-[#2B2D32] mt-3 flex items-center justify-between text-xs text-[#73767E]">
            <span>Toplam Gider Payı</span>
            <span className="font-bold text-[#E32636] font-mono">
              %{totalExpense > 0 ? Math.round((personnelTotal / totalExpense) * 100) : 0}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
