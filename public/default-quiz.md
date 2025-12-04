# Advanced Data Structures & Algorithms Viva Prep

_Top 50 'Archetype' questions covering complexity, pointer manipulation, and core ADT logic, designed for high-stakes spaced repetition._

---

## Core ADT Comparison and Transfer (Q1-Q10)

<!-- CH_ID: ch_viva_1 -->

---

### Q: Sketch an algorithm to check if a **Stack** and a **Queue** contain the exact same set of integer elements (order does not matter). You may use auxiliary data structures.

<!-- Q_ID: ch_viva_1_q1 -->

**Options:**
**A1:** I will iterate through the stack using an index `i` from 0 to size, and for each element, I will perform a linear search through the queue to check for its presence, resulting in $O(N^2)$ complexity.
**A2:** I will use two pointers, one at the top of the stack and one at the front of the queue, and compare them. If they match, I pop/dequeue, otherwise I return false immediately.
**A3:** I will sort the Stack in place using an auxiliary array, and then sort the Queue in place using a second auxiliary array, finally comparing the two sorted arrays element by element.
**A4:** I will pop from the stack and dequeue from the queue simultaneously. If they don't match, return false. This approach incorrectly assumes that the elements must be in the same order.
**A5:** I will use Binary Search on the Stack to find the Queue elements. This requires the Stack to be sorted first, adding an $O(N \log N)$ overhead, and still doesn't handle duplicates efficiently.
**A6:** Time complexity is $O(1)$ because I'm just comparing elements. I can simply peek at the top of the stack and the front of the queue to check for equality.
**A7:** I will check `stack.contains(queue.front())` for every element in the queue. If any element is missing from the stack, I return false, otherwise I return true.
**A8:** I will pop everything from the Stack into the Queue and check for duplicates during the transfer. If no duplicates are found, the sets are considered equal.
**A9:** I will use a Hash Map to count frequencies. First, I pop all elements from the Stack, incrementing their counts in the Map. Then, I dequeue all elements from the Queue, decrementing their counts. Finally, I check if the Map is empty or all counts are zero. Return true if so.
**A10:** I will initialize two empty auxiliary arrays. I will pop the Stack into Array A and dequeue the Queue into Array B. I will then Sort both arrays. Finally, I will iterate through both arrays simultaneously to check if they are identical. Return True if the loop finishes successfully.
**A11:** I will use a Hash Set. I pop elements from the Stack and add them to the Set. Then, I dequeue from the Queue and check if each element exists in the Set. This approach fails to correctly handle duplicate elements.
**A12:** I will simply return `stack.equals(queue)`. This relies on a built-in method which typically checks for both content and order, violating the 'order does not matter' constraint.
**A13:** I will peek at the top of the stack and the front of the queue and loop until both are empty, comparing the values at each step to ensure they are identical.
**A14:** I will convert both ADTs to arrays and compare `array1 == array2`. This comparison checks memory addresses, not content, and is therefore incorrect for value equality.
**A15:** I will use a Frequency Map. I loop through the Stack and Queue, updating counts. If all counts are zero, they are equal. This is an $O(N)$ solution that correctly handles duplicates and ignores order.

**Correct:** A9, A10, A15

**Exp:**
The key is handling duplicates and order independence efficiently.

1. **Hash Map (O(N) Time, O(N) Space):** This is the most efficient method as it handles duplicates and order in a single pass.
2. **Sorting (O(N log N) Time, O(N) Space):** This is also valid, but slower than the Hash Map approach.

Incorrect answers fail because they assume order matters, use inefficient $O(N^2)$ search, or rely on non-existent methods.

---

### Q: Sketch an algorithm to move all elements from a **Queue** into a **Stack** such that the order of elements is **reversed** compared to the original Queue.

<!-- Q_ID: ch_viva_1_q2 -->

**Options:**
**A1:** I will initialize an empty Stack. While the Queue is not empty, I will `dequeue` an element and immediately `push` it onto the Stack. Finally, I return the Stack. This is an $O(N)$ operation.
**A2:** I'll create a function taking the Queue. I'll create a Stack. I loop until `queue.isEmpty()`. Inside the loop: `val = queue.dequeue()`, `stack.push(val)`. Return the Stack. The FIFO removal combined with LIFO insertion achieves reversal.
**A3:** I will transfer elements directly. Since the Queue removes from the front (1st item) and the Stack adds to the top, the first item out of the Queue becomes the bottom of the Stack. The last item out becomes the top. This naturally reverses the access order.
**A4:** I will use two auxiliary stacks. I transfer Queue to Stack 1, then Stack 1 to Stack 2, and finally Stack 2 to the result Stack, ensuring the order is reversed twice.
**A5:** I will swap the head and tail pointers of the Queue. This operation is only possible if the Queue is implemented as a Doubly Linked List, and it only reverses the access direction, not the data structure type.
**A6:** I will iterate backwards through the Queue. Since a standard Queue only allows access to the front element, iterating backwards is not possible without first converting it to an array.
**A7:** I will push the whole Queue object onto the Stack. This operation typically pushes the reference to the Queue object, not its individual elements in reversed order.
**A8:** I will dequeue elements and add them to the _bottom_ of the Stack. Insertion at the bottom of a stack is an $O(N)$ operation, making the total complexity $O(N^2)$.
**A9:** I will use an array, fill it with the queue elements, reverse the array in-place using two pointers, and then push the elements from the reversed array onto the stack.
**A10:** I will use recursion to reach the end of the queue first. The recursive call stack will hold the elements, and as the recursion unwinds, I push them onto the stack.
**A11:** Time complexity is $O(N^2)$ because push is expensive. This is incorrect; standard stack push/pop operations are $O(1)$ when implemented with arrays or linked lists.
**A12:** I will use a Doubly Linked List to traverse the Queue in reverse. This requires converting the Queue to a DLL first, which adds unnecessary complexity and space overhead.
**A13:** I will delete the Queue and create a new Stack with the same values. This is not an algorithmic sketch and relies on high-level, non-standard library functions.
**A14:** I will peek at the queue, push to stack, then dequeue. Peeking is redundant if the value is immediately dequeued and pushed, but the overall logic is sound.
**A15:** I will return the Queue as a Stack. This assumes a type conversion exists that automatically handles the internal data structure reversal, which is not standard practice.

**Correct:** A1, A2, A3

**Exp:**
Moving elements from a FIFO structure (Queue) directly into a LIFO structure (Stack) naturally reverses the order of retrieval. The first element dequeued becomes the deepest element in the stack, and the last element dequeued becomes the top element. This is an $O(N)$ operation.

---

### Q: Sketch an algorithm to insert a new node with value `K` at the **Head** of a **Circular Linked List**, given a pointer to the `tail`.

<!-- Q_ID: ch_viva_1_q3 -->

**Options:**
**A1:** First, I check if the list is empty. If so, create the node and point it to itself. If not, I create `newNode`. I set `newNode.next = tail.next` (current head). Then, I update `tail.next = newNode`. I return the original `tail` pointer.
**A2:** I will initialize a `newNode` with data `K`. I link `newNode.next` to the current `head` (which is `tail.next`). Then I simply update the `tail`'s next pointer to point to my `newNode`. This effectively places it at the start without moving the tail.
**A3:** I handle the empty case by making the node point to itself. For the non-empty case, I perform a standard insertion after `tail`, but I strictly _do not_ update the `tail` reference itself, leaving the new node as the new head.
**A4:** I will create a new node and set `newNode.next = tail`. Then I must traverse the entire list from `tail.next` to find the original head and update its `prev` pointer to the new node.
**A5:** I will set `tail.next = new node` and `new node.next = null`. This operation breaks the circular property of the list by introducing a null termination.
**A6:** I will traverse to the end of the list. Since I already have the `tail` pointer, traversing the entire list to find the head is an unnecessary $O(N)$ operation.
**A7:** I will set `tail = new node`. This makes the new node the tail, but it does not correctly link it to the existing head or maintain the circular structure.
**A8:** I will update `head` pointer to `new node`. Since we are only given the `tail` pointer, we must derive the head from `tail.next` and update the links accordingly.
**A9:** Complexity is $O(N)$ because I have to find the head. This is incorrect; the head is always accessible in $O(1)$ time via `tail.next`.
**A10:** I will swap the values of the tail and the new node. This maintains the structure but places the new value at the tail, not the head.
**A11:** I will create a node, link it to `tail`, and link `tail` to it. This would insert the new node _after_ the tail, making it the new tail, not the new head.
**A12:** If the list is empty, I just set `tail = new node`. This is only half the logic; the node must also point to itself to maintain the circular property.
**A13:** I will use a temporary pointer to traverse the circle. This traversal is unnecessary since the head is directly accessible from the tail pointer.
**A14:** I will insert it after the tail and move the tail pointer forward. This results in the new node becoming the new tail, not the new head.
**A15:** I will check if `tail.next` is null. In a non-empty circular list, `tail.next` should never be null, as it points back to the head.

**Correct:** A1, A2, A3

**Exp:**
In a circular list managed by a `tail` pointer, the head is always `tail.next`. Insertion at the head is an $O(1)$ operation: link the new node to the current head, then update the tail's next pointer to the new node.

---

### Q: Sketch an **iterative** (non-recursive) algorithm to find the **sum** of all keys in a **Binary Tree**.

<!-- Q_ID: ch_viva_1_q4 -->

**Options:**
**A1:** I will use a **Queue** for Level-Order Traversal. Initialize `sum = 0`. Enqueue `root`. While Queue is not empty: Dequeue a node, add its key to `sum`. If `node.left` exists, Enqueue it. If `node.right` exists, Enqueue it. Return `sum`.
**A2:** I will use a **Stack** for Depth-First Traversal. Initialize `sum = 0`. Push `root`. While Stack has items: Pop `current`. `sum += current.key`. Push `current.right` and `current.left` if they are not null. Return `sum`.
**A3:** I will initialize a `total` variable. Using a standard iterative traversal (like BFS with a Queue), I visit every node exactly once. At each visit, I accumulate the value into `total`. Finally, I return `total`.
**A4:** I will simply loop through the tree `for node in tree`. This assumes the tree is stored in an array or list, which is not guaranteed for a general Binary Tree structure.
**A5:** I will use `return sum(left) + sum(right)`. This is the core logic of a recursive solution but does not describe the required iterative approach.
**A6:** I will use a Stack. Push root. Pop, add to sum. Push left child, Push right child. Return sum. This is a valid DFS approach but lacks the necessary checks for null children.
**A7:** I will use a Binary Search to sum the nodes. Binary search is used for finding elements, not for summing all elements in a tree structure.
**A8:** I will traverse the tree using pointers `current = current.left`. This only traverses one branch (the leftmost) and misses the rest of the tree.
**A9:** I will convert the tree to an array using `tree.toArray()`. This relies on a non-standard, high-level function and does not describe the underlying iterative traversal logic.
**A10:** Complexity is $O(\log N)$. This is incorrect; since every node must be visited, the complexity must be $O(N)$.
**A11:** I will use a Queue to perform DFS. A Queue is used for BFS (Level-Order), while a Stack is required for iterative DFS.
**A12:** I initialize sum to 0. While root is not null, add root, root = root.next. This logic is only applicable to linked lists, not tree structures.
**A13:** I will use a Hash Map to store visited nodes. While a visited set is useful for graphs, it is not strictly necessary for tree traversal unless cycles are possible.
**A14:** I will delete nodes as I sum them to save space. This modifies the original tree structure, which is usually undesirable unless explicitly allowed.
**A15:** I will start at the root and keep adding `node.key` until `node` is null. This only works if the tree is a degenerate linked list.

**Correct:** A1, A2, A3

**Exp:**
Iterative traversal requires an auxiliary data structure (Stack for DFS or Queue for BFS) to store unvisited nodes. Since summing requires visiting every node, the time complexity is $O(N)$.

---

### Q: Sketch an algorithm to **sort** an array of integers in **descending** order using a **Min-Heap**.

<!-- Q_ID: ch_viva_1_q5 -->

**Options:**
**A1:** I will create an empty Min-Heap. I insert all array elements into it. Then, I iterate an index `i` starting from the array's **length - 1 down to 0**. At each step, I call `extractMin()` and place the result at `array[i]`. This fills the array with the largest elements at the start and smallest at the end.
**A2:** Alternatively, I could use a **Max-Heap**. I insert all elements. Then I call `extractMax()` repeatedly and fill the array from index 0 upwards. This results in descending order directly without needing to reverse the output.
**A3:** I will Heapify the array into a Min-Heap. Then, I will continuously extract the minimum element. Since I need descending order, I will use a Stack to store the extracted elements temporarily, then pop them back into the array.
**A4:** I insert everything into the Min-Heap, then `extractMin` and put them in the array from index 0 upwards. This process results in an array sorted in _ascending_ order, not descending.
**A5:** I use `binarySearch` on the Heap to find the largest element. Binary search is not applicable to finding the maximum in a heap, which is only guaranteed to be at the root in a Max-Heap.
**A6:** I simply traverse the Heap array and copy elements. This is incorrect because the underlying array of a heap is not sorted, only partially ordered.
**A7:** I insert into the Heap, then use Bubble Sort. This combines an $O(N \log N)$ insertion with an $O(N^2)$ sort, which is inefficient and unnecessary.
**A8:** I extract elements and push them onto a Stack, then pop to array. This is a valid approach (Option 3) but requires the intermediate Stack structure.
**A9:** Time complexity is $O(N)$. This is incorrect; building the heap takes $O(N)$, and $N$ extractions take $O(N \log N)$, so the total complexity is $O(N \log N)$.
**A10:** I check the leaf nodes for the maximum value. In a Min-Heap, the maximum value can be located anywhere among the leaf nodes, requiring $O(N)$ search time.
**A11:** I use a Min-Heap but negate the numbers before inserting. This effectively turns the Min-Heap into a Max-Heap for the original values, allowing for descending order extraction.
**A12:** I extract root, then swap root with random element. Swapping with a random element violates the heap property and does not guarantee sorting.
**A13:** I delete the heap and create a sorted list. This relies on an abstract 'delete' operation that doesn't specify the underlying sorting mechanism.
**A14:** I assume the Heap is already sorted. This is fundamentally incorrect; heaps are partially ordered, not fully sorted.
**A15:** I return the underlying array of the Heap. This array is only partially ordered and not fully sorted in either ascending or descending order.

**Correct:** A1, A2, A3

**Exp:**
A Min-Heap naturally extracts elements in ascending order. To achieve descending order, you must either use a Max-Heap (Option 2) or reverse the output of the Min-Heap, either by filling the array backwards (Option 1) or using an auxiliary Stack (Option 3). All methods result in $O(N \log N)$ time complexity.

---

### Q: Given a Graph (Adjacency List) and a starting vertex `S`, sketch an algorithm to find the **shortest path** (number of edges) from `S` to a target `T`.

<!-- Q_ID: ch_viva_1_q6 -->

