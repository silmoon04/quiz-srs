# XSS Security Test Quiz

This quiz contains various XSS attack vectors to test the SecureTextRenderer's sanitization capabilities.

## Chapter 1: XSS Attack Vectors

### Q1: Basic XSS Test

**Question:** What happens when you click this button?

<div onclick="alert('XSS Attack!')">Click me for XSS</div>

**Options:**
**A1:** Nothing happens (safe)
**A2:** An alert pops up (dangerous)
**A3:** The page crashes (very dangerous)
**A4:** The button disappears (unexpected)

**Answer:** A1

**Explanation:**
The SecureTextRenderer should remove the `onclick` attribute, making the button safe to click. This tests basic XSS protection.

### Q2: Image XSS Test

**Question:** What happens when this image fails to load?
<img src="x" onerror="alert('XSS via img')" alt="Test image">

**Options:**
**A1:** The image shows a broken image icon
**A2:** An alert pops up with "XSS via img"
**A3:** The page crashes
**A4:** Nothing happens

**Answer:** A1

**Explanation:**
The `onerror` attribute should be removed by the SecureTextRenderer, preventing the XSS attack while still showing the broken image icon.

### Q3: Script Tag Test

**Question:** Will this script execute?

<script>alert('XSS via script tag')</script>

**Options:**
**A1:** Yes, the alert will show
**A2:** No, the script is blocked
**A3:** The page crashes
**A4:** The script runs but fails

**Answer:** A2

**Explanation:**
Script tags should be completely removed by the SecureTextRenderer, preventing any JavaScript execution.

### Q4: Iframe XSS Test

**Question:** What happens with this iframe?

<iframe src="javascript:alert('XSS via iframe')"></iframe>

**Options:**
**A1:** The iframe loads and shows an alert
**A2:** The iframe is blocked/removed
**A3:** The page crashes
**A4:** The iframe loads but shows nothing

**Answer:** A2

**Explanation:**
Iframes with `javascript:` URLs should be completely removed to prevent XSS attacks.

### Q5: Link XSS Test

**Question:** What happens when you click this link?
<a href="javascript:alert('XSS via link')">Dangerous link</a>

**Options:**
**A1:** The link works and shows an alert
**A2:** The link is converted to safe text
**A3:** The page crashes
**A4:** The link disappears

**Answer:** A2

**Explanation:**
Links with `javascript:` URLs should be sanitized or converted to safe text.

### Q6: Complex XSS Test

**Question:** What happens with this complex XSS payload?

<div onmouseover="alert('XSS')" onload="alert('XSS')" onclick="alert('XSS')">Hover me</div>

**Options:**
**A1:** Multiple alerts will show
**A2:** The div is safe to interact with
**A3:** The page crashes immediately
**A4:** Only one alert shows

**Answer:** A2

**Explanation:**
All event handlers (`onmouseover`, `onload`, `onclick`) should be removed, making the div safe.

### Q7: Styling XSS Test

**Question:** What happens with this style-based XSS?

<div style="background: url('javascript:alert(1)')">Styled div</div>

**Options:**
**A1:** The background loads and shows an alert
**A2:** The style is sanitized
**A3:** The page crashes
**A4:** The div has no background

**Answer:** B2

**Explanation:**
Dangerous URLs in CSS should be sanitized to prevent XSS.

### Q8: Form XSS Test

**Question:** What happens with this form?

<form action="javascript:alert('XSS')" onsubmit="alert('XSS')">
  <input type="text" value="test" onfocus="alert('XSS')">
  <input type="submit" value="Submit" onclick="alert('XSS')">
</form>

**Options:**
**A1:** The form works normally with alerts
**B2:** The form is sanitized and safe
**A3:** The page crashes
**A4:** The form disappears

**Answer:** B2

**Explanation:**
Forms with dangerous actions and event handlers should be sanitized.

### Q9: Mixed Content Test

**Question:** How does this mixed content render?
This is **bold** text with <script>alert('XSS')</script> and _italic_ text.

**Options:**
**A1:** Shows bold, executes script, shows italic
**B2:** Shows bold and italic text, script is removed
**A3:** Crashes the page
**A4:** Shows only the script

**Answer:** B2

**Explanation:**
Markdown formatting should work while dangerous HTML is sanitized.

### Q10: LaTeX with XSS Test

**Question:** What happens with this LaTeX containing XSS?
The formula is $x^2 + y^2 = z^2$ and here's some XSS: <script>alert('XSS')</script>

