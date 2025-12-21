#!/usr/bin/env python3
"""
visualize-dag.py
----------------
Utility to turn `codebase-deep-analysis.json` (from deep-codebase-analyzer.py)
into a Graphviz DOT graph for quick visualization.

Usage:
  python scripts/visualize-dag.py \
    --analysis codebase-deep-analysis.json \
    --output docs/codebase-graph.dot \
    --format dot \
    --max-nodes 150

Then render with:
  dot -Tsvg docs/codebase-graph.dot -o docs/codebase-graph.svg
"""

import argparse
import os
import json
import re
from pathlib import Path
from typing import Dict, Set, Tuple


def normalize_id(path: str) -> str:
    """Make a safe Graphviz node id."""
    return re.sub(r"[^A-Za-z0-9_]", "_", path)


def load_graph(path: Path) -> Dict[str, Set[str]]:
    """Load graph from analyzer output. Falls back to empty graph if missing."""
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    raw_graph = data.get("import_graph", {}) or {}
    graph: Dict[str, Set[str]] = {}
    for src, dests in raw_graph.items():
        graph[src] = set(dests)
    return graph


def quick_scan_files(root: Path, include_externals: bool = False) -> Dict[str, Set[str]]:
    """
    Fallback: scan .ts/.tsx/.js/.jsx/.mjs/.cjs files for import statements and
    build a light-weight graph when analyzer JSON lacks import_graph.
    """
    code_exts = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
    excluded = {
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
    graph: Dict[str, Set[str]] = {}
    import_re = re.compile(r"""import\s+[^'"]*\s+from\s+['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)""")

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in excluded]
        for fname in filenames:
            file = Path(dirpath) / fname
            if file.suffix not in code_exts:
                continue
            rel = file.relative_to(root).as_posix()
            try:
                text = file.read_text(encoding="utf-8")
            except Exception:
                continue
            for match in import_re.finditer(text):
                target = match.group(1) or match.group(2)
                if not target:
                    continue
                # Skip external packages unless requested
                if not include_externals and not target.startswith("."):
                    continue
                graph.setdefault(rel, set()).add(target)
    return graph


def filter_nodes(graph: Dict[str, Set[str]], include_tests: bool, max_nodes: int | None):
    nodes: Set[str] = set(graph.keys())
    for dests in graph.values():
        nodes.update(dests)

    if not include_tests:
        nodes = {n for n in nodes if "tests/" not in n.replace("\\", "/")}

    # Rank by degree to trim if needed
    if max_nodes and len(nodes) > max_nodes:
        degree: Dict[str, int] = {n: 0 for n in nodes}
        for src, dests in graph.items():
            for dst in dests:
                if src in degree:
                    degree[src] += 1
                if dst in degree:
                    degree[dst] += 1
        nodes = set(sorted(degree, key=lambda k: degree[k], reverse=True)[:max_nodes])

    # Prune edges to kept nodes
    filtered_graph: Dict[str, Set[str]] = {}
    for src, dests in graph.items():
        if src not in nodes:
            continue
        kept = {d for d in dests if d in nodes}
        if kept:
            filtered_graph[src] = kept
    return nodes, filtered_graph


def write_dot(nodes: Set[str], graph: Dict[str, Set[str]], output: Path):
    lines = ["digraph Codebase {", "  rankdir=LR;", '  node [shape=box, style="rounded,filled", fillcolor="#f0f4ff"];']
    for n in sorted(nodes):
        lines.append(f'  {normalize_id(n)} [label="{n}"];')
    for src, dests in graph.items():
        for dst in dests:
            lines.append(f"  {normalize_id(src)} -> {normalize_id(dst)};")
    lines.append("}")
    output.write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Render codebase DAG to Graphviz DOT.")
    parser.add_argument("--analysis", default="codebase-deep-analysis.json", type=Path, help="Path to codebase-deep-analysis.json")
    parser.add_argument("--output", default="docs/codebase-graph.dot", type=Path, help="Output DOT file")
    parser.add_argument("--include-tests", action="store_true", help="Include test files in the graph")
    parser.add_argument("--max-nodes", type=int, default=200, help="Limit number of nodes (ranked by degree)")
    parser.add_argument("--root", default=".", type=Path, help="Project root (for fallback scan)")
    parser.add_argument("--include-externals", action="store_true", help="Keep npm package imports as nodes (default: locals only)")
    args = parser.parse_args()

    graph = load_graph(args.analysis)
    if not graph:
        print("! import_graph missing in analysis JSON, falling back to quick file scan...")
        graph = quick_scan_files(args.root.resolve(), include_externals=args.include_externals)

    nodes, filtered = filter_nodes(graph, include_tests=args.include_tests, max_nodes=args.max_nodes)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    write_dot(nodes, filtered, args.output)
    print(f"[ok] Wrote Graphviz DOT with {len(nodes)} nodes, {sum(len(v) for v in filtered.values())} edges -> {args.output}")
    print("Render with: dot -Tsvg docs/codebase-graph.dot -o docs/codebase-graph.svg")


if __name__ == "__main__":
    main()
