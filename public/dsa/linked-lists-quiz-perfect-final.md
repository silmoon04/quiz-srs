# Linked Lists Quiz - Data Structures

_Comprehensive test of linked list concepts and operations_

---

## Basic Concepts <!-- CH_ID: basic -->

Description: Testing fundamental linked list concepts and terminology.

---

### Q: What are the two main components of a singly linked list node? <!-- Q_ID: basic_node_components -->

**Options:**
**A1:** data and next pointer
**A2:** data and prev pointer
**A3:** next and prev pointers
**A4:** data, next, and prev pointers

**Correct:** A1

**Exp:**
A singly linked list node contains data (the value) and a next pointer (reference to the next node).

---

### Q: What does the last node's next pointer point to in a singly linked list? <!-- Q_ID: basic_last_node -->

**Options:**
**A1:** The head node
**A2:** The previous node
**A3:** None/null
**A4:** A new node

**Correct:** A3

**Exp:**
The last node's next pointer points to None/null, indicating the end of the list.

---

### T/F: A singly linked list allows bidirectional traversal. <!-- Q_ID: basic_bidirectional -->

**Correct:** False

**Exp:**
Singly linked lists only allow forward traversal since each node only has a next pointer, not a prev pointer.

---

## Singly Linked List Operations <!-- CH_ID: singly_ops -->

Description: Testing operations specific to singly linked lists.

---

### Q: What is the time complexity of inserting at the beginning of a singly linked list? <!-- Q_ID: singly_insert_beginning -->

**Options:**
**A1:** O(1)
**A2:** O(n)
**A3:** O(log n)
**A4:** O(n²)

**Correct:** A1

**Exp:**
Inserting at the beginning is O(1) because you only need to update the head pointer and the new node's next pointer.

---

### Q: What is the time complexity of inserting at the end of a singly linked list? <!-- Q_ID: singly_insert_end -->

**Options:**
**A1:** O(1)
**A2:** O(n)
**A3:** O(log n)
**A4:** O(n²)

**Correct:** A2

**Exp:**
Inserting at the end is O(n) because you must traverse the entire list to reach the last node.

---

### Q: What happens when you try to insert after a value that doesn't exist in the list? <!-- Q_ID: singly_insert_after_missing -->

**Options:**
**A1:** The node is inserted at the end
**A2:** The node is inserted at the beginning
**A3:** An exception is raised
**A4:** The list becomes empty

**Correct:** A3

**Exp:**
An exception is raised because the target value cannot be found in the list.

---

### Q: What is the time complexity of deleting a node by value in a singly linked list? <!-- Q_ID: singly_delete_by_value -->

**Options:**
**A1:** O(1)
**A2:** O(n)
**A3:** O(log n)
**A4:** O(n²)

**Correct:** A2

**Exp:**
Deleting by value is O(n) because you must traverse the list to find the node with the target value.

---

### T/F: Deleting the head node in a singly linked list requires special handling. <!-- Q_ID: singly_delete_head -->

**Correct:** True

**Exp:**
Yes, deleting the head node requires special handling because you need to update the head pointer to point to the second node.

---

## Doubly Linked List Concepts <!-- CH_ID: doubly_concepts -->

Description: Testing doubly linked list concepts and advantages.

---

### Q: What additional pointer does a doubly linked list node have compared to a singly linked list? <!-- Q_ID: doubly_prev_pointer -->

**Options:**
**A1:** next pointer
**A2:** prev pointer
**A3:** head pointer
**A4:** tail pointer

**Correct:** A2

**Exp:**
Doubly linked list nodes have a prev pointer in addition to the next pointer, allowing backward traversal.

---

### Q: What are dummy nodes used for in doubly linked lists? <!-- Q_ID: doubly_dummy_nodes -->

**Options:**
**A1:** Storing actual data
**A2:** Simplifying edge cases
**A3:** Improving performance
**A4:** Reducing memory usage

**Correct:** A2

**Exp:**
Dummy nodes simplify edge cases by providing consistent head and tail references, avoiding special checks for empty lists.

---

### Q: What is the time complexity of backward traversal in a doubly linked list? <!-- Q_ID: doubly_backward_traversal -->

