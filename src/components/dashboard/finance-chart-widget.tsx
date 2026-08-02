'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useData } from '@/context/data-context';

const chartData = [
  { name: '1 May', Gelir: 450000, Gider: 300000 },
  { name: '8 May', Gelir: 780000, Gider: 420000 },
  { name: '15 May', Gelir: 1050000, Gider: 580000 },
  { name: '22 May', Gelir: 920000, Gider: 510000 },
  { name: '29 May', Gelir: 1250000, Gider: 620000 },
];

export function FinanceChartWidget() {
  const { gelirler, giderler } = useData();

  const totalGelir = gelirler.reduce((acc, curr) => acc + curr.amount, 0) || 1250000;
  const totalGider = giderler.reduce((acc, curr) => acc + curr.amount, 0) || 620000;

  const formatMoney = (val: number) => `₺${(val / 1000).toLocaleString('tr-TR')}K`;

  return (
    <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
      <CardHeader className="pb-3 border-b border-[#2B2D32] flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-[#F7F7F8]">Gelir / Gider Özeti</CardTitle>
        <select className="bg-[#1D1F23] border border-[#2B2D32] text-xs text-[#B5B7BD] rounded-md px-2 py-1 font-semibold outline-none">
          <option value="bu-ay">Bu Ay</option>
          <option value="son-3-ay">Son 3 Ay</option>
          <option value="bu-yil">Bu Yıl</option>
        </select>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4 pb-2 border-b border-[#2B2D32]">
          <div>
            <span className="text-[11px] font-semibold text-[#73767E] block">Toplam Gelir</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base md:text-lg font-black text-[#F7F7F8]">₺1.250.000</span>
              <span className="text-xs font-bold text-[#E32636] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> %18
              </span>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#73767E] block">Toplam Gider</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base md:text-lg font-black text-[#F7F7F8]">₺620.000</span>
              <span className="text-xs font-bold text-[#E32636] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> %11
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-44 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E32636" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#E32636" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34363C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34363C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#73767E" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#73767E"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val / 1000}K`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#17181B', borderColor: '#2B2D32', borderRadius: '8px', fontSize: '11px', color: '#F7F7F8' }}
              />
              <Area type="monotone" dataKey="Gelir" stroke="#E32636" strokeWidth={2} fillOpacity={1} fill="url(#colorGelir)" />
              <Area type="monotone" dataKey="Gider" stroke="#34363C" strokeWidth={2} fillOpacity={1} fill="url(#colorGider)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-1 text-xs text-[#73767E]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-0.5 bg-[#E32636] rounded" /> Gelir
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-0.5 bg-[#34363C] rounded" /> Gider
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
