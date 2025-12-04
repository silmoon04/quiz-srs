# Available Tools and Instructions

## 1. create_directory

**Description:** Create a new directory structure in the workspace. Will recursively create all directories in the path, like mkdir -p. You do not need to use this tool before using create_file, that tool will automatically create the needed directories.

**Parameters:**

- `dirPath` (required, string): The absolute path to the directory to create.

---

## 2. create_file

**Description:** This is a tool for creating a new file in the workspace. The file will be created with the specified content. The directory will be created if it does not already exist. Never use this tool to edit a file that already exists.

**Parameters:**

- `filePath` (required, string): The absolute path to the file to create.
- `content` (required, string): The content to write to the file.

---

## 3. create_new_jupyter_notebook

**Description:** Generates a new Jupyter Notebook (.ipynb) in VS Code. Jupyter Notebooks are interactive documents commonly used for data exploration, analysis, visualization, and combining code with narrative text. Prefer creating plain Python files or similar unless a user explicitly requests creating a new Jupyter Notebook or already has a Jupyter Notebook opened or exists in the workspace.

**Parameters:**

- `query` (required, string): The query to use to generate the jupyter notebook. This should be a clear and concise description of the notebook the user wants to create.

---

## 4. edit_notebook_file

**Description:** This is a tool for editing an existing Notebook file in the workspace. Generate the "explanation" property first. The system is very smart and can understand how to apply your edits to the notebooks. When updating the content of an existing cell, ensure newCode preserves whitespace and indentation exactly and does NOT include any code markers such as (...existing code...).

**Parameters:**

- `cellId` (required, string): Id of the cell that needs to be deleted or edited. Use the value `TOP`, `BOTTOM` when inserting a cell at the top or bottom of the notebook, else provide the id of the cell after which a new cell is to be inserted. Remember, if a cellId is provided and editType=insert, then a cell will be inserted after the cell with the provided cellId.
- `editType` (required, enum: "insert" | "delete" | "edit"): The operation performed on the cell, whether `insert`, `delete` or `edit`. Use the `editType` field to specify the operation: `insert` to add a new cell, `edit` to modify an existing cell's content, and `delete` to remove a cell.
- `filePath` (required, string): An absolute path to the notebook file to edit, or the URI of a untitled, not yet named, file, such as `untitled:Untitled-1`.
- `language` (optional, string): The language of the cell. `markdown`, `python`, `javascript`, `julia`, etc.
- `newCode` (optional, string or array of strings): The code for the new or existing cell to be edited. Code should not be wrapped within <VSCode.Cell> tags. Do NOT include code markers such as (...existing code...) to indicate existing code.

---

## 5. fetch_webpage

**Description:** Fetches the main content from a web page. This tool is useful for summarizing or analyzing the content of a webpage. You should use this tool when you think the user is looking for information from a specific webpage.

**Parameters:**

- `urls` (required, array of strings): An array of URLs to fetch content from.
- `query` (required, string): The query to search for in the web page's content. This should be a clear and concise description of the content you want to find.

---

## 6. file_search

**Description:** Search for files in the workspace by glob pattern. This only returns the paths of matching files. Use this tool when you know the exact filename pattern of the files you're searching for. Glob patterns match from the root of the workspace folder.

**Examples:**

- `**/*.{js,ts}` to match all js/ts files in the workspace.
- `src/**` to match all files under the top-level src folder.
- `**/foo/**/*.js` to match all js files under any foo folder in the workspace.

**Parameters:**

- `query` (required, string): Search for files with names or paths matching this glob pattern.
- `maxResults` (optional, number): The maximum number of results to return. Do not use this unless necessary, it can slow things down. By default, only some matches are returned. If you use this and don't see what you're looking for, you can try again with a more specific query or a larger maxResults.

---

## 7. grep_search

**Description:** Do a fast text search in the workspace. Use this tool when you want to search with an exact string or regex. If you are not sure what words will appear in the workspace, prefer using regex patterns with alternation (|) or character classes to search for multiple potential words at once instead of making separate searches. For example, use 'function|method|procedure' to look for all of those words at once. Use includePattern to search within files matching a specific pattern, or in a specific file, using a relative path. Use 'includeIgnoredFiles' to include files normally ignored by .gitignore, other ignore files, and `files.exclude` and `search.exclude` settings. Warning: using this may cause the search to be slower, only set it when you want to search in ignored folders like node_modules or build outputs. Use this tool when you want to see an overview of a particular file, instead of using read_file many times to look for code within a file.

