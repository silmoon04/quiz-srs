# Subagent 5: Security & Injection - Iteration 2

## Focus Area

XSS prevention, injection attacks, validation bypass, security concerns

---

## Generated E2E Test Ideas

### SA5-011: Script tags in question text are sanitized

- **Scenario**: Quiz has <script>alert('xss')</script> in question
- **Risk**: Script executes, XSS vulnerability
- **Test**: Import malicious quiz, verify script doesn't run

### SA5-012: Event handlers in markdown are stripped

- **Scenario**: Question contains <img onerror="alert(1)">
- **Risk**: Inline event handler executes
- **Test**: Import quiz with event handlers, verify stripped

### SA5-013: JavaScript: URLs in links are blocked

- **Scenario**: Link in explanation: [click](<javascript:alert(1)>)
- **Risk**: Clicking executes JavaScript
- **Test**: Import quiz with js URL, verify blocked

### SA5-014: SVG with embedded script sanitized

- **Scenario**: SVG image with <script> inside
- **Risk**: SVG script executes
- **Test**: Import quiz with malicious SVG, verify safe

### SA5-015: CSS injection via style attributes blocked

- **Scenario**: Element with style="background:url(evil.com)"
- **Risk**: Data exfiltration via CSS
- **Test**: Import quiz with CSS injection, verify stripped

### SA5-016: Form elements in quiz content are disabled

- **Scenario**: Question contains <form action="evil.com">
- **Risk**: User submits form to attacker
- **Test**: Import quiz with form, verify not functional

### SA5-017: External resource loading blocked in sandbox

- **Scenario**: Quiz references external JS/CSS
- **Risk**: Third-party code executes
- **Test**: Import quiz with external resources, verify blocked

### SA5-018: Deeply nested HTML doesn't cause regex DoS

- **Scenario**: 1000 levels of nested <div> tags
- **Risk**: Sanitizer hangs on complex input
- **Test**: Import deeply nested HTML, verify quick processing

### SA5-019: Unicode normalization attacks handled

- **Scenario**: Homograph attack in option text (looks like correct but isn't)
- **Risk**: User confused by lookalike characters
- **Test**: Import quiz with confusable chars, verify rendering

### SA5-020: Prototype pollution via quiz JSON prevented

- **Scenario**: Quiz JSON has "**proto**" key
- **Risk**: Pollutes Object prototype
- **Test**: Import quiz with proto pollution, verify blocked
