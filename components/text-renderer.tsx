"use client"

import { useEffect, useRef, useState, memo } from "react"
import "katex/dist/katex.min.css"
import mermaid from "mermaid"

interface TextRendererProps {
  content: string
  className?: string
}

// Define syntax highlighting rules
const javaKeywords = [
  "abstract",
  "assert",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "default",
  "do",
  "double",
  "else",
  "enum",
  "extends",
  "final",
  "finally",
  "float",
  "for",
  "goto",
  "if",
  "implements",
  "import",
  "instanceof",
  "int",
  "interface",
  "long",
  "native",
  "new",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "strictfp",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "try",
  "void",
  "volatile",
  "while",
  "true",
  "false",
  "null",
]

const pseudocodeKeywords = [
  "ALGORITHM",
  "BEGIN",
  "END",
  "PROCEDURE",
  "FUNCTION",
  "IF",
  "THEN",
  "ELSE",
  "ELSIF",
  "ENDIF",
  "FOR",
  "TO",
  "DOWNTO",
  "STEP",
  "ENDFOR",
  "WHILE",
  "ENDWHILE",
  "REPEAT",
  "UNTIL",
  "LOOP",
  "ENDLOOP",
  "INPUT",
  "OUTPUT",
  "PRINT",
  "READ",
  "WRITE",
  "DECLARE",
  "RETURN",
  "CALL",
  "AND",
  "OR",
  "NOT",
  "TRUE",
  "FALSE",
  "NULL",
  "SET",
  "GET",
  "ARRAY",
  "OF",
  "INTEGER",
  "REAL",
  "STRING",
  "BOOLEAN",
  "CHARACTER",
]

const javaTypes = ["String", "Integer", "Boolean", "Character", "Double", "Float", "Long", "Short", "Byte"]