**Parameters:**

- `query` (required, string): The pattern to search for in files in the workspace. Use regex with alternation (e.g., 'word1|word2|word3') or character classes to find multiple potential words in a single search. Be sure to set the isRegexp property properly to declare whether it's a regex or plain text pattern. Is case-insensitive.
- `isRegexp` (required, boolean): Whether the pattern is a regex.
- `includePattern` (optional, string): Search files matching this glob pattern. Will be applied to the relative path of files within the workspace. To search recursively inside a folder, use a proper glob pattern like "src/folder/\*\*". Do not use | in includePattern.
- `includeIgnoredFiles` (optional, boolean): Whether to include files that would normally be ignored according to .gitignore, other ignore files and `files.exclude` and `search.exclude` settings. Warning: using this may cause the search to be slower. Only set it when you want to search in ignored folders like node_modules or build outputs.
- `maxResults` (optional, number): The maximum number of results to return. Do not use this unless necessary, it can slow things down. By default, only some matches are returned. If you use this and don't see what you're looking for, you can try again with a more specific query or a larger maxResults.

---

## 8. get_changed_files

**Description:** Get git diffs of current file changes in a git repository. Don't forget that you can use run_in_terminal to run git commands in a terminal as well.

**Parameters:**

- `repositoryPath` (optional, string): The absolute path to the git repository to look for changes in. If not provided, the active git repository will be used.
- `sourceControlState` (optional, array of enums: "staged" | "unstaged" | "merge-conflicts"): The kinds of git state to filter by. Allowed values are: 'staged', 'unstaged', and 'merge-conflicts'. If not provided, all states will be included.

---

## 9. get_errors

**Description:** Get any compile or lint errors in a specific file or across all files. If the user mentions errors or problems in a file, they may be referring to these. Use the tool to see the same errors that the user is seeing. If the user asks you to analyze all errors, or does not specify a file, use this tool to gather errors for all files. Also use this tool after editing a file to validate the change.

**Parameters:**

- `filePaths` (optional, array of strings): The absolute paths to the files or folders to check for errors. Omit 'filePaths' when retrieving all errors.

---

## 10. copilot_getNotebookSummary

**Description:** This tool returns the list of the Notebook cells along with the id, cell types, line ranges, language, execution information and output mime types for each cell. This is useful to get Cell Ids when executing a notebook or determine what cells have been executed and what order, or what cells have outputs. If required to read contents of a cell use this to determine the line range of a cells, and then use read_file tool to read a specific line range. Requery this tool if the contents of the notebook change.

**Parameters:**

- `filePath` (required, string): An absolute path to the notebook file with the cell to run, or the URI of a untitled, not yet named, file, such as `untitled:Untitled-1.ipynb`

---

## 11. get_search_view_results

**Description:** The results from the search view

**Parameters:** None required.

---

## 12. github_repo

**Description:** Searches a GitHub repository for relevant source code snippets. Only use this tool if the user is very clearly asking for code snippets from a specific GitHub repository. Do not use this tool for Github repos that the user has open in their workspace.

**Parameters:**

- `repo` (required, string): The name of the Github repository to search for code in. Should must be formatted as '<owner>/<repo>'.
- `query` (required, string): The query to search for repo. Should contain all relevant context.

---

## 13. list_code_usages

**Description:** Request to list all usages (references, definitions, implementations etc) of a function, class, method, variable etc. Use this tool when:

1. Looking for a sample implementation of an interface or class
2. Checking how a function is used throughout the codebase.
3. Including and updating all usages when changing a function, method, or constructor

**Parameters:**

- `symbolName` (required, string): The name of the symbol, such as a function name, class name, method name, variable name, etc.
- `filePaths` (optional, array of strings): One or more file paths which likely contain the definition of the symbol. For instance the file which declares a class or function. This is optional but will speed up the invocation of this tool and improve the quality of its output.

