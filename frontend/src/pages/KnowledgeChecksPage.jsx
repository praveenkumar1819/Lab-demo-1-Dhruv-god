import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { fetchKnowledgeChecks } from '../api';

export default function KnowledgeChecksPage() {
  const [topics, setTopics] = useState([]);
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    fetchKnowledgeChecks().then((data) => {
      setTopics(data);
    }).catch(console.error);
  }, []);

  const currentTopic = topics[activeTopicIdx];

  const handleSelectOption = (qId, optionIdx) => {
    // If already submitted, don't allow changing until reset
    if (submitted[qId]) return;
    setUserAnswers({ ...userAnswers, [qId]: optionIdx });
  };

  const handleSubmitQuestion = (qId) => {
    if (userAnswers[qId] === undefined) {
      alert('Please select an option before submitting.');
      return;
    }
    setSubmitted({ ...submitted, [qId]: true });
  };

  const handleResetTopic = () => {
    if (!currentTopic) return;
    const newAnswers = { ...userAnswers };
    const newSubmitted = { ...submitted };
    currentTopic.questions.forEach((q) => {
      delete newAnswers[q.id];
      delete newSubmitted[q.id];
    });
    setUserAnswers(newAnswers);
    setSubmitted(newSubmitted);
  };

  // Calculate score for active topic
  const calculateTopicScore = () => {
    if (!currentTopic) return { score: 0, total: 0, done: 0 };
    let score = 0;
    let done = 0;
    currentTopic.questions.forEach((q) => {
      if (submitted[q.id]) {
        done++;
        if (userAnswers[q.id] === q.correct_index) {
          score++;
        }
      }
    });
    return { score, total: currentTopic.questions.length, done };
  };

  const stats = calculateTopicScore();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <GraduationCap size={24} color="#8b5cf6" />
            Module 4 Operations — Knowledge Checks
          </h1>
          <p className="page-description">
            Reinforce key concepts from Topics 1 through 5. Answer each multiple-choice question to test your readiness.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            Topic Score: <span style={{ color: '#34d399' }}>{stats.score}</span> / {stats.total}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleResetTopic}>
            <RotateCcw size={12} /> Reset Topic Quiz
          </button>
        </div>
      </div>

      {/* Topic Switcher Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.75rem'
      }}>
        {topics.map((t, idx) => (
          <button
            key={t.topic_id}
            className={`btn btn-sm ${activeTopicIdx === idx ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTopicIdx(idx)}
            style={{ whiteSpace: 'nowrap' }}
          >
            Topic {t.topic_id}: {t.topic_title.split('—')[1]?.trim() || t.topic_title}
          </button>
        ))}
      </div>

      {/* Current Topic Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {currentTopic?.questions.map((q, idx) => {
          const isSubmitted = !!submitted[q.id];
          const selectedOption = userAnswers[q.id];
          const isCorrect = selectedOption === q.correct_index;

          return (
            <div
              key={q.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                  <span className="mono-cell" style={{ color: 'var(--accent-cyan)', marginRight: '0.4rem' }}>
                    Q{idx + 1}.
                  </span>
                  {q.question}
                </div>

                {isSubmitted && (
                  <span
                    className="badge"
                    style={{
                      background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      color: isCorrect ? '#34d399' : '#fb7185',
                      borderColor: isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                )}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt, oIdx) => {
                  let cardStyle = {
                    background: '#0b0f19',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.9rem',
                    cursor: isSubmitted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.85rem',
                    transition: 'all 0.15s ease'
                  };

                  if (isSubmitted) {
                    if (oIdx === q.correct_index) {
                      cardStyle.background = 'rgba(16, 185, 129, 0.12)';
                      cardStyle.borderColor = '#10b981';
                      cardStyle.color = '#34d399';
                    } else if (selectedOption === oIdx) {
                      cardStyle.background = 'rgba(244, 63, 94, 0.12)';
                      cardStyle.borderColor = '#f43f5e';
                      cardStyle.color = '#fb7185';
                    }
                  } else if (selectedOption === oIdx) {
                    cardStyle.background = 'rgba(59, 130, 246, 0.12)';
                    cardStyle.borderColor = '#3b82f6';
                    cardStyle.color = '#fff';
                  }

                  return (
                    <div
                      key={oIdx}
                      style={cardStyle}
                      onClick={() => handleSelectOption(q.id, oIdx)}
                    >
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        checked={selectedOption === oIdx}
                        disabled={isSubmitted}
                        onChange={() => handleSelectOption(q.id, oIdx)}
                      />
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button or Explanation */}
              <div style={{ marginTop: '0.85rem' }}>
                {!isSubmitted ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSubmitQuestion(q.id)}
                    disabled={selectedOption === undefined}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div style={{
                    background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: isCorrect ? '#34d399' : '#fb7185' }}>
                      {isCorrect ? 'Explanation:' : 'Incorrect. Explanation:'}
                    </strong>{' '}
                    {q.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
