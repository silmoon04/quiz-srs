import type { QuizOption } from '@/types/quiz-types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

type AnyObject = Record<string, unknown>;

export function validateQuizModule(data: unknown): ValidationResult {
    const d = data as AnyObject;
    const errors: string[] = [];
    if (!d || typeof d !== 'object') {
        return { isValid: false, errors: ['Invalid JSON: Expected an object'] };
    }
    if (typeof d.name !== 'string' || d.name.trim() === '') {
        errors.push("Missing or invalid 'name' property (must be non-empty string)");
    }
    if (d.description !== undefined && typeof d.description !== 'string') {
        errors.push("Invalid 'description' property (must be string if provided)");
    }
    if (!Array.isArray(d.chapters)) {
        errors.push("Missing or invalid 'chapters' property (must be array)");
    } else {
        if (d.chapters.length === 0) {
            errors.push("'chapters' array cannot be empty");
        }

        // Check for duplicate chapter IDs
        const seenChapterIds = new Set<string>();
        (d.chapters as unknown[]).forEach((ch: unknown, chapterIndex: number) => {
            const chapter = ch as AnyObject;
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

        // Require at least one question across the module, but allow empty chapters.
        const totalQuestions = (d.chapters as unknown[]).reduce((sum: number, ch: unknown) => {
            const chap = ch as AnyObject;
            const qCount = Array.isArray(chap?.questions) ? chap.questions.length : 0;
            return sum + qCount;
        }, 0);
        if (totalQuestions === 0) {
            errors.push('Quiz module must contain at least one question');
        }

        // Check for duplicate question IDs across all chapters
        const seenQuestionIds = new Map<string, string>(); // questionId -> chapterId
        (d.chapters as unknown[]).forEach((ch: unknown) => {
            const chapter = ch as AnyObject;
            if (chapter?.questions && Array.isArray(chapter.questions)) {
                (chapter.questions as unknown[]).forEach((q: unknown, qIndex: number) => {
                    const question = q as AnyObject;
                    if (question?.questionId && typeof question.questionId === 'string') {
                        const existingChapter = seenQuestionIds.get(question.questionId);
                        if (existingChapter) {
                            errors.push(
                                `Duplicate question ID found: '${question.questionId}' appears in both chapter '${existingChapter}' and '${chapter.id || 'Unknown'}'. Each question must have a unique ID across the entire quiz module.`,
                            );
                        } else {
                            seenQuestionIds.set(question.questionId, (chapter.id as string) || 'Unknown');
                        }
                    }
                });
            }
        });
    }
    return { isValid: errors.length === 0, errors };
}

function validateChapter(chapter: unknown, index: number): string[] {
    const c = chapter as AnyObject;
    const errors: string[] = [];
    const prefix = `Chapter ${index + 1} (ID: ${c?.id || 'Unknown'})`;
    if (!c || typeof c !== 'object') {
        errors.push(`${prefix}: Expected an object`);
        return errors;
    }
    if (typeof c.id !== 'string' || (c.id as string).trim() === '') {
        errors.push(`${prefix}: Missing or invalid 'id' property (must be non-empty string)`);
    }
    const chapterName = c.name ?? c.title;
    if (typeof chapterName !== 'string' || (chapterName as string).trim() === '') {
        errors.push(
            `${prefix}: Missing or invalid 'name' property (must be non-empty string) (also accepts legacy 'title')`,
        );
    }
    if (c.description !== undefined && typeof c.description !== 'string') {
        errors.push(`${prefix}: Invalid 'description' property (must be string if provided)`);
    }
    if (!Array.isArray(c.questions)) {
        errors.push(`${prefix}: Missing or invalid 'questions' property (must be array)`);
    } else {
        (c.questions as unknown[]).forEach((question: unknown, questionIndex: number) => {
            errors.push(...validateQuestion(question, (c.id as string) || `chap${index}`, questionIndex));
        });
    }
    return errors;
}

function validateQuestion(question: unknown, chapterId: string, questionIndex: number): string[] {
    const q = question as AnyObject;
    const errors: string[] = [];
    const prefix = `Chapter (ID: ${chapterId}), Question ${questionIndex + 1} (ID: ${q?.questionId || 'Unknown'})`;
    if (!q || typeof q !== 'object') {
        errors.push(`${prefix}: Expected an object`);
        return errors;
    }
    if (typeof q.questionId !== 'string' || q.questionId.trim() === '') {
        errors.push(`${prefix}: Missing or invalid 'questionId' property (must be non-empty string)`);
    }
    if (typeof q.questionText !== 'string' || q.questionText.trim() === '') {
        errors.push(`${prefix}: Missing or invalid 'questionText' property (must be non-empty string)`);
    }
    // explanationText is optional for some rendering-focused fixtures.
    // Accept legacy 'explanation' too.
    const explanation = q.explanationText ?? q.explanation;
    if (explanation !== undefined && typeof explanation !== 'string') {
        errors.push(`${prefix}: Invalid explanation field (must be string if provided)`);
    }

    // Validate 'type' field
    if (q.type !== undefined && q.type !== 'mcq' && q.type !== 'true_false') {
        errors.push(`${prefix}: Invalid 'type' property (must be 'mcq' or 'true_false' if provided)`);
    }

    if (!Array.isArray(q.options)) {
        errors.push(`${prefix}: Missing or invalid 'options' property (must be array)`);
    } else {
        if (q.options.length === 0) {
            errors.push(`${prefix}: 'options' array cannot be empty`);
        }
        // For T/F questions, specific option validation
        if (q.type === 'true_false') {
            if (
                q.options.length !== 2 ||
                !(q.options as unknown[]).find(
                    (opt: unknown) =>
                        (opt as QuizOption).optionId === 'true' &&
                        (opt as QuizOption).optionText === 'True',
                ) ||
                !(q.options as unknown[]).find(
                    (opt: unknown) =>
                        (opt as QuizOption).optionId === 'false' &&
                        (opt as QuizOption).optionText === 'False',
                )
            ) {
                errors.push(
                    `${prefix}: For 'true_false' type, options must be exactly [{optionId: "true", optionText: "True"}, {optionId: "false", optionText: "False"}]`,
                );
            }
        } else {
            // Existing option validation for MCQs
            (q.options as unknown[]).forEach((opt: unknown, optionIndex: number) => {
                const option = opt as AnyObject;
                if (!option || typeof option !== 'object') {
                    errors.push(`${prefix}, Option ${optionIndex + 1}: Expected an object`);
                    return;
                }
                if (typeof option.optionId !== 'string' || (option.optionId as string).trim() === '') {
                    errors.push(
                        `${prefix}, Option ${optionIndex + 1}: Missing or invalid 'optionId' (must be non-empty string)`,
                    );
                }
                if (
                    typeof option.optionText !== 'string' ||
                    (option.optionText as string).trim() === ''
                ) {
                    errors.push(
                        `${prefix}, Option ${optionIndex + 1}: Missing or invalid 'optionText' (must be non-empty string)`,
                    );
                }
            });
        }
    }
    if (!Array.isArray(q.correctOptionIds)) {
        errors.push(`${prefix}: Missing or invalid 'correctOptionIds' property (must be array)`);
    } else {
        if (q.correctOptionIds.length === 0) {
            errors.push(`${prefix}: 'correctOptionIds' array cannot be empty`);
        }
        // For T/F questions, specific correctOptionIds validation
        if (q.type === 'true_false') {
            if (
                q.correctOptionIds.length !== 1 ||
                (q.correctOptionIds[0] !== 'true' && q.correctOptionIds[0] !== 'false')
            ) {
                errors.push(
                    `${prefix}: For 'true_false' type, correctOptionIds must be an array with a single string: 'true' or 'false'.`,
                );
            }
        } else if (Array.isArray(q.options) && q.options.length > 0) {
            // Existing correctOptionIds validation for MCQs
            const optionIds = (q.options as unknown[])
                .filter((opt: unknown) => opt && typeof (opt as AnyObject).optionId === 'string')
                .map((opt: unknown) => (opt as AnyObject).optionId);
            (q.correctOptionIds as unknown[]).forEach((correctId: unknown, correctIdx: number) => {
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

export function validateSingleQuestion(data: unknown): ValidationResult {
    const d = data as AnyObject;
    const errors: string[] = [];
    if (!d || typeof d !== 'object') {
        return { isValid: false, errors: ['Expected a question object'] };
    }
    // Simplified validation, assuming main validateQuestion covers details
    if (typeof d.questionId !== 'string' || !d.questionId.trim())
        errors.push("Missing or invalid 'questionId'");
    if (typeof d.questionText !== 'string' || !d.questionText.trim())
        errors.push("Missing or invalid 'questionText'");
    if (typeof d.explanationText !== 'string' || !d.explanationText.trim())
        errors.push("Missing or invalid 'explanationText'");

    if (d.type !== undefined && d.type !== 'mcq' && d.type !== 'true_false') {
        errors.push("Invalid 'type' property (must be 'mcq' or 'true_false' if provided)");
    }

    if (!Array.isArray(d.options) || d.options.length === 0)
        errors.push("Missing or invalid 'options' array");
    else {
        if (d.type === 'true_false') {
            if (
                d.options.length !== 2 ||
                !(d.options as unknown[]).find(
                    (opt: unknown) =>
                        (opt as QuizOption).optionId === 'true' &&
                        (opt as QuizOption).optionText === 'True',
                ) ||
                !(d.options as unknown[]).find(
                    (opt: unknown) =>
                        (opt as QuizOption).optionId === 'false' &&
                        (opt as QuizOption).optionText === 'False',
                )
            ) {
                errors.push(
                    `For 'true_false' type, options must be exactly [{optionId: "true", optionText: "True"}, {optionId: "false", optionText: "False"}]`,
                );
            }
        } else {
            (d.options as unknown[]).forEach((o: unknown, i: number) => {
                const opt = o as AnyObject;
                if (!opt || typeof opt.optionId !== 'string' || !opt.optionId.trim())
                    errors.push(`Option ${i + 1} has invalid 'optionId'`);
                if (!opt || typeof opt.optionText !== 'string' || !opt.optionText.trim())
                    errors.push(`Option ${i + 1} has invalid 'optionText'`);
            });
        }
    }
    if (!Array.isArray(d.correctOptionIds) || d.correctOptionIds.length === 0)
        errors.push("Missing or invalid 'correctOptionIds' array");
    else {
        if (d.type === 'true_false') {
            if (
                d.correctOptionIds.length !== 1 ||
                (d.correctOptionIds[0] !== 'true' && d.correctOptionIds[0] !== 'false')
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
