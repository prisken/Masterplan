// ——— Project ———
export type ProjectCategory = 'Revenue' | 'Authority' | 'Community' | 'Credibility' | 'Impact';
export type ProjectStatus = 'Idea' | 'Building' | 'Active' | 'Paused' | 'Completed';
export type ProjectPriority = 'High' | 'Medium' | 'Low';
export type RevenuePotential = 'High' | 'Medium' | 'Low';
export type TimeDemand = 'High' | 'Medium' | 'Low';

export interface Project {
  id: string;
  projectName: string;
  category: ProjectCategory;
  engine: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  mainGoal: string;
  targetAudience: string;
  mainFeeling: string;
  mainMotive: string;
  currentPhase: string;
  owner: string;
  startDate: string;
  nextMilestone: string;
  milestoneDeadline: string;
  revenuePotential: RevenuePotential;
  timeDemand: TimeDemand;
  progress: number;
  notes: string;
}

// ——— Task ———
export type TaskArea =
  | 'Website'
  | 'Sales'
  | 'Content'
  | 'Study'
  | 'Event'
  | 'Admin'
  | 'Partnership'
  | 'Finance'
  | 'Insurance'
  | 'Recruitment'
  | 'Compliance';

export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  P0: 'P0 Critical',
  P1: 'P1 High',
  P2: 'P2 Medium',
  P3: 'P3 Low',
};

export type TaskStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Waiting'
  | 'Completed'
  | 'Overdue'
  | 'Deferred';

/** @deprecated use title */
export type LegacyTaskStatus = 'Done' | 'Delayed';
export type TimeNeeded = '15 min' | '30 min' | '1 hour' | '2 hours' | 'Half day' | 'Full day';
export type EnergyLevel = 'Low' | 'Medium' | 'High';
export type Impact = 'High' | 'Medium' | 'Low';

/** Progress track for Advisor Growth Center widgets */
export type TaskTrack =
  | ''
  | 'pa'
  | 'mdrt'
  | 'ifhc'
  | 'digital'
  | 'recruitment'
  | 'hiring';

/** Links task completion to Advisor tracker fields (Phase D). */
export type TaskMetricKey =
  | ''
  | 'pa.distinctInsured'
  | 'pa.newInsured'
  | 'pa.vitalityCustomers'
  | 'pa.ifhcReports'
  | 'pa.digitalActivities'
  | 'pa.productCategory.savings'
  | 'pa.productCategory.protection'
  | 'pa.productCategory.thirdCategory'
  | 'mdrt.commission'
  | 'mdrt.fyp'
  | 'mdrt.income'
  | 'mdrt.firstYearCommission'
  | 'recruitment.agentsOnboarded';

export type TaskMetricMode = 'set' | 'increment';

export interface Task {
  id: string;
  /** Primary display name */
  title: string;
  /** @deprecated migrated to title */
  taskName?: string;
  projectId: string;
  module: string;
  area: TaskArea;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  owner: string;
  dependency: string;
  successMetric: string;
  progressPercentage: number;
  timeNeeded: TimeNeeded;
  energyLevel: EnergyLevel;
  impact: Impact;
  track: TaskTrack;
  /** When set, completing this task updates the linked advisor metric. */
  metricKey: TaskMetricKey;
  metricMode: TaskMetricMode;
  /** Target value (set) or delta (increment). */
  metricValue: number;
  /** Advisor field value before last metric apply (for reverting set mode). */
  metricSnapshot?: number;
  today: boolean;
  thisWeek: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string;
}

// ——— Advisor execution trackers ———
export type PaStatusLabel = 'On Track' | 'Slightly Behind' | 'Seriously Behind' | 'Completed';
export type MdrtRoute = 'commission' | 'fyp' | 'income';
export type PaceStatus = 'on_track' | 'slightly_behind' | 'seriously_behind' | 'completed';

export interface PaProductCategories {
  savings: boolean;
  protection: boolean;
  thirdCategory: boolean;
}

export interface PaTrackerData {
  distinctInsured: number;
  newInsured: number;
  vitalityCustomers: number;
  ifhcReports: number;
  digitalActivities: number;
  productCategories: PaProductCategories;
}

