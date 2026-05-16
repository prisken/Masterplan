interface PageActionsProps {
  onAdd: () => void;
  addLabel: string;
}

export function PageActions({ onAdd, addLabel }: PageActionsProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
    >
      + {addLabel}
    </button>
  );
}
