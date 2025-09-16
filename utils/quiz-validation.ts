import type { QuizModule, QuizQuestion, QuizChapter, QuizOption } from "@/types/quiz-types"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// NEW: LaTeX Correction Utilities
interface LaTeXCorrectionResult {
  correctedContent: string
  correctionsMade: number
  correctionDetails: string[]
}

/**
 * Automatically detects and corrects common LaTeX formatting errors in JSON content
 * Specifically handles single backslash issues and other common problems
 */
export function correctLatexInJsonContent(jsonContent: string): LaTeXCorrectionResult {
  console.log("=== Starting LaTeX Correction Process ===")

  let correctedContent = jsonContent
  let correctionsMade = 0
  const correctionDetails: string[] = []

  // Common LaTeX commands that should have double backslashes
  const latexCommands = [
    "frac",
    "sqrt",
    "sum",
    "int",
    "lim",
    "log",
    "ln",
    "sin",
    "cos",
    "tan",
    "alpha",
    "beta",
    "gamma",
    "delta",
    "epsilon",
    "theta",
    "lambda",
    "mu",
    "pi",
    "sigma",
    "phi",
    "psi",
    "omega",
    "infty",
    "partial",
    "nabla",
    "times",
    "cdot",
    "div",
    "pm",
    "mp",
    "neq",
    "leq",
    "geq",
    "approx",
    "equiv",
    "propto",
    "subset",
    "supset",
    "in",
    "notin",
    "cap",
    "cup",
    "land",
    "lor",
    "neg",
    "rightarrow",
    "leftarrow",
    "leftrightarrow",
    "Rightarrow",
    "Leftarrow",
    "Leftrightarrow",
    "uparrow",
    "downarrow",
    "lceil",
    "rceil",
    "lfloor",
    "rfloor",
    "left",
    "right",
    "big",
    "Big",
    "bigg",
    "Bigg",
    "mathbb",
    "mathcal",
    "mathfrak",
    "mathbf",
    "mathrm",
    "text",
    "textbf",
    "textit",
    "emph",
    "boldsymbol",
    "overline",
    "underline",
  ]

  // Pattern to find LaTeX expressions within JSON strings
  // This looks for content that appears to be LaTeX (contains backslashes and math symbols)
  const latexContextPattern = /("(?:[^"\\]|\\.)*\\[^"\\]*(?:\\[^"\\]*)*[^"\\]*")/g

  // Find all potential LaTeX contexts in the JSON
  const latexMatches = correctedContent.match(latexContextPattern) || []

  console.log(`Found ${latexMatches.length} potential LaTeX contexts`)

  latexMatches.forEach((match, index) => {
    const originalMatch = match
    let correctedMatch = match

    // Remove the surrounding quotes for processing
    let content = match.slice(1, -1)
    const originalContent = content

    // 1. Fix single backslashes before known LaTeX commands
    latexCommands.forEach((command) => {
      const singleBackslashPattern = new RegExp(`(?<!\\\\)\\\\${command}\\b`, "g")
      const beforeReplace = content
      content = content.replace(singleBackslashPattern, `\\\\${command}`)

      if (content !== beforeReplace) {
        correctionsMade++
        correctionDetails.push(`Fixed \\${command} → \\\\${command}`)
        console.log(`Corrected: \\${command} → \\\\${command}`)
      }
    })

    // 2. Fix common LaTeX syntax patterns
    const commonFixes = [
      // Fix \{ and \} (should be \\{ and \\})
      { pattern: /(?<!\\)\\{/g, replacement: "\\\\{", description: "\\{ → \\\\{" },
      { pattern: /(?<!\\)\\}/g, replacement: "\\\\}", description: "\\} → \\\\}" },

      // Fix single backslash before common symbols
      { pattern: /(?<!\\)\\([&%$#_^~])/g, replacement: "\\\\$1", description: "Fixed escaped symbols" },

      // Fix display math delimiters if they appear escaped incorrectly
      { pattern: /(?<!\\)\\\[/g, replacement: "\\\\[", description: "\\[ → \\\\[" },
      { pattern: /(?<!\\)\\\]/g, replacement: "\\\\]", description: "\\] → \\\\]" },

      // Fix common spacing commands
      { pattern: /(?<!\\)\\quad\b/g, replacement: "\\\\quad", description: "\\quad → \\\\quad" },
      { pattern: /(?<!\\)\\qquad\b/g, replacement: "\\\\qquad", description: "\\qquad → \\\\qquad" },
      { pattern: /(?<!\\)\\,/g, replacement: "\\\\,", description: "\\, → \\\\," },
      { pattern: /(?<!\\)\\;/g, replacement: "\\\\;", description: "\\; → \\\\;" },
      { pattern: /(?<!\\)\\!/g, replacement: "\\\\!", description: "\\! → \\\\!" },
    ]

    commonFixes.forEach((fix) => {
      const beforeFix = content
      content = content.replace(fix.pattern, fix.replacement)

      if (content !== beforeFix) {
        correctionsMade++
        correctionDetails.push(fix.description)
        console.log(`Applied fix: ${fix.description}`)
      }
    })

    // 3. Handle specific mathematical constructs
    // Fix \begin{} and \end{} environments
    const environmentPattern = /(?<!\\)\\(begin|end){([^}]+)}/g
    content = content.replace(environmentPattern, (match, command, env) => {
      correctionsMade++
      correctionDetails.push(`Fixed \\${command}{${env}} → \\\\${command}{${env}}`)
      return `\\\\${command}{${env}}`
    })

    // 4. Fix subscripts and superscripts if they have single backslashes
    const scriptPattern = /(?<!\\)\\(_|\\^)/g
    content = content.replace(scriptPattern, (match, symbol) => {
      correctionsMade++
      correctionDetails.push(`Fixed \\${symbol} → \\\\${symbol}`)
      return `\\\\${symbol}`
    })

    // If content was modified, update the match
    if (content !== originalContent) {
      correctedMatch = `"${content}"`
      console.log(`Content corrected in context ${index + 1}`)
      console.log(`  Before: ${originalContent.substring(0, 100)}...`)
      console.log(`  After:  ${content.substring(0, 100)}...`)
    }

    // Replace the original match with the corrected version
    if (correctedMatch !== originalMatch) {
      correctedContent = correctedContent.replace(originalMatch, correctedMatch)
    }
  })

  // 5. Additional JSON-level corrections
  // Fix any remaining obvious single backslash issues that might have been missed
  const additionalFixes = [
    // Fix common cases where backslashes might be at word boundaries
    {
      pattern:
        /"([^"]*?)(?<!\\)\\(alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega)([^"]*?)"/g,
      replacement: '"$1\\\\$2$3"',
      description: "Fixed Greek letters",
    },

    // Fix \cdot, \times, etc. that might be missed
    {
      pattern: /"([^"]*?)(?<!\\)\\(cdot|times|div|pm|mp)([^"]*?)"/g,
      replacement: '"$1\\\\$2$3"',
      description: "Fixed operators",
    },
  ]

  additionalFixes.forEach((fix) => {
    const beforeFix = correctedContent
    correctedContent = correctedContent.replace(fix.pattern, fix.replacement)

    if (correctedContent !== beforeFix) {
      correctionsMade++
      correctionDetails.push(fix.description)
      console.log(`Applied additional fix: ${fix.description}`)
    }
  })

  console.log(`=== LaTeX Correction Complete ===`)
  console.log(`Total corrections made: ${correctionsMade}`)

  return {
    correctedContent,
    correctionsMade,
    correctionDetails,
  }
}

/**
 * Validates and corrects LaTeX in quiz module JSON before standard validation
 * This is the main entry point for LaTeX correction
 */
export function validateAndCorrectQuizModule(data: any): {
  validationResult: ValidationResult
  correctionResult?: LaTeXCorrectionResult
  normalizedModule?: QuizModule
} {
  let jsonString: string
  let correctionResult: LaTeXCorrectionResult | undefined

  // Convert data to JSON string if it's not already
  if (typeof data === "string") {
    jsonString = data
  } else {
    jsonString = JSON.stringify(data, null, 2)
  }

  // Apply LaTeX corrections
  correctionResult = correctLatexInJsonContent(jsonString)

  // Parse the corrected JSON
  let correctedData: any
  try {
    correctedData = JSON.parse(correctionResult.correctedContent)
  } catch (parseError) {
    return {
      validationResult: {
        isValid: false,
        errors: [
          `Failed to parse corrected JSON: ${parseError instanceof Error ? parseError.message : "Unknown parse error"}`,
        ],
      },
      correctionResult,
    }
  }

  // Validate the corrected data
  const validationResult = validateQuizModule(correctedData)

  // If valid, also return the normalized module
  let normalizedModule: QuizModule | undefined
  if (validationResult.isValid) {
    normalizedModule = normalizeQuizModule(correctedData)
  }

  return {
    validationResult,
    correctionResult,
    normalizedModule,
  }
}

export function validateQuizModule(data: any): ValidationResult {
  const errors: string[] = []

  // Check if data is an object
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Invalid JSON: Expected an object"] }
  }

  // Check required top-level properties
  if (typeof data.name !== "string") {
    errors.push("Missing or invalid 'name' property (must be string)")
  }

  // Description is optional, but if present must be string
  if (data.description !== undefined && typeof data.description !== "string") {
    errors.push("Invalid 'description' property (must be string if provided)")
  }

  if (!Array.isArray(data.chapters)) {
    errors.push("Missing or invalid 'chapters' property (must be array)")
  } else {
    if (data.chapters.length === 0) {
      errors.push("'chapters' array cannot be empty")
    }

    // Validate each chapter
    data.chapters.forEach((chapter: any, chapterIndex: number) => {
      const chapterErrors = validateChapter(chapter, chapterIndex)
      errors.push(...chapterErrors)
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function validateChapter(chapter: any, index: number): string[] {
  const errors: string[] = []
  const prefix = `Chapter ${index + 1}`

  // Check if chapter is an object
  if (!chapter || typeof chapter !== "object") {
    errors.push(`${prefix}: Expected an object`)
    return errors
  }

  // Validate required properties
  if (typeof chapter.id !== "string") {
    errors.push(`${prefix}: Missing or invalid 'id' property (must be string)`)
  }

  if (typeof chapter.name !== "string") {
    errors.push(`${prefix}: Missing or invalid 'name' property (must be string)`)
  }

  // Description is optional, but if present must be string
  if (chapter.description !== undefined && typeof chapter.description !== "string") {
    errors.push(`${prefix}: Invalid 'description' property (must be string if provided)`)
  }

  // Validate questions array
  if (!Array.isArray(chapter.questions)) {
    errors.push(`${prefix}: Missing or invalid 'questions' property (must be array)`)
  } else {
    if (chapter.questions.length === 0) {
      errors.push(`${prefix}: 'questions' array cannot be empty`)
    }

    // Validate each question
    chapter.questions.forEach((question: any, questionIndex: number) => {
      const questionErrors = validateQuestion(question, index, questionIndex)
      errors.push(...questionErrors)
    })
  }

  // NOTE: We do NOT validate totalQuestions, answeredQuestions, correctAnswers, or isCompleted
  // These are computed fields that will be added by normalizeQuizModule()

  return errors
}

function validateQuestion(question: any, chapterIndex: number, questionIndex: number): string[] {
  const errors: string[] = []
  const prefix = `Chapter ${chapterIndex + 1}, Question ${questionIndex + 1}`

  // Check if question is an object
  if (!question || typeof question !== "object") {
    errors.push(`${prefix}: Expected an object`)
    return errors
  }

  // Validate required properties
  if (typeof question.questionId !== "string") {
    errors.push(`${prefix}: Missing or invalid 'questionId' property (must be string)`)
  }

  if (typeof question.questionText !== "string") {
    errors.push(`${prefix}: Missing or invalid 'questionText' property (must be string)`)
  }

  if (typeof question.explanationText !== "string") {
    errors.push(`${prefix}: Missing or invalid 'explanationText' property (must be string)`)
  }

  // Validate options array
  if (!Array.isArray(question.options)) {
    errors.push(`${prefix}: Missing or invalid 'options' property (must be array)`)
  } else {
    if (question.options.length === 0) {
      errors.push(`${prefix}: 'options' array cannot be empty`)
    }

    // Validate each option
    question.options.forEach((option: any, optionIndex: number) => {
      if (!option || typeof option !== "object") {
        errors.push(`${prefix}, Option ${optionIndex + 1}: Expected an object`)
        return
      }

      if (typeof option.optionId !== "string") {
        errors.push(`${prefix}, Option ${optionIndex + 1}: Missing or invalid 'optionId' property (must be string)`)
      }
      if (typeof option.optionText !== "string") {
        errors.push(`${prefix}, Option ${optionIndex + 1}: Missing or invalid 'optionText' property (must be string)`)
      }
    })
  }

  // Validate correctOptionIds array
  if (!Array.isArray(question.correctOptionIds)) {
    errors.push(`${prefix}: Missing or invalid 'correctOptionIds' property (must be array)`)
  } else {
    if (question.correctOptionIds.length === 0) {
      errors.push(`${prefix}: 'correctOptionIds' array cannot be empty`)
    }

    // Check that all correctOptionIds exist in options (only if options is valid)
    if (Array.isArray(question.options) && question.options.length > 0) {
      const optionIds = question.options
        .filter((opt: any) => opt && typeof opt.optionId === "string")
        .map((opt: any) => opt.optionId)

      question.correctOptionIds.forEach((correctId: any, correctIndex: number) => {
        if (typeof correctId !== "string") {
          errors.push(`${prefix}: correctOptionIds[${correctIndex}] must be a string, got: ${typeof correctId}`)
        } else if (optionIds.length > 0 && !optionIds.includes(correctId)) {
          errors.push(`${prefix}: correctOptionId '${correctId}' not found in options`)
        }
      })
    }
  }

  // NOTE: We do NOT validate performance tracking fields like status, timesAnsweredCorrectly, etc.
  // These are optional and will be initialized by normalizeQuizModule() if not present

  return errors
}

// NEW: Validate a single question (for in-session import)
export function validateSingleQuestion(data: any): ValidationResult {
  const errors: string[] = []

  // Check if question is an object
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Expected a question object"] }
  }

  // Validate required properties
  if (typeof data.questionId !== "string") {
    errors.push("Missing or invalid 'questionId' property (must be string)")
  }

  if (typeof data.questionText !== "string") {
    errors.push("Missing or invalid 'questionText' property (must be string)")
  }

  if (typeof data.explanationText !== "string") {
    errors.push("Missing or invalid 'explanationText' property (must be string)")
  }

  // Validate options array
  if (!Array.isArray(data.options)) {
    errors.push("Missing or invalid 'options' property (must be array)")
  } else {
    if (data.options.length === 0) {
      errors.push("'options' array cannot be empty")
    }

    // Validate each option
    data.options.forEach((option: any, optionIndex: number) => {
      if (!option || typeof option !== "object") {
        errors.push(`Option ${optionIndex + 1}: Expected an object`)
        return
      }

      if (typeof option.optionId !== "string") {
        errors.push(`Option ${optionIndex + 1}: Missing or invalid 'optionId' property (must be string)`)
      }
      if (typeof option.optionText !== "string") {
        errors.push(`Option ${optionIndex + 1}: Missing or invalid 'optionText' property (must be string)`)
      }
    })
  }

  // Validate correctOptionIds array
  if (!Array.isArray(data.correctOptionIds)) {
    errors.push("Missing or invalid 'correctOptionIds' property (must be array)")
  } else {
    if (data.correctOptionIds.length === 0) {
      errors.push("'correctOptionIds' array cannot be empty")
    }

    // Check that all correctOptionIds exist in options (only if options is valid)
    if (Array.isArray(data.options) && data.options.length > 0) {
      const optionIds = data.options
        .filter((opt: any) => opt && typeof opt.optionId === "string")
        .map((opt: any) => opt.optionId)

      data.correctOptionIds.forEach((correctId: any, correctIndex: number) => {
        if (typeof correctId !== "string") {
          errors.push(`correctOptionIds[${correctIndex}] must be a string, got: ${typeof correctId}`)
        } else if (optionIds.length > 0 && !optionIds.includes(correctId)) {
          errors.push(`correctOptionId '${correctId}' not found in options`)
        }
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// NEW: Normalize a single question (for in-session import)
export function normalizeSingleQuestion(data: QuizQuestion): QuizQuestion {
  return {
    ...data,
    // Initialize performance tracking fields if not present
    status: data.status || "not_attempted",
    timesAnsweredCorrectly: data.timesAnsweredCorrectly || 0,
    timesAnsweredIncorrectly: data.timesAnsweredIncorrectly || 0,
    historyOfIncorrectSelections: data.historyOfIncorrectSelections || [],
    lastSelectedOptionId: data.lastSelectedOptionId || undefined,
    lastAttemptedAt: data.lastAttemptedAt || undefined,
    // Initialize SRS fields if not present
    srsLevel: data.srsLevel || 0,
    nextReviewAt: data.nextReviewAt || null,
    shownIncorrectOptionIds: data.shownIncorrectOptionIds || [],
  }
}

export function normalizeQuizModule(data: any): QuizModule {
  // Ensure all chapters have computed properties and normalized questions
  const normalizedChapters = data.chapters.map((chapter: any) => {
    // Normalize questions first
    const normalizedQuestions = chapter.questions.map((question: any) => ({
      ...question,
      // Initialize performance tracking fields if not present
      status: question.status || "not_attempted",
      timesAnsweredCorrectly: question.timesAnsweredCorrectly || 0,
      timesAnsweredIncorrectly: question.timesAnsweredIncorrectly || 0,
      historyOfIncorrectSelections: question.historyOfIncorrectSelections || [],
      lastSelectedOptionId: question.lastSelectedOptionId || undefined,
      lastAttemptedAt: question.lastAttemptedAt || undefined,
      // Initialize SRS fields if not present
      srsLevel: question.srsLevel || 0,
      nextReviewAt: question.nextReviewAt || null,
      shownIncorrectOptionIds: question.shownIncorrectOptionIds || [],
    }))

    // Calculate chapter-level statistics based on questions
    const totalQuestions = normalizedQuestions.length
    const answeredQuestions = normalizedQuestions.filter((q: any) => q.status !== "not_attempted").length
    const correctAnswers = normalizedQuestions.filter((q: any) => (q.timesAnsweredCorrectly || 0) > 0).length
    const isCompleted = answeredQuestions === totalQuestions

    return {
      ...chapter,
      questions: normalizedQuestions,
      // Computed fields (override any existing values to ensure consistency)
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      isCompleted,
    }
  })

  return {
    ...data,
    chapters: normalizedChapters,
  }
}

// NEW: Helper function to recalculate chapter statistics
export function recalculateChapterStats(chapter: any) {
  const totalQuestions = chapter.questions.length
  const answeredQuestions = chapter.questions.filter((q: any) => q.status !== "not_attempted").length
  const correctAnswers = chapter.questions.filter((q: any) => (q.timesAnsweredCorrectly || 0) > 0).length
  const isCompleted = answeredQuestions === totalQuestions

  chapter.totalQuestions = totalQuestions
  chapter.answeredQuestions = answeredQuestions
  chapter.correctAnswers = correctAnswers
  chapter.isCompleted = isCompleted
}

// NEW: Markdown Quiz Parser
interface MarkdownParseResult {
  success: boolean
  quizModule?: QuizModule
  errors: string[]
}

/**
 * Parses a Markdown file formatted according to the MCQ Quiz specification
 * and converts it to a QuizModule structure
 */
export function parseMarkdownToQuizModule(markdownContent: string): MarkdownParseResult {
  console.log("=== Starting Enhanced Markdown Quiz Parsing ===")

  // Normalize line endings - handle both \r\n and \n
  const normalizedContent = markdownContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const lines = normalizedContent.split("\n")
  const errors: string[] = []
  let currentLineIndex = 0

  // Helper functions
  const peekLine = (): string | null => {
    return currentLineIndex < lines.length ? lines[currentLineIndex] : null
  }

  const consumeLine = (): string | null => {
    return currentLineIndex < lines.length ? lines[currentLineIndex++] : null
  }

  const extractIdFromComment = (line: string): string | null => {
    // Handle both formats: <!-- CH_ID: id --> and <!-- ID:id -->
    const match = line.match(/<!--\s*(?:Q_ID|CH_ID|ID):\s*([^-\s]+)\s*-->/)
    return match ? match[1] : null
  }

  const skipEmptyLines = () => {
    while (currentLineIndex < lines.length && (!lines[currentLineIndex] || lines[currentLineIndex].trim() === "")) {
      currentLineIndex++
    }
  }

  const cleanText = (text: string): string => {
    return text.replace(/\r/g, "").trim()
  }

  try {
    // Parse module header
    let line = consumeLine()
    if (!line || !line.startsWith("# ")) {
      errors.push("Expected module title starting with '# '")
      return { success: false, errors }
    }

    const moduleName = cleanText(line.substring(2))
    let moduleDescription = ""

    // Check for description line - handle both formats
    line = peekLine()
    if (line && line.startsWith("Description:")) {
      moduleDescription = cleanText(consumeLine()!.substring(12))
    } else if (line && line.startsWith("_") && line.endsWith("_")) {
      // Handle _description_ format
      moduleDescription = cleanText(consumeLine()!.slice(1, -1))
    }

    // Skip empty lines and find the separator
    skipEmptyLines()
    line = consumeLine()
    if (line !== "---") {
      console.log(`Warning: Expected '---' after module header, found: "${line}"`)
    }

    const chapters: QuizChapter[] = []

    // Parse chapters
    while (currentLineIndex < lines.length) {
      skipEmptyLines()
      line = peekLine()
      if (!line) break

      if (!line.startsWith("## ")) {
        consumeLine()
        continue
      }

      // Parse chapter
      line = consumeLine()!
      console.log(`Parsing chapter line: ${line}`)

      // Extract chapter name (remove any inline comments)
      const chapterName = cleanText(line.substring(3).replace(/<!--.*?-->/, ""))

      // Check if there's an ID comment on the same line
      let chapterId = extractIdFromComment(line)

      // If no ID on same line, check next line for ID comment
      if (!chapterId) {
        const nextLine = peekLine()
        if (nextLine && nextLine.trim().startsWith("<!--")) {
          chapterId = extractIdFromComment(nextLine)
          if (chapterId) {
            consumeLine() // consume the ID comment line
          }
        }
      }

      // Generate default ID if none found
      if (!chapterId) {
        chapterId = `chapter_${chapters.length + 1}`
      }

      let chapterDescription = ""

      // Check for chapter description
      line = peekLine()
      if (line && line.startsWith("Description:")) {
        chapterDescription = cleanText(consumeLine()!.substring(12))
      }

      // Skip empty lines and separator
      skipEmptyLines()
      line = consumeLine()
      if (line !== "---") {
        console.log(`Warning: Expected '---' after chapter header, found: "${line}"`)
      }

      const questions: QuizQuestion[] = []

      // Parse questions in this chapter
      while (currentLineIndex < lines.length) {
        skipEmptyLines()
        line = peekLine()
        if (!line) break

        if (line.startsWith("## ")) {
          break // Next chapter
        }

        if (!line.startsWith("### Q: ")) {
          consumeLine()
          continue
        }

        // Parse question
        line = consumeLine()!
        console.log(`Parsing question line: ${line}`)

        // Extract question text and ID
        let questionText = cleanText(line.substring(7).replace(/<!--.*?-->/, ""))
        let questionId = extractIdFromComment(line)

        // If no ID on same line, check next line for ID comment
        if (!questionId) {
          const nextLine = peekLine()
          if (nextLine && nextLine.trim().startsWith("<!--")) {
            questionId = extractIdFromComment(nextLine)
            if (questionId) {
              consumeLine() // consume the ID comment line
            }
          }
        }

        // Generate default ID if none found
        if (!questionId) {
          questionId = `q_${questions.length + 1}`
        }

        // Collect multi-line question text until we hit options or empty line
        while (currentLineIndex < lines.length) {
          line = peekLine()
          if (!line || line.trim() === "" || line.startsWith("**Options:**") || line.startsWith("**Opt:**")) {
            break
          }
          questionText += "\n" + cleanText(consumeLine()!)
        }

        // Skip empty lines before options
        skipEmptyLines()

        // Parse options - handle both formats
        line = consumeLine()
        const isOptionsFormat = line && (line.trim() === "**Options:**" || line.trim() === "**Opt:**")

        if (!isOptionsFormat) {
          errors.push(`Expected '**Options:**' or '**Opt:**' for question ${questionId}, found: "${line}"`)
          continue
        }

        const options: QuizOption[] = []
        const optionLabelToIdMap: Record<string, string> = {}
        let optionCounter = 1

        // Handle both option formats
        while (currentLineIndex < lines.length) {
          line = peekLine()
          if (!line) break

          // Format 1: **A1:** text
          let optionMatch = line.match(/^\*\*A(\d+):\*\* (.+)$/)

          // Format 2: - **A1:** text
          if (!optionMatch) {
            optionMatch = line.match(/^-\s*\*\*A(\d+):\*\* (.+)$/)
          }

          if (!optionMatch) {
            // Check if we've hit the next section
            if (
              line.startsWith("**Correct:**") ||
              line.startsWith("**Ans:**") ||
              line.startsWith("**Exp:**") ||
              line.trim() === ""
            ) {
              break
            }
            consumeLine() // Skip unrecognized lines
            continue
          }

          consumeLine() // Consume the option line
          const optionLabel = `A${optionMatch[1]}`
          const optionId = `${questionId}_opt${optionCounter++}`
          let optionText = cleanText(optionMatch[2])

          // Collect multi-line option text
          while (currentLineIndex < lines.length) {
            const nextLine = peekLine()
            if (
              !nextLine ||
              nextLine.startsWith("**A") ||
              nextLine.startsWith("- **A") ||
              nextLine.startsWith("**Correct:**") ||
              nextLine.startsWith("**Ans:**") ||
              nextLine.startsWith("**Exp:**") ||
              nextLine.trim() === ""
            ) {
              break
            }
            optionText += "\n" + cleanText(consumeLine()!)
          }

          options.push({ optionId, optionText })
          optionLabelToIdMap[optionLabel] = optionId
        }

        if (options.length === 0) {
          errors.push(`No options found for question ${questionId}`)
          continue
        }

        // Skip empty lines before correct answers
        skipEmptyLines()

        // Parse correct answers - handle both formats
        line = consumeLine()
        const isCorrectFormat = line && (line.startsWith("**Correct:**") || line.startsWith("**Ans:**"))

        if (!isCorrectFormat) {
          errors.push(`Expected '**Correct:**' or '**Ans:**' for question ${questionId}, found: "${line}"`)
          continue
        }

        const correctSection = line.startsWith("**Correct:**") ? line.substring(12) : line.substring(8)
        const correctLabels = correctSection
          .trim()
          .split(",")
          .map((l) => l.trim())
          .filter((l) => l.length > 0)

        const correctOptionIds = correctLabels.map((label) => optionLabelToIdMap[label]).filter(Boolean)

        if (correctOptionIds.length === 0) {
          errors.push(
            `No valid correct answers found for question ${questionId}. Labels: ${correctLabels.join(", ")}, Available: ${Object.keys(optionLabelToIdMap).join(", ")}`,
          )
          continue
        }

        // Skip empty lines before explanation
        skipEmptyLines()

        // Parse explanation
        line = consumeLine()
        if (!line || line.trim() !== "**Exp:**") {
          errors.push(`Expected '**Exp:**' for question ${questionId}, found: "${line}"`)
          continue
        }

        let explanationText = ""
        while (currentLineIndex < lines.length) {
          line = peekLine()
          if (!line || line === "---" || line.startsWith("### Q: ") || line.startsWith("## ")) {
            break
          }

          if (explanationText) explanationText += "\n"
          explanationText += cleanText(consumeLine()!)
        }

        // Skip separator if present
        skipEmptyLines()
        line = peekLine()
        if (line === "---") {
          consumeLine()
        }

        // Create question object
        const question: QuizQuestion = {
          questionId,
          questionText: questionText.trim(),
          options,
          correctOptionIds,
          explanationText: explanationText.trim(),
          status: "not_attempted",
          timesAnsweredCorrectly: 0,
          timesAnsweredIncorrectly: 0,
          historyOfIncorrectSelections: [],
          lastSelectedOptionId: undefined,
          lastAttemptedAt: undefined,
          srsLevel: 0,
          nextReviewAt: null,
          shownIncorrectOptionIds: [],
        }

        questions.push(question)
        console.log(`Successfully parsed question: ${questionId} with ${options.length} options`)
      }

      // Create chapter object and calculate stats
      const chapter: QuizChapter = {
        id: chapterId,
        name: chapterName,
        description: chapterDescription,
        questions,
        totalQuestions: questions.length,
        answeredQuestions: 0,
        correctAnswers: 0,
        isCompleted: false,
      }

      chapters.push(chapter)
      console.log(`Successfully parsed chapter: ${chapterName} with ${questions.length} questions`)
    }

    if (chapters.length === 0) {
      errors.push("No chapters found in the Markdown file")
      return { success: false, errors }
    }

    const quizModule: QuizModule = {
      name: moduleName,
      description: moduleDescription,
      chapters,
    }

    console.log(`Successfully parsed Markdown: ${moduleName} with ${chapters.length} chapters`)
    return { success: true, quizModule, errors }
  } catch (error) {
    console.error("Error parsing Markdown:", error)
    errors.push(`Parse error: ${error instanceof Error ? error.message : "Unknown error"}`)
    return { success: false, errors }
  }
}

/**
 * Test function for the markdown parser
 */
export function testMarkdownParser() {
  console.log("=== Running Markdown Parser Tests ===")

  // Test 1: Your original format
  const test1Content = `# Module: Algorithms and Data Structures - Comprehensive MCQ Review
Description: A comprehensive set of 100 MCQs covering core concepts in algorithms, complexity, sorting, formal languages, and computability, designed for deep understanding and exam preparation.

---
## Chapter: Chapter 1: Fundamentals of Algorithms & Complexity <!-- CH_ID: ch_fundamentals_1 -->
Description: Focuses on the definition of algorithms, their properties, methods of description, and basic concepts of computational complexity.

---
### Q: Which of the following is considered one of the most foundational properties of an algorithm as discussed in classical computer science definitions, such as those by Markov or Knuth? (Select any one of the core properties.) <!-- Q_ID: ch_fundamentals_1_q1 -->

**Options:**
**A1:** <b>Finiteness</b>: An algorithm must always terminate after a finite number of steps.
**A2:** <b>Definiteness</b>: Each step of an algorithm must be precisely defined; the actions to be carried out must be rigorously and unambiguously specified for each case.
**A3:** <b>Input</b>: An algorithm has zero or more quantities that are externally supplied.
**A4:** <b>Output</b>: An algorithm has at least one quantity that is produced.
**A5:** <b>Effectiveness</b>: All of the operations to be performed in the algorithm must be sufficiently basic that they can, in principle, be done exactly and in a finite length of time by a human using pencil and paper.

**Correct:** A1, A2, A5

**Exp:**
The most foundational properties typically cited are <b>Finiteness</b>, <b>Definiteness</b>, and <b>Effectiveness</b>. Selecting any one of these would identify a core foundational property.
---`

  // Test 2: Simple format
  const test2Content = `# Quiz Title
_Optional description_
---
## Chapter Name <!-- ID:chapter_id -->
---
### Q: What is 2+2? <!-- ID:q1 -->

**Opt:**
- **A1:** 3
- **A2:** 4
- **A3:** 5

**Ans:** A2

**Exp:** 2+2 equals 4.
---`

  console.log("Testing format 1 (your original)...")
  const result1 = parseMarkdownToQuizModule(test1Content)
  console.log("Result 1:", result1)

  console.log("Testing format 2 (simple)...")
  const result2 = parseMarkdownToQuizModule(test2Content)
  console.log("Result 2:", result2)

  return { result1, result2 }
}
