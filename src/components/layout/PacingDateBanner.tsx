import { Link } from 'react-router-dom';
import { usePacingDate } from '../../hooks/usePacingDate';

export function PacingDateBanner() {
  const { settings, description } = usePacingDate();

  if (settings.useLiveClock) {
    return (
      <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-900">
        <strong>Live clock:</strong> Today, overdue, calendar, and advisor pacing use your
        device date ({description.replace('Live clock (', '').replace(')', '')}).
      </p>
    );
  }

  return (
    <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <strong>Fixed pacing date:</strong> Timelines and advisor warnings use{' '}
      <strong>{settings.pacingDate}</strong>, not your device clock.{' '}
      <Link to="/settings" className="font-medium underline">
        Switch to live clock in Settings
      </Link>
    </p>
  );
}