**Options:**
**A1:** LaTeX renders and script executes
**B2:** LaTeX renders but script is removed
**A3:** Page crashes
**A4:** Neither renders

**Answer:** B2

**Explanation:**
LaTeX should render correctly while XSS is sanitized.

## Chapter 2: Advanced XSS Vectors

### Q11: SVG XSS Test

**Question:** What happens with this SVG?
<svg onload="alert('XSS via SVG')"><circle cx="50" cy="50" r="40"/></svg>

**Options:**
**A1:** SVG renders and shows alert
**B2:** SVG renders but onload is removed
**A3:** Page crashes
**A4:** SVG is completely removed

**Answer:** B2

**Explanation:**
SVG elements should render but dangerous attributes should be removed.

### Q12: Object Tag Test

**Question:** What happens with this object?
<object data="javascript:alert('XSS')" onload="alert('XSS')"></object>

**Options:**
**A1:** Object loads and shows alerts
**B2:** Object is sanitized or removed
**A3:** Page crashes
**A4:** Object loads but fails

**Answer:** B2

**Explanation:**
Object tags with dangerous data sources should be sanitized.

### Q13: Embed Tag Test

**Question:** What happens with this embed?
<embed src="javascript:alert('XSS')" onload="alert('XSS')">

**Options:**
**A1:** Embed loads and shows alerts
**B2:** Embed is sanitized or removed
**A3:** Page crashes
**A4:** Embed loads but shows nothing

**Answer:** B2

**Explanation:**
Embed tags with dangerous sources should be sanitized.

### Q14: Applet Tag Test

**Question:** What happens with this applet?
<applet code="Test" onload="alert('XSS')"></applet>

**Options:**
**A1:** Applet loads and shows alert
**B2:** Applet is sanitized or removed
**A3:** Page crashes
**A4:** Applet loads but fails

**Answer:** B2

**Explanation:**
Applet tags should be sanitized as they can execute code.

### Q15: Meta Tag Test

**Question:** What happens with this meta tag?

<meta http-equiv="refresh" content="0;url=javascript:alert('XSS')">

**Options:**
**A1:** Page redirects and shows alert
**B2:** Meta tag is removed or sanitized
**A3:** Page crashes
**A4:** Meta tag has no effect

**Answer:** B2

**Explanation:**
Meta tags with dangerous redirects should be sanitized.

## Chapter 3: Edge Cases

### Q16: Comment XSS Test

**Question:** What happens with this comment?

<!-- <script>alert('XSS in comment')</script> -->

**Options:**
**A1:** Comment executes the script
**B2:** Comment is ignored (safe)
**A3:** Page crashes
**A4:** Comment becomes visible

**Answer:** B2

**Explanation:**
HTML comments should be ignored and not executed.

### Q17: CDATA XSS Test

**Question:** What happens with this CDATA?

<![CDATA[<script>alert('XSS in CDATA')</script>]]>

**Options:**
**A1:** CDATA executes the script
**B2:** CDATA is treated as text
**A3:** Page crashes
**A4:** CDATA is removed

**Answer:** B2

**Explanation:**
CDATA sections should be treated as text content.

### Q18: Mixed Quotes Test

**Question:** What happens with this mixed quote XSS?

<div onclick='alert("XSS")' onload="alert('XSS')">Test</div>

**Options:**
**A1:** Both alerts show
**B2:** All event handlers are removed
**A3:** Page crashes
**A4:** Only one alert shows

**Answer:** B2

**Explanation:**
Event handlers should be removed regardless of quote type.

### Q19: Unicode XSS Test

**Question:** What happens with this Unicode XSS?

<div onclick="alert('\u0058\u0053\u0053')">Unicode test</div>

**Options:**
**A1:** Unicode is decoded and alert shows
**B2:** Event handler is removed
**A3:** Page crashes
**A4:** Unicode is displayed as text

**Answer:** B2

**Explanation:**
Event handlers should be removed even with Unicode encoding.

### Q20: Final Security Test

**Question:** Overall, how secure is the SecureTextRenderer?
This quiz contains 20 different XSS attack vectors. If the SecureTextRenderer is working correctly, none of them should execute.

**Options:**
**A1:** All XSS attacks work
**B2:** All XSS attacks are blocked
**A3:** Some work, some don't
**A4:** The page crashes

**Answer:** B2

**Explanation:**
A properly implemented SecureTextRenderer should block all XSS attacks while preserving legitimate content and formatting.
