# Remaining Checklist

- [ ] Confirm no other `.props`/`.prev`/`.state` regressions remain after Patch 001; if needed, run codemod (Patch 006).
- [ ] Replace all import sites to use `components/ui/use-toast` and remove the duplicate `hooks/use-toast` if unused.
- [ ] Confirm only secure `MarkdownRenderer` is used; delete legacy ad‑hoc sanitizer.
- [ ] Flip TS strict and address any fallout; raise lints as we go.
- [ ] Re-run `depcheck`/`ts-prune`/`knip`/`madge`; prune unused shadcn components.
- [ ] Verify KaTeX visuals post CSS import and CSP headers don’t block styles.
- [ ] Ensure size budget passes on CI (500 KB).
