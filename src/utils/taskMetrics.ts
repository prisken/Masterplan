import { getMetricDefinition } from '../constants/taskMetricKeys';
import type {
  AdvisorExecutionState,
  AppData,
  Task,
  TaskMetricKey,
  TaskMetricMode,
} from '../types';
import { getTaskTitle } from './taskTitle';
import { getEffectiveTaskStatus, isTaskCompleted } from './taskStatus';

export interface InferredTaskMetric {
  metricKey: TaskMetricKey;
  metricMode: TaskMetricMode;
  metricValue: number;
}

export interface MetricSyncResult {
  advisor: AdvisorExecutionState;
  taskPatch?: Partial<Task>;
  message?: string;
}

function parseHkdAmount(text: string): number | null {
  const m = text.match(/HKD\s*([\d,]+)/i) ?? text.match(/([\d,]+)\s*(?:cumulative\s+)?commission/i);
  if (!m) return null;
  return Number(m[1].replace(/,/g, '')) || null;
}

/** Infer metric linkage from common Advisor Growth task titles. */
export function inferTaskMetric(title: string): InferredTaskMetric | null {
  const t = title.trim();
  let m: RegExpMatchArray | null;

  m = t.match(/Reach (\d+) distinct insured/i);
  if (m) return { metricKey: 'pa.distinctInsured', metricMode: 'set', metricValue: Number(m[1]) };

  m = t.match(/Reach (\d+) new insured/i);
  if (m) return { metricKey: 'pa.newInsured', metricMode: 'set', metricValue: Number(m[1]) };

  m = t.match(/Reach (\d+) Vitality/i);
  if (m) return { metricKey: 'pa.vitalityCustomers', metricMode: 'set', metricValue: Number(m[1]) };

  m = t.match(/Complete (\d+) iFHC reports?/i);
  if (m) return { metricKey: 'pa.ifhcReports', metricMode: 'set', metricValue: Number(m[1]) };

  const hkd = parseHkdAmount(t);
  if (hkd != null && /commission/i.test(t)) {
    return { metricKey: 'mdrt.commission', metricMode: 'set', metricValue: hkd };
  }
  if (hkd != null && /\bFYP\b/i.test(t)) {
    return { metricKey: 'mdrt.fyp', metricMode: 'set', metricValue: hkd };
  }

  m = t.match(/First (\d+) agents onboarded/i);
  if (m) return { metricKey: 'recruitment.agentsOnboarded', metricMode: 'set', metricValue: Number(m[1]) };

  m = t.match(/(\d+) new agents/i);
  if (m) return { metricKey: 'recruitment.agentsOnboarded', metricMode: 'set', metricValue: Number(m[1]) };

  if (/Get first savings case approved/i.test(t)) {
    return { metricKey: 'pa.productCategory.savings', metricMode: 'set', metricValue: 1 };
  }
  if (/Get first protection case approved/i.test(t)) {
    return { metricKey: 'pa.productCategory.protection', metricMode: 'set', metricValue: 1 };
  }
  if (/Get first third-category case approved/i.test(t)) {
    return { metricKey: 'pa.productCategory.thirdCategory', metricMode: 'set', metricValue: 1 };
  }

  return null;
}

function readNumericField(advisor: AdvisorExecutionState, key: TaskMetricKey): number {
  switch (key) {
    case 'pa.distinctInsured':
      return advisor.pa.distinctInsured;
    case 'pa.newInsured':
      return advisor.pa.newInsured;
    case 'pa.vitalityCustomers':
      return advisor.pa.vitalityCustomers;
    case 'pa.ifhcReports':
      return advisor.pa.ifhcReports;
    case 'pa.digitalActivities':
      return advisor.pa.digitalActivities;
    case 'mdrt.commission':
      return advisor.mdrt.currentCommission;
    case 'mdrt.fyp':
      return advisor.mdrt.currentFyp;
    case 'mdrt.income':
      return advisor.mdrt.currentIncome;
    case 'mdrt.firstYearCommission':
      return advisor.mdrt.currentFirstYearCommission;
    case 'recruitment.agentsOnboarded':
      return advisor.recruitment.agentsOnboarded;
    default:
      return 0;
  }
}

function isBooleanCategoryKey(key: TaskMetricKey): boolean {
  return key.startsWith('pa.productCategory.');
}

