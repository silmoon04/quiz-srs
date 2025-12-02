import os
import re

files_to_fix = [
    r"tests/int/state/state-persistence.test.ts",
    r"tests/int/quiz/quiz-flow.test.ts",
    r"tests/int/bugs/bug-detection.test.ts",
    r"tests/int/contracts/import-export.contract.test.ts",
    r"tests/unit/components/a11y/DashboardWithInlineErrors.test.ts",
    r"tests/unit/components/rendering/MarkdownRenderer.test.tsx",
    r"tests/unit/types/quiz-types.test.ts"
]

def fix_file(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace 'const module =' with 'const quizModule ='
    # Be careful with 'module.exports' or similar if they exist (unlikely in TS tests using ES modules but possible)
    # We are looking for 'const module =' or 'let module =' or 'var module ='
    
    # Regex to find variable declaration
    # We want to replace 'const module' with 'const quizModule'
    # and 'let module' with 'let quizModule'
    
    new_content = re.sub(r'\b(const|let|var)\s+module\b', r'\1 quizModule', content)
    
    # Now replace usages of 'module' with 'quizModule'
    # This is tricky because 'module' might be used in other contexts (e.g. module.exports, or imported module)
    # However, in these test files, 'module' is likely the variable we just renamed.
    # We should only replace 'module' if it's a standalone identifier or property access on it.
    
    # But wait, if I just replaced the declaration, the usages are now broken.
    # I need to replace usages that refer to this variable.
    # Since these are local variables in tests, they are scoped.
    # But a global replace might be safe enough if 'module' is not used for other things.
    # 'module' is a reserved word in some contexts, but here it's a variable name.
    
    # Let's check if 'module' is used in other ways.
    # Common usages: module.exports, module.id, etc.
    # In these tests, we are using ES modules (import/export), so module.exports shouldn't be there.
    # But we might have 'QuizModule' type. We don't want to change 'QuizModule' to 'QuizquizModule'.
    
    # So we should replace 'module' only when it is a whole word.
    # And we should NOT replace it if it is part of 'QuizModule'.
    
    # Strategy:
    # 1. Replace 'const module' -> 'const quizModule'
    # 2. Replace 'let module' -> 'let quizModule'
    # 3. Replace 'module.' -> 'quizModule.' (property access)
    # 4. Replace '(module)' -> '(quizModule)' (argument)
    # 5. Replace 'module,' -> 'quizModule,' (argument list)
    # 6. Replace 'module;' -> 'quizModule;' (end of statement)
    # 7. Replace ' module ' -> ' quizModule ' (surrounded by spaces)
    
    # Better strategy:
    # Use regex to replace 'module' where it is a whole word, BUT exclude 'QuizModule' or other types ending in Module.
    # Actually, 'QuizModule' has 'Module' with capital M. 'module' is lowercase.
    # So case-sensitive replacement of whole word 'module' should work.
    # We just need to make sure we don't replace 'module' in strings or comments if possible, but for tests it might be fine.
    # Also need to avoid 'import ... from "module"' or similar.
    
    # Let's try replacing whole word 'module' with 'quizModule'.
    
    def replace_module(match):
        return "quizModule"

    # Regex for whole word 'module'
    new_content = re.sub(r'\bmodule\b', replace_module, content)
    
    # Revert changes to 'module' inside strings if necessary?
    # Or check if we broke anything.
    # 'QuizModule' contains 'Module', not 'module'. So \bmodule\b won't match QuizModule.
    # What about 'import ... from "some-module"'?
    # Yes, that would be matched.
    # We need to be careful about imports.
    
    # Let's refine.
    # We only want to replace the variable 'module'.
    # In the files I read, it's used as:
    # const module = ...
    # expect(module.name)...
    # JSON.stringify(module)...
    
    # I will do it in two passes to be safer.
    # 1. Replace declarations: 'const module =' -> 'const quizModule ='
    # 2. Replace usages.
    
    # Actually, looking at the grep results, the variable is named 'module'.
    # I will use a regex that matches 'module' but not inside quotes? That's hard.
    
    # Let's look at the imports.
    # import { ... } from '@/types/quiz-types';
    # import ... from 'vitest';
    # None of these use 'module' in the path.
    
    # What about 'mockModule'?
    # \bmodule\b won't match 'mockModule'.
    
    # So \bmodule\b seems safe EXCEPT for string literals like "Test Module".
    # "Test Module" has 'Module' with capital M.
    # What about "my-module"?
    # If I have a string "some module", it will be replaced to "some quizModule".
    # That might be acceptable in tests, or I can fix it manually if it breaks strings.
    
    # Let's try to be smarter.
    # We can iterate line by line.
    
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        # Skip lines that look like imports
        if line.strip().startswith('import ') or line.strip().startswith('from '):
            new_lines.append(line)
            continue
            
        # Replace 'module' with 'quizModule' but try to avoid strings.
        # This is still hard.
        
        # Let's just do the simple replacement and see.
        # The lint error is about the variable name.
        # If I change "Test module" to "Test quizModule" in a string, it's just a test string, probably fine.
        
        # However, I should avoid changing 'module' in comments if possible, but again, not critical.
        
        # One specific case: '@next/next/no-assign-module-variable' in the lint error message or comments?
        # The file content I read has comments like:
        # // Helper to create a module with specific state
        # That will become: // Helper to create a quizModule with specific state
        # That is fine.
        
        new_line = re.sub(r'\bmodule\b', 'quizModule', line)
        new_lines.append(new_line)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    
    print(f"Updated {file_path}")

for file_path in files_to_fix:
    fix_file(file_path)
