import fs from 'fs';
import path from 'path';
import { QuizModule } from '../types/quiz-types';

const INPUT_FILE = path.join(process.cwd(), 'public', 'default-quiz.json');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'default-quiz.md');

function convertJsonToMarkdown() {
  try {
    const jsonContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    const quizModule: QuizModule = JSON.parse(jsonContent);

    let markdown = `# ${quizModule.name}\n`;
    if (quizModule.description) {
      markdown += `_${quizModule.description}_\n`;
    }
    markdown += '\n---\n\n';

    for (const chapter of quizModule.chapters) {
      markdown += `## ${chapter.name}\n`;
      markdown += `<!-- CH_ID: ${chapter.id} -->\n`;
      if (chapter.description) {
        markdown += `_${chapter.description}_\n`;
      }
      markdown += '\n---\n\n';

      for (const question of chapter.questions) {
        const typeHeader = question.type === 'true_false' ? 'T/F:' : 'Q:';
        markdown += `### ${typeHeader} ${question.questionText}\n`;
        markdown += `<!-- Q_ID: ${question.questionId} -->\n\n`;

        if (question.type === 'mcq') {
          markdown += `**Options:**\n`;
          question.options.forEach((opt, index) => {
            markdown += `**A${index + 1}:** ${opt.optionText}\n`;
          });
          markdown += '\n';

          // Map correctOptionIds to A1, A2...
          const correctLabels = question.correctOptionIds.map((id) => {
            const index = question.options.findIndex((opt) => opt.optionId === id);
            if (index === -1) {
              console.warn(
                `Warning: Correct option ID ${id} not found in options for question ${question.questionId}`,
              );
              return '?';
            }
            return `A${index + 1}`;
          });

          markdown += `**Correct:** ${correctLabels.join(', ')}\n\n`;
        } else if (question.type === 'true_false') {
          // For T/F, we just need the correct answer (True or False)
          // The parser expects **Correct:** True or False
          // In JSON, correctOptionIds usually contains 'true' or 'false' (lowercase)
          const correctVal = question.correctOptionIds[0];
          const correctText = correctVal === 'true' ? 'True' : 'False';
          markdown += `**Correct:** ${correctText}\n\n`;
        }

        markdown += `**Exp:**\n${question.explanationText}\n\n`;
        markdown += '---\n\n';
      }
    }

    fs.writeFileSync(OUTPUT_FILE, markdown, 'utf-8');
    console.log(`Successfully converted JSON to Markdown: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error converting JSON to Markdown:', error);
    process.exit(1);
  }
}

convertJsonToMarkdown();
