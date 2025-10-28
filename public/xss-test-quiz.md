# XSS Security Test Quiz

_This quiz explores common cross-site scripting vectors to validate the SecureTextRenderer's sanitization pipeline._

---

## Chapter 1: Core DOM Injection Vectors <!-- CH_ID: xss_core -->

---

### Q: Basic click handler sanitization <!-- Q_ID: xss_dom_click -->

What happens when you click this button?

<div onclick="alert('XSS Attack!')">Click me for XSS</div>

**Options:**

- **A1:** Nothing happens (the handler is stripped)
- **A2:** An alert pops up (handler still active)
- **A3:** The page crashes
- **A4:** The button disappears

**Correct:** A1

**Exp:**
Inline event handlers such as `onclick` should be removed, making the element safe to interact with.

---

### Q: Image onerror sanitization <!-- Q_ID: xss_img_onerror -->

What happens when this image fails to load?

<img src="x" onerror="alert('XSS via img')" alt="Test image">

**Options:**

- **A1:** A broken-image icon appears with no alert
- **A2:** An alert pops up with "XSS via img"
- **A3:** The page crashes immediately
- **A4:** Nothing renders at all

**Correct:** A1

**Exp:**
The `onerror` attribute should be stripped, preventing the alert while preserving the fallback rendering.

---

### Q: Script tag execution <!-- Q_ID: xss_script_tag -->

Will this script execute?

<script>alert('XSS via script tag')</script>

**Options:**

- **A1:** Yes, the alert will fire
- **A2:** No, the script element is dropped
- **A3:** The page crashes during parsing
- **A4:** The script renders as plain text

**Correct:** A2

**Exp:**
`<script>` tags should be removed entirely to avoid executing arbitrary JavaScript.

---

### Q: Iframe javascript URL handling <!-- Q_ID: xss_iframe_jsurl -->

What happens with this iframe?

<iframe src="javascript:alert('XSS via iframe')"></iframe>

**Options:**

- **A1:** The iframe loads and executes the alert
- **A2:** The iframe is stripped or sanitized
- **A3:** The page crashes when rendering the iframe
- **A4:** The iframe loads but shows a blank page

**Correct:** A2

**Exp:**
`iframe` elements pointing to `javascript:` URLs should be removed to block navigation-based XSS vectors.

---

### Q: Dangerous link handling <!-- Q_ID: xss_link_jsurl -->

What happens when you click this link?

<a href="javascript:alert('XSS via link')">Dangerous link</a>

**Options:**

- **A1:** An alert fires via the JavaScript URL
- **A2:** The link is rewritten or rendered inert
- **A3:** The page crashes on click
- **A4:** The link disappears entirely

**Correct:** A2

**Exp:**
Links using `javascript:` URLs should be transformed into safe text or inert anchors.

---

### Q: Multiple event handler stripping <!-- Q_ID: xss_multi_handler -->

What happens with this complex payload?

<div onmouseover="alert('XSS')" onload="alert('XSS')" onclick="alert('XSS')">Hover me</div>

**Options:**

- **A1:** Multiple alerts trigger on hover and click
- **A2:** All event handlers are stripped
- **A3:** The page crashes due to conflicting handlers
- **A4:** Only one handler remains active

**Correct:** A2

**Exp:**
Sanitization should remove every inline handler, leaving the element safe to hover or click.

---

### Q: CSS javascript URL sanitization <!-- Q_ID: xss_css_jsurl -->

What happens with this style-based vector?

<div style="background: url('javascript:alert(1)')">Styled div</div>

**Options:**

- **A1:** The background loads and runs the alert
- **A2:** The dangerous URL is removed from the style
- **A3:** The entire div is dropped
- **A4:** The background becomes a plain color

**Correct:** A2

**Exp:**
CSS properties containing `javascript:` URLs must be stripped or neutralized during sanitization.

---

## Chapter 2: Advanced XSS Vectors <!-- CH_ID: xss_advanced -->

