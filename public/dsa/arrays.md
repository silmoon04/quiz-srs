# How RAM Works (Animation)

## Detailed Explanation

Before we cover arrays, it is important to understand what a data structure is to begin with.

Data structures are a way to store data in an efficient manner inside of a computer component called Random Access Memory (RAM). RAM is often just referred to as memory. Let's understand how an array is stored in RAM.

An array is an ordered collection of contiguous elements, for example \([1, 3, 5]\). But computers only understand data in terms of bits, i.e., \(0\)s and \(1\)s.

Most computers these days have gigabytes (GBs) of RAM. The computer you are using to view this course might have \(8\) GB (\(10^9\) bytes) of RAM. A byte of RAM is made up of exactly \(8\) bits.

Going back to our integers, each of \([1, 3, 5]\) has a binary representation, meaning they can be represented as \(0\)s and \(1\)s. If we use a single byte to store each, then the integer \(1\) can be represented as `00000001`, \(3\) as `00000011`, and \(5\) as `00000101`.

When we store an array in RAM, each element is stored contiguously in order.

Integers commonly occupy \(4\) bytes (\(32\) bits) in memory. An address and a value gets associated with an integer upon storing it in RAM. An address is just a distinct location that each one of the values is stored at. Each value is stored contiguously in the RAM, just like an array.

Each integer occupies \(4\) bytes of space, hence the addresses are \(4\) bytes apart.

Instead of integers, we could also store characters in an array.

Each character occupies \(1\) byte of space, hence the addresses are \(1\) byte apart.

The size or the type of data we store doesn't really matter, as long as the address is incremented relative to the size of the data type. Most of the time this knowledge is abstracted away from us as developers, but it is relevant to understand many algorithms and data structures. It is also extremely important in system design.

## Closing Notes

Although this chapter is mostly theory, the remainder of this course will focus on practical concepts. The next two chapters dive into array operations, their efficiency, and usage.

# Static Arrays

In statically typed languages like Java, C++, and C#, arrays have to have an allocated size and type when initialized. These are known as static arrays.

They are called static because the size of the array cannot change once declared. And once the array is full, it cannot store additional elements. Some dynamically typed languages such as Python and JavaScript do not have static arrays to begin with. They have an alternative, which we will discuss in the next lesson.

Let's cover the key operations of an array, and the time complexity associated with each.

## Reading from an array

To read an individual element from an array we can choose the position we want to access via an index. Below we have initialized an array of size \(3\) called `myArray`. We also attempt to access an arbitrary element using the index \(i\).

```python
# initialize myArray
myArray = [1, 3, 5]

# access an arbitrary element, where i is the index of the desired value
myArray[i]
```

Accessing a single element in an array is always instant because each index of `myArray` is mapped to an address in the RAM. Regardless of the size of the input array, the time taken to access a single element is the same. We refer to this operation as \(O(1)\) in terms of time complexity.

There is a common confusion that \(O(1)\) is always fast. This is not the case. There could be \(1000\) operations and the time complexity could still be \(O(1)\). If the number of operations does not grow as the size of the data or input grows then it is \(O(1)\).

## Traversing through an array

We can also read all values within an array by traversing through it. Below are examples of how we could traverse `myArray` from the start to the end using loops.

```python
for i in range(len(myArray)):
    print(myArray[i])

# OR

i = 0
while i < len(myArray):
    print(myArray[i])
    i += 1
```

The last element in an array is always at index \(n-1\) where \(n\) is the size of the array. If the size of our array is \(3\), the last accessible index is \(2\).

To traverse through an array of size \(n\) the time complexity is \(O(n)\). This means the number of operations grows linearly with the size of the array.

For example, with an array of size \(10\) we would have to perform \(10\) operations to traverse through it, with an array of size \(100\) we would have to perform \(100\) operations, and so on.

## Deleting from an array

### Deleting from the end of the array

In statically typed languages, all array indices are filled with \(0\)s or some default value upon initialization, denoting an empty array.

When we want to remove an element from the last index of an array, setting its value to \(0\) / `null` or \(-1\) is the best we can do. This is known as a soft delete. The element is not being "deleted" per se, but it is being overwritten by a value that denotes an empty index. We will also reduce the length by \(1\) since we have one less element in the array after deletion. The code below demonstrates the concept using \([4, 5, 6]\) as an example.

```python
# Remove from the last position in the array if the array
# is not empty (i.e. length is non-zero).
def removeEnd(arr, length):
    if length > 0:
        # Overwrite last element with some default value.
        # We would also consider the length to be decreased by 1.
        arr[length - 1] = 0
```

\(6\) is deleted/overwritten by either \(0\) or \(-1\) to denote that it does not exist anymore. Length is also decremented by \(1\).

### Deleting at an ith index

