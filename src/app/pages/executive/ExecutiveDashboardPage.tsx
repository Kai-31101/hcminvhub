import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BarChart3, MapPin, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translateText } from '../../utils/localization';
import { CompletionMeter } from '../../components/ui/completion-meter';
import { DataRow } from '../../components/ui/data-row';
import { StatusPill } from '../../components/ui/status-pill';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

function getAverage(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export default function ExecutiveDashboardPage() {
  const {
    language,
    projects,
    opportunities,
    issues,
    permits,
    serviceRequests,
    getProjectDataCompletenessSummary,
    getProjectProcessingSummary,
  } = useApp();
  const t = (value: string) => translateText(value, language);

  const totalPipelineValue = opportunities.reduce((sum, item) => sum + item.amount, 0);
  const riskItems =
    issues.filter((item) => item.status !== 'resolved' && item.status !== 'closed').length +
    permits.filter((item) => !['approved', 'rejected'].includes(item.status)).length +
    serviceRequests.filter((item) => item.slaStatus === 'at_risk' || item.slaStatus === 'breached').length;

  const averageDataCompleteness = getAverage(
    projects.map((project) => getProjectDataCompletenessSummary(project.id).percentage),
  );
  const averageProjectProcessing = getAverage(
    projects.map((project) => getProjectProcessingSummary(project.id).percentage),
  );

  const snapshotProjects = useMemo(
    () =>
      [...projects]
        .sort((left, right) => {
          const leftScore = left.status === 'published' ? 2 : left.status === 'review' ? 1 : 0;
          const rightScore = right.status === 'published' ? 2 : right.status === 'review' ? 1 : 0;
          if (leftScore !== rightScore) return rightScore - leftScore;
          return right.budget - left.budget;
        })
        .slice(0, 6),
    [projects],
  );

  return (
    <div className="page-shell space-y-6">
      <section className="section-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="section-heading">{t('Executive Dashboard')}</h1>
            <p className="section-subheading">
              {t('Lean executive overview: portfolio value, readiness, and immediate risk signals in one screen.')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/executive/analytics" className="app-button-secondary">
              <BarChart3 size={14} />
              {t('Analytics')}
            </Link>
            <Link to="/executive/risks" className="app-button-secondary">
              <ShieldAlert size={14} />
              {t('Risk Monitor')}
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Published Projects', value: projects.filter((item) => item.status === 'published').length, tone: 'text-sky-700' },
          { label: 'Pipeline Value', value: `$${totalPipelineValue}M`, tone: 'text-emerald-700' },
          { label: 'Avg Data Completeness', value: `${averageDataCompleteness}%`, tone: 'text-indigo-700' },
          { label: 'Open Risk Items', value: riskItems, tone: 'text-rose-700' },
        ].map((metric) => (
          <div key={metric.label} className="kpi-tile">
            <div className={`text-4xl font-bold ${metric.tone}`} style={{ fontFamily: 'var(--font-heading)' }}>
              {metric.value}
            </div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t(metric.label)}</div>
          </div>
        ))}
      </div>

      <section className="section-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading mb-0">{t('Portfolio Snapshot')}</h2>
          <StatusPill tone="info">{snapshotProjects.length} {t('projects')}</StatusPill>
        </div>
        <div className="space-y-3">
          {snapshotProjects.map((project) => {
            const dataSummary = getProjectDataCompletenessSummary(project.id);
            const processingSummary = getProjectProcessingSummary(project.id);
            const projectIssueItems = issues.filter((item) => item.projectId === project.id);
            const completedIssueCount = projectIssueItems.filter((item) => item.status === 'resolved' || item.status === 'closed').length;
            const projectB2gRequests = serviceRequests.filter((item) => item.projectId === project.id);
            const completedB2gCount = projectB2gRequests.filter((item) => item.status === 'approved' || item.status === 'rejected').length;
            return (
              <DataRow key={project.id} className="group items-stretch gap-5 overflow-hidden p-0">
                <div className="relative w-[320px] shrink-0 self-stretch overflow-hidden border-r border-border bg-slate-100">
                  <ImageWithFallback
                    src={project.image}
                    alt={t(project.name)}
                    className="absolute inset-0 h-full w-full scale-[1.08] object-cover"
                  />
                </div>

                <div className="flex-1 px-5 py-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <StatusPill tone={project.status === 'published' ? 'success' : project.status === 'review' ? 'warning' : 'default'}>
                      {t(project.stage)}
                    </StatusPill>
                    <StatusPill tone="info">{t(project.sector)}</StatusPill>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t(project.province)}</span>
                  </div>

                  <h2 className="mb-2 text-xl font-semibold text-slate-900">{t(project.name)}</h2>
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={14} />
                    {t(project.location)}
                  </div>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600">{t(project.description)}</p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-4">
                    {[
                      ['Investment scale', `$${project.budget}M`],
                      ['Minimum ticket', `$${project.minInvestment}M`],
                      ['IRR', t(project.returnRate)],
                      ['Timeline', t(project.timeline)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t(label)}</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(project.highlights ?? []).slice(0, 4).map((highlight) => (
                      <span key={highlight} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {t(highlight)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex min-h-full w-full max-w-56 flex-col justify-center bg-transparent px-4 py-5 transition-colors group-hover:bg-slate-50">
                  <div className="grid gap-3">
                    {[
                      ['Data Completeness', `${dataSummary.completed}/${dataSummary.total}`],
                      ['Project Processing', `${processingSummary.completed}/${processingSummary.total}`],
                      ['Issue', `${completedIssueCount}/${projectIssueItems.length}`],
                      ['B2G request', `${completedB2gCount}/${projectB2gRequests.length}`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-border bg-white px-3 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{t(label)}</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </DataRow>
            );
          })}
        </div>
      </section>

      <section className="section-panel p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/executive/analytics" className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-4 text-sky-900 transition-colors hover:bg-sky-100">
            <div className="text-sm font-semibold">{t('Go to Analytics')}</div>
            <div className="mt-1 text-xs text-sky-700">{t('Dive into funnel, sectors, and trend performance.')}</div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
              {t('Open')} <ArrowRight size={12} />
            </div>
          </Link>
          <Link to="/executive/risks" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-900 transition-colors hover:bg-rose-100">
            <div className="text-sm font-semibold">{t('Go to Risk Monitor')}</div>
            <div className="mt-1 text-xs text-rose-700">{t('Review critical issues, permits, and SLA risks.')}</div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
              {t('Open')} <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </section>

      <section className="section-panel p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Execution Readiness')}</div>
        <div className="mt-2 text-sm text-slate-700">
          {t('Portfolio-level processing readiness is')} <span className="font-semibold text-slate-900">{averageProjectProcessing}%</span>.
        </div>
      </section>
    </div>
  );
}