**Options:**
**A1:** I will use **BFS** with a Queue. I'll also maintain a `distance` Map (or array) initialized to -1. Set `distance[S] = 0`. Enqueue `S`. While Queue not empty: Dequeue `u`. If `u == T`, return `distance[u]`. For each neighbor `v` of `u`: If `v` is unvisited, set `distance[v] = distance[u] + 1` and Enqueue `v`.
**A2:** I initialize a Queue for the traversal and a Set for visited nodes. I start a level-counter at 0. I process nodes level-by-level (using the queue size). If I encounter `T`, I return the current level count. If the queue empties, `T` is unreachable.
**A3:** I employ a Breadth-First Search strategy. I enqueue the start node `S`. I keep track of `predecessor` pointers. When I find `T`, I backtrack using the predecessors to count the steps. This ensures the shortest path in an unweighted graph.
**A4:** I will use DFS (Stack) to search for the node. DFS finds _a_ path, but since it explores depth-first, it does not guarantee that the first path found is the shortest path in terms of edges.
**A5:** I will traverse the adjacency list linearly. This approach is only valid if the graph is a linked list or array, which is not the case for a general graph structure.
**A6:** I will use recursion. While recursion can implement DFS, it is not the preferred method for finding the shortest path in an unweighted graph.
**A7:** I don't need to mark visited nodes because it's a list. This is incorrect; marking visited nodes is crucial to prevent infinite loops in graphs with cycles.
**A8:** I will use Dijkstra's Algorithm. While Dijkstra's works, it is unnecessarily complex for an unweighted graph, where BFS provides the optimal $O(V+E)$ solution.
**A9:** I will sort the edges. Sorting edges is typically used for Minimum Spanning Tree algorithms like Kruskal's, not for finding the shortest path between two nodes.
**A10:** I will return `true` if found. The requirement is to find the _length_ of the path, not just whether the destination is reachable.
**A11:** I use a Queue, enqueue S. While queue not empty, dequeue, check if T. If yes, return. Else enqueue neighbors. This finds reachability but doesn't track the path length efficiently.
**A12:** Time complexity is $O(N^2)$. For an adjacency list, BFS complexity is $O(V+E)$, which is generally better than $O(V^2)$ unless the graph is dense.
**A13:** I assume the graph is a tree. If the graph is a general graph, this assumption is invalid and the algorithm must handle cycles.
**A14:** I check `S.next` until I find `T`. This assumes a linear structure like a linked list, which is not true for a graph.
**A15:** I use a Priority Queue. A Priority Queue is the core data structure for Dijkstra's algorithm, which is typically used for weighted graphs.

**Correct:** A1, A2, A3

**Exp:**
For unweighted graphs, Breadth-First Search (BFS) guarantees finding the shortest path in terms of the number of edges. DFS only finds _a_ path. The complexity is $O(V+E)$. Tracking distance or predecessors is necessary to return the path length or the path itself.

---

### Q: Sketch an algorithm to find all elements in an integer Array that appear **more than once** (duplicates).

<!-- Q_ID: ch_viva_1_q7 -->

**Options:**
**A1:** I will initialize an empty **Hash Set** called `seen` and a Set called `duplicates`. I iterate through the array. For each number: if it is already in `seen`, I add it to `duplicates`. Else, I add it to `seen`. Finally, I return the `duplicates` set.
**A2:** I will use a **Frequency Map**. Loop through the array, mapping `Number -> Count`. After the loop, iterate through the Map's keys. If `Count > 1`, add to my result list. Return result. This is an $O(N)$ time solution.
**A3:** I initialize a Hash Set. I loop through the array. If `set.add(value)` returns false (meaning it's already there), I print/store that value as a duplicate. This leverages the Set's constant-time insertion check.
**A4:** I will use nested loops to compare every number with every other number. This approach correctly finds duplicates but results in an inefficient $O(N^2)$ time complexity.
**A5:** I will Sort the array using an $O(N \log N)$ algorithm. Then I iterate linearly, checking if `array[i] == array[i+1]`. This is a valid but sub-optimal solution compared to hashing.
**A6:** I will use a Binary Search Tree. I insert all elements into the BST. If an element already exists, I mark it as a duplicate. Insertion takes $O(N \log N)$ time overall.
**A7:** I will use a Stack to track numbers. I push elements onto the stack. If I encounter an element already present in the stack, I mark it as a duplicate, which requires $O(N)$ search per element, leading to $O(N^2)$ total time.
**A8:** I will use a Hash Map. If key exists, return true. This only checks if _any_ duplicate exists, not _which_ elements are duplicates, nor does it return all of them.
**A9:** I will use an array of size 100 to count. This is only feasible if the range of input integers is small and known (e.g., 1 to 100), otherwise it requires excessive space.
**A10:** I will delete duplicates from the array. This modifies the original array and does not fulfill the requirement of returning the list of duplicate elements.
**A11:** Space complexity is $O(1)$. This is generally only achievable if the input array can be modified and the numbers are within the range $[1, N]$, using the array indices as a hash map.
**A12:** I will hash the whole array into one value. This technique is used for checksums or fingerprinting, but collisions make it unreliable for finding specific duplicates.
**A13:** I will use a Queue to cycle through numbers. A queue does not provide the necessary random access or fast lookup required for duplicate detection.
**A14:** I will use a Linked List to store seen numbers. Searching this list for duplicates takes $O(N)$ time per element, leading to an overall $O(N^2)$ complexity.
**A15:** I will compare the first and last elements. This only checks two positions and fails to detect duplicates within the rest of the array.

**Correct:** A1, A2, A3

**Exp:**
The most efficient solution is to use a Hash Table (Map or Set) to track frequencies or existence. This allows for an $O(N)$ time complexity solution, which is faster than sorting ($O(N \log N)$) or nested loops ($O(N^2)$).

---

### Q: Sketch an algorithm to check if a given Binary Tree is a valid **Binary Search Tree (BST)**.

<!-- Q_ID: ch_viva_1_q8 -->

**Options:**
**A1:** I will perform an **In-Order Traversal** and store the values in a list. Then, I iterate through the list to check if it is **sorted** in strictly ascending order. If yes, it is a BST.
**A2:** I will use a recursive function that takes a node and a valid range `(min, max)`. Initialize with `(-\infty, +\infty)`. At each node, check if `val` is within range. Recurse left updating `max` to `val`. Recurse right updating `min` to `val`.
**A3:** I will use an Iterative In-Order traversal (using a Stack). I keep track of the `previous_value` visited. If the `current_value` is ever less than or equal to `previous_value`, I return False immediately, avoiding the need to store the entire list.
**A4:** I will traverse the tree and check only if `node.left.val < node.val` and `node.right.val > node.val`. This local check is insufficient because it fails to enforce the global BST property across all ancestors.
**A5:** I will perform a Pre-Order traversal. Pre-Order traversal does not yield a sorted sequence, so it cannot be used directly to verify the BST property.
**A6:** I will search for duplicates. While duplicates violate the strict BST definition, checking only for duplicates is insufficient, as a non-BST might still have unique elements.
**A7:** I will use a Queue for BFS and check values. BFS orders nodes by level, which does not correspond to the required sorted order for BST validation.
**A8:** I will check if the tree is balanced. Balance (like in AVL or Red-Black trees) is a separate property from the BST ordering property.
**A9:** I will sort the tree. Sorting the tree is not a valid check; we must verify if the _existing_ structure adheres to the BST rules.
**A10:** I will check if the height is $O(\log N)$. This only verifies balance, which is not required for a basic BST.
**A11:** I will assume it is a BST and try to search for a random element. If the search fails, I conclude it is not a BST, which is logically unsound.
**A12:** I compare the root with the leaves. This check is too limited and ignores the ordering constraints imposed on all internal nodes.
**A13:** I convert it to a Heap and check. Heaps and BSTs have different ordering properties; converting one to the other does not validate the original structure.
**A14:** I use recursion without passing min/max limits. This recursive check only validates the immediate parent-child relationship, failing the global BST constraint.
**A15:** I return true if it has 2 children. The number of children is irrelevant to the BST ordering property.

**Correct:** A1, A2, A3

**Exp:**
The core property of a BST is that an In-Order traversal yields a sorted list. Alternatively, the recursive approach is robust, ensuring that every node adheres to the global min/max constraints imposed by its ancestors, not just its immediate parent.

---

### Q: Sketch an algorithm to find the **middle node** of a Singly Linked List.

<!-- Q_ID: ch_viva_1_q9 -->

**Options:**
**A1:** I will use the **Two Pointer Method** (Slow and Fast). Initialize both at head. Loop while `fast` and `fast.next` are not null. Move `slow` one step, move `fast` two steps. When `fast` reaches the end, `slow` will be at the middle. Return `slow`.
**A2:** I will perform two passes. First, traverse to count total nodes `N`. Then, calculate `mid = N/2`. Traverse again from head `mid` times to reach the node. Return it. This is an $O(N)$ time solution.
**A3:** I will push every node pointer onto a Stack while traversing. Then I pop $N/2$ elements off the stack. The element currently at the top is the middle. This uses $O(N)$ space.
**A4:** I will access `list[size / 2]`. This assumes the linked list supports random access by index, which is only true if it is implemented as an array list.
**A5:** I will use `head.next.next`. This only returns the third node in the list and is only correct if the list has exactly five nodes.
**A6:** I will check if `node.next == null`. This condition identifies the tail node, not the middle node of the list.
**A7:** I will create a new array, copy the list elements into it, and take the middle index. This is an $O(N)$ time and $O(N)$ space solution, but it is not an in-place linked list operation.
**A8:** I will use recursion to fold the list in half. While possible, this is overly complex and typically results in higher space complexity due to the call stack.
**A9:** I will guess the middle. This is not a deterministic algorithm and will fail for lists of unknown or varying lengths.
**A10:** I will keep a count and stop at count 5. This only works if the list size is known beforehand and is exactly 10.
**A11:** I will iterate `i` and `j` at the same speed. If both pointers move one step at a time, they will both reach the end simultaneously, not the middle.
**A12:** I will use a Doubly Linked List approach. This is not applicable as the input is specified as a Singly Linked List.
**A13:** I will delete nodes from start and end until 1 remains. This correctly identifies the middle but modifies the original list structure.
**A14:** I will use a Hash Map to store indices. This requires $O(N)$ space and still requires a full traversal to map indices to nodes.
**A15:** I will assume the list has size variable available. If the size is available, the two-pass method (Option 2) is simplified to a single pass.

**Correct:** A1, A2, A3

**Exp:**
The Two-Pointer (Tortoise and Hare) method is the most efficient, solving the problem in a single pass $O(N)$ time and $O(1)$ space. The two-pass method is also $O(N)$ time but requires two full traversals. The Stack method is $O(N)$ time but uses $O(N)$ space.

---

### Q: Sketch an algorithm to **delete** a specific node `P` from a **Doubly Linked List**, given only the pointer to `P`.

<!-- Q_ID: ch_viva_1_q10 -->

**Options:**
**A1:** I check if `P.prev` exists. If so, `P.prev.next = P.next`. If not, `P` was head (update head). Then check if `P.next` exists. If so, `P.next.prev = P.prev`. If not, `P` was tail. Finally, nullify `P`'s pointers.
**A2:** Since I have access to neighbors, I link the node _before_ `P` directly to the node _after_ `P`, and vice versa. This effectively bypasses `P` by updating two pointers on the left and two pointers on the right. This is an $O(1)$ operation.
**A3:** I identify `left = P.prev` and `right = P.next`. If `left` is not null, `left.next = right`. If `right` is not null, `right.prev = left`. The node is now detached, and I must handle the edge case where `P` is the head or tail.
**A4:** I will traverse from Head to find `P`. This is unnecessary since the pointer to `P` is already provided, and traversal would increase complexity to $O(N)$.
**A5:** I will set `P = null`. This only removes the local reference to P but leaves the node dangling in the list structure, causing a memory leak and breaking links.
**A6:** I will set `P.next.prev = P.prev` only. This correctly updates the backward link of the successor but fails to update the forward link of the predecessor.
**A7:** I will copy the data from the next node into `P` and delete the next node. This is a common trick for Singly Linked Lists but is unnecessary and complex for Doubly Linked Lists.
**A8:** I will delete the whole list. This is an extreme measure that does not fulfill the requirement of deleting only node P.
**A9:** I will use a Stack to track previous nodes. This is an unnecessary use of an auxiliary data structure since the `P.prev` pointer is already available.
**A10:** I will swap `P` with the Tail and delete Tail. This maintains the list structure but changes the position of the data originally stored in P.
**A11:** I will return the value of `P`. The requirement is to delete the node, not just return its value.
**A12:** Complexity is $O(N)$. This is incorrect; deletion in a Doubly Linked List, given the node pointer, is an $O(1)$ operation.
**A13:** I assume `P` is always in the middle. This ignores the critical edge cases where P might be the head or the tail of the list.
**A14:** I link `P.prev` to `P.prev.prev`. This incorrectly links the predecessor to the node two steps behind P, skipping P's immediate predecessor.
**A15:** I will check if `P` is null and return. This is a necessary null check but does not describe the deletion logic itself.

**Correct:** A1, A2, A3

**Exp:**
Since a Doubly Linked List provides access to both `prev` and `next` pointers, deletion can be performed in $O(1)$ time by simply updating the neighbors' pointers to bypass the node `P`. Edge cases (deleting head or tail) must be handled by checking for null pointers.

---

## Linked List Cycles, Reversal, and Merging (Q11-Q15)

<!-- CH_ID: ch_viva_2 -->

---

### Q: Sketch an algorithm to determine if a **Singly Linked List** contains a cycle (a loop). You cannot modify the list structure.

<!-- Q_ID: ch_viva_2_q11 -->

**Options:**
**A1:** I will use **Floyd’s Cycle-Finding Algorithm** (Tortoise and Hare). I initialize two pointers, `slow` and `fast`, both at the head. I loop while `fast` and `fast.next` are not null. `slow` moves 1 step; `fast` moves 2 steps. If `slow == fast`, I return True. If the loop ends, I return False.
**A2:** I will use a **Hash Set** of Node References (not values). I traverse the list. For every node, I check if the _pointer address_ is already in the Set. If yes, cycle detected. If no, add it. If I hit null, return False. (Note: This uses $O(N)$ space).
**A3:** I use two pointers, one moving at speed $v$ and the other at speed $2v$. If they ever meet, a cycle exists. If the faster pointer reaches the end of the list (null), no cycle exists. This is an $O(N)$ time, $O(1)$ space solution.
**A4:** I will traverse the list from the head and check if the current node's `next` pointer points back to the original `head` reference, which only detects a specific type of cycle.
**A5:** I will iterate for a set time (e.g., 5 seconds) and if it doesn't end, it's a cycle. This is non-deterministic and unreliable for varying list sizes.
**A6:** I will traverse the list and mark nodes as 'visited' by adding a boolean flag. This modifies the list structure, violating the problem constraint.
**A7:** I will check if `next` pointers are increasing in memory address. This relies on memory layout assumptions which are not guaranteed by the data structure definition.
**A8:** I will use recursion to traverse; if the stack overflows, there is a cycle. This is an unreliable method that depends on system limits rather than algorithmic logic.
**A9:** I will compare the current node with the previous node. This only detects cycles of length 2, where a node points back to its immediate predecessor.
**A10:** I will reverse the list and see if I return to the start. Reversing the list modifies the structure, violating the problem constraint.
**A11:** I will use two pointers moving at the same speed starting from opposite ends. This is only applicable to arrays or doubly linked lists where the end is known.
**A12:** I will calculate the length of the list. If it's infinite, return true. This is not a practical algorithm as it would run indefinitely for a cyclic list.
**A13:** I will check if the last node points to null. This only checks for a standard termination and fails if the cycle is internal.
**A14:** I will use a Hash Map to store values. This fails if the list contains duplicate values but no cycle.
**A15:** I will delete nodes as I go. If I hit a null, no cycle. This modifies the list structure, violating the problem constraint.

**Correct:** A1, A2, A3

**Exp:**
The Tortoise and Hare algorithm (Floyd's) is the optimal solution, providing $O(N)$ time complexity and $O(1)$ space complexity. Using a Hash Set is also $O(N)$ time but requires $O(N)$ space to store node references.

---

### Q: Sketch an algorithm to **reverse** a **Singly Linked List** in-place (without creating a new list).

<!-- Q_ID: ch_viva_2_q12 -->

**Options:**
**A1:** I initialize three pointers: `prev` (null), `curr` (head), and `next` (null). I loop while `curr` is not null. Inside: 1. Save `next = curr.next`. 2. Reverse link `curr.next = prev`. 3. Move `prev = curr`. 4. Move `curr = next`. Finally, update `head = prev`.
**A2:** I utilize a standard iterative pointer reversal. I maintain a `previous` pointer. As I traverse with `current`, I temporarily store the `future` node. I redirect `current` to point to `previous`, then shift our window of three pointers one step forward.
**A3:** I use recursion. Base case: if head is empty or single, return it. Recursive step: `newHead = reverse(head.next)`. Then perform the surgery: `head.next.next = head` and `head.next = null`. Return `newHead`.
**A4:** I will swap the `head` and `tail` pointers of the list structure. Then I must traverse the entire list to update all individual `next` pointers to point backwards, which is not an in-place $O(1)$ operation.
**A5:** I will traverse the list and set `node.next = node.prev`. This assumes the list is a Doubly Linked List, which is not the case for a Singly Linked List.
**A6:** I will use a Stack to store values, then overwrite the nodes. This uses $O(N)$ auxiliary space, violating the spirit of an in-place $O(1)$ space solution.
**A7:** I will iterate through: `curr.next = prev; prev = curr; curr = curr.next`. This is missing the crucial step of saving `curr.next` before overwriting it, leading to loss of the rest of the list.
**A8:** I will swap the first node with the last, second with second-last, and so on. This requires $O(N^2)$ time for a Singly Linked List because finding the $N-i$ node takes $O(N)$ time.
**A9:** I will use Recursion: `head.next = reverse(head)`. This recursive step is incorrect and will lead to an infinite loop or a broken list structure.
**A10:** I will create a new List and add nodes to the head. This is not an in-place operation and uses $O(N)$ auxiliary space.
**A11:** I will use Doubly Linked List logic. This is not applicable as the input is specified as a Singly Linked List.
**A12:** I will iterate `i` from 0 to N and swap `next` pointers. This is too vague and doesn't specify the necessary three-pointer management for in-place reversal.
**A13:** I will point the head to null and the tail to the head. This breaks the list structure and does not achieve reversal.
**A14:** I will traverse to the end, then work backwards. Working backwards in a Singly Linked List requires $O(N^2)$ time or $O(N)$ space (using a stack).
**A15:** I will use a temporary variable to swap `node` and `node.next`. This operation only swaps two adjacent nodes and does not reverse the entire list.

**Correct:** A1, A2, A3

**Exp:**
The iterative solution is the most common and efficient, using $O(N)$ time and $O(1)$ space by managing three pointers (`prev`, `curr`, `next`). The recursive solution is also $O(N)$ time but uses $O(N)$ space on the call stack.

---

### Q: Sketch an algorithm to merge two **Sorted Arrays** into a single **Sorted Array**.

<!-- Q_ID: ch_viva_2_q13 -->

**Options:**
**A1:** I initialize a new array of size `A+B` and two pointers `i=0, j=0`. While both pointers are valid, I compare `A[i]` and `B[j]`. I add the smaller one to the new array and increment its pointer. Once one array is exhausted, I copy the remaining elements of the other array.
**A2:** I use the 'Two Finger' method. I point to the start of both arrays. I repeatedly select the minimum of the two pointed values, append it to my result list, and advance that specific pointer. Finally, I append any 'tail' remaining in the non-empty array.
**A3:** I iterate both arrays. If `A[i] \le B[j]`, push `A[i]`. Else push `B[j]`. This linear scan merges them in $O(N)$ time, ensuring the final array remains sorted because the inputs were sorted.
**A4:** I will first concatenate Array B onto the end of Array A, creating a single large array. Then I will apply an $O(N \log N)$ sorting algorithm like QuickSort to the combined structure to ensure the final sorted order.
**A5:** I will insert elements of Array B into Array A one by one. Since Array A is an array, insertion requires shifting elements, leading to an inefficient $O(N^2)$ complexity.
**A6:** I will use two loops: `for i in A` and `for j in B`. This suggests a nested loop structure, which is typically used for $O(N^2)$ comparisons, not for linear merging.
**A7:** I will use a Hash Set to merge them. Using a Hash Set loses the sorted order and fails to handle duplicates correctly if the problem requires preserving them.
**A8:** I will compare `A[i]` and `B[i]` and add the smaller one. This fails if the arrays have different lengths or if the remaining elements in one array are smaller than the current elements in the other.
**A9:** I will zip them together `A[0], B[0], A[1], B[1]...`. This interleaving only works if the arrays are perfectly balanced and elements alternate in value.
**A10:** I will use a Stack to sort them. Stacks are LIFO and not suitable for maintaining the global sorted order during a merge operation.
**A11:** I will create a new array of size `A.length`. This is incorrect if the arrays have different lengths, as the resulting array must accommodate all elements.
**A12:** I will iterate until `i < A.length` AND `j < B.length`, then stop. This fails to include the remaining elements of the longer array in the result.
**A13:** I will use a Max-Heap. I insert all elements into the Max-Heap and then extract them. This results in descending order and is less efficient than the linear merge.
**A14:** I will delete elements from A as I move them. Modifying the input arrays is generally avoided in merge operations unless specified.
**A15:** I will start from the end of both arrays. This approach is typically used for merging in-place when the destination array is one of the inputs and has sufficient space at the end.

**Correct:** A1, A2, A3

**Exp:**
Since both input arrays are already sorted, the merge operation can be done in linear time, $O(N+M)$, using the 'Two Finger' approach. This is the core step of Merge Sort and is significantly faster than sorting the combined array ($O((N+M) \log (N+M))$).

---

### Q: Sketch an algorithm to implement a **Queue** (FIFO) using only **two Stacks**.

<!-- Q_ID: ch_viva_2_q14 -->

**Options:**
**A1:** I maintain an `InStack` and an `OutStack`. For `enqueue`, I simply push to `InStack`. For `dequeue`, I check if `OutStack` is empty. If it is, I pop _all_ elements from `InStack` and push them to `OutStack` (reversing order). Then I pop from `OutStack`.
**A2:** I separate concerns: Stack A is for writing, Stack B is for reading. When the user asks to read (dequeue) and Stack B is empty, I 'pour' the entire contents of A into B. This reverses the LIFO order to FIFO. I then pop from B. This is an amortized $O(1)$ solution.
**A3:** I define `push` as `s1.push(x)`. I define `pop`: If `s2` is empty, transfer `s1` to `s2`. Return `s2.pop()`. This provides amortized $O(1)$ time complexity because each element is moved exactly twice.
**A4:** I will use one stack for evens and one for odds. This partitioning by value is irrelevant to the FIFO requirement of a queue structure.
**A5:** To enqueue, I push to Stack 1. To dequeue, I pop from Stack 1. This implementation maintains LIFO order, which violates the fundamental FIFO requirement of a Queue structure.
**A6:** I will push to Stack 1. When I need to dequeue, I move _everything_ to Stack 2, pop, then move _everything_ back to Stack 1. This results in an inefficient $O(N)$ time complexity for every single dequeue operation.
**A7:** I will use Stack 1 as the Head and Stack 2 as the Tail. This terminology is confusing and doesn't describe the necessary transfer logic to achieve FIFO.
**A8:** I push to S1. To dequeue, I pop S1 and push to S2, then pop S2. This is an incomplete description of the transfer process and fails to handle multiple elements correctly.
**A9:** I alternate pushing between S1 and S2. This results in an arbitrary ordering that is neither strictly FIFO nor LIFO.
**A10:** I use recursion to simulate the second stack. While possible, this uses the call stack as the auxiliary structure, which is not strictly using 'only two stacks' as data structures.
**A11:** I keep Stack 2 sorted. Maintaining a sorted stack requires $O(N)$ time per insertion, making the overall performance very poor.
**A12:** I copy S1 to S2 only if S1 is full. This condition is arbitrary and does not relate to the logic required for FIFO access.
**A13:** To enqueue, I empty S1 into S2, push new item to S1, move S2 back. This makes the enqueue operation $O(N)$, which is inefficient.
**A14:** I push to both stacks to keep a backup. This wastes space and does not help in achieving FIFO ordering.
**A15:** I return `Stack1.pop()`. This is only correct if Stack 1 is empty and the element is retrieved from Stack 2, which is not fully described here.

**Correct:** A1, A2, A3

**Exp:**
The core idea is that transferring elements from one stack to another reverses their order. By using one stack for input (`InStack`) and one for output (`OutStack`), we achieve FIFO behavior. The transfer operation is $O(N)$, but since each element is transferred only once, the amortized time complexity for both push and pop is $O(1)$.

---

### Q: Sketch an algorithm using a **Stack** to check if a string of parentheses `()[]{}` is balanced.

<!-- Q_ID: ch_viva_2_q15 -->

**Options:**
**A1:** I initialize an empty Stack. I loop through chars. If '(', '[', '{', I push it. If ')', ']', '}', I check if stack is empty (return false). Else, I pop. If the popped char doesn't match the current closing bracket type, return False. Finally, return `stack.isEmpty()`.
**A2:** I use a Stack to store expected closing brackets. If I see `(`, I push `)`. If I see `[`, push `]`. If I see a closing bracket, I pop and compare. If they differ or stack is empty, it's invalid. At end, stack must be empty.
**A3:** I iterate through the string. Open brackets go onto the Stack. For a closing bracket, I pop the top. If the pair is not a valid match (like `(` and `]`), I fail immediately. Also, if I finish the string and the stack still has items, it's invalid.
**A4:** I will maintain separate counters for open and closed brackets of each type. If the final counts match, I return true. This fails to check the crucial nesting order required for balance (e.g., `)(` passes the count check but is invalid).
**A5:** I will use a Queue to match them. A Queue (FIFO) is unsuitable for checking nesting, as the last bracket opened must be the first one closed (LIFO).
**A6:** I push everything to the stack and then check if it's a palindrome. Palindrome checking is irrelevant to bracket balancing.
**A7:** I iterate. If I see an open bracket, push. If closed, pop. If stack is not empty at end, return False. This is an incomplete description, as it fails to check for type mismatch (e.g., `[)`).
**A8:** I split the string in half and compare. This only works for palindromes and is not applicable to nested structures.
**A9:** I use two stacks, one for open, one for closed. This is overly complicated; a single stack is sufficient to track the required nesting order.
**A10:** I push closed brackets and pop open ones. The logic should be reversed: push open brackets and pop when a matching closed bracket is found.
**A11:** If `stack.pop()` returns null, ignore it. If pop returns null (or throws an exception), it means a closing bracket was found without a matching open bracket, which is an immediate failure condition.
**A12:** I traverse from both ends inward. This is the technique for palindrome checking, not for nested structure validation.
**A13:** I replace `()` with empty string until string is empty. This is a valid approach but is typically implemented using string manipulation or recursion, not a stack.
**A14:** I use Regex. While possible, this does not demonstrate the underlying data structure logic required by the question.
**A15:** I iterate. If I see open, push. If closed, peek. If peek matches, pop. This is correct, but the full algorithm must also handle the empty stack case and the final check.

**Correct:** A1, A2, A3

**Exp:**
A Stack is ideal for checking nested structures because of its LIFO property (the last bracket opened must be the first one closed). The algorithm must handle three failure conditions: 1) Trying to pop from an empty stack, 2) Mismatched types, and 3) Stack not empty at the end.