If instead of deleting at the end, we wanted to delete an element at a random index \(i\). Would we be able to perform this in \(O(1)\)?

We could naively just replace it with a \(0\), but this would break the contiguous nature of our array. Notice that deleting from the end of an array doesn't make it non-contiguous, but deleting from the middle will.

A better approach would be the following:

1. We are given the deletion index \(i\).
2. We iterate starting from \(i + 1\) until the end of the array.
3. We shift each element \(1\) position to the left.
4. (Optional) We replace the last element with a \(0\) or `null` to mark it empty, and decrement the length by \(1\).

The following code demonstrates this operation.

```python
# Remove value at index i before shifting elements to the left.
# Assuming i is a valid index.
def removeMiddle(arr, i, length):
    # Shift starting from i + 1 to end.
    for index in range(i + 1, length):
        arr[index - 1] = arr[index]
    # No need to 'remove' arr[i], since we already shifted
```

The worst case would be that we need to shift all of the elements to the left. This would occur if the target index is the first index of the array. Therefore, the code above is \(O(n)\).

## Insertion

### Inserting at the end

If we want to insert an element at the end of the array, we can simply insert it at the next open position which will be at index `length` where `length` is the number of elements in the array.

```python
# Insert n into arr at the next open position.
# Length is the number of 'real' values in arr, and capacity
# is the size (aka memory allocated for the fixed size array).
def insertEnd(arr, n, length, capacity):
    if length < capacity:
        arr[length] = n
```

Since we are writing a single value to the array, the time complexity is \(O(1)\).

**Note:** `length` is the number of elements inside the array whereas `capacity` refers to the maximum number of elements the array can hold.

### Inserting at the ith index

Inserting at an arbitrary index \(i\) is more involved since we may insert in the middle of the array.

Consider the array \([4, 5, 6]\). If we need to insert at index \(i = 1\), or \(i = 0\), we cannot overwrite the original value because we would lose it. Instead, we will need to shift all values, starting at index \(i\), one position to the right. Below is the code and visual demonstrating this.

```python
# Insert n into index i after shifting elements to the right.
# Assuming i is a valid index and arr is not full.
def insertMiddle(arr, i, n, length):
    # Shift starting from the end to i.
    for index in range(length - 1, i - 1, -1):
        arr[index + 1] = arr[index]

    # Insert at i
    arr[i] = n
```

The below image visualizes the insertion of \(8\) at index \(1\) in the array \([4, 5, 6]\). Since we don't have enough space to keep the last element \(6\), it is lost.

The visual above demonstrates that shifting occurs prior to insertion to ensure values are not overwritten.

## Time Complexity

| Operation | Big-O Time  | Notes                                          |
| --------- | ----------- | ---------------------------------------------- |
| Reading   | \(O(1)\)    |                                                |
| Insertion | \(O(n)^\*\) | If inserting at the end of the array, \(O(1)\) |
| Deletion  | \(O(n)^\*\) | If deleting at the end of the array, \(O(1)\)  |

\* Worst case.

## Closing Notes

The operations we discussed above are absolutely critical for solving a lot of interview problems. In fact, the key to solving many problems is being able to implement the insert middle and delete middle operations efficiently.

There are some suggested problems listed above. If you are a beginner you may find them challenging. That's completely okay; your goal should be to understand the concepts and the operations we discussed above. The solution code and video explanation are provided for each problem.

# Dynamic Arrays

Dynamic arrays are a much more common alternative to static arrays. They are useful because they can grow as elements are added. In JavaScript and Python, these are the default arrays.

Unlike static arrays, with dynamic arrays we don’t have to specify a size upon initialization.

In different languages, dynamic arrays may be assigned a default size—Java being \(10\) and C# being \(4\). Regardless, these are automatically resized at runtime as the arrays grow.

## Dynamic Array Insertion

When inserting at the end of a dynamic array, the next empty space is found and the element is inserted there. Consider an array of size \(3\) where we push elements into it until we run out of space.

```python
# Insert n in the last position of the array
def pushback(self, n):
    if self.length == self.capacity:
        self.resize()

    # insert at next empty position
    self.arr[self.length] = n
    self.length += 1
```

## Resize

Since the array is dynamic in size, we can continue to add elements. But it's not magic; this is achieved by copying over the values to a new static array that is double the size of the original. This means that the resulting array will be of size \(6\) and will have new space allocated for it in memory. The following visual and code demonstrates this resize operation.

```python
def resize(self):
    # Create new array of double capacity
    self.capacity = 2 * self.capacity
    newArr = [0] * self.capacity

    # Copy elements to newArr
    for i in range(self.length):
        newArr[i] = self.arr[i]
    self.arr = newArr
```

When all the elements from the first array have been copied over, the first static array will be deallocated.

Adding elements to a dynamic array runs in amortized \(O(1)\) time.

