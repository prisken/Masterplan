import type { AppData, Project, Task, TaskArea, TaskPriority, ProjectCategory, ProjectStatus, ProjectPriority } from '../types';
import { ADVISOR_GROWTH_PROJECT_ID, DATA_VERSION } from '../types';
import { migrateTask } from './taskMigrate';

/** Stable project ids used across seed data, `seedData.ts`, and migrations. */
export const PORTFOLIO_SIX_PROJECT_IDS = {
  profitPulseAlly: 'profit-pulse-ally',
  investmentNewsChannel: 'investment-news-channel',
  mamaSupreme: 'mama-supreme',
  hksiPapers: 'hksi-papers',
  eternalMoments: 'eternal-moments',
  advisorGrowthCenter: ADVISOR_GROWTH_PROJECT_ID,
} as const;

function slugify(text: string, maxLen: number): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen);
}

/** Deterministic task id: `task-{projectId}-{title-slug}`. */
export function stableTaskId(projectId: string, title: string): string {
  return `task-${projectId}-${slugify(title, 88)}`;
}

function normTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
}

type SeedTaskDef = {
  title: string;
  priority: TaskPriority;
  deadline: string;
  module: string;
  area: TaskArea;
  successMetric: string;
  strategicLink: string;
  why: string;
};

function buildTask(projectId: string, row: SeedTaskDef): Task {
  const now = new Date().toISOString();
  const id = stableTaskId(projectId, row.title);
  const impact = row.priority === 'P0' ? 'High' : ('Medium' as const);
  return migrateTask({
    id,
    title: row.title,
    projectId,
    module: row.module,
    area: row.area,
    priority: row.priority,
    status: 'Not Started',
    deadline: row.deadline,
    owner: 'You',
    dependency: '',
    successMetric: row.successMetric,
    progressPercentage: 0,
    timeNeeded: '1 hour',
    energyLevel: 'Medium',
    impact,
    track: '',
    metricKey: '',
    metricMode: 'set',
    metricValue: 0,
    today: false,
    thisWeek: false,
    notes: `Strategic link: ${row.strategicLink}\n\nWhy this matters: ${row.why}`,
    createdAt: now,
    updatedAt: now,
    completedAt: '',
  });
}

function proj(partial: Omit<Project, 'notes'> & { notes?: string }): Project {
  return {
    ...partial,
    notes: partial.notes ?? '',
  };
}

