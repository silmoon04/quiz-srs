# Linked Lists

Linked lists are data structures that store elements in an ordered sequence, similar to arrays, but with key differences in how elements are connected and operations are performed. There are two main types: singly linked lists and doubly linked lists. Below, we'll cover both, including code snippets for operations like insertion and deletion, with explanations of edge cases such as empty lists, single nodes, and insertions/deletions at boundaries.

## Singly Linked Lists

A singly linked list is made up of objects called `Node`s (or `ListNode`s). Each node contains:

- `data` (or `val`): This stores the value of the node (e.g., integer, string).
- `next`: This stores the reference to the next node in the list.

The list has a `head` pointer to the first node and often a `tail` for the last. The last node's `next` points to `None`.

### Creating a Singly Linked List

Here's a basic `Node` and `LinkedList` class in Python:

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

    def __repr__(self):
        return str(self.data)

class LinkedList:
    def __init__(self, nodes=None):
        self.head = None
        if nodes is not None:
            node = Node(data=nodes.pop(0))
            self.head = node
            for elem in nodes:
                node.next = Node(data=elem)
                node = node.next
```

This allows creating a list from a sequence, e.g., `LinkedList([1, 2, 3])`. For an empty list, `head` is `None`.

### Traversal

Traversal uses a loop to visit each node:

```python
def __iter__(self):
    node = self.head
    while node is not None:
        yield node
        node = node.next
```

This runs in \(O(n)\) time, where \(n\) is the number of nodes. Edge case: Empty list (`head` is `None`) yields nothing.

### Insertion Operations

Insertions in singly linked lists are \(O(1)\) if you have a reference to the insertion point, but may require \(O(n)\) traversal to reach it.

#### Insert at Beginning

```python
def add_first(self, node):
    node.next = self.head
    self.head = node
```

- **Explanation**: Updates the new node's `next` to the current `head`, then sets `head` to the new node.
- **Edge Cases**:
  - Empty list: `head` was `None`; new node becomes `head`.
  - Single node: Becomes the new head, old head is now second.

#### Insert at End

```python
def add_last(self, node):
    if self.head is None:
        self.head = node
        return
    current = self.head
    while current.next is not None:
        current = current.next
    current.next = node
```

- **Explanation**: Traverses to the last node and sets its `next` to the new node. Full traversal makes this \(O(n)\) worst-case.
- **Edge Cases**:
  - Empty list: Sets `head` to new node.
  - Single node: Appends to the existing `head`.

#### Insert After a Specific Value

```python
def add_after(self, target_data, new_node):
    if self.head is None:
        raise Exception("List is empty")
    current = self.head
    while current is not None:
        if current.data == target_data:
            new_node.next = current.next
            current.next = new_node
            return
        current = current.next
    raise Exception(f"Node with data '{target_data}' not found")
```

- **Explanation**: Finds the target node, then inserts by updating pointers.
- **Edge Cases**:
  - Empty list: Raises exception.
  - Target is last node: Inserts at end.
  - Target not found: Raises exception.

#### Insert Before a Specific Value

Similar to `add_after`, but tracks previous node:

```python
def add_before(self, target_data, new_node):
    if self.head is None:
        raise Exception("List is empty")
    if self.head.data == target_data:
        return self.add_first(new_node)
    prev = self.head
    current = self.head.next
    while current is not None:
        if current.data == target_data:
            new_node.next = current
            prev.next = new_node
            return
        prev = current
        current = current.next
    raise Exception(f"Node with data '{target_data}' not found")
```

- **Explanation**: Handles insertion before target, using `add_first` if target is head.
- **Edge Cases**:
  - Insert before head: Uses `add_first`.
  - Single node: If target matches, inserts as new head.

### Deletion Operations

Deletions are \(O(1)\) with a reference to the node, but \(O(n)\) to find it.

#### Delete by Value

```python
def remove_node(self, target_data):
    if self.head is None:
        raise Exception("List is empty")
    if self.head.data == target_data:
        self.head = self.head.next
        return
    prev = self.head
    current = self.head.next
    while current is not None:
        if current.data == target_data:
            prev.next = current.next
            return
        prev = current
        current = current.next
    raise Exception(f"Node with data '{target_data}' not found")
