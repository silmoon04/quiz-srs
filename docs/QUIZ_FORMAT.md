# Writing a quiz

Upload a `.md` file from the welcome screen to load a Markdown quiz. A file has a module title, one or more chapters, and questions separated by a line containing `---`.

Save this example as `example.md`:

```markdown
# Data structures practice

_A short quiz on stacks and queues._

---

## Stacks and queues
<!-- CH_ID: stacks-queues -->

---

### Q: Which structure removes the most recently added item first?
<!-- Q_ID: lifo -->

**Options:**
**A1:** A queue
**A2:** A stack
**A3:** A set
**A4:** A hash map

**Correct:** A2

**Exp:**
A stack uses last-in, first-out ordering. A queue uses first-in, first-out ordering.

---

### T/F: A queue normally removes items in the order they were added.
<!-- Q_ID: fifo -->

**Correct:** True

**Exp:**
This is first-in, first-out ordering.
```

## Format notes

- Use `#` for the module title, `##` for chapters, and `### Q:` or `### T/F:` for questions. Put `---` between these blocks.
- Multiple-choice questions need `**Options:**`, numbered answers such as `**A1:**`, `**Correct:**`, and `**Exp:**`.
- For alternative valid answers, list their labels with commas, for example `**Correct:** A2, A4`. The app varies which answers it displays; it is not a select-all-that-apply quiz.
- True/false questions use `**Correct:** True` or `**Correct:** False` and an explanation. Their options are generated automatically.
- IDs are optional, but explicit, unique `CH_ID` and `Q_ID` comments help keep questions identifiable when editing a module. Put them on separate lines, as in the example.
- Questions and explanations can contain Markdown and maths. Avoid a standalone `---` inside a question or code sample because the parser uses it as a block separator.

For a larger example, see [the included question bank](../public/default-quiz.md). JSON imports use the structure in [default-quiz.json](../public/default-quiz.json); a dashboard progress export also provides a JSON file you can import again.