---

## Tree and Graph Traversal & Structure (Q16-Q20)

<!-- CH_ID: ch_viva_3 -->

---

### Q: Sketch an algorithm to convert a Graph represented as an **Adjacency Matrix** into an **Adjacency List**.

<!-- Q_ID: ch_viva_3_q16 -->

**Options:**
**A1:** I initialize an array of empty Linked Lists, size V. I iterate `i` from 0 to V-1 (rows). Inside, I iterate `j` from 0 to V-1 (cols). If `matrix[i][j] \ne 0` (edge exists), I add `j` to `List[i]`. Return the array of lists.
**A2:** I create an `AdjacencyList` structure. I loop through every cell of the matrix. Whenever I encounter a '1' at `[row][col]`, I access the list for `row` and append `col` to it. This filters out the non-edges and results in $O(V^2)$ time complexity.
**A3:** I construct a Map where Key is Vertex ID and Value is a List. I scan the matrix. For every non-zero entry at `(u, v)`, I append `v` to `Map.get(u)`. This efficiently compresses the sparse data representation from $O(V^2)$ space to $O(V+E)$ space.
**A4:** I will flatten the matrix into a single array. This loses the structural information about which vertex connects to which, making it impossible to reconstruct the graph.
**A5:** I will assume the matrix is sparse and use a Hash Map. This is a good choice, but the conversion still requires iterating through the entire $V^2$ matrix.
**A6:** I will loop `i` from 0 to N. `List[i] = Matrix[i]`. This simply copies the row of the matrix into the list, resulting in a list containing zeros and ones, not just the neighbors.
**A7:** I will use BFS to traverse the matrix. Traversal algorithms are used to explore a graph, not to change its underlying representation.
**A8:** I will swap rows and columns. This operation results in the adjacency matrix of the _reverse_ graph, not the adjacency list of the original graph.
**A9:** I will store the weights in a stack. Stacks are LIFO and not suitable for storing the list of neighbors for each vertex.
**A10:** I iterate `matrix[i][j]`. If it is 0, I add it to the list. This incorrectly records non-edges instead of actual connections.
**A11:** I create a Linked List for every entry in the matrix. This would result in $V^2$ lists, which is incorrect; only $V$ lists are needed.
**A12:** I iterate `i` and `j`. `List.add(matrix[i][j])`. This creates a single list of all matrix entries, losing the vertex-specific connection information.
**A13:** I only check the upper triangle of the matrix. This is only valid for undirected graphs and still requires checking the lower triangle if the graph is directed.
**A14:** I use a Queue to store neighbors. A queue is not the standard structure for storing the static list of neighbors in an adjacency list.
**A15:** I return the matrix as is. This does not perform the required conversion to an adjacency list representation.

**Correct:** A1, A2, A3

**Exp:**
The conversion requires iterating through the $V \times V$ matrix. for every non-zero entry at `matrix[i][j]`, an edge exists from vertex `i` to vertex `j`. This means `j` must be added to the adjacency list of `i`. The time complexity is $O(V^2)$.

---

### Q: Sketch an algorithm to **count the number of leaf nodes** in a **Binary Tree**.

<!-- Q_ID: ch_viva_3_q17 -->

**Options:**
**A1:** I will use **DFS** (recursion or stack). If `root` is null, return 0. If `root.left` and `root.right` are BOTH null, it is a leaf, return 1. Otherwise, return `count(left) + count(right)`.
**A2:** I will perform a **Level Order Traversal** using a Queue. I initialize `count = 0`. As I dequeue each node, I check: does it have NO children? If yes, `count++`. If no, enqueue existing children. Return `count`.
**A3:** I traverse the tree. For every node, I check the 'Leaf Condition': is it childless? If so, I increment my counter. I ensure I visit every node using a standard Stack-based traversal to achieve $O(N)$ time complexity.
**A4:** I will count all nodes and divide by 2. This is incorrect; the number of leaves is not necessarily half the total number of nodes.
**A5:** I will traverse and count nodes where `next == null`. This is linked list terminology and is not applicable to tree structures.
**A6:** I will return the size of the last level. This is correct only if the tree is a perfect binary tree, which is not guaranteed.
**A7:** I will use In-Order traversal and count the first and last node. This only counts two nodes and misses all internal leaves.
**A8:** I will count nodes that have 1 child. This counts internal nodes, not leaf nodes.
**A9:** I will use the height of the tree. Height is related to depth, not the count of leaf nodes.
**A10:** I will check if `node == null`. This condition is used for the base case of recursion, not for counting actual nodes.
**A11:** I will count nodes where `left \ne null` OR `right \ne null`. This counts internal nodes, not leaf nodes.
**A12:** I will use an array to store the tree and count empty indices. This is only applicable if the tree is a complete binary tree represented by an array.
**A13:** I will delete the root until only leaves remain. This modifies the tree structure, which is generally undesirable.
**A14:** I will assume the tree is a Heap. Heaps are a type of complete binary tree, but the counting logic remains the same.
**A15:** I will count how many null pointers exist. This count is related to the number of nodes, but not directly the number of leaves.