---

## 14. list_dir

**Description:** List the contents of a directory. Result will have the name of the child. If the name ends in /, it's a folder, otherwise a file

**Parameters:**

- `path` (required, string): The absolute path to the directory to list.

---

## 15. multi_replace_string_in_file

**Description:** This tool allows you to apply multiple replace_string_in_file operations in a single call, which is more efficient than calling replace_string_in_file multiple times. It takes an array of replacement operations and applies them sequentially. Each replacement operation has the same parameters as replace_string_in_file: filePath, oldString, newString, and explanation. This tool is ideal when you need to make multiple edits across different files or multiple edits in the same file. The tool will provide a summary of successful and failed operations.

**Parameters:**

- `explanation` (required, string): A brief explanation of what the multi-replace operation will accomplish.
- `replacements` (required, array of objects): An array of replacement operations to apply sequentially.
  - Each object contains:
    - `explanation` (required, string): A brief explanation of this specific replacement operation.
    - `filePath` (required, string): An absolute path to the file to edit.
    - `oldString` (required, string): The exact literal text to replace, preferably unescaped. Include at least 3 lines of context BEFORE and AFTER the target text, matching whitespace and indentation precisely. If this string is not the exact literal text or does not match exactly, this replacement will fail.
    - `newString` (required, string): The exact literal text to replace `oldString` with, preferably unescaped. Provide the EXACT text. Ensure the resulting code is correct and idiomatic.

---

## 16. read_file

**Description:** Read the contents of a file. Line numbers are 1-indexed. This tool will truncate its output at 2000 lines and may be called repeatedly with offset and limit parameters to read larger files in chunks.

**Parameters:**

- `filePath` (required, string): The absolute path of the file to read.
- `offset` (optional, number): The 1-based line number to start reading from. Only use this if the file is too large to read at once. If not specified, the file will be read from the beginning.
- `limit` (optional, number): The maximum number of lines to read. Only use this together with `offset` if the file is too large to read at once.

---

## 17. replace_string_in_file

**Description:** This is a tool for making edits in an existing file in the workspace. For moving or renaming files, use run in terminal tool with the 'mv' command instead. For larger edits, split them into smaller edits and call the edit tool multiple times to ensure accuracy. Before editing, always ensure you have the context to understand the file's contents and context. To edit a file, provide: 1) filePath (absolute path), 2) oldString (MUST be the exact literal text to replace including all whitespace, indentation, newlines, and surrounding code etc), and 3) newString (MUST be the exact literal text to replace `oldString` with (also including all whitespace, indentation, newlines, and surrounding code etc.). Ensure the resulting code is correct and idiomatic.). Each use of this tool replaces exactly ONE occurrence of oldString.

**CRITICAL for `oldString`:** Must uniquely identify the single instance to change. Include at least 3 lines of context BEFORE and AFTER the target text, matching whitespace and indentation precisely. If this string matches multiple locations, or does not match exactly, the tool will fail. Never use 'Lines 123-456 omitted' from summarized documents or ...existing code... comments in the oldString or newString.

**Parameters:**

- `filePath` (required, string): An absolute path to the file to edit.
- `oldString` (required, string): The exact literal text to replace, preferably unescaped. For single replacements (default), include at least 3 lines of context BEFORE and AFTER the target text, matching whitespace and indentation precisely. For multiple replacements, specify expected_replacements parameter. If this string is not the exact literal text (i.e. you escaped it) or does not match exactly, the tool will fail.
- `newString` (required, string): The exact literal text to replace `old_string` with, preferably unescaped. Provide the EXACT text. Ensure the resulting code is correct and idiomatic.

---

## 18. run_notebook_cell

**Description:** This is a tool for running a code cell in a notebook file directly in the notebook editor. The output from the execution will be returned. Code cells should be run as they are added or edited when working through a problem to bring the kernel state up to date and ensure the code executes successfully. Code cells are ready to run and don't require any pre-processing. If asked to run the first cell in a notebook, you should run the first code cell since markdown cells cannot be executed. NOTE: Avoid executing Markdown cells or providing Markdown cell IDs, as Markdown cells cannot be executed.

