#!/usr/bin/env python3
"""
Deep Codebase Analyzer for quiz-srs
===================================
Generates a comprehensive map of the entire codebase including:
- Complete import/export dependency graph
- Full call stack analysis for all entry points
- Dead code detection (files with zero imports)
- Duplicate code detection
- Unused exports
- Circular dependencies
- File deletion candidates

Usage: python scripts/deep-codebase-analyzer.py
Output: docs/DEEP-CODEBASE-MAP.md, codebase-deep-analysis.json
"""

import os
import re
import json
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Set, Tuple, Optional, Any
from collections import defaultdict
import hashlib

# Configuration
ROOT_DIR = Path(__file__).parent.parent
EXCLUDED_DIRS = {
    'node_modules', '.next', '.git', '.history', 'old_outputs', 
    'out', 'coverage', 'playwright-report', 'test-results', '.venv',
    '__pycache__', '.turbo', 'dist', 'build'
}
CODE_EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'}
TEST_PATTERNS = {'test.ts', 'test.tsx', 'spec.ts', 'spec.tsx', '.test.', '.spec.'}

@dataclass
class ImportInfo:
    source: str
    specifiers: List[str]
    is_default: bool
    is_namespace: bool
    is_dynamic: bool
    line_number: int
    raw_line: str

@dataclass
class ExportInfo:
    name: str
    export_type: str  # 'function', 'const', 'class', 'type', 'interface', 'default', 'reexport'
    line_number: int
    is_default: bool

@dataclass
class FunctionInfo:
    name: str
    line_number: int
    is_exported: bool
    is_async: bool
    parameters: List[str]
    calls: List[str] = field(default_factory=list)

@dataclass
class FileAnalysis:
    path: str
    relative_path: str
    size: int
    line_count: int
    imports: List[ImportInfo] = field(default_factory=list)
    exports: List[ExportInfo] = field(default_factory=list)
    functions: List[FunctionInfo] = field(default_factory=list)
    imported_by: List[str] = field(default_factory=list)
    imports_files: List[str] = field(default_factory=list)
    is_entry_point: bool = False
    entry_point_type: Optional[str] = None
    is_test_file: bool = False
    content_hash: str = ""
    external_deps: List[str] = field(default_factory=list)

@dataclass 
class DuplicateGroup:
    files: List[str]
    similarity_type: str  # 'name', 'content', 'function'
    details: str

@dataclass
class CircularDep:
    cycle: List[str]
    
@dataclass
class DeadCodeCandidate:
    file_path: str
    reason: str
    confidence: str  # 'high', 'medium', 'low'
    safe_to_delete: bool
    related_test_file: Optional[str] = None


