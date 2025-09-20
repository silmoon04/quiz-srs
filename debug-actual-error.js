// Debug the actual error in SecureTextRenderer
import { SecureTextRenderer } from './components/secure-text-renderer.jsx'

console.log('Testing SecureTextRenderer with XSS content...')

const testContent = `### Q: Which of the following is a valid HTML tag?
**Options:**
**A1:** \`<script>alert('XSS')</script>\`
**A2:** \`<div>Hello World</div>\`
**A3:** \`<img src="x" onerror="alert('XSS')">\`
**A4:** \`<a href="javascript:alert('XSS')">Click</a>\`

**Correct:** A2

**Exp:** 
**\`<div>Hello World</div>\`** is a valid, safe HTML tag.`

try {
  console.log('Input content:', testContent)
  console.log('Testing SecureTextRenderer...')
  
  // This should not crash
  const result = SecureTextRenderer({ content: testContent })
  console.log('✅ SecureTextRenderer processed successfully')
  console.log('Result:', result)
} catch (error) {
  console.error('❌ SecureTextRenderer crashed:', error)
  console.error('Error stack:', error.stack)
}
