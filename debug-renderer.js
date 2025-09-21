// Debug the SecureTextRenderer output
const content = '<div onclick="alert(\'XSS\')">Click me</div>';
console.log('Original content:', content);

// Test the regex that detects raw HTML
const hasRawHtml =
  /<script|<iframe|<form|<input|<button|<img\s+[^>]*on\w+|<div\s+[^>]*on\w+|<span\s+[^>]*on\w+|<p\s+[^>]*on\w+/i.test(
    content,
  );
console.log('Has raw HTML:', hasRawHtml);

if (hasRawHtml) {
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');

  console.log('Escaped content:', escaped);
  console.log('Contains onclick="alert:', escaped.includes('onclick="alert'));
  console.log('Contains onclick=&quot;alert:', escaped.includes('onclick=&quot;alert'));
} else {
  console.log('Content would be processed as markdown');
}
