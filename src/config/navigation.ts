export interface NavItem {
  path: string;
  label: string;
  icon: string;
  enabled: boolean;
}

export const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '◉', enabled: true },
  { path: '/projects', label: 'Projects', icon: '▣', enabled: true },
  { path: '/tasks', label: 'Master Tasks', icon: '☑', enabled: true },
  { path: '/advisor', label: 'Advisor / PA·MDRT', icon: '◆', enabled: true },
  { path: '/contacts', label: 'Contacts', icon: '◎', enabled: true },
  { path: '/content', label: 'Content', icon: '▤', enabled: true },
  { path: '/events', label: 'Events', icon: '◈', enabled: true },
  { path: '/hksi', label: 'HKSI Study', icon: '◐', enabled: true },
  { path: '/finance', label: 'Finance', icon: '◫', enabled: true },
  { path: '/assets', label: 'Digital Assets', icon: '◇', enabled: true },
  { path: '/prompts', label: 'AI Prompts', icon: '✦', enabled: true },
  { path: '/ecosystem', label: 'Ecosystem', icon: '⬡', enabled: true },
  { path: '/today', label: 'Today', icon: '☀', enabled: true },
  { path: '/weekly', label: 'Weekly Review', icon: '▦', enabled: true },
  { path: '/monthly', label: 'Monthly Review', icon: '▧', enabled: true },
  { path: '/settings', label: 'Settings', icon: '⚙', enabled: true },
];
