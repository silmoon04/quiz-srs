/**
 * Script to batch process quiz question updates
 * Each batch modifies 3 questions to improve incorrect option quality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the original quiz
const quizPath = path.join(__dirname, '../public/default-quiz.json');
const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));

// Create batches directory
const batchDir = path.join(__dirname, '../temp-batches');
if (!fs.existsSync(batchDir)) {
  fs.mkdirSync(batchDir, { recursive: true });
}

// Create processed directory
const processedDir = path.join(batchDir, 'processed');
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}

// Collect all questions with their chapter index
const allQuestions = [];

quiz.chapters.forEach((chapter, chapterIndex) => {
  chapter.questions.forEach((question, questionIndex) => {
    allQuestions.push({ chapterIndex, questionIndex, question });
  });
});

console.log(`Total questions: ${allQuestions.length}`);

// Create batches of 3 questions each
const BATCH_SIZE = 3;
const batches = [];

for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
  batches.push(allQuestions.slice(i, i + BATCH_SIZE));
}

console.log(`Total batches: ${batches.length}`);

// Write each batch to a separate file
batches.forEach((batch, batchIndex) => {
  const batchData = {
    batchIndex,
    questions: batch.map(b => ({
      chapterIndex: b.chapterIndex,
      questionIndex: b.questionIndex,
      questionId: b.question.questionId,
      questionText: b.question.questionText,
      options: b.question.options,
      correctOptionIds: b.question.correctOptionIds,
      explanationText: b.question.explanationText
    }))
  };
  
  const batchFile = path.join(batchDir, `batch-${batchIndex.toString().padStart(2, '0')}.json`);
  fs.writeFileSync(batchFile, JSON.stringify(batchData, null, 2));
  console.log(`Created ${batchFile}`);
});

console.log('\nBatch files created in temp-batches/');
console.log('After processing, run merge-batches.js to combine results.');
