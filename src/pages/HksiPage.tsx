import { useMemo, useState } from 'react';
import { examStatuses, hksiPapers } from '../constants/hksiOptions';
import { Header } from '../components/layout/Header';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar, FilterSelect, ViewTabs } from '../components/ui/FilterBar';
import { FormField, inputClass, selectClass, textareaClass } from '../components/ui/FormField';
import { ModalFooter, ModalForm } from '../components/ui/ModalForm';
import { PageActions } from '../components/ui/PageActions';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/ui/StatCard';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { HksiExam, StudyLog, WrongAnswer } from '../types';
import { emptyHksiExam, emptyStudyLog, emptyWrongAnswer } from '../utils/defaults';
import { generateId } from '../utils/id';

const tabs = [
  { id: 'exams', label: 'Exam tracker' },
  { id: 'logs', label: 'Study log' },
  { id: 'wrong', label: 'Wrong answers' },
];

export function HksiPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();
  const [tab, setTab] = useState('exams');
  const [paperFilter, setPaperFilter] = useState('');

  const [examModal, setExamModal] = useState(false);
  const [examForm, setExamForm] = useState<HksiExam>(emptyHksiExam());
  const [deleteExam, setDeleteExam] = useState<HksiExam | null>(null);

  const [logModal, setLogModal] = useState(false);
  const [logForm, setLogForm] = useState<StudyLog>(emptyStudyLog());
  const [deleteLog, setDeleteLog] = useState<StudyLog | null>(null);

  const [wrongModal, setWrongModal] = useState(false);
  const [wrongForm, setWrongForm] = useState<WrongAnswer>(emptyWrongAnswer());
  const [deleteWrong, setDeleteWrong] = useState<WrongAnswer | null>(null);

  const summary = useMemo(() => {
    const avgProgress =
      data.hksiExams.length > 0
        ? Math.round(
            data.hksiExams.reduce((s, e) => s + e.studyProgress, 0) / data.hksiExams.length
          )
        : 0;
    const totalHours = data.studyLogs.reduce((s, l) => s + (l.studyTime || 0), 0);
    const totalQuestions = data.studyLogs.reduce((s, l) => s + (l.questionsDone || 0), 0);
    const wrongToReview = data.wrongAnswers.filter((w) => !w.mastered).length;
    return { avgProgress, totalHours, totalQuestions, wrongToReview };
  }, [data.hksiExams, data.studyLogs, data.wrongAnswers]);

  const filteredLogs = useMemo(
    () =>
      [...data.studyLogs]
        .filter((l) => !paperFilter || l.paper === paperFilter)
        .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [data.studyLogs, paperFilter]
  );

  const filteredWrong = useMemo(
    () =>
      [...data.wrongAnswers]
        .filter((w) => !paperFilter || w.paper === paperFilter)
        .sort((a, b) => (a.mastered === b.mastered ? 0 : a.mastered ? 1 : -1)),
    [data.wrongAnswers, paperFilter]
  );

  const saveExam = () => {
    if (!examForm.paper) {
      toast('Paper is required', 'error');
      return;
    }
    updateData((prev) => {
      const exists = prev.hksiExams.some((e) => e.id === examForm.id);
      const hksiExams = exists
        ? prev.hksiExams.map((e) => (e.id === examForm.id ? examForm : e))
        : [...prev.hksiExams, { ...examForm, id: examForm.id || generateId('exam') }];
      return { ...prev, hksiExams };
    });
    toast('Exam saved');
    setExamModal(false);
  };

  const saveLog = () => {
    updateData((prev) => {
      const exists = prev.studyLogs.some((l) => l.id === logForm.id);
      const studyLogs = exists
        ? prev.studyLogs.map((l) => (l.id === logForm.id ? logForm : l))
        : [...prev.studyLogs, { ...logForm, id: logForm.id || generateId('log') }];
      return { ...prev, studyLogs };
    });
    toast('Study log saved');
    setLogModal(false);
  };

  const saveWrong = () => {
    if (!wrongForm.questionOrTopic.trim()) {
      toast('Question or topic required', 'error');
      return;
    }
    updateData((prev) => {
      const exists = prev.wrongAnswers.some((w) => w.id === wrongForm.id);
      const wrongAnswers = exists
        ? prev.wrongAnswers.map((w) => (w.id === wrongForm.id ? wrongForm : w))
        : [...prev.wrongAnswers, { ...wrongForm, id: wrongForm.id || generateId('wrong') }];
      return { ...prev, wrongAnswers };
    });
    toast('Wrong answer saved');
    setWrongModal(false);
  };

  const openAdd = () => {
    if (tab === 'exams') {
      setExamForm({ ...emptyHksiExam(), id: generateId('exam') });
      setExamModal(true);
    } else if (tab === 'logs') {
      setLogForm({ ...emptyStudyLog(), id: generateId('log') });
      setLogModal(true);
    } else {
      setWrongForm({ ...emptyWrongAnswer(), id: generateId('wrong') });
      setWrongModal(true);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header
          title="HKSI Study Dashboard"
          subtitle="Track Papers 1–9 — exams, study logs, and wrong answers"
        />
        <PageActions
          onAdd={openAdd}
          addLabel={tab === 'exams' ? 'Add paper' : tab === 'logs' ? 'Add log' : 'Add wrong answer'}
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Avg progress" value={`${summary.avgProgress}%`} icon="◐" accent="bg-green-100 text-green-700" />
        <StatCard label="Study hours" value={summary.totalHours} icon="⏱" accent="bg-slate-100 text-slate-700" />
        <StatCard label="Questions done" value={summary.totalQuestions} icon="?" accent="bg-blue-100 text-blue-700" />
        <StatCard label="To review" value={summary.wrongToReview} icon="!" accent="bg-amber-100 text-amber-700" />
      </div>

      <Card className="mb-4 space-y-4">
        <ViewTabs tabs={tabs} active={tab} onChange={setTab} />
        {tab !== 'exams' && (
          <FilterBar>
            <FilterSelect
              label="Paper"
              value={paperFilter}
              onChange={setPaperFilter}
              options={hksiPapers.map((p) => ({ value: p, label: p }))}
            />
          </FilterBar>
        )}
      </Card>

      {tab === 'exams' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.hksiExams.map((exam) => (
            <Card key={exam.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{exam.paper}</h3>
                <Badge variant="neutral">{exam.status}</Badge>
              </div>
              <ProgressBar value={exam.studyProgress} accentClass="bg-credibility" size="sm" />
              <p className="text-xs text-slate-500">
                Target exam: {exam.targetExamDate || 'Not set'} · Mock: {exam.mockScore}%
              </p>
              {exam.weakTopics && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Weak:</span> {exam.weakTopics}
                </p>
              )}
              <div className="flex gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setExamForm({ ...exam });
                    setExamModal(true);
                  }}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteExam(exam)}
                  className="text-xs font-medium text-red-600"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'logs' &&
        (filteredLogs.length === 0 ? (
          <EmptyState title="No study logs" description="Log your daily study sessions." />
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <Card key={log.id} padding="sm" className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {log.date} · {log.paper}
                  </p>
                  <p className="text-sm text-slate-600">{log.topic || 'No topic'}</p>
                  <p className="text-xs text-slate-500">
                    {log.studyTime}h · {log.questionsDone} questions · Score {log.score}%
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setLogForm({ ...log }); setLogModal(true); }} className="text-xs font-medium text-slate-600">Edit</button>
                  <button type="button" onClick={() => setDeleteLog(log)} className="text-xs font-medium text-red-600">Delete</button>
                </div>
              </Card>
            ))}
          </div>
        ))}

      {tab === 'wrong' &&
        (filteredWrong.length === 0 ? (
          <EmptyState title="No wrong answers" description="Build your review bank from practice mistakes." />
        ) : (
          <div className="space-y-2">
            {filteredWrong.map((w) => (
              <Card key={w.id} padding="sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{w.questionOrTopic}</p>
                    <p className="text-xs text-slate-500">{w.paper}</p>
                  </div>
                  <Badge variant={w.mastered ? 'success' : 'warning'}>
                    {w.mastered ? 'Mastered' : 'Review'}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{w.correctRule}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => { setWrongForm({ ...w }); setWrongModal(true); }} className="text-xs font-medium text-slate-600">Edit</button>
                  <button type="button" onClick={() => setDeleteWrong(w)} className="text-xs font-medium text-red-600">Delete</button>
                </div>
              </Card>
            ))}
          </div>
        ))}

      <ModalForm open={examModal} title="Exam tracker" onClose={() => setExamModal(false)} footer={<ModalFooter onCancel={() => setExamModal(false)} onSave={saveExam} />}>
        <div className="space-y-4">
          <FormField label="Paper">
            <select className={selectClass} value={examForm.paper} onChange={(e) => setExamForm({ ...examForm, paper: e.target.value })}>
              {hksiPapers.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </FormField>
          <FormField label="Status">
            <select className={selectClass} value={examForm.status} onChange={(e) => setExamForm({ ...examForm, status: e.target.value as HksiExam['status'] })}>
              {examStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </FormField>
          <FormField label="Target exam date"><input type="date" className={inputClass} value={examForm.targetExamDate} onChange={(e) => setExamForm({ ...examForm, targetExamDate: e.target.value })} /></FormField>
          <FormField label="Study progress %"><input type="number" min={0} max={100} className={inputClass} value={examForm.studyProgress} onChange={(e) => setExamForm({ ...examForm, studyProgress: Number(e.target.value) })} /></FormField>
          <FormField label="Mock score %"><input type="number" min={0} max={100} className={inputClass} value={examForm.mockScore} onChange={(e) => setExamForm({ ...examForm, mockScore: Number(e.target.value) })} /></FormField>
          <FormField label="Weak topics"><textarea className={textareaClass} value={examForm.weakTopics} onChange={(e) => setExamForm({ ...examForm, weakTopics: e.target.value })} /></FormField>
          <FormField label="Notes"><textarea className={textareaClass} value={examForm.notes} onChange={(e) => setExamForm({ ...examForm, notes: e.target.value })} /></FormField>
        </div>
      </ModalForm>

      <ModalForm open={logModal} title="Study log" onClose={() => setLogModal(false)} footer={<ModalFooter onCancel={() => setLogModal(false)} onSave={saveLog} />}>
        <div className="space-y-4">
          <FormField label="Date"><input type="date" className={inputClass} value={logForm.date} onChange={(e) => setLogForm({ ...logForm, date: e.target.value })} /></FormField>
          <FormField label="Paper">
            <select className={selectClass} value={logForm.paper} onChange={(e) => setLogForm({ ...logForm, paper: e.target.value })}>
              {hksiPapers.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </FormField>
          <FormField label="Topic"><input className={inputClass} value={logForm.topic} onChange={(e) => setLogForm({ ...logForm, topic: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Study time (hours)"><input type="number" min={0} step={0.5} className={inputClass} value={logForm.studyTime} onChange={(e) => setLogForm({ ...logForm, studyTime: Number(e.target.value) })} /></FormField>
            <FormField label="Questions done"><input type="number" min={0} className={inputClass} value={logForm.questionsDone} onChange={(e) => setLogForm({ ...logForm, questionsDone: Number(e.target.value) })} /></FormField>
            <FormField label="Score %"><input type="number" min={0} max={100} className={inputClass} value={logForm.score} onChange={(e) => setLogForm({ ...logForm, score: Number(e.target.value) })} /></FormField>
          </div>
          <FormField label="Mistakes notes"><textarea className={textareaClass} value={logForm.mistakesNotes} onChange={(e) => setLogForm({ ...logForm, mistakesNotes: e.target.value })} /></FormField>
        </div>
      </ModalForm>

      <ModalForm open={wrongModal} title="Wrong answer" onClose={() => setWrongModal(false)} footer={<ModalFooter onCancel={() => setWrongModal(false)} onSave={saveWrong} />}>
        <div className="space-y-4">
          <FormField label="Question / topic"><input className={inputClass} value={wrongForm.questionOrTopic} onChange={(e) => setWrongForm({ ...wrongForm, questionOrTopic: e.target.value })} /></FormField>
          <FormField label="Paper">
            <select className={selectClass} value={wrongForm.paper} onChange={(e) => setWrongForm({ ...wrongForm, paper: e.target.value })}>
              {hksiPapers.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </FormField>
          <FormField label="Why wrong"><textarea className={textareaClass} value={wrongForm.whyWrong} onChange={(e) => setWrongForm({ ...wrongForm, whyWrong: e.target.value })} /></FormField>
          <FormField label="Correct rule"><textarea className={textareaClass} value={wrongForm.correctRule} onChange={(e) => setWrongForm({ ...wrongForm, correctRule: e.target.value })} /></FormField>
          <FormField label="Review date"><input type="date" className={inputClass} value={wrongForm.reviewDate} onChange={(e) => setWrongForm({ ...wrongForm, reviewDate: e.target.value })} /></FormField>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={wrongForm.mastered} onChange={(e) => setWrongForm({ ...wrongForm, mastered: e.target.checked })} /> Mastered</label>
        </div>
      </ModalForm>

      <ConfirmDialog open={!!deleteExam} title="Delete exam?" message={deleteExam ? `Delete ${deleteExam.paper}?` : ''} onConfirm={() => { if (deleteExam) { updateData((p) => ({ ...p, hksiExams: p.hksiExams.filter((e) => e.id !== deleteExam.id) })); toast('Deleted'); setDeleteExam(null); } }} onCancel={() => setDeleteExam(null)} />
      <ConfirmDialog open={!!deleteLog} title="Delete log?" message="Remove this study log?" onConfirm={() => { if (deleteLog) { updateData((p) => ({ ...p, studyLogs: p.studyLogs.filter((l) => l.id !== deleteLog.id) })); toast('Deleted'); setDeleteLog(null); } }} onCancel={() => setDeleteLog(null)} />
      <ConfirmDialog open={!!deleteWrong} title="Delete entry?" message="Remove from wrong answer bank?" onConfirm={() => { if (deleteWrong) { updateData((p) => ({ ...p, wrongAnswers: p.wrongAnswers.filter((w) => w.id !== deleteWrong.id) })); toast('Deleted'); setDeleteWrong(null); } }} onCancel={() => setDeleteWrong(null)} />
    </div>
  );
}