export interface MdrtTrackerData {
  primaryRoute: MdrtRoute;
  currentCommission: number;
  currentFyp: number;
  currentIncome: number;
  currentFirstYearCommission: number;
}

export type RecruitmentStage =
  | 'Identified'
  | 'Contacted'
  | 'Vision Meeting Booked'
  | 'Vision Meeting Completed'
  | 'Interested'
  | 'Licensing Study Started'
  | 'Exam Ready'
  | 'Exam Passed'
  | 'Contracting / Appointment'
  | 'Onboarded'
  | 'Active Agent';

export interface RecruitmentCandidate {
  id: string;
  name: string;
  stage: RecruitmentStage;
  notes: string;
  updatedAt: string;
}

export interface RecruitmentTrackerData {
  candidates: RecruitmentCandidate[];
  agentsOnboarded: number;
  agentsTarget: number;
}

export interface AdvisorExecutionState {
  pa: PaTrackerData;
  mdrt: MdrtTrackerData;
  recruitment: RecruitmentTrackerData;
}

// ——— Contact ———
export type ContactType =
  | 'Business Lead'
  | 'Sponsor'
  | 'Donor'
  | 'Volunteer'
  | 'Parent'
  | 'Media'
  | 'Partner';

export type Source =
  | 'Referral'
  | 'LinkedIn'
  | 'Facebook'
  | 'Event'
  | 'Cold Outreach'
  | 'Friend'
  | 'Website';

export type RelationshipStrength = 'Cold' | 'Warm' | 'Hot' | 'Existing';

export type Stage =
  | 'New'
  | 'Contacted'
  | 'Replied'
  | 'Meeting Booked'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost'
  | 'Nurture';

export type PotentialValue = 'High' | 'Medium' | 'Low';

export interface Contact {
  id: string;
  name: string;
  organization: string;
  contactType: ContactType;
  relatedProjectId: string;
  role: string;
  phone: string;
  email: string;
  source: Source;
  relationshipStrength: RelationshipStrength;
  stage: Stage;
  lastContactDate: string;
  nextFollowUpDate: string;
  potentialValue: PotentialValue;
  notes: string;
}

// ——— Content ———
export type Platform =
  | 'YouTube'
  | 'TikTok'
  | 'Instagram'
  | 'Facebook'
  | 'LinkedIn'
  | 'Website'
  | 'Newsletter';

export type ContentType =
  | 'Short Video'
  | 'Long Video'
  | 'Post'
  | 'Article'
  | 'Song'
  | 'Story'
  | 'Email'
  | 'Reel';

export type ContentPillar =
  | 'Market News'
  | 'Sales Tips'
  | 'Parenting'
  | 'Charity Story'
  | 'Study Journey'
  | 'Event Promo';

export type ContentStatus =
  | 'Idea'
  | 'Scripted'
  | 'Filmed'
  | 'Edited'
  | 'Scheduled'
  | 'Published';

export interface ContentItem {
  id: string;
  contentTitle: string;
  projectId: string;
  platform: Platform;
  contentType: ContentType;
  contentPillar: ContentPillar;
  status: ContentStatus;
  publishDate: string;
  mainMessage: string;
  callToAction: string;
  assetLink: string;
  performanceNotes: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  leadsGenerated: number;
}

// ——— Event ———
export type EventType =
  | 'Charity'
  | 'Parent Gathering'
  | 'Business Seminar'
  | 'Investment Livestream'
  | 'Networking';

export type EventStatus =
  | 'Idea'
  | 'Planning'
  | 'Confirmed'
  | 'Promoting'
  | 'Completed'
  | 'Cancelled';

export interface Event {
  id: string;
  eventName: string;
  projectId: string;
  eventType: EventType;
  date: string;
  venueOrLink: string;
  status: EventStatus;
  targetAttendees: number;
  actualAttendees: number;
  budget: number;
  revenueOrDonations: number;
  sponsorsNeeded: number;
  sponsorsConfirmed: number;
  volunteersNeeded: number;
  volunteersConfirmed: number;
  mainGoal: string;
  notes: string;
  checklist: string;
}

