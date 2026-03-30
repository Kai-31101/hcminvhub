import React, { FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  Filter,
  Globe2,
  Handshake,
  MapPin,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { DataRow } from '../components/ui/data-row';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Input } from '../components/ui/input';
import { StatusPill } from '../components/ui/status-pill';
import { Textarea } from '../components/ui/textarea';
import { useApp, UserRole } from '../context/AppContext';
import { FastTrackDraft, SupportDraft, savePendingHomeAction } from '../utils/homeLeadFlow';
import { translateText } from '../utils/localization';

const MAIN_SECTORS = [
  'High-Tech & Digital',
  'Manufacturing & Industrial',
  'Infrastructure & Logistics',
  'Energy & Utilities',
  'Real Estate & Urban Development',
  'Financial Services',
  'Healthcare & Pharma',
  'Education & Training',
  'Tourism & Hospitality',
  'Retail & Consumer',
  'Environmental & Waste Management',
  'Renewable Energy',
  'Smart City & Urban Tech',
  'Agriculture & Agritech',
  'Food Processing & Supply Chain',
  'Social Infrastructure',
  'R&D & Innovation',
  'Supporting Industries',
] as const;

const INVESTMENT_SIZE_OPTIONS = ['All sizes', '< $10M', '$10M - $50M', '$50M - $200M', '>$200M'] as const;
const PROJECT_STATUS_OPTIONS = ['All statuses', 'Draft', 'Published', 'Attracting Interest', 'In Process', 'Approved', 'Executing', 'Completed'] as const;
const INVESTMENT_TYPE_OPTIONS = ['All types', 'Greenfield', 'Brownfield', 'Joint Venture', 'PPP', 'Acquisition'] as const;
const HCM_WARD_OPTIONS = [
  'All wards',
  'An Khanh',
  'An Loi Dong',
  'Ben Nghe',
  'Ben Thanh',
  'Can Thanh',
  'Cat Lai',
  'Da Kao',
  'Hiep Phu',
  'Linh Trung',
  'Long Binh',
  'Long Phuoc',
  'Ly Nhon',
  'Nhuan Duc',
  'Phu Huu',
  'Tan My',
  'Tan Thong Hoi',
  'Tang Nhon Phu',
  'Thanh An',
  'Thai My',
  'Thao Dien',
  'Thu Thiem',
  'Vo Thi Sau',
  'Xuan Hoa',
] as const;

const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  investor: '/investor/explorer',
  gov_operator: '/gov/projects',
  agency: '/agency/permits',
  admin: '/admin/roles',
  executive: '/executive/dashboard',
};

const ROLE_LABEL: Record<UserRole, string> = {
  investor: 'Investor portal',
  gov_operator: 'Government portal',
  agency: 'Agency portal',
  admin: 'Admin console',
  executive: 'Executive view',
};

const PROJECT_METADATA: Record<
  string,
  {
    sectorGroup: string;
    projectStatus: string;
    investmentType: string;
    country: string;
    city: string;
    district: string;
    ward: string;
    industrialZone: string;
    geoCoordinates: string;
  }
> = {
  p1: {
    sectorGroup: 'Smart City & Urban Tech',
    projectStatus: 'Attracting Interest',
    investmentType: 'PPP',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    district: 'Thu Duc City',
    ward: 'Linh Trung',
    industrialZone: 'East Innovation Corridor',
    geoCoordinates: '10.8411, 106.8098',
  },
  p2: {
    sectorGroup: 'Renewable Energy',
    projectStatus: 'Attracting Interest',
    investmentType: 'Greenfield',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    district: 'Can Gio',
    ward: 'Thanh An',
    industrialZone: 'Can Gio Energy Cluster',
    geoCoordinates: '10.4114, 106.9546',
  },
  p3: {
    sectorGroup: 'Manufacturing & Industrial',
    projectStatus: 'Published',
    investmentType: 'Greenfield',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    district: 'Cu Chi',
    ward: 'Thai My',
    industrialZone: 'Cu Chi Advanced Manufacturing Belt',
    geoCoordinates: '11.0049, 106.4998',
  },
  p4: {
    sectorGroup: 'Tourism & Hospitality',
    projectStatus: 'Attracting Interest',
    investmentType: 'Joint Venture',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    district: 'Thu Duc City',
    ward: 'An Khanh',
    industrialZone: 'Saigon Riverside Convention Belt',
    geoCoordinates: '10.7765, 106.7298',
  },
  p5: {
    sectorGroup: 'R&D & Innovation',
    projectStatus: 'In Process',
    investmentType: 'Acquisition',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    district: 'Thu Duc City',
    ward: 'Hiep Phu',
    industrialZone: 'Saigon Hi-Tech Park',
    geoCoordinates: '10.8478, 106.8047',
  },
  p6: {
    sectorGroup: 'Food Processing & Supply Chain',
    projectStatus: 'Draft',
    investmentType: 'Brownfield',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    district: 'Cu Chi',
    ward: 'Nhuan Duc',
    industrialZone: 'Northwest Agro-Logistics Zone',
    geoCoordinates: '11.0218, 106.5435',
  },
};

