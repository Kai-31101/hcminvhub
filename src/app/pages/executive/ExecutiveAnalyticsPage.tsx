import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { translateText } from '../../utils/localization';
import { StatusPill } from '../../components/ui/status-pill';

export default function ExecutiveAnalyticsPage() {
  const { language, projects, opportunities } = useApp();
  const t = (value: string) => translateText(value, language);

  const funnelData = useMemo(() => {
    return [
      { stage: 'Intake Submitted', count: opportunities.length },
      { stage: 'Due Diligence', count: opportunities.filter((item) => item.stage === 'due_diligence').length },
      { stage: 'Approved', count: opportunities.filter((item) => item.stage === 'approved').length },
      { stage: 'In Execution', count: opportunities.filter((item) => ['approved', 'negotiation'].includes(item.stage)).length },
    ];
  }, [opportunities]);

  const sectorData = useMemo(() => {
    const totals = projects.reduce<Record<string, number>>((accumulator, project) => {
      accumulator[project.sector] = (accumulator[project.sector] ?? 0) + project.budget;
      return accumulator;
    }, {});
    return Object.entries(totals)
      .map(([sector, value]) => ({ sector, value }))
      .sort((left, right) => right.value - left.value);
  }, [projects]);

  const monthlyTrend = useMemo(() => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const buckets = opportunities.reduce<Record<string, { month: string; intakes: number; approved: number }>>((accumulator, opportunity) => {
      const date = new Date(opportunity.submittedAt);
      const month = monthOrder[date.getMonth()] ?? opportunity.submittedAt;
      if (!accumulator[month]) {
        accumulator[month] = { month, intakes: 0, approved: 0 };
      }
      accumulator[month].intakes += 1;
      if (opportunity.stage === 'approved') {
        accumulator[month].approved += 1;
      }
      return accumulator;
    }, {});
    return Object.values(buckets).sort((left, right) => monthOrder.indexOf(left.month) - monthOrder.indexOf(right.month));
  }, [opportunities]);

  return (
    <div className="page-shell space-y-6">
      <section className="section-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="section-heading">{t('Analytics')}</h1>
            <p className="section-subheading">{t('Lean analytics view focused on conversion, sector allocation, and monthly trend.')}</p>
          </div>
          <StatusPill tone="info">{opportunities.length} {t('opportunities')}</StatusPill>
        </div>
      </section>

      <section className="section-panel p-6">
        <h2 className="section-heading mb-4">{t('Conversion Funnel')}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [value, t('Count')]} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} label={{ position: 'top', fill: '#333333', fontSize: 12, fontWeight: 600 }}>
              {funnelData.map((item, index) => (
                <Cell key={item.stage} fill={['#0f4c81', '#0ea5e9', '#7c3aed', '#d97706', '#16a34a', '#dc2626'][index % 6]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="section-panel p-6">
          <h2 className="section-heading mb-4">{t('Monthly Trend')}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="intakes" stroke="#0f4c81" strokeWidth={2.5} dot={{ r: 4 }} name={t('Intakes')} />
              <Line type="monotone" dataKey="approved" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} name={t('Approved')} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="section-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-heading mb-0">{t('Sector Allocation')}</h2>
            <StatusPill tone="default">{sectorData.length}</StatusPill>
          </div>
          <div className="space-y-3">
            {sectorData.map((item) => (
              <div key={item.sector}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800">{t(item.sector)}</span>
                  <span className="text-slate-600">${item.value}M</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#0f4c81_0%,#38bdf8_100%)]"
                    style={{ width: `${(item.value / Math.max(sectorData[0]?.value ?? 1, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