**Parameters:**

- `filePath` (required, string): An absolute path to the notebook file with the cell to run, or the URI of a untitled, not yet named, file, such as `untitled:Untitled-1.ipynb`
- `cellId` (required, string): The ID for the code cell to execute. Avoid providing markdown cell IDs as nothing will be executed.
- `reason` (optional, string): An optional explanation of why the cell is being run. This will be shown to the user before the tool is run and is not necessary if it's self-explanatory.
- `continueOnError` (optional, boolean): Whether or not execution should continue for remaining cells if an error is encountered. Default to false unless instructed otherwise.

---

## 19. run_vscode_command

**Description:** Run a command in VS Code. Use this tool to run a command in Visual Studio Code as part of a new workspace creation process only.

**Parameters:**

- `commandId` (required, string): The ID of the command to execute. This should be in the format <command>.
- `name` (required, string): The name of the command to execute. This should be a clear and concise description of the command.
- `args` (optional, array of strings): The arguments to pass to the command. This should be an array of strings.

---

## 20. semantic_search

**Description:** Run a natural language search for relevant code or documentation comments from the user's current workspace. Returns relevant code snippets from the user's current workspace if it is large, or the full contents of the workspace if it is small.

**Parameters:**

- `query` (required, string): The query to search the codebase for. Should contain all relevant context. Should ideally be text that might appear in the codebase, such as function names, variable names, or comments.

---

## 21. test_failure

**Description:** Includes test failure information in the prompt.

**Parameters:** None required.

---

## 22. configure_python_environment

**Description:** This tool configures a Python environment in the given workspace. ALWAYS Use this tool to set up the user's chosen environment and ALWAYS call this tool before using any other Python related tools or running any Python command in the terminal.

**Parameters:**

- `resourcePath` (optional, string): The path to the Python file or workspace for which a Python Environment needs to be configured.

---

## 23. get_python_environment_details

**Description:** This tool will retrieve the details of the Python Environment for the specified file or workspace. The details returned include the 1. Type of Python Environment (conda, venv, etc), 2. Version of Python, 3. List of all installed Python packages with their versions. ALWAYS call configure_python_environment before using this tool.

**Parameters:**

- `resourcePath` (optional, string): The path to the Python file or workspace to get the environment information for.

---

## 24. get_python_executable_details

**Description:** This tool will retrieve the details of the Python Environment for the specified file or workspace. ALWAYS use this tool before executing any Python command in the terminal. This tool returns the details of how to construct the fully qualified path and or command including details such as arguments required to run Python in a terminal. Note: Instead of executing `python --version` or `python -c 'import sys; print(sys.executable)'`, use this tool to get the Python executable path to replace the `python` command. E.g. instead of using `python -c 'import sys; print(sys.executable)'`, use this tool to build the command `conda run -n <env_name> -c 'import sys; print(sys.executable)'`. ALWAYS call configure_python_environment before using this tool.

**Parameters:**

- `resourcePath` (optional, string): The path to the Python file or workspace to get the executable information for. If not provided, the current workspace will be used. Where possible pass the path to the file or workspace.

---

## 25. install_python_packages

**Description:** Installs Python packages in the given workspace. Use this tool to install Python packages in the user's chosen Python environment. ALWAYS call configure_python_environment before using this tool.

**Parameters:**

- `packageList` (required, array of strings): The list of Python packages to install.
- `resourcePath` (optional, string): The path to the Python file or workspace into which the packages are installed. If not provided, the current workspace will be used. Where possible pass the path to the file or workspace.

---

## 26. get_terminal_output

**Description:** Get the output of a terminal command previously started with run_in_terminal

**Parameters:**

- `id` (required, string): The ID of the terminal to check.

---

## 27. run_in_terminal

**Description:** This tool allows you to execute PowerShell commands in a persistent terminal session, preserving environment variables, working directory, and other context across multiple commands.

### Command Execution:

- Prefer `;` when chaining commands on one line
- Prefer pipelines `|` for object-based data flow
- Never create a sub-shell (eg. powershell -c "command") unless explicitly asked

### Directory Management:

