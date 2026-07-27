import { useEffect, useState } from 'react';
import { Fireworks } from '../components/Fireworks';
import type { GameState, Direction } from '../hooks/useGameState';
import type { TibetanLetter } from '../data/alphabet';
import './ResultsScreen.css';

interface Props {
  state: GameState;
  onHome: () => void;
  onRetry: (letters: TibetanLetter[], direction: Direction) => void;
}

export function ResultsScreen({ state, onHome, onRetry }: Props) {
  const accuracy =
    state.totalAnswered > 0
      ? Math.round((state.score > 0 ? (state.totalAnswered - state.wrongAnswers.length) / state.totalAnswered : 0) * 100)
      : 100;

  const isFlashcard = state.mode === 'results' && state.totalAnswered === 0;
  const isPerfectRun =
    state.letters.length === 30 && state.totalAnswered === 30 && state.wrongAnswers.length === 0;

  const [showFireworks, setShowFireworks] = useState(isPerfectRun);

  useEffect(() => {
    if (!isPerfectRun) return;
    const timer = setTimeout(() => setShowFireworks(false), 4000);
    return () => clearTimeout(timer);
  }, [isPerfectRun]);

  return (
    <div className="results-screen">
      {showFireworks && <Fireworks />}
      <div className="results-trophy">
        {isPerfectRun ? '🎆' : isFlashcard ? '📚' : accuracy >= 80 ? '🏆' : accuracy >= 50 ? '⭐' : '💪'}
      </div>
      <h1 className="results-title">
        {isPerfectRun ? 'Perfect score!' : isFlashcard ? 'Well done!' : 'Round complete!'}
      </h1>
      {isPerfectRun && <p className="perfect-banner">🎉 30/30 — flawless run!</p>}

      {!isFlashcard && (
        <div className="results-stats">
          <div className="stat-box">
            <span className="stat-value">{state.score}</span>
            <span className="stat-label">Score</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">🔥 {state.bestStreak}</span>
            <span className="stat-label">Best streak</span>
          </div>
        </div>
      )}

      {state.wrongAnswers.length > 0 && (
        <div className="wrong-answers">
          <h3>Letters to review:</h3>
          <div className="wrong-list">
            {state.wrongAnswers.map(l => (
              <div key={l.id} className="wrong-item">
                <span className="wrong-glyph">{l.tibetan}</span>
                <span className="wrong-wylie">{l.wylie}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="results-actions">
        {state.wrongAnswers.length > 0 && (
          <button className="action-btn retry-wrong-btn" onClick={() => onRetry(state.wrongAnswers, state.direction)}>
            Retry mistakes
          </button>
        )}
        <button className="action-btn retry-btn" onClick={() => onRetry(state.letters, state.direction)}>
          Play again
        </button>
        <button className="action-btn home-btn" onClick={onHome}>
          Home
        </button>
      </div>
    </div>
  );
}