**Correct:** A1, A2, A3

**Exp:**
A leaf node is defined as a node where both the left and right children are null. Any full traversal (DFS or BFS) can be used, provided the leaf condition is checked at every node. Time complexity is $O(N)$.

---

### Q: Sketch an algorithm to find the **height** (max depth) of a **Binary Tree**.

<!-- Q_ID: ch_viva_3_q18 -->

**Options:**
**A1:** I will use **Recursion**. Base case: if node is null, return -1 (or 0). Recursive step: `leftH = height(node.left)`, `rightH = height(node.right)`. Return `1 + max(leftH, rightH)`.
**A2:** I will use **BFS** with a Queue. I initialize `height = 0`. Inside the loop, I record `size = queue.size()`. I process exactly `size` nodes (this clears one level). Then I increment `height`. Repeat until queue empty.
**A3:** I will use a Stack for DFS, but I will store pairs `(Node, Depth)`. I track a variable `maxDepth`. As I push nodes, I increment their depth. `maxDepth = max(maxDepth, currentDepth)`. This is an $O(N)$ iterative solution.
**A4:** I will count the total number of nodes. The total number of nodes is not directly equal to the height of the tree.
**A5:** I will go strictly down the left branch. This only finds the depth of the left branch, which may not be the maximum depth.
**A6:** I will use `height = left.height + right.height`. This formula calculates the diameter of the tree passing through the root, not the height.
**A7:** I will use In-Order traversal. In-Order traversal visits nodes in sorted order but does not naturally track depth or height.
**A8:** I will return `node.value`. The height is a structural property, not related to the node's value.
**A9:** I will subtract min depth from max depth. This calculation is incorrect for finding the height, which is simply the maximum depth.
**A10:** I will use a Stack and return stack size. The stack size only reflects the current path depth, not the maximum depth across the entire tree.
**A11:** I will count how many nulls there are. This count is related to the number of nodes but does not directly give the height.
**A12:** I will traverse and increment height for every node. This fails to correctly track the maximum height across different branches.
**A13:** I will check if the tree is AVL. AVL property (balance factor) is related to height but is not the algorithm for calculating the height itself.
**A14:** I will use a fast pointer and slow pointer. This technique is used for linked lists or cycle detection, not for calculating tree height.
**A15:** I will use `1 + min(left, right)`. This calculates the minimum depth, not the maximum depth (height).

**Correct:** A1, A2, A3

**Exp:**
Height is the longest path from the root to a leaf. This requires finding the maximum depth among all paths. Both recursive DFS and iterative BFS are $O(N)$ time solutions. BFS is often preferred for finding depth iteratively as it naturally processes level by level.

---

### Q: Sketch an algorithm to **print** the values of a Binary Tree **level-by-level** (Breadth-First).

<!-- Q_ID: ch_viva_3_q19 -->

**Options:**
**A1:** I will use a **Queue**. Enqueue `root`. While Queue is not empty: `curr = queue.dequeue()`. Print `curr.data`. If `curr.left` exists, enqueue it. If `curr.right` exists, enqueue it. This is the standard BFS implementation.
**A2:** I implement a standard Breadth-First Search. I start a Queue with the root. In a loop, I process the node at the front of the queue by printing it and adding its children to the back of the queue. This preserves the level order.
**A3:** I use a Queue. To separate lines for each level, I track the `levelSize` at the start of each loop iteration. I dequeue `levelSize` nodes, printing them on one line, and enqueueing their children. Then I print a newline.
**A4:** I will use a Stack. A Stack implements LIFO, which results in a Depth-First Traversal (Pre-Order, In-Order, or Post-Order), not a Level-by-Level traversal.
**A5:** I will use In-Order traversal. In-Order traversal visits nodes in sorted order (Left, Root, Right), which does not correspond to level order.
**A6:** I will use an array indices `2i+1`. This assumes the tree is a complete binary tree represented in an array, which is not guaranteed.
**A7:** I will recurse left then recurse right. This describes a recursive DFS traversal, which is depth-first, not breadth-first.
**A8:** I will print the root, then `root.left`, then `root.right`. This only prints the first three nodes and misses the rest of the tree.
**A9:** I will use a Priority Queue. A Priority Queue orders elements by value, not by level or insertion order.
**A10:** I will use a Hash Map keyed by depth. This is a valid approach but requires a DFS traversal to calculate depth, making it less direct than BFS.
**A11:** I will iterate through the nodes. This is too vague and does not specify the mechanism (Queue or Stack) required for traversal.
**A12:** I will flatten the tree to a list. Flattening typically results in a Pre-Order or In-Order sequence, not a level-order sequence.
**A13:** I will print as I delete nodes. This modifies the tree structure, which is generally undesirable.
**A14:** I will use binary search. Binary search is for finding elements, not for traversing the entire structure.
**A15:** I will queue the root, then dequeue it, then stop. This only processes the root node.

**Correct:** A1, A2, A3

**Exp:**
Breadth-First Search (BFS) naturally processes nodes level by level, making it the required traversal for this task. A Queue is the necessary auxiliary data structure to manage the FIFO order of nodes. Time complexity is $O(N)$.

---

### Q: Sketch an algorithm to check if an **Array** of integers is a **palindrome** (reads same forwards and backwards).

<!-- Q_ID: ch_viva_3_q20 -->

**Options:**
**A1:** I initialize two pointers: `start = 0` and `end = length-1`. I loop while `start < end`. If `array[start] \ne array[end]`, return False. Else, increment `start`, decrement `end`. If loop finishes, return True.
**A2:** I iterate from the outside in. I compare the element at index `i` with the element at `len-1-i`. I only need to iterate up to `len/2`. Any mismatch found causes an immediate return of False.
**A3:** I use a Two-Pointer approach. One pointer at the head, one at the tail. I check for equality and move them towards the center. This is $O(N)$ time and $O(1)$ space, making it the most efficient solution.
**A4:** I will use two loops. A nested loop structure is typically used for $O(N^2)$ comparisons, which is highly inefficient for palindrome checking.
**A5:** I will reverse the array and compare `A == B`. Reversing the array requires $O(N)$ time and $O(N)$ space for the copy, making it less space-efficient than the two-pointer method.
**A6:** I will use a Stack to reverse it. I push the first half onto the stack, then compare the popped elements with the second half of the array. This uses $O(N)$ space.
**A7:** I will check if `array[i] == array[i+1]`. This only checks adjacent elements and is irrelevant to the palindrome property.
**A8:** I will loop from 0 to N and check `array[i] == array[N-i]`. This performs redundant checks and may access elements out of bounds if not carefully implemented.
**A9:** I will hash the array. Hashing is used for integrity checks, but it does not verify the structural property of being a palindrome.
**A10:** I will split the array in half and swap halves. Swapping halves is not the correct operation for checking if the original array is a palindrome.
**A11:** I will use recursion without pointers. This is possible but often less intuitive and may consume more stack space than the iterative pointer method.
**A12:** I will use a Queue. A Queue (FIFO) is not suitable for comparing elements from opposite ends simultaneously.
**A13:** I will check the first and last elements. This is insufficient as it ignores all internal elements.
**A14:** I will loop until `start == end`. This is correct for odd-length arrays but needs to stop when `start < end` for even-length arrays.
**A15:** I will return true if `length \% 2 == 0`. The length parity is irrelevant to the content being a palindrome.

**Correct:** A1, A2, A3

**Exp:**
The most efficient way to check for array symmetry is the Two-Pointer method, which runs in $O(N)$ time and $O(1)$ space. Pointers start at opposite ends and move inward, comparing elements at each step.

---

## Advanced List and Tree Operations (Q21-Q25)

<!-- CH_ID: ch_viva_4 -->

---

### Q: Sketch an algorithm to **remove duplicates** from an **Unsorted Singly Linked List**.

<!-- Q_ID: ch_viva_4_q21 -->

**Options:**
**A1:** I will use a **Hash Set** to store seen values. I traverse the list with `prev` and `curr` pointers. If `curr.value` is in the Set, I delete it by setting `prev.next = curr.next`. If not, I add it to the Set and move `prev` forward. `curr` moves forward every step.
**A2:** I initialize an empty Set. I iterate through the Linked List. For each node, I check membership in the Set. If it's a duplicate, I perform a standard deletion by relinking the previous node to the next node. Otherwise, I register the value in the Set. This is an $O(N)$ time solution.
**A3:** I maintain a `previous` pointer. As I scan the list, I query a Hash Set. If the current value is new, I add it and update `previous`. If it's a repeat, I skip the current node using `previous.next`, effectively removing it in $O(1)$ time per node.
**A4:** I will check if `curr.value == curr.next.value` during traversal. If they match, I delete `curr.next`. This approach only removes adjacent duplicates and fails for non-adjacent duplicates in an unsorted list.
**A5:** I will use two loops to compare every node. The outer loop iterates through the list, and the inner loop checks the rest of the list for duplicates. This is an $O(N^2)$ time solution.
**A6:** I will delete the node by setting `curr = null`. This only removes the local reference to the node and fails to relink the list structure.
**A7:** I will sort the list first. Sorting a linked list takes $O(N \log N)$ time, and then duplicates can be removed in $O(N)$ time, making the overall solution slower than the hash set approach.
**A8:** I will use an array to count frequencies. This is only feasible if the range of integer values is small and known, otherwise it requires excessive space.
**A9:** I will traverse backwards to find duplicates. Traversing backwards in a Singly Linked List is not possible without $O(N^2)$ time or $O(N)$ space.
**A10:** I will use a Stack to track numbers. A stack is not suitable for checking arbitrary membership in $O(1)$ time.
**A11:** I will skip the node using `curr = curr.next`. This advances the current pointer but fails to perform the necessary relinking for deletion.
**A12:** I will use recursion to delete. While possible, the recursive solution still requires an auxiliary structure (like a Hash Set) to maintain $O(N)$ time complexity.
**A13:** I will use a Queue. A queue is not suitable for checking arbitrary membership in $O(1)$ time.
**A14:** I will compare the head with the tail. This only checks two nodes and is insufficient for finding all duplicates.
**A15:** I will create a new list and add _all_ nodes. This does not remove duplicates and uses $O(N)$ auxiliary space.

**Correct:** A1, A2, A3

**Exp:**
Since the list is unsorted, the only way to achieve $O(N)$ time complexity is by using a Hash Set to track seen values. The deletion process requires careful management of the `prev` pointer to correctly bypass the duplicate node.

---

### Q: Sketch an algorithm to find the **In-Order Successor** of a given node `N` in a **Binary Search Tree**.

<!-- Q_ID: ch_viva_4_q22 -->

**Options:**
**A1:** Case 1: If `N` has a right child, I go to the right child, then traverse strictly **left** until I hit null. That node is the successor. Case 2: If `N` has no right child, I start from the **root** and traverse down. I keep a variable `successor`. If `root.val > N.val`, I update `successor = root` and go left. If `root.val < N.val`, I go right. Return `successor`.
**A2:** I check for a right subtree. If present, the minimum value in that subtree is the answer. If not, I utilize the property that the successor is the lowest ancestor for which the given node falls in the left subtree. This is an $O(H)$ time operation.
**A3:** If right child exists: `goRight()`, then `goLeftUntilNull()`. If not: Walk down from root. Every time I go _left_, I save the current node as a potential candidate. The last saved candidate is the successor, as it is the first ancestor greater than N.
**A4:** The successor is simply the node located at `node.right`. This is incorrect because the successor must be the minimum element within the right subtree, not necessarily the root of the right subtree.
**A5:** The successor is `node.left`. This is incorrect; the left child is always smaller than the current node in a BST.
**A6:** I will just look at the parent. The parent is the successor only if the node is the parent's left child and the node has no right subtree.
**A7:** I will search for `node.value + 1`. This assumes integer values are consecutive and ignores the actual structure of the tree.
**A8:** I will traverse the whole tree and sort it. This is an inefficient $O(N)$ solution when an $O(H)$ solution is possible by exploiting the BST property.
**A9:** I will use Level-Order traversal. BFS does not visit nodes in sorted order and is not suitable for finding the successor.
**A10:** I will return the root. The root is the successor only if it is the smallest element greater than N, which is unlikely.
**A11:** If it has no right child, it has no successor. This is incorrect; the successor is the lowest ancestor that is greater than N.
**A12:** I will check the left child of the right child. This is only correct if the right child has no left subtree.
**A13:** I will use recursion to find the max value. Finding the maximum value is the opposite of finding the successor.
**A14:** I will compare with `root` and go down. This is the correct approach for the ancestor case, but the full algorithm must also handle the right subtree case.
**A15:** I will use a Stack. An iterative approach using a stack is possible but more complex than the recursive or iterative $O(H)$ pointer approach.

**Correct:** A1, A2, A3

**Exp:**
The In-Order Successor is the next largest value. If a right subtree exists, the successor is the minimum element in that subtree. If no right subtree exists, the successor is the lowest ancestor for which the given node falls in the left subtree. This is an $O(H)$ operation, where $H$ is the height of the tree.

---

### Q: Sketch the algorithm for **deleting the root** (Extract-Max) from a **Max-Heap** implemented as an array.

<!-- Q_ID: ch_viva_4_q23 -->

**Options:**
**A1:** First, I save the value at `array[0]` to return later. Then, I take the **last** element in the array (`array[size-1]`) and move it to `array[0]`. I decrement the size. Finally, I perform **'Bubble Down'**: compare the new root with its children, swap with the larger child, and repeat until the heap property is restored.
**A2:** I replace the root with the last leaf node to maintain the 'Complete Tree' structure. Then, I check the new root against its children. If a child is larger, I swap. I continue this process down the tree until the node dominates its children or becomes a leaf. This is an $O(\log N)$ operation.
**A3:** I overwrite the root with the tail element. Then I 'sink' this element. I calculate indices of Left (`2i+1`) and Right (`2i+2`) children. I swap with the max of the two children if the parent is smaller. Repeat recursively.
**A4:** I remove the root and move the second element to the top. This is incorrect because the second element is not guaranteed to be the largest remaining element, violating the heap property.
**A5:** I remove the root and shift the array left by 1. Shifting the array left breaks the heap's structural property (complete binary tree) and is an $O(N)$ operation.
**A6:** I swap the root with the left child. This is insufficient; the new root must be compared against both children to ensure the largest child is swapped up.
**A7:** I delete the last element. Deleting the last element is $O(1)$ but does not remove the maximum element (the root).
**A8:** I search for the max element. The maximum element is always at the root, so searching is unnecessary.
**A9:** I sort the array. Sorting is an $O(N \log N)$ operation, which is much slower than the $O(\log N)$ extraction time.
**A10:** I swap root with a random leaf. Swapping with a random leaf violates the heap property and requires a full heapify operation.
**A11:** I recursively delete children. Deleting children does not remove the root and destroys the heap structure.
**A12:** I bubble up the root. Bubbling up is used for insertion (inserting a new element at the end), not for deletion from the root.
**A13:** I insert the new root at the correct spot. The new root is placed at index 0, and then it must be sunk, not inserted.
**A14:** I use a second heap. Using a second heap is unnecessary and adds complexity and space overhead.
**A15:** I return the root and do nothing else. This leaves the heap structure broken, as the root position is empty.

**Correct:** A1, A2, A3