- Must use absolute paths to avoid navigation issues
- Use $PWD or Get-Location for current directory
- Use Push-Location/Pop-Location for directory stack

### Program Execution:

- Supports .NET, Python, Node.js, and other executables
- Install modules via Install-Module, Install-Package
- Use Get-Command to verify cmdlet/function availability

### Background Processes:

- For long-running tasks (e.g., servers), set isBackground=true
- Returns a terminal ID for checking status and runtime later
- Use Start-Job for background PowerShell jobs

### Output Management:

- Output is automatically truncated if longer than 60KB to prevent context overflow
- Use Select-Object, Where-Object, Format-Table to filter output
- Use -First/-Last parameters to limit results
- For pager commands, add | Out-String or | Format-List

### Best Practices:

- Use proper cmdlet names instead of aliases in scripts
- Quote paths with spaces: "C:\Path With Spaces"
- Prefer PowerShell cmdlets over external commands when available
- Prefer idiomatic PowerShell like Get-ChildItem instead of dir or ls for file listings
- Use Test-Path to check file/directory existence
- Be specific with Select-Object properties to avoid excessive output

**Parameters:**

- `command` (required, string): The command to run in the terminal.
- `explanation` (required, string): A one-sentence description of what the command does. This will be shown to the user before the command is run.
- `isBackground` (required, boolean): Whether the command starts a background process. If true, the command will run in the background and you will not see the output. If false, the tool call will block on the command finishing, and then you will get the output. Examples of background processes: building in watch mode, starting a server. You can check the output of a background process later on by using get_terminal_output.

---

## 28. terminal_last_command

**Description:** Get the last command run in the active terminal.

**Parameters:** None required.

---

## 29. terminal_selection

**Description:** Get the current selection in the active terminal.

**Parameters:** None required.

---

## 30. create_and_run_task

**Description:** Creates and runs a build, run, or custom task for the workspace by generating or adding to a tasks.json file based on the project structure (such as package.json or README.md). If the user asks to build, run, launch and they have no tasks.json file, use this tool. If they ask to create or add a task, use this tool.

**Parameters:**

- `workspaceFolder` (required, string): The absolute path of the workspace folder where the tasks.json file will be created.
- `task` (required, object): The task to add to the new tasks.json file.
  - `label` (required, string): The label of the task.
  - `type` (required, enum: "shell"): The type of the task. The only supported value is 'shell'.
  - `command` (required, string): The shell command to run for the task. Use this to specify commands for building or running the application.
  - `args` (optional, array of strings): The arguments to pass to the command.
  - `group` (optional, string): The group to which the task belongs.
  - `isBackground` (optional, boolean): Whether the task runs in the background without blocking the UI or other tasks. Set to true for long-running processes like watch tasks or servers that should continue executing without requiring user attention. When false, the task will block the terminal until completion.
  - `problemMatcher` (optional, array of strings): The problem matcher to use to parse task output for errors and warnings. Can be a predefined matcher like '$tsc' (TypeScript), '$eslint - stylish', '$gcc', etc., or a custom pattern defined in tasks.json. This helps VS Code display errors in the Problems panel and enables quick navigation to error locations.

---

## 31. mcp_sequentialthi_sequentialthinking

**Description:** A detailed tool for dynamic and reflective problem-solving through thoughts. This tool helps analyze problems through a flexible thinking process that can adapt and evolve. Each thought can build on, question, or revise previous insights as understanding deepens.

### When to use this tool:

- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope might not be clear initially
- Problems that require a multi-step solution
- Tasks that need to maintain context over multiple steps
- Situations where irrelevant information needs to be filtered out

### Key features:

- You can adjust total_thoughts up or down as you progress
- You can question or revise previous thoughts
- You can add more thoughts even after reaching what seemed like the end
- You can express uncertainty and explore alternative approaches
- Not every thought needs to build linearly - you can branch or backtrack
- Generates a solution hypothesis
- Verifies the hypothesis based on the Chain of Thought steps
- Repeats the process until satisfied
- Provides a correct answer

### Parameters explained:

- `thought` (required, string): Your current thinking step, which can include:
  - Regular analytical steps
  - Revisions of previous thoughts
  - Questions about previous decisions
  - Realizations about needing more analysis
  - Changes in approach
  - Hypothesis generation
  - Hypothesis verification
