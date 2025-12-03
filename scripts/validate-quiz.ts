import fs from 'fs';
import path from 'path';
import { QuizModuleSchema, QuizModule } from '../lib/schema/quiz';
import { z } from 'zod';

const quizPath = path.join(process.cwd(), 'public', 'default-quiz.json');

function validateQuiz() {
  console.log(`Reading quiz from ${quizPath}...`);
  const content = fs.readFileSync(quizPath, 'utf-8');
  let quizData: any;

  try {
    quizData = JSON.parse(content);
  } catch (e) {
    console.error('Invalid JSON syntax:', e);
    process.exit(1);
  }

  console.log('Validating against schema...');
  const result = QuizModuleSchema.safeParse(quizData);

  if (!result.success) {
    console.error('Schema validation failed:');
    result.error.errors.forEach((err) => {
      console.error(`- Path: ${err.path.join('.')}, Message: ${err.message}`);
    });
    // Continue to check for other logical issues if possible, but schema failure is major.
    // We can try to cast it to QuizModule to run other checks if it's close enough,
    // but usually schema validation is the first step.
  } else {
    console.log('Schema validation passed.');
  }

  // Logical checks
  const quiz = quizData as QuizModule; // Treat as QuizModule for logical checks even if schema failed slightly
  const allQuestionIds = new Set<string>();
  const allOptionIds = new Set<string>();
  const allChapterIds = new Set<string>();

  if (quiz.chapters) {
    quiz.chapters.forEach((chapter, chapterIndex) => {
      // Check Chapter ID uniqueness
      if (allChapterIds.has(chapter.id)) {
        console.error(`Duplicate Chapter ID: ${chapter.id}`);
      }
      allChapterIds.add(chapter.id);

      // Check question count
      if (chapter.questions && chapter.totalQuestions !== chapter.questions.length) {
        console.error(
          `Chapter "${chapter.name}" (ID: ${chapter.id}) totalQuestions (${chapter.totalQuestions}) does not match actual questions length (${chapter.questions.length}).`,
        );
      }

      if (chapter.questions) {
        chapter.questions.forEach((question, qIndex) => {
          // Check Question ID uniqueness
          if (allQuestionIds.has(question.questionId)) {
            console.error(`Duplicate Question ID: ${question.questionId}`);
          }
          allQuestionIds.add(question.questionId);

          // Check Options
          const questionOptionIds = new Set<string>();
          if (question.options) {
            question.options.forEach((option, oIndex) => {
              // Check Option ID uniqueness globally (optional but good practice) or locally
              // The schema implies global uniqueness might be good, but definitely local uniqueness is required.
              if (questionOptionIds.has(option.optionId)) {
                console.error(
                  `Duplicate Option ID within question ${question.questionId}: ${option.optionId}`,
                );
              }
              questionOptionIds.add(option.optionId);

              if (allOptionIds.has(option.optionId)) {
                // console.warn(`Duplicate Option ID globally: ${option.optionId}`); // Warning only, as some systems might allow it if scoped to question
              }
              allOptionIds.add(option.optionId);
            });
          }

          // Check Correct Options
          if (question.correctOptionIds) {
            question.correctOptionIds.forEach((correctId) => {
              if (!questionOptionIds.has(correctId)) {
                console.error(
                  `Question ${question.questionId} lists correctOptionId "${correctId}" which is not in options.`,
                );
              }
            });
          }
        });
      }
    });
  }
}

validateQuiz();
