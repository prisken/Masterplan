import type { Project, ProjectCategory } from '../types';

export const categoryColors: Record<
  ProjectCategory,
  { accent: string; light: string; badge: string }
> = {
  Revenue: {
    accent: 'bg-revenue',
    light: 'bg-revenue-light',
    badge: 'bg-blue-100 text-blue-800',
  },
  Authority: {
    accent: 'bg-authority',
    light: 'bg-authority-light',
    badge: 'bg-purple-100 text-purple-800',
  },
  Community: {
    accent: 'bg-community',
    light: 'bg-community-light',
    badge: 'bg-pink-100 text-pink-800',
  },
  Credibility: {
    accent: 'bg-credibility',
    light: 'bg-credibility-light',
    badge: 'bg-green-100 text-green-800',
  },
  Impact: {
    accent: 'bg-impact',
    light: 'bg-impact-light',
    badge: 'bg-amber-100 text-amber-800',
  },
};

export function getProjectColors(project: Project) {
  return categoryColors[project.category];
}

export function getProjectById(projects: Project[], id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
