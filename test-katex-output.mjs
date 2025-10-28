import { processMarkdown } from './lib/markdown/pipeline.ts';

const testContent = 'The formula is $x = y + z$ in the text.';

console.log('Testing markdown processing...\n');
console.log('Input:', testContent);
console.log('\n---\n');

try {
  const result = await processMarkdown(testContent);
  console.log('Output HTML:');
  console.log(result);
  
  console.log('\n---\n');
  console.log('Checking for .katex class:', result.includes('class="katex"'));
  console.log('Checking for <math> tag:', result.includes('<math'));
} catch (error) {
  console.error('Error:', error);
}
