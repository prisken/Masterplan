import type { AssetStatus, AssetType, OutputFormat, PromptUseCase, QualityRating } from '../types';

export const assetTypes: AssetType[] = [
  'Logo',
  'Photo',
  'Video',
  'Script',
  'Deck',
  'Form',
  'Website Copy',
  'Song',
  'Contract',
  'Template',
];

export const assetStatuses: AssetStatus[] = ['Draft', 'Approved', 'Published', 'Archived'];

export const promptUseCases: PromptUseCase[] = [
  'Market Analysis',
  'Sales Script',
  'Video Script',
  'Event Planning',
  'Email',
  'Songwriting',
  'Study',
];

export const outputFormats: OutputFormat[] = [
  'Bullet Points',
  'Script',
  'Table',
  'Email',
  'Checklist',
];

export const qualityRatings: QualityRating[] = ['Excellent', 'Good', 'Needs Work'];
