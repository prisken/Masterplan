import type {
  ContactType,
  EnergyLevel,
  Impact,
  PotentialValue,
  ProjectCategory,
  ProjectPriority,
  ProjectStatus,
  RelationshipStrength,
  RevenuePotential,
  Source,
  Stage,
  TaskArea,
  TaskPriority,
  TaskStatus,
  TimeDemand,
  TimeNeeded,
} from '../types';

export const projectCategories: ProjectCategory[] = [
  'Revenue',
  'Authority',
  'Community',
  'Credibility',
  'Impact',
];

export const projectStatuses: ProjectStatus[] = [
  'Idea',
  'Building',
  'Active',
  'Paused',
  'Completed',
];

export const projectPriorities: ProjectPriority[] = ['High', 'Medium', 'Low'];
export const revenuePotentials: RevenuePotential[] = ['High', 'Medium', 'Low'];
export const timeDemands: TimeDemand[] = ['High', 'Medium', 'Low'];

export const engineByCategory: Record<ProjectCategory, string> = {
  Revenue: 'Revenue Engine',
  Authority: 'Authority Engine',
  Community: 'Community Engine',
  Credibility: 'Credibility Engine',
  Impact: 'Heart / Impact Engine',
};

export const taskAreas: TaskArea[] = [
  'Website',
  'Sales',
  'Content',
  'Study',
  'Event',
  'Admin',
  'Partnership',
  'Finance',
  'Insurance',
  'Recruitment',
  'Compliance',
];

export const taskPriorities: TaskPriority[] = ['P0', 'P1', 'P2', 'P3'];

export const taskTracks: { value: string; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'pa', label: 'PA' },
  { value: 'mdrt', label: 'MDRT' },
  { value: 'ifhc', label: 'iFHC' },
  { value: 'digital', label: 'Digital' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'hiring', label: 'Hiring' },
];
export const taskStatuses: TaskStatus[] = [
  'Not Started',
  'In Progress',
  'Waiting',
  'Completed',
  'Overdue',
  'Deferred',
];

export const recruitmentStages = [
  'Identified',
  'Contacted',
  'Vision Meeting Booked',
  'Vision Meeting Completed',
  'Interested',
  'Licensing Study Started',
  'Exam Ready',
  'Exam Passed',
  'Contracting / Appointment',
  'Onboarded',
  'Active Agent',
] as const;

export const mdrtRoutes = [
  { value: 'commission', label: 'Commission (HKD 512,800)' },
  { value: 'fyp', label: 'FYP (HKD 2,051,200)' },
  { value: 'income', label: 'Income (HKD 888,100)' },
] as const;
export const timeNeededOptions: TimeNeeded[] = [
  '15 min',
  '30 min',
  '1 hour',
  '2 hours',
  'Half day',
  'Full day',
];
export const energyLevels: EnergyLevel[] = ['Low', 'Medium', 'High'];
export const impactLevels: Impact[] = ['High', 'Medium', 'Low'];

export const contactTypes: ContactType[] = [
  'Business Lead',
  'Sponsor',
  'Donor',
  'Volunteer',
  'Parent',
  'Media',
  'Partner',
];

export const sources: Source[] = [
  'Referral',
  'LinkedIn',
  'Facebook',
  'Event',
  'Cold Outreach',
  'Friend',
  'Website',
];

export const relationshipStrengths: RelationshipStrength[] = [
  'Cold',
  'Warm',
  'Hot',
  'Existing',
];

export const stages: Stage[] = [
  'New',
  'Contacted',
  'Replied',
  'Meeting Booked',
  'Proposal Sent',
  'Won',
  'Lost',
  'Nurture',
];

export const potentialValues: PotentialValue[] = ['High', 'Medium', 'Low'];
