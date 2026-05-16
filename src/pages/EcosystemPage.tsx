import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import type { ProjectCategory } from '../types';
import { cn } from '../utils/cn';
import { categoryColors } from '../utils/projectColors';

const engines: {
  id: string;
  name: string;
  category: ProjectCategory;
  engine: string;
  role: string;
}[] = [
  {
    id: 'profit-pulse-ally',
    name: 'Profit Pulse Ally',
    category: 'Revenue',
    engine: 'Revenue Engine',
    role: 'Brings business clients and potential sponsors through sales services.',
  },
  {
    id: 'investment-news-channel',
    name: 'Investment News Channel',
    category: 'Authority',
    engine: 'Authority Engine',
    role: 'Builds market authority, followers, and trust through content.',
  },
  {
    id: 'hksi-papers',
    name: 'HKSI Paper 1, 7, 8',
    category: 'Credibility',
    engine: 'Credibility Engine',
    role: 'Strengthens professional credibility for finance-related content.',
  },
  {
    id: 'mama-supreme',
    name: 'Mama Supreme',
    category: 'Community',
    engine: 'Community Engine',
    role: 'Builds family and parent community trust and connection.',
  },
  {
    id: 'eternal-moments',
    name: 'Eternal Moments',
    category: 'Impact',
    engine: 'Heart / Impact Engine',
    role: 'Builds emotional trust, media stories, and public recognition.',
  },
];

const flows = [
  'Profit Pulse Ally → funds content production and charity events',
  'Investment News Channel → builds authority that supports business and trust',
  'HKSI licensing → strengthens credibility for investment content',
  'Mama Supreme → builds community trust and parent network',
  'Eternal Moments → creates emotional stories that attract sponsors and media',
];

export function EcosystemPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Header
        title="Ecosystem Map"
        subtitle="How your five portfolio engines support each other"
      />

      <Card className="mb-8 border-dashed bg-slate-50/80">
        <h2 className="text-sm font-semibold text-slate-800">Main strategy</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
          <li>Use revenue from business services to support content and charity.</li>
          <li>Use content to build authority.</li>
          <li>Use charity and community to build trust.</li>
          <li>Use licensing to strengthen professional credibility.</li>
        </ul>
      </Card>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {engines.map((e) => {
          const colors = categoryColors[e.category];
          return (
            <Card key={e.id} className="relative overflow-hidden">
              <div className={cn('absolute left-0 top-0 h-1 w-full', colors.accent)} />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {e.engine}
              </p>
              <h3 className="mt-1 font-semibold text-slate-900">{e.name}</h3>
              <span
                className={cn(
                  'mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                  colors.badge
                )}
              >
                {e.category}
              </span>
              <p className="mt-3 text-sm text-slate-600">{e.role}</p>
            </Card>
          );
        })}
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          How they connect
        </h2>
        <ul className="space-y-3">
          {flows.map((flow) => (
            <li
              key={flow}
              className="flex items-start gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-700"
            >
              <span className="mt-0.5 text-slate-400">→</span>
              {flow}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-8">
        <h2 className="text-sm font-semibold text-slate-800">Flywheel</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Revenue from <strong>Profit Pulse Ally</strong> fuels production for{' '}
          <strong>Investment News Channel</strong> and events for{' '}
          <strong>Eternal Moments</strong> and <strong>Mama Supreme</strong>. Authority and
          credibility from content and <strong>HKSI</strong> make sales and sponsorship
          conversations easier. Community and charity work create stories that content and
          sponsors amplify.
        </p>
      </Card>
    </div>
  );
}
