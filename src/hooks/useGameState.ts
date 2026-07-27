import { useState, useCallback } from 'react';
import type { TibetanLetter } from '../data/alphabet';
import { randomSample } from '../utils/shuffle';

export type GameMode =
  | 'home'
  | 'overview'
  | 'flashcard-setup'
  | 'flashcard'
  | 'quiz-setup'
  | 'quiz'
  | 'results';

export type Direction = 'tibetan-to-wylie' | 'wylie-to-tibetan';

export interface GameState {
  mode: GameMode;
  letters: TibetanLetter[];
  direction: Direction;
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  totalAnswered: number;
  wrongAnswers: TibetanLetter[];
}

export function useGameState(allLetters: TibetanLetter[]) {
  const [state, setState] = useState<GameState>({
    mode: 'home',
    letters: allLetters,
    direction: 'tibetan-to-wylie',
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalAnswered: 0,
    wrongAnswers: [],
  });

  const setupFlashcard = useCallback(() => {
    setState(s => ({ ...s, mode: 'flashcard-setup' }));
  }, []);

  const startFlashcard = useCallback((letters: TibetanLetter[], count?: number, direction: Direction = 'tibetan-to-wylie') => {
    setState(s => ({
      ...s,
      mode: 'flashcard',
      letters: randomSample(letters, count ?? letters.length),
      direction,
      currentIndex: 0,
    }));
  }, []);

  const startOverview = useCallback((letters: TibetanLetter[]) => {
    setState(s => ({
      ...s,
      mode: 'overview',
      letters,
      currentIndex: 0,
    }));
  }, []);

  const setupQuiz = useCallback(() => {
    setState(s => ({ ...s, mode: 'quiz-setup' }));
  }, []);

  const startQuiz = useCallback((letters: TibetanLetter[], count?: number, direction: Direction = 'tibetan-to-wylie') => {
    setState(s => ({
      ...s,
      mode: 'quiz',
      letters: randomSample(letters, count ?? letters.length),
      direction,
      currentIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalAnswered: 0,
      wrongAnswers: [],
    }));
  }, []);

  const goHome = useCallback(() => {
    setState(s => ({ ...s, mode: 'home' }));
  }, []);

  const nextCard = useCallback(() => {
    setState(s => {
      const next = s.currentIndex + 1;
      if (next >= s.letters.length) return { ...s, mode: 'results' };
      return { ...s, currentIndex: next };
    });
  }, []);

  const answerQuiz = useCallback((correct: boolean) => {
    setState(s => {
      const newStreak = correct ? s.streak + 1 : 0;
      const newBest = Math.max(s.bestStreak, newStreak);
      const wrongAnswers = correct
        ? s.wrongAnswers
        : [...s.wrongAnswers, s.letters[s.currentIndex]];
      const next = s.currentIndex + 1;
      const done = next >= s.letters.length;
      return {
        ...s,
        score: correct ? s.score + 10 + (newStreak > 1 ? newStreak * 2 : 0) : s.score,
        streak: newStreak,
        bestStreak: newBest,
        totalAnswered: s.totalAnswered + 1,
        wrongAnswers,
        currentIndex: done ? s.currentIndex : next,
        mode: done ? 'results' : s.mode,
      };
    });
  }, []);

  return {
    state,
    setupFlashcard,
    startFlashcard,
    startOverview,
    setupQuiz,
    startQuiz,
    goHome,
    nextCard,
    answerQuiz,
  };
}
