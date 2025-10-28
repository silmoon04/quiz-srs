# Linked Lists Quiz - Sample

_Focused test of linked list fundamentals and basic operations_

---

## Basic Concepts <!-- CH_ID: basic -->

Description: Tests foundational terminology and structure awareness.

---

### Q: What are the two main components of a singly linked list node? <!-- Q_ID: basic_node_components -->

**Options:**

- **A1:** data and next pointer
- **A2:** data and prev pointer
- **A3:** next and prev pointers
- **A4:** data, next, and prev pointers

**Correct:** A1

**Exp:**
A singly linked list node stores the payload in `data` and a `next` pointer that references the following node.

---

### T/F: A singly linked list allows bidirectional traversal. <!-- Q_ID: basic_bidirectional -->

**Correct:** False

**Exp:**
Singly linked lists only expose a `next` pointer, so traversal proceeds forward one node at a time.

---

## Core Operations <!-- CH_ID: operations -->

Description: Validates understanding of insertion and deletion behaviours.

---

### Q: What is the time complexity of inserting at the head of a singly linked list? <!-- Q_ID: operations_insert_head -->

**Options:**

- **A1:** O(1) - Constant time
- **A2:** O(n) - Linear time
- **A3:** O(log n) - Logarithmic time
- **A4:** O(n log n) - N log N time

**Correct:** A1

**Exp:**
Updating the head pointer and the new node’s next reference does not require traversing the list, so the operation runs in constant time.

---

### T/F: Removing the tail of a singly linked list can be done in O(1) time without extra pointers. <!-- Q_ID: operations_remove_tail -->

**Correct:** False

**Exp:**
Without a separate tail pointer or previous references, a singly linked list must be traversed to find the penultimate node before removing the tail, leading to O(n) time.

---