// ——— Finance ———
export type FinanceType = 'Income' | 'Expense' | 'Donation' | 'Sponsorship' | 'Investment';

export type FinanceCategory =
  | 'Website'
  | 'Ads'
  | 'Event'
  | 'Tools'
  | 'Production'
  | 'Study'
  | 'Staff'
  | 'Donation';

export interface FinanceItem {
  id: string;
  item: string;
  projectId: string;
  type: FinanceType;
  category: FinanceCategory;
  amount: number;
  date: string;
  paid: boolean;
  notes: string;
}

// ——— HKSI Study ———
export type HksiPaper =
  | 'Paper 1'
  | 'Paper 2'
  | 'Paper 3'
  | 'Paper 4'
  | 'Paper 5'
  | 'Paper 6'
  | 'Paper 7'
  | 'Paper 8'
  | 'Paper 9';
export type ExamStatus =
  | 'Not Started'
  | 'Studying'
  | 'Mock Testing'
  | 'Booked'
  | 'Passed'
  | 'Retake Needed';

export interface HksiExam {
  id: string;
  paper: HksiPaper | string;
  targetExamDate: string;
  status: ExamStatus;
  studyProgress: number;
  mockScore: number;
  weakTopics: string;
  notes: string;
}

export interface StudyLog {
  id: string;
  date: string;
  paper: HksiPaper | string;
  topic: string;
  studyTime: number;
  questionsDone: number;
  score: number;
  mistakesNotes: string;
}

export interface WrongAnswer {
  id: string;
  questionOrTopic: string;
  paper: HksiPaper | string;
  whyWrong: string;
  correctRule: string;
  reviewDate: string;
  mastered: boolean;
}

// ——— Today ———
export interface DailyEntry {
  id: string;
  date: string;
  /** Master Task ids linked to this day (Top 3 / focus list). */
  linkedTaskIds: string[];
  todayTop3Tasks: string;
  oneRevenueTask: string;
  oneAuthorityTask: string;
  oneRelationshipTask: string;
  oneStudyTask: string;
  oneAdminTask: string;
  peopleToFollowUp: string;
  contentToCreateOrPost: string;
  mustBeFinishedToday: string;
  canWait: string;
  endOfDayCompleted: string;
  endOfDayLearned: string;
  firstTaskTomorrow: string;
}

// ——— Weekly Review ———
export interface WeeklyScoreboard {
  businessLeadsContactedTarget: number;
  businessLeadsContactedActual: number;
  salesCallsBookedTarget: number;
  salesCallsBookedActual: number;
  proposalsSentTarget: number;
  proposalsSentActual: number;
  newClientsClosedTarget: number;
  newClientsClosedActual: number;
  investmentVideosPostedTarget: number;
  investmentVideosPostedActual: number;
  followersGainedTarget: number;
  followersGainedActual: number;
  hksiStudyHoursTarget: number;
  hksiStudyHoursActual: number;
  practiceQuestionsCompletedTarget: number;
  practiceQuestionsCompletedActual: number;
  sponsorContactsTarget: number;
  sponsorContactsActual: number;
  volunteersRecruitedTarget: number;
  volunteersRecruitedActual: number;
  parentCommunityContactsTarget: number;
  parentCommunityContactsActual: number;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  whatWorked: string;
  whatDidNotWork: string;
  projectMostProgress: string;
  projectMostStress: string;
  opportunityToDoubleDown: string;
  stopDelegateDelay: string;
  top5ActionsNextWeek: string;
  scoreboard: WeeklyScoreboard;
}

// ——— Monthly Review ———
export interface MonthlyReview {
  id: string;
  month: string;
  biggestWins: string;
  biggestProblems: string;
  revenueGenerated: string;
  followersGained: string;
  leadsGenerated: string;
  eventsHeld: string;
  sponsorsDonorsAdded: string;
  hksiStudyProgress: string;
  bestPerformingContent: string;
  mostValuableRelationshipBuilt: string;
  projectDeservesMoreFocus: string;
  projectShouldBeSimplified: string;
  nextMonthTop10Actions: string;
}

