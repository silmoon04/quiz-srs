import { QuizModule, QuizChapter, QuizQuestion, QuizOption } from '@/types/quiz-types';
import { validateQuizModule, normalizeQuizModule } from '@/utils/quiz-validation-refactored';

interface ParseResult {
  success: boolean;
  quizModule?: QuizModule;
  errors: string[];
}

/**
 * robustly parses a markdown string into a QuizModule.
 * Uses a block-based approach rather than line-by-line state machine.
 */
export function parseMarkdownToQuizModule(markdown: string): ParseResult {
  const errors: string[] = [];

  // Normalize line endings
  const content = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split by horizontal rules '---'
  // We need to be careful not to split '---' inside code blocks.
  // But for now, let's assume '---' on its own line is a separator.
  const chunks = content
    .split(/^---$/m)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (chunks.length === 0) {
    return { success: false, errors: ['Empty file'] };
  }

  // 1. Parse Module Header (First Chunk)
  const headerChunk = chunks[0];
  const moduleNameMatch = headerChunk.match(/^#\s+(.+)$/m);
  if (!moduleNameMatch) {
    return { success: false, errors: ['Markdown must start with a module title (# Title)'] };
  }

  const moduleName = moduleNameMatch[1].trim();
  let moduleDescription = '';
  const descMatch =
    headerChunk.match(/^Description:\s*(.+)$/m) || headerChunk.match(/^_([^_]+)_$/m);
  if (descMatch) {
    moduleDescription = descMatch[1].trim();
  }

  const chapters: QuizChapter[] = [];
  let currentChapter: QuizChapter | null = null;

  // 2. Process remaining chunks
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Check if it's a Chapter
    const chapterMatch = chunk.match(/^##\s+(.+)$/m);
    if (chapterMatch) {
      // It's a new chapter
      const chapterName = chapterMatch[1]
        .trim()
        .replace(/<!--.*?-->/g, '')
        .trim();
      const idMatch = chunk.match(/<!--\s*(?:ID|CH_ID):\s*(\S+)\s*-->/);
      const chapterId = idMatch ? idMatch[1] : `chapter_${chapters.length + 1}_${Date.now()}`;

      let chapterDesc = '';
      const cDescMatch = chunk.match(/^Description:\s*(.+)$/m) || chunk.match(/^_([^_]+)_$/m);
      if (cDescMatch) chapterDesc = cDescMatch[1].trim();

      currentChapter = {
        id: chapterId,
        name: chapterName,
        description: chapterDesc,
        questions: [],
        totalQuestions: 0,
        answeredQuestions: 0,
        correctAnswers: 0,
        isCompleted: false,
      };
      chapters.push(currentChapter);
      continue;
    }

    // Check if it's a Question
    // Supports ### Q: (MCQ) and ### T/F: (True/False)
    const questionMatch = chunk.match(/^###\s+(Q:|T\/F:)\s*(.+)$/m);
    if (questionMatch) {
      if (!currentChapter) {
        errors.push(`[Warning] Found question outside of chapter: "${chunk.substring(0, 20)}..."`);
        continue;
      }

      const type = questionMatch[1] === 'T/F:' ? 'true_false' : 'mcq';
      const rawTitle = questionMatch[2].trim();
      const idMatch = chunk.match(/<!--\s*(?:ID|Q_ID):\s*(\S+)\s*-->/);
      const questionId = idMatch
        ? idMatch[1]
        : `${currentChapter.id}_q${currentChapter.questions.length + 1}_${Date.now()}`;

      try {
        const question = parseQuestionChunk(chunk, type, questionId, rawTitle);
        currentChapter.questions.push(question);
      } catch (e: any) {
        errors.push(`[Error] Failed to parse question "${questionId}": ${e.message}`);
      }
      continue;
    }

    // If neither, it might be just extra text or a malformed block
    // We can ignore or warn
  }

  const parsedModule: QuizModule = {
    name: moduleName,
    description: moduleDescription,
    chapters,
  };

  // Final validation
  const validation = validateQuizModule(parsedModule);
  if (!validation.isValid) {
    errors.push(...validation.errors);
  }

  return {
    success: errors.filter((e) => e.startsWith('[Error]')).length === 0,
    quizModule: normalizeQuizModule(parsedModule),
    errors,
  };
}

function parseQuestionChunk(
  chunk: string,
  type: 'mcq' | 'true_false',
  id: string,
  titleLine: string,
): QuizQuestion {
  // Remove the title line and ID comment to get the body
  let body = chunk
    .replace(/^###\s+(Q:|T\/F:).+$/m, '')
    .replace(/<!--.*?-->/g, '')
    .trim();

  // Extract Explanation
  // Look for **Exp:** at the end
  const expMatch = body.match(/\*\*Exp:\*\*\s*([\s\S]+)$/);
  if (!expMatch) {
    throw new Error("Missing '**Exp:**' section");
  }
  const explanationText = expMatch[1].trim();
  // Remove explanation from body
  body = body.substring(0, expMatch.index).trim();

  // Extract Correct Answer
  // Look for **Correct:** or **Ans:**
  const correctMatch = body.match(/\**(?:Correct|Ans):\*\*\s*(.+)$/m);
  if (!correctMatch) {
    throw new Error("Missing '**Correct:**' or '**Ans:**' section");
  }
  const correctText = correctMatch[1].trim();
  // Remove correct section from body
  body = body.substring(0, correctMatch.index).trim();

  let options: QuizOption[] = [];
  let correctOptionIds: string[] = [];
  let questionText = '';

  if (type === 'true_false') {
    // For T/F, the remaining body is the question text
    questionText = titleLine + '\n' + body;
    options = [
      { optionId: 'true', optionText: 'True' },
      { optionId: 'false', optionText: 'False' },
    ];

    const normalizedCorrect = correctText.toLowerCase();
    if (normalizedCorrect !== 'true' && normalizedCorrect !== 'false') {
      throw new Error(`Invalid T/F answer: ${correctText}`);
    }
    correctOptionIds = [normalizedCorrect];
  } else {
    // For MCQ, we need to find **Options:** or **Opt:**
    const optionsMatch = body.match(/\**(?:Options|Opt):\*\*\s*([\s\S]+)$/);

    if (optionsMatch) {
      // Text before options is the question text
      const textBeforeOptions = body.substring(0, optionsMatch.index).trim();
      questionText = titleLine + (textBeforeOptions ? '\n' + textBeforeOptions : '');

      const optionsBlock = optionsMatch[1];
      // Parse options
      // Regex to find - **A1:** or **A1:**
      // We split by the pattern
      const optionSplitRegex = /(?:^|\n)-?\s*\*\*A(\d+):\*\*/g;

      let match;
      const matches = [];
      while ((match = optionSplitRegex.exec(optionsBlock)) !== null) {
        matches.push({ index: match.index, label: match[1], fullMatch: match[0] });
      }

      if (matches.length < 2) {
        throw new Error('Found fewer than 2 options');
      }

      for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const next = matches[i + 1];
        const start = current.index + current.fullMatch.length;
        const end = next ? next.index : optionsBlock.length;
        const optText = optionsBlock.substring(start, end).trim();

        const optId = `${id}_opt${i + 1}`; // Internal ID
        // We map the label (1, 2, 3) to this ID
        options.push({
          optionId: optId,
          optionText: optText,
        });
      }

      // Parse correct IDs
      // correctText might be "A1" or "A1, A2"
      const correctLabels = correctText.split(',').map((s) => s.trim().replace(/^A/, ''));
      correctOptionIds = correctLabels
        .map((label) => {
          const idx = parseInt(label) - 1;
          if (options[idx]) return options[idx].optionId;
          return null;
        })
        .filter(Boolean) as string[];

      if (correctOptionIds.length === 0) {
        throw new Error(`Could not map correct answer "${correctText}" to options`);
      }
    } else {
      throw new Error("Missing '**Options:**' section");
    }
  }

  return {
    questionId: id,
    type,
    questionText: questionText.trim(),
    options,
    correctOptionIds,
    explanationText,
    // Defaults
    status: 'not_attempted',
    timesAnsweredCorrectly: 0,
    timesAnsweredIncorrectly: 0,
    srsLevel: 0,
    historyOfIncorrectSelections: [],
    shownIncorrectOptionIds: [],
  };
}