/** Canonical definitions for the six engines (ids must match `seedData` / storage). */
export const PORTFOLIO_SIX_PROJECTS: Project[] = [
  proj({
    id: PORTFOLIO_SIX_PROJECT_IDS.profitPulseAlly,
    projectName: 'Profit Pulse Ally',
    category: 'Revenue' as ProjectCategory,
    engine: 'Lead Engine',
    status: 'Active' as ProjectStatus,
    priority: 'High' as ProjectPriority,
    mainGoal:
      'Build a sales-force group helping businesses increase sales, protect cash flow, and use investment logic for zero-cost development. Main purpose is leads and client acquisition. Run an event in June 2026.',
    targetAudience: 'SMEs, business owners, entrepreneurs seeking sales growth',
    mainFeeling: 'Professional, direct, outcome-driven',
    mainMotive: 'Leads, client acquisition, June 2026 event',
    currentPhase: 'Execution',
    owner: 'You',
    startDate: '2026-01-01',
    nextMilestone: 'June 2026 event confirmed with registration live',
    milestoneDeadline: '2026-06-30',
    revenuePotential: 'High',
    timeDemand: 'High',
    progress: 5,
    notes: 'Portfolio six-pack: Business sales / lead engine.',
  }),
  proj({
    id: PORTFOLIO_SIX_PROJECT_IDS.investmentNewsChannel,
    projectName: 'Investment News Channel',
    category: 'Authority' as ProjectCategory,
    engine: 'Authority Engine',
    status: 'Building' as ProjectStatus,
    priority: 'Medium' as ProjectPriority,
    mainGoal:
      'Build investment authority through market-news videos using cartoon characters and AI-assisted market insight formulas.',
    targetAudience: 'Retail investors, finance-curious viewers, prospects for advisory',
    mainFeeling: 'Clear, credible, entertaining',
    mainMotive: 'Authority, inbound interest, cross-sell to Profit Pulse',
    currentPhase: 'MVP',
    owner: 'You',
    startDate: '2026-01-01',
    nextMilestone: 'First 3 shorts published with CTA',
    milestoneDeadline: '2026-06-15',
    revenuePotential: 'Medium',
    timeDemand: 'High',
    progress: 5,
    notes: 'Portfolio six-pack: Content / authority.',
  }),
  proj({
    id: PORTFOLIO_SIX_PROJECT_IDS.mamaSupreme,
    projectName: 'Mama Supreme',
    category: 'Community' as ProjectCategory,
    engine: 'Relationship Engine',
    status: 'Building' as ProjectStatus,
    priority: 'Medium' as ProjectPriority,
    mainGoal:
      'Empower single parents through gatherings, child-care-supported events, story reading, picnics, and children songs. Main purpose is networking and leads generation.',
    targetAudience: 'Single parents, caregivers, schools, NGOs',
    mainFeeling: 'Warm, safe, community-led',
    mainMotive: 'Trust, networking, qualified leads for protection conversations',
    currentPhase: 'MVP',
    owner: 'You',
    startDate: '2026-01-01',
    nextMilestone: 'First small gathering hosted or scheduled',
    milestoneDeadline: '2026-07-31',
    revenuePotential: 'Medium',
    timeDemand: 'Medium',
    progress: 5,
    notes: 'Portfolio six-pack: Community / parenting.',
  }),
  proj({
    id: PORTFOLIO_SIX_PROJECT_IDS.hksiPapers,
    projectName: 'HKSI Papers',
    category: 'Credibility' as ProjectCategory,
    engine: 'Credibility Engine',
    status: 'Active' as ProjectStatus,
    priority: 'High' as ProjectPriority,
    mainGoal:
      'Pass HKSI Papers 1, 7, and 8 by July 2026, and all 9 papers by end of 2026.',
    targetAudience: 'Professional licensing path for advisory credibility',
    mainFeeling: 'Disciplined, exam-ready',
    mainMotive: 'Licensing credibility for content and advisory',
    currentPhase: 'Study',
    owner: 'You',
    startDate: '2026-01-01',
    nextMilestone: 'Papers 1, 7, 8 passed by July 2026',
    milestoneDeadline: '2026-07-31',
    revenuePotential: 'Medium',
    timeDemand: 'High',
    progress: 0,
    notes: 'Portfolio six-pack: HKSI licensing.',
  }),
  proj({
    id: PORTFOLIO_SIX_PROJECT_IDS.eternalMoments,
    projectName: 'Eternal Moments',
    category: 'Impact' as ProjectCategory,
    engine: 'Impact Engine',
    status: 'Building' as ProjectStatus,
    priority: 'Medium' as ProjectPriority,
    mainGoal:
      'Structure and scale charity events giving elderly and permanently disabled people a fashion-show experience where they become the main character for a day. Complete digital tools by end of August 2026 and hold one more event by end of 2026.',
    targetAudience: 'Elderly, disabled participants, donors, sponsors, volunteers',
    mainFeeling: 'Dignified, emotional, memorable',
    mainMotive: 'Impact storytelling, sponsor pipeline, operational scale',
    currentPhase: 'Structure',
    owner: 'You',
    startDate: '2026-01-01',
    nextMilestone: 'Digital tools complete; one additional event in 2026',
    milestoneDeadline: '2026-12-31',
    revenuePotential: 'Medium',
    timeDemand: 'High',
    progress: 10,
    notes: 'Portfolio six-pack: Charity / social impact.',
  }),
  proj({
    id: PORTFOLIO_SIX_PROJECT_IDS.advisorGrowthCenter,
    projectName: 'Advisor Growth Center',
    category: 'Revenue' as ProjectCategory,
    engine: 'Revenue Engine',
    status: 'Active' as ProjectStatus,
    priority: 'High' as ProjectPriority,
    mainGoal:
      'Achieve PA/MDRT, build full-range financial advisory business, and create a lead-to-agent/team sales system connected to all other projects.',
    targetAudience: 'Prospects, clients, future agents, centers of influence',
    mainFeeling: 'Disciplined, ambitious, accountable',
    mainMotive: 'PA/MDRT, recruitment, integrated sales system',
    currentPhase: 'Execution',
    owner: 'You',
    startDate: '2026-01-01',
    nextMilestone: 'Baseline entered; CRM stages defined; first iFHC batch moving',
    milestoneDeadline: '2026-06-30',
    revenuePotential: 'High',
    timeDemand: 'High',
    progress: 5,
    notes: 'Portfolio six-pack: Career / insurance execution hub.',
  }),
];