// ——— Digital Asset ———
export type AssetType =
  | 'Logo'
  | 'Photo'
  | 'Video'
  | 'Script'
  | 'Deck'
  | 'Form'
  | 'Website Copy'
  | 'Song'
  | 'Contract'
  | 'Template';

export type AssetStatus = 'Draft' | 'Approved' | 'Published' | 'Archived';

export interface DigitalAsset {
  id: string;
  assetName: string;
  projectId: string;
  assetType: AssetType;
  status: AssetStatus;
  link: string;
  lastUpdated: string;
  notes: string;
}

// ——— AI Prompt ———
export type PromptUseCase =
  | 'Market Analysis'
  | 'Sales Script'
  | 'Video Script'
  | 'Event Planning'
  | 'Email'
  | 'Songwriting'
  | 'Study';

export type OutputFormat = 'Bullet Points' | 'Script' | 'Table' | 'Email' | 'Checklist';

export type QualityRating = 'Excellent' | 'Good' | 'Needs Work';

export interface AiPrompt {
  id: string;
  promptName: string;
  projectId: string;
  useCase: PromptUseCase;
  promptText: string;
  outputFormat: OutputFormat;
  qualityRating: QualityRating;
  notes: string;
}

// ——— App settings ———
export interface AppSettings {
  /** When true, task timelines and advisor pacing use the device clock. */
  useLiveClock: boolean;
  /** ISO date (YYYY-MM-DD) used when useLiveClock is false. */
  pacingDate: string;
}

// ——— App state ———
export interface AppData {
  version: number;
  settings: AppSettings;
  projects: Project[];
  tasks: Task[];
  contacts: Contact[];
  content: ContentItem[];
  events: Event[];
  finance: FinanceItem[];
  hksiExams: HksiExam[];
  studyLogs: StudyLog[];
  wrongAnswers: WrongAnswer[];
  dailyEntries: DailyEntry[];
  weeklyReviews: WeeklyReview[];
  monthlyReviews: MonthlyReview[];
  digitalAssets: DigitalAsset[];
  aiPrompts: AiPrompt[];
  advisor: AdvisorExecutionState;
}

export const STORAGE_KEY = 'master-portfolio-command-center';
export const DATA_VERSION = 10;

/** Fixed reference date for pacing calculations (15 May 2026) */
export const REFERENCE_DATE = '2026-05-15';

export const ADVISOR_GROWTH_PROJECT_ID = 'advisor-growth-center';
export const APP_VERSION = '1.0 local-first';

export const DEFAULT_WEEKLY_SCOREBOARD: WeeklyScoreboard = {
  businessLeadsContactedTarget: 100,
  businessLeadsContactedActual: 0,
  salesCallsBookedTarget: 5,
  salesCallsBookedActual: 0,
  proposalsSentTarget: 2,
  proposalsSentActual: 0,
  newClientsClosedTarget: 1,
  newClientsClosedActual: 0,
  investmentVideosPostedTarget: 3,
  investmentVideosPostedActual: 0,
  followersGainedTarget: 100,
  followersGainedActual: 0,
  hksiStudyHoursTarget: 7,
  hksiStudyHoursActual: 0,
  practiceQuestionsCompletedTarget: 200,
  practiceQuestionsCompletedActual: 0,
  sponsorContactsTarget: 10,
  sponsorContactsActual: 0,
  volunteersRecruitedTarget: 5,
  volunteersRecruitedActual: 0,
  parentCommunityContactsTarget: 10,
  parentCommunityContactsActual: 0,
};

export const DEFAULT_EVENT_CHECKLIST = `Event Purpose:
Target Audience:
Date:
Venue:
Budget:
Sponsors:
Volunteers:
Beneficiaries / Guests:
Program Rundown:
Promotion Plan:
Materials Needed:
Risk / Backup Plan:
Post-Event Follow-up:
Photos / Videos Collected:
Testimonials Collected:
Lessons Learned:`;
