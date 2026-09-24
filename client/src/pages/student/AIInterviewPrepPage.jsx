import React, { useState } from 'react';
import api from '../../services/api';
import { 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Award,
  Layers,
  PlusCircle,
  Edit3,
  Send,
  Check,
  Code2
} from 'lucide-react';

const AIInterviewPrepPage = () => {
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' | 'custom'
  
  // Role Bank State
  const [role, setRole] = useState('React Developer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [evaluatingIdx, setEvaluatingIdx] = useState(null);

  // Custom Question Practice State (On-the-fly)
  const [customQuestion, setCustomQuestion] = useState('');
  const [customCategory, setCustomCategory] = useState('Technical Concept');
  const [customAnswer, setCustomAnswer] = useState('');
  const [customEvalResult, setCustomEvalResult] = useState(null);
  const [isCustomEvaluating, setIsCustomEvaluating] = useState(false);
  const [customSaveMsg, setCustomSaveMsg] = useState('');

  // Add Question to Database Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    role: 'React Developer',
    category: 'Core Concepts',
    question: '',
    idealAnswer: '',
    difficulty: 'Intermediate',
    coreKeywords: ''
  });
  const [isModalSaving, setIsModalSaving] = useState(false);
  const [modalStatusMsg, setModalStatusMsg] = useState('');

  // Fetch Questions for Selected Role
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    setAnswers({});
    setEvaluations({});
    try {
      const res = await api.get(`/ai/interview-questions?role=${role}&difficulty=${difficulty}`);
      if (res.success) {
        setQuestions(res.questions || []);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Evaluate Question from Bank
  const handleEvaluate = async (qIndex, questionObj) => {
    const ans = answers[qIndex];
    if (!ans || !ans.trim()) {
      alert('Please enter your answer before evaluating.');
      return;
    }

    setEvaluatingIdx(qIndex);
    try {
      const res = await api.post('/ai/evaluate-answer', { 
        question: questionObj.question, 
        answer: ans,
        idealAnswer: questionObj.idealAnswer,
        role,
        category: questionObj.category,
        coreKeywords: questionObj.coreKeywords
      });

      if (res.success) {
        setEvaluations(prev => ({ ...prev, [qIndex]: res.evaluation }));
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setEvaluatingIdx(null);
    }
  };

  // Evaluate On-the-fly Custom Question
  const handleEvaluateCustom = async () => {
    if (!customQuestion.trim()) {
      alert('Please enter an interview question first.');
      return;
    }
    if (!customAnswer.trim()) {
      alert('Please enter your answer to evaluate.');
      return;
    }

    setIsCustomEvaluating(true);
    setCustomEvalResult(null);
    setCustomSaveMsg('');

    try {
      const res = await api.post('/ai/evaluate-answer', {
        question: customQuestion.trim(),
        answer: customAnswer.trim(),
        role: 'Custom Practice',
        category: customCategory || 'General'
      });

      if (res.success) {
        setCustomEvalResult(res.evaluation);
      }
    } catch (err) {
      console.error('Custom evaluation failed:', err);
    } finally {
      setIsCustomEvaluating(false);
    }
  };

  // Save Custom Question to MongoDB Bank
  const handleSaveToBank = async (e) => {
    if (e) e.preventDefault();
    if (!modalForm.question.trim() || !modalForm.idealAnswer.trim()) {
      alert('Question and Ideal Answer are required.');
      return;
    }

    setIsModalSaving(true);
    setModalStatusMsg('');
    try {
      const res = await api.post('/ai/custom-question', modalForm);
      if (res.success) {
        setModalStatusMsg('Question successfully saved to MongoDB Question Bank!');
        setTimeout(() => {
          setShowAddModal(false);
          setModalStatusMsg('');
          setModalForm({
            role: 'React Developer',
            category: 'Core Concepts',
            question: '',
            idealAnswer: '',
            difficulty: 'Intermediate',
            coreKeywords: ''
          });
        }, 1500);
      }
    } catch (err) {
      setModalStatusMsg(err.message || 'Failed to save question.');
    } finally {
      setIsModalSaving(false);
    }
  };

  // Quick save current on-the-fly question to bank
  const handleQuickSaveCustom = async () => {
    if (!customQuestion.trim()) return;
    try {
      const res = await api.post('/ai/custom-question', {
        role: 'General',
        category: customCategory || 'Custom Practice',
        question: customQuestion.trim(),
        idealAnswer: customAnswer.trim() || 'Technical candidate response',
        difficulty: 'Intermediate'
      });
      if (res.success) {
        setCustomSaveMsg('Question saved to database successfully!');
        setTimeout(() => setCustomSaveMsg(''), 4000);
      }
    } catch (err) {
      setCustomSaveMsg('Failed to save question.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              AI Technical Interview Preparation
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Accurate AI evaluation detecting correct, partial, and incorrect answers with detailed concepts feedback.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Question to Bank</span>
        </button>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-col sm:flex-row rounded-2xl bg-slate-100 dark:bg-slate-800/70 p-1 border border-slate-200 dark:border-slate-700 gap-1">
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'bank'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>📋 Curated Role Question Bank</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'custom'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>✍️ Practice Any Custom Question</span>
        </button>
      </div>

      {/* TAB 1: ROLE QUESTION BANK */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          {/* Role & Difficulty Selector Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Target Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="React Developer">React Developer</option>
                  <option value="MERN Developer">MERN Stack Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Software Engineer">Software Engineer (CS Core)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced (Senior)</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchQuestions}
              disabled={loadingQuestions}
              className="w-full sm:w-auto sm:self-end px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingQuestions ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Questions</span>
                </>
              )}
            </button>
          </div>

          {/* Empty State */}
          {questions.length === 0 && !loadingQuestions && (
            <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">No Questions Loaded Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click <strong>"Generate Questions"</strong> to load interview questions from the built-in library and community MongoDB bank.
              </p>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const evalResult = evaluations[idx];
              const isEvaluating = evaluatingIdx === idx;

              return (
                <div 
                  key={idx} 
                  className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                      {q.category}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      Question {idx + 1} of {questions.length}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </h3>

                  {/* Student Answer Textarea */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Your Answer:
                    </label>
                    <textarea
                      rows="4"
                      value={answers[idx] || ''}
                      onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                      placeholder="Explain the technical definition, underlying mechanism, and real-world application..."
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">
                      {answers[idx]?.trim() ? `${answers[idx].trim().split(/\s+/).length} words` : 'Empty'}
                    </span>

                    <button
                      onClick={() => handleEvaluate(idx, q)}
                      disabled={isEvaluating || !answers[idx]?.trim()}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Evaluating with AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Evaluate Answer</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Evaluation Result Card */}
                  {evalResult && renderEvaluationCard(evalResult, q.idealAnswer)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PRACTICE ANY CUSTOM QUESTION ON THE FLY */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Edit3 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Practice Any Interview Question
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Type or paste ANY technical question you encountered in an interview or test. AI will rigorously evaluate your answer.
                </p>
              </div>
            </div>

            {/* Custom Question Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Interview Question: *
                </label>
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="e.g., Explain the difference between process and thread in Operating Systems."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Topic / Category (Optional):
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Operating Systems, System Design, SQL, Docker, Python..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Answer: *
                </label>
                <textarea
                  rows="5"
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  placeholder="Type your explanation here. Be specific about definitions, underlying architecture, and concrete examples..."
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleQuickSaveCustom}
                  disabled={!customQuestion.trim()}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Save to Platform Bank</span>
                </button>

                <button
                  onClick={handleEvaluateCustom}
                  disabled={isCustomEvaluating || !customQuestion.trim() || !customAnswer.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isCustomEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Evaluating Answer with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Evaluate Answer</span>
                    </>
                  )}
                </button>
              </div>

              {customSaveMsg && (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 pt-1">
                  <Check className="w-3.5 h-3.5" />
                  {customSaveMsg}
                </p>
              )}
            </div>

            {/* Custom Evaluation Result */}
            {customEvalResult && renderEvaluationCard(customEvalResult, null)}
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM QUESTION TO MONGODB BANK */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <PlusCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Add Question to Bank
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves permanently in MongoDB Atlas for all candidates to practice.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveToBank} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Role</label>
                  <select
                    value={modalForm.role}
                    onChange={(e) => setModalForm({ ...modalForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="React Developer">React Developer</option>
                    <option value="MERN Developer">MERN Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="General">General / All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={modalForm.category}
                    onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    placeholder="e.g. Hooks, API, Redux"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={modalForm.difficulty}
                    onChange={(e) => setModalForm({ ...modalForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Interview Question: *
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.question}
                  onChange={(e) => setModalForm({ ...modalForm, question: e.target.value })}
                  placeholder="e.g. Explain how indexing works in MongoDB and when it degrades write performance."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Ideal Model Answer: *
                </label>
                <textarea
                  rows="3"
                  required
                  value={modalForm.idealAnswer}
                  onChange={(e) => setModalForm({ ...modalForm, idealAnswer: e.target.value })}
                  placeholder="Write the standard comprehensive answer against which candidates will be evaluated..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Core Keywords (comma separated):
                </label>
                <input
                  type="text"
                  value={modalForm.coreKeywords}
                  onChange={(e) => setModalForm({ ...modalForm, coreKeywords: e.target.value })}
                  placeholder="e.g. b-tree, index, read speed, write penalty, memory"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {modalStatusMsg && (
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {modalStatusMsg}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isModalSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isModalSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Dynamic Evaluation Card
const renderEvaluationCard = (evalResult, idealAnswer) => {
  return (
    <div 
      className={`mt-4 p-5 rounded-2xl border transition-all animate-in fade-in duration-300 space-y-4 ${
        evalResult.status === 'correct'
          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80'
          : evalResult.status === 'partial'
          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80'
          : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80'
      }`}
    >
      {/* Score & Verdict Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5">
          {evalResult.status === 'correct' && (
            <div className="p-1.5 rounded-xl bg-emerald-600 text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {evalResult.status === 'partial' && (
            <div className="p-1.5 rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          {evalResult.status === 'incorrect' && (
            <div className="p-1.5 rounded-xl bg-rose-600 text-white">
              <XCircle className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className={`font-black text-sm uppercase tracking-wider ${
                evalResult.status === 'correct'
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : evalResult.status === 'partial'
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-rose-700 dark:text-rose-300'
              }`}>
                {evalResult.accuracy || (evalResult.status === 'correct' ? 'Correct' : evalResult.status === 'partial' ? 'Partially Correct' : 'Incorrect')}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {evalResult.verdict}
            </p>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-xl font-mono font-black text-base shadow-sm border ${
          evalResult.status === 'correct'
            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
            : evalResult.status === 'partial'
            ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
            : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700'
        }`}>
          {evalResult.score} / 100
        </div>
      </div>

      {/* Strengths */}
      {evalResult.strengths && evalResult.strengths.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            What You Got Right:
          </span>
          <ul className="space-y-1 pl-5 list-disc text-xs text-slate-700 dark:text-slate-300">
            {evalResult.strengths.map((s, sIdx) => (
              <li key={sIdx}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Points & Inaccuracies */}
      {evalResult.missingPoints && evalResult.missingPoints.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Missing Concepts & Corrections:
          </span>
          <ul className="space-y-1 pl-5 list-disc text-xs text-slate-700 dark:text-slate-300">
            {evalResult.missingPoints.map((m, mIdx) => (
              <li key={mIdx}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Coaching Tips */}
      {evalResult.suggestions && (
        <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
          <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            AI Interview Tip:
          </span>
          <p className="text-slate-600 dark:text-slate-300">
            {evalResult.suggestions}
          </p>
        </div>
      )}

      {/* Ideal Model Answer (if available) */}
      {(idealAnswer || evalResult.idealAnswer) && (
        <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 space-y-1.5 text-xs">
          <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            Ideal Technical Response (Model Answer):
          </span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
            "{idealAnswer || evalResult.idealAnswer}"
          </p>
        </div>
      )}

      {/* Follow-up Question */}
      {evalResult.followUpQuestion && (
        <div className="pt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 italic">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Follow-up question: "{evalResult.followUpQuestion}"</span>
        </div>
      )}
    </div>
  );
};

export default AIInterviewPrepPage;