import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, MapPin, MessageSquare, Send } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { DataRow } from '../../components/ui/data-row';
import { StatusPill } from '../../components/ui/status-pill';
import { translateText } from '../../utils/localization';

function getAlertLabel(status: string, dueDate: string, t: (value: string) => string) {
  if (status === 'complete') return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dueDate);
  target.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilDue < 0) return { tone: 'danger' as const, label: `${t('Overdue')} ${Math.abs(daysUntilDue)} ${t('days')}` };
  if (daysUntilDue === 5 || daysUntilDue === 10) return { tone: 'warning' as const, label: `${t('Due in')} ${daysUntilDue} ${t('days')}` };
  return null;
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

function getIssueTone(status: string) {
  if (status === 'resolved' || status === 'closed') return 'success' as const;
  if (status === 'in_progress') return 'info' as const;
  return 'warning' as const;
}

function getRequestTone(status: string) {
  if (status === 'approved') return 'success' as const;
  if (status === 'rejected') return 'danger' as const;
  if (status === 'info_required') return 'warning' as const;
  return 'info' as const;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    language,
    projects,
    agencies,
    users,
    requiredDataAssignments,
    getProjectDataCompletenessSummary,
    projectJobs,
    getProjectProcessingSummary,
    issues,
    serviceRequests,
  } = useApp();
  const project = projects.find((item) => item.id === id);
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState(project?.qa ?? []);
  const t = (value: string) => translateText(value, language);

  if (!project) {
    return (
      <div className="page-shell">
        <div className="section-panel p-8 text-center">
          <div className="text-lg font-semibold text-slate-900">{t('Project not found')}</div>
          <Link to="/investor/explorer" className="mt-3 inline-flex text-sm font-medium text-primary">
            {t('Return to explorer')}
          </Link>
        </div>
      </div>
    );
  }

  const overviewRows = [
    ['Sector', project.sector],
    ['Province', project.province],
    ['Location', project.location],
    ['Budget', `$${project.budget}M`],
    ['Minimum Investment', `$${project.minInvestment}M`],
    ['Timeline', project.timeline],
    ['Expected IRR', project.returnRate],
    ['Land Area', project.landArea],
    ['Project Stage', project.stage],
  ];
  const dataSummary = getProjectDataCompletenessSummary(project.id);
  const processingSummary = getProjectProcessingSummary(project.id);
  const projectAssignments = requiredDataAssignments.filter((item) => item.projectId === project.id);
  const projectJobItems = projectJobs.filter((item) => item.projectId === project.id);
  const projectIssues = issues.filter((item) => item.projectId === project.id);
  const projectB2gRequests = serviceRequests.filter((item) => item.projectId === project.id);
  const resolvedIssueCount = projectIssues.filter((item) => item.status === 'resolved' || item.status === 'closed').length;
  const resolvedB2bRequestCount = projectB2gRequests.filter((item) => item.status === 'approved' || item.status === 'rejected').length;

  function handleSubmitQuestion() {
    if (!question.trim()) return;
    setQuestions((current) => [
      ...current,
      {
        id: `${Date.now()}`,
        question,
        askedBy: 'Korea Infrastructure Partners',
        askedAt: new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US'),
      },
    ]);
    setQuestion('');
  }

  return (
    <div className="page-shell space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/investor/explorer" className="inline-flex items-center gap-1 hover:text-primary">
          <ArrowLeft size={14} />
          {t('Explorer')}
        </Link>
        <span>/</span>
        <span className="truncate text-slate-700">{t(project.name)}</span>
      </div>

      <section className="section-panel overflow-hidden p-0">
        <div className="relative h-80">
          <ImageWithFallback src={project.image} alt={t(project.name)} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c2d4a]/72 via-[#0c2d4a]/42 to-[#0c2d4a]/12" />
          <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
            <div className="mb-3 flex flex-wrap gap-2">
              <StatusPill tone="info">{t(project.sector)}</StatusPill>
              <StatusPill tone="default">{t(project.province)}</StatusPill>
              <StatusPill tone={project.status === 'published' ? 'success' : project.status === 'review' ? 'warning' : 'default'}>
                {t(project.stage)}
              </StatusPill>
            </div>
            <h1 className="max-w-4xl text-white" style={{ fontSize: 'var(--text-3xl)' }}>{t(project.name)}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-100">
              <MapPin size={14} />
              {t(project.location)}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/investor/intake/${project.id}`)}
                className="rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {t('Express Interest')}
              </button>
              <button className="rounded-md border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15">
                {t('Request Meeting')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <div className="space-y-6">
          <section className="section-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-heading mb-0">{t('Overview')}</h2>
              <StatusPill tone="info">{t('Investment-ready record')}</StatusPill>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {overviewRows.map(([label, value]) => (
                <DataRow key={label}>
                  <div className="text-sm text-slate-500">{t(label)}</div>
                  <div className="text-sm font-semibold text-slate-900">{t(value)}</div>
                </DataRow>
              ))}
              <div className="rounded-xl border border-border bg-slate-50 p-4 md:col-span-2">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Description')}</div>
                <div className="text-sm leading-7 text-slate-700">{t(project.description)}</div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Data Completeness', value: `${dataSummary.completed}/${dataSummary.total}` },
                { label: 'Project Processing', value: `${processingSummary.completed}/${processingSummary.total}` },
                { label: 'Reported Issue', value: `${resolvedIssueCount}/${projectIssues.length}` },
                { label: 'B2B request', value: `${resolvedB2bRequestCount}/${projectB2gRequests.length}` },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t(item.label)}</div>
                  <div className="mt-1 text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="section-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-heading mb-0">{t('Required Data Status')}</h2>
              <StatusPill tone={dataSummary.completed === dataSummary.total && dataSummary.total > 0 ? 'success' : 'warning'}>
                {dataSummary.completed}/{dataSummary.total}
              </StatusPill>
            </div>
            <div className="space-y-3">
              {projectAssignments.length > 0 ? (
                projectAssignments.map((assignment) => {
                  const agency = agencies.find((item) => item.id === assignment.agencyId);
                  const user = users.find((item) => item.id === assignment.userId);
                  const alert = getAlertLabel(assignment.status, assignment.dueDate, t);
                  return (
                    <div key={assignment.id} className="rounded-xl border border-border bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-900">{t(assignment.fieldName)}</div>
                          <div className="mt-2 grid gap-2 text-xs text-slate-500 md:grid-cols-2">
                            <div>{t('Responsible agency')}: {agency?.name ?? '-'}</div>
                            <div>{t('Responsible user')}: {user?.name ?? '-'}</div>
                            <div>{t('Due date')}: {assignment.dueDate}</div>
                            <div>{t('Reminder timing')}: {assignment.reminderDaysBefore} {t('days before due date')}</div>
                          </div>
                          {assignment.note ? <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">{t(assignment.note)}</div> : null}
                          <div className="mt-3">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Attachment list')}</div>
                            <div className="space-y-2">
                              {(assignment.attachments ?? []).length > 0 ? (
                                (assignment.attachments ?? []).map((file) => (
                                  <div key={`${file.fileName}-${file.lastUploadDate ?? ''}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    <span className="truncate">{t(file.fileName)}</span>
                                    <span className="shrink-0">{file.lastUploadDate || '-'}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-slate-500">-</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusPill tone={assignment.status === 'complete' ? 'success' : 'warning'}>{t(assignment.status)}</StatusPill>
                          {alert ? <StatusPill tone={alert.tone}>{alert.label}</StatusPill> : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-slate-500">
                  {t('No required data items have been published for this project yet.')}
                </div>
              )}
            </div>
          </section>

          <section className="section-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-heading mb-0">{t('Project Jobs')}</h2>
              <StatusPill tone={processingSummary.completed === processingSummary.total && processingSummary.total > 0 ? 'success' : 'info'}>
                {processingSummary.completed}/{processingSummary.total}
              </StatusPill>
            </div>
            <div className="space-y-3">
              {projectJobItems.length > 0 ? (
                projectJobItems.map((job) => {
                  const agency = agencies.find((item) => item.id === job.agencyId);
                  const user = users.find((item) => item.id === job.userId);
                  const alert = getAlertLabel(job.status, job.dueDate, t);
                  return (
                    <div key={job.id} className="rounded-xl border border-border bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-900">{t(job.title)}</div>
                          <div className="mt-1 text-sm text-slate-600">{t(job.description)}</div>
                          <div className="mt-2 grid gap-2 text-xs text-slate-500 md:grid-cols-2">
                            <div>{t('Responsible agency')}: {agency?.name ?? '-'}</div>
                            <div>{t('Responsible user')}: {user?.name ?? '-'}</div>
                            <div>{t('Due date')}: {job.dueDate}</div>
                            <div>{t('Reminder timing')}: {job.reminderDaysBefore} {t('days before due date')}</div>
                          </div>
                          {job.note ? <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">{t(job.note)}</div> : null}
                          <div className="mt-3">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Attachment list')}</div>
                            <div className="space-y-2">
                              {(job.attachments ?? []).length > 0 ? (
                                (job.attachments ?? []).map((file) => (
                                  <div key={`${file.fileName}-${file.lastUploadDate ?? ''}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    <span className="truncate">{t(file.fileName)}</span>
                                    <span className="shrink-0">{file.lastUploadDate || '-'}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-slate-500">-</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusPill tone={job.status === 'complete' ? 'success' : 'warning'}>{t(job.status)}</StatusPill>
                          {alert ? <StatusPill tone={alert.tone}>{alert.label}</StatusPill> : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-slate-500">
                  {t('No project jobs have been defined for this project yet.')}
                </div>
              )}
            </div>
          </section>

          <section className="section-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-heading mb-0">{t('List of Issues reported')}</h2>
              <StatusPill tone={projectIssues.length > 0 ? 'warning' : 'default'}>{projectIssues.length}</StatusPill>
            </div>
            <div className="space-y-3">
              {projectIssues.length > 0 ? (
                projectIssues.map((issue) => (
                  <div key={issue.id} className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center justify-end">
                      <StatusPill tone={getIssueTone(issue.status)}>{t(formatStatusLabel(issue.status))}</StatusPill>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                      <div><span className="font-semibold text-slate-700">{t('Issue Title/Summary')}:</span> {t(issue.title)} / {t(issue.description)}</div>
                      <div><span className="font-semibold text-slate-700">{t('Status')}:</span> {t(formatStatusLabel(issue.status))}</div>
                      <div><span className="font-semibold text-slate-700">{t('Reported By')}:</span> {t(issue.reportedBy ?? '-')}</div>
                      <div><span className="font-semibold text-slate-700">{t('Reported Time')}:</span> {issue.reportedAt}</div>
                      <div><span className="font-semibold text-slate-700">{t('PIC/Agency in charge')}:</span> {t(issue.assignedTo)}</div>
                      <div><span className="font-semibold text-slate-700">{t('Due Date')}:</span> {issue.dueDate ?? '-'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-slate-500">
                  {t('No issues reported for this project yet.')}
                </div>
              )}
            </div>
          </section>

          <section className="section-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-heading mb-0">{t('B2G Request')}</h2>
              <StatusPill tone={projectB2gRequests.length > 0 ? 'info' : 'default'}>{projectB2gRequests.length}</StatusPill>
            </div>
            <div className="space-y-3">
              {projectB2gRequests.length > 0 ? (
                projectB2gRequests.map((request) => (
                  <div key={request.id} className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center justify-end">
                      <StatusPill tone={getRequestTone(request.status)}>{t(formatStatusLabel(request.status))}</StatusPill>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                      <div><span className="font-semibold text-slate-700">{t('Request type')}:</span> {t(request.serviceName)}</div>
                      <div><span className="font-semibold text-slate-700">{t('Status')}:</span> {t(formatStatusLabel(request.status))}</div>
                      <div><span className="font-semibold text-slate-700">{t('Request By')}:</span> {t(request.applicant)}</div>
                      <div><span className="font-semibold text-slate-700">{t('RequestTime')}:</span> {request.submittedAt}</div>
                      <div><span className="font-semibold text-slate-700">{t('PIC/Agency in charge')}:</span> {t(request.assignedAgency)}</div>
                      <div><span className="font-semibold text-slate-700">{t('Due Date')}:</span> {request.deadline}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-slate-500">
                  {t('No B2G requests for this project yet.')}
                </div>
              )}
            </div>
          </section>

          <section className="section-panel p-6">
            <h2 className="section-heading">{t('Project Documents')}</h2>
            <div className="mt-5 space-y-3">
              {project.documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-slate-100 p-2 text-slate-600">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t(document.name)}</div>
                      <div className="text-xs text-slate-500">{document.type} / {document.size} / {t('Uploaded')} {document.uploadedAt}</div>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    <Download size={14} />
                    {t('Download PDF')}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="section-panel p-6">
            <h2 className="section-heading">{t('Public Q&A')}</h2>
            <div className="mt-4 space-y-3">
              {questions.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-white p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare size={16} className="mt-0.5 text-primary" />
                    <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{t(item.question)}</div>
                    <div className="mt-1 text-xs text-slate-500">{t(item.askedBy)} / {item.askedAt}</div>
                      {item.answer ? (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-slate-700">
                          {t(item.answer)}
                        </div>
                      ) : (
                        <div className="mt-3 text-xs font-medium text-amber-700">{t('Awaiting response from the data owner.')}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-border bg-slate-50 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">{t('Ask a question')}</div>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={4}
                className="app-input"
                placeholder={t('Ask about legal status, incentives, planning controls, or delivery readiness...')}
              />
              <button
                onClick={handleSubmitQuestion}
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)]"
              >
                <Send size={14} />
                {t('Submit question')}
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
