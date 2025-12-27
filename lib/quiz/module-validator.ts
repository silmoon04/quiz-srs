import { QuizModule } from '@/types/quiz-types';
import {
    correctLatexInJsonContent,
    LaTeXCorrectionResult,
} from '@/lib/formatters/latex-formatter';
import { validateQuizModule, ValidationResult } from '@/lib/validators/schema-validator';
import { normalizeQuizModule } from '@/lib/validators/normalization';

export function validateAndCorrectQuizModule(data: unknown): {
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

    let correctedData: unknown;
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
