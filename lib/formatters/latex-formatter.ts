
export interface LaTeXCorrectionResult {
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