- `nextThoughtNeeded` (required, boolean): True if you need more thinking, even if at what seemed like the end
- `thoughtNumber` (required, integer, min: 1): Current number in sequence (can go beyond initial total if needed)
- `totalThoughts` (required, integer, min: 1): Current estimate of thoughts needed (can be adjusted up/down)
- `isRevision` (optional, boolean): A boolean indicating if this thought revises previous thinking
- `revisesThought` (optional, integer, min: 1): If is_revision is true, which thought number is being reconsidered
- `branchFromThought` (optional, integer, min: 1): If branching, which thought number is the branching point
- `branchId` (optional, string): Identifier for the current branch (if any)
- `needsMoreThoughts` (optional, boolean): If reaching end but realizing more thoughts needed

### You should:

1. Start with an initial estimate of needed thoughts, but be ready to adjust
2. Feel free to question or revise previous thoughts
3. Don't hesitate to add more thoughts if needed, even at the "end"
4. Express uncertainty when present
5. Mark thoughts that revise previous thinking or branch into new paths
6. Ignore information that is irrelevant to the current step
7. Generate a solution hypothesis when appropriate
8. Verify the hypothesis based on the Chain of Thought steps
9. Repeat the process until satisfied with the solution
10. Provide a single, ideally correct answer as the final output
11. Only set next_thought_needed to false when truly done and a satisfactory answer is reached

---

# General Tool Use Instructions

## General Guidelines

- If the user is requesting a code sample, you can answer it directly without using any tools.
- When using a tool, follow the JSON schema very carefully and make sure to include ALL required properties.
- No need to ask permission before using a tool.
- NEVER say the name of a tool to a user. For example, instead of saying that you'll use the run_in_terminal tool, say "I'll run the command in a terminal".
- If you think running multiple tools can answer the user's question, prefer calling them in parallel whenever possible, but do not call semantic_search in parallel.
- When using the read_file tool, prefer reading a large section over calling the read_file tool many times in sequence. You can also think of all the pieces you may be interested in and read them in parallel. Read large enough context to ensure you get what you need.
- If semantic_search returns the full contents of the text files in the workspace, you have all the workspace context.
- You can use the grep_search to get an overview of a file by searching for a string within that one file, instead of using read_file many times.
- If you don't know exactly the string or filename pattern you're looking for, use semantic_search to do a semantic search across the workspace.
- Don't call the run_in_terminal tool multiple times in parallel. Instead, run one command and wait for the output before running the next command.
- When invoking a tool that takes a file path, always use the absolute file path. If the file has a scheme like untitled: or vscode-userdata:, then use a URI with the scheme.
- NEVER try to edit a file by running terminal commands unless the user specifically asks for it.
- Tools can be disabled by the user. You may see tools used previously in the conversation that are not currently available. Be careful to only use the tools that are currently available to you.

## Notebook Instructions

- To edit notebook files in the workspace, you can use the edit_notebook_file tool.
- Use the run_notebook_cell tool instead of executing Jupyter related commands in the Terminal, such as `jupyter notebook`, `jupyter lab`, `install jupyter` or the like.
- Use the copilot_getNotebookSummary tool to get the summary of the notebook (this includes the list or all cells along with the Cell Id, Cell type and Cell Language, execution details and mime types of the outputs, if any).
- Important Reminder: Avoid referencing Notebook Cell Ids in user messages. Use cell number instead.
- Important Reminder: Markdown cells cannot be executed

## Reminder Instructions

- When using the replace_string_in_file tool, include 3-5 lines of unchanged code before and after the string you want to replace, to make it unambiguous which part of the file should be edited.
- For maximum efficiency, whenever you plan to perform multiple independent edit operations, invoke them simultaneously using multi_replace_string_in_file tool rather than sequentially. This will greatly improve user's cost and time efficiency leading to a better user experience. Do not announce which tool you're using (for example, avoid saying "I'll implement all the changes using multi_replace_string_in_file").
- Do NOT create a new markdown file to document each change or summarize your work unless specifically requested by the user.