Amortized time complexity is the average time taken per operation over a sequence of operations. The resize operation itself is \(O(n)\), but since it is not performed every time we add an element, the average time taken per operation is \(O(1)\). But this is only the case if we double the size of the array when we run out of space.

### Why double the capacity?

The visual below shows a resulting array of size \(8\). Now imagine that we wanted to dynamically fill it up and we started with a size \(1\) array. We would add \(5\), double the space to add \(6\), double that space to add \(7\) and \(8\), double that space to add \(9\), \(10\), \(11\) and \(12\).

The size of the above array went from \(1 \to 2 \to 4 \to 8\).

To analyze the time complexity we have to take into consideration the sum of all the operations that occurred before the last one since we would not have gotten to the resulting array without these operations. To achieve an array of size \(8\), we would have to perform \(1 + 2 + 4 + 8 = 15\) operations, which includes the resize operations.

The pattern here is that the last term (the dominating term) is always greater than or equal to the sum of all the terms before it. In this case, \(1 + 2 + 4 = 7\), and \(7 < 8\). Add in the \(8\) to the \(7\), we get a total of \(15\) operations to create the resulting array of size \(8\).

Generally, the formula is that for any array size \(n\), it will take at most \(2n\) operations to create, which would belong to \(O(n)\).

Since inserting \(n\) elements into a dynamic array is \(O(n)\), the amortized time complexity of inserting a single element is \(O(1)\).

With time complexity, we are concerned with asymptotic analysis. This means we care about how quickly the runtime grows as the input size grows. We don't distinguish between \(O(2n)\) and \(O(n)\) because the runtime grows linearly with the input size, even if the constant is doubled. With time complexity analysis, we typically drop constant terms and coefficients.

## Other Operations

Inserting or removing from the middle of a dynamic array would be similar to a static array. We would have to shift elements to the right or left to make space for the new element or to fill the gap left by the removed element. This would run in \(O(n)\) time.

## Time Complexity

| Operation | Big-O Time  | Notes                                                               |
| --------- | ----------- | ------------------------------------------------------------------- |
| Access    | \(O(1)\)    |                                                                     |
| Insertion | \(O(1)^\*\) | \(O(n)\) if insertion in the middle since shifting will be required |
| Deletion  | \(O(1)^\*\) | \(O(n)\) if deletion in the middle since shifting will be required  |

\* Amortized.

# 4 - Stacks

## Stacks

A stack is a data structure that supports a subset of operations from a dynamic array. With a stack you may only add and delete elements from one end of the array (referred to as the top of the stack).

In the physical world, a stack can be conceptualized by thinking of a stack of plates. You may grab a plate from the top or you may add a plate to the top. You cannot remove or add a plate to the middle of the stack. This is the same as the stack data structure.

Stacks are a dynamic data structure that operate on a LIFO (Last In First Out) manner. The last element added to the stack is the first element that comes out. The stack supports three operations—push, pop, peek.

### Push

The push operation adds an element to the top of the stack, which in dynamic array terms would be appending an element to the end. This is an efficient \(O(1)\) operation as discussed in the previous lesson.

It helps to visualize a stack as an array that is vertical. The pseudocode demonstrates the concept, along with the visual where we add the integers \(1\) through \(4\) to the top. The top pointer updates to point at the last item added. The following pseudocode and visual demonstrates this.

```python
def push(self, n):
    # using the pushback function from dynamic arrays to add to the stack
    self.stack.append(n)
```

In many languages there is no built-in stack data structure, but you can use a dynamic array to simulate a stack.

Since a stack will remove elements in the reverse order that they were inserted in, it can be used to reverse sequences—such as a string, which is just a sequence of characters.

### Pop

The pop operation removes the last element from top of the stack, which in dynamic array terms would be reading and removing the last element. This is also an efficient \(O(1)\) operation as discussed previously.

```python
def pop(self):
    return self.stack.pop()
```

In most languages, before popping, it is a good measure to check if the stack is empty to avoid errors.

### Peek

The peek operation is the simplest. It simply returns the top element without removing it. This is also an efficient \(O(1)\) operation.

```python
def peek(self):
    return self.stack[-1]
```

## Time Complexity

| Operation  | Big-O Time Complexity | Notes                             |
| ---------- | --------------------- | --------------------------------- |
| Push       | \(O(1)\)              |                                   |
| Pop        | \(O(1)^\*\)           | Check if the stack is empty first |
| Peek / Top | \(O(1)^\*\)           | Retrieves without removing        |

\* Amortized.

## Suggested Problems

| Status | Star | Problem           | Difficulty | Solution |
| ------ | ---- | ----------------- | ---------- | -------- |
|        |      | Valid Parentheses | Easy       |          |
|        |      | Min Stack         | Medium     |
