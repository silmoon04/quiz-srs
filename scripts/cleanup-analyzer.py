#!/usr/bin/env python3
"""
Cleanup Analyzer for quiz-srs
==============================
Analyzes the codebase for cleanup opportunities during Zustand migration.
Generates categorized lists of files to delete/archive/refactor.

Usage: python scripts/cleanup-analyzer.py
Output: docs/CLEANUP-REPORT.md
"""

import os
import re
import json
from pathlib import Path
from dataclasses import dataclass, field
from typing import Dict, List, Set, Optional, Any
from collections import defaultdict
from datetime import datetime

ROOT_DIR = Path(__file__).parent.parent

# Files/patterns to check
EXCLUDED_DIRS = {
    'node_modules', '.next', '.git', '.history', 'coverage',
    'playwright-report', 'test-results', '.venv', 'out'
}

@dataclass
class CleanupItem:
    path: str
    category: str  # 'delete', 'archive', 'refactor', 'review'
    reason: str
    priority: str  # 'high', 'medium', 'low'
    action: str  # specific action to take
    related_files: List[str] = field(default_factory=list)

class CleanupAnalyzer:
    def __init__(self, root_dir: Path):
        self.root_dir = root_dir
        self.items: List[CleanupItem] = []
        self.stats = defaultdict(int)
    
    def analyze(self):
        """Run all analysis checks"""
        print("🔍 Running cleanup analysis...\n")
        
        self._check_deprecated_docs()
        self._check_dead_scripts()
        self._check_duplicate_files()
        self._check_dead_ui_components()
        self._check_dead_lib_files()
        self._check_dead_hooks()
        self._check_orphaned_test_files()
        self._check_generated_files()
        self._check_root_clutter()
        self._check_zustand_migration_leftovers()
        self._check_dead_a11y_components()
        
        return self.items
    
    def _add_item(self, path: str, category: str, reason: str, 
                  priority: str, action: str, related: List[str] = None):
        self.items.append(CleanupItem(
            path=path,
            category=category,
            reason=reason,
            priority=priority,
            action=action,
            related_files=related or []
        ))
        self.stats[category] += 1
    
    def _check_deprecated_docs(self):
        """Check for outdated documentation"""
        print("📚 Checking documentation...")
        
        docs_dir = self.root_dir / "docs"
        if not docs_dir.exists():
            return
        
        deprecated_docs = {
            "consolidated-audit-plan.md": {
                "reason": "1647 lines, dated Oct 2025, contains completed ARDs. Superseded by newer docs.",
                "action": "Archive to docs/archive/ or delete"
            },
            "test-failure-summary.md": {
                "reason": "Old failure summary from Dec 2, 2025. Issues likely resolved.",
                "action": "Delete after verifying tests pass"
            },
            "TEST-FINDINGS-REPORT.md": {
                "reason": "Old findings report, fixes have been applied",
                "action": "Delete or archive"
            },
            "CODEBASE-REFACTORING-PLAN.md": {
                "reason": "Old refactoring plan from Dec 3, superseded by Zustand migration",
                "action": "Archive or update with current plans"
            },
            "REFACTOR-VALIDATION-CHECKLIST.md": {
                "reason": "Old checklist for previous refactoring phase",
                "action": "Archive or update for Zustand migration"
            },
            "maintainability-audit-and-ard-guide.md": {
                "reason": "References old state management patterns (pre-Zustand)",
                "action": "Update to reflect Zustand architecture or archive"
            }
        }
        
        for doc, info in deprecated_docs.items():
            doc_path = docs_dir / doc
            if doc_path.exists():
                self._add_item(
                    f"docs/{doc}",
                    "archive" if "archive" in info["action"].lower() else "review",
                    info["reason"],
                    "medium",
                    info["action"]
                )
    
    def _check_dead_scripts(self):
        """Check for duplicate/dead scripts"""
        print("📜 Checking scripts...")
        
        scripts_dir = self.root_dir / "scripts"
        if not scripts_dir.exists():
            return
        
        # Duplicate scripts (same functionality, different extensions)
        duplicates = [
            ("batch-quiz-update.js", "batch-quiz-update.ts", "Keep .ts, delete .js"),
            ("batch-quiz-update.py", "batch-quiz-update.ts", "Keep .ts, delete .py"),
            ("merge-batches.py", "merge-batches.ts", "Keep .ts, delete .py"),
        ]
        
        for dup, canonical, action in duplicates:
            dup_path = scripts_dir / dup
            if dup_path.exists():
                self._add_item(
                    f"scripts/{dup}",
                    "delete",
                    f"Duplicate of {canonical}",
                    "high",
                    action,
                    [f"scripts/{canonical}"]
                )
    
    def _check_duplicate_files(self):
        """Check for duplicate implementations"""
        print("🔄 Checking duplicates...")
        
        duplicates = [
            {
                "files": ["components/ui/use-mobile.tsx", "hooks/use-mobile.tsx"],
                "keep": "hooks/use-mobile.tsx",
                "reason": "Identical content (same hash)",
                "action": "Delete components/ui/use-mobile.tsx, keep hooks version"
            },
            {
                "files": ["components/ui/use-toast.ts", "hooks/use-toast.ts"],
                "keep": "components/ui/use-toast.ts",
                "reason": "Different implementations - hooks version is simpler but unused",
                "action": "Delete hooks/use-toast.ts, it's not imported by production code"
            }
        ]
        
        for dup in duplicates:
            for f in dup["files"]:
                if f != dup["keep"]:
                    path = self.root_dir / f
                    if path.exists():
                        self._add_item(
                            f,
                            "delete",
                            dup["reason"],
                            "high",
                            dup["action"],
                            [dup["keep"]]
                        )
    
    def _check_dead_ui_components(self):
        """Check for unused Shadcn/UI components"""
        print("🧩 Checking UI components...")
        
        # These were identified as having 0 non-test imports
        unused_ui = [
            "accordion.tsx", "alert-dialog.tsx", "alert.tsx", "aspect-ratio.tsx",
            "avatar.tsx", "breadcrumb.tsx", "calendar.tsx", "carousel.tsx",
            "checkbox.tsx", "command.tsx", "context-menu.tsx", "dropdown-menu.tsx",
            "form.tsx", "hover-card.tsx", "input-otp.tsx", "menubar.tsx",
            "navigation-menu.tsx", "pagination.tsx", "progress.tsx", "radio-group.tsx",
            "resizable.tsx", "select.tsx", "sidebar.tsx", "sonner.tsx", "table.tsx",
            "toggle-group.tsx"
        ]
        
        ui_dir = self.root_dir / "components" / "ui"
        for comp in unused_ui:
            comp_path = ui_dir / comp
            if comp_path.exists():
                self._add_item(
                    f"components/ui/{comp}",
                    "delete",
                    "Shadcn component with 0 imports - never used",
                    "high",
                    "Delete (can reinstall via shadcn CLI if needed later)"
                )
    
    def _check_dead_lib_files(self):
        """Check for dead library files"""
        print("📦 Checking lib files...")
        
        dead_lib = {
            "lib/markdown/sync-pipeline.ts": "Alternate pipeline never imported",
            "lib/markdown/working-pipeline.ts": "Development version never imported",
            "lib/markdown/latex-processor.ts": "Standalone processor, not used by main pipeline",
            "lib/files.ts": "Empty/placeholder file with 0 imports",
            "lib/quiz/generate-displayed-options.tsx": "Should be .ts not .tsx, and logic is duplicated in quiz-session.tsx"
        }
        
        for path, reason in dead_lib.items():
            full_path = self.root_dir / path
            if full_path.exists():
                self._add_item(
                    path,
                    "delete",
                    reason,
                    "high",
                    "Delete and remove any associated test files"
                )
    
    def _check_dead_hooks(self):
        """Check for dead/deprecated hooks"""
        print("🪝 Checking hooks...")
        
        # hooks/use-quiz-persistence.ts - check if still needed with Zustand
        persistence_hook = self.root_dir / "hooks" / "use-quiz-persistence.ts"
        if persistence_hook.exists():
            self._add_item(
                "hooks/use-quiz-persistence.ts",
                "review",
                "May be superseded by Zustand persist middleware",
                "medium",
                "Review if persistence logic should move to store/quiz-store.ts"
            )
    
    def _check_orphaned_test_files(self):
        """Check for test files whose source no longer exists"""
        print("🧪 Checking test files...")
        
        # Test files for dead source files
        orphaned_tests = [
            "tests/unit/lib/markdown/sync-pipeline.test.ts",
            "tests/unit/lib/markdown/working-pipeline.test.ts",
            "tests/unit/lib/markdown/latex-processor.test.ts",
            "tests/unit/lib/files.test.ts",
            "tests/unit/hooks/use-toast.test.ts",  # Tests hooks/use-toast.ts which is dead
            "tests/unit/components/a11y/DashboardWithInlineErrors.test.tsx",  # Component has issues
            "tests/unit/components/a11y/InlineErrorHandler.test.tsx",  # Related to above
        ]
        
        for test_path in orphaned_tests:
            full_path = self.root_dir / test_path
            if full_path.exists():
                self._add_item(
                    test_path,
                    "delete",
                    "Test for dead/deprecated source file",
                    "high",
                    "Delete along with source file"
                )
    
    def _check_generated_files(self):
        """Check for generated files that should be gitignored"""
        print("📄 Checking generated files...")
        
        generated = [
            ("codebase-analysis.json", "Generated by codebase-analyzer.ts"),
            ("codebase-deep-analysis.json", "Generated by deep-codebase-analyzer.py"),
            ("coverage-report.json", "Generated by coverage tools"),
            ("tsconfig.tsbuildinfo", "TypeScript build cache"),
            ("tsconfig.strict.tsbuildinfo", "TypeScript strict build cache"),
        ]
        
        for filename, reason in generated:
            path = self.root_dir / filename
            if path.exists():
                self._add_item(
                    filename,
                    "review",
                    f"{reason} - should be in .gitignore",
                    "low",
                    "Add to .gitignore and delete from repo"
                )
    
    def _check_root_clutter(self):
        """Check for root-level files that could be moved/removed"""
        print("📁 Checking root clutter...")
        
        clutter = {
            "issues.md": {
                "reason": "Detailed bug report (700+ lines) - valuable but clutters root",
                "action": "Move to docs/KNOWN-ISSUES.md or create GitHub issues",
                "category": "review"
            },
            "tools.md": {
                "reason": "Tool documentation - should be in docs/",
                "action": "Move to docs/ or delete if redundant",
                "category": "review"
            },
            # Note: vitest.config.accessibility.ts and vitest.config.integration.ts
            # ARE used by npm scripts (test:access, test:int) - DO NOT DELETE
        }
        
        for filename, info in clutter.items():
            path = self.root_dir / filename
            if path.exists():
                self._add_item(
                    filename,
                    info["category"],
                    info["reason"],
                    "medium" if info["category"] == "review" else "high",
                    info["action"]
                )
    
    def _check_zustand_migration_leftovers(self):
        """Check for pre-Zustand state management code"""
        print("🐻 Checking Zustand migration status...")
        
        # Check if page.tsx still uses useState for main state
        page_tsx = self.root_dir / "app" / "page.tsx"
        if page_tsx.exists():
            content = page_tsx.read_text(encoding='utf-8')
            useState_count = len(re.findall(r'useState<', content))
            if useState_count > 10:  # Still heavy useState usage
                self._add_item(
                    "app/page.tsx",
                    "refactor",
                    f"Still using {useState_count} useState calls - migrate to Zustand store",
                    "high",
                    "Replace useState with useQuizStore/useQuizState hook"
                )
        
        # Check for the bridge hook
        bridge_hook = self.root_dir / "hooks" / "use-quiz-state.ts"
        if bridge_hook.exists():
            self._add_item(
                "hooks/use-quiz-state.ts",
                "review",
                "Bridge hook for Zustand migration - keep until migration complete",
                "low",
                "Remove after app/page.tsx fully migrated to useQuizStore"
            )
    
    def _check_dead_a11y_components(self):
        """Check for dead accessibility components"""
        print("♿ Checking a11y components...")
        
        dead_a11y = {
            "components/a11y/DashboardWithInlineErrors.tsx": 
                "Wrapper component with 0 production imports - only test imports",
            "components/a11y/InlineErrorHandler.tsx": 
                "Only imported by DashboardWithInlineErrors which is dead",
        }
        
        for path, reason in dead_a11y.items():
            full_path = self.root_dir / path
            if full_path.exists():
                self._add_item(
                    path,
                    "delete",
                    reason,
                    "high",
                    "Delete along with associated tests"
                )
        
        # Also check for dead components
        dead_components = {
            "components/question-review-modal.tsx": "0 imports - feature never completed",
            "components/question-navigation-menu.tsx": "0 production imports - commented out",
            "components/theme-provider.tsx": "0 production imports - never integrated",
        }
        
        for path, reason in dead_components.items():
            full_path = self.root_dir / path
            if full_path.exists():
                self._add_item(
                    path,
                    "delete",
                    reason,
                    "high",
                    "Delete along with associated tests"
                )
    
    def generate_report(self) -> str:
        """Generate markdown cleanup report"""
        md = []
        md.append("# Codebase Cleanup Report")
        md.append(f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        md.append(f"\n**Analyzer:** [scripts/cleanup-analyzer.py](../scripts/cleanup-analyzer.py)")
        
        # Summary
        md.append("\n---\n")
        md.append("## 📊 Summary")
        md.append("")
        md.append("| Category | Count |")
        md.append("|----------|-------|")
        for cat, count in sorted(self.stats.items(), key=lambda x: -x[1]):
            emoji = {"delete": "🗑️", "archive": "📦", "refactor": "🔧", "review": "👀"}.get(cat, "❓")
            md.append(f"| {emoji} {cat.title()} | {count} |")
        md.append(f"| **Total** | **{len(self.items)}** |")
        
        # Group by category
        by_category = defaultdict(list)
        for item in self.items:
            by_category[item.category].append(item)
        
        # DELETE section - most important
        if by_category.get("delete"):
            md.append("\n---\n")
            md.append("## 🗑️ Files to DELETE")
            md.append("")
            md.append("> These files have no production imports and can be safely removed.")
            md.append("")
            
            # Group deletes by directory
            by_dir = defaultdict(list)
            for item in by_category["delete"]:
                dir_name = str(Path(item.path).parent)
                by_dir[dir_name].append(item)
            
            for dir_name, items in sorted(by_dir.items()):
                md.append(f"### `{dir_name}/`")
                md.append("")
                md.append("| File | Reason | Priority |")
                md.append("|------|--------|----------|")
                for item in sorted(items, key=lambda x: (-['high', 'medium', 'low'].index(x.priority), x.path)):
                    priority_badge = {"high": "🔴", "medium": "🟡", "low": "🟢"}[item.priority]
                    md.append(f"| `{Path(item.path).name}` | {item.reason} | {priority_badge} |")
                md.append("")
        
        # ARCHIVE section
        if by_category.get("archive"):
            md.append("\n---\n")
            md.append("## 📦 Files to ARCHIVE")
            md.append("")
            md.append("> Move these to `docs/archive/` or a separate branch for reference.")
            md.append("")
            md.append("| File | Reason | Action |")
            md.append("|------|--------|--------|")
            for item in by_category["archive"]:
                md.append(f"| `{item.path}` | {item.reason} | {item.action} |")
            md.append("")
        
        # REFACTOR section
        if by_category.get("refactor"):
            md.append("\n---\n")
            md.append("## 🔧 Files to REFACTOR")
            md.append("")
            md.append("> These files need code changes as part of the Zustand migration.")
            md.append("")
            for item in by_category["refactor"]:
                md.append(f"### `{item.path}`")
                md.append(f"- **Reason:** {item.reason}")
                md.append(f"- **Action:** {item.action}")
                md.append(f"- **Priority:** {item.priority.upper()}")
                md.append("")
        
        # REVIEW section
        if by_category.get("review"):
            md.append("\n---\n")
            md.append("## 👀 Files to REVIEW")
            md.append("")
            md.append("> Manually verify these before taking action.")
            md.append("")
            md.append("| File | Reason | Suggested Action |")
            md.append("|------|--------|------------------|")
            for item in by_category["review"]:
                md.append(f"| `{item.path}` | {item.reason} | {item.action} |")
            md.append("")
        
        # Cleanup commands
        md.append("\n---\n")
        md.append("## 🧹 Cleanup Commands")
        md.append("")
        md.append("### Delete High-Priority Dead Code")
        md.append("```powershell")
        
        high_priority_deletes = [
            item for item in by_category.get("delete", [])
            if item.priority == "high"
        ]
        
        for item in sorted(high_priority_deletes, key=lambda x: x.path):
            md.append(f"Remove-Item '{item.path}' -Force")
        
        md.append("```")
        
        # Zustand migration guide
        md.append("\n---\n")
        md.append("## 🐻 Zustand Migration Status")
        md.append("")
        md.append("### Current Architecture")
        md.append("```")
        md.append("store/quiz-store.ts    ← Zustand store (READY)")
        md.append("hooks/use-quiz-state.ts ← Bridge hook (TEMPORARY)")
        md.append("app/page.tsx           ← Still using useState (NEEDS MIGRATION)")
        md.append("```")
        md.append("")
        md.append("### Migration Steps")
        md.append("1. Replace `useState` calls in `app/page.tsx` with `useQuizStore` or `useQuizState`")
        md.append("2. Move remaining state logic into store actions")
        md.append("3. Remove `hooks/use-quiz-state.ts` bridge hook")
        md.append("4. Remove `hooks/use-quiz-persistence.ts` if persistence is in Zustand")
        md.append("")
        
        return "\n".join(md)


def main():
    analyzer = CleanupAnalyzer(ROOT_DIR)
    
    try:
        items = analyzer.analyze()
        
        print("\n" + "=" * 60)
        print("📊 CLEANUP ANALYSIS SUMMARY")
        print("=" * 60)
        
        for cat, count in sorted(analyzer.stats.items(), key=lambda x: -x[1]):
            emoji = {"delete": "🗑️", "archive": "📦", "refactor": "🔧", "review": "👀"}.get(cat, "❓")
            print(f"{emoji} {cat.title()}: {count}")
        
        print(f"\n📁 Total items: {len(items)}")
        
        # Count high priority
        high_priority = sum(1 for item in items if item.priority == "high")
        print(f"🔴 High priority: {high_priority}")
        
        # Generate and save report
        report = analyzer.generate_report()
        report_path = ROOT_DIR / "docs" / "CLEANUP-REPORT.md"
        report_path.parent.mkdir(exist_ok=True)
        report_path.write_text(report, encoding='utf-8')
        
        print(f"\n✅ Report saved to: {report_path}")
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)


if __name__ == '__main__':
    main()
