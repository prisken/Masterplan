import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { PacingDateBanner } from '../components/layout/PacingDateBanner';
import { usePacingDate } from '../hooks/usePacingDate';
import { PaTrackerPanel } from '../components/advisor/PaTrackerPanel';
import { MdrtTrackerPanel } from '../components/advisor/MdrtTrackerPanel';
import { RecruitmentTrackerPanel } from '../components/advisor/RecruitmentTrackerPanel';
import { WarningBanners } from '../components/dashboard/WarningBanners';
import { useAppData } from '../context/AppDataContext';
import { useDebouncedAdvisor } from '../hooks/useDebouncedAdvisor';
import { computeAppWarnings } from '../utils/advisorWarnings';

export function AdvisorPage() {
  const location = useLocation();
  const paSectionRef = useRef<HTMLDivElement>(null);
  const mdrtSectionRef = useRef<HTMLDivElement>(null);
  const { data } = useAppData();
  const { description } = usePacingDate();
  const { draft, patchAdvisor } = useDebouncedAdvisor();
  const warnings = computeAppWarnings(data);

  useEffect(() => {
    if (location.pathname === '/pa') {
      paSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (location.pathname === '/mdrt') {
      mdrtSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.pathname]);

  return (
    <div>
      <Header
        title="Advisor Growth Center"
        subtitle={`PA · MDRT · Recruitment — ${description}`}
      />
      <PacingDateBanner />
      <WarningBanners warnings={warnings} />
      <div className="space-y-6">
        <div ref={paSectionRef}>
          <PaTrackerPanel data={draft.pa} onChange={(pa) => patchAdvisor({ pa })} />
        </div>
        <div ref={mdrtSectionRef}>
          <MdrtTrackerPanel data={draft.mdrt} onChange={(mdrt) => patchAdvisor({ mdrt })} />
        </div>
        <RecruitmentTrackerPanel
          data={draft.recruitment}
          onChange={(recruitment) => patchAdvisor({ recruitment })}
        />
      </div>
    </div>
  );
}