---

### Q: Form submission sanitization <!-- Q_ID: xss_form_action -->

What happens with this form submission?

<form action="javascript:alert('XSS')" onsubmit="alert('XSS')">
  <input type="text" value="test" onfocus="alert('XSS')">
  <input type="submit" value="Submit" onclick="alert('XSS')">
</form>

**Options:**

- **A1:** The form submits and multiple alerts fire
- **A2:** Dangerous attributes are removed, making the form inert
- **A3:** The page crashes when the form renders
- **A4:** The entire form disappears

**Correct:** A2

**Exp:**
Forms should have unsafe actions removed and inline handlers stripped to avoid execution on focus, click, or submit.

---

### Q: Mixed markdown and script <!-- Q_ID: xss_mixed_markdown -->

How does this mixed content render?

This is **bold** text with <script>alert('XSS')</script> and _italic_ text.

**Options:**

- **A1:** Bold renders, the script executes, and italic renders
- **A2:** Bold and italic render while the script is removed
- **A3:** The page crashes when encountering the script
- **A4:** Only the script remains visible

**Correct:** A2

**Exp:**
Sanitization should remove the script tag while preserving surrounding Markdown formatting.

---

### Q: LaTeX with embedded script <!-- Q_ID: xss_latex_script -->

What happens with this LaTeX snippet containing a script tag?

The formula is $x^2 + y^2 = z^2$ and here's some XSS: <script>alert('XSS')</script>

**Options:**

- **A1:** The formula renders and the script executes
- **A2:** The formula renders and the script is removed
- **A3:** Neither the formula nor the script render
- **A4:** The page crashes while parsing

**Correct:** A2

**Exp:**
KaTeX content should render normally while sanitizer removes embedded script tags.

---

### Q: SVG attribute sanitization <!-- Q_ID: xss_svg_onload -->

What happens with this SVG?

<svg onload="alert('XSS via SVG')"><circle cx="50" cy="50" r="40"/></svg>

**Options:**

- **A1:** The SVG renders and the alert fires
- **A2:** The SVG renders but the onload attribute is stripped
- **A3:** The page crashes when loading the SVG
- **A4:** The entire SVG is removed

**Correct:** A2

**Exp:**
SVG elements should pass through while event attributes like `onload` are stripped.

---

### Q: Object tag sanitization <!-- Q_ID: xss_object_tag -->

What happens with this object element?

<object data="javascript:alert('XSS')" onload="alert('XSS')"></object>

**Options:**

- **A1:** The object loads and executes alerts
- **A2:** The object element is removed or sanitized
- **A3:** The page crashes
- **A4:** The object loads but fails silently

**Correct:** A2

**Exp:**
`object` elements with dangerous sources or event handlers should be removed to prevent script execution.

---

### Q: Audio tag attributes <!-- Q_ID: xss_audio_tag -->

What happens with this audio element?

<audio autoplay onplay="alert('XSS')" src="javascript:alert('XSS')"></audio>

**Options:**

- **A1:** Audio plays and alerts fire
- **A2:** Dangerous attributes and sources are stripped
- **A3:** The page crashes when audio loads
- **A4:** The audio element renders but is muted

**Correct:** A2

**Exp:**
Audio/video tags require sanitization of both event attributes and source URLs to prevent execution.

---

### Q: Video tag attributes <!-- Q_ID: xss_video_tag -->

What happens with this video element?

<video controls onstart="alert('XSS')" src="javascript:alert('XSS')"></video>

**Options:**

- **A1:** Video plays and alerts fire
- **A2:** Dangerous attributes and sources are stripped
- **A3:** The page crashes when video loads
- **A4:** The video element renders but is blank

**Correct:** A2

**Exp:**
Video sources and event handlers must be sanitized similarly to audio tags.

---

### Q: Embed tag sanitization <!-- Q_ID: xss_embed_tag -->

What happens with this embed element?

<embed src="javascript:alert('XSS')" onload="alert('XSS')">

