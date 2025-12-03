import fs from 'fs';
import path from 'path';

const quizPath = path.join(process.cwd(), 'public', 'default-quiz.json');

function fixQuizJson() {
  console.log(`Reading quiz from ${quizPath}...`);
  const content = fs.readFileSync(quizPath, 'utf-8');

  // Regex to find backslashes.
  // Group 1: Valid escapes: \\, \", \/, \b, \f, \n, \r, \t, \uXXXX
  // Group 2: Invalid backslash (captured)
  const regex = /(\\[\\"/bfnrt]|\\u[0-9a-fA-F]{4})|(\\)/g;

  let fixedCount = 0;
  const newContent = content.replace(regex, (match, validEscape, invalidBackslash, offset) => {
    if (validEscape) {
      return validEscape;
    }
    if (invalidBackslash) {
      fixedCount++;
      // Check what follows for logging purposes
      const nextChar = content[offset + 1] || 'EOF';
      // console.log(`Fixing invalid escape at offset ${offset}: \\${nextChar}`);
      return '\\\\';
    }
    return match;
  });

  if (fixedCount > 0) {
    console.log(`Fixed ${fixedCount} invalid escape sequences.`);
    fs.writeFileSync(quizPath, newContent, 'utf-8');
    console.log('File saved.');
  } else {
    console.log('No invalid escape sequences found.');
  }
}

fixQuizJson();