**Exp:**
Extracting the root of a heap is an $O(\log N)$ operation. It involves three steps: 1) Save the root value, 2) Replace the root with the last element (to maintain the complete tree property), and 3) Restore the heap property by 'bubbling down' (or sinking) the new root.

---

### Q: Sketch an algorithm to **sort** a **Stack** using only recursion (and the stack itself, no auxiliary data structures like arrays).

<!-- Q_ID: ch_viva_4_q24 -->

**Options:**
**A1:** I define `sort(stack)`: If not empty, `pop` element `x`, recursively call `sort(stack)`, then call `sortedInsert(stack, x)`. I define `sortedInsert(stack, x)`: If stack empty or `top < x`, push `x`. Else, `pop` `temp`, recurse `sortedInsert(stack, x)`, then push `temp` back.
**A2:** I rely on the Call Stack. I strip the stack naked recursively holding values in the function frames. As the recursion unwinds, I re-insert each value into the stack, but I use a helper function to ensure each value is placed deeply enough to maintain order.
**A3:** I use recursion to hold all values. Base case: Stack empty. Recursive step: Pop item, Sort remaining stack. Then, insert the popped item into the sorted stack at its correct position (which requires a second recursive lookup). This results in $O(N^2)$ time complexity.
**A4:** I will use an array, sort it, and push back. This violates the constraint of using only recursion and the stack itself.
**A5:** I will use Bubble Sort on the stack. Implementing Bubble Sort on a stack requires $O(N^2)$ time and is complex due to limited access to internal elements.
**A6:** I will pop everything, find the min, and push it. Finding the minimum requires $O(N)$ time, and repeating this $N$ times results in $O(N^2)$ complexity.
**A7:** I will use a second stack. This violates the constraint of using only the stack itself and recursion.
**A8:** I will swap the top two elements until sorted. This is an incomplete sorting algorithm and only works for very small or nearly sorted stacks.
**A9:** I will use a Priority Queue. This violates the constraint of using only recursion and the stack itself.
**A10:** I will assume the stack is sorted. This is an invalid assumption for a general sorting algorithm.
**A11:** I will pop elements and push them in sorted order. Since the stack is LIFO, popping elements results in reversed order, not sorted order.
**A12:** I will use QuickSort. Implementing QuickSort efficiently on a stack is highly complex due to the lack of random access.
**A13:** I will reverse the stack. Reversing the stack is not the same as sorting it by value.
**A14:** I will use `Stack.sort()`. This relies on a built-in function and does not describe the underlying recursive algorithm.
**A15:** I will print them in sorted order. The requirement is to sort the data structure, not just print the values.

**Correct:** A1, A2, A3

**Exp:**
This is a classic recursive sorting problem. It requires two mutually recursive functions: one to empty the stack (`sort`) and one to insert the popped element back into the now-sorted stack while maintaining order (`sortedInsert`). The time complexity is $O(N^2)$ because `sortedInsert` can take $O(N)$ time, and it is called $N$ times.

---

### Q: You are given an array containing $N-1$ distinct numbers taken from the range $1$ to $N$. Sketch an algorithm to find the **missing number**.

<!-- Q_ID: ch_viva_4_q25 -->

**Options:**
**A1:** I calculate the **Expected Sum** of integers 1 to N using the formula $N(N+1)/2$. Then, I iterate through the array to calculate the **Actual Sum**. The difference `Expected - Actual` is the missing number.
**A2:** I initialize `sum = 0$. I loop through the array adding values to `sum`. I also compute the mathematical sum of the range 1 to N. Subtracting my calculated array sum from the mathematical sum reveals the missing value in $O(N)$ time and $O(1)$ space.
**A3:** Alternatively, I can use **XOR**. I XOR all numbers from 1 to N. Then I XOR that result with all elements in the array. The property $A \oplus A = 0$ means all duplicates cancel out, leaving only the missing number.
**A4:** I will sort the array using an $O(N \log N)$ algorithm and check for gaps where `array[i+1] \ne array[i] + 1`. This is a valid but sub-optimal solution.
**A5:** I will use a boolean array of size N. I iterate through the input array and mark the corresponding index in the boolean array as true. Then I scan the boolean array for the false entry.
**A6:** I will check if 1 exists, then 2, then 3... This requires $O(N)$ search time for each number, leading to an inefficient $O(N^2)$ total complexity.
**A7:** I will look for the number that isn't there. This is too vague and does not describe a concrete algorithm.
**A8:** I will traverse and see which index is empty. This assumes the input array is sorted and indexed from 1 to N, which is not guaranteed.
**A9:** I will use a Hash Map. I insert all elements into the map, and then iterate from 1 to N, checking which number is missing from the map. This uses $O(N)$ space.
**A10:** I will use Binary Search. Binary search is only applicable if the array is sorted, and even then, finding the missing element requires careful modification of the search logic.
**A11:** I will check if the last number is N. This only works if the missing number is N itself, and the array is sorted.
**A12:** I will add 1 to every element. This operation is irrelevant to finding the missing number.
**A13:** I will subtract the first from the last. This only gives the range difference, not the missing number.
**A14:** I will assume the array is `[1, 2, 3...]`. This is an invalid assumption, as the array is unsorted.
**A15:** I will check for duplicates. The problem statement guarantees distinct numbers, so checking for duplicates is unnecessary.

**Correct:** A1, A2, A3

**Exp:**
The most efficient solution is to use the mathematical property of summation (Gauss's formula) or the XOR property. Both methods achieve $O(N)$ time complexity and $O(1)$ space complexity, avoiding the overhead of sorting or auxiliary data structures.

---

## Graph, Circular List, and Array Manipulation (Q26-Q30)

<!-- CH_ID: ch_viva_5 -->

---

### Q: Sketch an algorithm to determine if there is a **valid path** from Vertex A to Vertex B in a **Directed Graph**.

<!-- Q_ID: ch_viva_5_q26 -->

**Options:**
**A1:** I will use **BFS** (Queue) or **DFS** (Stack). I initialize a `Visited` set. Enqueue `A` and mark it visited. While queue not empty: Dequeue `curr`. If `curr == B`, return True. Else, for each neighbor of `curr`, if not visited, Enqueue and mark visited. If queue empties, return False.
**A2:** I maintain a Set of visited vertices to prevent cycles. Starting at A, I perform a traversal. If I encounter B during the traversal, I immediately return True. If the traversal finishes without seeing B, I return False. This is an $O(V+E)$ solution.
**A3:** I employ a standard Graph Traversal. I start at the Source. I explore all adjacent neighbors recursively (DFS). I flag every node I enter. If I step onto the Destination node, I propagate a 'True' signal back up the chain.
**A4:** I will iterate the adjacency matrix rows. This assumes the graph is represented by a matrix, and iterating rows only checks direct connections, not paths.
**A5:** I will check if A is connected to B directly. This only checks for a path of length 1 and ignores longer paths.
**A6:** I will use DFS without a visited set. This is dangerous in a general graph because cycles will cause the algorithm to run indefinitely.
**A7:** I will calculate the shortest path. Calculating the shortest path is a more complex task than simply checking for path existence.
**A8:** I will reverse the graph. Reversing the graph is used for checking strong connectivity, not simple path existence.
**A9:** I will check if they are in the same component. This is only sufficient for undirected graphs; in a directed graph, reachability is asymmetric.
**A10:** I will assume it is a tree. Assuming the graph is a tree is invalid, as general directed graphs can contain cycles.
**A11:** I will check if `A.next == B`. This uses linked list terminology and is not applicable to a graph structure.
**A12:** I will sort the edges. Sorting edges is irrelevant to path finding.
**A13:** I will use recursion with a base case. This describes DFS, which is a valid approach, but the full algorithm must include the visited set.
**A14:** I will use Union-Find. Union-Find is used for connectivity in undirected graphs or MSTs, not for directed path finding.
**A15:** I will check the degree of the nodes. Node degrees are insufficient to determine path existence.

**Correct:** A1, A2, A3

**Exp:**
Path existence (reachability) is solved using standard graph traversal algorithms, BFS or DFS. The critical component is the `Visited` set to prevent infinite loops in the presence of cycles. Time complexity is $O(V+E)$.

---

### Q: Sketch an algorithm to convert a **Doubly Linked List** into a **Circular Doubly Linked List**.

<!-- Q_ID: ch_viva_5_q27 -->

**Options:**
**A1:** I take the `head` and `tail` pointers. I set `tail.next = head` (closing the forward loop). I set `head.prev = tail` (closing the backward loop). I return the `head`. Complexity $O(1)$.
**A2:** I eliminate the null terminations. The last node's 'Next' pointer is updated to point to the first node. The first node's 'Previous' pointer is updated to point to the last node. This creates a bidirectional ring.
**A3:** I verify the list is not empty. If not, I bridge the gap: Link Tail to Head, Link Head to Tail. This requires access to both the head and tail pointers, making it an $O(1)$ operation.
**A4:** I will set `tail.next = head`. This only creates a circular Singly Linked List; the backward link from head to tail is missing.
**A5:** I will set `head.prev = tail`. This only creates the backward link from head to tail; the forward link from tail to head is missing.
**A6:** I will create a new circular list and copy nodes. This is unnecessary; the conversion can be done in-place in $O(1)$ time.
**A7:** I will use a loop to connect them. A loop is unnecessary since only the head and tail pointers need to be updated.
**A8:** I will traverse to find the middle. Finding the middle is irrelevant to making the list circular.
**A9:** I will set `head = tail`. This loses the reference to the original head and breaks the list structure.
**A10:** I will delete the null pointers. This is too vague and does not describe the necessary pointer updates.
**A11:** I will swap head and tail. Swapping pointers does not create the circular links.
**A12:** I will use a sentinel node. A sentinel node is used to simplify edge cases but is not required for the conversion itself.
**A13:** I will assume it's already circular. This is an invalid assumption.
**A14:** I will set `node.next = node`. This creates a self-loop on a single node, not a circular list.
**A15:** I will use recursion. Recursion is unnecessary for this $O(1)$ pointer manipulation task.

**Correct:** A1, A2, A3

**Exp:**
Converting a Doubly Linked List to a Circular Doubly Linked List is an $O(1)$ operation. It requires two pointer updates: the tail's `next` must point to the head, and the head's `prev` must point to the tail.

---

### Q: Sketch an algorithm to **count the number of nodes** in a **Circular Linked List**.

<!-- Q_ID: ch_viva_5_q28 -->

**Options:**
**A1:** I handle the empty case (return 0). Else, I initialize `count = 1` and `curr = head.next`. I loop while `curr \ne head`. Inside, `count++` and `curr = curr.next`. Return `count`.
**A2:** I mark the starting point (`head`). I traverse the list, incrementing a counter for each step. I stop the traversal exactly when my pointer lands back on the `head` reference. This is an $O(N)$ time solution.
**A3:** I initialize `temp = head`. Do-While loop: move `temp` forward, increment count. Condition: `while temp \ne head`. This ensures I count the list exactly once, even for a list with a single node.
**A4:** I loop until `curr == null`. This is incorrect because a circular list never has a null termination.
**A5:** I loop until `curr.next == null`. This is incorrect for the same reason; the last node points back to the head.
**A6:** I count for 100 iterations. This is unreliable as the list size is unknown and may be greater or less than 100.
**A7:** I use a Hash Set to count unique nodes. While this works, it uses $O(N)$ space, which is unnecessary compared to the $O(1)$ space traversal method.
**A8:** I start at head and loop. `count++`. This will result in an infinite loop because there is no termination condition.
**A9:** I check if `head == tail`. This only checks if the list has one node, not the total count.
**A10:** I use recursion. Recursion is possible but less efficient than the iterative approach due to stack overhead.
**A11:** I break the circle then count. Breaking the circle modifies the list structure, which is generally undesirable.
**A12:** I return `list.size`. This relies on a built-in property and does not describe the underlying algorithm.
**A13:** I use two pointers. Two pointers are typically used for cycle detection or finding the middle, not for simple counting.
**A14:** I assume size is stored in head. This is an invalid assumption; the size must be calculated by traversal.
**A15:** I count until `curr.value` repeats. This fails if the list contains duplicate values.

**Correct:** A1, A2, A3

**Exp:**
Since a circular list has no null termination, the traversal must stop when the pointer returns to the starting node (`head`). The `do-while` loop is often the most elegant way to ensure the loop executes at least once for a non-empty list. Time complexity is $O(N)$.

---

### Q: Sketch an algorithm to **reverse a string** using a **Stack**.

<!-- Q_ID: ch_viva_5_q29 -->

**Options:**
**A1:** I create an empty Stack. I iterate over the string, pushing each **character** onto the Stack. Then, I create a StringBuilder (or char array). While Stack is not empty, I `pop` the character and append it to the builder. Return the built string.
**A2:** I exploit the LIFO property. First pass: read string left-to-right, pushing characters. Second pass: pop characters (which come out right-to-left) and construct the new string. This is an $O(N)$ time and $O(N)$ space solution.
**A3:** I transfer the string data into a Stack. Since the last character entered is the first one retrieved, simply emptying the Stack into a new buffer produces the reversed string. This demonstrates the LIFO principle for reversal.
**A4:** I push the string, then pop the string. This operation pushes the entire string object as a single element, not the individual characters.
**A5:** I use a Queue. A Queue (FIFO) preserves the order and is therefore unsuitable for reversal.
**A6:** I swap the first and last characters. This is an incomplete reversal algorithm and only swaps two characters.
**A7:** I use recursion. While recursion can reverse a string, the stack data structure is explicitly required by the problem statement.
**A8:** I push half the string. This only reverses the first half and leaves the second half untouched.
**A9:** I use an array. Using an array and two pointers is a valid $O(N)$ solution but does not use a Stack as required.
**A10:** I traverse backwards. Traversing backwards and appending to a new string is a valid $O(N)$ solution but does not use a Stack.
**A11:** I push chars, then peek. Peeking does not remove the element, so the stack would never empty.
**A12:** I push words, not chars. This reverses the order of words, not the order of characters within the string.
**A13:** I use `string.reverse()`. This relies on a built-in function and does not demonstrate the underlying stack logic.
**A14:** I pop before pushing. This would result in an empty stack or an error if the stack is initially empty.
**A15:** I use two stacks. A single stack is sufficient for string reversal, making the second stack redundant.

**Correct:** A1, A2, A3

**Exp:**
The LIFO property of a Stack is perfectly suited for reversal. By pushing characters in order and popping them out, the order is naturally inverted. This is an $O(N)$ time and $O(N)$ space operation.

---

### Q: Sketch an algorithm to find the **minimum element** in a **Sorted Array that has been Rotated** (e.g., `[4, 5, 1, 2, 3]`).

<!-- Q_ID: ch_viva_5_q30 -->

**Options:**
**A1:** I use **Binary Search**. `Lo=0`, `Hi=len-1`. Loop while `Lo < Hi`. `Mid = (Lo+Hi)/2`. If `arr[mid] > arr[Hi]`, the min is in the **right** half (`Lo = Mid + 1`). Else, min is in **left** half or is mid (`Hi = Mid`). Return `arr[Lo]`.
**A2:** I perform a logarithmic search. I compare the middle element to the right-most element. If the middle is larger, the 'reset point' (minimum) must be to the right. Otherwise, it's to the left. I narrow the range until one element remains.
**A3:** I detect the inflection point using Binary Search. The inflection point is the only place where `Element(i) > Element(i+1)`. I adjust my bounds to hone in on this drop, achieving $O(\log N)$ time complexity.
**A4:** I will iterate and find the min. This is a valid $O(N)$ solution but is sub-optimal compared to the $O(\log N)$ binary search approach.
**A5:** I will sort the array. Sorting the array takes $O(N \log N)$ time, which is much slower than the $O(\log N)$ search time.
**A6:** I will use standard Binary Search looking for 0. This assumes the minimum value is 0, which is not guaranteed.
**A7:** I will check if `arr[0] < arr[last]`. If true, the array is not rotated, and `arr[0]` is the minimum. This only handles the non-rotated case efficiently.
**A8:** I will split the array in half and check mins recursively. This describes a recursive search, but the key is the comparison logic to discard half the search space.
**A9:** I will use a Hash Set. Using a Hash Set is irrelevant to finding the minimum element.
**A10:** I will compare `mid` with `left`. Comparing `arr[mid]` with `arr[Lo]` is also a valid comparison strategy in binary search for rotated arrays.
**A11:** I will stop when `mid == target`. We are searching for the minimum value, not a specific target value.
**A12:** I will use a Stack. A stack is not suitable for efficient searching in an array.
**A13:** I will swap elements back to sorted. This modifies the array and is not the goal of finding the minimum element.
**A14:** I will return `arr[0]`. This is only correct if the array is not rotated.
**A15:** I will check neighbors of mid only. Checking only neighbors is insufficient to guarantee finding the global minimum.

**Correct:** A1, A2, A3

**Exp:**
Since the array is partially sorted, we can use a modified Binary Search to find the minimum element in $O(\log N)$ time. The key is comparing the middle element with the rightmost element to determine which half contains the 'dip' (the minimum).

---

## Tree Structure and Serialization (Q31-Q35)

<!-- CH_ID: ch_viva_6 -->

---

### Q: Sketch an algorithm to **invert** (mirror) a **Binary Tree**.

<!-- Q_ID: ch_viva_6_q31 -->

**Options:**
**A1:** I use **Recursion**. Base case: if node is null, return. Recursive step: `invert(node.left)`, `invert(node.right)`. Then, perform the swap: `temp = node.left`, `node.left = node.right`, `node.right = temp`.
**A2:** I use **Iterative BFS** (Queue). Enqueue root. While queue not empty: Dequeue node. Swap its left and right pointers. If left exists, enqueue it. If right exists, enqueue it. Return root. This is an $O(N)$ solution.
**A3:** I perform a recursive Post-Order traversal. I visit the left child, then the right child. Once the recursion returns, I swap the left and right pointers of the current node. This propagates the inversion from bottom to top.
**A4:** I will swap the root's left and right children pointers. This only inverts the first level of the tree and leaves all subsequent subtrees in their original orientation, failing the full inversion requirement.
**A5:** I will traverse In-Order and swap. In-Order traversal does not guarantee that both children have been processed before the parent, which is necessary for a correct swap.
**A6:** I will swap nodes with same values. This is irrelevant to the structural inversion of the tree.
**A7:** I will create a new tree and insert nodes in reverse order. This is not an in-place operation and requires $O(N)$ auxiliary space.
**A8:** I will use a Stack to reverse the node values. Inversion requires swapping pointers, not just values.
**A9:** I will rotate the tree left. Rotation is a specific operation used in balanced BSTs and is not equivalent to inversion.
**A10:** I will sort the tree descending. Sorting changes the tree structure to a BST, which is not the goal of inversion.
**A11:** I will swap leaf nodes only. This is insufficient; all internal nodes must also have their children swapped.
**A12:** I will change the pointers to point up. This would convert the tree structure into a linked list or graph with parent pointers.
**A13:** I will mirror the array representation. This assumes the tree is a complete binary tree represented by an array, which is not guaranteed.
**A14:** I will swap left.left with right.right. This only swaps grandchildren and ignores the rest of the tree.
**A15:** I will use binary search. Binary search is irrelevant to tree inversion.

**Correct:** A1, A2, A3

**Exp:**
Inverting a tree requires swapping the left and right children of _every_ node. This can be achieved recursively (DFS) or iteratively (BFS). The time complexity is $O(N)$ as every node is visited exactly once.

---

### Q: Sketch an algorithm to **serialize** a Binary Tree into a **String**.

<!-- Q_ID: ch_viva_6_q32 -->

**Options:**
**A1:** I use **Pre-Order Traversal** (DFS). If node is null, append `#` to string. Else, append `node.val` + `,`. Then recurse left, then recurse right. The string captures the structure uniquely.
**A2:** I use **Level-Order Traversal** (Queue). I enqueue the root. When I dequeue a node, if it is null, I append `null`. If it is real, I append its value and enqueue its children (even if they are null). This creates an array-like representation.
**A3:** I build a string recursively. I define the structure as `Root(Left,Right)`. If a child is missing, I write `()`. This recursive bracket notation preserves the hierarchy and allows for unique deserialization.
**A4:** I will perform an In-Order traversal and store the values in a list. This sequence alone is insufficient to reconstruct the tree structure uniquely, especially for non-BSTs, as it loses structural information.
**A5:** I will save just the values in a list. Saving only the values without null markers or structural indicators makes deserialization impossible.
**A6:** I will save root, then leaves. This skips all internal nodes and is insufficient to capture the full structure.
**A7:** I will use a Hash Map. A Hash Map is not a sequential format suitable for string serialization.
**A8:** I will save the height and width. Height and width are insufficient to uniquely define the tree structure.
**A9:** I will convert it to a Heap array. This assumes the tree is a complete binary tree and loses information if it is not.
**A10:** I will save `node.value` string. This is too vague and does not specify the traversal order or null handling.
**A11:** I will ignore null nodes. Ignoring null nodes makes it impossible to distinguish between different tree shapes (e.g., left-heavy vs. right-heavy).
**A12:** I will use BFS but skip nulls. Skipping nulls during BFS also results in an ambiguous serialization string.
**A13:** I will save parent pointers. Parent pointers are not part of the standard binary tree structure and complicate serialization.
**A14:** I will print the tree. Printing the tree does not necessarily create a format suitable for deserialization.
**A15:** I will sort the values. Sorting the values loses the structural information entirely.