function applyToAdvisor(
  advisor: AdvisorExecutionState,
  key: TaskMetricKey,
  mode: TaskMetricMode,
  value: number
): AdvisorExecutionState {
  const next = structuredClone(advisor);
  const delta = value > 0 ? value : 1;

  const setCount = (field: keyof typeof next.pa, v: number) => {
    const current = next.pa[field] as number;
    (next.pa[field] as number) = mode === 'set' ? Math.max(current, v) : current + delta;
  };

  switch (key) {
    case 'pa.distinctInsured':
      setCount('distinctInsured', value);
      break;
    case 'pa.newInsured':
      setCount('newInsured', value);
      break;
    case 'pa.vitalityCustomers':
      setCount('vitalityCustomers', value);
      break;
    case 'pa.ifhcReports':
      setCount('ifhcReports', value);
      break;
    case 'pa.digitalActivities':
      setCount('digitalActivities', value);
      break;
    case 'pa.productCategory.savings':
      next.pa.productCategories.savings = true;
      break;
    case 'pa.productCategory.protection':
      next.pa.productCategories.protection = true;
      break;
    case 'pa.productCategory.thirdCategory':
      next.pa.productCategories.thirdCategory = true;
      break;
    case 'mdrt.commission':
      next.mdrt.currentCommission =
        mode === 'set'
          ? Math.max(next.mdrt.currentCommission, value)
          : next.mdrt.currentCommission + delta;
      break;
    case 'mdrt.fyp':
      next.mdrt.currentFyp =
        mode === 'set' ? Math.max(next.mdrt.currentFyp, value) : next.mdrt.currentFyp + delta;
      break;
    case 'mdrt.income':
      next.mdrt.currentIncome =
        mode === 'set' ? Math.max(next.mdrt.currentIncome, value) : next.mdrt.currentIncome + delta;
      break;
    case 'mdrt.firstYearCommission':
      next.mdrt.currentFirstYearCommission =
        mode === 'set'
          ? Math.max(next.mdrt.currentFirstYearCommission, value)
          : next.mdrt.currentFirstYearCommission + delta;
      break;
    case 'recruitment.agentsOnboarded':
      next.recruitment.agentsOnboarded =
        mode === 'set'
          ? Math.max(next.recruitment.agentsOnboarded, value)
          : next.recruitment.agentsOnboarded + delta;
      break;
    default:
      break;
  }
  return next;
}

function revertAdvisor(
  advisor: AdvisorExecutionState,
  key: TaskMetricKey,
  mode: TaskMetricMode,
  value: number,
  snapshot?: number
): AdvisorExecutionState {
  const next = structuredClone(advisor);
  const delta = value > 0 ? value : 1;

  const restoreCount = (field: keyof typeof next.pa) => {
    if (mode === 'set' && snapshot !== undefined) {
      (next.pa[field] as number) = snapshot;
    } else if (mode === 'increment') {
      (next.pa[field] as number) = Math.max(0, (next.pa[field] as number) - delta);
    }
  };

  switch (key) {
    case 'pa.distinctInsured':
      restoreCount('distinctInsured');
      break;
    case 'pa.newInsured':
      restoreCount('newInsured');
      break;
    case 'pa.vitalityCustomers':
      restoreCount('vitalityCustomers');
      break;
    case 'pa.ifhcReports':
      restoreCount('ifhcReports');
      break;
    case 'pa.digitalActivities':
      restoreCount('digitalActivities');
      break;
    case 'pa.productCategory.savings':
      if (snapshot !== undefined) next.pa.productCategories.savings = snapshot > 0;
      break;
    case 'pa.productCategory.protection':
      if (snapshot !== undefined) next.pa.productCategories.protection = snapshot > 0;
      break;
    case 'pa.productCategory.thirdCategory':
      if (snapshot !== undefined) next.pa.productCategories.thirdCategory = snapshot > 0;
      break;
    case 'mdrt.commission':
      if (mode === 'set' && snapshot !== undefined) next.mdrt.currentCommission = snapshot;
      else if (mode === 'increment')
        next.mdrt.currentCommission = Math.max(0, next.mdrt.currentCommission - delta);
      break;
    case 'mdrt.fyp':
      if (mode === 'set' && snapshot !== undefined) next.mdrt.currentFyp = snapshot;
      else if (mode === 'increment') next.mdrt.currentFyp = Math.max(0, next.mdrt.currentFyp - delta);
      break;
    case 'mdrt.income':
      if (mode === 'set' && snapshot !== undefined) next.mdrt.currentIncome = snapshot;
      else if (mode === 'increment')
        next.mdrt.currentIncome = Math.max(0, next.mdrt.currentIncome - delta);
      break;
    case 'mdrt.firstYearCommission':
      if (mode === 'set' && snapshot !== undefined) next.mdrt.currentFirstYearCommission = snapshot;
      else if (mode === 'increment')
        next.mdrt.currentFirstYearCommission = Math.max(
          0,
          next.mdrt.currentFirstYearCommission - delta
        );
      break;
    case 'recruitment.agentsOnboarded':
      if (mode === 'set' && snapshot !== undefined) next.recruitment.agentsOnboarded = snapshot;
      else if (mode === 'increment')
        next.recruitment.agentsOnboarded = Math.max(0, next.recruitment.agentsOnboarded - delta);
      break;
    default:
      break;
  }
  return next;
}