const PID = PORTFOLIO_SIX_PROJECT_IDS;

const ADVISOR_TASKS: SeedTaskDef[] = [
  {
    title: 'Enter current PA/MDRT/iFHC/digital/recruitment baseline numbers',
    priority: 'P0',
    deadline: '2026-05-18',
    module: 'PA/MDRT Planning',
    area: 'Insurance',
    successMetric: 'Baseline numbers entered',
    strategicLink: 'Connects Profit Pulse, Investment News, and Mama Supreme leads to measurable advisor execution.',
    why: 'You cannot pace MDRT/PA or coach yourself without a truthful starting line.',
  },
  {
    title: 'Define one universal lead pipeline stage system',
    priority: 'P0',
    deadline: '2026-05-20',
    module: 'CRM System',
    area: 'Sales',
    successMetric: 'CRM stages created',
    strategicLink: 'Unifies inbound from all six projects into one language for follow-up.',
    why: 'One pipeline prevents leads from dying in different notebooks or chat threads.',
  },
  {
    title: 'Build target prospect list of 50 people from existing network',
    priority: 'P0',
    deadline: '2026-05-21',
    module: 'Client Acquisition',
    area: 'Insurance',
    successMetric: '50 prospects listed',
    strategicLink: 'Feeds iFHC selection and Profit Pulse / Mama Supreme warm outreach.',
    why: 'Volume + specificity beat random calling when time is limited.',
  },
  {
    title: 'Identify which product category is missing for PA full-range business',
    priority: 'P0',
    deadline: '2026-05-22',
    module: 'PA Product Coverage',
    area: 'Insurance',
    successMetric: 'Missing category confirmed',
    strategicLink: 'Aligns PA product mix with real client demand across engines.',
    why: 'Closing the gap early prevents year-end scramble on eligibility metrics.',
  },
  {
    title: 'Select first 10 prospects for iFHC reports',
    priority: 'P0',
    deadline: '2026-05-24',
    module: 'iFHC',
    area: 'Insurance',
    successMetric: '10 names selected',
    strategicLink: 'Turns network into a concrete PA activity batch.',
    why: 'iFHC needs named humans—not “the market”—to ship reports on schedule.',
  },
  {
    title: 'Calculate monthly MDRT gap from current commission/FYP/income',
    priority: 'P0',
    deadline: '2026-05-25',
    module: 'MDRT',
    area: 'Insurance',
    successMetric: 'Monthly gap known',
    strategicLink: 'Links Investment News and business development to production math.',
    why: 'A monthly gap turns MDRT from a mood into a spreadsheet you can chase.',
  },
  {
    title: 'Define 5 roles needed in the future sales team',
    priority: 'P0',
    deadline: '2026-05-26',
    module: 'Team Building',
    area: 'Recruitment',
    successMetric: 'Role map completed',
    strategicLink: 'Bridges recruitment funnel to Eternal Moments / Profit Pulse volunteer energy.',
    why: 'Hiring without roles produces overlapping effort and unclear accountability.',
  },
  {
    title: 'Create first recruitment candidate list of 20 people',
    priority: 'P0',
    deadline: '2026-05-28',
    module: 'Team Building',
    area: 'Recruitment',
    successMetric: '20 candidates listed',
    strategicLink: 'Pairs with vision meetings and sales-system training later in the pack.',
    why: 'A named bench makes “who should we talk to this week?” trivial.',
  },
  {
    title: 'Choose PA customer-count route: Option 1 or Option 2',
    priority: 'P0',
    deadline: '2026-05-20',
    module: 'PA',
    area: 'Insurance',
    successMetric: 'Route selected',
    strategicLink: 'Locks how you count distinct lives for PA pacing for the rest of 2026.',
    why: 'Ambiguity here wastes weeks of duplicated effort across trackers and tasks.',
  },
  {
    title: 'Identify 8 target-category prospects',
    priority: 'P0',
    deadline: '2026-05-24',
    module: 'PA',
    area: 'Insurance',
    successMetric: '8 prospects listed',
    strategicLink: 'Supports product-category gap closure with real faces.',
    why: 'Eight tight names beat eighty vague “contacts” for PA conversations.',
  },
  {
    title: 'Complete first 5 iFHC reports',
    priority: 'P0',
    deadline: '2026-05-31',
    module: 'PA',
    area: 'Insurance',
    successMetric: '5 reports sent',
    strategicLink: 'Proof-of-work for PA digital activity and credibility with warm leads.',
    why: 'Early sends build muscle and create referral stories before June events.',
  },
  {
    title: 'Complete 12 iFHC reports total',
    priority: 'P0',
    deadline: '2026-06-15',
    module: 'PA',
    area: 'Insurance',
    successMetric: '12 reports sent',
    strategicLink: 'Mid-year checkpoint tying to MDRT gap math and pipeline discipline.',
    why: 'Batching to twelve prevents “I did five then stopped” drift through summer.',
  },
  {
    title: 'Complete 24 iFHC reports total',
    priority: 'P0',
    deadline: '2026-07-31',
    module: 'PA',
    area: 'Insurance',
    successMetric: '24 reports sent',
    strategicLink: 'Positions you for H2 advisory volume without burning goodwill.',
    why: 'Twenty-four is a serious cadence that still fits alongside HKSI crunch.',
  },
  {
    title: 'Create separate sales journeys for business owner, parent, donor, investor lead',
    priority: 'P0',
    deadline: '2026-05-28',
    module: 'Client Journey',
    area: 'Sales',
    successMetric: '4 funnels created',
    strategicLink: 'Maps Profit Pulse, Mama Supreme, Eternal Moments, and Investment News psychologies.',
    why: 'One script for four avatars confuses both you and the prospect.',
  },
  {
    title: 'Define sales-stage rules before agent can pitch policy',
    priority: 'P0',
    deadline: '2026-05-26',
    module: 'Team System',
    area: 'Recruitment',
    successMetric: 'Rules written',
    strategicLink: 'Protects brand when recruiting agents who will touch your warm leads.',
    why: 'Compliance and trust break when rookies pitch too early.',
  },
  {
    title: 'Design lead assignment rules by source',
    priority: 'P0',
    deadline: '2026-05-28',
    module: 'Team System',
    area: 'Recruitment',
    successMetric: 'Rules for 4 lead sources',
    strategicLink: 'Operationalizes “who owns what lead” across engines.',
    why: 'Without assignment rules, duplicate outreach annoys high-value introducers.',
  },
  {
    title: 'Create CRM stages: New Lead, Met, Diagnosed, Matched, Proposal, Closed, Nurture',
    priority: 'P0',
    deadline: '2026-05-30',
    module: 'CRM',
    area: 'Sales',
    successMetric: 'CRM stages finalized',
    strategicLink: 'Feeds the universal pipeline and journey maps in this same pack.',
    why: 'Named stages make weekly reviews honest and Today-page carry-forwards meaningful.',
  },
  {
    title: 'Identify 20 candidates for team roles',
    priority: 'P1',
    deadline: '2026-06-05',
    module: 'Recruitment',
    area: 'Recruitment',
    successMetric: '20 names',
    strategicLink: 'Deepens the bench beyond the first twenty recruitment prospects.',
    why: 'Role-specific lists make interviews faster and reduce “friends only” bias.',
  },
  {
    title: 'Hold 5 vision meetings with possible team members',
    priority: 'P1',
    deadline: '2026-06-15',
    module: 'Recruitment',
    area: 'Recruitment',
    successMetric: '5 meetings',
    strategicLink: 'Converts lists into human signal before you invest in training assets.',
    why: 'Vision meetings surface values fit early—cheaper than fixing culture later.',
  },
  {
    title: 'Create first version of sales-system training deck',
    priority: 'P1',
    deadline: '2026-06-30',
    module: 'Training',
    area: 'Recruitment',
    successMetric: 'Deck completed',
    strategicLink: 'Packages stage rules + journeys for new agents and assistants.',
    why: 'A deck turns tribal knowledge into something you can iterate weekly.',
  },
  {
    title: 'Create lead-source tagging system',
    priority: 'P1',
    deadline: '2026-07-15',
    module: 'CRM',
    area: 'Sales',
    successMetric: 'Tags working',
    strategicLink: 'Completes assignment rules with measurable attribution.',
    why: 'Tags tell you which engine earns its keep—critical before scaling spend.',
  },
];

