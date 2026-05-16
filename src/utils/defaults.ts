import type {
  AdvisorExecutionState,
  AppSettings,
  AiPrompt,
  Contact,
  ContentItem,
  DailyEntry,
  DigitalAsset,
  Event,
  FinanceItem,
  HksiExam,
  MonthlyReview,
  Project,
  StudyLog,
  Task,
  WeeklyReview,
  WrongAnswer,
} from '../types';
import { DEFAULT_EVENT_CHECKLIST, DEFAULT_WEEKLY_SCOREBOARD, REFERENCE_DATE } from '../types';
import { engineByCategory } from '../constants/options';
import { getMondayOfWeek } from './dateHelpers';

export function emptyProject(): Project {
  return {
    id: '',
    projectName: '',
    category: 'Revenue',
    engine: engineByCategory.Revenue,
    status: 'Building',
    priority: 'Medium',
    mainGoal: '',
    targetAudience: '',
    mainFeeling: '',
    mainMotive: '',
    currentPhase: '',
    owner: 'You',
    startDate: new Date().toISOString().slice(0, 10),
    nextMilestone: '',
    milestoneDeadline: '',
    revenuePotential: 'Medium',
    timeDemand: 'Medium',
    progress: 0,
    notes: '',
  };
}

export function emptyTask(projectId = ''): Task {
  const now = new Date().toISOString();
  return {
    id: '',
    title: '',
    projectId,
    module: '',
    area: 'Admin',
    priority: 'P2',
    status: 'Not Started',
    deadline: '',
    owner: 'You',
    dependency: '',
    successMetric: '',
    progressPercentage: 0,
    timeNeeded: '1 hour',
    energyLevel: 'Medium',
    impact: 'Medium',
    track: '',
    metricKey: '',
    metricMode: 'set',
    metricValue: 0,
    today: false,
    thisWeek: false,
    notes: '',
    createdAt: now,
    updatedAt: now,
    completedAt: '',
  };
}

export function emptyAppSettings(): AppSettings {
  return {
    useLiveClock: false,
    pacingDate: REFERENCE_DATE,
  };
}

export function emptyAdvisorExecution(): AdvisorExecutionState {
  return {
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
    recruitment: {
      candidates: [],
      agentsOnboarded: 0,
      agentsTarget: 4,
    },
  };
}

export function emptyContact(projectId = ''): Contact {
  return {
    id: '',
    name: '',
    organization: '',
    contactType: 'Business Lead',
    relatedProjectId: projectId,
    role: '',
    phone: '',
    email: '',
    source: 'Referral',
    relationshipStrength: 'Cold',
    stage: 'New',
    lastContactDate: '',
    nextFollowUpDate: '',
    potentialValue: 'Medium',
    notes: '',
  };
}

export function emptyContent(projectId = ''): ContentItem {
  return {
    id: '',
    contentTitle: '',
    projectId,
    platform: 'YouTube',
    contentType: 'Short Video',
    contentPillar: 'Market News',
    status: 'Idea',
    publishDate: '',
    mainMessage: '',
    callToAction: '',
    assetLink: '',
    performanceNotes: '',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    leadsGenerated: 0,
  };
}

export function emptyEvent(projectId = ''): Event {
  return {
    id: '',
    eventName: '',
    projectId,
    eventType: 'Charity',
    date: '',
    venueOrLink: '',
    status: 'Idea',
    targetAttendees: 0,
    actualAttendees: 0,
    budget: 0,
    revenueOrDonations: 0,
    sponsorsNeeded: 0,
    sponsorsConfirmed: 0,
    volunteersNeeded: 0,
    volunteersConfirmed: 0,
    mainGoal: '',
    notes: '',
    checklist: DEFAULT_EVENT_CHECKLIST,
  };
}

export function emptyFinance(projectId = ''): FinanceItem {
  return {
    id: '',
    item: '',
    projectId,
    type: 'Expense',
    category: 'Tools',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    paid: false,
    notes: '',
  };
}

export function emptyHksiExam(): HksiExam {
  return {
    id: '',
    paper: 'Paper 1',
    targetExamDate: '',
    status: 'Not Started',
    studyProgress: 0,
    mockScore: 0,
    weakTopics: '',
    notes: '',
  };
}

export function emptyStudyLog(): StudyLog {
  return {
    id: '',
    date: new Date().toISOString().slice(0, 10),
    paper: 'Paper 1',
    topic: '',
    studyTime: 0,
    questionsDone: 0,
    score: 0,
    mistakesNotes: '',
  };
}

export function emptyWrongAnswer(): WrongAnswer {
  return {
    id: '',
    questionOrTopic: '',
    paper: 'Paper 1',
    whyWrong: '',
    correctRule: '',
    reviewDate: '',
    mastered: false,
  };
}

export function emptyDailyEntry(date?: string): DailyEntry {
  const d = date ?? new Date().toISOString().slice(0, 10);
  return {
    id: `daily-${d}`,
    date: d,
    linkedTaskIds: [],
    dailyWorkLogNote: '',
    dailyTaskNotes: [],
    dailyTaskIntent: [],
    todayTop3Tasks: '',
    oneRevenueTask: '',
    oneAuthorityTask: '',
    oneRelationshipTask: '',
    oneStudyTask: '',
    oneAdminTask: '',
    peopleToFollowUp: '',
    contentToCreateOrPost: '',
    mustBeFinishedToday: '',
    canWait: '',
    endOfDayCompleted: '',
    endOfDayLearned: '',
    firstTaskTomorrow: '',
  };
}

export function emptyWeeklyReview(): WeeklyReview {
  return {
    id: '',
    weekStartDate: getMondayOfWeek(),
    whatWorked: '',
    whatDidNotWork: '',
    projectMostProgress: '',
    projectMostStress: '',
    opportunityToDoubleDown: '',
    stopDelegateDelay: '',
    top5ActionsNextWeek: '',
    scoreboard: { ...DEFAULT_WEEKLY_SCOREBOARD },
    nextWeekTaskIds: [],
    weeklyTaskNotes: [],
  };
}

export function emptyMonthlyReview(): MonthlyReview {
  return {
    id: '',
    month: new Date().toISOString().slice(0, 7),
    biggestWins: '',
    biggestProblems: '',
    revenueGenerated: '',
    followersGained: '',
    leadsGenerated: '',
    eventsHeld: '',
    sponsorsDonorsAdded: '',
    hksiStudyProgress: '',
    bestPerformingContent: '',
    mostValuableRelationshipBuilt: '',
    projectDeservesMoreFocus: '',
    projectShouldBeSimplified: '',
    nextMonthTop10Actions: '',
    nextMonthTaskIds: [],
    monthlyTaskNotes: [],
  };
}

export function emptyDigitalAsset(projectId = ''): DigitalAsset {
  return {
    id: '',
    assetName: '',
    projectId,
    assetType: 'Template',
    status: 'Draft',
    link: '',
    lastUpdated: new Date().toISOString().slice(0, 10),
    notes: '',
  };
}

export function emptyAiPrompt(projectId = ''): AiPrompt {
  return {
    id: '',
    promptName: '',
    projectId,
    useCase: 'Market Analysis',
    promptText: '',
    outputFormat: 'Bullet Points',
    qualityRating: 'Good',
    notes: '',
  };
}