const CITY_ARTICLES = [
  {
    category: 'Economy',
    source: 'VnExpress',
    title: 'HCMC eyes 10% GDP growth in H2',
    summary: 'A city-level growth push centered on exports, tourism, digitalization, and social investment.',
    url: 'https://e.vnexpress.net/news/business/economy/hcmc-eyes-10-gdp-growth-in-h2-4932098.html',
  },
  {
    category: 'Investment',
    source: 'VnExpress',
    title: 'PM urges HCMC for policy changes to attract $200B investment by 2030',
    summary: 'A policy and capital-mobilization lens on how Ho Chi Minh City is framing long-term investment demand.',
    url: 'https://e.vnexpress.net/news/business/economy/pm-urges-hcmc-for-policy-changes-to-attract-200b-investment-by-2030-4835701.html',
  },
  {
    category: 'Culture',
    source: 'VnExpress',
    title: 'HCMC hosts first river festival',
    summary: 'A strong signal of place-branding, tourism activation, and cultural programming tied to the city waterfront.',
    url: 'https://e.vnexpress.net/news/places/hcmc-hosts-first-river-festival-4638178.html',
  },
  {
    category: 'Living environment',
    source: 'VnExpress',
    title: 'Ho Chi Minh City aims to join global top 100 liveable cities',
    summary: 'A forward-looking read on livability goals, healthcare, education, safety, and modern urban life.',
    url: 'https://e.vnexpress.net/news/news/ho-chi-minh-city-aims-to-join-global-top-100-liveable-cities-4932861.html',
  },
];

type HomeProject = ReturnType<typeof enrichProjectRecord>;

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

function investmentBucketForBudget(budget: number) {
  if (budget < 10) return '< $10M';
  if (budget <= 50) return '$10M - $50M';
  if (budget <= 200) return '$50M - $200M';
  return '>$200M';
}

function amountFromInvestmentSize(investmentSize: string) {
  switch (investmentSize) {
    case '< $10M':
      return 8;
    case '$10M - $50M':
      return 30;
    case '$50M - $200M':
      return 120;
    case '>$200M':
      return 250;
    default:
      return 25;
  }
}

function dueDate(daysFromNow: number) {
  const next = new Date();
  next.setDate(next.getDate() + daysFromNow);
  return next.toISOString().split('T')[0];
}

function enrichProjectRecord(project: ReturnType<typeof useApp>['projects'][number]) {
  const metadata = PROJECT_METADATA[project.id] ?? {
    sectorGroup: project.sector,
    projectStatus: project.status === 'published' ? 'Published' : project.status === 'review' ? 'In Process' : project.status === 'execution' ? 'Executing' : 'Draft',
    investmentType: 'Greenfield',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    district: project.location,
    ward: 'Ben Nghe',
    industrialZone: 'Ho Chi Minh City',
    geoCoordinates: '10.8231, 106.6297',
  };

  return {
    ...project,
    ...metadata,
    investmentBucket: investmentBucketForBudget(project.budget),
    searchIndex: [
      project.name,
      project.sector,
      metadata.sectorGroup,
      project.location,
      metadata.country,
      metadata.city,
      metadata.district,
      metadata.ward,
      metadata.industrialZone,
      metadata.geoCoordinates,
    ]
      .join(' ')
      .toLowerCase(),
  };
}