const PROFIT_PULSE_TASKS: SeedTaskDef[] = [
  {
    title: 'Define the core offer in one sentence',
    priority: 'P0',
    deadline: '2026-05-18',
    module: 'Offer',
    area: 'Sales',
    successMetric: 'Offer sentence completed',
    strategicLink: 'Anchors June event messaging and Investment News CTAs.',
    why: 'If the offer sentence is fuzzy, every invite, deck, and follow-up inherits the fuzz.',
  },
  {
    title: 'Choose June event theme and target audience',
    priority: 'P0',
    deadline: '2026-05-19',
    module: 'Event',
    area: 'Event',
    successMetric: 'Theme confirmed',
    strategicLink: 'Locks creative direction for Investment News “event support” shorts.',
    why: 'Theme drives speaker selection, venue vibe, and which SMEs actually RSVP.',
  },
  {
    title: 'Pick event date, venue type, and format',
    priority: 'P0',
    deadline: '2026-05-20',
    module: 'Event',
    area: 'Event',
    successMetric: 'Date/format selected',
    strategicLink: 'Enables landing page deadlines and HKSI study time blocking.',
    why: 'Date is the forcing function—everything else hangs off it.',
  },
  {
    title: 'Build list of 50 SME/business-owner invitees',
    priority: 'P0',
    deadline: '2026-05-21',
    module: 'Lead Gen',
    area: 'Sales',
    successMetric: '50 invitees listed',
    strategicLink: 'Feeds Profit Pulse funnel stages and advisor prospect hygiene.',
    why: 'Fifty names turn “we should do an event” into a measurable outreach sprint.',
  },
  {
    title: 'Create event landing page or registration form',
    priority: 'P0',
    deadline: '2026-05-22',
    module: 'Event',
    area: 'Event',
    successMetric: 'Registration form live',
    strategicLink: 'Digital capture ties Eternal Moments / channel audiences to one URL.',
    why: 'No form means RSVPs live in DMs and die under follow-up debt.',
  },
  {
    title: 'Draft 3-stage sales funnel: meet → diagnose → solution',
    priority: 'P0',
    deadline: '2026-05-24',
    module: 'Sales System',
    area: 'Sales',
    successMetric: 'Funnel drafted',
    strategicLink: 'Aligns post-event conversations with advisor CRM stages.',
    why: 'A simple funnel keeps post-event energy from evaporating by Tuesday.',
  },
  {
    title: 'Identify 10 potential speakers/partners/sponsors',
    priority: 'P0',
    deadline: '2026-05-27',
    module: 'Partnership',
    area: 'Partnership',
    successMetric: '10 partners listed',
    strategicLink: 'Cross-engine credibility—authority voices and charity goodwill.',
    why: 'Ten warm names beat cold sponsor decks when timeline is short.',
  },
];

