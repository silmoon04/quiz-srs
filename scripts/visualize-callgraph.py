#!/usr/bin/env python3
"""
visualize-callgraph.py
----------------------
Build a Graphviz DOT call graph from codebase-analysis.json.

Usage:
  python scripts/visualize-callgraph.py \
    --analysis codebase-analysis.json \
    --output docs/callgraph.dot \
    --focus app/page.tsx

Then render:
  dot -Tsvg docs/callgraph.dot -o docs/callgraph.svg
"""

import argparse
import json
import re
from pathlib import Path
from typing import Dict, Set, Tuple


def normalize_id(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9_]", "_", name)


def load_callgraph(path: Path) -> Dict[str, Set[str]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    raw = data.get("callGraph", {})
    graph: Dict[str, Set[str]] = {}
    for src, dests in raw.items():
        graph[src] = set(dests or [])
    return graph


def build_focus_graph(graph: Dict[str, Set[str]], focus: str, include_unknown: bool) -> Dict[str, Set[str]]:
    # focus can be a file path prefix or full function key "file::func"
    focus_norm = focus.replace("\\", "/")
    focused_nodes = {k for k in graph.keys() if k.replace("\\", "/").startswith(focus_norm)}
    if focus_norm in graph:
        focused_nodes.add(focus_norm)

    filtered: Dict[str, Set[str]] = {}
    for src in focused_nodes:
        for dst in graph.get(src, set()):
            if dst.startswith("?::"):
                if include_unknown:
                    filtered.setdefault(src, set()).add(dst)
                continue
            filtered.setdefault(src, set()).add(dst)
    return filtered


def write_dot(graph: Dict[str, Set[str]], output: Path):
    nodes = set(graph.keys())
    for dests in graph.values():
        nodes.update(dests)

    lines = [
        "digraph CallGraph {",
        "  rankdir=LR;",
        '  node [shape=box, style="rounded,filled", fillcolor="#fff7e6"];',
    ]
    for n in sorted(nodes):
        lines.append(f'  {normalize_id(n)} [label="{n}"];')
    for src, dests in graph.items():
        for dst in dests:
            lines.append(f"  {normalize_id(src)} -> {normalize_id(dst)};")
    lines.append("}")
    output.write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Render call graph from codebase-analysis.json")
    parser.add_argument("--analysis", default="codebase-analysis.json", type=Path)
    parser.add_argument("--output", default="docs/callgraph.dot", type=Path)
    parser.add_argument("--focus", required=True, help="File prefix or full function key")
    parser.add_argument("--include-unknown", action="store_true", help="Include unknown calls (?::)")
    args = parser.parse_args()

    graph = load_callgraph(args.analysis)
    focused = build_focus_graph(graph, args.focus, args.include_unknown)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    write_dot(focused, args.output)
    print(f"[ok] Wrote call graph DOT -> {args.output}")
    print("Render with: dot -Tsvg docs/callgraph.dot -o docs/callgraph.svg")


if __name__ == "__main__":
    main()