**Options:**

- **A1:** The embed loads and alerts fire
- **A2:** The embed element is sanitized or removed
- **A3:** The page crashes on load
- **A4:** The embed loads but shows nothing

**Correct:** A2

**Exp:**
`embed` elements can execute arbitrary code and should be removed when sourced from dangerous URLs.

---

### Q: Applet tag sanitization <!-- Q_ID: xss_applet_tag -->

What happens with this applet element?

<applet code="Test" onload="alert('XSS')"></applet>

**Options:**

- **A1:** The applet loads and runs alerts
- **A2:** The applet element is sanitized or removed
- **A3:** The page crashes while loading the applet
- **A4:** The applet loads but fails silently

**Correct:** A2

**Exp:**
Deprecated tags like `<applet>` should be removed because they can execute arbitrary code.

---

### Q: Meta refresh sanitization <!-- Q_ID: xss_meta_refresh -->

What happens with this meta tag?

<meta http-equiv="refresh" content="0;url=javascript:alert('XSS')">

**Options:**

- **A1:** The page redirects and the alert fires
- **A2:** The meta tag is removed or neutralized
- **A3:** The page crashes immediately
- **A4:** The meta tag displays as plain text

**Correct:** A2

**Exp:**
Meta refresh tags that redirect to `javascript:` URLs must be stripped to prevent navigation-based XSS.

---

## Chapter 3: Edge Case Scenarios <!-- CH_ID: xss_edge -->

---

### Q: HTML comment handling <!-- Q_ID: xss_comment -->

What happens with this HTML comment?

<!-- <script>alert('XSS in comment')</script> -->

**Options:**

- **A1:** The comment executes the script
- **A2:** The comment is ignored as inert text
- **A3:** The page crashes while parsing the comment
- **A4:** The comment becomes visible in the page

**Correct:** A2

**Exp:**
Comments should be ignored entirely, preventing hidden scripts from executing.

---

### Q: CDATA section handling <!-- Q_ID: xss_cdata -->

What happens with this CDATA block?

<![CDATA[<script>alert('XSS in CDATA')</script>]]>

**Options:**

- **A1:** The script executes despite the CDATA wrapper
- **A2:** The block is treated as inert text
- **A3:** The page crashes when parsing CDATA
- **A4:** The block is removed entirely

**Correct:** A2

**Exp:**
CDATA sections should be rendered as plain text, blocking script execution.

---

### Q: Mixed quote handlers <!-- Q_ID: xss_mixed_quotes -->

What happens with this mixed quote payload?

<div onclick='alert("XSS")' onload="alert('XSS')">Test</div>

**Options:**

- **A1:** Both alerts execute
- **A2:** All event handlers are removed
- **A3:** Only one handler remains active
- **A4:** The element is removed

**Correct:** A2

**Exp:**
Sanitization should remove event handlers regardless of quote style.

---

### Q: Unicode-encoded handlers <!-- Q_ID: xss_unicode_handler -->

What happens with this Unicode-encoded payload?

<div onclick="alert('\u0058\u0053\u0053')">Unicode test</div>

**Options:**

- **A1:** Unicode is decoded and the alert fires
- **A2:** The handler is removed despite encoding
- **A3:** The page crashes while decoding
- **A4:** The Unicode string renders visibly

**Correct:** A2

**Exp:**
Handlers should be removed even when event payloads are Unicode-encoded.

---

### Q: Overall renderer security <!-- Q_ID: xss_overall_security -->

This quiz exercises over twenty different XSS vectors. If the SecureTextRenderer is working correctly, how many should execute?

**Options:**

- **A1:** Every vector executes successfully
- **A2:** All vectors are blocked while safe content remains
- **A3:** Only half of the vectors are blocked
- **A4:** The page crashes before anything renders

**Correct:** A2

**Exp:**
A robust sanitization pipeline blocks all XSS vectors while preserving legitimate content and formatting.

---
