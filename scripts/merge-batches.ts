/**
 * Script to merge processed batch files back into the original quiz
 */

import * as fs from 'fs';
import * as path from 'path';

interface QuizOption {
  optionId: string;
  optionText: string;
}

interface ProcessedQuestion {
  chapterIndex: number;
  questionIndex: number;
  questionId: string;
  questionText: string;
  options: QuizOption[];
  correctOptionIds: string[];
  explanationText: string;
}

interface ProcessedBatch {
  batchIndex: number;
  questions: ProcessedQuestion[];
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

// Read all processed batch files
const batchDir = path.join(__dirname, '../temp-batches');
const processedDir = path.join(__dirname, '../temp-batches/processed');

if (!fs.existsSync(processedDir)) {
  console.error('No processed directory found. Run subagents first.');
  process.exit(1);
}

const processedFiles = fs.readdirSync(processedDir).filter((f) => f.endsWith('.json'));
console.log(`Found ${processedFiles.length} processed batch files`);

let updatedCount = 0;

processedFiles.forEach((file) => {
  const filePath = path.join(processedDir, file);
  const batch: ProcessedBatch = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  batch.questions.forEach((pq) => {
    const chapter = quiz.chapters[pq.chapterIndex];
    if (!chapter) {
      console.error(`Chapter ${pq.chapterIndex} not found`);
      return;
    }

    const question = chapter.questions[pq.questionIndex];
    if (!question) {
      console.error(`Question ${pq.questionIndex} not found in chapter ${pq.chapterIndex}`);
      return;
    }

    if (question.questionId !== pq.questionId) {
      console.error(`Question ID mismatch: expected ${pq.questionId}, got ${question.questionId}`);
      return;
    }

    // Update the question
    question.options = pq.options;
    question.explanationText = pq.explanationText;
    updatedCount++;
  });
});

console.log(`Updated ${updatedCount} questions`);

// Write the updated quiz
const outputPath = path.join(__dirname, '../public/default-quiz.json');
fs.writeFileSync(outputPath, JSON.stringify(quiz, null, 2));
console.log(`Written updated quiz to ${outputPath}`);

// Validate
const totalQuestions = quiz.chapters.reduce((sum, ch) => sum + ch.questions.length, 0);
console.log(`\nValidation:`);
console.log(`- Total chapters: ${quiz.chapters.length}`);
console.log(`- Total questions: ${totalQuestions}`);

// Check for any issues
let issues = 0;
quiz.chapters.forEach((chapter, ci) => {
  chapter.questions.forEach((q, qi) => {
    // Check correctOptionIds reference valid options
    const optionIds = q.options.map((o) => o.optionId);
    q.correctOptionIds.forEach((correctId) => {
      if (!optionIds.includes(correctId)) {
        console.error(`Invalid correctOptionId ${correctId} in ${q.questionId}`);
        issues++;
      }
    });

    // Check for duplicate option IDs
    const uniqueIds = new Set(optionIds);
    if (uniqueIds.size !== optionIds.length) {
      console.error(`Duplicate option IDs in ${q.questionId}`);
      issues++;
    }
  });
});

if (issues === 0) {
  console.log('- No validation issues found');
} else {
  console.log(`- Found ${issues} validation issues`);
}
