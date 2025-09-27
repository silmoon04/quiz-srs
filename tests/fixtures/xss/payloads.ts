// XSS test payloads for regression testing
export const XSS_PAYLOADS = [
  // Script injection
  `<script>alert(1)</script>`,
  `<script>alert('XSS')</script>`,
  `<script>console.log('XSS')</script>`,

  // Event handler injection
  `<img src=x onerror=alert(1)>`,
  `<img src=x onerror="alert(1)">`,
  `<svg onload=alert(1)></svg>`,
  `<div onclick="alert(1)">click me</div>`,

  // JavaScript URL injection
  `<a href="javascript:alert(1)">x</a>`,
  `<a href="javascript:alert('XSS')">x</a>`,
  `<iframe src="javascript:alert(1)"></iframe>`,

  // Data URL injection
  `<img src="data:text/html,<script>alert(1)</script>">`,
  `<iframe src="data:text/html,<script>alert(1)</script>"></iframe>`,

  // CSS injection
  `<style>body{background:url('javascript:alert(1)')}</style>`,
  `<div style="background:url('javascript:alert(1)')"></div>`,

  // Form injection
  `<form action="javascript:alert(1)"><input type="submit"></form>`,
  `<input onfocus="alert(1)" autofocus>`,
];

export const SAFE_CONTENT = [
  // These should pass through
  `<strong>Bold text</strong>`,
  `<em>Italic text</em>`,
  `<p>Paragraph with <a href="https://example.com">link</a></p>`,
  `<ul><li>List item</li></ul>`,
  `<blockquote>Quote</blockquote>`,
  `<code>code snippet</code>`,
  `<pre>preformatted text</pre>`,
];