function snapshotForKey(advisor: AdvisorExecutionState, key: TaskMetricKey): number {
  if (isBooleanCategoryKey(key)) {
    const cat = key.split('.').pop() as keyof typeof advisor.pa.productCategories;
    return advisor.pa.productCategories[cat] ? 1 : 0;
  }
  return readNumericField(advisor, key);
}

function formatMetricMessage(key: TaskMetricKey, mode: TaskMetricMode, value: number, applied: boolean): string {
  const def = getMetricDefinition(key);
  const label = def?.label ?? key;
  const action = applied ? 'Updated' : 'Reverted';
  if (isBooleanCategoryKey(key)) {
    return `${action} tracker: ${label}`;
  }
  const val = mode === 'increment' && applied ? `+${value || 1}` : String(value);
  return `${action} tracker: ${label} → ${val}`;
}

export function syncAdvisorMetricsOnTaskChange(
  advisor: AdvisorExecutionState,
  before: Task,
  after: Task
): MetricSyncResult {
  if (!after.metricKey) return { advisor };

  const wasDone = isTaskCompleted(getEffectiveTaskStatus(before));
  const isDone = isTaskCompleted(getEffectiveTaskStatus(after));
  if (wasDone === isDone) return { advisor };

  const { metricKey, metricMode, metricValue } = after;

  if (isDone) {
    const snapshot = snapshotForKey(advisor, metricKey);
    const updated = applyToAdvisor(advisor, metricKey, metricMode, metricValue);
    return {
      advisor: updated,
      taskPatch: { metricSnapshot: snapshot },
      message: formatMetricMessage(metricKey, metricMode, metricValue, true),
    };
  }

  if (metricMode === 'set' && after.metricSnapshot === undefined) {
    return {
      advisor,
      message: 'Task reopened — tracker unchanged (no snapshot for milestone metric).',
    };
  }

  const reverted = revertAdvisor(
    advisor,
    metricKey,
    metricMode,
    metricValue,
    after.metricSnapshot
  );
  return {
    advisor: reverted,
    taskPatch: { metricSnapshot: undefined },
    message: formatMetricMessage(metricKey, metricMode, metricValue, false),
  };
}

/** Apply task patch and sync advisor metrics when completion status changes. */
export function applyTaskUpdateWithMetrics(
  data: AppData,
  taskId: string,
  patch: Partial<Task>
): { data: AppData; metricMessage?: string } {
  const before = data.tasks.find((t) => t.id === taskId);
  if (!before) return { data };

  const after: Task = { ...before, ...patch };
  const tasks = data.tasks.map((t) => (t.id === taskId ? after : t));
  let advisor = data.advisor;
  let metricMessage: string | undefined;
  let finalTask = after;

  const sync = syncAdvisorMetricsOnTaskChange(advisor, before, after);
  advisor = sync.advisor;
  metricMessage = sync.message;
  if (sync.taskPatch) {
    finalTask = { ...after, ...sync.taskPatch };
  }

  return {
    data: {
      ...data,
      advisor,
      tasks: tasks.map((t) => (t.id === taskId ? finalTask : t)),
    },
    metricMessage,
  };
}

export function saveTaskWithMetrics(
  data: AppData,
  task: Task,
  isNew: boolean
): { data: AppData; metricMessage?: string } {
  if (isNew) {
    const before: Task = {
      ...task,
      status: 'Not Started',
      completedAt: '',
      progressPercentage: 0,
      metricSnapshot: undefined,
    };
    const sync = syncAdvisorMetricsOnTaskChange(data.advisor, before, task);
    const finalTask = sync.taskPatch ? { ...task, ...sync.taskPatch } : task;
    return {
      data: {
        ...data,
        advisor: sync.advisor,
        tasks: [...data.tasks, finalTask],
      },
      metricMessage: sync.message,
    };
  }

  const exists = data.tasks.some((t) => t.id === task.id);
  if (!exists) {
    return { data: { ...data, tasks: [...data.tasks, task] } };
  }

  const { id, ...patch } = task;
  return applyTaskUpdateWithMetrics(data, id, patch);
}

export function resolveTaskMetricFields(task: Task): Task {
  if (task.metricKey) return task;
  const title = getTaskTitle(task);
  const inferred = inferTaskMetric(title);
  if (!inferred) return task;
  return {
    ...task,
    metricKey: inferred.metricKey,
    metricMode: inferred.metricMode,
    metricValue: inferred.metricValue,
  };
}