const HKSI_TASKS: SeedTaskDef[] = [
  {
    title: 'Decide exam order for Papers 1, 7, 8',
    priority: 'P0',
    deadline: '2026-05-18',
    module: 'Study Plan',
    area: 'Study',
    successMetric: 'Exam sequence confirmed',
    strategicLink: 'Coordinates with July deadline and summer business travel.',
    why: 'Order affects morale—winning sequencing prevents “start over” fatigue.',
  },
  {
    title: 'Book or schedule Paper 1 target exam date',
    priority: 'P0',
    deadline: '2026-05-19',
    module: 'Study Plan',
    area: 'Study',
    successMetric: 'Date selected/booked',
    strategicLink: 'Hard date backs daily study blocks on Today page.',
    why: 'Unbooked exams drift; a date converts hope into calendar reality.',
  },
  {
    title: 'Complete first full Paper 1 syllabus pass',
    priority: 'P0',
    deadline: '2026-05-24',
    module: 'Paper 1',
    area: 'Study',
    successMetric: '100% first pass',
    strategicLink: 'Feeds 300-question milestone and weekly scoreboard study hours.',
    why: 'First pass exposes weak chapters before mock volume.',
  },
  {
    title: 'Complete 300 Paper 1 practice questions',
    priority: 'P0',
    deadline: '2026-05-30',
    module: 'Paper 1',
    area: 'Study',
    successMetric: '300 questions completed',
    strategicLink: 'Builds exam stamina parallel to Profit Pulse June crunch.',
    why: 'Three hundred reps reduce exam-day surprise more than rereading notes.',
  },
  {
    title: 'Complete first full Paper 7 syllabus pass',
    priority: 'P0',
    deadline: '2026-06-07',
    module: 'Paper 7',
    area: 'Study',
    successMetric: '100% first pass',
    strategicLink: 'Second wave after Paper 1 momentum—keeps July bundle realistic.',
    why: 'Paper 7 often needs fresh eyes after Paper 1 habits form.',
  },
  {
    title: 'Complete first full Paper 8 syllabus pass',
    priority: 'P0',
    deadline: '2026-06-21',
    module: 'Paper 8',
    area: 'Study',
    successMetric: '100% first pass',
    strategicLink: 'Closes the July trio so H2 can focus on remaining papers.',
    why: 'Finishing the trio unlocks confident scheduling for later papers.',
  },
];