**Correct:** A1, A2, A3

**Exp:**
Serialization requires capturing the tree's structure uniquely so it can be reconstructed. This necessitates recording null pointers. Pre-Order (DFS) and Level-Order (BFS) are the standard methods, both running in $O(N)$ time.

---

### Q: Sketch an algorithm to move all **zeros** in an integer array to the **end**, while maintaining the relative order of non-zero elements.

<!-- Q_ID: ch_viva_6_q33 -->

**Options:**
**A1:** I use a **`writeIndex`** initialized to 0. I loop through the array. If `array[i] \ne 0`, I set `array[writeIndex] = array[i]` and increment `writeIndex`. After the loop, I fill indices from `writeIndex` to end with `0`.
**A2:** I maintain a pointer for the 'Last Non-Zero Found'. I iterate through the array. When I find a non-zero, I swap it with the element at the 'Last Non-Zero' pointer and advance that pointer. This bubbles non-zeros to the front and zeros to the back.
**A3:** I treat the array as a queue. I iterate through. If I see a non-zero, I move it to the first available 'slot' (tracked by a counter). I don't care what happens to the zeros initially. Finally, I overwrite the remaining tail slots with 0. This is an $O(N)$ time, $O(1)$ space solution.
**A4:** I will use a standard sorting algorithm on the array. While this moves zeros to the end, it destroys the required relative order of the non-zero elements, violating the problem constraint.
**A5:** I will create a new array, copy non-zeros, then fill zeros. This maintains order but uses $O(N)$ auxiliary space, which is less optimal than the in-place solution.
**A6:** I will loop and swap zeros with the last element. This moves zeros to the end but does not maintain the relative order of the non-zero elements.
**A7:** I will delete zeros. Deleting elements from an array requires shifting the remaining elements, which is an $O(N^2)$ operation overall.
**A8:** I will use a Stack for non-zeros. I push non-zeros onto the stack, then pop them back into the array. This reverses the order of the non-zero elements.
**A9:** I will use Bubble Sort logic. Bubble Sort is an $O(N^2)$ algorithm, which is inefficient for this $O(N)$ problem.
**A10:** I will search for 0 and shift the whole array left. Shifting the array left for every zero found results in an $O(N^2)$ complexity.
**A11:** I will use two pointers at start and end. This approach typically results in loss of relative order when swapping elements.
**A12:** I will use recursion. Recursion is overly complex for this linear array manipulation task.
**A13:** I will replace zeros with -1. This changes the values of the elements and does not move them to the end.
**A14:** I will rotate the array. Rotation moves elements but does not guarantee that all zeros end up at the tail.
**A15:** I will count zeros and restart the array. This is essentially the same as Option 5, requiring two passes and $O(N)$ space.

**Correct:** A1, A2, A3

**Exp:**
The requirement to maintain the relative order of non-zero elements necessitates an $O(N)$ time, $O(1)$ space in-place solution. The 'write index' or 'snowball' method achieves this by effectively overwriting the array with non-zeros first, then filling the remaining space with zeros.

---

### Q: Sketch an algorithm to check if two Strings are **valid anagrams** of each other.

<!-- Q_ID: ch_viva_6_q34 -->

**Options:**
**A1:** I use a **Frequency Map** (or integer array size 26). I iterate String A, incrementing counts for each char. I iterate String B, decrementing counts. Finally, I check if all counts are zero. If yes, True.
**A2:** I create two Hash Maps. I populate them with character frequencies from String A and String B respectively. I then compare if `MapA.equals(MapB)`. Return the result. This is an $O(N)$ time solution.
**A3:** I verify lengths match. Then I sort both strings alphabetically. I iterate through the sorted arrays comparing index `i`. If any mismatch found, return False. Else True. This is an $O(N \log N)$ solution.
**A4:** I will sort both strings and compare. This is a valid approach, but the sorting step makes it slower than the linear time frequency counting method.
**A5:** I will check if they have the same length. This is a necessary but insufficient condition for being an anagram.
**A6:** I will check if they contain the same characters. This is insufficient, as it fails to check the _frequency_ of each character.
**A7:** I will calculate the sum of the ASCII values for all characters in String A and compare it to the sum for String B. This is insufficient because different character combinations can yield the same sum.
**A8:** I will multiply the ASCII values. Similar to summation, multiplication is susceptible to collisions and does not uniquely identify anagrams.
**A9:** I will use a Set. A Set only stores unique characters and therefore cannot track the required frequency counts.
**A10:** I will iterate nested loops. This results in an inefficient $O(N^2)$ time complexity for comparing character presence.
**A11:** I will reverse one string. Reversing a string checks for palindromes, not anagrams.
**A12:** I will remove chars from String B as I find them in String A. String removal is an $O(N)$ operation, leading to an overall $O(N^2)$ complexity.
**A13:** I will use recursion. Recursion is overly complex for this linear counting problem.
**A14:** I will check first and last chars. This is insufficient for checking the entire string content.
**A15:** I will use a Stack. A stack is not suitable for tracking character frequencies.

**Correct:** A1, A2, A3

**Exp:**
Anagrams are permutations, meaning they must have the exact same character counts. The most efficient method is using a frequency map/array ($O(N)$ time). Sorting is also valid but slower ($O(N \log N)$).

---

### Q: Sketch an algorithm to find the node where two **Singly Linked Lists intersect** (merge).

<!-- Q_ID: ch_viva_6_q35 -->

**Options:**
**A1:** I calculate the **length** of List A and List B. I calculate the difference `d`. I advance the pointer of the longer list by `d` steps. Now both pointers are equidistant from the end. I move both forward until `ptrA == ptrB`. Return that node.
**A2:** I traverse List A and insert all nodes (references) into a **Hash Set**. Then I traverse List B. The first node from B that already exists in the Set is the intersection point. This is an $O(N)$ time solution using $O(N)$ space.
**A3:** I use the **Two Pointer Switch** trick. Pointers `pA` and `pB`. Traverse. When `pA` reaches end, redirect it to Head B. When `pB` reaches end, redirect to Head A. They will meet at the intersection after 1 extra pass. This is an $O(N)$ time, $O(1)$ space solution.
**A4:** I will iterate both lists until values match. This is incorrect because two lists can have the same value at different non-intersecting nodes.
**A5:** I will use a hash map for values. Using values instead of node references fails if the lists contain duplicate values.
**A6:** I will check if tails are different. If the tails are different, they definitely do not intersect, but if they are the same, it only confirms intersection, not the point of intersection.
**A7:** I will iterate `i` and `j`. This is too vague and does not specify the necessary length adjustment or pointer switching logic.
**A8:** I will reverse both lists. Reversing the lists modifies the structure and is unnecessary for finding the intersection point.
**A9:** I will traverse one list, then the other. This is too vague and does not specify the necessary alignment logic.
**A10:** I will compare heads. Comparing heads only checks if the intersection occurs at the very first node.
**A11:** I will use a Stack. I push all nodes of both lists onto separate stacks and compare them from the top (tail) downwards. This uses $O(N)$ space.
**A12:** I will assume same length. This assumption is often false and would lead to incorrect results if the lists are misaligned.
**A13:** I will use recursion. Recursion is overly complex for this linear list problem.
**A14:** I will add lists values together. Adding values is irrelevant to finding the structural intersection point.
**A15:** I will use Tortoise and Hare. This technique is used for cycle detection within a single list, not for finding the intersection of two lists.

**Correct:** A1, A2, A3

**Exp:**
The intersection point is found by aligning the starting points of the two lists. The length difference method (Option 1) is $O(N)$ time and $O(1)$ space. The Hash Set method (Option 2) is $O(N)$ time but $O(N)$ space. The Two Pointer Switch (Option 3) is a clever $O(N)$ time, $O(1)$ space solution.

---

## Advanced Graph and Tree Properties (Q36-Q40)

<!-- CH_ID: ch_viva_7 -->

---

### Q: Sketch an algorithm to **Deep Clone** a Graph (given a starting node).

<!-- Q_ID: ch_viva_7_q36 -->

**Options:**
**A1:** I use **BFS** with a Queue and a **Hash Map** mapping `Original -> Clone`. Enqueue start. Create clone, put in Map. While queue not empty: Dequeue `u`. For each neighbor `v`: If `v` not in Map, clone it, map it, enqueue it. Link `Map[u].neighbors.add(Map[v])`.
**A2:** I use **DFS** (Recursion). Function `clone(node)`: If `node` is in Map, return `Map[node]`. Else, create `newNode`, add to Map. For each neighbor, `newNode.neighbors.add(clone(neighbor))`. Return `newNode`. The map prevents infinite recursion on cycles.
**A3:** I traverse the graph. I maintain a registry (Map) of copied nodes. for every node I encounter, I check the registry. If it exists, I use the existing copy. If not, I mint a fresh copy and register it before processing its edges. This ensures $O(V+E)$ time complexity.
**A4:** I will just return the reference to the start node. This results in a shallow copy, where modifications to the clone affect the original graph.
**A5:** I will iterate and create new nodes. This is insufficient; without a map to track visited nodes, cycles will cause infinite loops or duplicate cloning.
**A6:** I will use BFS but no map. Without a map, the algorithm cannot handle cycles and will enter an infinite loop.
**A7:** I will use recursion without visited set. Similar to BFS without a map, this will lead to infinite recursion if the graph contains cycles.
**A8:** I will copy the adjacency matrix. Copying the matrix only works if the graph is represented as a matrix, and it doesn't handle the node object cloning requirement.
**A9:** I will serialize and deserialize. This is a high-level approach that relies on external functions and does not sketch the underlying algorithm.
**A10:** I will create a new graph object. This is too vague and does not describe the process of copying nodes and edges.
**A11:** I will copy values only. Deep cloning requires copying the structure (pointers) as well as the values.
**A12:** I will use Dijkstra. Dijkstra's algorithm is for finding shortest paths, not for cloning the graph structure.
**A13:** I will assume it is a tree. If the graph is a general graph, this assumption is invalid, and the algorithm must handle cycles.
**A14:** I will clone neighbors first. The order of cloning (node before neighbors) is crucial to correctly link the new nodes.
**A15:** I will use an array. An array is not the primary data structure for representing a graph structure.