// Enhanced syntax highlighting function
const highlightCode = (code: string, language?: string): string => {
  let highlighted = code

  // Escape HTML to prevent XSS and ensure our spans work correctly
  const escapeHtml = (unsafe: string) =>
    unsafe.replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[m] || m,
    )

  highlighted = escapeHtml(highlighted)

  // Apply highlighting based on language
  if (language === "java") {
    // Multi-line comments /* ... */
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>')

    // Single-line comments //
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>')

    // Strings (double and single quoted)
    highlighted = highlighted.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="code-string">$&</span>')

    // Numbers (integers, floats, hex, etc.)
    highlighted = highlighted.replace(
      /\b(0x[0-9a-fA-F]+|\d+\.?\d*[fFdD]?|\d+[lL]?)\b/g,
      '<span class="code-number">$1</span>',
    )

    // Java types
    const typeRegex = new RegExp(`\\b(${javaTypes.join("|")})\\b`, "g")
    highlighted = highlighted.replace(typeRegex, '<span class="code-type">$1</span>')

    // Class names (PascalCase after 'class', 'new', 'extends', 'implements')
    highlighted = highlighted.replace(
      /\b(class|new|extends|implements)\s+([A-Z][a-zA-Z0-9_]*)/g,
      '$1 <span class="code-class-name">$2</span>',
    )

    // Method calls (word followed by parenthesis)
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span class="code-function">$1</span>')

    // Keywords
    const keywordRegex = new RegExp(`\\b(${javaKeywords.join("|")})\\b`, "g")
    highlighted = highlighted.replace(keywordRegex, '<span class="code-keyword">$1</span>')

    // Operators
    highlighted = highlighted.replace(/([+\-*/%=<>!&|^~?:])/g, '<span class="code-operator">$1</span>')
  } else if (language === "pseudocode") {
    // Comments (usually // or # in pseudocode)
    highlighted = highlighted.replace(/(\/\/.*$|#.*$)/gm, '<span class="code-comment">$1</span>')

    // Strings
    highlighted = highlighted.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="code-string">$&</span>')

    // Numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$1</span>')

    // Function/Procedure names
    highlighted = highlighted.replace(
      /\b(PROCEDURE|FUNCTION|ALGORITHM)\s+([A-Z_][A-Z0-9_]*)/gi,
      '<span class="code-keyword">$1</span> <span class="code-function">$2</span>',
    )

    // Keywords (case insensitive for pseudocode)
    const keywordRegex = new RegExp(`\\b(${pseudocodeKeywords.join("|")})\\b`, "gi")
    highlighted = highlighted.replace(keywordRegex, '<span class="code-keyword">$1</span>')
  }

  return highlighted
}

// Interface for extracted elements
interface ExtractedElement {
  placeholder: string
  processedHtml: string
  type: "code" | "katex" | "mermaid" | "array"
}

// MEMOIZED: Prevent unnecessary re-renders when content hasn't changed
export const TextRenderer = memo(function TextRenderer({ content, className = "" }: TextRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [processedContent, setProcessedContent] = useState("")
  const [isKatexLoaded, setIsKatexLoaded] = useState(false)
  const [mermaidRendered, setMermaidRendered] = useState(false)

  // Load KaTeX once and keep it loaded
  useEffect(() => {
    const loadKaTeX = async () => {
      try {
        await import("katex")
        setIsKatexLoaded(true)
      } catch (error) {
        console.warn("KaTeX failed to load:", error)
        setIsKatexLoaded(false)
      }
    }
    loadKaTeX()
  }, [])

  // Mermaid rendering effect
  useEffect(() => {
    if (processedContent && !mermaidRendered && typeof window !== "undefined" && containerRef.current) {
      const mermaidElements = containerRef.current.querySelectorAll<HTMLElement>(".mermaid")

      if (mermaidElements.length > 0) {
        try {
          // Initialize Mermaid with dark theme support
          const isDarkMode =
            document.documentElement.classList.contains("dark") ||
            document.body.style.backgroundColor === "rgb(0, 0, 0)" ||
            getComputedStyle(document.body).backgroundColor === "rgb(0, 0, 0)"

          mermaid.initialize({
            startOnLoad: false,
            theme: isDarkMode ? "dark" : "default",
            securityLevel: "strict",
            fontFamily: "inherit",
            fontSize: 14,
            darkMode: isDarkMode,
            themeVariables: isDarkMode
              ? {
                  primaryColor: "#374151",
                  primaryTextColor: "#f9fafb",
                  primaryBorderColor: "#6b7280",
                  lineColor: "#9ca3af",
                  secondaryColor: "#1f2937",
                  tertiaryColor: "#111827",
                  background: "#000000",
                  mainBkg: "#1f2937",
                  secondBkg: "#374151",
                  tertiaryBkg: "#4b5563",
                }
              : {},
          })

          // Process each mermaid element
          mermaidElements.forEach((element, index) => {
            const id = `mermaid-${Date.now()}-${index}`
            element.id = id
          })

          mermaid
            .run({
              nodes: Array.from(mermaidElements),
            })
            .then(() => {
              console.log(`Mermaid rendered ${mermaidElements.length} diagrams`)
              setMermaidRendered(true)
            })
            .catch((error: any) => {
              console.error("Mermaid rendering error:", error)
              // Still mark as rendered to prevent infinite loops
              setMermaidRendered(true)
            })
        } catch (error) {
          console.error("Mermaid initialization error:", error)
          setMermaidRendered(true)
        }
      } else {
        setMermaidRendered(true)
      }
    }
  }, [processedContent, mermaidRendered])

  // Process content with proper order of operations
  useEffect(() => {
    const processAndRenderContent = async () => {
      try {
        console.log("TextRenderer: Starting phased content processing")
        console.log("Original content:", content.substring(0, 200) + "...")

        // Stage 1: Pre-computation & KaTeX Loading Check
        const extractedElements: ExtractedElement[] = []
        let blockIndex = 0
        let htmlContent = content

        setMermaidRendered(false)

        // Stage 2: Extract and Process Fenced Code Blocks (\`\`\`language\ncode\n\`\`\`)
        console.log("Stage 2: Processing fenced code blocks")
        htmlContent = htmlContent.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
          const placeholder = `__FENCED_CODE_BLOCK_${blockIndex}__`
          const lang = language || ""

          // Special handling for mermaid blocks
          if (lang === "mermaid") {
            const processedHtml = `<div class="mermaid">${code.trim()}</div>`
            extractedElements.push({ placeholder, processedHtml, type: "mermaid" })
            blockIndex++
            console.log(`Extracted Mermaid block: ${placeholder}`)
            return placeholder
          }

          // Special handling for array blocks
          if (lang === "array") {
            const itemsString = code.trim()
            let items = []
            let hasExplicitIndices = false

            // Check if using explicit index:value format
            if (itemsString.includes(":")) {
              try {
                const pairs = itemsString.split(",").map((pairStr) => pairStr.trim())
                items = pairs.map((pairStr) => {
                  const colonIndex = pairStr.indexOf(":")
                  if (colonIndex > 0) {
                    hasExplicitIndices = true
                    return {
                      index: pairStr.substring(0, colonIndex).trim(),
                      value: pairStr.substring(colonIndex + 1).trim(),
                    }
                  }
                  return { index: null, value: pairStr }
                })

                // If any item doesn't have an index, fall back to auto-indexing
                if (items.some((item) => item.index === null)) {
                  hasExplicitIndices = false
                }
              } catch (e) {
                hasExplicitIndices = false
              }
            }

            // Auto-index if not using explicit indices
            if (!hasExplicitIndices) {
              items = itemsString.split(",").map((value, idx) => ({
                index: idx.toString(),
                value: value.trim(),
              }))
            }

            // Generate array HTML
            let arrayHtml = '<div class="array-visualization">'
            items.forEach((item) => {
              const escapedValue = item.value.replace(
                /[&<>"']/g,
                (m) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[m] || m,
              )
              const escapedIndex = item.index.replace(
                /[&<>"']/g,
                (m) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[m] || m,
              )

              arrayHtml += `<div class="array-item">
                <div class="array-item-index">${escapedIndex}</div>
                <div class="array-item-value">${escapedValue}</div>
              </div>`
            })
            arrayHtml += "</div>"

            extractedElements.push({ placeholder, processedHtml: arrayHtml, type: "array" })
            blockIndex++
            console.log(`Extracted array block: ${placeholder}`)
            return placeholder
          }

          // Default code block handling
          const highlightedCode = highlightCode(code.trim(), lang)
          const processedHtml = `<pre><code class="language-${lang}">${highlightedCode}</code></pre>`
          extractedElements.push({ placeholder, processedHtml, type: "code" })
          blockIndex++
          console.log(`Extracted fenced code block (${lang}): ${placeholder}`)
          return placeholder
        })

        // Stage 3: Extract and Process Existing HTML <pre><code> Blocks
        console.log("Stage 3: Processing existing HTML pre/code blocks")
        htmlContent = htmlContent.replace(
          /<pre><code(?: class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g,
          (match, language, code) => {
            const placeholder = `__PRE_CODE_BLOCK_${blockIndex}__`
            const lang = language || ""

            // Decode HTML entities from the raw code content
            const decodedCode = code
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")

            const highlightedCode = highlightCode(decodedCode, lang)
            const processedHtml = `<pre><code class="language-${lang}">${highlightedCode}</code></pre>`

            extractedElements.push({ placeholder, processedHtml, type: "code" })
            blockIndex++

            console.log(`Extracted pre/code block (${lang}): ${placeholder}`)
            return placeholder
          },
        )

        // Stage 4: Extract KaTeX Blocks (Display and Inline)
        if (isKatexLoaded) {
          console.log("Stage 4: Processing KaTeX expressions")
          const katex = await import("katex")

          const katexOptions = {
            throwOnError: false,
            output: "html" as const,
            strict: false,
            trust: false,
            macros: {
              "\\neq": "\\ne",
              "\\ne": "\\not=",
            },
          }

          // Display Mode ($$...$$)
          htmlContent = htmlContent.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
            const placeholder = `__KATEX_DISPLAY_BLOCK_${blockIndex}__`
            try {
              console.log("Rendering display LaTeX:", latex.trim())
              const rendered = katex.renderToString(latex.trim(), {
                ...katexOptions,
                displayMode: true,
              })
              const processedHtml = `<div class="katex-display my-2 text-center">${rendered}</div>`
              extractedElements.push({ placeholder, processedHtml, type: "katex" })
              console.log(`Extracted display KaTeX: ${placeholder}`)
            } catch (err) {
              console.warn("Display LaTeX rendering error:", err, "for:", latex)
              const processedHtml = `<div class="katex-display my-2 text-center text-red-400">$$${latex}$$</div>`
              extractedElements.push({ placeholder, processedHtml, type: "katex" })
            }
            blockIndex++
            return placeholder
          })

          // Inline Mode ($...$) - Using more unique placeholder format
          htmlContent = htmlContent.replace(/(?<!\$)\$(?!\$)([^$]+)\$/g, (match, latex) => {
            const placeholder = `__KATEX_INLINE_EXPR_${blockIndex}__`
            try {
              console.log("Rendering inline LaTeX:", latex.trim())
              const rendered = katex.renderToString(latex.trim(), {
                ...katexOptions,
                displayMode: false,
              })
              const processedHtml = `<span class="katex-inline">${rendered}</span>`
              extractedElements.push({ placeholder, processedHtml, type: "katex" })
              console.log(`Extracted inline KaTeX: ${placeholder}`)
            } catch (err) {
              console.warn("Inline LaTeX rendering error:", err, "for:", latex)
              const processedHtml = `<span class="katex-inline text-red-400">$${latex}$</span>`
              extractedElements.push({ placeholder, processedHtml, type: "katex" })
            }
            blockIndex++
            return placeholder
          })
        }

        console.log("After Stage 4 - htmlContent sample:", htmlContent.substring(0, 300))

        // Stage 5: Basic Markdown Parsing with Improved Simple HTML Protection
        console.log("Stage 5: Processing Markdown with robust HTML protection")

        // IMPROVED: Split content by simple HTML tags and process segments separately
        const simpleHtmlRegex = /<\/?(b|i|em|strong|code|br)(?:\s[^>]*)?>/gi
        const segments: Array<{ type: "text" | "html"; content: string }> = []
        let lastIndex = 0
        let match

        // Reset regex lastIndex to ensure proper iteration
        simpleHtmlRegex.lastIndex = 0

        while ((match = simpleHtmlRegex.exec(htmlContent)) !== null) {
          // Add text segment before the HTML tag
          if (match.index > lastIndex) {
            const textContent = htmlContent.substring(lastIndex, match.index)
            if (textContent) {
              segments.push({ type: "text", content: textContent })
            }
          }

          // Add HTML tag segment
          segments.push({ type: "html", content: match[0] })
          lastIndex = match.index + match[0].length
        }

        // Add remaining text after last HTML tag
        if (lastIndex < htmlContent.length) {
          const remainingText = htmlContent.substring(lastIndex)
          if (remainingText) {
            segments.push({ type: "text", content: remainingText })
          }
        }

        console.log(`Split into ${segments.length} segments`)

        // Process only text segments with Markdown rules
        const processedSegments = segments.map((segment, index) => {
          if (segment.type === "html") {
            console.log(`Segment ${index} (HTML): ${segment.content}`)
            return segment.content
          }

          let textContent = segment.content
          console.log(`Segment ${index} (TEXT): ${textContent.substring(0, 100)}...`)

          // Apply Markdown Rules ONLY to text segments
          // Bold: **text** or __text__ (but avoid placeholder patterns)
          textContent = textContent.replace(/\*\*((?:[^*]|\*(?!\*))+)\*\*/g, "<strong>$1</strong>")
          // For __text__, ensure it doesn't match our placeholder patterns.
          // This rule allows underscores within the bolded content, like __foo_bar__.
          // It also checks word boundaries more carefully.
          textContent = textContent.replace(
            /(?<![\w_])__((?!KATEX_|FENCED_|PRE_)(?:(?!(?:__|\n))[\s\S])+?)__(?![\w_])/g,
            "<strong>$1</strong>",
          )

          // Italic: *text* or _text_ (but not if it's part of a ** or __ sequence)
          textContent = textContent.replace(/(?<![\w*])\*([^*\n]+)\*(?![\w*])/g, "<em>$1</em>")
          // Ensures underscores are not preceded/followed by a word character or another underscore.
          textContent = textContent.replace(/(?<![\w_])_([^_]+)_(?![\w_])/g, "<em>$1</em>")

          // Inline code: `code` (only if not already protected)
          textContent = textContent.replace(/`([^`\n]+)`/g, "<code>$1</code>")

          // Basic unordered lists: * item or - item (at start of line)
          textContent = textContent.replace(/^[\s]*[*-]\s+(.+)$/gm, "<li>$1</li>")
          // Wrap consecutive <li> blocks in <ul>
          textContent = textContent.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, "<ul>$1</ul>")

          // Basic ordered lists: 1. item (at start of line)
          textContent = textContent.replace(/^[\s]*\d+\.\s+(.+)$/gm, "<li>$1</li>")

          console.log(`Processed segment ${index}: ${textContent.substring(0, 100)}...`)
          return textContent
        })

        // Rejoin all segments
        const markdownProcessedHtml = processedSegments.join("")
        console.log("After Stage 5 - markdownProcessedHtml sample:", markdownProcessedHtml.substring(0, 300))

        // Stage 6: Final Reconstruction
        console.log("Stage 6: Final reconstruction")
        let finalHtml = markdownProcessedHtml

        // Replace placeholders with processed content (in reverse order to avoid conflicts)
        for (let i = extractedElements.length - 1; i >= 0; i--) {
          const element = extractedElements[i]
          const escapedPlaceholder = element.placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

          console.log(`Replacing placeholder: ${element.placeholder}`)
          console.log(`Looking for in text: ${finalHtml.includes(element.placeholder) ? "FOUND" : "NOT FOUND"}`)

          if (finalHtml.includes(element.placeholder)) {
            finalHtml = finalHtml.replace(new RegExp(escapedPlaceholder, "g"), element.processedHtml)
            console.log(`Successfully replaced: ${element.placeholder}`)
          } else {
            console.warn(`Placeholder not found in final HTML: ${element.placeholder}`)
          }
        }

        console.log("TextRenderer: Content processing complete")
        console.log("Final HTML sample:", finalHtml.substring(0, 300))
        setProcessedContent(finalHtml)
      } catch (error) {
        console.error("Content processing error:", error)
        setProcessedContent(content)
      }
    }

    processAndRenderContent()
  }, [content, isKatexLoaded])

  return (
    <div
      ref={containerRef}
      className={`${className} text-white prose prose-invert max-w-none`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
})