const INVESTMENT_NEWS_TASKS: SeedTaskDef[] = [
  {
    title: 'Define channel promise and target audience',
    priority: 'P1',
    deadline: '2026-05-22',
    module: 'Positioning',
    area: 'Content',
    successMetric: 'One-liner completed',
    strategicLink: 'Feeds cartoon characters and Profit Pulse CTAs with same promise.',
    why: 'Audience clarity stops you from making “videos for everyone.”',
  },
  {
    title: 'Create 3 cartoon character concepts',
    priority: 'P1',
    deadline: '2026-05-25',
    module: 'Characters',
    area: 'Content',
    successMetric: '3 characters drafted',
    strategicLink: 'Visual IP that Mama Supreme kids’ content can echo later.',
    why: 'Characters turn market news into a recognizable brand, not random clips.',
  },
  {
    title: 'Define AI market-news digestion formula',
    priority: 'P1',
    deadline: '2026-05-28',
    module: 'Formula',
    area: 'Content',
    successMetric: 'Formula v1 written',
    strategicLink: 'Scales weekly template and reduces editing time per video.',
    why: 'A formula is what makes “weekly” actually sustainable.',
  },
  {
    title: 'Create weekly content template',
    priority: 'P1',
    deadline: '2026-05-30',
    module: 'Content System',
    area: 'Content',
    successMetric: 'Template created',
    strategicLink: 'Connects formula + characters + CTA blocks into one repeatable doc.',
    why: 'Templates shrink decision fatigue on recording days.',
  },
  {
    title: 'Publish first 3 short-form market videos',
    priority: 'P1',
    deadline: '2026-06-03',
    module: 'Production',
    area: 'Content',
    successMetric: '3 videos published',
    strategicLink: 'Proof for June event and advisor inbound experiments.',
    why: 'Shipping three teaches distribution faster than perfecting one.',
  },
  {
    title: 'Add CTA for market briefing / consultation',
    priority: 'P1',
    deadline: '2026-06-10',
    module: 'Lead Capture',
    area: 'Sales',
    successMetric: 'CTA live',
    strategicLink: 'Routes viewers into Profit Pulse funnel + advisor pipeline tags.',
    why: 'Views without CTA are vanity; CTA makes the channel a business asset.',
  },
  {
    title: 'Produce 2 market/cash-flow insights for Profit Pulse event',
    priority: 'P1',
    deadline: '2026-06-15',
    module: 'Profit Pulse Support',
    area: 'Content',
    successMetric: '2 event content assets',
    strategicLink: 'Explicit cross-engine deliverable for June event credibility.',
    why: 'Event attendees should feel the channel’s thinking before they walk in.',
  },
];

