/**
 * Codebase Analyzer - Maps file references, call stacks, and entry points
 *
 * This script provides comprehensive analysis for codebase refactoring:
 * - File reference mapping (where each file is imported)
 * - Function call stack analysis
 * - Dead code detection
 * - Naming convention analysis
 * - Entry point identification
 */

import * as fs from 'fs';
import * as path from 'path';

// Directories to exclude from analysis
const EXCLUDED_DIRS = [
  'node_modules',
  '.next',
  '.git',
  '.history',
  'old_outputs',
  'out',
  'coverage',
  'playwright-report',
  'test-results',
  '.venv',
];

// File extensions to analyze
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

interface FileInfo {
  path: string;
  relativePath: string;
  extension: string;
  size: number;
  imports: ImportInfo[];
  exports: ExportInfo[];
  functions: FunctionInfo[];
  referencedBy: string[];
  references: string[];
  isEntryPoint: boolean;
  entryPointType?:
    | 'page'
    | 'api'
    | 'config'
    | 'script'
    | 'component'
    | 'hook'
    | 'util'
    | 'type'
    | 'test';
}

interface ImportInfo {
  source: string;
  specifiers: string[];
  isDefault: boolean;
  isNamespace: boolean;
  line: number;
}

interface ExportInfo {
  name: string;
  type: 'function' | 'const' | 'class' | 'type' | 'interface' | 'default' | 'reexport';
  line: number;
  isUsedExternally: boolean;
}

interface FunctionInfo {
  name: string;
  line: number;
  isExported: boolean;
  isAsync: boolean;
  calls: string[];
  calledBy: string[];
  parameters: string[];
}

interface AnalysisResult {
  files: Map<string, FileInfo>;
  callGraph: Map<string, string[]>;
  reverseCallGraph: Map<string, string[]>;
  deadExports: string[];
  duplicatePatterns: DuplicatePattern[];
  namingIssues: NamingIssue[];
  suggestions: RefactorSuggestion[];
}

interface DuplicatePattern {
  pattern: string;
  files: string[];
  similarity: number;
}

interface NamingIssue {
  file: string;
  issue: string;
  suggestion: string;
}

interface RefactorSuggestion {
  file: string;
  type: 'move' | 'rename' | 'merge' | 'delete' | 'split';
  reason: string;
  newLocation?: string;
  newName?: string;
}

class CodebaseAnalyzer {
  private rootDir: string;
  private files: Map<string, FileInfo> = new Map();
  private callGraph: Map<string, string[]> = new Map();
  private reverseCallGraph: Map<string, string[]> = new Map();

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  /**
   * Main analysis entry point
   */
  async analyze(): Promise<AnalysisResult> {
    console.log('🔍 Starting codebase analysis...\n');

    // Phase 1: Collect all files
    console.log('📁 Phase 1: Collecting files...');
    await this.collectFiles(this.rootDir);
    console.log(`   Found ${this.files.size} code files\n`);

    // Phase 2: Parse imports and exports
    console.log('📊 Phase 2: Parsing imports and exports...');
    await this.parseAllFiles();

    // Phase 3: Build reference graph
    console.log('🔗 Phase 3: Building reference graph...');
    this.buildReferenceGraph();

    // Phase 4: Analyze functions and call stacks
    console.log('📞 Phase 4: Analyzing call stacks...');
    this.analyzeFunctions();

    // Phase 5: Detect issues
    console.log('🔎 Phase 5: Detecting issues...\n');
    const deadExports = this.findDeadExports();
    const duplicatePatterns = this.findDuplicatePatterns();
    const namingIssues = this.findNamingIssues();
    const suggestions = this.generateSuggestions();

    return {
      files: this.files,
      callGraph: this.callGraph,
      reverseCallGraph: this.reverseCallGraph,
      deadExports,
      duplicatePatterns,
      namingIssues,
      suggestions,
    };
  }