class DeepCodebaseAnalyzer:
    def __init__(self, root_dir: Path):
        self.root_dir = root_dir
        self.files: Dict[str, FileAnalysis] = {}
        self.import_graph: Dict[str, Set[str]] = defaultdict(set)
        self.reverse_import_graph: Dict[str, Set[str]] = defaultdict(set)
        self.all_exports: Dict[str, List[str]] = defaultdict(list)
        self.used_exports: Dict[str, Set[str]] = defaultdict(set)
        self.duplicates: List[DuplicateGroup] = []
        self.circular_deps: List[CircularDep] = []
        self.dead_code: List[DeadCodeCandidate] = []
        
    def analyze(self) -> Dict[str, Any]:
        """Main analysis entry point"""
        print("🔍 Starting deep codebase analysis...\n")
        
        # Phase 1: Collect all files
        print("📁 Phase 1: Collecting files...")
        self._collect_files()
        print(f"   Found {len(self.files)} code files\n")
        
        # Phase 2: Parse all files
        print("📊 Phase 2: Parsing imports and exports...")
        self._parse_all_files()
        
        # Phase 3: Build dependency graph
        print("🔗 Phase 3: Building dependency graph...")
        self._build_dependency_graph()
        
        # Phase 4: Detect issues
        print("🔎 Phase 4: Detecting issues...")
        self._detect_circular_dependencies()
        self._detect_duplicates()
        self._detect_dead_code()
        
        # Phase 5: Generate report
        print("📝 Phase 5: Generating report...\n")
        return self._generate_report()
    
    def _collect_files(self):
        """Recursively collect all code files"""
        for root, dirs, files in os.walk(self.root_dir):
            # Filter excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            
            for file in files:
                file_path = Path(root) / file
                if file_path.suffix in CODE_EXTENSIONS:
                    rel_path = file_path.relative_to(self.root_dir)
                    rel_path_str = str(rel_path).replace('\\', '/')
                    
                    try:
                        content = file_path.read_text(encoding='utf-8')
                        content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
                        
                        self.files[rel_path_str] = FileAnalysis(
                            path=str(file_path),
                            relative_path=rel_path_str,
                            size=file_path.stat().st_size,
                            line_count=len(content.splitlines()),
                            is_entry_point=self._is_entry_point(rel_path_str),
                            entry_point_type=self._get_entry_point_type(rel_path_str),
                            is_test_file=self._is_test_file(rel_path_str),
                            content_hash=content_hash
                        )
                    except Exception as e:
                        print(f"   Warning: Could not read {rel_path_str}: {e}")
    
    def _is_entry_point(self, path: str) -> bool:
        """Determine if file is an entry point"""
        # Next.js pages and routes
        if path.startswith('app/') and any(x in path for x in ['page.', 'layout.', 'route.', 'loading.', 'error.']):
            return True
        # Config files
        if re.match(r'.*\.(config|setup)\.(ts|js|mjs|cjs)$', path):
            return True
        # Scripts
        if path.startswith('scripts/'):
            return True
        return False
    
    def _get_entry_point_type(self, path: str) -> Optional[str]:
        """Get the type of entry point"""
        if path.startswith('app/') and 'page.' in path:
            return 'page'
        if path.startswith('app/') and 'layout.' in path:
            return 'layout'
        if path.startswith('app/') and 'route.' in path:
            return 'api'
        if re.match(r'.*\.(config|setup)\.(ts|js|mjs|cjs)$', path):
            return 'config'
        if path.startswith('scripts/'):
            return 'script'
        if path.startswith('components/'):
            return 'component'
        if path.startswith('hooks/'):
            return 'hook'
        if path.startswith('lib/') or path.startswith('utils/'):
            return 'util'
        if path.startswith('types/'):
            return 'type'
        return None
    
    def _is_test_file(self, path: str) -> bool:
        """Check if file is a test file"""
        if path.startswith('tests/'):
            return True
        return any(p in path for p in TEST_PATTERNS)
    
    def _parse_all_files(self):
        """Parse imports and exports from all files"""
        for rel_path, file_info in self.files.items():
            try:
                content = Path(file_info.path).read_text(encoding='utf-8')
                file_info.imports = self._parse_imports(content)
                file_info.exports = self._parse_exports(content)
                file_info.functions = self._parse_functions(content)
                file_info.external_deps = self._extract_external_deps(file_info.imports)
            except Exception as e:
                print(f"   Warning: Could not parse {rel_path}: {e}")
    
    def _parse_imports(self, content: str) -> List[ImportInfo]:
        """Parse all import statements including multi-line imports"""
        imports = []
        
        # Normalize multi-line imports by joining lines
        # First, handle standard multi-line imports
        normalized = re.sub(r'import\s*\{([^}]*)\}\s*from', 
                           lambda m: f'import {{{m.group(1).replace(chr(10), " ")}}} from', 
                           content)
        
        # Also handle imports that span multiple lines with the 'from' on a different line
        normalized = re.sub(r'import\s+([^;]+?)\s+from\s+[\'"]([^\'"]+)[\'"]', 
                           lambda m: f'import {m.group(1).replace(chr(10), " ")} from "{m.group(2)}"',
                           normalized)
        
        lines = normalized.split('\n')
        
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            
            # Skip if not an import line
            if not stripped.startswith('import') and 'require(' not in stripped:
                # Check for dynamic imports
                dyn_match = re.search(r'import\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)', stripped)
                if dyn_match:
                    imports.append(ImportInfo(
                        source=dyn_match.group(1),
                        specifiers=['*'],
                        is_default=False,
                        is_namespace=True,
                        is_dynamic=True,
                        line_number=i,
                        raw_line=stripped
                    ))
                continue
            
            # Standard import: import X from 'Y' or import { X } from 'Y'
            match = re.match(r'^import\s+(.+?)\s+from\s+[\'"]([^\'"]+)[\'"]', stripped)
            if match:
                specifiers_part, source = match.groups()
                specifiers, is_default, is_namespace = self._parse_specifiers(specifiers_part)
                imports.append(ImportInfo(
                    source=source,
                    specifiers=specifiers,
                    is_default=is_default,
                    is_namespace=is_namespace,
                    is_dynamic=False,
                    line_number=i,
                    raw_line=line.strip()
                ))
                continue
            
            # Dynamic import
            match = re.search(r'import\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)', line)
            if match:
                imports.append(ImportInfo(
                    source=match.group(1),
                    specifiers=['*'],
                    is_default=False,
                    is_namespace=True,
                    is_dynamic=True,
                    line_number=i,
                    raw_line=line.strip()
                ))
                continue
            
            # Require
            match = re.match(r'(?:const|let|var)\s+(.+?)\s*=\s*require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)', line.strip())
            if match:
                specifiers_part, source = match.groups()
                specifiers, is_default, is_namespace = self._parse_specifiers(specifiers_part)
                imports.append(ImportInfo(
                    source=source,
                    specifiers=specifiers,
                    is_default=is_default,
                    is_namespace=is_namespace,
                    is_dynamic=False,
                    line_number=i,
                    raw_line=line.strip()
                ))
        
        return imports
    
    def _parse_specifiers(self, specifiers_part: str) -> Tuple[List[str], bool, bool]:
        """Parse import specifiers"""
        specifiers = []
        is_default = False
        is_namespace = False
        
        # Namespace import
        if '* as' in specifiers_part:
            match = re.search(r'\*\s+as\s+(\w+)', specifiers_part)
            if match:
                specifiers.append(f'* as {match.group(1)}')
                is_namespace = True
        
        # Default import
        default_match = re.match(r'^(\w+)(?:\s*,)?', specifiers_part.strip())
        if default_match and not specifiers_part.strip().startswith('{') and not specifiers_part.strip().startswith('*'):
            specifiers.append(default_match.group(1))
            is_default = True
        
        # Named imports
        named_match = re.search(r'\{([^}]+)\}', specifiers_part)
        if named_match:
            named = [s.strip().split(' as ')[0].strip() for s in named_match.group(1).split(',')]
            specifiers.extend([n for n in named if n])
        
        return specifiers, is_default, is_namespace
    
    def _parse_exports(self, content: str) -> List[ExportInfo]:
        """Parse all export statements"""
        exports = []
        lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            
            # export default
            if re.match(r'^export\s+default\s+', stripped):
                name_match = re.match(r'^export\s+default\s+(?:function|class|const|let|var)?\s*(\w+)?', stripped)
                exports.append(ExportInfo(
                    name=name_match.group(1) if name_match and name_match.group(1) else 'default',
                    export_type='default',
                    line_number=i,
                    is_default=True
                ))
                continue
            
            # export function
            match = re.match(r'^export\s+(?:async\s+)?function\s+(\w+)', stripped)
            if match:
                exports.append(ExportInfo(
                    name=match.group(1),
                    export_type='function',
                    line_number=i,
                    is_default=False
                ))
                continue
            
            # export const/let/var
            match = re.match(r'^export\s+(?:const|let|var)\s+(\w+)', stripped)
            if match:
                exports.append(ExportInfo(
                    name=match.group(1),
                    export_type='const',
                    line_number=i,
                    is_default=False
                ))
                continue
            
            # export class
            match = re.match(r'^export\s+class\s+(\w+)', stripped)
            if match:
                exports.append(ExportInfo(
                    name=match.group(1),
                    export_type='class',
                    line_number=i,
                    is_default=False
                ))
                continue
            
            # export type/interface
            match = re.match(r'^export\s+(?:type|interface)\s+(\w+)', stripped)
            if match:
                exports.append(ExportInfo(
                    name=match.group(1),
                    export_type='type',
                    line_number=i,
                    is_default=False
                ))
                continue
            
            # export { ... } from
            match = re.match(r'^export\s+\{([^}]+)\}\s+from\s+[\'"]([^\'"]+)[\'"]', stripped)
            if match:
                names = [n.strip().split(' as ')[-1].strip() for n in match.group(1).split(',')]
                for name in names:
                    if name:
                        exports.append(ExportInfo(
                            name=name,
                            export_type='reexport',
                            line_number=i,
                            is_default=False
                        ))
                continue
            
            # export * from
            if re.match(r'^export\s+\*\s+from\s+', stripped):
                exports.append(ExportInfo(
                    name='*',
                    export_type='reexport',
                    line_number=i,
                    is_default=False
                ))
        
        return exports
    
    def _parse_functions(self, content: str) -> List[FunctionInfo]:
        """Parse function declarations"""
        functions = []
        lines = content.split('\n')
        
        patterns = [
            (r'^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)', True),
            (r'^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?:=>|:)', True),
            (r'^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function', True),
            (r'^\s+(\w+)\s*\([^)]*\)\s*(?:\{|:)', False),  # Methods
        ]
        
        for i, line in enumerate(lines, 1):
            for pattern, check_export in patterns:
                match = re.match(pattern, line.strip())
                if match:
                    name = match.group(1)
                    params = match.group(2) if len(match.groups()) > 1 else ''
                    is_exported = 'export' in line if check_export else False
                    is_async = 'async' in line
                    
                    functions.append(FunctionInfo(
                        name=name,
                        line_number=i,
                        is_exported=is_exported,
                        is_async=is_async,
                        parameters=[p.strip().split(':')[0].strip() for p in params.split(',') if p.strip()]
                    ))
                    break
        
        return functions
    
    def _extract_external_deps(self, imports: List[ImportInfo]) -> List[str]:
        """Extract external (npm) dependencies"""
        external = []
        for imp in imports:
            source = imp.source
            # Skip relative imports and aliases
            if source.startswith('.') or source.startswith('@/'):
                continue
            # Get package name (handle scoped packages)
            if source.startswith('@'):
                parts = source.split('/')
                if len(parts) >= 2:
                    external.append(f"{parts[0]}/{parts[1]}")
            else:
                external.append(source.split('/')[0])
        return list(set(external))
    
    def _build_dependency_graph(self):
        """Build import dependency graph"""
        for rel_path, file_info in self.files.items():
            for imp in file_info.imports:
                resolved = self._resolve_import(rel_path, imp.source)
                if resolved:
                    self.import_graph[rel_path].add(resolved)
                    self.reverse_import_graph[resolved].add(rel_path)
                    file_info.imports_files.append(resolved)
                    if resolved in self.files:
                        self.files[resolved].imported_by.append(rel_path)
    
    def _resolve_import(self, from_file: str, import_source: str) -> Optional[str]:
        """Resolve import path to file path"""
        # Handle alias
        if import_source.startswith('@/'):
            import_source = import_source[2:]
        elif not import_source.startswith('.'):
            return None  # External module
        else:
            # Relative import
            from_dir = str(Path(from_file).parent)
            import_source = str(Path(from_dir) / import_source).replace('\\', '/')
        
        # Normalize path
        import_source = os.path.normpath(import_source).replace('\\', '/')
        
        # Try different extensions and index files
        candidates = [
            import_source,
            f"{import_source}.ts",
            f"{import_source}.tsx",
            f"{import_source}.js",
            f"{import_source}.jsx",
            f"{import_source}/index.ts",
            f"{import_source}/index.tsx",
            f"{import_source}/index.js",
        ]
        
        for candidate in candidates:
            if candidate in self.files:
                return candidate
        
        return None
    
    def _detect_circular_dependencies(self):
        """Detect circular dependencies using DFS"""
        visited = set()
        rec_stack = set()
        path = []
        
        def dfs(node: str) -> bool:
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in self.import_graph.get(node, []):
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    # Found cycle
                    cycle_start = path.index(neighbor)
                    cycle = path[cycle_start:] + [neighbor]
                    self.circular_deps.append(CircularDep(cycle=cycle))
                    return True
            
            path.pop()
            rec_stack.remove(node)
            return False
        
        for node in self.files:
            if node not in visited:
                dfs(node)
    
    def _detect_duplicates(self):
        """Detect duplicate files and patterns"""
        # Group by base name
        by_name: Dict[str, List[str]] = defaultdict(list)
        for rel_path in self.files:
            base_name = Path(rel_path).stem
            # Remove test suffixes
            base_name = re.sub(r'\.(test|spec)$', '', base_name)
            by_name[base_name].append(rel_path)
        
        for name, files in by_name.items():
            if len(files) > 1:
                # Filter out test files for comparison
                non_test = [f for f in files if not self.files[f].is_test_file]
                if len(non_test) > 1:
                    self.duplicates.append(DuplicateGroup(
                        files=non_test,
                        similarity_type='name',
                        details=f"Multiple files with base name '{name}'"
                    ))
        
        # Group by content hash (exact duplicates)
        by_hash: Dict[str, List[str]] = defaultdict(list)
        for rel_path, file_info in self.files.items():
            if not file_info.is_test_file:
                by_hash[file_info.content_hash].append(rel_path)
        
        for hash_val, files in by_hash.items():
            if len(files) > 1:
                self.duplicates.append(DuplicateGroup(
                    files=files,
                    similarity_type='content',
                    details=f"Files with identical content (hash: {hash_val})"
                ))
    
    def _detect_dead_code(self):
        """Detect files that appear to be dead code"""
        for rel_path, file_info in self.files.items():
            # Skip test files and entry points
            if file_info.is_test_file or file_info.is_entry_point:
                continue
            
            imported_by = self.reverse_import_graph.get(rel_path, set())
            
            # Filter out imports from test files
            non_test_importers = []
            for f in imported_by:
                f_info = self.files.get(f)
                if f_info and not f_info.is_test_file:
                    non_test_importers.append(f)
            
            if len(non_test_importers) == 0:
                # Find related test file
                test_file = self._find_related_test(rel_path)
                
                # Determine confidence
                confidence = 'high'
                if imported_by:  # Only imported by tests
                    confidence = 'medium'
                
                self.dead_code.append(DeadCodeCandidate(
                    file_path=rel_path,
                    reason='No non-test imports found' if imported_by else 'No imports at all',
                    confidence=confidence,
                    safe_to_delete=confidence == 'high',
                    related_test_file=test_file
                ))
    
    def _find_related_test(self, file_path: str) -> Optional[str]:
        """Find test file related to source file"""
        base = Path(file_path).stem
        parent = str(Path(file_path).parent)
        
        # Common test file patterns
        patterns = [
            f"tests/unit/{parent}/{base}.test.ts",
            f"tests/unit/{parent}/{base}.test.tsx",
            f"tests/unit/{base}.test.ts",
            f"tests/unit/{base}.test.tsx",
        ]
        
        for pattern in patterns:
            if pattern in self.files:
                return pattern
        
        return None
    
    def _generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive analysis report"""
        # Build entry point call stacks
        entry_points = {}
        for rel_path, file_info in self.files.items():
            if file_info.is_entry_point:
                entry_points[rel_path] = {
                    'type': file_info.entry_point_type,
                    'direct_imports': list(self.import_graph.get(rel_path, [])),
                    'full_dependency_tree': self._get_full_deps(rel_path),
                    'external_deps': file_info.external_deps
                }
        
        # Component usage map
        component_usage = {}
        for rel_path in self.files:
            if rel_path.startswith('components/'):
                importers = []
                for f in self.reverse_import_graph.get(rel_path, []):
                    f_info = self.files.get(f)
                    if f_info and not f_info.is_test_file:
                        importers.append(f)
                component_usage[rel_path] = {
                    'imported_by': importers,
                    'import_count': len(importers)
                }
        
        # Hook usage
        hook_usage = {}
        for rel_path in self.files:
            if rel_path.startswith('hooks/') or 'use-' in rel_path:
                importers = []
                for f in self.reverse_import_graph.get(rel_path, []):
                    f_info = self.files.get(f)
                    if f_info and not f_info.is_test_file:
                        importers.append(f)
                hook_usage[rel_path] = {
                    'imported_by': importers,
                    'import_count': len(importers)
                }
        
        # Lib/utils usage
        lib_usage = {}
        for rel_path in self.files:
            if rel_path.startswith('lib/') or rel_path.startswith('utils/'):
                importers = []
                for f in self.reverse_import_graph.get(rel_path, []):
                    f_info = self.files.get(f)
                    if f_info and not f_info.is_test_file:
                        importers.append(f)
                lib_usage[rel_path] = {
                    'imported_by': importers,
                    'import_count': len(importers)
                }
        
        return {
            'summary': {
                'total_files': len(self.files),
                'entry_points': len([f for f in self.files.values() if f.is_entry_point]),
                'test_files': len([f for f in self.files.values() if f.is_test_file]),
                'dead_code_candidates': len(self.dead_code),
                'circular_dependencies': len(self.circular_deps),
                'duplicate_groups': len(self.duplicates)
            },
            'entry_points': entry_points,
            'component_usage': component_usage,
            'hook_usage': hook_usage,
            'lib_usage': lib_usage,
            'dead_code': [asdict(d) for d in self.dead_code],
            'duplicates': [asdict(d) for d in self.duplicates],
            'circular_dependencies': [asdict(c) for c in self.circular_deps],
            'files': {k: {
                'relative_path': v.relative_path,
                'line_count': v.line_count,
                'imports_count': len(v.imports),
                'exports_count': len(v.exports),
                'imported_by_count': len(v.imported_by),
                'is_entry_point': v.is_entry_point,
                'is_test_file': v.is_test_file,
                'external_deps': v.external_deps
            } for k, v in self.files.items()}
        }
    
    def _get_full_deps(self, file_path: str, visited: Optional[Set[str]] = None) -> List[str]:
        """Get full dependency tree for a file"""
        if visited is None:
            visited = set()
        
        if file_path in visited:
            return []
        
        visited.add(file_path)
        deps = []
        
        for dep in self.import_graph.get(file_path, []):
            deps.append(dep)
            deps.extend(self._get_full_deps(dep, visited))
        
        return deps
    
    def generate_markdown_report(self, analysis: Dict[str, Any]) -> str:
        """Generate detailed markdown report"""
        md = []
        md.append("# Deep Codebase Analysis Report")
        md.append(f"\n**Generated:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        md.append(f"\n**Analyzer:** [scripts/deep-codebase-analyzer.py](../scripts/deep-codebase-analyzer.py)")
        
        # Summary
        md.append("\n---\n")
        md.append("## 📊 Summary")
        md.append("")
        summary = analysis['summary']
        md.append(f"| Metric | Count |")
        md.append(f"|--------|-------|")
        md.append(f"| Total Files | {summary['total_files']} |")
        md.append(f"| Entry Points | {summary['entry_points']} |")
        md.append(f"| Test Files | {summary['test_files']} |")
        md.append(f"| Dead Code Candidates | {summary['dead_code_candidates']} |")
        md.append(f"| Circular Dependencies | {summary['circular_dependencies']} |")
        md.append(f"| Duplicate Groups | {summary['duplicate_groups']} |")
        
        # Entry Points with Full Call Stack
        md.append("\n---\n")
        md.append("## 🚀 Entry Points & Full Dependency Trees")
        md.append("")
        
        for entry_path, info in sorted(analysis['entry_points'].items()):
            md.append(f"### `{entry_path}` ({info['type']})")
            md.append("")
            md.append("**Direct Imports:**")
            if info['direct_imports']:
                for imp in sorted(info['direct_imports']):
                    md.append(f"- `{imp}`")
            else:
                md.append("- (none)")
            md.append("")
            md.append("**Full Dependency Tree:**")
            if info['full_dependency_tree']:
                # Dedupe and sort
                deps = sorted(set(info['full_dependency_tree']))
                for dep in deps[:30]:  # Limit to prevent huge output
                    md.append(f"- `{dep}`")
                if len(deps) > 30:
                    md.append(f"- ... and {len(deps) - 30} more")
            else:
                md.append("- (none)")
            md.append("")
            if info['external_deps']:
                md.append("**External Dependencies:**")
                for dep in sorted(info['external_deps']):
                    md.append(f"- `{dep}`")
                md.append("")
        
        # Dead Code Section (THE MAIN EVENT)
        md.append("\n---\n")
        md.append("## ☠️ Dead Code Candidates (DELETION TARGETS)")
        md.append("")
        md.append("> These files have NO non-test imports and are likely safe to delete.")
        md.append("")
        
        # Group by confidence
        high_confidence = [d for d in analysis['dead_code'] if d['confidence'] == 'high']
        medium_confidence = [d for d in analysis['dead_code'] if d['confidence'] == 'medium']
        
        if high_confidence:
            md.append("### 🔴 HIGH CONFIDENCE (Safe to Delete)")
            md.append("")
            md.append("| File | Reason | Related Test |")
            md.append("|------|--------|--------------|")
            for dc in sorted(high_confidence, key=lambda x: x['file_path']):
                test = dc['related_test_file'] or 'N/A'
                md.append(f"| `{dc['file_path']}` | {dc['reason']} | `{test}` |")
            md.append("")
        
        if medium_confidence:
            md.append("### 🟡 MEDIUM CONFIDENCE (Only imported by tests)")
            md.append("")
            md.append("| File | Reason | Related Test |")
            md.append("|------|--------|--------------|")
            for dc in sorted(medium_confidence, key=lambda x: x['file_path']):
                test = dc['related_test_file'] or 'N/A'
                md.append(f"| `{dc['file_path']}` | {dc['reason']} | `{test}` |")
            md.append("")
        
        # Duplicates
        if analysis['duplicates']:
            md.append("\n---\n")
            md.append("## 🔄 Duplicate Files")
            md.append("")
            for i, dup in enumerate(analysis['duplicates'], 1):
                md.append(f"### Group {i}: {dup['similarity_type'].upper()}")
                md.append(f"_{dup['details']}_")
                md.append("")
                for f in dup['files']:
                    md.append(f"- `{f}`")
                md.append("")
        
        # Circular Dependencies
        if analysis['circular_dependencies']:
            md.append("\n---\n")
            md.append("## 🔁 Circular Dependencies")
            md.append("")
            for i, circ in enumerate(analysis['circular_dependencies'], 1):
                md.append(f"### Cycle {i}")
                md.append("```")
                md.append(" → ".join(circ['cycle']))
                md.append("```")
                md.append("")
        
        # Component Usage (sorted by import count)
        md.append("\n---\n")
        md.append("## 📦 Component Usage Analysis")
        md.append("")
        md.append("| Component | Import Count | Imported By |")
        md.append("|-----------|--------------|-------------|")
        
        sorted_components = sorted(
            analysis['component_usage'].items(), 
            key=lambda x: x[1]['import_count']
        )
        for comp, info in sorted_components:
            importers = ', '.join(info['imported_by'][:3])
            if len(info['imported_by']) > 3:
                importers += f" +{len(info['imported_by']) - 3} more"
            md.append(f"| `{comp}` | {info['import_count']} | {importers or 'NONE'} |")
        
        # Hook Usage
        md.append("\n---\n")
        md.append("## 🪝 Hook Usage Analysis")
        md.append("")
        md.append("| Hook | Import Count | Imported By |")
        md.append("|------|--------------|-------------|")
        
        sorted_hooks = sorted(
            analysis['hook_usage'].items(), 
            key=lambda x: x[1]['import_count']
        )
        for hook, info in sorted_hooks:
            importers = ', '.join(info['imported_by'][:3])
            if len(info['imported_by']) > 3:
                importers += f" +{len(info['imported_by']) - 3} more"
            md.append(f"| `{hook}` | {info['import_count']} | {importers or 'NONE'} |")
        
        # Lib/Utils Usage
        md.append("\n---\n")
        md.append("## 📚 Lib/Utils Usage Analysis")
        md.append("")
        md.append("| File | Import Count | Imported By |")
        md.append("|------|--------------|-------------|")
        
        sorted_libs = sorted(
            analysis['lib_usage'].items(), 
            key=lambda x: x[1]['import_count']
        )
        for lib, info in sorted_libs:
            importers = ', '.join(info['imported_by'][:3])
            if len(info['imported_by']) > 3:
                importers += f" +{len(info['imported_by']) - 3} more"
            md.append(f"| `{lib}` | {info['import_count']} | {importers or 'NONE'} |")
        
        # Files Overview (for reference)
        md.append("\n---\n")
        md.append("## 📁 All Files Overview")
        md.append("")
        md.append("<details>")
        md.append("<summary>Click to expand full file list</summary>")
        md.append("")
        md.append("| File | Lines | Imports | Exports | Imported By |")
        md.append("|------|-------|---------|---------|-------------|")
        
        for path, info in sorted(analysis['files'].items()):
            if not info['is_test_file']:
                md.append(f"| `{path}` | {info['line_count']} | {info['imports_count']} | {info['exports_count']} | {info['imported_by_count']} |")
        
        md.append("")
        md.append("</details>")
        
        # Cleanup Commands
        md.append("\n---\n")
        md.append("## 🧹 Cleanup Commands")
        md.append("")
        md.append("### Delete High-Confidence Dead Code")
        md.append("```powershell")
        if high_confidence:
            for dc in high_confidence:
                md.append(f"Remove-Item '{dc['file_path']}'")
                if dc['related_test_file']:
                    md.append(f"Remove-Item '{dc['related_test_file']}'")
        else:
            md.append("# No high-confidence dead code found")
        md.append("```")
        
        return '\n'.join(md)


def main():
    analyzer = DeepCodebaseAnalyzer(ROOT_DIR)
    
    try:
        analysis = analyzer.analyze()
        
        # Print summary
        print("=" * 60)
        print("📊 ANALYSIS SUMMARY")
        print("=" * 60)
        
        summary = analysis['summary']
        print(f"\n📁 Total Files: {summary['total_files']}")
        print(f"🚀 Entry Points: {summary['entry_points']}")
        print(f"🧪 Test Files: {summary['test_files']}")
        print(f"☠️  Dead Code Candidates: {summary['dead_code_candidates']}")
        print(f"🔁 Circular Dependencies: {summary['circular_dependencies']}")
        print(f"🔄 Duplicate Groups: {summary['duplicate_groups']}")
        
        # List dead code
        if analysis['dead_code']:
            print("\n☠️  Dead Code Files:")
            for dc in analysis['dead_code'][:15]:
                marker = "🔴" if dc['confidence'] == 'high' else "🟡"
                print(f"   {marker} {dc['file_path']}")
            if len(analysis['dead_code']) > 15:
                print(f"   ... and {len(analysis['dead_code']) - 15} more")
        
        # List duplicates
        if analysis['duplicates']:
            print("\n🔄 Duplicates:")
            for dup in analysis['duplicates'][:5]:
                print(f"   - {dup['similarity_type']}: {', '.join(dup['files'][:3])}")
        
        # Save JSON report
        json_path = ROOT_DIR / 'codebase-deep-analysis.json'
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2)
        print(f"\n✅ JSON report saved to: {json_path}")
        
        # Save Markdown report
        md_report = analyzer.generate_markdown_report(analysis)
        md_path = ROOT_DIR / 'docs' / 'DEEP-CODEBASE-MAP.md'
        md_path.parent.mkdir(exist_ok=True)
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_report)
        print(f"✅ Markdown report saved to: {md_path}")
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)


if __name__ == '__main__':
    main()