const MAMA_SUPREME_TASKS: SeedTaskDef[] = [
  {
    title: 'Define Mama Supreme audience and promise',
    priority: 'P1',
    deadline: '2026-05-25',
    module: 'Positioning',
    area: 'Partnership',
    successMetric: 'One-liner completed',
    strategicLink: 'Aligns gatherings with soft protection conversation path later.',
    why: 'Promise clarity protects vulnerable participants and your reputation.',
  },
  {
    title: 'Design first single-parent gathering format',
    priority: 'P1',
    deadline: '2026-05-29',
    module: 'Event Concept',
    area: 'Event',
    successMetric: 'Format completed',
    strategicLink: 'Child-care-supported format is the differentiator—design it deliberately.',
    why: 'Logistics make or break trust before anyone hears a financial concept.',
  },
  {
    title: 'Draft first 5 children song topics',
    priority: 'P1',
    deadline: '2026-06-05',
    module: 'Content',
    area: 'Content',
    successMetric: '5 topics created',
    strategicLink: 'Lightweight content that can cross-post to Investment News tone tests.',
    why: 'Song topics are low-cost prototypes for community joy + shareability.',
  },
  {
    title: 'Build list of 20 community partners/schools/NGOs',
    priority: 'P1',
    deadline: '2026-06-10',
    module: 'Lead Gen',
    area: 'Partnership',
    successMetric: '20 partners listed',
    strategicLink: 'Feeds Eternal Moments volunteer culture and event credibility.',
    why: 'Partners unlock venues, childcare volunteers, and warm introductions.',
  },
  {
    title: 'Design soft family-protection conversation path',
    priority: 'P1',
    deadline: '2026-06-15',
    module: 'Family Advisory',
    area: 'Insurance',
    successMetric: 'Funnel drafted',
    strategicLink: 'Keeps Mama Supreme humane while connecting to advisor journeys.',
    why: 'Soft paths respect trauma timelines and improve conversion quality.',
  },
  {
    title: 'Host or confirm first small gathering',
    priority: 'P1',
    deadline: '2026-07-15',
    module: 'MVP Event',
    area: 'Event',
    successMetric: 'Event completed or scheduled',
    strategicLink: 'Real-world proof for recruitment storytelling and donor asks.',
    why: 'Until something is scheduled, Mama Supreme stays theoretical.',
  },
];

const ETERNAL_MOMENTS_TASKS: SeedTaskDef[] = [
  {
    title: 'Document current event process from past 6 events',
    priority: 'P1',
    deadline: '2026-05-31',
    module: 'Structure',
    area: 'Admin',
    successMetric: 'Process map completed',
    strategicLink: 'Feeds digital tool requirements and volunteer onboarding.',
    why: 'Scaling without documentation burns out your best volunteers.',
  },
  {
    title: 'Define donation tiers and sponsor packages',
    priority: 'P1',
    deadline: '2026-06-07',
    module: 'Donor System',
    area: 'Finance',
    successMetric: '3 sponsor tiers',
    strategicLink: 'Aligns Eternal Moments with Profit Pulse sponsor conversations.',
    why: 'Tiers make asks concrete for corporate sponsors and major donors.',
  },
  {
    title: 'Build volunteer role list and onboarding checklist',
    priority: 'P1',
    deadline: '2026-06-15',
    module: 'Volunteer System',
    area: 'Recruitment',
    successMetric: 'Checklist completed',
    strategicLink: 'Shares DNA with advisor “roles map” and recruitment vision meetings.',
    why: 'Volunteers need clarity—roles prevent last-minute heroics.',
  },
  {
    title: 'Define digital tool requirements',
    priority: 'P1',
    deadline: '2026-06-30',
    module: 'Digital Tools',
    area: 'Website',
    successMetric: 'Requirements document',
    strategicLink: 'August deadline anchor for engineering or vendor work.',
    why: 'Requirements stop scope creep on “just a simple app.”',
  },
  {
    title: 'Create story archive from past 6 events',
    priority: 'P1',
    deadline: '2026-07-15',
    module: 'Content',
    area: 'Content',
    successMetric: '6 stories drafted',
    strategicLink: 'Fuels Investment News impact pieces and donor reports.',
    why: 'Stories are reusable assets—draft them once, deploy everywhere.',
  },
  {
    title: 'Complete digital tools for charity operation',
    priority: 'P1',
    deadline: '2026-08-31',
    module: 'Digital Tools',
    area: 'Website',
    successMetric: 'Tools completed',
    strategicLink: 'Enables donor flow + volunteer scheduling for December event.',
    why: 'Manual spreadsheets break when you add a second city or sponsor tier.',
  },
  {
    title: 'Complete one more Eternal Moments event',
    priority: 'P1',
    deadline: '2026-12-15',
    module: 'Event',
    area: 'Event',
    successMetric: 'Event completed',
    strategicLink: 'Capstone that proves structure + tools + volunteer system.',
    why: 'One more event turns 2026 into a year of demonstrated impact, not plans.',
  },
];

const TASKS_BY_PROJECT: Record<string, SeedTaskDef[]> = {
  [PID.advisorGrowthCenter]: ADVISOR_TASKS,
  [PID.profitPulseAlly]: PROFIT_PULSE_TASKS,
  [PID.hksiPapers]: HKSI_TASKS,
  [PID.investmentNewsChannel]: INVESTMENT_NEWS_TASKS,
  [PID.mamaSupreme]: MAMA_SUPREME_TASKS,
  [PID.eternalMoments]: ETERNAL_MOMENTS_TASKS,
};