function getProjectScore(project: HomeProject, draft: FastTrackDraft) {
  let score = 0;
  const sector = normalizeValue(draft.sector);
  const investmentType = normalizeValue(draft.investmentType);
  const locationNeed = normalizeValue(draft.locationNeed);

  if (sector && normalizeValue(project.sectorGroup) === sector) score += 4;
  if (investmentType && normalizeValue(project.investmentType) === investmentType) score += 2;
  if (locationNeed && project.searchIndex.includes(locationNeed)) score += 2;
  if (project.projectStatus === 'Attracting Interest' || project.projectStatus === 'Published') score += 2;
  if (project.investmentBucket === draft.investmentSize) score += 1;

  return score;
}

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    role,
    language,
    setLanguage,
    projects,
    opportunities,
    activeInvestorCompany,
    setActiveInvestorCompany,
    watchlist,
    toggleWatchlist,
    createOpportunity,
    createIssue,
    addNotification,
  } = useApp();
  const t = (value: string) => translateText(value, language);

  const [sectorFilter, setSectorFilter] = useState('All sectors');
  const [locationFilter, setLocationFilter] = useState('All wards');
  const [investmentSizeFilter, setInvestmentSizeFilter] = useState('All sizes');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [investmentTypeFilter, setInvestmentTypeFilter] = useState('All types');
  const [fastTrackOpen, setFastTrackOpen] = useState(false);
  const [fastTrackNotice, setFastTrackNotice] = useState<string | null>(null);
  const [supportNotice, setSupportNotice] = useState<string | null>(null);
  const [fastTrackForm, setFastTrackForm] = useState<FastTrackDraft>({
    companyName: activeInvestorCompany,
    contactName: '',
    email: '',
    phone: '',
    country: 'South Korea',
    sector: 'High-Tech & Digital',
    locationNeed: 'Ho Chi Minh City',
    investmentSize: '$10M - $50M',
    investmentType: 'Joint Venture',
    notes: '',
  });
  const [supportForm, setSupportForm] = useState<SupportDraft>({
    companyName: activeInvestorCompany,
    contactName: '',
    email: '',
    phone: '',
    projectId: 'p1',
    topic: 'Market entry and project matching',
    message: '',
    urgent: false,
  });

  const homeProjects = useMemo(() => projects.map((project) => enrichProjectRecord(project)), [projects]);
  const heroProject = homeProjects[0];
  const matchedProjectForFastTrack = useMemo(() => {
    const ranked = [...homeProjects].sort((left, right) => getProjectScore(right, fastTrackForm) - getProjectScore(left, fastTrackForm));
    return ranked[0] ?? homeProjects[0];
  }, [fastTrackForm, homeProjects]);

  const filteredProjects = useMemo(() => {
    return homeProjects.filter((project) => {
      const matchesSector = sectorFilter === 'All sectors' || project.sectorGroup === sectorFilter;
      const matchesLocation = locationFilter === 'All wards' || project.ward === locationFilter;
      const matchesInvestmentSize = investmentSizeFilter === 'All sizes' || project.investmentBucket === investmentSizeFilter;
      const matchesStatus = statusFilter === 'All statuses' || project.projectStatus === statusFilter;
      const matchesInvestmentType = investmentTypeFilter === 'All types' || project.investmentType === investmentTypeFilter;
      return matchesSector && matchesLocation && matchesInvestmentSize && matchesStatus && matchesInvestmentType;
    });
  }, [homeProjects, investmentSizeFilter, investmentTypeFilter, locationFilter, sectorFilter, statusFilter]);

  const publishedCount = homeProjects.filter((project) => project.projectStatus === 'Attracting Interest' || project.projectStatus === 'Published').length;
  const totalValue = homeProjects.reduce((total, project) => total + project.budget, 0);
  const investorCountries = new Set(opportunities.map((item) => item.investorCountry)).size;
  const submittedType = new URLSearchParams(location.search).get('submitted');
  const continueRoute = role ? ROLE_HOME_ROUTE[role] : '/login';
  const continueLabel = role ? `${t('Continue to')} ${t(ROLE_LABEL[role])}` : t('Login / create account');
  const homeTheme = {
    ['--primary' as string]: '#ED6203',
    ['--primary-foreground' as string]: '#ffffff',
    ['--color-primary-700' as string]: '#d95b03',
    ['--color-primary-900' as string]: '#022582',
    ['--ring' as string]: 'rgba(237, 98, 3, 0.28)',
  } as React.CSSProperties;

  function scrollToOpportunities() {
    document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateFastTrackField(field: keyof FastTrackDraft, value: string) {
    setFastTrackForm((current) => ({ ...current, [field]: value }));
  }

  function updateSupportField(field: keyof SupportDraft, value: string | boolean) {
    setSupportForm((current) => ({ ...current, [field]: value }));
  }

  function handleToggleWatchlist(id: string, event: React.MouseEvent) {
    event.preventDefault();
    toggleWatchlist(id);
  }

  function handOffToLogin(type: 'fast_track' | 'support', payload: FastTrackDraft | SupportDraft) {
    if (type === 'fast_track') {
      savePendingHomeAction({
        type,
        payload: payload as FastTrackDraft,
        createdAt: new Date().toISOString(),
      });
      navigate('/login?source=home');
      return;
    }

    savePendingHomeAction({
      type,
      payload: payload as SupportDraft,
      createdAt: new Date().toISOString(),
    });
    navigate('/login?source=home');
  }

  function submitFastTrackRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fastTrackForm.companyName || !fastTrackForm.contactName || !fastTrackForm.email) {
      setFastTrackNotice(t('Complete company, contact, and email before continuing.'));
      return;
    }

    setActiveInvestorCompany(fastTrackForm.companyName);

    if (!role) {
      handOffToLogin('fast_track', fastTrackForm);
      return;
    }

    const matchedProject = matchedProjectForFastTrack;
    const opportunityId = createOpportunity({
      projectId: matchedProject.id,
      projectName: matchedProject.name,
      investorName: fastTrackForm.contactName,
      investorCompany: fastTrackForm.companyName,
      investorCountry: fastTrackForm.country,
      investorType: 'Strategic',
      amount: amountFromInvestmentSize(fastTrackForm.investmentSize),
      stage: 'new',
      notes: `Fast-track homepage request. Preferred sector: ${fastTrackForm.sector}. Preferred location: ${fastTrackForm.locationNeed}. Notes: ${fastTrackForm.notes || 'No extra note.'}`,
      intakeData: {
        investmentStructure: fastTrackForm.investmentType,
        timeline: 'Requested via homepage fast-track entry',
        fundSource: 'To be confirmed after account creation',
        experience: fastTrackForm.notes || 'Early-stage lead captured from homepage.',
        contactEmail: fastTrackForm.email,
        contactPhone: fastTrackForm.phone || 'To be confirmed',
      },
    });

    createIssue({
      projectId: matchedProject.id,
      projectName: matchedProject.name,
      title: `Fast-track matching request - ${fastTrackForm.companyName}`,
      description: `Investor needs support to identify a suitable project. Preferred sector: ${fastTrackForm.sector}. Preferred location: ${fastTrackForm.locationNeed}. Preferred size: ${fastTrackForm.investmentSize}. Notes: ${fastTrackForm.notes || 'No extra note.'}`,
      priority: 'high',
      status: 'open',
      assignedTo: 'Investor Relations Desk',
      dueDate: dueDate(2),
      reportedBy: fastTrackForm.contactName,
      category: 'Support',
    });

    addNotification({
      title: 'Fast-track lead captured',
      message: t('Fast-track request routed to the investor matching queue.'),
      type: 'success',
      path: `/gov/opportunities/${opportunityId}`,
    });

    setFastTrackNotice(t('Request created. The team has been notified and the lead is now in the matching queue.'));
    setFastTrackOpen(false);
  }

  function submitSupportRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supportForm.companyName || !supportForm.contactName || !supportForm.email || !supportForm.message) {
      setSupportNotice(t('Complete company, contact, email, and support message before submitting.'));
      return;
    }

    setActiveInvestorCompany(supportForm.companyName);

    if (!role) {
      handOffToLogin('support', supportForm);
      return;
    }

    const selectedProject = homeProjects.find((project) => project.id === supportForm.projectId) ?? homeProjects[0];
    createIssue({
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      title: `Arobid support request - ${supportForm.topic}`,
      description: supportForm.message,
      priority: supportForm.urgent ? 'high' : 'medium',
      status: 'open',
      assignedTo: 'Arobid Investor Support Desk',
      dueDate: dueDate(supportForm.urgent ? 1 : 3),
      reportedBy: supportForm.contactName,
      category: 'Support',
    });

    addNotification({
      title: 'Support request submitted',
      message: t('Arobid support request routed to the responsible desk.'),
      type: supportForm.urgent ? 'warning' : 'info',
      path: '/agency/issues',
    });

    setSupportNotice(t('Support request logged. The appropriate desk has been notified for follow-up.'));
    setSupportForm((current) => ({ ...current, message: '', urgent: false }));
  }

  return (
    <div style={homeTheme} className="min-h-screen bg-white text-[#333333]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(255,255,255,0.84)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <Link to="/home" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#022582] text-white shadow-[0_12px_30px_rgba(2,37,130,0.22)]">
              <Building2 size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ED6203]">{t('HCMInvHub')}</div>
              <div className="text-sm text-[#555555]">{t('Lead-generation homepage')}</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[#555555] lg:flex">
            <button type="button" onClick={scrollToOpportunities} className="transition-colors hover:text-[#022582]">
              {t('Opportunities')}
            </button>
            <a href="#city-briefing" className="transition-colors hover:text-[#022582]">{t('City briefing')}</a>
            <a href="#support" className="transition-colors hover:text-[#022582]">{t('Support')}</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-full border border-[#cfcfcf] bg-white shadow-sm">
              {(['vi', 'en'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  className={`px-3 py-2 text-xs font-semibold transition-colors ${
                    language === option ? 'bg-[#022582] text-white' : 'text-[#555555] hover:bg-[#f1f1f1]'
                  }`}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
            <Button className="rounded-full bg-[#ED6203] px-5 text-white hover:bg-[#d95b03]" asChild>
              <Link to={continueRoute}>{continueLabel}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {(submittedType === 'fast-track' || submittedType === 'support' || fastTrackNotice || supportNotice) && (
          <section className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-[0_20px_40px_rgba(16,185,129,0.09)]">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={16} />
                {t('Request flow completed')}
              </div>
              <p className="mt-1 text-emerald-800">
                {fastTrackNotice || supportNotice || t('Your information has been saved, converted into a tracked request, and routed to the right team.')}
              </p>
            </div>
          </section>
        )}

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1.02fr,0.98fr] lg:px-8 lg:py-10">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,#022582_0%,#14349a_42%,#ED6203_100%)] px-7 py-8 text-white shadow-[0_28px_80px_rgba(2,37,130,0.22)] lg:px-8 lg:py-9">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffd8bf]">
              <Sparkles size={14} />
              {t('Homepage entry point')}
            </div>

            <h1 className="text-white" style={{ fontSize: 'clamp(2.5rem, 4vw, 4.5rem)', lineHeight: 1.3, fontWeight: 600 }}>
              {t('Find Ho Chi Minh City investment opportunities with clearer signals and faster next steps.')}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#f0f2ff]">
              {t('View the market, explore curated projects, understand the opportunity, and move into an active lead flow without losing momentum.')}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full bg-white px-6 text-[#022582] hover:bg-[#f3f3f3]"
                onClick={scrollToOpportunities}
              >
                {t('Explore Opportunities')}
                <ArrowRight size={16} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/15"
                onClick={() => setFastTrackOpen((current) => !current)}
              >
                {t("Can't find a suitable project?")}
              </Button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: 'Published leads', value: `${publishedCount}` },
                { label: 'Project value', value: `$${totalValue.toLocaleString()}M` },
                { label: 'Investor markets', value: `${investorCountries}+` },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <div className="text-2xl font-semibold text-white">{item.value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#ffd8bf]">{t(item.label)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[#d1d1d1] bg-[#e7e7e7] shadow-[0_28px_80px_rgba(51,51,51,0.14)]">
            <img
              src={heroProject?.image}
              alt={heroProject?.name}
              className="h-full min-h-[460px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,37,130,0.08)_0%,rgba(2,37,130,0.72)_68%,rgba(51,51,51,0.9)_100%)]" />

            <div className="absolute bottom-5 left-5 right-5 space-y-4">
              <div className="max-w-xl rounded-[1.6rem] border border-white/15 bg-white/12 p-5 text-white backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffd8bf]">{t(heroProject?.sectorGroup ?? '')}</div>
                    <h2 className="mt-2 text-white">{t(heroProject?.name ?? '')}</h2>
                  </div>
                  <div className="rounded-full bg-[#ED6203] px-3 py-2 text-xs font-semibold text-white shadow-sm">
                    {t(heroProject?.projectStatus ?? '')}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Location', value: heroProject?.district ?? '' },
                    { label: 'Investment size', value: `$${heroProject?.budget ?? 0}M` },
                    { label: 'Investment type', value: heroProject?.investmentType ?? '' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-black/12 px-3 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ffd8bf]">{t(item.label)}</div>
                      <div className="mt-1 text-sm font-semibold text-white">{t(item.value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.3rem] border border-white/15 bg-[#022582]/78 px-4 py-4 text-white backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#ffd8bf]">
                    <CircleDollarSign size={14} />
                    {t('Current opportunity pulse')}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-[#eef2ff]">
                    {t('Move from market exploration to structured request creation in one page.')}
                  </div>
                </div>
                <div className="rounded-[1.3rem] border border-white/15 bg-white/14 px-4 py-4 text-white backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#ffd8bf]">
                    <ShieldCheck size={14} />
                    {t('Verified by current project data')}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-[#edf3f0]">
                    {t('The homepage is driven by the same project records already used across the investor and government portals.')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-8">
          <Card className="overflow-hidden rounded-[2rem] border-[#d1d1d1] bg-[linear-gradient(135deg,#ffffff_0%,#f7f7f7_60%,#ededed_100%)] shadow-[0_24px_60px_rgba(51,51,51,0.08)]">
            <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[0.78fr,1.22fr] lg:px-7 lg:py-7">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#022582]/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#022582]">
                  <Handshake size={14} />
                  {t('Fast track entry')}
                </div>
                <h2 className="mt-4">{t("Can't find a suitable project?")}</h2>
                <p className="mt-3 text-sm leading-7 text-[#555555]">
                  {t('Tell us your needs. We will support you. One short submission lets the team create a request, route it after login, and trigger the right notification path.')}
                </p>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  {[
                    ['1', 'Click fast track'],
                    ['2', 'Fill one form'],
                    ['3', 'Login / create account'],
                    ['4', 'Create request'],
                    ['5', 'Trigger notification'],
                  ].map(([index, step]) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ED6203] text-xs font-semibold text-white">
                        {index}
                      </span>
                      <span>{t(step)}</span>
                    </div>
                  ))}
                </div>

                {matchedProjectForFastTrack && (
                  <div className="mt-5 rounded-[1.35rem] border border-[#dadada] bg-white px-4 py-4 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ED6203]">{t('Suggested match')}</div>
                    <div className="mt-1 text-base font-semibold text-[#333333]">{t(matchedProjectForFastTrack.name)}</div>
                    <div className="mt-2 text-sm text-[#555555]">
                      {t(matchedProjectForFastTrack.sectorGroup)} • {t(matchedProjectForFastTrack.district)} • {t(matchedProjectForFastTrack.investmentBucket)}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[1.6rem] border border-[#dedede] bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ED6203]">{t('Single form')}</div>
                    <div className="mt-1 text-base font-semibold text-[#333333]">{t('Express investor intent')}</div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setFastTrackOpen((current) => !current)}
                  >
                    {fastTrackOpen ? t('Hide form') : t('Open form')}
                  </Button>
                </div>

                {fastTrackOpen ? (
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={submitFastTrackRequest}>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Company name')}</span>
                      <Input value={fastTrackForm.companyName} onChange={(event) => updateFastTrackField('companyName', event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Contact name')}</span>
                      <Input value={fastTrackForm.contactName} onChange={(event) => updateFastTrackField('contactName', event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Email')}</span>
                      <Input type="email" value={fastTrackForm.email} onChange={(event) => updateFastTrackField('email', event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Phone')}</span>
                      <Input value={fastTrackForm.phone} onChange={(event) => updateFastTrackField('phone', event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Preferred sector')}</span>
                      <select className="app-input" value={fastTrackForm.sector} onChange={(event) => updateFastTrackField('sector', event.target.value)}>
                        {MAIN_SECTORS.map((sector) => (
                          <option key={sector} value={sector}>{t(sector)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Investment type')}</span>
                      <select className="app-input" value={fastTrackForm.investmentType} onChange={(event) => updateFastTrackField('investmentType', event.target.value)}>
                        {INVESTMENT_TYPE_OPTIONS.filter((item) => item !== 'All types').map((item) => (
                          <option key={item} value={item}>{t(item)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Investment size')}</span>
                      <select className="app-input" value={fastTrackForm.investmentSize} onChange={(event) => updateFastTrackField('investmentSize', event.target.value)}>
                        {INVESTMENT_SIZE_OPTIONS.filter((item) => item !== 'All sizes').map((item) => (
                          <option key={item} value={item}>{t(item)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Country')}</span>
                      <Input value={fastTrackForm.country} onChange={(event) => updateFastTrackField('country', event.target.value)} />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Location need')}</span>
                      <Input
                        value={fastTrackForm.locationNeed}
                        onChange={(event) => updateFastTrackField('locationNeed', event.target.value)}
                        placeholder={t('Country, city, district, industrial zone, or coordinates')}
                      />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('What are you looking for?')}</span>
                      <Textarea
                        value={fastTrackForm.notes}
                        onChange={(event) => updateFastTrackField('notes', event.target.value)}
                        placeholder={t('Describe the opportunity you want, your decision criteria, and any timeline or structuring needs.')}
                      />
                    </label>

                    <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm text-[#666666]">
                        {role ? t('Submitting now will create a tracked request and notify the matching desk.') : t('Submitting now will hand off to login / account creation before the request is created.')}
                      </div>
                      <Button type="submit" className="rounded-full bg-[#ED6203] px-6 text-white hover:bg-[#d95b03]">
                        {t('Submit fast-track request')}
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-[1.3rem] border border-dashed border-[#cfcfcf] bg-[#f4f4f4] px-4 py-7 text-sm leading-7 text-[#555555]">
                    {t('Open the form to collect one structured lead request, then route it through login into the current project workflow.')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="opportunities" className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#022582]/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#022582]">
                <Search size={14} />
                {t('Search & filter')}
              </div>
              <h2 className="mt-3">{t('Search the investment map through the signals that matter first.')}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#555555]">
                {t('Filter across sectors, granular locations, investment size, project status, and investment structure using the same project records already present in the platform.')}
              </p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={scrollToOpportunities}>
              <Filter size={16} />
              {filteredProjects.length} {t('projects visible')}
            </Button>
          </div>

          <Card className="rounded-[1.8rem] border-[#e2d4c2] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
            <CardContent className="grid gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-5">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Sectors')}</span>
                <select className="app-input" value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
                  <option value="All sectors">{t('All sectors')}</option>
                  {MAIN_SECTORS.map((sector) => (
                    <option key={sector} value={sector}>{t(sector)}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Location')}</span>
                <select className="app-input font-normal" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                  {HCM_WARD_OPTIONS.map((ward) => (
                    <option key={ward} value={ward}>{t(ward)}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Investment size')}</span>
                <select className="app-input" value={investmentSizeFilter} onChange={(event) => setInvestmentSizeFilter(event.target.value)}>
                  {INVESTMENT_SIZE_OPTIONS.map((item) => (
                    <option key={item} value={item}>{t(item)}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Project status')}</span>
                <select className="app-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  {PROJECT_STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>{t(item)}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Investment type')}</span>
                <select className="app-input" value={investmentTypeFilter} onChange={(event) => setInvestmentTypeFilter(event.target.value)}>
                  {INVESTMENT_TYPE_OPTIONS.map((item) => (
                    <option key={item} value={item}>{t(item)}</option>
                  ))}
                </select>
              </label>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-3">
            {filteredProjects.map((project) => (
              <Link key={project.id} to={`/investor/project/${project.id}`} className="block">
                <DataRow className="group items-stretch gap-5 overflow-hidden p-0">
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

                    <h2 className="mb-2 text-xl font-semibold text-[#333333]">{t(project.name)}</h2>
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
                          <div className="mt-1 text-sm font-semibold text-[#333333]">{value}</div>
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

                  <div className="flex min-h-full w-full max-w-44 flex-col justify-between bg-transparent px-4 py-5 transition-colors group-hover:bg-slate-50">
                    <div className="flex h-full flex-col justify-center gap-3">
                      <button
                        onClick={(event) => handleToggleWatchlist(project.id, event)}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold ${
                          watchlist.includes(project.id)
                            ? 'bg-amber-100 text-amber-800'
                            : 'border border-border bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Star size={14} fill={watchlist.includes(project.id) ? 'currentColor' : 'none'} />
                        {t('Follow')}
                      </button>

                      <div className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-white">
                        {t('View detail')}
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </DataRow>
              </Link>
            ))}
          </div>
        </section>

        <section id="city-briefing" className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="mb-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#022582]/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#022582]">
              <Newspaper size={14} />
              {t('City information')}
            </div>
            <h2 className="mt-3">{t('Give investors a city context before they decide whether to lean in.')}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {CITY_ARTICLES.map((article) => (
              <Card key={article.title} className="rounded-[1.6rem] border-[#e4d6c8] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.04)]">
                <CardContent className="px-5 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#022582]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#022582]">
                      {t(article.category)}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#ED6203]">{article.source}</span>
                  </div>
                  <h3 className="mt-4 text-xl">{t(article.title)}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{t(article.summary)}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#022582] transition-colors hover:text-[#ED6203]"
                  >
                    {t('Read article')}
                    <ArrowRight size={15} />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="support" className="mx-auto max-w-7xl px-6 py-6 pb-12 lg:px-8">
          <Card className="overflow-hidden rounded-[2rem] border-[#d6d6d6] bg-[linear-gradient(135deg,#ffffff_0%,#f6f6f6_58%,#ececec_100%)] shadow-[0_24px_62px_rgba(15,23,42,0.06)]">
            <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[0.9fr,1.1fr] lg:px-7 lg:py-7">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#ED6203]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ED6203]">
                  <Globe2 size={14} />
                  {t('Contact Arobid for Support')}
                </div>
                <h2 className="mt-4">{t('Need guided support before you proceed?')}</h2>
                <p className="mt-3 text-sm leading-7 text-[#555555]">
                  {t('Use this form when you need help on project clarification, market entry, or government coordination. Login is required before the support request is created.')}
                </p>

                <div className="mt-5 grid gap-3">
                  {[
                    'Project clarification',
                    'Market entry and incentives',
                    'Meeting coordination',
                    'Government workflow support',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-[1.2rem] border border-[#dfdfdf] bg-white px-4 py-3">
                      <CheckCircle2 size={16} className="text-[#022582]" />
                      <span className="text-sm text-[#444444]">{t(item)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form className="grid gap-4 rounded-[1.6rem] border border-[#dfdfdf] bg-white p-4 shadow-sm md:grid-cols-2" onSubmit={submitSupportRequest}>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Company name')}</span>
                  <Input value={supportForm.companyName} onChange={(event) => updateSupportField('companyName', event.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Contact name')}</span>
                  <Input value={supportForm.contactName} onChange={(event) => updateSupportField('contactName', event.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Email')}</span>
                  <Input type="email" value={supportForm.email} onChange={(event) => updateSupportField('email', event.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Phone')}</span>
                  <Input value={supportForm.phone} onChange={(event) => updateSupportField('phone', event.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Project')}</span>
                  <select className="app-input" value={supportForm.projectId} onChange={(event) => updateSupportField('projectId', event.target.value)}>
                    {homeProjects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('Support topic')}</span>
                  <Input value={supportForm.topic} onChange={(event) => updateSupportField('topic', event.target.value)} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('How can Arobid help?')}</span>
                  <Textarea
                    value={supportForm.message}
                    onChange={(event) => updateSupportField('message', event.target.value)}
                    placeholder={t('Describe the support you need, the blockers you are facing, and what response would unblock the next step.')}
                  />
                </label>

                <label className="md:col-span-2 flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={supportForm.urgent}
                    onChange={(event) => updateSupportField('urgent', event.target.checked)}
                  />
                  <span className="text-sm text-slate-600">{t('Mark this as urgent')}</span>
                </label>

                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-[#666666]">{role ? t('This will create a support issue immediately.') : t('Login is required before the support request is created.')}</div>
                  <Button type="submit" className="rounded-full bg-[#ED6203] px-6 text-white hover:bg-[#d95b03]">
                    {t('Submit support request')}
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
