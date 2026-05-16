/** Business modules for Advisor Growth Center and task filtering */
export const ADVISOR_MODULES = [
  'Advisor Growth Center',
  'PA',
  'MDRT',
  'Prospecting',
  'Digital Activity / iFHC',
  'Source-Specific Funnels',
  'Team Building',
  'Recruitment',
  'Team System Setup',
  'Compliance',
  'PA/MDRT System Build',
  'Prospecting & Client Acquisition',
  'PA Policy Requirements',
  'MDRT Production',
  'Team Building & Hiring',
] as const;

export type AdvisorModule = (typeof ADVISOR_MODULES)[number];
