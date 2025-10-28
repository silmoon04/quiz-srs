import type { QuizModule, QuizQuestion, QuizChapter, QuizOption } from '@/types/quiz-types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface LaTeXCorrectionResult {
  correctedContent: string;
  correctionsMade: number;
  correctionDetails: string[];
}

/**
 * Automatically detects and corrects common LaTeX formatting errors in JSON content.
 * This version uses a more conservative pattern to identify LaTeX contexts,
 * focusing on strings containing $...$ or $$...$$ delimiters.
 * It then applies specific fixes within those identified contexts.
 */
export function correctLatexInJsonContent(jsonContent: string): LaTeXCorrectionResult {
  console.log('=== Starting LaTeX Correction Process (Refactored) ===');
  let correctedContent = jsonContent;
  let correctionsMade = 0;
  const correctionDetails: string[] = [];

  // Directive 4: Adopt a Conservative Regex
  const latexContextPattern = /"(?:[^"\\]|\\.)*(?:\${1,2})[^$]*?(?:\${1,2})(?:[^"\\]|\\.)*"/g;

  const latexCommands = [
    'frac',
    'sqrt',
    'sum',
    'int',
    'lim',
    'log',
    'ln',
    'sin',
    'cos',
    'tan',
    'alpha',
    'beta',
    'gamma',
    'delta',
    'epsilon',
    'zeta',
    'eta',
    'theta',
    'iota',
    'kappa',
    'lambda',
    'mu',
    'nu',
    'xi',
    'pi',
    'rho',
    'sigma',
    'tau',
    'upsilon',
    'phi',
    'chi',
    'psi',
    'omega',
    'Gamma',
    'Delta',
    'Theta',
    'Lambda',
    'Xi',
    'Pi',
    'Sigma',
    'Upsilon',
    'Phi',
    'Psi',
    'Omega',
    'infty',
    'partial',
    'nabla',
    'times',
    'cdot',
    'div',
    'pm',
    'mp',
    'neq',
    'leq',
    'geq',
    'approx',
    'equiv',
    'propto',
    'subset',
    'supset',
    'in',
    'notin',
    'cap',
    'cup',
    'land',
    'lor',
    'neg',
    'rightarrow',
    'leftarrow',
    'leftrightarrow',
    'Rightarrow',
    'Leftarrow',
    'Leftrightarrow',
    'uparrow',
    'downarrow',
    'lceil',
    'rceil',
    'lfloor',
    'rfloor',
    'left',
    'right',
    'big',
    'Big',
    'bigg',
    'Bigg',
    'mathbb',
    'mathcal',
    'mathfrak',
    'mathbf',
    'mathrm',
    'text',
    'textbf',
    'textit',
    'emph',
    'boldsymbol',
    'overline',
    'underline',
    'vec',
    'hat',
    'tilde',
    'bar',
    'dot',
    'ddot',
    'acute',
    'grave',
    'check',
    'breve',
    'stackrel',
    'pmod',
    'bmod',
    'operatorname',
    'arcsin',
    'arccos',
    'arctan',
    'sinh',
    'cosh',
    'tanh',
    'coth',
    'sec',
    'csc',
    'cot',
    'exp',
    'det',
    'gcd',
    'min',
    'max',
    'forall',
    'exists',
    'emptyset',
    'therefore',
    'because',
    'ldots',
    'cdots',
    'vdots',
    'ddots',
    'hline',
    'vline',
    'sqrt',
    'prod',
    'coprod',
    'oint',
    'bigcap',
    'bigcup',
    'bigsqcup',
    'bigvee',
    'bigwedge',
    'bigoplus',
    'bigotimes',
    'bigodot',
    'biguplus',
    'substack',
    'cases',
    'pmatrix',
    'bmatrix',
    'vmatrix',
    'Vmatrix',
    'textrm',
    'textsf',
    'texttt',
    'textmd',
    'textup',
    'textsl',
    'mathcal',
    'mathbb',
    'mathscr',
    'mathfrak',
    'mathbf',
    'mathsf',
    'mathtt',
    'operatorname*',
    'DeclareMathOperator',
    'DeclareMathOperator*',
    'label',
    'ref',
    'eqref',
    'tag',
    'notag',
    'nonumber',
    'item',
    'section',
    'subsection',
    'subsubsection',
    'paragraph',
    'subparagraph',
    'chapter',
    'part',
    'appendix',
    'maketitle',
    'tableofcontents',
    'listoffigures',
    'listoftables',
    'bibliography',
    'bibliographystyle',
    'cite',
    'footnote',
    'thanks',
    'author',
    'date',
    'title',
    'documentclass',
    'usepackage',
    'include',
    'input',
    'newenvironment',
    'newtheorem',
    'renewcommand',
    'newcommand',
    'verb',
    'verbatim',
    'lstlisting',
    'minted',
    'includegraphics',
    'caption',
    'figure',
    'table',
    'centering',
    'raggedright',
    'raggedleft',
    'hspace',
    'vspace',
    'hfill',
    'vfill',
    'smallskip',
    'medskip',
    'bigskip',
    'pagebreak',
    'nopagebreak',
    'newpage',
    'clearpage',
    'cleardoublepage',
    'setlength',
    'addtolength',
    'setcounter',
    'addtocounter',
    'newcounter',
    'value',
    'if',
    'else',
    'fi',
    'ifcase',
    'or',
    'ifnum',
    'ifdim',
    'ifodd',
    'ifvmode',
    'ifhmode',
    'ifmmode',
    'ifinner',
    'newif',
    'iftrue',
    'iffalse',
    'fi',
    'let',
    'def',
    'edef',
    'gdef',
    'xdef',
    'futurelet',
    'afterassignment',
    'aftergroup',
    'begin',
    'end', // For environments
  ];

  const latexMatches = correctedContent.match(latexContextPattern) || [];
  console.log(`Found ${latexMatches.length} potential LaTeX contexts using conservative pattern.`);

  latexMatches.forEach((originalQuotedMatch, matchIndex) => {
    let contentInsideQuotes = (originalQuotedMatch as string).slice(1, -1);
    const originalContentInsideQuotes = contentInsideQuotes;
    let matchCorrections = 0;

    // 1. Fix single backslashes before known LaTeX commands
    latexCommands.forEach((command) => {
      // Regex to find \command but not \\command, ensuring command is a whole word
      const singleBackslashPattern = new RegExp(`(?<!\\\\)\\\\(${command})\\b`, 'g');
      const newContent = contentInsideQuotes.replace(singleBackslashPattern, `\\\\$1`);
      if (newContent !== contentInsideQuotes) {
        matchCorrections++;
        correctionDetails.push(`Context ${matchIndex + 1}: Fixed \\${command} → \\\\${command}`);
      }
      contentInsideQuotes = newContent;
    });

    // 2. Fix common LaTeX syntax patterns (like in original quiz-validation.ts)
    const commonFixes = [
      {
        pattern: /(?<!\\)\\{/g,
        replacement: '\\\\{',
        description: '\\{ → \\\\{',
      },
      { pattern: /(?<!\\)\\}/g, replacement: '\\\\}', description: '\\\\}' },
      {
        pattern: /(?<!\\)\\([&%$#_^~])/g,
        replacement: '\\\\$1',
        description: 'Escaped special char (e.g., \\& → \\\\&)',
      },
      {
        pattern: /(?<!\\)\\\[/g,
        replacement: '\\\\[',
        description: '\\[ → \\\\[ (display math)',
      },
      {
        pattern: /(?<!\\)\\\]/g,
        replacement: '\\\\]',
        description: '\\] → \\\\] (display math)',
      },
      {
        pattern: /(?<!\\)\\quad\b/g,
        replacement: '\\\\quad',
        description: '\\quad → \\\\quad',
      },
      {
        pattern: /(?<!\\)\\qquad\b/g,
        replacement: '\\\\qquad',
        description: '\\qquad → \\\\qquad',
      },
      {
        pattern: /(?<!\\)\\,/g,
        replacement: '\\\\,',
        description: '\\, → \\\\,',
      },
      {
        pattern: /(?<!\\)\\;/g,
        replacement: '\\\\;',
        description: '\\; → \\\\;',
      },
      {
        pattern: /(?<!\\)\\!/g,
        replacement: '\\\\!',
        description: '\\! → \\\\!',
      },
    ];

    commonFixes.forEach((fix) => {
      const newContent = contentInsideQuotes.replace(fix.pattern, fix.replacement);
      if (newContent !== contentInsideQuotes) {
        matchCorrections++;
        correctionDetails.push(`Context ${matchIndex + 1}: ${fix.description}`);
      }
      contentInsideQuotes = newContent;
    });

    // 3. Handle specific mathematical constructs (like environments)
    const environmentPattern = /(?<!\\)\\(begin|end){([^}]+)}/g;
    contentInsideQuotes = contentInsideQuotes.replace(environmentPattern, (match, command, env) => {
      matchCorrections++;
      correctionDetails.push(
        `Context ${matchIndex + 1}: Fixed \\${command}{${env}} → \\\\${command}{${env}}`,
      );
      return `\\\\${command}{${env}}`;
    });

    if (matchCorrections > 0) {
      correctionsMade += matchCorrections;
      const newQuotedMatch = `"${contentInsideQuotes}"`;
      correctedContent = correctedContent.replace(originalQuotedMatch, newQuotedMatch);
      console.log(
        `Corrected LaTeX in context ${matchIndex + 1}: "${originalContentInsideQuotes.substring(0, 50)}..." to "${contentInsideQuotes.substring(0, 50)}..."`,
      );
    }
  });

  console.log(`=== LaTeX Correction Complete ===`);
  console.log(`Total corrections made: ${correctionsMade}`);
  if (correctionsMade > 0) {
    console.log('Correction details:', correctionDetails);
  }

  return {
    correctedContent,
    correctionsMade,
    correctionDetails,
  };
}

export function validateAndCorrectQuizModule(data: any): {
  validationResult: ValidationResult;
  correctionResult?: LaTeXCorrectionResult;
  normalizedModule?: QuizModule;
} {
  let jsonString: string;

  if (typeof data === 'string') {
    jsonString = data;
  } else {
    try {
      jsonString = JSON.stringify(data, null, 2);
    } catch {
      return {
        validationResult: {
          isValid: false,
          errors: ['Failed to stringify input data for LaTeX correction.'],
        },
      };
    }
  }

  const correctionResult = correctLatexInJsonContent(jsonString);

  let correctedData: any;
  try {
    correctedData = JSON.parse(correctionResult.correctedContent);
  } catch (parseError) {
    return {
      validationResult: {
        isValid: false,
        errors: [
          `Failed to parse JSON after LaTeX correction: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
        ],
      },
      correctionResult,
    };
  }

  const validationResult = validateQuizModule(correctedData);
  let normalizedModule: QuizModule | undefined;
  if (validationResult.isValid) {
    normalizedModule = normalizeQuizModule(correctedData);
  }

  return {
    validationResult,
    correctionResult,
    normalizedModule,
  };
}

export function validateQuizModule(data: any): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid JSON: Expected an object'] };
  }
  if (typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push("Missing or invalid 'name' property (must be non-empty string)");
  }
  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push("Invalid 'description' property (must be string if provided)");
  }
  if (!Array.isArray(data.chapters)) {
    errors.push("Missing or invalid 'chapters' property (must be array)");
  } else {
    if (data.chapters.length === 0) {
      errors.push("'chapters' array cannot be empty");
    }

    // Check for duplicate chapter IDs
    const seenChapterIds = new Set<string>();
    data.chapters.forEach((chapter: any, chapterIndex: number) => {
      if (chapter?.id && typeof chapter.id === 'string') {
        if (seenChapterIds.has(chapter.id)) {
          errors.push(
            `Duplicate chapter ID found: '${chapter.id}' (Chapter ${chapterIndex + 1}). Each chapter must have a unique ID.`,
          );
        } else {
          seenChapterIds.add(chapter.id);
        }
      }
      errors.push(...validateChapter(chapter, chapterIndex));
    });

    // Check for duplicate question IDs across all chapters
    const seenQuestionIds = new Map<string, string>(); // questionId -> chapterId
    data.chapters.forEach((chapter: any) => {
      if (chapter?.questions && Array.isArray(chapter.questions)) {
        chapter.questions.forEach((question: any, qIndex: number) => {
          if (question?.questionId && typeof question.questionId === 'string') {
            const existingChapter = seenQuestionIds.get(question.questionId);
            if (existingChapter) {
              errors.push(
                `Duplicate question ID found: '${question.questionId}' appears in both chapter '${existingChapter}' and '${chapter.id || 'Unknown'}'. Each question must have a unique ID across the entire quiz module.`,
              );
            } else {
              seenQuestionIds.set(question.questionId, chapter.id || 'Unknown');
            }
          }
        });
      }
    });
  }
  return { isValid: errors.length === 0, errors };
}

function validateChapter(chapter: any, index: number): string[] {
  const errors: string[] = [];
  const prefix = `Chapter ${index + 1} (ID: ${chapter?.id || 'Unknown'})`;
  if (!chapter || typeof chapter !== 'object') {
    errors.push(`${prefix}: Expected an object`);
    return errors;
  }
  if (typeof chapter.id !== 'string' || chapter.id.trim() === '') {
    errors.push(`${prefix}: Missing or invalid 'id' property (must be non-empty string)`);
  }
  if (typeof chapter.name !== 'string' || chapter.name.trim() === '') {
    errors.push(`${prefix}: Missing or invalid 'name' property (must be non-empty string)`);
  }
  if (chapter.description !== undefined && typeof chapter.description !== 'string') {
    errors.push(`${prefix}: Invalid 'description' property (must be string if provided)`);
  }
  if (!Array.isArray(chapter.questions)) {
    errors.push(`${prefix}: Missing or invalid 'questions' property (must be array)`);
  } else {
    if (chapter.questions.length === 0) {
      errors.push(`${prefix}: 'questions' array cannot be empty`);
    }
    chapter.questions.forEach((question: any, questionIndex: number) => {
      errors.push(...validateQuestion(question, chapter.id || `chap${index}`, questionIndex));
    });
  }
  return errors;
}

function validateQuestion(question: any, chapterId: string, questionIndex: number): string[] {
  const errors: string[] = [];
  const prefix = `Chapter (ID: ${chapterId}), Question ${questionIndex + 1} (ID: ${question?.questionId || 'Unknown'})`;
  if (!question || typeof question !== 'object') {
    errors.push(`${prefix}: Expected an object`);
    return errors;
  }
  if (typeof question.questionId !== 'string' || question.questionId.trim() === '') {
    errors.push(`${prefix}: Missing or invalid 'questionId' property (must be non-empty string)`);
  }
  if (typeof question.questionText !== 'string' || question.questionText.trim() === '') {
    errors.push(`${prefix}: Missing or invalid 'questionText' property (must be non-empty string)`);
  }
  if (typeof question.explanationText !== 'string' || question.explanationText.trim() === '') {
    errors.push(
      `${prefix}: Missing or invalid 'explanationText' property (must be non-empty string)`,
    );
  }

  // Validate 'type' field
  if (question.type !== undefined && question.type !== 'mcq' && question.type !== 'true_false') {
    errors.push(`${prefix}: Invalid 'type' property (must be 'mcq' or 'true_false' if provided)`);
  }

  if (!Array.isArray(question.options)) {
    errors.push(`${prefix}: Missing or invalid 'options' property (must be array)`);
  } else {
    if (question.options.length === 0) {
      errors.push(`${prefix}: 'options' array cannot be empty`);
    }
    // For T/F questions, specific option validation
    if (question.type === 'true_false') {
      if (
        question.options.length !== 2 ||
        !question.options.find(
          (opt: QuizOption) => opt.optionId === 'true' && opt.optionText === 'True',
        ) ||
        !question.options.find(
          (opt: QuizOption) => opt.optionId === 'false' && opt.optionText === 'False',
        )
      ) {
        errors.push(
          `${prefix}: For 'true_false' type, options must be exactly [{optionId: "true", optionText: "True"}, {optionId: "false", optionText: "False"}]`,
        );
      }
    } else {
      // Existing option validation for MCQs
      question.options.forEach((option: any, optionIndex: number) => {
        if (!option || typeof option !== 'object') {
          errors.push(`${prefix}, Option ${optionIndex + 1}: Expected an object`);
          return;
        }
        if (typeof option.optionId !== 'string' || option.optionId.trim() === '') {
          errors.push(
            `${prefix}, Option ${optionIndex + 1}: Missing or invalid 'optionId' (must be non-empty string)`,
          );
        }
        if (typeof option.optionText !== 'string' || option.optionText.trim() === '') {
          errors.push(
            `${prefix}, Option ${optionIndex + 1}: Missing or invalid 'optionText' (must be non-empty string)`,
          );
        }
      });
    }
  }
  if (!Array.isArray(question.correctOptionIds)) {
    errors.push(`${prefix}: Missing or invalid 'correctOptionIds' property (must be array)`);
  } else {
    if (question.correctOptionIds.length === 0) {
      errors.push(`${prefix}: 'correctOptionIds' array cannot be empty`);
    }
    // For T/F questions, specific correctOptionIds validation
    if (question.type === 'true_false') {
      if (
        question.correctOptionIds.length !== 1 ||
        (question.correctOptionIds[0] !== 'true' && question.correctOptionIds[0] !== 'false')
      ) {
        errors.push(
          `${prefix}: For 'true_false' type, correctOptionIds must be an array with a single string: 'true' or 'false'.`,
        );
      }
    } else if (Array.isArray(question.options) && question.options.length > 0) {
      // Existing correctOptionIds validation for MCQs
      const optionIds = question.options
        .filter((opt: any) => opt && typeof opt.optionId === 'string')
        .map((opt: any) => opt.optionId);
      question.correctOptionIds.forEach((correctId: any, correctIdx: number) => {
        if (typeof correctId !== 'string') {
          errors.push(`${prefix}: correctOptionIds[${correctIdx}] must be a string.`);
        } else if (!optionIds.includes(correctId)) {
          errors.push(`${prefix}: correctOptionId '${correctId}' not found in options.`);
        }
      });
    }
  }
  return errors;
}

export function validateSingleQuestion(data: any): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Expected a question object'] };
  }
  // Simplified validation, assuming main validateQuestion covers details
  if (typeof data.questionId !== 'string' || !data.questionId.trim())
    errors.push("Missing or invalid 'questionId'");
  if (typeof data.questionText !== 'string' || !data.questionText.trim())
    errors.push("Missing or invalid 'questionText'");
  if (typeof data.explanationText !== 'string' || !data.explanationText.trim())
    errors.push("Missing or invalid 'explanationText'");

  if (data.type !== undefined && data.type !== 'mcq' && data.type !== 'true_false') {
    errors.push("Invalid 'type' property (must be 'mcq' or 'true_false' if provided)");
  }

  if (!Array.isArray(data.options) || data.options.length === 0)
    errors.push("Missing or invalid 'options' array");
  else {
    if (data.type === 'true_false') {
      if (
        data.options.length !== 2 ||
        !data.options.find(
          (opt: QuizOption) => opt.optionId === 'true' && opt.optionText === 'True',
        ) ||
        !data.options.find(
          (opt: QuizOption) => opt.optionId === 'false' && opt.optionText === 'False',
        )
      ) {
        errors.push(
          `For 'true_false' type, options must be exactly [{optionId: "true", optionText: "True"}, {optionId: "false", optionText: "False"}]`,
        );
      }
    } else {
      data.options.forEach((opt: any, i: number) => {
        if (!opt || typeof opt.optionId !== 'string' || !opt.optionId.trim())
          errors.push(`Option ${i + 1} has invalid 'optionId'`);
        if (!opt || typeof opt.optionText !== 'string' || !opt.optionText.trim())
          errors.push(`Option ${i + 1} has invalid 'optionText'`);
      });
    }
  }
  if (!Array.isArray(data.correctOptionIds) || data.correctOptionIds.length === 0)
    errors.push("Missing or invalid 'correctOptionIds' array");
  else {
    if (data.type === 'true_false') {
      if (
        data.correctOptionIds.length !== 1 ||
        (data.correctOptionIds[0] !== 'true' && data.correctOptionIds[0] !== 'false')
      ) {
        errors.push(
          `For 'true_false' type, correctOptionIds must be an array with a single string: 'true' or 'false'.`,
        );
      }
    }
    // Further validation for correctOptionIds matching actual optionIds can be added if needed for MCQs
  }
  return { isValid: errors.length === 0, errors };
}

export function normalizeSingleQuestion(data: QuizQuestion): QuizQuestion {
  return {
    ...data,
    type: data.type || 'mcq', // Default to 'mcq' if type is missing
    status: data.status || 'not_attempted',
    timesAnsweredCorrectly: data.timesAnsweredCorrectly || 0,
    timesAnsweredIncorrectly: data.timesAnsweredIncorrectly || 0,
    historyOfIncorrectSelections: data.historyOfIncorrectSelections || [],
    lastSelectedOptionId: data.lastSelectedOptionId || undefined,
    lastAttemptedAt: data.lastAttemptedAt || undefined,
    srsLevel: data.srsLevel || 0,
    nextReviewAt: data.nextReviewAt || null,
    shownIncorrectOptionIds: data.shownIncorrectOptionIds || [],
  };
}

export function normalizeQuizModule(data: any): QuizModule {
  const normalizedChapters = data.chapters.map((chapter: any) => {
    const normalizedQuestions = chapter.questions.map(normalizeSingleQuestion); // Use normalizeSingleQuestion
    const totalQuestions = normalizedQuestions.length;
    const answeredQuestions = normalizedQuestions.filter(
      (q: QuizQuestion) => q.status !== 'not_attempted',
    ).length;
    const correctAnswers = normalizedQuestions.filter(
      (q: QuizQuestion) => (q.timesAnsweredCorrectly || 0) > 0,
    ).length;
    return {
      ...chapter,
      questions: normalizedQuestions,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      isCompleted: answeredQuestions === totalQuestions,
    };
  });
  return { ...data, chapters: normalizedChapters };
}

export function recalculateChapterStats(chapter: QuizChapter) {
  chapter.totalQuestions = chapter.questions.length;
  chapter.answeredQuestions = chapter.questions.filter((q) => q.status !== 'not_attempted').length;
  chapter.correctAnswers = chapter.questions.filter(
    (q) => (q.timesAnsweredCorrectly || 0) > 0,
  ).length;
  chapter.isCompleted = chapter.answeredQuestions === chapter.totalQuestions;
}

// --- Refactored Markdown Parser ---

interface MarkdownParseResult {
  success: boolean;
  quizModule?: QuizModule;
  errors: string[];
}

// Helper to manage current line index as a mutable reference
interface LineIndexRef {
  value: number;
}

/**
 * Helper function to parse block content (question text, option text, explanation).
 * Reads lines until a stopper keyword is encountered or EOF.
 * Handles Markdown code blocks (```) correctly, ignoring stoppers within them.
 * @param lines - Array of all lines in the document.
 * @param lineIndexRef - Mutable reference to the current line index.
 * @param stopperKeywords - Array of keywords that signify the end of this block.
 * @returns The parsed block content as a single string.
 */
function parseBlockContent(
  lines: string[],
  lineIndexRef: LineIndexRef,
  stopperKeywords: string[],
): string {
  const contentLines: string[] = [];
  let inCodeBlock = false;
  const codeBlockDelimiter = '```';

  while (lineIndexRef.value < lines.length) {
    const line = lines[lineIndexRef.value];
    const trimmedLine = line.trim();

    if (inCodeBlock) {
      contentLines.push(line); // Add raw line
      lineIndexRef.value++;
      if (trimmedLine === codeBlockDelimiter) {
        inCodeBlock = false;
      }
      continue;
    }

    // Check for code block start (``` or ```lang)
    if (trimmedLine.startsWith(codeBlockDelimiter)) {
      inCodeBlock = true;
      contentLines.push(line);
      lineIndexRef.value++;
      continue;
    }

    // Check for stoppers only if not in code block
    for (const stopper of stopperKeywords) {
      // Exact match for "---" or startsWith for others
      const isStopperMatch =
        (stopper === '---' && trimmedLine === stopper) ||
        (stopper !== '---' && trimmedLine.startsWith(stopper));
      if (isStopperMatch) {
        return contentLines.join('\n'); // Return content *before* stopper line
      }
    }

    contentLines.push(line);
    lineIndexRef.value++;
  }
  return contentLines.join('\n'); // Return all remaining content if no stopper found
}

function skipEmptyLines(lines: string[], lineIndexRef: LineIndexRef): void {
  while (lineIndexRef.value < lines.length && lines[lineIndexRef.value].trim() === '') {
    lineIndexRef.value++;
  }
}

function peekLine(lines: string[], lineIndexRef: LineIndexRef): string | null {
  return lineIndexRef.value < lines.length ? lines[lineIndexRef.value] : null;
}

function consumeLine(lines: string[], lineIndexRef: LineIndexRef): string | null {
  return lineIndexRef.value < lines.length ? lines[lineIndexRef.value++] : null;
}

function cleanText(text: string | null): string {
  return text ? text.replace(/\r/g, '').trim() : '';
}

function extractIdFromComment(line: string): string | null {
  // Regex to capture ID: <!-- ID: any_non_space_char_non_greedy -->
  // Allows hyphens and other characters in IDs.
  const match = line.match(/<!--\s*(?:Q_ID|CH_ID|ID):\s*(\S+?)\s*-->/);
  return match ? match[1] : null;
}

/**
 * Attempts to recover from a parsing error by skipping lines until a potential
 * start of a new chapter (##) or question (### Q: or ### T/F:) or a separator (---) is found.
 * @param lines - Array of all lines in the document.
 * @param lineIndexRef - Mutable reference to the current line index.
 */
function recoverAndSkipToNextEntry(lines: string[], lineIndexRef: LineIndexRef): void {
  const initialErrorLine = lineIndexRef.value + 1;
  console.warn(
    `[Parser Recovery] Attempting to recover from error near line ${initialErrorLine}. Skipping lines...`,
  );
  while (lineIndexRef.value < lines.length) {
    const line = lines[lineIndexRef.value];
    const trimmedLine = line.trim();
    // Check for common entry points or separators
    if (
      trimmedLine.startsWith('### Q:') ||
      trimmedLine.startsWith('### T/F:') || // Added T/F for recovery
      trimmedLine.startsWith('## ') ||
      trimmedLine === '---'
    ) {
      console.warn(
        `[Parser Recovery] Found next potential entry at line ${lineIndexRef.value + 1}: "${line.substring(0, 50)}..."`,
      );
      return; // Stop *before* this potential next entry, so main loop can process it
    }
    lineIndexRef.value++;
  }
  console.warn(
    `[Parser Recovery] Reached end of file while recovering from line ${initialErrorLine}.`,
  );
}

/**
 * Parses a Markdown file formatted according to the MCQ Quiz specification
 * and converts it to a QuizModule structure.
 * This refactored version includes robust block content parsing,
 * granular error recovery, strict ID uniqueness checks, and support for True/False questions.
 */
export function parseMarkdownToQuizModule(markdownContent: string): MarkdownParseResult {
  console.log('=== Starting Refactored Markdown Quiz Parsing (with T/F support) ===');

  const errors: string[] = [];
  const seenChapterIds = new Set<string>();
  const seenQuestionIds = new Set<string>();

  const normalizedContent = markdownContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.split('\n');
  const lineIndexRef: LineIndexRef = { value: 0 };

  let moduleName = 'Untitled Quiz Module';
  let moduleDescription = '';

  // --- Parse Module Header ---
  skipEmptyLines(lines, lineIndexRef);
  let currentLine = peekLine(lines, lineIndexRef);
  if (currentLine && currentLine.startsWith('# ')) {
    moduleName = cleanText(consumeLine(lines, lineIndexRef)!.substring(2));
    skipEmptyLines(lines, lineIndexRef);
    currentLine = peekLine(lines, lineIndexRef);
    if (currentLine && currentLine.startsWith('Description:')) {
      moduleDescription = cleanText(consumeLine(lines, lineIndexRef)!.substring(12));
    } else if (
      currentLine &&
      currentLine.startsWith('_') &&
      currentLine.endsWith('_') &&
      currentLine.length > 2
    ) {
      moduleDescription = cleanText(consumeLine(lines, lineIndexRef)!.slice(1, -1));
    }
    skipEmptyLines(lines, lineIndexRef);
    currentLine = peekLine(lines, lineIndexRef);
    if (currentLine === '---') {
      consumeLine(lines, lineIndexRef);
    } else {
      errors.push(
        "[Warning] Expected '---' separator after module header, not found. Parsing continues.",
      );
    }
  } else {
    errors.push(
      "[Error] Markdown must start with a module title (e.g., '# Module Title'). Cannot parse.",
    );
    return { success: false, errors };
  }

  const chapters: QuizChapter[] = [];

  // --- Parse Chapters ---
  while (lineIndexRef.value < lines.length) {
    skipEmptyLines(lines, lineIndexRef);
    currentLine = peekLine(lines, lineIndexRef);
    if (!currentLine) break;

    if (!currentLine.startsWith('## ')) {
      const problematicLine = consumeLine(lines, lineIndexRef);
      errors.push(
        `[Warning] Unexpected content found outside of a chapter structure near line ${lineIndexRef.value}: "${problematicLine?.substring(0, 70)}...". Attempting to find next chapter.`,
      );
      continue;
    }

    const chapterHeaderLine = consumeLine(lines, lineIndexRef)!;
    const chapterName = cleanText(chapterHeaderLine.substring(3).replace(/<!--.*?-->/g, ''));
    let chapterId = extractIdFromComment(chapterHeaderLine);

    if (!chapterId) {
      currentLine = peekLine(lines, lineIndexRef);
      if (currentLine && currentLine.trim().startsWith('<!--')) {
        chapterId = extractIdFromComment(currentLine);
        if (chapterId) consumeLine(lines, lineIndexRef);
      }
    }
    if (!chapterId) {
      chapterId = `chapter_${chapters.length + 1}_${Date.now()}`;
      errors.push(
        `[Warning] Chapter "${chapterName.substring(0, 30)}..." is missing an ID. Generated default: ${chapterId}`,
      );
    }

    if (seenChapterIds.has(chapterId)) {
      errors.push(
        `[Error] Duplicate Chapter ID found: '${chapterId}'. Each chapter must have a unique ID. Chapter name: "${chapterName.substring(0, 30)}..."`,
      );
      // Generate a new unique ID to prevent React key errors
      const originalId = chapterId;
      let suffix = 1;
      while (seenChapterIds.has(`${originalId}_${suffix}`)) {
        suffix++;
      }
      chapterId = `${originalId}_${suffix}`;
      errors.push(`[Auto-fix] Renamed duplicate chapter ID to '${chapterId}' to prevent errors.`);
      seenChapterIds.add(chapterId);
    } else {
      seenChapterIds.add(chapterId);
    }

    let chapterDescription = '';
    skipEmptyLines(lines, lineIndexRef);
    currentLine = peekLine(lines, lineIndexRef);
    if (currentLine && currentLine.startsWith('Description:')) {
      chapterDescription = cleanText(consumeLine(lines, lineIndexRef)!.substring(12));
    } else if (
      currentLine &&
      currentLine.startsWith('_') &&
      currentLine.endsWith('_') &&
      currentLine.length > 2
    ) {
      chapterDescription = cleanText(consumeLine(lines, lineIndexRef)!.slice(1, -1));
    }

    skipEmptyLines(lines, lineIndexRef);
    currentLine = peekLine(lines, lineIndexRef);
    if (currentLine === '---') {
      consumeLine(lines, lineIndexRef);
    } else {
      errors.push(
        `[Warning] Expected '---' separator after chapter header (ID: ${chapterId}), not found. Parsing continues.`,
      );
    }

    const questions: QuizQuestion[] = [];
    let questionCounterInChapter = 0;

    // --- Parse Questions in Chapter ---
    while (lineIndexRef.value < lines.length) {
      skipEmptyLines(lines, lineIndexRef);
      const questionParseStartLine = lineIndexRef.value;
      currentLine = peekLine(lines, lineIndexRef);

      if (!currentLine || currentLine.startsWith('## ')) {
        break; // End of chapter or start of next
      }

      const isMcq = currentLine.startsWith('### Q:');
      const isTrueFalse = currentLine.startsWith('### T/F:');

      if (!isMcq && !isTrueFalse) {
        const problematicLine = consumeLine(lines, lineIndexRef);
        errors.push(
          `[Warning] Chapter (ID: ${chapterId}): Unexpected content found instead of a question near line ${lineIndexRef.value}: "${problematicLine?.substring(0, 70)}...". Skipping to find next question or chapter.`,
        );
        recoverAndSkipToNextEntry(lines, lineIndexRef);
        continue;
      }

      try {
        questionCounterInChapter++;
        const questionHeaderLine = consumeLine(lines, lineIndexRef)!;
        let questionId = extractIdFromComment(questionHeaderLine);
        const headerTextStartIndex = isTrueFalse ? 8 : 7; // "### T/F: " is 8 chars, "### Q: " is 7
        const rawQuestionHeaderText = cleanText(
          questionHeaderLine.substring(headerTextStartIndex).replace(/<!--.*?-->/g, ''),
        );

        if (!questionId) {
          currentLine = peekLine(lines, lineIndexRef);
          if (currentLine && currentLine.trim().startsWith('<!--')) {
            questionId = extractIdFromComment(currentLine);
            if (questionId) consumeLine(lines, lineIndexRef);
          }
        }
        if (!questionId) {
          questionId = `${chapterId}_q${questionCounterInChapter}_${Date.now()}`; // Generic 'q' prefix, type field will differentiate
          errors.push(
            `[Warning] Question in chapter ${chapterId} (starting with "${rawQuestionHeaderText.substring(0, 30)}...") is missing an ID. Generated default: ${questionId}`,
          );
        }

        if (seenQuestionIds.has(questionId)) {
          errors.push(
            `[Error] Duplicate Question ID found: '${questionId}'. Each question must have a unique ID across the entire quiz. Question text starts with: "${rawQuestionHeaderText.substring(0, 30)}..."`,
          );
          // Generate a new unique ID to prevent React key errors
          const originalId = questionId;
          let suffix = 1;
          while (seenQuestionIds.has(`${originalId}_${suffix}`)) {
            suffix++;
          }
          questionId = `${originalId}_${suffix}`;
          errors.push(
            `[Auto-fix] Renamed duplicate question ID to '${questionId}' to prevent React errors.`,
          );
          seenQuestionIds.add(questionId);
        } else {
          seenQuestionIds.add(questionId);
        }

        let questionText: string;
        let options: QuizOption[] = [];
        let correctOptionIds: string[] = [];
        let explanationText: string;
        const questionType: 'mcq' | 'true_false' = isTrueFalse ? 'true_false' : 'mcq';

        // Stoppers for explanation text, common for both types
        const explanationStoppers = ['### Q:', '### T/F:', '## ', '---'];

        if (isTrueFalse) {
          // --- True/False Question Parsing ---
          const questionTextContent = parseBlockContent(lines, lineIndexRef, [
            '**Correct:**',
            '**Ans:**',
          ]);
          questionText = cleanText(
            rawQuestionHeaderText + (questionTextContent ? '\n' + questionTextContent : ''),
          );
          if (!questionText) {
            throw new Error('T/F Question text is empty.');
          }

          skipEmptyLines(lines, lineIndexRef);
          currentLine = peekLine(lines, lineIndexRef);
          // CRITICAL VALIDATION: T/F questions must not have an Options block
          if (
            currentLine &&
            (currentLine.trim() === '**Options:**' || currentLine.trim() === '**Opt:**')
          ) {
            throw new Error("T/F questions cannot have an 'Options:' or 'Opt:' block.");
          }

          options = [
            { optionId: 'true', optionText: 'True' },
            { optionId: 'false', optionText: 'False' },
          ];

          currentLine = consumeLine(lines, lineIndexRef); // Consume the line that should be Correct/Ans
          if (
            !currentLine ||
            !(currentLine.startsWith('**Correct:**') || currentLine.startsWith('**Ans:**'))
          ) {
            throw new Error(
              `Expected '**Correct:**' or '**Ans:**' for T/F question ${questionId}, found: "${currentLine || 'EOF'}"`,
            );
          }

          const correctPrefix = currentLine.startsWith('**Correct:**')
            ? '**Correct:**'
            : '**Ans:**';

          const correctAnswerText = currentLine.slice(correctPrefix.length).trim().toLowerCase();

          if (correctAnswerText !== 'true' && correctAnswerText !== 'false') {
            throw new Error(
              `The answer for T/F question ${questionId} must be 'True' or 'False'. Found: '${correctAnswerText}'`,
            );
          }
          correctOptionIds = [correctAnswerText];

          skipEmptyLines(lines, lineIndexRef);
          currentLine = consumeLine(lines, lineIndexRef);
          if (!currentLine || currentLine.trim() !== '**Exp:**') {
            throw new Error(
              `Expected '**Exp:**' for T/F question ${questionId}, found: "${currentLine || 'EOF'}"`,
            );
          }
          const explanationTextContent = parseBlockContent(
            lines,
            lineIndexRef,
            explanationStoppers,
          );
          explanationText = cleanText(explanationTextContent);
          if (!explanationText) {
            throw new Error(`Explanation text is empty for T/F question ${questionId}.`);
          }
        } else {
          // --- MCQ Question Parsing (existing logic, slightly adapted) ---
          const questionTextContent = parseBlockContent(lines, lineIndexRef, [
            '**Options:**',
            '**Opt:**',
          ]);
          questionText = cleanText(
            rawQuestionHeaderText + (questionTextContent ? '\n' + questionTextContent : ''),
          );
          if (!questionText) {
            throw new Error('MCQ Question text is empty.');
          }

          skipEmptyLines(lines, lineIndexRef);
          currentLine = consumeLine(lines, lineIndexRef);
          if (
            !currentLine ||
            !(currentLine.trim() === '**Options:**' || currentLine.trim() === '**Opt:**')
          ) {
            throw new Error(
              `Expected '**Options:**' or '**Opt:**' for MCQ question ${questionId}, found: "${currentLine || 'EOF'}"`,
            );
          }

          const optionLabelToIdMap: Record<string, string> = {};
          let optionCounter = 1;
          while (lineIndexRef.value < lines.length) {
            skipEmptyLines(lines, lineIndexRef);
            currentLine = peekLine(lines, lineIndexRef);
            if (!currentLine) break;

            const optionLineTrimmed = currentLine.trim();
            if (
              optionLineTrimmed.startsWith('**Correct:**') ||
              optionLineTrimmed.startsWith('**Ans:**') ||
              optionLineTrimmed.startsWith('**Exp:**')
            ) {
              break;
            }

            const optionMatch =
              optionLineTrimmed.match(/^\*\*A(\d+):\*\*(.*)$/) ||
              optionLineTrimmed.match(/^-\s*\*\*A(\d+):\*\*(.*)$/);
            if (!optionMatch) {
              if (optionLineTrimmed !== '') {
                errors.push(
                  `[Warning] MCQ Question ID ${questionId}: Unexpected line while parsing options: "${currentLine.substring(0, 50)}...". Attempting to continue.`,
                );
              }
              break;
            }

            consumeLine(lines, lineIndexRef);
            const optionLabel = `A${optionMatch[1]}`;
            const parsedOptionId = `${questionId}_opt${optionCounter++}`;
            const firstLineOptionText = cleanText(
              optionMatch[optionMatch[0].startsWith('-') ? 2 : 2],
            );

            const remainingOptionTextContent = parseBlockContent(lines, lineIndexRef, [
              '**A',
              '- **A',
              '**Correct:**',
              '**Ans:**',
              '**Exp:**',
              ...explanationStoppers, // Include general stoppers
            ]);
            const currentOptionText = cleanText(
              firstLineOptionText +
                (remainingOptionTextContent ? '\n' + remainingOptionTextContent : ''),
            );
            if (!currentOptionText) {
              errors.push(
                `[Warning] MCQ Question ID ${questionId}, Option ${optionLabel}: Option text is empty.`,
              );
            }
            options.push({
              optionId: parsedOptionId,
              optionText: currentOptionText,
            });
            optionLabelToIdMap[optionLabel] = parsedOptionId;
          }
          if (options.length === 0) {
            throw new Error(`No options found for MCQ question ${questionId}.`);
          }

          skipEmptyLines(lines, lineIndexRef);
          currentLine = consumeLine(lines, lineIndexRef);
          if (
            !currentLine ||
            !(currentLine.startsWith('**Correct:**') || currentLine.startsWith('**Ans:**'))
          ) {
            throw new Error(
              `Expected '**Correct:**' or '**Ans:**' for MCQ question ${questionId}, found: "${currentLine || 'EOF'}"`,
            );
          }
          const correctSectionPrefix = currentLine.startsWith('**Correct:**')
            ? '**Correct:**'
            : '**Ans:**';
          const correctSectionContent = currentLine.slice(correctSectionPrefix.length);
          const correctLabels = correctSectionContent
            .trim()
            .split(',')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
          correctOptionIds = correctLabels
            .map((label) => {
              const id = optionLabelToIdMap[label];
              if (!id)
                errors.push(
                  `[Warning] MCQ Question ID ${questionId}: Correct answer label '${label}' does not match any parsed option label.`,
                );
              return id;
            })
            .filter(Boolean) as string[];
          if (correctOptionIds.length === 0) {
            throw new Error(
              `No valid correct answer IDs derived for MCQ question ${questionId}. Parsed labels: ${correctLabels.join(', ')}`,
            );
          }

          skipEmptyLines(lines, lineIndexRef);
          currentLine = consumeLine(lines, lineIndexRef);
          if (!currentLine || currentLine.trim() !== '**Exp:**') {
            throw new Error(
              `Expected '**Exp:**' for MCQ question ${questionId}, found: "${currentLine || 'EOF'}"`,
            );
          }
          const explanationTextContent = parseBlockContent(
            lines,
            lineIndexRef,
            explanationStoppers,
          );
          explanationText = cleanText(explanationTextContent);
          if (!explanationText) {
            throw new Error(`Explanation text is empty for MCQ question ${questionId}.`);
          }
        } // End of MCQ specific parsing

        questions.push(
          normalizeSingleQuestion({
            questionId,
            type: questionType,
            questionText,
            options,
            correctOptionIds,
            explanationText,
            status: 'not_attempted',
            timesAnsweredCorrectly: 0,
            timesAnsweredIncorrectly: 0,
            historyOfIncorrectSelections: [],
            srsLevel: 0,
            nextReviewAt: null,
            shownIncorrectOptionIds: [],
          }),
        );

        skipEmptyLines(lines, lineIndexRef);
        currentLine = peekLine(lines, lineIndexRef);
        if (currentLine === '---') {
          consumeLine(lines, lineIndexRef);
        }
      } catch (e) {
        const errorMsg = `[Error] Failed to parse question starting near line ${questionParseStartLine + 1} in Chapter ID ${chapterId}: ${(e as Error).message}. This question will be skipped.`;
        errors.push(errorMsg);
        console.error(errorMsg, e);
        recoverAndSkipToNextEntry(lines, lineIndexRef);
      }
    } // End of questions loop for a chapter

    const chapterObj: QuizChapter = {
      id: chapterId,
      name: chapterName,
      description: chapterDescription,
      questions,
      totalQuestions: 0,
      answeredQuestions: 0,
      correctAnswers: 0,
      isCompleted: false,
    };
    recalculateChapterStats(chapterObj);
    chapters.push(chapterObj);
    console.log(
      `Successfully parsed chapter: ${chapterName} (ID: ${chapterId}) with ${questions.length} questions.`,
    );
  } // End of chapters loop

  if (chapters.length === 0 && errors.filter((e) => e.startsWith('[Error]')).length === 0) {
    errors.push('[Warning] No valid chapters found in the Markdown file after module header.');
  }

  const quizModule: QuizModule = {
    name: moduleName,
    description: moduleDescription,
    chapters,
  };

  const finalValidation = validateQuizModule(quizModule);
  if (!finalValidation.isValid) {
    errors.push(...finalValidation.errors.map((e) => `[Post-Validation Error] ${e}`));
  }

  console.log(`=== Markdown Parsing Complete ===`);
  console.log(`Total errors/warnings: ${errors.length}`);
  errors.forEach((err) => console.log(err));

  return {
    success: errors.filter((e) => e.startsWith('[Error]')).length === 0,
    quizModule: normalizeQuizModule(quizModule),
    errors,
  };
}