  /**
   * Recursively collect all code files
   */
  private async collectFiles(dir: string): Promise<void> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(this.rootDir, fullPath);

      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
          await this.collectFiles(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (CODE_EXTENSIONS.includes(ext)) {
          const stats = fs.statSync(fullPath);
          this.files.set(relativePath, {
            path: fullPath,
            relativePath,
            extension: ext,
            size: stats.size,
            imports: [],
            exports: [],
            functions: [],
            referencedBy: [],
            references: [],
            isEntryPoint: this.isEntryPoint(relativePath),
            entryPointType: this.getEntryPointType(relativePath),
          });
        }
      }
    }
  }

  /**
   * Determine if file is an entry point
   */
  private isEntryPoint(relativePath: string): boolean {
    // Next.js pages and API routes
    if (
      relativePath.startsWith('app/') &&
      (relativePath.includes('page.') ||
        relativePath.includes('layout.') ||
        relativePath.includes('route.'))
    ) {
      return true;
    }
    // Config files
    if (relativePath.match(/\.(config|setup)\.(ts|js|mjs|cjs)$/)) {
      return true;
    }
    // Scripts
    if (relativePath.startsWith('scripts/')) {
      return true;
    }
    return false;
  }

  /**
   * Get entry point type
   */
  private getEntryPointType(relativePath: string): FileInfo['entryPointType'] {
    if (relativePath.startsWith('app/') && relativePath.includes('page.')) return 'page';
    if (relativePath.startsWith('app/') && relativePath.includes('route.')) return 'api';
    if (relativePath.match(/\.(config|setup)\.(ts|js|mjs|cjs)$/)) return 'config';
    if (relativePath.startsWith('scripts/')) return 'script';
    if (relativePath.startsWith('components/')) return 'component';
    if (relativePath.startsWith('hooks/')) return 'hook';
    if (relativePath.startsWith('lib/') || relativePath.startsWith('utils/')) return 'util';
    if (relativePath.startsWith('types/')) return 'type';
    if (
      relativePath.startsWith('tests/') ||
      relativePath.includes('.test.') ||
      relativePath.includes('.spec.')
    )
      return 'test';
    return undefined;
  }

  /**
   * Parse all files for imports/exports
   */
  private async parseAllFiles(): Promise<void> {
    for (const [relativePath, fileInfo] of this.files) {
      try {
        const content = fs.readFileSync(fileInfo.path, 'utf-8');
        fileInfo.imports = this.parseImports(content);
        fileInfo.exports = this.parseExports(content);
        fileInfo.functions = this.parseFunctions(content);
      } catch (error) {
        console.error(`Error parsing ${relativePath}:`, error);
      }
    }
  }

  /**
   * Parse import statements
   */
  private parseImports(content: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    const lines = content.split('\n');

    // ES6 imports
    const importRegex =
      /^import\s+(?:(?:(\{[^}]+\})|(\*\s+as\s+\w+)|(\w+))(?:\s*,\s*)?)*\s*from\s*['"]([^'"]+)['"]/gm;
    // Dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    // Require statements
    const requireRegex =
      /(?:const|let|var)\s+(?:(\{[^}]+\})|(\w+))\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    let match;
    let lineNum = 0;

    for (const line of lines) {
      lineNum++;

      // Check for import statement
      const importMatch = line.match(/^import\s+(.+)\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const specifiersPart = importMatch[1];
        const source = importMatch[2];

        imports.push({
          source,
          specifiers: this.parseSpecifiers(specifiersPart),
          isDefault: !specifiersPart.includes('{') && !specifiersPart.includes('*'),
          isNamespace: specifiersPart.includes('* as'),
          line: lineNum,
        });
      }

      // Check for dynamic import
      const dynamicMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/);
      if (dynamicMatch) {
        imports.push({
          source: dynamicMatch[1],
          specifiers: ['*'],
          isDefault: false,
          isNamespace: true,
          line: lineNum,
        });
      }

      // Check for require
      const requireMatch = line.match(
        /(?:const|let|var)\s+(?:(\{[^}]+\})|(\w+))\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/,
      );
      if (requireMatch) {
        imports.push({
          source: requireMatch[3],
          specifiers: requireMatch[1] ? this.parseSpecifiers(requireMatch[1]) : [requireMatch[2]],
          isDefault: !requireMatch[1],
          isNamespace: false,
          line: lineNum,
        });
      }
    }

    return imports;
  }

  /**
   * Parse import specifiers
   */
  private parseSpecifiers(specifiersPart: string): string[] {
    const specifiers: string[] = [];

    // Handle namespace imports
    if (specifiersPart.includes('* as')) {
      const match = specifiersPart.match(/\*\s+as\s+(\w+)/);
      if (match) specifiers.push(`* as ${match[1]}`);
    }

    // Handle default import
    const defaultMatch = specifiersPart.match(/^(\w+)(?:\s*,)?/);
    if (defaultMatch && !specifiersPart.startsWith('{') && !specifiersPart.startsWith('*')) {
      specifiers.push(defaultMatch[1]);
    }

    // Handle named imports
    const namedMatch = specifiersPart.match(/\{([^}]+)\}/);
    if (namedMatch) {
      const named = namedMatch[1].split(',').map((s) =>
        s
          .trim()
          .split(/\s+as\s+/)[0]
          .trim(),
      );
      specifiers.push(...named);
    }

    return specifiers.filter((s) => s.length > 0);
  }

  /**
   * Parse export statements
   */
  private parseExports(content: string): ExportInfo[] {
    const exports: ExportInfo[] = [];
    const lines = content.split('\n');
    let lineNum = 0;

    for (const line of lines) {
      lineNum++;

      // Export default
      if (line.match(/^export\s+default\s+/)) {
        const nameMatch = line.match(/export\s+default\s+(?:function\s+)?(\w+)/);
        exports.push({
          name: nameMatch ? nameMatch[1] : 'default',
          type: 'default',
          line: lineNum,
          isUsedExternally: false,
        });
      }
      // Named exports (function)
      else if (line.match(/^export\s+(?:async\s+)?function\s+(\w+)/)) {
        const match = line.match(/^export\s+(?:async\s+)?function\s+(\w+)/);
        if (match) {
          exports.push({
            name: match[1],
            type: 'function',
            line: lineNum,
            isUsedExternally: false,
          });
        }
      }
      // Named exports (const/let/var)
      else if (line.match(/^export\s+(?:const|let|var)\s+(\w+)/)) {
        const match = line.match(/^export\s+(?:const|let|var)\s+(\w+)/);
        if (match) {
          exports.push({
            name: match[1],
            type: 'const',
            line: lineNum,
            isUsedExternally: false,
          });
        }
      }
      // Export class
      else if (line.match(/^export\s+class\s+(\w+)/)) {
        const match = line.match(/^export\s+class\s+(\w+)/);
        if (match) {
          exports.push({
            name: match[1],
            type: 'class',
            line: lineNum,
            isUsedExternally: false,
          });
        }
      }
      // Export type/interface
      else if (line.match(/^export\s+(?:type|interface)\s+(\w+)/)) {
        const match = line.match(/^export\s+(?:type|interface)\s+(\w+)/);
        if (match) {
          exports.push({
            name: match[1],
            type: line.includes('type') ? 'type' : 'interface',
            line: lineNum,
            isUsedExternally: false,
          });
        }
      }
      // Re-exports
      else if (line.match(/^export\s+\{[^}]+\}\s+from/)) {
        const match = line.match(/^export\s+\{([^}]+)\}\s+from/);
        if (match) {
          const names = match[1].split(',').map(
            (s) =>
              s
                .trim()
                .split(/\s+as\s+/)
                .pop()
                ?.trim() || '',
          );
          for (const name of names) {
            exports.push({
              name,
              type: 'reexport',
              line: lineNum,
              isUsedExternally: false,
            });
          }
        }
      }
    }

    return exports;
  }

  /**
   * Parse function declarations
   */
  private parseFunctions(content: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const lines = content.split('\n');
    let lineNum = 0;

    const functionPatterns = [
      /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
      /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?:=>|:)/,
      /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function/,
      /^\s*(\w+)\s*\([^)]*\)\s*\{/, // Method in class
    ];

    for (const line of lines) {
      lineNum++;

      for (const pattern of functionPatterns) {
        const match = line.match(pattern);
        if (match) {
          functions.push({
            name: match[1],
            line: lineNum,
            isExported: line.includes('export'),
            isAsync: line.includes('async'),
            calls: this.extractFunctionCalls(content, match[1]),
            calledBy: [],
            parameters: match[2] ? match[2].split(',').map((p) => p.trim()) : [],
          });
          break;
        }
      }
    }

    return functions;
  }

  /**
   * Extract function calls from a function body (simplified)
   */
  private extractFunctionCalls(content: string, functionName: string): string[] {
    const calls: string[] = [];
    const callPattern = /(\w+)\s*\(/g;
    let match;

    while ((match = callPattern.exec(content)) !== null) {
      const calledFunc = match[1];
      // Filter out common keywords and the function itself
      if (
        !['if', 'for', 'while', 'switch', 'catch', 'function', 'return', functionName].includes(
          calledFunc,
        )
      ) {
        if (!calls.includes(calledFunc)) {
          calls.push(calledFunc);
        }
      }
    }

    return calls;
  }

  /**
   * Build file reference graph
   */
  private buildReferenceGraph(): void {
    for (const [relativePath, fileInfo] of this.files) {
      for (const imp of fileInfo.imports) {
        const resolvedPath = this.resolveImportPath(relativePath, imp.source);
        if (resolvedPath && this.files.has(resolvedPath)) {
          fileInfo.references.push(resolvedPath);
          const targetFile = this.files.get(resolvedPath);
          if (targetFile) {
            targetFile.referencedBy.push(relativePath);

            // Mark used exports
            for (const specifier of imp.specifiers) {
              const exp = targetFile.exports.find((e) => e.name === specifier || specifier === '*');
              if (exp) {
                exp.isUsedExternally = true;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Resolve import path to file path
   */
  private resolveImportPath(fromFile: string, importSource: string): string | null {
    // Handle aliases
    if (importSource.startsWith('@/')) {
      importSource = importSource.replace('@/', '');
    }

    // Skip external modules
    if (!importSource.startsWith('.') && !importSource.startsWith('@/')) {
      return null;
    }

    const fromDir = path.dirname(fromFile);
    const resolvedPath = path.normalize(path.join(fromDir, importSource)).replace(/\\/g, '/');

    // Try different extensions
    for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js']) {
      const testPath = resolvedPath + ext;
      if (this.files.has(testPath)) {
        return testPath;
      }
    }

    return null;
  }

  /**
   * Analyze function relationships
   */
  private analyzeFunctions(): void {
    // Build cross-file function call graph
    for (const [relativePath, fileInfo] of this.files) {
      const funcKey = (file: string, func: string) => `${file}::${func}`;

      for (const func of fileInfo.functions) {
        const key = funcKey(relativePath, func.name);
        this.callGraph.set(
          key,
          func.calls.map((c) => `?::${c}`),
        );
      }
    }
  }

  /**
   * Find unused exports
   */
  private findDeadExports(): string[] {
    const deadExports: string[] = [];

    for (const [relativePath, fileInfo] of this.files) {
      // Skip test files and entry points
      if (fileInfo.entryPointType === 'test' || fileInfo.isEntryPoint) {
        continue;
      }

      for (const exp of fileInfo.exports) {
        if (!exp.isUsedExternally && exp.type !== 'default') {
          deadExports.push(`${relativePath}::${exp.name}`);
        }
      }
    }

    return deadExports;
  }

  /**
   * Find files with similar patterns (potential duplicates)
   */
  private findDuplicatePatterns(): DuplicatePattern[] {
    const patterns: DuplicatePattern[] = [];
    const filesByName = new Map<string, string[]>();

    for (const relativePath of this.files.keys()) {
      const baseName = path.basename(relativePath).replace(/\.(test|spec|d)\.(ts|tsx|js|jsx)$/, '');
      if (!filesByName.has(baseName)) {
        filesByName.set(baseName, []);
      }
      filesByName.get(baseName)!.push(relativePath);
    }

    for (const [name, files] of filesByName) {
      if (files.length > 1) {
        // Filter to non-test files
        const nonTestFiles = files.filter((f) => !f.includes('.test.') && !f.includes('.spec.'));
        if (nonTestFiles.length > 1) {
          patterns.push({
            pattern: name,
            files: nonTestFiles,
            similarity: 0.8, // Placeholder - would need content comparison
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Find naming convention issues
   */
  private findNamingIssues(): NamingIssue[] {
    const issues: NamingIssue[] = [];

    for (const [relativePath, fileInfo] of this.files) {
      const fileName = path.basename(relativePath, fileInfo.extension);

      // Check for inconsistent casing
      if (relativePath.startsWith('components/') && !fileName.match(/^[A-Z][a-zA-Z]+$/)) {
        if (fileName !== 'index' && !fileName.includes('.')) {
          issues.push({
            file: relativePath,
            issue: 'Component file should use PascalCase',
            suggestion:
              fileName.charAt(0).toUpperCase() +
              fileName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
          });
        }
      }

      // Check for kebab-case in utility files
      if (
        (relativePath.startsWith('lib/') || relativePath.startsWith('utils/')) &&
        fileName.includes('_')
      ) {
        issues.push({
          file: relativePath,
          issue: 'Utility files should use kebab-case or camelCase',
          suggestion: fileName.replace(/_/g, '-'),
        });
      }

      // Check for overly long file names
      if (fileName.length > 40) {
        issues.push({
          file: relativePath,
          issue: 'File name is very long',
          suggestion: 'Consider shortening or splitting the file',
        });
      }
    }

    return issues;
  }

  /**
   * Generate refactoring suggestions
   */
  private generateSuggestions(): RefactorSuggestion[] {
    const suggestions: RefactorSuggestion[] = [];

    for (const [relativePath, fileInfo] of this.files) {
      // Skip tests
      if (fileInfo.entryPointType === 'test') continue;

      // Check for files with no references (potential dead code)
      if (fileInfo.referencedBy.length === 0 && !fileInfo.isEntryPoint) {
        suggestions.push({
          file: relativePath,
          type: 'delete',
          reason: 'File is not imported anywhere and is not an entry point',
        });
      }

      // Check for misplaced files
      if (
        relativePath.startsWith('components/') &&
        fileInfo.exports.every((e) => e.type === 'function' && !e.name.match(/^[A-Z]/))
      ) {
        suggestions.push({
          file: relativePath,
          type: 'move',
          reason: 'File contains only utility functions but is in components/',
          newLocation: relativePath.replace('components/', 'lib/'),
        });
      }

      // Check for large files that could be split
      if (fileInfo.functions.length > 10 && fileInfo.size > 10000) {
        suggestions.push({
          file: relativePath,
          type: 'split',
          reason: `File has ${fileInfo.functions.length} functions and is ${Math.round(fileInfo.size / 1024)}KB`,
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate JSON report
   */
  generateReport(): object {
    const filesArray = Array.from(this.files.entries()).map(([path, info]) => ({
      path,
      ...info,
    }));

    return {
      summary: {
        totalFiles: this.files.size,
        byType: this.countByType(),
        entryPoints: filesArray.filter((f) => f.isEntryPoint).length,
      },
      files: filesArray,
      callGraph: Object.fromEntries(this.callGraph),
      reverseCallGraph: Object.fromEntries(this.reverseCallGraph),
    };
  }

  private countByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const fileInfo of this.files.values()) {
      const type = fileInfo.entryPointType || 'other';
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }
}

// Main execution
async function main() {
  const rootDir = process.cwd();
  const analyzer = new CodebaseAnalyzer(rootDir);

  try {
    const result = await analyzer.analyze();

    // Print summary
    console.log('='.repeat(60));
    console.log('📊 ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n📁 Total Files: ${result.files.size}`);

    // Count by type
    const byType: Record<string, number> = {};
    for (const fileInfo of result.files.values()) {
      const type = fileInfo.entryPointType || 'other';
      byType[type] = (byType[type] || 0) + 1;
    }
    console.log('\n📂 Files by Type:');
    for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${type}: ${count}`);
    }

    console.log(`\n☠️  Dead Exports: ${result.deadExports.length}`);
    if (result.deadExports.length > 0) {
      console.log('   First 10:');
      result.deadExports.slice(0, 10).forEach((e) => console.log(`   - ${e}`));
    }

    console.log(`\n🔄 Duplicate Patterns: ${result.duplicatePatterns.length}`);
    for (const dup of result.duplicatePatterns.slice(0, 5)) {
      console.log(`   ${dup.pattern}: ${dup.files.join(', ')}`);
    }

    console.log(`\n⚠️  Naming Issues: ${result.namingIssues.length}`);
    for (const issue of result.namingIssues.slice(0, 10)) {
      console.log(`   ${issue.file}: ${issue.issue}`);
    }

    console.log(`\n💡 Suggestions: ${result.suggestions.length}`);
    for (const sug of result.suggestions.slice(0, 10)) {
      console.log(`   [${sug.type.toUpperCase()}] ${sug.file}: ${sug.reason}`);
    }

    // Write full report to JSON
    const report = analyzer.generateReport();
    fs.writeFileSync(path.join(rootDir, 'codebase-analysis.json'), JSON.stringify(report, null, 2));
    console.log('\n✅ Full report saved to codebase-analysis.json');
  } catch (error) {
    console.error('Analysis failed:', error);
    process.exit(1);
  }
}

main();
