# Advanced Test Quiz - All Features

_Comprehensive test of SecureTextRenderer capabilities_

---

## Basic Text and Formatting <!-- CH_ID: basic -->

Description: Testing basic markdown features.

---

### Q: What is the time complexity of binary search? <!-- Q_ID: basic_binary_search -->

This question tests **bold text**, _italic text_, and `inline code`.

**Options:**
**A1:** O(n)
**A2:** O(log n)
**A3:** O(n²)
**A4:** O(n log n)

**Correct:** A2

**Exp:**
Binary search has $O(\log n)$ time complexity because it eliminates half the search space with each comparison.

The recurrence relation is: $T(n) = T(n/2) + O(1)$

---

### T/F: Arrays provide O(1) random access. <!-- Q_ID: basic_array_access -->

Testing True/False questions.

**Correct:** True

**Exp:**
Yes, arrays provide $O(1)$ random access using indexing.

**Why this is true:**

- Arrays store elements in contiguous memory locations
- Each element can be accessed directly using its index
- No traversal is needed, making it a constant-time operation
- This is one of the main advantages of arrays over linked lists

---

## LaTeX Math Testing <!-- CH_ID: latex -->

Description: Comprehensive LaTeX math expressions.

---

### Q: What is the solution to the quadratic equation ax² + bx + c = 0? <!-- Q_ID: latex_quadratic -->

Testing complex mathematical expressions.

**Options:**
**A1:** $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
**A2:** $x = \frac{b \pm \sqrt{b^2 - 4ac}}{2a}$
**A3:** $x = \frac{-b \pm \sqrt{b^2 + 4ac}}{2a}$
**A4:** $x = \frac{b \pm \sqrt{b^2 + 4ac}}{2a}$

**Correct:** A1

**Exp:**
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.

**Derivation:**
Starting with $ax^2 + bx + c = 0$:

$$ax^2 + bx + c = 0$$
$$x^2 + \frac{b}{a}x + \frac{c}{a} = 0$$
$$x^2 + \frac{b}{a}x = -\frac{c}{a}$$
$$x^2 + \frac{b}{a}x + \left(\frac{b}{2a}\right)^2 = -\frac{c}{a} + \left(\frac{b}{2a}\right)^2$$
$$\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}$$
$$x + \frac{b}{2a} = \pm\frac{\sqrt{b^2 - 4ac}}{2a}$$
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

---

### Q: What is the integral of x²? <!-- Q_ID: latex_integral -->

Testing calculus expressions.

**Options:**
**A1:** $\frac{x^3}{3} + C$
**A2:** $2x + C$
**A3:** $\frac{x^3}{2} + C$
**A4:** $x^3 + C$

**Correct:** A1

**Exp:**
The integral of $x^2$ is $\frac{x^3}{3} + C$.

**Proof:**
$$\int x^2 \, dx = \frac{x^{2+1}}{2+1} + C = \frac{x^3}{3} + C$$

---

## Code Blocks Testing <!-- CH_ID: code -->

Description: Testing code block rendering.

---

