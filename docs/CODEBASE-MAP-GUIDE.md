# Codebase Map Quick Guide

Use this to navigate the outputs from `deep-codebase-analyzer.py` and explore the DAG.

## Fresh data

- Analyzer outputs (regenerated):
  - `docs/DEEP-CODEBASE-MAP.md` (human-readable)
  - `codebase-deep-analysis.json` (machine-readable)

## Visualize the DAG

1. Generate Graphviz DOT (excludes tests by default, trims to top-degree 200 nodes):

```bash
python scripts/visualize-dag.py \
  --analysis codebase-deep-analysis.json \
  --output docs/codebase-graph.dot \
  --max-nodes 200
dot -Tsvg docs/codebase-graph.dot -o docs/codebase-graph.svg
```

2. Open `docs/codebase-graph.svg` for an interactive view (searchable in most SVG viewers).

To include tests:

```bash
python scripts/visualize-dag.py --include-tests --max-nodes 300
```

If `import_graph` is missing in the JSON, the script will fall back to a quick source scan. By default it keeps only local imports (`./`, `../`) to keep the graph flat. Add `--include-externals` if you want package nodes (e.g., `react`, `next`).

## Call graph visualization

You can generate a function-level call graph from `codebase-analysis.json`:

```bash
python scripts/visualize-callgraph.py --focus app/page.tsx
dot -Tsvg docs/callgraph.dot -o docs/callgraph.svg
```

The `--focus` option accepts a file prefix or a full `file::function` key.

## Quick reading order (DEEP-CODEBASE-MAP.md)

- **Entry Points**: start with the “Entry Points & Full Dependency Trees” table to see app surfaces (`app/page.tsx`, `app/layout.tsx`, feature containers).
- **Dead Code Candidates**: fast wins for cleanup; many are UI primitives and feature stubs.
- **Component/Hook Usage**: shows import counts (good to spot over/under-used parts).

## Fast queries (JSON)

- Top import hubs (PowerShell):

```powershell
Get-Content codebase-deep-analysis.json | `
  python - <<'PY'
import json, collections, sys
d=json.load(sys.stdin)
deg=collections.Counter()
for s, ds in d["import_graph"].items():
  deg[s]+=len(ds)
  for t in ds: deg[t]+=1
for n,c in deg.most_common(15):
  print(f"{c:4} {n}")
PY
```

- List dead-code files:

```powershell
python - <<'PY'
import json,sys
d=json.load(open("codebase-deep-analysis.json"))
for dc in d.get("dead_code", []):
  print(f"{dc['confidence']:>6} {dc['file_path']}")
PY
```

## Suggested map slices

- **Feature focus**: regenerate DOT with `--max-nodes 120` and open `docs/codebase-graph.svg` to see only the highest-degree files (usually `app/page.tsx`, `store/quiz-store.ts`, rendering/markdown helpers).
- **A11y focus**: include tests and filter viewer search by `Accessible` or `a11y/`.
- **Parser focus**: search the SVG for `quiz-validation` and `lib/quiz/parser`.

## Keeping it current

- After significant changes run:  
  `python scripts/deep-codebase-analyzer.py`  
  then regenerate DOT as above.
