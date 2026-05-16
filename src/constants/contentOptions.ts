import type {
  ContentPillar,
  ContentStatus,
  ContentType,
  EventStatus,
  EventType,
  FinanceCategory,
  FinanceType,
  Platform,
} from '../types';

export const platforms: Platform[] = [
  'YouTube',
  'TikTok',
  'Instagram',
  'Facebook',
  'LinkedIn',
  'Website',
  'Newsletter',
];

export const contentTypes: ContentType[] = [
  'Short Video',
  'Long Video',
  'Post',
  'Article',
  'Song',
  'Story',
  'Email',
  'Reel',
];

export const contentPillars: ContentPillar[] = [
  'Market News',
  'Sales Tips',
  'Parenting',
  'Charity Story',
  'Study Journey',
  'Event Promo',
];

export const contentStatuses: ContentStatus[] = [
  'Idea',
  'Scripted',
  'Filmed',
  'Edited',
  'Scheduled',
  'Published',
];

export const eventTypes: EventType[] = [
  'Charity',
  'Parent Gathering',
  'Business Seminar',
  'Investment Livestream',
  'Networking',
];

export const eventStatuses: EventStatus[] = [
  'Idea',
  'Planning',
  'Confirmed',
  'Promoting',
  'Completed',
  'Cancelled',
];

export const financeTypes: FinanceType[] = [
  'Income',
  'Expense',
  'Donation',
  'Sponsorship',
  'Investment',
];

export const financeCategories: FinanceCategory[] = [
  'Website',
  'Ads',
  'Event',
  'Tools',
  'Production',
  'Study',
  'Staff',
  'Donation',
];