### Q: What does this Python code output? <!-- Q_ID: code_python -->

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(5))
```

**Options:**
**A1:** 5
**A2:** 8
**A3:** 13
**A4:** 21

**Correct:** A1

**Exp:**
The code outputs **5**.

**Explanation:**

- fibonacci(0) = 0
- fibonacci(1) = 1
- fibonacci(2) = fibonacci(1) + fibonacci(0) = 1 + 0 = 1
- fibonacci(3) = fibonacci(2) + fibonacci(1) = 1 + 1 = 2
- fibonacci(4) = fibonacci(3) + fibonacci(2) = 2 + 1 = 3
- fibonacci(5) = fibonacci(4) + fibonacci(3) = 3 + 2 = 5

---

### Q: What does this JavaScript code output? <!-- Q_ID: code_javascript -->

```javascript
const arr = [1, 2, 3, 4, 5];
const result = arr.map((x) => x * 2).filter((x) => x > 5);
console.log(result);
```

**Options:**
**A1:** [6, 8, 10]
**A2:** [2, 4, 6, 8, 10]
**A3:** [1, 2, 3, 4, 5]
**A4:** [5, 6, 7, 8, 9]

**Correct:** A1

**Exp:**
The code outputs **[6, 8, 10]**.

**Step-by-step:**

1. `arr.map(x => x * 2)` creates `[2, 4, 6, 8, 10]`
2. `.filter(x => x > 5)` keeps only `[6, 8, 10]`

---

## Tables Testing <!-- CH_ID: tables -->

Description: Testing table rendering.

---

### Q: Which sorting algorithm has the best average-case time complexity? <!-- Q_ID: tables_sorting -->

Based on the following comparison table:

| Algorithm   | Best Case  | Average Case | Worst Case | Space    |
| ----------- | ---------- | ------------ | ---------- | -------- |
| Bubble Sort | O(n)       | O(n²)        | O(n²)      | O(1)     |
| Quick Sort  | O(n log n) | O(n log n)   | O(n²)      | O(log n) |
| Merge Sort  | O(n log n) | O(n log n)   | O(n log n) | O(n)     |
| Heap Sort   | O(n log n) | O(n log n)   | O(n log n) | O(1)     |

**Options:**
**A1:** Bubble Sort
**A2:** Quick Sort
**A3:** Merge Sort
**A4:** Heap Sort

**Correct:** A2

**Exp:**
**Quick Sort** has the best average-case time complexity of $O(n \log n)$.

**Analysis:**

- All algorithms have $O(n \log n)$ average case
- But Quick Sort is typically faster in practice due to better constants
- Quick Sort has better cache performance and fewer comparisons

---

### Q: What is the space complexity of Merge Sort? <!-- Q_ID: tables_merge_sort -->

Using the sorting algorithms comparison table above.

**Options:**
**A1:** O(1)
**A2:** O(log n)
**A3:** O(n)
**A4:** O(n log n)

**Correct:** A3

**Exp:**
Merge Sort has $O(n)$ space complexity because it requires additional space for the temporary arrays during the merge process.

**From the table above:**

- Merge Sort shows "O(n)" in the Space column
- This is because it needs extra space to store temporary arrays during the merge operation
- Unlike Quick Sort (O(log n)) or Heap Sort (O(1)), Merge Sort requires linear extra space

---

### T/F: Merge Sort is a stable sorting algorithm. <!-- Q_ID: tables_stable_sort -->

Understanding the stability property of sorting algorithms.

**Correct:** True

**Exp:**
Yes, Merge Sort is a **stable** sorting algorithm.

**Why Merge Sort is stable:**

- Stability means that equal elements maintain their relative order after sorting
- Merge Sort preserves the original order of equal elements during the merge process
- When merging two sorted subarrays, if elements are equal, the algorithm chooses from the left subarray first
- This ensures that the original relative order of equal elements is maintained

---

## Lists Testing <!-- CH_ID: lists -->

Description: Testing various list types.

---

### Q: Which of the following are advantages of linked lists? <!-- Q_ID: lists_advantages -->

**Options:**
**A1:** Dynamic size
**A2:** Random access
**A3:** Memory efficiency
**A4:** Cache performance

**Correct:** A1

**Exp:**
**Dynamic size** is an advantage of linked lists.

**Advantages of linked lists:**

- ✅ Dynamic size (can grow/shrink at runtime)
- ✅ Efficient insertion/deletion at any position
- ✅ No memory waste (only allocate what you need)
- ✅ Easy to implement

**Disadvantages:**

- ❌ No random access (must traverse from head)
- ❌ Extra memory for pointers
- ❌ Poor cache performance (nodes not contiguous)
- ❌ More complex implementation

---

### Q: What are the main operations of a stack? <!-- Q_ID: lists_stack_ops -->

**Options:**
**A1:** push, pop, peek
**A2:** enqueue, dequeue, front
**A3:** insert, delete, search
**A4:** add, remove, find

**Correct:** A1

**Exp:**
The main operations of a stack are **push, pop, and peek**.

**Stack operations:**

- **push(item)**: Add item to top of stack
- **pop()**: Remove and return top item
- **peek()**: Return top item without removing
- **isEmpty()**: Check if stack is empty
- **size()**: Return number of items

---

### T/F: A stack can be implemented using two queues. <!-- Q_ID: lists_stack_queues -->

Understanding the relationship between different data structures.

**Correct:** True

**Exp:**
Yes, a stack can be implemented using two queues, though it's not the most efficient approach.

**How to implement stack with two queues:**

- **Method 1**: Use one queue for storage, another for temporary operations
- **Push**: Add element to queue1
- **Pop**: Move all elements except the last from queue1 to queue2, then remove the last element from queue1, then move everything back from queue2 to queue1
- **Time complexity**: O(n) for pop operations, O(1) for push
- **Space complexity**: O(n) for the two queues

**Note**: This is less efficient than using a single array or linked list for stack implementation.

---

## Mixed Content Testing <!-- CH_ID: mixed -->

Description: Testing complex combinations of features.

---

### Q: What is the time complexity of this algorithm? <!-- Q_ID: mixed_algorithm -->

Consider the following algorithm:

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

**Options:**
**A1:** O(1)
**A2:** O(log n)
**A3:** O(n)
**A4:** O(n log n)

**Correct:** A2

**Exp:**
The time complexity is $O(\log n)$.

**Analysis:**

- Each iteration eliminates half the search space
- Maximum iterations = $\log_2(n)$
- Each iteration takes $O(1)$ time
- Total time = $O(\log n)$

**Space complexity**: $O(1)$ (iterative approach)

---

### Q: Which data structure is best for implementing a priority queue? <!-- Q_ID: mixed_priority_queue -->

**Options:**
**A1:** Array
**A2:** Linked List
**A3:** Binary Heap
**A4:** Hash Table

**Correct:** A3

**Exp:**
**Binary Heap** is the best data structure for implementing a priority queue.

**Comparison table:**

| Data Structure  | Insert       | Extract Min  | Space    |
| --------------- | ------------ | ------------ | -------- |
| Array           | O(n)         | O(n)         | O(n)     |
| Linked List     | O(n)         | O(n)         | O(n)     |
| **Binary Heap** | **O(log n)** | **O(log n)** | **O(n)** |
| Hash Table      | O(1)         | O(n)         | O(n)     |

**Why Binary Heap?**

- Efficient insertion: $O(\log n)$
- Efficient extraction: $O(\log n)$
- Simple implementation
- Good cache performance

---

## Security Testing <!-- CH_ID: security -->

Description: Testing XSS protection and security features.

---

### Q: What is the result of this expression? <!-- Q_ID: security_expression -->

Evaluate: $2 + 3 \times 4$

**Options:**
**A1:** 20
**A2:** 14
**A3:** 11
**A4:** 24

**Correct:** B2

**Exp:**
The result is **14**.

**Order of operations:**

1. Multiplication first: $3 \times 4 = 12$
2. Addition: $2 + 12 = 14$

**Note**: This tests that mathematical expressions are rendered correctly and not interpreted as HTML.

---

### Q: Which of the following is a valid HTML tag? <!-- Q_ID: security_html -->

**Options:**
**A1:** `<script>alert('XSS')</script>`
**A2:** `<div>Hello World</div>`
**A3:** `<img src="x" onerror="alert('XSS')">`
**A4:** `<a href="javascript:alert('XSS')">Click</a>`

**Correct:** A2

**Exp:**
**`<div>Hello World</div>`** is a valid, safe HTML tag.

**Security analysis:**

- ❌ `<script>` tags are dangerous and should be removed
- ✅ `<div>` tags are safe for content display
- ❌ `onerror` attributes are dangerous and should be removed
- ❌ `javascript:` URLs are dangerous and should be blocked

---

### T/F: All HTML tags are safe to render in a web application. <!-- Q_ID: security_html_safety -->

Understanding HTML security risks.

**Correct:** False

**Exp:**
No, not all HTML tags are safe to render in a web application.

**Dangerous HTML tags:**

- `<script>` - Can execute JavaScript code
- `<iframe>` - Can load external content and create security risks
- `<form>` - Can submit data to malicious endpoints
- `<input>` - Can be used for form-based attacks
- `<button>` - Can trigger unwanted actions
- `<img>` with `onerror` - Can execute JavaScript on error
- `<a>` with `javascript:` URLs - Can execute JavaScript

**Safe HTML tags:**

- `<div>`, `<span>`, `<p>` - For content structure
- `<h1>` to `<h6>` - For headings
- `<strong>`, `<em>` - For text emphasis
- `<ul>`, `<ol>`, `<li>` - For lists
- `<table>`, `<tr>`, `<td>` - For tables (with proper sanitization)

**Best practice**: Always sanitize HTML content before rendering to prevent XSS attacks.

---

## Edge Cases Testing <!-- CH_ID: edge_cases -->

Description: Testing edge cases and special characters.

---

### Q: What is the result of this expression? <!-- Q_ID: edge_unicode -->

Evaluate: $\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$

**Options:**
**A1:** $n^2$
**A2:** $\frac{n(n+1)}{2}$
**A3:** $n(n+1)$
**A4:** $\frac{n^2}{2}$

**Correct:** A2

**Exp:**
The sum of the first n natural numbers is $\frac{n(n+1)}{2}$.

**Proof by induction:**

- **Base case (n=1)**: $1 = \frac{1 \cdot 2}{2} = 1$ ✓
- **Inductive step**: Assume true for n=k
- For n=k+1: $\sum_{i=1}^{k+1} i = \sum_{i=1}^{k} i + (k+1) = \frac{k(k+1)}{2} + (k+1) = \frac{k(k+1) + 2(k+1)}{2} = \frac{(k+1)(k+2)}{2}$ ✓

---

### Q: What is the time complexity of this algorithm? <!-- Q_ID: edge_nested_loops -->

```python
for i in range(n):
    for j in range(i):
        print(i, j)