**Correct:** A1, A2, A3

**Exp:**
Deep cloning a graph requires two things: 1) Creating a new node for every original node, and 2) Using a Hash Map to link the original nodes to their clones. This map prevents infinite recursion/loops when cycles are encountered and ensures that shared nodes are only cloned once. Time complexity is $O(V+E)$.

---

### Q: Sketch an algorithm to find the **Lowest Common Ancestor (LCA)** of two nodes in a **Binary Search Tree**.

<!-- Q_ID: ch_viva_7_q37 -->

**Options:**
**A1:** Since it's a **BST**, I start at Root. I compare `p.val` and `q.val` with `root.val`. If both are smaller than root, I move `root = root.left`. If both are larger, `root = root.right`. If they split (one smaller, one larger) or one equals root, **this** root is the LCA. Return it.
**A2:** I use Iteration. `curr = root`. While `curr` is not null: if `p` and `q` are both > `curr`, go right. If both < `curr`, go left. Else, break and return `curr`. This works because the LCA is the split point.
**A3:** I use Recursion. If `root.val` > max(p, q), return `LCA(root.left)`. If `root.val` < min(p, q), return `LCA(root.right)`. Otherwise, we found the split point, return `root`. This is an $O(H)$ solution.
**A4:** I will search for both nodes. Searching for both nodes only confirms their existence and does not identify their lowest common ancestor.
**A5:** I will return the root. The root is the LCA only if the two nodes are in different subtrees of the root.
**A6:** I will use BFS. BFS is not suitable for finding the LCA efficiently because it does not exploit the BST ordering property.
**A7:** I will store paths to both nodes and compare. This is the standard $O(N)$ solution for a general Binary Tree, but the BST property allows for a faster $O(H)$ solution.
**A8:** I will use the parent pointers. If parent pointers are available, I can trace paths up to the root and find the intersection, which is an $O(H)$ solution.
**A9:** I will find the node with max value. Finding the maximum value is irrelevant to finding the LCA.
**A10:** I will check if `left == right`. This is incorrect; the LCA is the node where the paths diverge.
**A11:** I will use Dijkstra. Dijkstra's algorithm is for weighted graphs, not for finding structural relationships like LCA in a tree.
**A12:** I will calculate depth. Calculating depth is necessary for the general tree LCA solution but not for the optimized BST solution.
**A13:** I will use In-Order traversal. In-Order traversal does not help in finding the LCA efficiently.
**A14:** I will start from leaves and go up. This requires parent pointers, which are not guaranteed in a standard BST definition.
**A15:** I will check `root.left` and `root.right`. This is too limited and only checks the immediate children.

**Correct:** A1, A2, A3

**Exp:**
For a BST, the LCA is the first node encountered during traversal from the root where the two target nodes lie in different subtrees (one left, one right). This property allows for an efficient $O(H)$ time, $O(1)$ space solution, where $H$ is the height of the tree.

---

### Q: Sketch an algorithm to find the **Diameter** (longest path between any two nodes) of a Binary Tree.

<!-- Q_ID: ch_viva_7_q38 -->

**Options:**
**A1:** I define a recursive function `getHeight(node)`. It returns `1 + max(leftH, rightH)`. Inside this function, before returning, I update a global variable `maxDiameter = max(maxDiameter, leftH + rightH)`. This checks the path through _every_ node.
**A2:** I use DFS. At every node, I compute the depth of the left and right branches. The potential diameter through _this_ node is `leftDepth + rightDepth`. I verify if this is the new maximum. Then I return the max depth to the parent.
**A3:** I treat every node as a potential 'turning point' (anchor) of the path. I calculate the longest arms extending from each node. The maximum sum of two arms found anywhere in the tree is the diameter. This is an $O(N)$ solution.
**A4:** I will return `height(left) + height(right)`. This only calculates the diameter passing through the root and ignores paths that might be longer in a subtree.
**A5:** I will find the two deepest leaves and measure distance. Measuring the distance between two arbitrary nodes requires $O(N)$ time, making the overall complexity $O(N^2)$.
**A6:** I will use BFS to find width. Width (maximum nodes per level) is a different metric from diameter (longest path).
**A7:** I will sum all edges. Summing all edges is irrelevant to finding the longest path between two nodes.
**A8:** I will use Dijkstra from root. Dijkstra's is for weighted graphs and only finds paths starting from the root, not between arbitrary nodes.
**A9:** I will check left-most and right-most nodes. The longest path does not necessarily involve the extreme horizontal nodes.
**A10:** I will simply calculate height. Height is the longest path from the root to a leaf, which is a lower bound for the diameter.
**A11:** I will traverse In-Order. In-Order traversal does not naturally track the path lengths required for diameter calculation.
**A12:** I will use a matrix. Representing a tree as a matrix is inefficient and unnecessary for this problem.
**A13:** I will modify the tree. The diameter calculation should not modify the tree structure.
**A14:** I will return `max(left, right) + 1`. This is the formula for calculating height, not diameter.
**A15:** I will assume the tree is balanced. The algorithm must work for skewed trees, where the diameter is most likely to be found.

**Correct:** A1, A2, A3

**Exp:**
The diameter is the longest path between any two nodes. This path may or may not pass through the root. The efficient $O(N)$ solution involves calculating the height of the left and right subtrees at every node and updating a global maximum diameter with the sum of those two heights.

---

### Q: Sketch an algorithm to check if a Binary Tree is **Symmetric** (a mirror of itself around the center).

<!-- Q_ID: ch_viva_7_q39 -->

**Options:**
**A1:** I define a helper `isMirror(node1, node2)`. If both null, True. If one null, False. If values differ, False. Else, return `isMirror(node1.left, node2.right)` AND `isMirror(node1.right, node2.left)`. Call this on `root.left` and `root.right`.
**A2:** I use an Iterative approach with a Queue. I enqueue `root.left` and `root.right`. Loop: Dequeue `u` and `v`. Check equality. Enqueue `u.left, v.right` (Outers) and `u.right, v.left` (Inners). If mismatch, return False. This is an $O(N)$ solution.
**A3:** I verify symmetry by checking: 1. Roots match. 2. The left subtree is a mirror reflection of the right subtree. This requires recursive cross-comparison of children, ensuring the outer branches match and the inner branches match.
**A4:** I will check if `root.left == root.right`. This only checks if the two subtrees are the exact same object reference, which is incorrect for structural symmetry.
**A5:** I will check if left subtree is same as right subtree. This checks for structural equality, not mirror symmetry.
**A6:** I will use In-Order traversal and check palindrome. In-Order traversal does not capture the necessary structural information for symmetry checking.
**A7:** I will invert the left subtree and compare with right. This is a valid approach, but it modifies the tree structure, which is generally undesirable.
**A8:** I will check if `left.key == right.key` recursively. This is insufficient; the comparison must be cross-wise (left.left vs right.right).
**A9:** I will use a Stack for one side. A single stack is insufficient for the necessary parallel traversal and cross-comparison.
**A10:** I will count nodes on both sides. Equal node counts are necessary but insufficient for symmetry.
**A11:** I will check height balance. Height balance is a separate property from symmetry.
**A12:** I will assume it is a heap. Heaps are structurally complete but not necessarily symmetric in value or structure.
**A13:** I will compare root with leaves. This is too limited and ignores internal nodes.
**A14:** I will use BFS queue. While BFS is used in the iterative solution, the logic must specifically handle the cross-comparison of children.
**A15:** I will return False. This is not an algorithm.

**Correct:** A1, A2, A3

**Exp:**
Symmetry requires a recursive comparison of the left and right subtrees, but with cross-checking: the left child of the left subtree must match the right child of the right subtree, and vice versa. This is an $O(N)$ operation.

---

### Q: Sketch an algorithm to **flatten** a Binary Tree into a **Linked List** in-place (following Pre-Order `Root-Left-Right`).

<!-- Q_ID: ch_viva_7_q40 -->

**Options:**
**A1:** I use Recursion. `flatten(root)`. 1. Flatten Left and Right subtrees. 2. Store `root.right` in `temp`. 3. Move `root.left` to `root.right`. 4. Set `root.left` to null. 5. Traverse to the _end_ of the new right list. 6. Attach `temp` to the end.
**A2:** I use a Stack. Push Root. While stack not empty: Pop `curr`. If `curr.right` exists, push it. If `curr.left` exists, push it. Link `curr.right` to `stack.peek()` (the next node in Pre-Order). Set `curr.left` to null.
**A3:** I iterate down the right spine. If a node has a left child, I find the right-most node of that left child (predecessor). I connect that predecessor to the current node's right child. Then I move the whole left subtree to the right. This is the Morris Traversal approach.
**A4:** I will create a new Linked List. This violates the constraint of performing the operation in-place.
**A5:** I will set `root.right = root.left`. This loses the original right subtree, violating the Pre-Order requirement.
**A6:** I will use a Stack to print. Printing is not the same as modifying the structure in-place.
**A7:** I will set `left = null`. This is only half the operation; the left subtree must be moved to the right before being nullified.
**A8:** I will traverse In-Order. Flattening requires a Pre-Order sequence, not In-Order.
**A9:** I will swap left and right. Swapping left and right inverts the tree, but does not flatten it into a list.
**A10:** I will use a Queue. A Queue is used for BFS, which does not follow the required Pre-Order sequence.
**A11:** I will delete the tree. Deleting the tree is not the goal.
**A12:** I will put all nodes in an array. This violates the in-place constraint.
**A13:** I will link `node.next`. This is linked list terminology and does not describe the tree manipulation.
**A14:** I will start from leaves. The Pre-Order sequence starts at the root.
**A15:** I will use recursion without fixing pointers. Without fixing pointers, the tree structure will be broken.

**Correct:** A1, A2, A3

**Exp:**
Flattening a tree in-place requires complex pointer manipulation to ensure the original right subtree is correctly appended to the end of the newly flattened left subtree. Both recursive and iterative solutions are $O(N)$ time.

---

## List, Array, and Tree Search (Q41-Q45)

<!-- CH_ID: ch_viva_8 -->

---

### Q: Sketch an algorithm to find the **Kth Smallest** element in a **Binary Search Tree**.

<!-- Q_ID: ch_viva_8_q41 -->

**Options:**
**A1:** I will use an **Iterative In-Order Traversal** with a Stack. I push nodes going left. Then, I pop a node and increment a counter. If `counter == K`, I return that node's value. Else, I go right. This is $O(H+K)$ time.
**A2:** I define a recursive function `inOrder(node)`. It traverses left first. I maintain a global counter. Every time I visit a node (after returning from left), I decrement K. When `K == 0`, I record the result and stop recursion.
**A3:** I perform a simulation of sorted reading. I descend to the leftmost node (minimum). I then trace the 'next' successor path $K-1$ times. The node I land on is the answer. This exploits the BST property for efficiency.
**A4:** I will use BFS (Level-Order Traversal) and stop after visiting the Kth node. This does not guarantee the Kth smallest element, as BFS orders nodes by depth, not by value.
**A5:** I will go Left K times. This only works if the Kth smallest element is located on the leftmost path, which is only true if $K$ is small.
**A6:** I will collect all nodes in an array using In-Order traversal and return `array[K-1]`. This is correct but requires $O(N)$ space and time, which is less efficient than stopping early.
**A7:** I will use a Min-Heap. I insert all elements into the heap and call `extractMin` K times. This takes $O(N + K \log N)$ time, which is slower than the $O(H+K)$ BST approach.
**A8:** I will use Pre-Order traversal. Pre-Order traversal does not visit nodes in sorted order.
**A9:** I will search for value `K`. This assumes the Kth smallest element has the value K, which is incorrect.
**A10:** I will modify the tree to count children. This is the approach for $O(\log N)$ retrieval but requires $O(N)$ preprocessing time and modification of the tree structure.
**A11:** I will start from the max and go backwards. This is the algorithm for finding the Kth largest element.
**A12:** I will check `root.left.left...`. This only checks the leftmost path.
**A13:** I will return the Kth level. The Kth smallest element is not necessarily on the Kth level.
**A14:** I will assume the tree is balanced. The algorithm must work regardless of balance, although performance degrades for skewed trees.
**A15:** I will use recursion without a counter. Without a counter, the algorithm cannot stop at the Kth element.

**Correct:** A1, A2, A3

**Exp:**
The In-Order traversal of a BST yields elements in sorted order. The most efficient solution is to perform an In-Order traversal (recursively or iteratively) and stop immediately after visiting the $K$-th node. This is $O(H + K)$ time, where $H$ is the height, and $O(H)$ space (for the stack).

---

### Q: Sketch an algorithm to **insert** a new node with value `V` into a **Sorted Singly Linked List** while maintaining sorted order.

<!-- Q_ID: ch_viva_8_q42 -->

**Options:**
**A1:** I handle the Head case: If `head` is null or `head.val \ge V`, I insert at start and update head. Else, I traverse with `curr`. I look ahead: while `curr.next` is not null and `curr.next.val < V`, I move forward. Then I insert `newNode` between `curr` and `curr.next`.
**A2:** I maintain `prev` and `curr` pointers. I iterate until I find a node `curr` where `curr.val > V`. I insert `newNode` between `prev` and `curr`. If `prev` is null, I update head. If `curr` is null, I append to tail. This is an $O(N)$ solution.
**A3:** I scan the list to find the 'gap'. The gap is the first position where the next value exceeds `V`. I perform a standard pointer splice at that gap by setting `newNode.next = curr.next` and `curr.next = newNode`.
**A4:** I will simply append the new node to the tail of the list. This is an $O(1)$ operation, but it destroys the sorted order property required by the problem statement.
**A5:** I will sort the list after insertion. Sorting a linked list takes $O(N \log N)$ time, which is inefficient compared to the $O(N)$ insertion time.
**A6:** I will swap values until it fits. Swapping values is complex and unnecessary; only pointer manipulation is needed.
**A7:** I will check `curr.val == V`. This only checks for duplicates, not the correct insertion point.
**A8:** I will start from the middle. Starting from the middle requires $O(N)$ time to find the middle and does not guarantee faster insertion.
**A9:** I will use Binary Search. Binary search requires random access, which is not available in a Singly Linked List.
**A10:** I will insert at head if `head > V` then stop. This only handles the head case and ignores insertion into the middle or tail.
**A11:** I will use `curr.prev`. This assumes the list is a Doubly Linked List, which is not the case.
**A12:** I will use a second list. This is not an in-place operation and uses $O(N)$ auxiliary space.
**A13:** I will traverse until `curr > V`. This finds the insertion point, but since it's a SLL, we need the _previous_ node to perform the splice.
**A14:** I will insert it randomly. This violates the sorted order constraint.
**A15:** I will check neighbors. This is too vague and does not describe the full traversal logic.

**Correct:** A1, A2, A3

**Exp:**
Insertion into a sorted linked list requires finding the correct position by traversing the list. Since it's a singly linked list, you must either track the previous node or look ahead to perform the insertion splice correctly. Time complexity is $O(N)$.

---

### Q: Sketch an algorithm to **delete all even numbers** from a Singly Linked List.

<!-- Q_ID: ch_viva_8_q43 -->