function mergeSixProject(existing: Project, incoming: Project): Project {
  return {
    ...incoming,
    notes: existing.notes.trim() ? existing.notes : incoming.notes,
    progress: existing.progress,
    milestoneDeadline: existing.milestoneDeadline.trim()
      ? existing.milestoneDeadline
      : incoming.milestoneDeadline,
  };
}

export type PortfolioSixSeedReport = {
  projectsUpdated: number;
  projectsAdded: number;
  tasksAdded: number;
  tasksSkippedExistingId: number;
  tasksSkippedDuplicateTitle: number;
};

/**
 * Upserts the six canonical projects and appends tasks that are missing
 * (by stable id or same project + normalized title).
 * Safe to run multiple times.
 */
export function applyPortfolioSixSeed(data: AppData): { next: AppData; report: PortfolioSixSeedReport } {
  const report: PortfolioSixSeedReport = {
    projectsUpdated: 0,
    projectsAdded: 0,
    tasksAdded: 0,
    tasksSkippedExistingId: 0,
    tasksSkippedDuplicateTitle: 0,
  };

  let projects = [...data.projects];

  for (const incoming of PORTFOLIO_SIX_PROJECTS) {
    const idx = projects.findIndex((p) => p.id === incoming.id);
    if (idx >= 0) {
      projects[idx] = mergeSixProject(projects[idx], incoming);
      report.projectsUpdated += 1;
    } else {
      projects.push({ ...incoming });
      report.projectsAdded += 1;
    }
  }

  const tasks = [...data.tasks];
  const existingIds = new Set(tasks.map((t) => t.id));
  const titleKey = (projectId: string, title: string) => `${projectId}::${normTitle(title)}`;
  const existingTitleKeys = new Set(tasks.map((t) => titleKey(t.projectId, t.title)));

  for (const projectId of Object.keys(TASKS_BY_PROJECT)) {
    const rows = TASKS_BY_PROJECT[projectId];
    if (!rows) continue;
    for (const row of rows) {
      const id = stableTaskId(projectId, row.title);
      if (existingIds.has(id)) {
        report.tasksSkippedExistingId += 1;
        continue;
      }
      const tk = titleKey(projectId, row.title);
      if (existingTitleKeys.has(tk)) {
        report.tasksSkippedDuplicateTitle += 1;
        continue;
      }
      const task = buildTask(projectId, row);
      tasks.push(task);
      existingIds.add(task.id);
      existingTitleKeys.add(tk);
      report.tasksAdded += 1;
    }
  }

  const next: AppData = {
    ...data,
    projects,
    tasks,
  };

  return { next, report };
}

const SIX_PROJECT_ID_SET = new Set(PORTFOLIO_SIX_PROJECTS.map((p) => p.id));

/** JSON shape suitable for manual import experiments (projects + tasks only). */
export function exportPortfolioSixSeedPayload(): {
  projects: Project[];
  tasks: Task[];
} {
  const empty = { ...dataShape() };
  const { next } = applyPortfolioSixSeed(empty);
  return {
    projects: next.projects.filter((p) => SIX_PROJECT_ID_SET.has(p.id)),
    tasks: next.tasks.filter((t) => SIX_PROJECT_ID_SET.has(t.projectId)),
  };
}

function dataShape(): AppData {
  return {
    version: DATA_VERSION,
    settings: { useLiveClock: false, pacingDate: '2026-01-01' },
    projects: [],
    tasks: [],
    contacts: [],
    content: [],
    events: [],
    finance: [],
    hksiExams: [],
    studyLogs: [],
    wrongAnswers: [],
    dailyEntries: [],
    weeklyReviews: [],
    monthlyReviews: [],
    digitalAssets: [],
    aiPrompts: [],
    advisor: {
      pa: {
        distinctInsured: 0,
        newInsured: 0,
        vitalityCustomers: 0,
        ifhcReports: 0,
        digitalActivities: 0,
        productCategories: { savings: false, protection: false, thirdCategory: false },
      },
      mdrt: {
        primaryRoute: 'commission',
        currentCommission: 0,
        currentFyp: 0,
        currentIncome: 0,
        currentFirstYearCommission: 0,
      },
      recruitment: { candidates: [], agentsOnboarded: 0, agentsTarget: 4 },
    },
  };
}