**Options:**
**A1:** O(1)
**A2:** O(n)
**A3:** O(log n)
**A4:** O(n²)

**Correct:** A2

**Exp:**
Backward traversal is O(n) because you must visit each node once, even though you can traverse in reverse using prev pointers.

---

### T/F: Doubly linked lists use more memory than singly linked lists. <!-- Q_ID: doubly_memory_usage -->

**Correct:** True

**Exp:**
Yes, doubly linked lists use more memory because each node stores an additional prev pointer compared to singly linked lists.

---

## Edge Cases and Error Handling <!-- CH_ID: edge_cases -->

Description: Testing edge cases and error conditions in linked list operations.

---

### Q: What happens when you try to delete from an empty singly linked list? <!-- Q_ID: edge_delete_empty -->

**Options:**
**A1:** The operation succeeds silently
**A2:** A null pointer exception occurs
**A3:** An exception is raised
**A4:** The list becomes circular

**Correct:** A3

**Exp:**
An exception is raised because there are no nodes to delete in an empty list.

---

### Q: What is the result of traversing an empty singly linked list? <!-- Q_ID: edge_traverse_empty -->

**Options:**
**A1:** Returns all nodes
**A2:** Returns the head node
**A3:** Returns nothing (empty iteration)
**A4:** Causes an infinite loop

**Correct:** A3

**Exp:**
Traversing an empty list returns nothing because the head is None, so the while loop never executes.

---

### Q: What happens when you delete the only node in a singly linked list? <!-- Q_ID: edge_delete_single -->

**Options:**
**A1:** The list becomes circular
**A2:** The list becomes empty (head = None)
**A3:** An exception is raised
**A4:** The list becomes doubly linked

**Correct:** A2

**Exp:**
Deleting the only node results in an empty list where head is set to None.

---

### T/F: A circular linked list can cause infinite loops during traversal. <!-- Q_ID: edge_circular_infinite -->

**Correct:** True

**Exp:**
Yes, circular linked lists can cause infinite loops during traversal unless you implement cycle detection algorithms like Floyd's tortoise and hare.

---

## Time Complexity Analysis <!-- CH_ID: complexity -->

Description: Testing understanding of time complexity for different operations.

---

### Q: What is the time complexity of searching for a value in a singly linked list? <!-- Q_ID: complexity_search_singly -->

**Options:**
**A1:** O(1)
**A2:** O(n)
**A3:** O(log n)
**A4:** O(n²)

**Correct:** A2

**Exp:**
Searching in a singly linked list is O(n) because you may need to check every node in the worst case.

---

### Q: What is the time complexity of accessing an element by index in a singly linked list? <!-- Q_ID: complexity_access_singly -->

**Options:**
**A1:** O(1)
**A2:** O(n)
**A3:** O(log n)
**A4:** O(n²)

**Correct:** A2

**Exp:**
Accessing by index is O(n) because you must traverse from the head to reach the desired position.

---

### Q: What is the time complexity of inserting at a specific position in a doubly linked list (given a reference to the position)? <!-- Q_ID: complexity_insert_doubly_position -->

**Options:**
**A1:** O(1)
**A2:** O(n)
**A3:** O(log n)
**A4:** O(n²)

**Correct:** A1

**Exp:**
Inserting at a specific position is O(1) when you have a reference to the position, as you only need to update adjacent pointers.

---

### Q: What is the time complexity of deleting a node in a doubly linked list (given a reference to the node)? <!-- Q_ID: complexity_delete_doubly_reference -->

**Options:**
**A1:** O(1)
**A2:** O(n)
**A3:** O(log n)
**A4:** O(n²)

**Correct:** A1

**Exp:**
Deleting with a node reference is O(1) because you can directly update the adjacent nodes' pointers without traversal.

---

## Implementation Details <!-- CH_ID: implementation -->

Description: Testing understanding of implementation specifics and code behavior.

---

### Q: What does this Python code do? <!-- Q_ID: impl_add_first -->

```python
def add_first(self, node):
    node.next = self.head
    self.head = node
```

**Options:**
**A1:** Adds a node at the end of the list
**A2:** Adds a node at the beginning of the list
**A3:** Deletes the first node
**A4:** Searches for a node

**Correct:** A2

