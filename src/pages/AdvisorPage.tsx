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
  const { data } = useAppData();
  const { description } = usePacingDate();
  const { draft, patchAdvisor } = useDebouncedAdvisor();
  const warnings = computeAppWarnings(data);

  return (
    <div>
      <Header
        title="Advisor Growth Center"
        subtitle={`PA · MDRT · Recruitment — ${description}`}
      />
      <PacingDateBanner />
      <WarningBanners warnings={warnings} />
      <div className="space-y-6">
        <PaTrackerPanel data={draft.pa} onChange={(pa) => patchAdvisor({ pa })} />
        <MdrtTrackerPanel data={draft.mdrt} onChange={(mdrt) => patchAdvisor({ mdrt })} />
        <RecruitmentTrackerPanel
          data={draft.recruitment}
          onChange={(recruitment) => patchAdvisor({ recruitment })}
        />
      </div>
    </div>
  );
}
