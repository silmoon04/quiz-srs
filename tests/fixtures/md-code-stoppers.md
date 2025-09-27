# Code Fence Stoppers Test

## Chapter 1: Code Block Handling

### Question 1: Code with internal stoppers

What does this JavaScript code output?

```javascript
function test() {
  console.log('Hello');
  // This is a comment
  return 'World';
}
console.log(test());
```

**Options:**

- A) Hello
- B) World
- C) Hello World
- D) undefined

**Correct:** C

**Explanation:** The function logs "Hello" and returns "World", so the final output is "Hello World".

### Question 2: Code with multiple lines and comments

What is the result of this Python code?

```python
def calculate(x, y):
    # Add two numbers
    result = x + y
    return result

print(calculate(3, 4))
```

**Options:**

- A) 7
- B) 12
- C) Error
- D) None

**Correct:** A

**Explanation:** The function adds 3 + 4 = 7 and prints the result.

### Question 3: Code with special characters

What does this regex match?

```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

**Options:**

- A) Phone numbers
- B) Email addresses
- C) URLs
- D) Passwords

**Correct:** B

**Explanation:** This regex pattern matches valid email addresses.
