#!/usr/bin/env python3
"""
architecture-metrics.py
-----------------------
Compute basic coupling/cohesion metrics from local imports and the
codebase-analysis.json call graph output. Writes a JSON summary that can
be embedded in architecture audit docs.

Usage:
  python scripts/architecture-metrics.py
Output:
  docs/ARCHITECTURE-METRICS.json
"""

from __future__ import annotations

import json
import os
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple

ROOT = Path(__file__).parent.parent
OUTPUT = ROOT / "docs" / "ARCHITECTURE-METRICS.json"

EXCLUDED_DIRS = {
    "node_modules",
    ".next",
    ".git",
    ".history",
    "out",
    "coverage",
    "playwright-report",
    "test-results",
    ".venv",
    "__pycache__",
    ".turbo",
    "dist",
    "build",
}

CODE_EXTS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
ALIAS_PREFIX = "@/"

IMPORT_RE = re.compile(
    r"""import\s+[^'"]*\s+from\s+['"]([^'"]+)['"]|"""
    r"""export\s+[^'"]*\s+from\s+['"]([^'"]+)['"]|"""
    r"""require\(\s*['"]([^'"]+)['"]\s*\)|"""
    r"""import\(\s*['"]([^'"]+)['"]\s*\)"""
)


def iter_code_files(root: Path) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        for fname in filenames:
            path = Path(dirpath) / fname
            if path.suffix in CODE_EXTS:
                yield path


def normalize_path(path: Path) -> str:
    return path.as_posix()


def resolve_import(src_file: Path, target: str, file_index: Dict[str, Path]) -> Optional[str]:
    if target.startswith(ALIAS_PREFIX):
        rel = target[len(ALIAS_PREFIX) :]
        base = ROOT / rel
    elif target.startswith("."):
        base = (src_file.parent / target).resolve()
    elif target.startswith("/"):
        base = (ROOT / target.lstrip("/")).resolve()
    else:
        # external package
        return None

    # If target already has extension
    if base.suffix in CODE_EXTS and base.exists():
        return normalize_path(base.relative_to(ROOT))

    # Try exact file match with extensions
    for ext in CODE_EXTS:
        candidate = Path(str(base) + ext)
        if candidate.exists():
            return normalize_path(candidate.relative_to(ROOT))

    # Try index.* in a folder
    if base.exists() and base.is_dir():
        for ext in CODE_EXTS:
            candidate = base / f"index{ext}"
            if candidate.exists():
                return normalize_path(candidate.relative_to(ROOT))

    return None


def layer_for(path: str) -> str:
    parts = path.split("/")
    if not parts:
        return "other"
    head = parts[0]
    if head in {
        "app",
        "features",
        "components",
        "hooks",
        "store",
        "lib",
        "utils",
        "types",
        "services",
        "config",
        "scripts",
        "tests",
        "public",
    }:
        return head
    return "other"


def is_layer_violation(src_layer: str, dst_layer: str) -> bool:
    # Simple rules to flag high-risk coupling
    if src_layer in {"lib", "utils", "store", "types"} and dst_layer in {
        "components",
        "features",
        "app",
    }:
        return True
    if src_layer in {"components", "features"} and dst_layer == "app":
        return True
    if src_layer == "types" and dst_layer != "types":
        # types should not import runtime code
        return True
    return False


def load_function_counts() -> Dict[str, int]:
    result: Dict[str, int] = {}
    report = ROOT / "codebase-analysis.json"
    if not report.exists():
        return result
    data = json.loads(report.read_text(encoding="utf-8"))
    for entry in data.get("files", []):
        rel = entry.get("relativePath", "")
        rel_norm = rel.replace("\\", "/")
        result[rel_norm] = len(entry.get("functions", []))
    return result


def load_export_counts() -> Dict[str, Tuple[int, int]]:
    result: Dict[str, Tuple[int, int]] = {}
    report = ROOT / "codebase-analysis.json"
    if not report.exists():
        return result
    data = json.loads(report.read_text(encoding="utf-8"))
    for entry in data.get("files", []):
        rel = entry.get("relativePath", "").replace("\\", "/")
        exports = entry.get("exports", [])
        total = len(exports)
        dead = sum(1 for e in exports if not e.get("isUsedExternally"))
        result[rel] = (total, dead)
    return result


def main() -> None:
    file_index: Dict[str, Path] = {}
    for path in iter_code_files(ROOT):
        file_index[normalize_path(path.relative_to(ROOT))] = path

    edges: Dict[str, Set[str]] = defaultdict(set)

    for rel, abs_path in file_index.items():
        try:
            text = abs_path.read_text(encoding="utf-8")
        except Exception:
            continue
        for match in IMPORT_RE.finditer(text):
            target = match.group(1) or match.group(2) or match.group(3) or match.group(4)
            if not target:
                continue
            resolved = resolve_import(abs_path, target, file_index)
            if resolved:
                edges[rel].add(resolved)

    # Compute degrees
    fan_out = {src: len(dests) for src, dests in edges.items()}
    fan_in: Dict[str, int] = Counter()
    for src, dests in edges.items():
        for dst in dests:
            fan_in[dst] += 1

    # Layer coupling
    layer_edges: Counter = Counter()
    violations: List[Tuple[str, str]] = []
    for src, dests in edges.items():
        src_layer = layer_for(src)
        for dst in dests:
            dst_layer = layer_for(dst)
            layer_edges[(src_layer, dst_layer)] += 1
            if is_layer_violation(src_layer, dst_layer):
                violations.append((src, dst))

    # Cohesion heuristics
    func_counts = load_function_counts()
    export_counts = load_export_counts()
    low_cohesion_candidates = []
    for rel, abs_path in file_index.items():
        size = abs_path.stat().st_size
        funcs = func_counts.get(rel, 0)
        if funcs >= 10 and size >= 15_000:
            low_cohesion_candidates.append((rel, funcs, size))
    low_cohesion_candidates.sort(key=lambda x: (x[2], x[1]), reverse=True)

    # Prepare report
    report = {
        "summary": {
            "files": len(file_index),
            "edges": sum(len(v) for v in edges.values()),
            "fan_in_nodes": len(fan_in),
            "fan_out_nodes": len(fan_out),
        },
        "top_fan_in": sorted(fan_in.items(), key=lambda x: x[1], reverse=True)[:15],
        "top_fan_out": sorted(fan_out.items(), key=lambda x: x[1], reverse=True)[:15],
        "layer_edges": [
            {"from": k[0], "to": k[1], "count": v}
            for k, v in layer_edges.most_common(25)
        ],
        "layer_violations_sample": violations[:30],
        "low_cohesion_candidates": low_cohesion_candidates[:20],
        "export_dead_ratio_sample": [
            {"file": k, "exports": v[0], "dead": v[1]}
            for k, v in list(export_counts.items())[:30]
        ],
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"[ok] Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