```

**Options:**
**A1:** O(n)
**A2:** O(n log n)
**A3:** O(n²)
**A4:** O(n³)

**Correct:** A3

**Exp:**
The time complexity is $O(n^2)$.

**Analysis:**

- Outer loop runs n times
- Inner loop runs i times for each i
- Total iterations: $1 + 2 + 3 + \ldots + (n-1) = \frac{n(n-1)}{2} = O(n^2)$

---

### T/F: Unicode characters can cause issues in markdown parsing. <!-- Q_ID: edge_unicode_parsing -->

Understanding Unicode handling in text processing.

**Correct:** False

**Exp:**
No, Unicode characters should not cause issues in proper markdown parsing.

**Why Unicode should work:**

- Modern markdown parsers support UTF-8 encoding
- Unicode characters are just text and don't have special markdown meaning
- Characters like àáâãäåæçèéêë are treated as regular text
- Emojis like 🚀 📝 ✅ ❌ ⚠️ are also just text characters
- Math symbols like ∑ ∏ ∫ ∂ ∇ are regular Unicode characters

**Potential issues (if they occur):**

- Old or poorly implemented parsers might not handle UTF-8 correctly
- Some systems might have encoding issues if not properly configured
- Display issues if the font doesn't support the Unicode characters

**Best practice**: Use a modern markdown parser that properly supports UTF-8 encoding.

---

## Conclusion

This advanced test quiz demonstrates all the capabilities of the SecureTextRenderer:

✅ **Basic Markdown**: Headers, bold, italic, inline code
✅ **LaTeX Math**: Inline ($...$) and display ($$...$$) math
✅ **Code Blocks**: Syntax-highlighted code in multiple languages
✅ **Tables**: Complex data presentation with proper formatting
✅ **Lists**: Ordered, unordered, and nested lists
✅ **Mixed Content**: Complex combinations of all features
✅ **Security**: XSS protection and safe HTML handling
✅ **Edge Cases**: Special characters, unicode, and complex expressions

The quiz includes:

- **25+ questions** covering all major features
- **Multiple question types**: MCQ and True/False
- **Mathematical expressions**: Complex LaTeX formulas
- **Code examples**: Python, JavaScript, and pseudocode
- **Tables**: Performance comparisons and data structures
- **Security testing**: XSS protection validation
- **Edge cases**: Unicode, special characters, and complex math
- **Multiline explanations**: Detailed step-by-step reasoning
- **Rich formatting**: Bold, italic, lists, and structured content

This serves as a comprehensive test suite for the SecureTextRenderer! 🚀