```

- **Explanation**: Finds and removes by skipping the node in pointers.
- **Edge Cases**:
  - Empty list: Raises exception.
  - Delete head: Updates `head` to next (handles single node, becomes empty).
  - Delete last node: Previous node's `next` set to `None`.
  - Value not found: Raises exception.

### Circular Linked List

If the last node's `next` points back to `head`, it's circular. Traversal would loop infinitely unless detected (e.g., via cycle detection algorithms like Floyd's tortoise and hare).

## Doubly Linked Lists

Doubly linked lists add a `prev` pointer to each node, allowing bidirectional traversal. This makes some operations (like deletion) easier.

### Creating a Doubly Linked List

Using dummy nodes for head and tail simplifies edge cases:

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
        self.prev = None

class DoublyLinkedList:
    def __init__(self):
        self.head = Node(0)  # Dummy head
        self.tail = Node(0)  # Dummy tail
        self.head.next = self.tail
        self.tail.prev = self.head
        self.length = 0
```

Dummy nodes avoid special checks for empty lists.

### Traversal

Forward:

```python
def traverse_forward(self):
    temp = self.head.next
    while temp != self.tail:
        print(temp.data, end=" ")
        temp = temp.next
    print()
```

Backward (using `prev`):

```python
def traverse_backward(self):
    temp = self.tail.prev
    while temp != self.head:
        print(temp.data, end=" ")
        temp = temp.prev
    print()
```

Both are \(O(n)\). Edge case: Empty list prints nothing.

### Insertion Operations

Insertions are \(O(1)\) with reference.

#### Insert at End (Append)

```python
def insert(self, data):
    new_node = Node(data)
    if self.length == 0:
        self.head.next = new_node
        new_node.prev = self.head
        self.tail.prev = new_node  # Update tail.prev for consistency
        new_node.next = self.tail
    elif self.length == 1:
        current = self.head.next
        current.next = new_node
        new_node.prev = current
        new_node.next = self.tail
        self.tail.prev = new_node
    else:
        new_node.prev = self.tail.prev
        self.tail.prev.next = new_node
        new_node.next = self.tail
        self.tail.prev = new_node
    self.length += 1
```

- **Explanation**: Appends to end, updating `prev` and `next`.
- **Edge Cases**:
  - Empty list: Inserts between dummies.
  - Single node: Adjusts pointers around existing node.
  - Multiple nodes: Inserts before dummy tail.

For insert at beginning: Similar logic, insert after dummy head.

For middle: If have reference, update adjacent `next` and `prev`.

### Deletion Operations

Deletions are \(O(1)\) with node reference.

#### General Delete (by Node Reference)

```python
def delete(self, node):
    if self.length == 0:
        raise Exception("List is empty")
    if self.length == 1:
        self.head.next = self.tail
        self.tail.prev = self.head
    elif node == self.head.next:  # Delete from beginning
        self.head.next = node.next
        node.next.prev = self.head
    elif node == self.tail.prev:  # Delete from end
        self.tail.prev = node.prev
        node.prev.next = self.tail
    else:  # Delete from middle
        node.prev.next = node.next
        node.next.prev = node.prev
    self.length -= 1
```

- **Explanation**: Removes by linking adjacent nodes.
- **Edge Cases**:
  - Empty list: Raises exception (though dummies remain).
  - Single node: Resets to dummies.
  - Delete head/tail: Uses dummies to simplify.
  - Middle: Standard pointer update.

## Time Complexity for Singly Linked Lists

| Operation | Big-O Time Complexity | Note                                                         |
| --------- | --------------------- | ------------------------------------------------------------ |
| Access    | \(O(n)\)              |                                                              |
| Search    | \(O(n)\)              |                                                              |
| Insertion | \(O(1)^\*\)           | Assuming reference to position; \(O(n)\) if traversal needed |
| Deletion  | \(O(1)^\*\)           | Assuming reference to node                                   |

\* At the position.

## Time Complexity for Doubly Linked Lists

| Operation | Big-O Time Complexity | Notes                          |
| --------- | --------------------- | ------------------------------ |
| Access    | \(O(n)\)              |                                |
| Search    | \(O(n)\)              |                                |
| Insertion | \(O(1)^\*\)           | Assuming reference to position |
| Deletion  | \(O(1)^\*\)           | Assuming reference to node     |

\* At the position.

## Closing Notes

Linked lists excel in frequent insertions/deletions without shifting elements, unlike arrays. Singly lists save space but limit backward traversal; doubly lists offer flexibility at the cost of extra pointers. Always handle edge cases to avoid null pointer errors or infinite loops.