**Exp:**
This code adds a node at the beginning by setting the new node's next to the current head, then updating head to point to the new node.

---

### Q: What happens in this code when the list is empty? <!-- Q_ID: impl_add_last_empty -->

```python
def add_last(self, node):
    if self.head is None:
        self.head = node
        return
    # ... rest of the code
```

**Options:**
**A1:** An exception is raised
**A2:** The node becomes the head
**A3:** The node is added at the end
**A4:** The list becomes circular

**Correct:** A2

**Exp:**
When the list is empty (head is None), the new node becomes the head of the list.

---

### Q: What is the purpose of the prev pointer in doubly linked list deletion? <!-- Q_ID: impl_doubly_delete_prev -->

**Options:**
**A1:** To find the node to delete
**A2:** To update the previous node's next pointer
**A3:** To traverse the list
**A4:** To store data

**Correct:** A2

**Exp:**
The prev pointer is used to update the previous node's next pointer to skip the deleted node, maintaining the list's integrity.

---

### T/F: Dummy nodes in doubly linked lists contain actual data values. <!-- Q_ID: impl_dummy_data -->

**Correct:** False

**Exp:**
Dummy nodes are sentinel nodes that don't contain actual data; they're used to simplify edge case handling and provide consistent head/tail references.

---

## Advanced Concepts <!-- CH_ID: advanced -->

Description: Testing advanced linked list concepts and optimizations.

---

### Q: What is the main advantage of using a doubly linked list over a singly linked list? <!-- Q_ID: advanced_doubly_advantage -->

**Options:**
**A1:** Uses less memory
**A2:** Faster insertion at the end
**A3:** Allows bidirectional traversal
**A4:** Simpler implementation

**Correct:** A3

**Exp:**
The main advantage is bidirectional traversal, allowing you to move both forward and backward through the list efficiently.

---

### Q: What is the space complexity of a singly linked list with n nodes? <!-- Q_ID: advanced_space_singly -->

**Options:**
**A1:** O(1)
**A2:** O(n)
**A3:** O(log n)
**A4:** O(n²)

**Correct:** A2

**Exp:**
The space complexity is O(n) because you need to store n nodes, each containing data and a next pointer.

---

### Q: What is the space complexity of a doubly linked list with n nodes? <!-- Q_ID: advanced_space_doubly -->

**Options:**
**A1:** O(1)
**A2:** O(n)
**A3:** O(log n)
**A4:** O(n²)

**Correct:** A2

**Exp:**
The space complexity is O(n) because you need to store n nodes, each containing data, next, and prev pointers.

---

### Q: When would you choose a linked list over an array? <!-- Q_ID: advanced_vs_array -->

**Options:**
**A1:** When you need random access
**A2:** When you frequently insert/delete at arbitrary positions
**A3:** When you need cache performance
**A4:** When you need to sort frequently

**Correct:** A2

**Exp:**
Linked lists are better when you frequently insert/delete at arbitrary positions because they don't require shifting elements like arrays do.

---

### T/F: Linked lists are always better than arrays for all use cases. <!-- Q_ID: advanced_always_better -->

**Correct:** False

**Exp:**
No, linked lists are not always better; arrays are better for random access, cache performance, and when you know the size in advance, while linked lists excel at frequent insertions/deletions.

---

## Conclusion

This linked lists quiz covers:

✅ **Basic Concepts**: Node structure, pointers, and fundamental properties
✅ **Singly Linked Lists**: Operations, time complexity, and implementation details
✅ **Doubly Linked Lists**: Advantages, dummy nodes, and bidirectional traversal
✅ **Edge Cases**: Empty lists, single nodes, and error handling
✅ **Time Complexity**: Analysis of different operations and their efficiency
✅ **Implementation**: Code understanding and specific implementation details
✅ **Advanced Concepts**: Space complexity, trade-offs, and when to use each type

The quiz includes:

- **25+ questions** covering all major linked list concepts
- **Multiple question types**: MCQ and True/False
- **Code examples**: Python implementations with explanations
- **Time complexity analysis**: Big-O notation for different operations
- **Edge case handling**: Empty lists, single nodes, and error conditions
- **Practical applications**: When to choose linked lists over other data structures

This serves as a comprehensive test for linked list knowledge! 🚀
