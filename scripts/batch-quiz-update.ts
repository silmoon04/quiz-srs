/**
 * Script to batch process quiz question updates
 * Each batch modifies 3 questions to improve incorrect option quality
 */

import * as fs from 'fs';
import * as path from 'path';

interface QuizOption {
  optionId: string;
  optionText: string;
}

interface Question {
  questionId: string;
  questionText: string;
  options: QuizOption[];
  correctOptionIds: string[];
  explanationText: string;
  type: string;
  status: string;
  timesAnsweredCorrectly: number;
  timesAnsweredIncorrectly: number;
  historyOfIncorrectSelections: string[];
  lastSelectedOptionId: string | null;
  lastAttemptedAt: string | null;
  srsLevel: number;
  nextReviewAt: string | null;
  shownIncorrectOptionIds: string[];
}

interface Chapter {
  id: string;
  name: string;
  questions: Question[];
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  isCompleted: boolean;
}

interface Quiz {
  name: string;
  description: string;
  chapters: Chapter[];
}

// Read the original quiz
const quizPath = path.join(__dirname, '../public/default-quiz.json');
const quiz: Quiz = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));

// Create batches directory
const batchDir = path.join(__dirname, '../temp-batches');
if (!fs.existsSync(batchDir)) {
  fs.mkdirSync(batchDir, { recursive: true });
}

// Collect all questions with their chapter index
interface QuestionBatch {
  chapterIndex: number;
  questionIndex: number;
  question: Question;
}

const allQuestions: QuestionBatch[] = [];

quiz.chapters.forEach((chapter, chapterIndex) => {
  chapter.questions.forEach((question, questionIndex) => {
    allQuestions.push({ chapterIndex, questionIndex, question });
  });
});

console.log(`Total questions: ${allQuestions.length}`);

// Create batches of 3 questions each
const BATCH_SIZE = 3;
const batches: QuestionBatch[][] = [];

for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
  batches.push(allQuestions.slice(i, i + BATCH_SIZE));
}

console.log(`Total batches: ${batches.length}`);

// Write each batch to a separate file
batches.forEach((batch, batchIndex) => {
  const batchData = {
    batchIndex,
    questions: batch.map((b) => ({
      chapterIndex: b.chapterIndex,
      questionIndex: b.questionIndex,
      questionId: b.question.questionId,
      questionText: b.question.questionText,
      options: b.question.options,
      correctOptionIds: b.question.correctOptionIds,
      explanationText: b.question.explanationText,
    })),
  };

  const batchFile = path.join(batchDir, `batch-${batchIndex.toString().padStart(2, '0')}.json`);
  fs.writeFileSync(batchFile, JSON.stringify(batchData, null, 2));
  console.log(`Created ${batchFile}`);
});

console.log('\nBatch files created. Run subagents to process each batch.');
console.log('After processing, run merge-batches.ts to combine results.');