**Options:**
**A1:** First, I handle the Head: while `head` is not null and even, `head = head.next`. Then, I traverse with `curr`. While `curr.next` is not null: if `curr.next.val` is even, I bypass it (`curr.next = curr.next.next`). Else, I advance `curr`. Return head.
**A2:** I use a 'Sentinel' or 'Dummy' node pointing to head. This simplifies edge cases. I traverse using `prev` (starts at dummy) and `curr` (starts at head). If `curr` is even, `prev.next = curr.next`. Else `prev = curr`. Move `curr` forward. Return `dummy.next`.
**A3:** I iterate through the list. I aggressively prune 'next' nodes. If the upcoming node is even, I snip it out immediately and check the _new_ upcoming node (without advancing). Only when the upcoming node is odd do I step forward. This is an $O(N)$ solution.
**A4:** I will check if `curr \% 2 == 0` and set `curr = null`. This only removes the local reference to the node and fails to relink the previous node, breaking the list structure.
**A5:** I will iterate and set `curr.next = curr.next.next`. This deletes the successor node but fails to check if the successor is actually even.
**A6:** I will make a new list with odds. This is not an in-place operation and uses $O(N)$ auxiliary space.
**A7:** I will traverse backwards. Traversing backwards in a Singly Linked List is inefficient or impossible without auxiliary space.
**A8:** I will assume head is odd. This is an invalid assumption and fails if the head node is even.
**A9:** I will use `curr.prev`. This assumes the list is a Doubly Linked List, which is not the case.
**A10:** I will delete the node and move `curr`. If `curr` is deleted, moving `curr` forward is impossible without tracking the next node beforehand.
**A11:** I will use a Stack. A stack is not suitable for in-place deletion in a linked list.
**A12:** I will replace values with 0. This changes the values but does not delete the nodes.
**A13:** I will use recursion. While possible, the recursive solution is often less intuitive for in-place deletion than the iterative approach.
**A14:** I will stop at the first even. This only deletes the first even number and ignores the rest.
**A15:** I will use two pointers but forget head update. Forgetting the head update is a common error that leaves the list broken if the initial nodes are even.

**Correct:** A1, A2, A3

**Exp:**
Deletion in a singly linked list requires tracking the previous node to perform the relinking. The primary challenge is handling the head node if it is even. Using a dummy node or handling the head separately simplifies the logic. Time complexity is $O(N)$.

---

### Q: Sketch an algorithm to **rotate** a Singly Linked List to the right by $K$ places.

<!-- Q_ID: ch_viva_8_q44 -->

**Options:**
**A1:** I traverse to find the length `Len` and the `Tail`. I set $K = K \% Len$. If $K=0$ return head. I connect `Tail.next = Head` (forming a ring). Then I traverse `Len - K` steps from the connection. I set the new head, and break the ring (`newTail.next = null`).
**A2:** I visualize the list as a ring. I close the ring first. Then I shift my starting point (Head) forward by `Length - K` steps. I cut the ring just before this new Head. This is an $O(N)$ time, $O(1)$ space solution.
**A3:** I find the pivot point. The new tail is at index $Len - K - 1$. The new head is `newTail.next`. I set `oldTail.next = oldHead` and `newTail.next = null`. Return `newHead`. This requires two full traversals.
**A4:** I will iterate $K$ times, and in each iteration, I traverse to the node just before the tail, detach the tail, and make it the new head. This results in an inefficient $O(N \cdot K)$ time complexity.
**A5:** I will use an array. I copy the list to an array, rotate the array, and rebuild the list. This uses $O(N)$ auxiliary space.
**A6:** I will swap values. Swapping values is complex and does not achieve the required structural rotation.
**A7:** I will pointer arithmetic. This is too vague and does not describe the necessary steps for rotation.
**A8:** I will reverse the list. Reversing the list is not the same as rotating it by K places.
**A9:** I will start from the Kth node. This is the logic for rotating to the _left_ by $K$ places.
**A10:** I will use a Queue. A queue is not suitable for this pointer manipulation task.
**A11:** I will ignore $K > N$. Ignoring large $K$ values is incorrect; the rotation must be performed modulo $N$.
**A12:** I will split the list and swap halves. This is the core idea, but the implementation must correctly identify the split point.
**A13:** I will use recursion. Recursion is overly complex for this linear list manipulation.
**A14:** I will use Doubly list logic. This is not applicable as the input is a Singly Linked List.
**A15:** I will return null. This is not an algorithm.

**Correct:** A1, A2, A3

**Exp:**
The most efficient solution is to first calculate the length, handle the modulo $K$, form a temporary circle, and then break the circle at the new tail position. This is an $O(N)$ time, $O(1)$ space operation.

---

### Q: Sketch an algorithm to return **all root-to-leaf paths** in a Binary Tree (as a list of strings `1->2->5`).

<!-- Q_ID: ch_viva_8_q45 -->

**Options:**
**A1:** I use **DFS** (Recursion). The function takes a Node and a String `path`. I append `node.val` to `path`. If leaf, add `path` to result list. Else, recurse left with `path`, recurse right with `path`. Strings are immutable so backtracking is handled automatically.
**A2:** I use an Iterative DFS with **two Stacks**. One for Nodes, one for `PathStrings`. When I push a child node, I also push `currentPath + "->" + child.val`. If I pop a leaf, I store the path string. This avoids deep recursion.
**A3:** I build paths incrementally. As I descend, I construct the lineage of the node. When the descent hits a leaf node, I commit the current lineage to the final records. This requires careful backtracking if using mutable structures.
**A4:** I will use BFS (Queue) to traverse the tree. While this finds all nodes, it does not naturally maintain the path history from the root, making path reconstruction difficult without extra data structures.
**A5:** I will only print the path. The requirement is to return a list of path strings, not just print them.
**A6:** I will use a global string. Using a global mutable string requires manual and complex backtracking logic to remove elements when returning up the recursion tree.
**A7:** I will traverse In-Order. In-Order traversal does not guarantee that the path is fully explored before moving to the next branch.
**A8:** I will use a single list and remove items. Using a mutable list requires explicit removal (backtracking) when returning from a recursive call.
**A9:** I will return the longest path. The requirement is to return _all_ paths, not just the longest one (diameter).
**A10:** I will store nodes in a Hash Map. A Hash Map is not suitable for storing sequential path information.
**A11:** I will use a Queue. A Queue is used for BFS, which is not the natural traversal for path finding.
**A12:** I will start from leaves. Starting from leaves requires parent pointers, which are not guaranteed.
**A13:** I will check for cycles. Checking for cycles is irrelevant in a standard tree structure.
**A14:** I will use Dijkstra. Dijkstra's algorithm is for weighted graphs.
**A15:** I will append `node` to string. This is too vague and does not describe the path management or termination condition.

**Correct:** A1, A2, A3

**Exp:**
Finding all paths requires a Depth-First Search (DFS) approach, as it naturally explores one path completely before backtracking. Recursion is the most common method, using the call stack for implicit backtracking. The time complexity is $O(N \cdot L)$, where $L$ is the average path length, due to string concatenation.

---

## Advanced Graph and Stream Algorithms (Q46-Q50)

<!-- CH_ID: ch_viva_9 -->

---

### Q: Sketch an algorithm to find the **max depth** of an **N-ary Tree** (each node has a list of children).

<!-- Q_ID: ch_viva_9_q46 -->

**Options:**
**A1:** I use **Recursion**. Base case: if children list is empty, return 1 (or 0). Else, initialize `max = 0$. Loop through all children: `max = Math.max(max, depth(child))`. Return `max + 1`.
**A2:** I use **BFS** to count levels. I use a Queue. I keep a `level`counter. At the start of the outer loop, I capture`size = queue.size()`. I process that many nodes (adding all their children). Increment level. Repeat. This is an $O(N)$ iterative solution.
**A3:** I traverse the tree. For every node, I poll all its subtrees to find the deepest one. I take that maximum depth and add one for the current node. This is the recursive DFS approach generalized for N children.
**A4:** I will return `1 + children.size()`. This only calculates the depth of the immediate children and ignores the depth of the subtrees.
**A5:** I will check `child[0]`and`child[last]`. This is insufficient; the deepest path could be through any of the N children.
**A6:** I will use binary tree logic. Binary tree logic only considers two children, which is insufficient for an N-ary tree.
**A7:** I will use a Stack. A stack can implement DFS, but the logic must correctly track the depth of the current path.
**A8:** I will use BFS and return queue size. The queue size only represents the number of nodes at the current level, not the total depth.
**A9:** I will count total nodes. Total node count is irrelevant to the maximum depth.
**A10:** I will assume children are sorted by height. This is an invalid assumption for a general N-ary tree.
**A11:** I will use an array. An array is not the primary data structure for representing the tree structure.
**A12:** I will add 1 for every child. This is incorrect; the depth is the longest path, not the sum of all paths.
**A13:** I will return 0. This is only correct if the tree is empty.
**A14:** I will delete nodes. Deleting nodes modifies the tree structure.
**A15:** I will use In-Order. In-Order traversal is not defined for N-ary trees.

**Correct:** A1, A2, A3

**Exp:**
Finding the max depth in an N-ary tree is a generalization of the binary tree height problem. Recursion (DFS) is the most natural fit, requiring a loop over all children to find the maximum depth among them. BFS is also a valid iterative approach. Time complexity is $O(N)$.

---

### Q: Sketch an algorithm to check if an undirected Graph is **Bipartite** (can be colored with 2 colors such that no edge connects same colors).

<!-- Q_ID: ch_viva_9_q47 -->

**Options:**
**A1:** I use **BFS** with a `Colors` array (0=Uncolored, 1=Red, 2=Blue). Loop all nodes (to handle disconnected). If uncolored, queue it and color Red. While queue not empty: Dequeue `u`. For neighbor `v`: If uncolored, color it opposite of `u` and enqueue. If colored same as `u`, return False.
**A2:** I simulate a 2-coloring process. I paint the starting node Black. I enforce that all neighbors must be White. I propagate this constraint. If I ever find a neighbor that is already painted the 'wrong' color, I conclude it's impossible (not Bipartite). This is an $O(V+E)$ solution.
**A3:** I traverse the graph. I maintain two sets: Set A and Set B. For every edge `(u, v)`, if `u` is in A, `v` must be in B. If I find a conflict where both ends of an edge fall in Set A or Set B, it fails. This is equivalent to the coloring approach.
**A4:** I will check if the number of nodes is even. The number of nodes is irrelevant to the bipartite property.
**A5:** I will check if it has cycles. A graph can have cycles and still be bipartite (if all cycles are even length).
**A6:** I will use DFS and check back-edges. This is used for finding cycles or topological sort, not directly for bipartite checking.
**A7:** I will check vertex degrees. Vertex degrees are insufficient to determine bipartiteness.
**A8:** I will count edges. The number of edges is irrelevant to the bipartite property.
**A9:** I will use Dijkstra. Dijkstra's algorithm is for finding shortest paths.
**A10:** I will use Union-Find. Union-Find can be adapted for bipartite checking by tracking parity, but the coloring approach is more direct.
**A11:** I will color randomly. Random coloring does not guarantee a valid 2-coloring and will fail for most graphs.
**A12:** I will split nodes into two sets randomly. Random splitting does not respect the edge constraints required for bipartiteness.
**A13:** I will check if the graph is connected. Connectivity is unrelated to bipartiteness; a disconnected graph can still be bipartite.
**A14:** I will assume it is a tree. Trees are always bipartite, but this assumption is invalid for general graphs.
**A15:** I will use a Stack. A Stack can implement DFS-based coloring, which is a valid approach similar to BFS.

**Correct:** A1, A2, A3

**Exp:**
A graph is bipartite if and only if it contains no odd-length cycles. The most straightforward way to check this is using BFS (or DFS) with a 2-coloring scheme. If a neighbor is found to have the same color as the current node, an odd cycle exists, and the graph is not bipartite. Time complexity is $O(V+E)$.

---

### Q: Sketch an algorithm to efficiently find the **median** of a stream of integers.

<!-- Q_ID: ch_viva_9_q48 -->

**Options:**
**A1:** I use **Two Heaps**: a `low` Max-Heap and a `high` Min-Heap. I balance them so their sizes differ by at most 1. New numbers go into `low`, then `low`'s max moves to `high` (to sort). If `high` is too big, move min back to `low`. Median is the top of the larger heap or average of both tops.
**A2:** I maintain two halves of the dataset. The lower half is kept in a structure that gives me the maximum instantly. The upper half gives me the minimum instantly. The median sits at the boundary of these two structures.
**A3:** I insert elements into a sorted structure (like two balanced heaps). I ensure the count of elements in both halves remains equal. The median is derived from the boundary elements.
**A4:** I will sort the array every time.
**A5:** I will use a Linked List and find middle.
**A6:** I will use a BST.
**A7:** I will average the min and max.
**A8:** I will use a Hash Map.
**A9:** I will use a single Heap.
**A10:** I will use a Queue.
**A11:** I will use just an array.
**A12:** I will randomly sample.
**A13:** I will swap elements.
**A14:** I will use pointers.
**A15:** I will use a Stack.

**Correct:** A1, A2, A3

**Exp:**
The Two-Heap approach is the standard optimal solution for finding the median in a data stream. It ensures that insertion and median retrieval are both $O(\log N)$ operations, as opposed to $O(N)$ or $O(N \log N)$ if using arrays or sorting repeatedly.

---

### Q: Sketch an algorithm to check if a string is a **palindrome**, ignoring non-alphanumeric characters.

<!-- Q_ID: ch_viva_9_q49 -->

**Options:**
**A1:** I use **Two Pointers** (Head, Tail). Loop `Head < Tail`. Inside, I run small while loops: `while Head is symbol, Head++` and `while Tail is symbol, Tail--`. Then compare characters (case-insensitive). If match, advance both. Else return False.
**A2:** I scan from both ends. If I encounter a non-letter, I skip it. When both pointers rest on valid letters, I compare them. Mismatch implies false. Meeting in the middle implies true.
**A3:** I iterate inwards. I effectively ignore any character that isn't a digit or letter by advancing my pointers past them dynamically. This allows me to verify the palindrome property in-place.
**A4:** I will replace all symbols using Regex.
**A5:** I will create a new clean string.
**A6:** I will skip only spaces.
**A7:** I will check char codes.
**A8:** I will use a Stack.
**A9:** I will compare index `i` and `N-i`.
**A10:** I will reverse and compare.
**A11:** I will use hashing.
**A12:** I will use recursion.
**A13:** I will sort it.
**A14:** I will delete symbols.
**A15:** I will assume clean input.

**Correct:** A1, A2, A3

**Exp:**
The optimal solution uses the Two-Pointer technique, running in $O(N)$ time and $O(1)$ space. The key is to use inner loops to advance the pointers past any non-alphanumeric characters before performing the comparison.

---

### Q: Sketch an algorithm to **evaluate** a mathematical **Expression Tree** (Leafs are numbers, Internal nodes are operators `+ - * /`).

<!-- Q_ID: ch_viva_9_q50 -->

**Options:**
**A1:** I use **Recursion**. Base case: If node is Leaf, return its value. Recursive step: `leftVal = eval(node.left)`, `rightVal = eval(node.right)`. Then apply `node.operator` to `leftVal` and `rightVal`. Return the result.
**A2:** I perform a Post-Order traversal. I compute the result of the left subtree and the right subtree first. Once I have those two numbers, I combine them using the operation stored in the current node.
**A3:** I collapse the tree from bottom up. Leaves return numbers. Operator nodes wait for their children to return numbers, then perform the math and return the result up to _their_ parent.
**A4:** I will use In-Order traversal.
**A5:** I will use BFS.
**A6:** I will return the root value.
**A7:** I will use a Stack.
**A8:** I will add all leaves.
**A9:** I will assume the tree is a heap.
**A10:** I will multiply the height.
**A11:** I will swap operands.
**A12:** I will flatten to a list.
**A13:** I will check for cycles.
**A14:** I will use Dijkstra.
**A15:** I will return 0.

**Correct:** A1, A2, A3

**Exp:**
Evaluating an expression tree requires a Post-Order traversal (Left, Right, Root). This ensures that the operands (numbers in the leaves) are evaluated before the operator (in the internal node) is applied. Recursion is the most straightforward way to implement this, running in $O(N)$ time.

---
