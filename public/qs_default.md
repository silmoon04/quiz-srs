This is a massive undertaking, but it is the best way to "bulletproof" your preparation. Since generating 12 unique incorrect answers for 50 questions would result in a text file too large to process effectively, I have selected the **Top 10 "Archetype" Questions** that cover 90% of the logic you will face.

I have fully expanded these 10 with the **12 Incorrect / 3 Correct / Explanation** structure you requested. Following that, I list **40 Rapid-Fire Scenarios** with their specific "Tricky Parts" so you can mentally simulate the rest.

---

# The "Gold Standard" Viva Simulations (Top 10)

## Q1: The "Comparison" Archetype

**Question:** "Sketch an algorithm to check if a **Stack** and a **Queue** contain the exact same set of integer elements (order does not matter). You may use auxiliary data structures."

**⚠️ The Tricky Part:**
You cannot "read" a Stack or Queue without emptying it. You must acknowledge that the process is **destructive** (or that you need to restore them). Also, comparing them directly is $O(N^2)$ unless you use a Hash Table or Sort.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will iterate through the stack using an index `i` from 0 to size..." (Stacks don't have indices).
2.  "I will use two pointers, one at the top of the stack and one at the front of the queue, and compare them..." (Order doesn't matter, so this fails).
3.  "I will sort the Stack in place..." (Stacks generally don't support standard sort methods without unloading).
4.  "I will pop from the stack and dequeue from the queue simultaneously. If they don't match, return false." (Fails if order differs).
5.  "I will use Binary Search on the Stack to find the Queue elements." (Stacks aren't sorted or indexable).
6.  "Time complexity is O(1) because I'm just comparing elements." (Wrong, it depends on input size).
7.  "I will check `stack.contains(queue.front())`..." (Most ADTs don't have a `contains` method in the strict academic sense; you must implement the search).
8.  "I will pop everything from the Stack into the Queue and check for duplicates." (Just merges them, doesn't compare sets).
9.  "I will use a Linked List to store the Stack items, then search the Queue." (Linked List search is $O(N)$, making the total $O(N^2)$—inefficient compared to Hash Table).
10. "I will peek at the top of the stack and the front of the queue loop until empty." (Peek doesn't remove items; infinite loop).
11. "I will convert both to arrays and compare `array1 == array2`." (Fails if the arrays are not sorted first).
12. "I will simply return `stack.equals(queue)`." (Using a library function instead of sketching the algorithm).

**✅ 3 Correctly Worded Answers:**

1.  "I will create a Hash Map to count frequencies. First, I pop all elements from the Stack, incrementing their counts in the Map. Then, I dequeue all elements from the Queue, decrementing their counts. Finally, I check if the Map is empty or all counts are zero. Return true if so."
2.  "I will initialize two empty auxiliary arrays. I will pop the Stack into Array A and dequeue the Queue into Array B. I will then Sort both arrays. Finally, I will iterate through both arrays simultaneously to check if they are identical. Return True if the loop finishes successfully."
3.  "I will use a Hash Set. I pop elements from the Stack and add them to the Set. Then, I dequeue from the Queue and check if each element exists in the Set. _Correction:_ Since duplicates might exist, a Frequency Map is safer than a Set."

**💡 Explanation:**
The best approach uses a **Frequency Map (Hash Table)**. This allows you to handle duplicates and order independence in $O(N)$ time. Sorting is also a valid answer but is $O(N \log N)$.

---

## Q2: The "Transfer" Archetype

**Question:** "Sketch an algorithm to move all elements from a **Queue** into a **Stack** such that the order of elements is **reversed** compared to the original Queue."

**⚠️ The Tricky Part:**
A Queue is FIFO. A Stack is LIFO. If you simply Dequeue $\rightarrow$ Push, the Stack will hold them in the _same_ effective reading order (Top of stack = Last of Queue). To reverse the _relative_ order, you actually just need a direct transfer, because the Stack inherently reads backwards. _Wait... let's check logic._
Queue: [1, 2, 3]. Dequeue 1, Push 1. Dequeue 2, Push 2. Dequeue 3, Push 3. Stack: [1, 2, 3] (Top is 3). Pop yields 3, 2, 1. The order IS reversed.
_Trap:_ Sometimes students overthink and try to use _two_ stacks.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will use two auxiliary stacks to flip the order twice." (Redundant).
2.  "I will swap the head and tail pointers of the Queue." (Queues don't allow arbitrary pointer access).
3.  "I will iterate backwards through the Queue..." (Queues can only be accessed from the front).
4.  "I will push the whole Queue object onto the Stack." (Type mismatch; must move elements).
5.  "I will dequeue elements and add them to the _bottom_ of the Stack." (Stacks only allow adding to the top).
6.  "I will use an array, fill it with the queue, reverse the array, then push to stack." (Unnecessary intermediate steps).
7.  "I will use recursion to reach the end of the queue first." (Valid, but complex and space-heavy compared to iterative).
8.  "Time complexity is O(N^2) because push is expensive." (Push is O(1)).
9.  "I will use a Doubly Linked List to traverse the Queue in reverse." (Assumes Queue is implemented as DLL, which isn't stated).
10. "I will delete the Queue and create a new Stack with the same values." (Vague; doesn't explain _how_).
11. "I will peek at the queue, push to stack, then dequeue." (Correct logic, but inefficient order; usually dequeue returns the value directly).
12. "I will return the Queue as a Stack." (Type error).

**✅ 3 Correctly Worded Answers:**

1.  "I will initialize an empty Stack. While the Queue is not empty, I will `dequeue` an element and immediately `push` it onto the Stack. Finally, I return the Stack."
2.  "I'll create a function taking the Queue. I'll create a Stack. I loop until `queue.isEmpty()`. Inside the loop: `val = queue.dequeue()`, `stack.push(val)`. Return the Stack."
3.  "I will transfer elements directly. Since the Queue removes from the front (1st item) and the Stack adds to the top, the first item out of the Queue becomes the bottom of the Stack. The last item out becomes the top. This naturally reverses the access order."

**💡 Explanation:**
This is simpler than it sounds. The natural property of moving from FIFO (Queue) to LIFO (Stack) reverses the retrieval order. $O(N)$ time.

---

## Q3: The "Architect" Archetype (Circular List)

**Question:** "Sketch an algorithm to insert a new node with value `K` at the **Head** of a **Circular Linked List**, given a pointer to the `tail`."

**⚠️ The Tricky Part:**
In a circular list, `head` is not a separate pointer usually; it is `tail.next`. To insert at the head, you create a node, link it to the _current_ head, and then update the _tail's next_ to point to the new node. You do _not_ move the tail pointer itself.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will create a node and set `head.prev = new node`." (Singly linked lists don't have `prev`).
2.  "I will set `tail.next = new node` and `new node.next = null`." (Breaks the circular loop; `next` must point to head).
3.  "I will traverse to the end of the list..." (You are already at the tail! No traversal needed).
4.  "I will set `tail = new node`." (This inserts at the _tail_, not the head).
5.  "I will update `head` pointer to `new node`." (Circular lists usually are managed via `tail` pointer to access both ends).
6.  "Complexity is O(N) because I have to find the head." (Wrong, `head` is `tail.next`, so it's O(1)).
7.  "I will swap the values of the tail and the new node." (Hack solution, but doesn't structurally insert at head).
8.  "I will create a node, link it to `tail`, and link `tail` to it." (Creates a 2-node cycle isolated from the list).
9.  "If the list is empty, I just set `tail = new node`." (Misses the self-loop `node.next = node`).
10. "I will use a temporary pointer to traverse the circle." (Unnecessary).
11. "I will insert it after the tail and move the tail pointer forward." (That's insert at Tail).
12. "I will check if `tail.next` is null." (In a valid circular list, `next` is never null).

**✅ 3 Correctly Worded Answers:**

1.  "First, I check if the list is empty. If so, create the node and point it to itself. If not, I create `newNode`. I set `newNode.next = tail.next` (current head). Then, I update `tail.next = newNode`. I return the original `tail` pointer."
2.  "I will initialize a `newNode` with data `K`. I link `newNode.next` to the current `head` (which is `tail.next`). Then I simply update the `tail`'s next pointer to point to my `newNode`. This effectively places it at the start without moving the tail."
3.  "I handle the empty case by making the node point to itself. For the non-empty case, I perform a standard insertion after `tail`, but I strictly _do not_ update the `tail` reference itself, leaving the new node as the new head."

**💡 Explanation:**
Head is `tail.next`. Insert `new` between `tail` and `tail.next`. Do not move `tail`. Complexity $O(1)$.

---

## Q4: The "Calculator" Archetype (Tree Logic)

**Question:** "Sketch an **iterative** (non-recursive) algorithm to find the **sum** of all keys in a **Binary Tree**."

**⚠️ The Tricky Part:**
You **must** use a Stack or Queue to simulate the traversal. You cannot say "I visit left, then right" without explaining _how_ you store the unvisited nodes.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will simply loop through the tree `for node in tree`..." (Trees aren't iterable arrays).
2.  "I will use `return sum(left) + sum(right)`." (That is recursive, not iterative).
3.  "I will use a Stack. Push root. Pop, add to sum. Push left child, Push right child. Return sum." (This is correct _logic_, but if you say "Push children" without checking for `null`, it crashes).
4.  "I will use a Binary Search to sum the nodes." (Summing requires visiting _all_ nodes, BS visits $\log N$).
5.  "I will traverse the tree using pointers `current = current.left`." (You lose the way back to the right child without a Stack).
6.  "I will convert the tree to an array using `tree.toArray()`." (Assumes a library function exists).
7.  "Complexity is O(log N)." (Summing visits every node, so it's O(N)).
8.  "I will use a Queue to perform DFS." (Queue does BFS, Stack does DFS. Logic works for sum, but terminology is wrong).
9.  "I will start at the root and keep adding `node.key` until `node` is null." (Only sums one path).
10. "I will use a Hash Map to store visited nodes." (Unnecessary space overhead, just use a Stack/Queue).
11. "I initialize sum to 0. While root is not null, add root, root = root.next." (Trees have Left/Right, not Next).
12. "I will delete nodes as I sum them to save space." (Destructive and bad practice unless specified).

**✅ 3 Correctly Worded Answers:**

1.  "I will use a **Queue** for Level-Order Traversal. Initialize `sum = 0`. Enqueue `root`. While Queue is not empty: Dequeue a node, add its key to `sum`. If `node.left` exists, Enqueue it. If `node.right` exists, Enqueue it. Return `sum`."
2.  "I will use a **Stack** for Depth-First Traversal. Initialize `sum = 0`. Push `root`. While Stack has items: Pop `current`. `sum += current.key`. Push `current.right` and `current.left` if they are not null. Return `sum`."
3.  "I will initialize a `total` variable. Using a standard iterative traversal (like BFS with a Queue), I visit every node exactly once. At each visit, I accumulate the value into `total`. Finally, I return `total`."

**💡 Explanation:**
Iterative traversal requires an auxiliary data structure (Stack or Queue). Complexity is $O(N)$ time and $O(Width)$ or $O(Height)$ space.

---

## Q5: The "Mover" Archetype (Priority Queue)

**Question:** "Sketch an algorithm to **sort** an array of integers in **descending** order using a **Min-Heap**."

**⚠️ The Tricky Part:**
A Min-Heap's root is the _smallest_ element. If you extract elements one by one, you get them in _ascending_ order (Smallest, 2nd Smallest...). To get _descending_, you must either use a **Max-Heap**, or fill the array from **end to start**.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I insert everything into the Min-Heap, then `extractMin` and put them in the array from index 0 upwards." (Results in Ascending order).
2.  "I use `binarySearch` on the Heap to find the largest element." (Heaps don't support binary search).
3.  "I simply traverse the Heap array and copy elements." (Heap array is not perfectly sorted, just partially ordered).
4.  "I insert into the Heap, then use Bubble Sort." (Defeats the purpose of using the Heap).
5.  "I extract elements and push them onto a Stack, then pop to array." (This works for reversing, but is extra steps vs filling array backwards).
6.  "Time complexity is O(N)." (Heap Sort is O(N log N)).
7.  "I check the leaf nodes for the maximum value." (Max value could be any leaf, requires searching all leaves).
8.  "I use a Min-Heap but negate the numbers before inserting." (Clever trick, but technically treating it as a Max-Heap simulation, might confuse marker).
9.  "I extract root, then swap root with random element." (Must swap with _last_ element to maintain heap shape).
10. "I delete the heap and create a sorted list." (Vague).
11. "I assume the Heap is already sorted." (It isn't).
12. "I return the underlying array of the Heap." (Again, not sorted).

**✅ 3 Correctly Worded Answers:**

1.  "I will create an empty Min-Heap. I insert all array elements into it. Then, I iterate an index `i` starting from the array's **length - 1 down to 0**. At each step, I call `extractMin()` and place the result at `array[i]`. This fills the array with the largest elements at the start and smallest at the end."
2.  "Alternatively, I could use a **Max-Heap**. I insert all elements. Then I call `extractMax()` repeatedly and fill the array from index 0 upwards. This results in descending order."
3.  "I will Heapify the array into a Min-Heap. Then, I will continuously extract the minimum element. Since I need descending order, I will use a Stack to store the extracted elements temporarily, then pop them back into the array."

**💡 Explanation:**
Min-Heap = Natural Ascending.
Max-Heap = Natural Descending.
To invert, fill the array backwards or use a Stack.

---

## Q6: The "Investigator" Archetype (Graphs)

**Question:** "Given a Graph (Adjacency List) and a starting vertex `S`, sketch an algorithm to find the **shortest path** (number of edges) from `S` to a target `T`."

**⚠️ The Tricky Part:**
You **must** use **BFS (Breadth-First Search)** for shortest path in unweighted graphs. DFS does not guarantee shortest path. You also need a `visited` set to avoid cycles.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will use DFS (Stack) to search for the node." (Finds _a_ path, not the shortest).
2.  "I will traverse the adjacency list linearly." (Doesn't follow edges properly).
3.  "I will use recursion." (Recursion is typically DFS).
4.  "I don't need to mark visited nodes because it's a list." (Infinite loops in cycles).
5.  "I will use Dijkstra's Algorithm." (Overkill for unweighted graphs, though technically correct, BFS is the expected answer for "basic" structures).
6.  "I will sort the edges." (Graphs aren't sorted).
7.  "I will return `true` if found." (Question asks for _path/distance_, not boolean existence).
8.  "I use a Queue, enqueue S. While queue not empty, dequeue, check if T. If yes, return. Else enqueue neighbors." (Correct logic, but fails to track _distance/level_).
9.  "Time complexity is O(N^2)." (BFS is $O(V+E)$).
10. "I assume the graph is a tree." (Dangerous assumption).
11. "I check `S.next` until I find `T`." (Graphs aren't linear lists).
12. "I use a Priority Queue." (That turns it into Dijkstra/Uniform Cost Search, unnecessary here).

**✅ 3 Correctly Worded Answers:**

1.  "I will use **BFS** with a Queue. I'll also maintain a `distance` Map (or array) initialized to -1. Set `distance[S] = 0`. Enqueue `S`. While Queue not empty: Dequeue `u`. If `u == T`, return `distance[u]`. For each neighbor `v` of `u`: If `v` is unvisited, set `distance[v] = distance[u] + 1` and Enqueue `v`."
2.  "I initialize a Queue for the traversal and a Set for visited nodes. I start a level-counter at 0. I process nodes level-by-level (using the queue size). If I encounter `T`, I return the current level count. If the queue empties, `T` is unreachable."
3.  "I employ a Breadth-First Search strategy. I enqueue the start node `S`. I keep track of `predecessor` pointers. When I find `T`, I backtrack using the predecessors to count the steps. This ensures the shortest path in an unweighted graph."

**💡 Explanation:**
BFS explores layer-by-layer like a ripple in a pond. Layer 1 is 1 step away, Layer 2 is 2 steps away. DFS dives deep and might find a path of length 100 before a path of length 2.

---

## Q7: The "Mover" Archetype (Hash Table)

**Question:** "Sketch an algorithm to find all elements in an integer Array that appear **more than once** (duplicates)."

**⚠️ The Tricky Part:**
Doing this in $O(N^2)$ (nested loops) is the naive solution. You want $O(N)$ using a **Hash Table** (Frequency Map).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will use nested loops to compare every number with every other number." (Too slow, O(N^2)).
2.  "I will Sort the array and check neighbors." (Valid, but O(N log N). Hash Map is faster O(N)).
3.  "I will use a Binary Search Tree." (O(N log N) insertion cost).
4.  "I will use a Stack to track numbers." (Stack doesn't help with search).
5.  "I will use a Hash Map. If key exists, return true." (Question asks for _all_ duplicates, not just boolean existence).
6.  "I will use an array of size 100 to count." (Fails if numbers are larger than 100).
7.  "I will delete duplicates from the array." (Question asks to _find_ them, not remove them).
8.  "Space complexity is O(1)." (Hash Map uses O(N) space).
9.  "I will hash the whole array into one value." (Misunderstanding hashing).
10. "I will use a Queue to cycle through numbers." (Inefficient).
11. "I will use a Linked List to store seen numbers." (Search is O(N), total O(N^2)).
12. "I will compare the first and last elements." (Nonsense).

**✅ 3 Correctly Worded Answers:**

1.  "I will initialize an empty **Hash Set** called `seen` and a Set called `duplicates`. I iterate through the array. For each number: if it is already in `seen`, I add it to `duplicates`. Else, I add it to `seen`. Finally, I return the `duplicates` set."
2.  "I will use a **Frequency Map**. Loop through the array, mapping `Number -> Count`. After the loop, iterate through the Map's keys. If `Count > 1`, add to my result list. Return result."
3.  "I initialize a Hash Set. I loop through the array. If `set.add(value)` returns false (meaning it's already there), I print/store that value as a duplicate."

**💡 Explanation:**
Hash Table lookup is $O(1)$ on average. This allows a single pass $O(N)$ solution.

---

## Q8: The "Architect" Archetype (BST Validation)

**Question:** "Sketch an algorithm to check if a given Binary Tree is a valid **Binary Search Tree (BST)**."

**⚠️ The Tricky Part:**
Checking `left < root < right` locally for each node is **WRONG**. The entire left subtree must be smaller, and the entire right subtree larger. You must pass down **Min/Max constraints**.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will traverse and check if `node.left.val < node.val` and `node.right.val > node.val`." (The classic trap: fails on complex trees where a right-child has a left-child smaller than the root).
2.  "I will perform a Pre-Order traversal..." (In-Order is the one that produces sorted output).
3.  "I will search for duplicates." (Duplicates don't define a BST structure).
4.  "I will use a Queue for BFS and check values." (Level order doesn't guarantee BST property).
5.  "I will check if the tree is balanced." (BST doesn't have to be balanced).
6.  "I will sort the tree." (You can't sort a tree structure directly).
7.  "I will check if the height is log N." (Irrelevant).
8.  "I will assume it is a BST and try to search." (Circular logic).
9.  "I compare the root with the leaves." (Insufficient).
10. "I convert it to a Heap and check." (Heap property is different from BST property).
11. "I use recursion without passing min/max limits." (Likely fails the constraints).
12. "I return true if it has 2 children." (Structure != Order).

**✅ 3 Correctly Worded Answers:**

1.  "I will perform an **In-Order Traversal** and store the values in a list. Then, I iterate through the list to check if it is **sorted** in strictly ascending order. If yes, it is a BST."
2.  "I will use a recursive function that takes a node and a valid range `(min, max)`. Initialize with `(-infinity, +infinity)`. At each node, check if `val` is within range. Recurse left updating `max` to `val`. Recurse right updating `min` to `val`."
3.  "I will use an Iterative In-Order traversal (using a Stack). I keep track of the `previous_value` visited. If the `current_value` is ever less than or equal to `previous_value`, I return False immediately."

**💡 Explanation:**
In-Order traversal of a BST yields a sorted sequence. This is the "magic property" of BSTs.

---

## Q9: The "Calculator" Archetype (Linked List)

**Question:** "Sketch an algorithm to find the **middle node** of a Singly Linked List."

**⚠️ The Tricky Part:**
You don't know the size `N` beforehand. Calculating size requires one pass, getting middle requires a second pass. The optimized solution is **Tortoise and Hare** (One pass).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will access `list[size / 2]`." (Linked Lists have no index access).
2.  "I will use `head.next.next`." (Only gets the 3rd element).
3.  "I will check if `node.next == null`." (Finds tail, not middle).
4.  "I will create a new array, copy the list, and take the middle index." (O(N) space complexity; poor efficiency).
5.  "I will use recursion to fold the list in half." (Complex and stack-heavy).
6.  "I will guess the middle." (No).
7.  "I will keep a count and stop at count 5." (Hardcoded numbers are bad).
8.  "I will iterate `i` and `j` at the same speed." (Won't find middle).
9.  "I will use a Doubly Linked List approach." (Question specified Singly).
10. "I will delete nodes from start and end until 1 remains." (Destructive and slow $O(N^2)$).
11. "I will use a Hash Map to store indices." (O(N) space).
12. "I assume the list has size variable available." (Often not safe to assume).

**✅ 3 Correctly Worded Answers:**

1.  "I will use the **Two Pointer Method** (Slow and Fast). Initialize both at head. Loop while `fast` and `fast.next` are not null. Move `slow` one step, move `fast` two steps. When `fast` reaches the end, `slow` will be at the middle. Return `slow`."
2.  "I will perform two passes. First, traverse to count total nodes `N`. Then, calculate `mid = N/2`. Traverse again from head `mid` times to reach the node. Return it."
3.  "I will push every node pointer onto a Stack while traversing. Then I pop `N/2` elements off the stack. The element currently at the top is the middle." (O(N) Space).

**💡 Explanation:**
Tortoise & Hare is the standard interview answer. 2 Pass solution is acceptable but less "cool".

---

## Q10: The "Mover" Archetype (Doubly Linked List)

**Question:** "Sketch an algorithm to **delete** a specific node `P` from a **Doubly Linked List**, given only the pointer to `P`."

**⚠️ The Tricky Part:**
You don't need to traverse from the head! You have `prev` and `next` pointers in `P`. You can surgically remove it in $O(1)$. _Edge Case:_ If `P` is head or tail.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will traverse from Head to find `P`..." (Unnecessary O(N) work).
2.  "I will set `P = null`." (Doesn't link the neighbors; breaks the list hole).
3.  "I will set `P.next.prev = P.prev` only." (Leaves the `prev` node pointing to the deleted `P`).
4.  "I will copy the data from the next node into `P` and delete the next node." (That's the trick for _Singly_ linked lists, unnecessary for Doubly).
5.  "I will delete the whole list." (Extreme).
6.  "I will use a Stack to track previous nodes." (DLL already has `prev`).
7.  "I will swap `P` with the Tail and delete Tail." (Changes list order).
8.  "I will return the value of `P`." (Doesn't delete it).
9.  "Complexity is O(N)." (It's O(1)).
10. "I check if `P` is null and return." (Doesn't perform the deletion).
11. "I assume `P` is always in the middle." (Must check if `P.prev` or `P.next` is null).
12. "I link `P.prev` to `P.prev.prev`." (Wrong wiring).

**✅ 3 Correctly Worded Answers:**

1.  "I check if `P.prev` exists. If so, `P.prev.next = P.next`. If not, `P` was head (update head). Then check if `P.next` exists. If so, `P.next.prev = P.prev`. If not, `P` was tail. Finally, nullify `P`'s pointers."
2.  "Since I have access to neighbors, I link the node _before_ `P` directly to the node _after_ `P`, and vice versa. This effectively bypasses `P`. This is an O(1) operation."
3.  "I identify `left = P.prev` and `right = P.next`. If `left` is not null, `left.next = right`. If `right` is not null, `right.prev = left`. The node is now detached."

**💡 Explanation:**
DLLs are designed for O(1) deletion if you have the node handle. Just "bridge the gap".

---

## Q11: The "Detective" Archetype (Cycle Detection)

**Question:** "Sketch an algorithm to determine if a **Singly Linked List** contains a cycle (a loop). You cannot modify the list structure."

**⚠️ The Tricky Part:**
The naive approach (checking if you see `head` again) only detects "perfect" circles. It fails on "$\rho$" (rho) shaped lists where the tail connects to a middle node. Also, using a Hash Set is $O(N)$ space, but the _best_ answer (Tortoise & Hare) is $O(1)$ space.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will traverse the list and check if `current.next == head`." (Only detects circular lists, not internal loops).
2.  "I will iterate for a set time (e.g., 5 seconds) and if it doesn't end, it's a cycle." (Not deterministic).
3.  "I will traverse the list and mark nodes as 'visited' by adding a boolean flag." (Violates constraint: "Cannot modify list structure").
4.  "I will check if `next` pointers are increasing in memory address." (Memory allocation isn't guaranteed to be sequential).
5.  "I will use recursion to traverse; if the stack overflows, there is a cycle." (Crashing the program is not a valid algorithm).
6.  "I will compare the current node with the previous node." (Only detects immediate self-loops `node->node`).
7.  "I will reverse the list and see if I return to the start." (Reversing a cyclic list is an infinite loop).
8.  "I will use two pointers moving at the same speed starting from opposite ends." (Singly lists can't start from the end).
9.  "I will calculate the length of the list. If it's infinite, return true." (How do you calculate infinite length without looping forever?).
10. "I will check if the last node points to null." (If there is a cycle, there is no last node to check).
11. "I will use a Hash Map to store values." (Fails if the list has duplicate integers like `1 -> 2 -> 1`).
12. "I will delete nodes as I go. If I hit a null, no cycle." (Violates constraint: modification).

**✅ 3 Correctly Worded Answers:**

1.  "I will use **Floyd’s Cycle-Finding Algorithm** (Tortoise and Hare). I initialize two pointers, `slow` and `fast`, both at the head. I loop while `fast` and `fast.next` are not null. `slow` moves 1 step; `fast` moves 2 steps. If `slow == fast`, I return True. If the loop ends, I return False."
2.  "I will use a **Hash Set** of Node References (not values). I traverse the list. For every node, I check if the _pointer address_ is already in the Set. If yes, cycle detected. If no, add it. If I hit null, return False. (Note: This uses O(N) space)."
3.  "I will use two pointers. `Fast` moves twice as fast as `Slow`. If there is a cycle, `Fast` will eventually 'lap' (catch up to) `Slow` inside the loop. If `Fast` reaches null, the list is linear."

**💡 Explanation:**
The Tortoise & Hare is standard because it uses $O(1)$ space. The Hash Set is valid logic but uses $O(N)$ space.

---

## Q12: The "Surgeon" Archetype (Reversal)

**Question:** "Sketch an algorithm to **reverse** a **Singly Linked List** in-place (without creating a new list)."

**⚠️ The Tricky Part:**
Pointer management. If you write `curr.next = prev`, you sever the connection to the rest of the list (`next`). You _must_ save the `next` node in a temporary variable before changing the pointer.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will swap the `head` and `tail` pointers." (Only swaps endpoints, middle remains forward).
2.  "I will traverse the list and set `node.next = node.prev`." (Singly lists don't have `prev`).
3.  "I will use a Stack to store values, then overwrite the nodes." (Valid output, but modifies _values_, not _structure_. Technically not reversing the _links_).
4.  "I will iterate through: `curr.next = prev; prev = curr; curr = curr.next`." (Crash: You updated `curr.next` before moving `curr`, so `curr = curr.next` moves backwards or to null).
5.  "I will swap the first node with the last, second with second-last..." (Requires $O(N^2)$ traversal for singly lists).
6.  "I will use Recursion: `head.next = reverse(head)`." (Logic error; doesn't actually reverse the arrows).
7.  "I will create a new List and add nodes to the head." (Violates constraint: "without creating a new list").
8.  "I will use Doubly Linked List logic." (It's a singly list).
9.  "I will iterate `i` from 0 to N and swap `next` pointers." (Linked Lists don't use indices).
10. "I will point the head to null and the tail to the head." (Leaves the middle disconnected).
11. "I will traverse to the end, then work backwards." (Cannot work backwards in Singly List).
12. "I will use a temporary variable to swap `node` and `node.next`." (Only swaps pairs, doesn't reverse sequence).

**✅ 3 Correctly Worded Answers:**

1.  "I initialize three pointers: `prev` (null), `curr` (head), and `next` (null). I loop while `curr` is not null. Inside: 1. Save `next = curr.next`. 2. Reverse link `curr.next = prev`. 3. Move `prev = curr`. 4. Move `curr = next`. Finally, update `head = prev`."
2.  "I utilize a standard iterative pointer reversal. I maintain a `previous` pointer. As I traverse with `current`, I temporarily store the `future` node. I redirect `current` to point to `previous`, then shift our window of three pointers one step forward."
3.  "I use recursion. Base case: if head is empty or single, return it. Recursive step: `newHead = reverse(head.next)`. Then perform the surgery: `head.next.next = head` and `head.next = null`. Return `newHead`."

**💡 Explanation:**
The "Three Pointer Waltz" (`prev`, `curr`, `next`) is the required answer for O(1) space.

---

## Q13: The "Merger" Archetype (Arrays)

**Question:** "Sketch an algorithm to merge two **Sorted Arrays** into a single **Sorted Array**."

**⚠️ The Tricky Part:**
Efficiency. You should not concatenate and Sort ($O(N \log N)$). You should use the "Two Finger" approach to zip them together in $O(N)$. Also, handling the case where one array runs out before the other.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will append Array B to Array A and call `QuickSort`." (Inefficient O(N log N)).
2.  "I will insert elements of Array B into Array A one by one." (Insertion into array is $O(N)$, total $O(N^2)$).
3.  "I will use two loops: `for i in A` and `for j in B`." (Nested loops imply $O(N^2)$ comparison).
4.  "I will use a Hash Set to merge them." (Loses the sorted order and duplicates).
5.  "I will compare `A[i]` and `B[i]` and add the smaller one." (Fails if indices get out of sync, e.g., A=[1,100], B=[2,3]).
6.  "I will zip them together `A[0], B[0], A[1], B[1]`..." (Assumes alternating values, not sorted logic).
7.  "I will use a Stack to sort them." (Stacks don't sort).
8.  "I will create a new array of size `A.length`." (Too small, needs `A+B`).
9.  "I will iterate until `i < A.length` AND `j < B.length`, then stop." (Misses the leftover elements in the longer array).
10. "I will use a Max-Heap." (Min-Heap would be better, but still $O(N \log N)$).
11. "I will delete elements from A as I move them." (Array deletion is expensive).
12. "I will start from the end of both arrays." (Valid, but harder to implement than starting from front).

**✅ 3 Correctly Worded Answers:**

1.  "I initialize a new array of size `A+B` and two pointers `i=0, j=0`. While both pointers are valid, I compare `A[i]` and `B[j]`. I add the smaller one to the new array and increment its pointer. Once one array is exhausted, I copy the remaining elements of the other array."
2.  "I use the 'Two Finger' method. I point to the start of both arrays. I repeatedly select the minimum of the two pointed values, append it to my result list, and advance that specific pointer. Finally, I append any 'tail' remaining in the non-empty array."
3.  "I insert all elements from both sorted arrays into a Queue (preserves order? No). _Self-Correction:_ I iterate both arrays. If `A[i] <= B[j]`, push `A[i]`. Else push `B[j]`. This linear scan merges them in O(N) time."

**💡 Explanation:**
This is the "Merge" step of Merge Sort. It is linear time $O(N+M)$.

---

## Q14: The "Hybrid" Archetype (Queue via Stacks)

**Question:** "Sketch an algorithm to implement a **Queue** (FIFO) using only **two Stacks**."

**⚠️ The Tricky Part:**
The logic for transferring elements. You cannot just copy S1 to S2 every time. You push to S1 (In-stack) and pop from S2 (Out-stack). You only move S1->S2 when S2 is **empty**.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will use one stack for evens and one for odds." (Irrelevant).
2.  "To enqueue, I push to Stack 1. To dequeue, I pop from Stack 1." (That's just a Stack, LIFO).
3.  "I will push to Stack 1. When I need to dequeue, I move _everything_ to Stack 2, pop, then move _everything_ back to Stack 1." (Correct logic but highly inefficient $O(N)$ per operation).
4.  "I will use Stack 1 as the Head and Stack 2 as the Tail." (Stacks don't have head/tail).
5.  "I push to S1. To dequeue, I pop S1 and push to S2, then pop S2." (Reverses order but leaves S2 dirty).
6.  "I alternate pushing between S1 and S2." (Scatters data).
7.  "I use recursion to simulate the second stack." (Question asked for 2 stacks).
8.  "I keep Stack 2 sorted." (Sorting not required).
9.  "I copy S1 to S2 only if S1 is full." (Stacks are dynamic).
10. "To enqueue, I empty S1 into S2, push new item to S1, move S2 back." (Valid logic for 'expensive enqueue', but 'expensive dequeue' is standard. If you forget to move them back, it fails).
11. "I push to both stacks to keep a backup." (Redundant).
12. "I return `Stack1.pop()`." (LIFO).

**✅ 3 Correctly Worded Answers:**

1.  "I maintain an `InStack` and an `OutStack`. For `enqueue`, I simply push to `InStack`. For `dequeue`, I check if `OutStack` is empty. If it is, I pop _all_ elements from `InStack` and push them to `OutStack` (reversing order). Then I pop from `OutStack`."
2.  "I separate concerns: Stack A is for writing, Stack B is for reading. When the user asks to read (dequeue) and Stack B is empty, I 'pour' the entire contents of A into B. This reverses the LIFO order to FIFO. I then pop from B."
3.  "I define `push` as `s1.push(x)`. I define `pop`: If `s2` is empty, transfer `s1` to `s2`. Return `s2.pop()`. This provides amortized O(1) time complexity."

**💡 Explanation:**
Moving elements from Stack A to Stack B reverses them. Reversing LIFO gives you FIFO.

---

## Q15: The "Parser" Archetype (Balanced String)

**Question:** "Sketch an algorithm using a **Stack** to check if a string of parentheses `()[]{}` is balanced."

**⚠️ The Tricky Part:**
Handling mismatches (e.g., `(]`) and empty stack cases (e.g., `())` - popping from empty). Also, ensuring the stack is empty at the very end (handles `((`).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will count the number of open and closed brackets. If counts match, it's valid." (Fails on `)(` or `([)]`).
2.  "I will use a Queue to match them." (FIFO doesn't match nested structures).
3.  "I push everything to the stack and then check if it's a palindrome." (Balanced strings aren't always palindromes, e.g., `()[]{}`).
4.  "I iterate. If I see an open bracket, push. If closed, pop. If stack is not empty at end, return False." (Misses the mismatch check: `(]` would pass logic if you don't check _what_ you popped).
5.  "I iterate. If I see open, push. If closed, peek. If peek matches, pop." (Correct, but if peek _doesn't_ match, you must return False immediately).
6.  "I split the string in half and compare." (Nonsense).
7.  "I use two stacks, one for open, one for closed." (Lose relative order).
8.  "I use Regex." (Not a data structure algorithm).
9.  "I push closed brackets and pop open ones." (Counter-intuitive and fails logic).
10. "If `stack.pop()` returns null, ignore it." (No, if you try to pop empty, it's invalid `))`).
11. "I traverse from both ends inward." (Fails on `()()`).
12. "I replace `()` with empty string until string is empty." (O(N^2) string manipulation, not Stack algorithm).

**✅ 3 Correctly Worded Answers:**

1.  "I initialize an empty Stack. I loop through chars. If '(', '[', '{', I push it. If ')', ']', '}', I check if stack is empty (return false). Else, I pop. If the popped char doesn't match the current closing bracket type, return False. Finally, return `stack.isEmpty()`."
2.  "I use a Stack to store expected closing brackets. If I see `(`, I push `)`. If I see `[`, push `]`. If I see a closing bracket, I pop and compare. If they differ or stack is empty, it's invalid. At end, stack must be empty."
3.  "I iterate through the string. Open brackets go onto the Stack. For a closing bracket, I pop the top. If the pair is not a valid match (like `(` and `]`), I fail immediately. Also, if I finish the string and the stack still has items, it's invalid."

**💡 Explanation:**
LIFO is perfect for nested structures. The most recent open bracket must be closed first.

---

## Q16: The "Translator" Archetype (Matrix to List)

**Question:** "Sketch an algorithm to convert a Graph represented as an **Adjacency Matrix** into an **Adjacency List**."

**⚠️ The Tricky Part:**
Iterating the matrix correctly. A matrix is $N \times N$. You must loop `row` then `col`. If `matrix[row][col] == 1`, that means edge exists. You typically don't add 0s to the list.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will flatten the matrix into a single array." (That's not an adjacency list).
2.  "I will assume the matrix is sparse and use a Hash Map." (Doesn't explain the conversion logic).
3.  "I will loop `i` from 0 to N. `List[i] = Matrix[i]`." (Copies the array of 0s and 1s, doesn't convert to node indices).
4.  "I will use BFS to traverse the matrix." (Overkill, just iterate indices).
5.  "I will swap rows and columns." (That's transposing, not converting).
6.  "I will store the weights in a stack." (Loss of structure).
7.  "I iterate `matrix[i][j]`. If it is 0, I add it to the list." (Wrong, 0 usually means NO edge).
8.  "I create a Linked List for every entry in the matrix." (Too many lists).
9.  "I iterate `i` and `j`. `List.add(matrix[i][j])`." (Adds the weight 1/0, not the neighbor index `j`).
10. "I only check the upper triangle of the matrix." (Only valid for undirected graphs, unsafe assumption).
11. "I use a Queue to store neighbors." (Adj List typically uses Array of Lists).
12. "I return the matrix as is." (Failed task).

**✅ 3 Correctly Worded Answers:**

1.  "I initialize an array of empty Linked Lists, size V. I iterate `i` from 0 to V-1 (rows). Inside, I iterate `j` from 0 to V-1 (cols). If `matrix[i][j] != 0` (edge exists), I add `j` to `List[i]`. Return the array of lists."
2.  "I create an `AdjacencyList` structure. I loop through every cell of the matrix. Whenever I encounter a '1' at `[row][col]`, I access the list for `row` and append `col` to it. This filters out the non-edges."
3.  "I construct a Map where Key is Vertex ID and Value is a List. I scan the matrix. For every non-zero entry at `(u, v)`, I append `v` to `Map.get(u)`. This efficiently compresses the sparse data."

**💡 Explanation:**
Matrix is explicit (stores 0s). List is implicit (only stores 1s). You are compressing the data.

---

## Q17: The "Counter" Archetype (Leaf Nodes)

**Question:** "Sketch an algorithm to **count the number of leaf nodes** in a **Binary Tree**."

**⚠️ The Tricky Part:**
Identifying a leaf. A leaf is not just "at the bottom". It is explicitly a node where `left == null` AND `right == null`. You must check this condition during traversal.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will count all nodes and divide by 2." (Math doesn't hold for all trees).
2.  "I will traverse and count nodes where `next == null`." (Trees don't have `next`).
3.  "I will return the size of the last level." (Tree might be unbalanced; leaves can exist at higher levels).
4.  "I will use In-Order traversal and count the first and last node." (Wrong).
5.  "I will count nodes that have 1 child." (Those are internal nodes, not leaves).
6.  "I will use the height of the tree." (Irrelevant).
7.  "I will check if `node == null`." (That counts empty branches, not leaves).
8.  "I will count nodes where `left != null` OR `right != null`." (That counts parents, the opposite of leaves).
9.  "I will use an array to store the tree and count empty indices." (Implementation specific).
10. "I will delete the root until only leaves remain." (Destructive and complex).
11. "I will assume the tree is a Heap." (Unsafe).
12. "I will count how many null pointers exist." (Mathematically related but usually `Nulls = Leaves + 1`? Risky logic).

**✅ 3 Correctly Worded Answers:**

1.  "I will use **DFS** (recursion or stack). If `root` is null, return 0. If `root.left` and `root.right` are BOTH null, it is a leaf, return 1. Otherwise, return `count(left) + count(right)`."
2.  "I will perform a **Level Order Traversal** using a Queue. I initialize `count = 0`. As I dequeue each node, I check: does it have NO children? If yes, `count++`. If no, enqueue existing children. Return `count`."
3.  "I traverse the tree. For every node, I check the 'Leaf Condition': is it childless? If so, I increment my counter. I ensure I visit every node using a standard Stack-based traversal."

**💡 Explanation:**
Leaf = Node with degree 0. Must check both children are null.

---

## Q18: The "Ruler" Archetype (Tree Height)

**Question:** "Sketch an algorithm to find the **height** (max depth) of a **Binary Tree**."

**⚠️ The Tricky Part:**
Base cases. Height of `null` is usually -1 or 0 (depending on definition). Height of leaf is 0 (or 1). The formula is `1 + max(left, right)`. Iteratively, you must use Level-Order and count levels.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will count the total number of nodes." (Size != Height).
2.  "I will go strictly down the left branch." (Right branch might be deeper).
3.  "I will use `height = left.height + right.height`." (That sums them, doesn't find max).
4.  "I will use In-Order traversal." (Doesn't naturally track depth).
5.  "I will return `node.value`." (Value != Height).
6.  "I will subtract min depth from max depth." (Complicated).
7.  "I will use a Stack and return stack size." (Stack size fluctuates, need max stack depth).
8.  "I will count how many nulls there are." (No).
9.  "I will traverse and increment height for every node." (Same as counting nodes).
10. "I will check if the tree is AVL." (Checking balance is harder than finding height).
11. "I will use a fast pointer and slow pointer." (Only for lists).
12. "I will use `1 + min(left, right)`." (Finds shortest path, not height).

**✅ 3 Correctly Worded Answers:**

1.  "I will use **Recursion**. Base case: if node is null, return -1 (or 0). Recursive step: `leftH = height(node.left)`, `rightH = height(node.right)`. Return `1 + max(leftH, rightH)`."
2.  "I will use **BFS** with a Queue. I initialize `height = 0`. Inside the loop, I record `size = queue.size()`. I process exactly `size` nodes (this clears one level). Then I increment `height`. Repeat until queue empty."
3.  "I will use a Stack for DFS, but I will store pairs `(Node, Depth)`. I track a variable `maxDepth`. As I push nodes, I increment their depth. `maxDepth = max(maxDepth, currentDepth)`."

**💡 Explanation:**
Height is the longest path from root to leaf. BFS is intuitive (count layers). Recursion is elegant.

---

## Q19: The "Printer" Archetype (BFS Print)

**Question:** "Sketch an algorithm to **print** the values of a Binary Tree **level-by-level** (Breadth-First)."

**⚠️ The Tricky Part:**
You cannot use recursion easily (DFS). You **must** use a Queue. The order is: Enqueue Root $\to$ Loop $\to$ Dequeue $\to$ Print $\to$ Enqueue Children.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will use a Stack." (Prints in Depth-First/Reverse order).
2.  "I will use In-Order traversal." (Prints Left-Root-Right, not Level).
3.  "I will use an array indices `2i+1`." (Only works for Complete trees/Heaps).
4.  "I will recurse left then recurse right." (That's Pre-Order).
5.  "I will print the root, then `root.left`, then `root.right`." (This works for the top 3 nodes, but fails to print the cousins correctly on lower levels).
6.  "I will use a Priority Queue." (Sorts by value, not by level).
7.  "I will use a Hash Map keyed by depth." (Valid but overly complex compared to Queue).
8.  "I will iterate through the nodes." (How?).
9.  "I will flatten the tree to a list." (Requires BFS to do so).
10. "I will print as I delete nodes." (Destructive).
11. "I will use binary search." (No).
12. "I will queue the root, then dequeue it, then stop." (Loop logic missing).

**✅ 3 Correctly Worded Answers:**

1.  "I will use a **Queue**. Enqueue `root`. While Queue is not empty: `curr = queue.dequeue()`. Print `curr.data`. If `curr.left` exists, enqueue it. If `curr.right` exists, enqueue it."
2.  "I implement a standard Breadth-First Search. I start a Queue with the root. In a loop, I process the node at the front of the queue by printing it and adding its children to the back of the queue. This preserves the level order."
3.  "I use a Queue. To separate lines for each level, I track the `levelSize` at the start of each loop iteration. I dequeue `levelSize` nodes, printing them on one line, and enqueueing their children. Then I print a newline."

**💡 Explanation:**
Queue = FIFO = Level Order. Stack = LIFO = Depth Order.

---

## Q20: The "Mirror" Archetype (Palindrome)

**Question:** "Sketch an algorithm to check if an **Array** of integers is a **palindrome** (reads same forwards and backwards)."

**⚠️ The Tricky Part:**
Indexing. You need two pointers moving inwards. The loop condition is `start < end`. If you go `start <= length`, you cross over and do double work (or crash).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will use two loops." (O(N^2) unnecessary).
2.  "I will reverse the array and compare `A == B`." (O(N) space, inefficient).
3.  "I will use a Stack to reverse it." (O(N) space).
4.  "I will check `array[i] == array[i+1]`." (Checks neighbors, not mirror image).
5.  "I will loop from 0 to N and check `array[i] == array[N-i]`." (Off-by-one error: needs `N-1-i`).
6.  "I will hash the array." (Order lost).
7.  "I will split the array and swap halves." (Modifies array, complex).
8.  "I will use recursion without pointers." (Hard to track indices).
9.  "I will use a Queue." (FIFO doesn't help with reverse comparison).
10. "I will check if the first and last elements are equal." (Only checks ends, not middle).
11. "I will loop until `start == end`." (Fails on even-length arrays where they never equal, they cross. Must use `<`).
12. "I will return true if `length % 2 == 0`." (Even length doesn't mean palindrome).

**✅ 3 Correctly Worded Answers:**

1.  "I initialize two pointers: `start = 0` and `end = length-1`. I loop while `start < end`. If `array[start] != array[end]`, return False. Else, increment `start`, decrement `end`. If loop finishes, return True."
2.  "I iterate from the outside in. I compare the element at index `i` with the element at `len-1-i`. I only need to iterate up to `len/2`. Any mismatch returns False."
3.  "I use a Two-Pointer approach. One pointer at the head, one at the tail. I check for equality and move them towards the center. This is O(N) time and O(1) space."

**💡 Explanation:**
The Two-Pointer technique is the standard efficient solution for array symmetry.

---

## Q21: The "Cleaner" Archetype (Remove Duplicates)

**Question:** "Sketch an algorithm to **remove duplicates** from an **Unsorted Singly Linked List**."

**⚠️ The Tricky Part:**
Since it is unsorted, you cannot just check `curr` vs `curr.next`. You need a **Hash Set** to track seen values. When deleting, you must link `prev.next` to `curr.next`. _Edge Case:_ Deleting the tail or consecutive duplicates.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will check if `curr.value == curr.next.value`." (Only works for _Sorted_ lists).
2.  "I will use two loops to compare every node." (O(N^2), while Hash Set is O(N)).
3.  "I will delete the node by setting `curr = null`." (Doesn't link the list; breaks the chain).
4.  "I will sort the list first." (Changing the order might not be allowed).
5.  "I will use an array to count frequencies." (Fails if values are negative or huge).
6.  "I will traverse backwards to find duplicates." (Singly list cannot traverse backwards).
7.  "I will use a Stack." (Stack doesn't help with existence checks).
8.  "I will skip the node using `curr = curr.next`." (You moved your pointer, but didn't update the `prev.next` link, so the node remains in the list).
9.  "I will use recursion to delete." (Complex and stack-heavy).
10. "I will use a Queue." (Inefficient).
11. "I will compare the head with the tail." (Insufficient).
12. "I will create a new list and add _all_ nodes." (Doesn't filter duplicates).

**✅ 3 Correctly Worded Answers:**

1.  "I will use a **Hash Set** to store seen values. I traverse the list with `prev` and `curr` pointers. If `curr.value` is in the Set, I delete it by setting `prev.next = curr.next`. If not, I add it to the Set and move `prev` forward. `curr` moves forward every step."
2.  "I initialize an empty Set. I iterate through the Linked List. For each node, I check membership in the Set. If it's a duplicate, I perform a standard deletion by relinking the previous node to the next node. Otherwise, I register the value in the Set."
3.  "I maintain a `previous` pointer. As I scan the list, I query a Hash Set. If the current value is new, I add it and update `previous`. If it's a repeat, I skip the current node using `previous.next`, effectively removing it."

**💡 Explanation:**
Trading Space O(N) for Time O(N). Without the Set, it's O(N^2).

---

## Q22: The "Successor" Archetype (BST Logic)

**Question:** "Sketch an algorithm to find the **In-Order Successor** of a given node `N` in a **Binary Search Tree**."

**⚠️ The Tricky Part:**
There are two cases:

1.  Node `N` has a right child $\to$ Successor is the _left-most_ node of the right subtree.
2.  Node `N` has NO right child $\to$ Successor is the first _ancestor_ where `N` is in the left subtree. (Or you traverse from root).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "The successor is `node.right`." (Only if `right` has no left children).
2.  "The successor is `node.left`." (That's the predecessor).
3.  "I will just look at the parent." (Parent could be smaller or larger).
4.  "I will search for `node.value + 1`." (The next value isn't always +1).
5.  "I will traverse the whole tree and sort it." (O(N), but can be done in O(H)).
6.  "I will use Level-Order traversal." (Irrelevant).
7.  "I will return the root." (Unlikely).
8.  "I will use a Stack." (Only needed for full traversal, not finding one successor).
9.  "If it has no right child, it has no successor." (Wrong, the parent could be the successor).
10. "I will check the left child of the right child." (What if that is null?).
11. "I will use recursion to find the max value." (Successor is the _next_ value, not max).
12. "I will compare with `root` and go down." (Standard search doesn't inherently find successor without tracking parents).

**✅ 3 Correctly Worded Answers:**

1.  "Case 1: If `N` has a right child, I go to the right child, then traverse strictly **left** until I hit null. That node is the successor.
    Case 2: If `N` has no right child, I start from the **root** and traverse down. I keep a variable `successor`. If `root.val > N.val`, I update `successor = root` and go left. If `root.val < N.val`, I go right. Return `successor`."
2.  "I check for a right subtree. If present, the minimum value in that subtree is the answer. If not, I utilize the property that the successor is the lowest ancestor for which the given node falls in the left subtree."
3.  "If right child exists: `goRight()`, then `goLeftUntilNull()`. If not: Walk down from root. Every time I go _left_, I save the current node as a potential candidate. The last saved candidate is the successor."

**💡 Explanation:**
Visualizing the tree structure is key. Successor = Next largest value.

---

## Q23: The "Demoter" Archetype (Heap Deletion)

**Question:** "Sketch the algorithm for **deleting the root** (Extract-Max) from a **Max-Heap** implemented as an array."

**⚠️ The Tricky Part:**
You cannot just delete the root and shift everything (array shift is slow O(N) and breaks heap shape). You must **Swap Root with Last Element**, delete the last, and then **Bubble Down (Heapify)** the new root.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I remove the root and move the second element to the top." (Which second element? Left or Right? Breaks shape).
2.  "I remove the root and shift the array left by 1." (Destroys the tree structure completely).
3.  "I swap the root with the left child." (Only one step; need to bubble all the way down).
4.  "I delete the last element." (That's `pop`, not `extractMax`).
5.  "I search for the max element." (Root is already max).
6.  "I sort the array." (O(N log N) is too slow for heap ops).
7.  "I swap root with a random leaf." (Must be the _last_ leaf to preserve Complete Tree property).
8.  "I recursively delete children." (Complex and wrong).
9.  "I bubble up the root." (Root is at top; can only bubble down).
10. "I insert the new root at the correct spot." (How? You need to swap path).
11. "I use a second heap." (Inefficient).
12. "I return the root and do nothing else." (Heap is now corrupt).

**✅ 3 Correctly Worded Answers:**

1.  "First, I save the value at `array[0]` to return later. Then, I take the **last** element in the array (`array[size-1]`) and move it to `array[0]`. I decrement the size. Finally, I perform **'Bubble Down'**: compare the new root with its children, swap with the larger child, and repeat until the heap property is restored."
2.  "I replace the root with the last leaf node to maintain the 'Complete Tree' structure. Then, I check the new root against its children. If a child is larger, I swap. I continue this process down the tree until the node dominates its children or becomes a leaf."
3.  "I overwrite the root with the tail element. Then I 'sink' this element. I calculate indices of Left (`2i+1`) and Right (`2i+2`) children. I swap with the max of the two children if the parent is smaller. Repeat recursively."

**💡 Explanation:**
Heaps must remain "Complete" (no gaps). Swapping with the last element preserves this. Bubble down fixes the order.

---

## Q24: The "Sorter" Archetype (Recursive Stack)

**Question:** "Sketch an algorithm to **sort** a **Stack** using only recursion (and the stack itself, no auxiliary data structures like arrays)."

**⚠️ The Tricky Part:**
This is a classic "hard" recursion problem. You need two recursive functions: `sort()` and `sortedInsert()`. `sort` empties the stack. `sortedInsert` puts items back in the right order.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will use an array, sort it, and push back." (Question forbids auxiliary structures).
2.  "I will use Bubble Sort on the stack." (Cannot swap random elements in a stack).
3.  "I will pop everything, find the min, and push it." (Where do you store the others?).
4.  "I will use a second stack." (Question implies _only_ recursion/call stack).
5.  "I will swap the top two elements until sorted." (Only sorts top, not deep).
6.  "I will use a Priority Queue." (Violation).
7.  "I will assume the stack is sorted." (No).
8.  "I will pop elements and push them in sorted order." (How? You can only push to top).
9.  "I will use QuickSort." (Requires random access index).
10. "I will reverse the stack." (Reverse != Sort).
11. "I will use `Stack.sort()`." (Library function).
12. "I will print them in sorted order." (Task is to sort the structure, not print).

**✅ 3 Correctly Worded Answers:**

1.  "I define `sort(stack)`: If not empty, `pop` element `x`, recursively call `sort(stack)`, then call `sortedInsert(stack, x)`.
    I define `sortedInsert(stack, x)`: If stack empty or `top < x`, push `x`. Else, `pop` `temp`, recurse `sortedInsert(stack, x)`, then push `temp` back."
2.  "I rely on the Call Stack. I strip the stack naked recursively holding values in the function frames. As the recursion unwinds, I re-insert each value into the stack, but I use a helper function to ensure each value is placed deeply enough to maintain order."
3.  "I use recursion to hold all values. Base case: Stack empty. Recursive step: Pop item, Sort remaining stack. Then, insert the popped item into the sorted stack at its correct position (which requires a second recursive lookup)."

**💡 Explanation:**
This leverages the **Call Stack** as the "temporary storage" you aren't allowed to allocate explicitly.

---

## Q25: The "Mathematician" Archetype (Sum 1..N)

**Question:** "You are given an array containing `N-1` distinct numbers taken from the range `1` to `N`. Sketch an algorithm to find the **missing number**."

**⚠️ The Tricky Part:**
The naive way is sorting ($N \log N$) or Hash Set ($O(N)$ space). The _optimal_ way is Math: Sum of $1..N$ minus Sum of Array = Missing Number. $O(N)$ Time, $O(1)$ Space.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will sort the array and check for gaps." (Too slow $N \log N$).
2.  "I will use a boolean array of size N." (O(N) space, not optimal).
3.  "I will check if 1 exists, then 2, then 3..." (O(N^2) nested loop).
4.  "I will look for the number that isn't there." (Vague).
5.  "I will traverse and see which index is empty." (Indices match counts, not values).
6.  "I will use a Hash Map." (O(N) space).
7.  "I will use Binary Search." (Array is not sorted).
8.  "I will check if the last number is N." (Missing number could be anywhere).
9.  "I will add 1 to every element." (No).
10. "I will subtract the first from the last." (No logic).
11. "I will assume the array is `[1, 2, 3...]`." (It's not sorted).
12. "I will check for duplicates." (Question says distinct).

**✅ 3 Correctly Worded Answers:**

1.  "I calculate the **Expected Sum** of integers 1 to N using the formula `N*(N+1)/2`. Then, I iterate through the array to calculate the **Actual Sum**. The difference `Expected - Actual` is the missing number."
2.  "I initialize `sum = 0`. I loop through the array adding values to `sum`. I also compute the mathematical sum of the range 1 to N. Subtracting my calculated array sum from the mathematical sum reveals the missing value in O(N) time and O(1) space."
3.  "Alternatively, I can use **XOR**. I XOR all numbers from 1 to N. Then I XOR that result with all elements in the array. The property `A^A=0` means all duplicates cancel out, leaving only the missing number." (Advanced/Bonus answer).

**💡 Explanation:**
Gauss's formula `N(N+1)/2` is the key here. It turns a search problem into a math problem.

---

## Q26: The "Navigator" Archetype (Path Existence)

**Question:** "Sketch an algorithm to determine if there is a **valid path** from Vertex A to Vertex B in a **Directed Graph**."

**⚠️ The Tricky Part:**
Cycles. If you don't track `visited` nodes, you will loop forever. You can use BFS or DFS.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will iterate the adjacency matrix rows." (Doesn't follow paths).
2.  "I will check if A is connected to B directly." (Finds edges, not paths).
3.  "I will use DFS without a visited set." (Infinite loop).
4.  "I will calculate the shortest path." (Question asks _if_ path exists, not length. BFS is fine, Dijkstra is overkill).
5.  "I will reverse the graph." (Irrelevant).
6.  "I will check if they are in the same component." (Valid for Undirected, but for Directed, A->B doesn't mean B->A).
7.  "I will assume it's a tree." (Unsafe).
8.  "I will check if `A.next == B`." (Graphs aren't lists).
9.  "I will sort the edges." (No).
10. "I will use recursion with a base case." (What base case? Must check visited).
11. "I will use Union-Find." (Only works for Undirected connectivity).
12. "I will check the degree of the nodes." (Degree doesn't imply connectivity).

**✅ 3 Correctly Worded Answers:**

1.  "I will use **BFS** (Queue) or **DFS** (Stack). I initialize a `Visited` set. Enqueue `A` and mark it visited. While queue not empty: Dequeue `curr`. If `curr == B`, return True. Else, for each neighbor of `curr`, if not visited, Enqueue and mark visited. If queue empties, return False."
2.  "I maintain a Set of visited vertices to prevent cycles. Starting at A, I perform a traversal. If I encounter B during the traversal, I immediately return True. If the traversal finishes without seeing B, I return False."
3.  "I use a standard Graph Traversal. I start at the Source. I explore all adjacent neighbors recursively (DFS). I flag every node I enter. If I step onto the Destination node, I propagate a 'True' signal back up the chain."

**💡 Explanation:**
Standard Reachability = BFS/DFS + Visited Set.

---

## Q27: The "Transformer" Archetype (Doubly to Circular)

**Question:** "Sketch an algorithm to convert a **Doubly Linked List** into a **Circular Doubly Linked List**."

**⚠️ The Tricky Part:**
You must connect the ends. `Head.prev` must point to `Tail`. `Tail.next` must point to `Head`.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will set `tail.next = head`." (That makes it Circular Singly. You forgot `head.prev`).
2.  "I will set `head.prev = tail`." (You forgot `tail.next`).
3.  "I will create a new circular list and copy nodes." (Inefficient space).
4.  "I will use a loop to connect them." (No loop needed, just pointer ops).
5.  "I will traverse to find the middle." (Irrelevant).
6.  "I will set `head = tail`." (Collapses the list).
7.  "I will delete the null pointers." (Metaphorical, not algorithmic).
8.  "I will swap head and tail." (No).
9.  "I will use a sentinel node." (Unnecessary).
10. "I will assume it's already circular." (Dangerous).
11. "I will set `node.next = node`." (Self-loop).
12. "I will use recursion." (Overkill).

**✅ 3 Correctly Worded Answers:**

1.  "I take the `head` and `tail` pointers. I set `tail.next = head` (closing the forward loop). I set `head.prev = tail` (closing the backward loop). I return the `head`. Complexity O(1)."
2.  "I eliminate the null terminations. The last node's 'Next' pointer is updated to point to the first node. The first node's 'Previous' pointer is updated to point to the last node. This creates a bidirectional ring."
3.  "If the list is empty, return. If not, I bridge the gap: Link Tail to Head, Link Head to Tail. The list is now circular."

**💡 Explanation:**
Doubly Linked requires **two** connections to be circular.

---

## Q28: The "Surveyor" Archetype (Circular Count)

**Question:** "Sketch an algorithm to **count the number of nodes** in a **Circular Linked List**."

**⚠️ The Tricky Part:**
The loop condition. `while(curr != null)` is an infinite loop. You must stop when `curr == head`.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I loop until `curr == null`." (Infinite loop).
2.  "I loop until `curr.next == null`." (Infinite loop).
3.  "I count for 100 iterations." (Inaccurate).
4.  "I use a Hash Set to count unique nodes." (Works, but O(N) space is inefficient).
5.  "I start at head and loop. `count++`." (Infinite loop if no break condition).
6.  "I check if `head == tail`." (Circular lists technically don't have a distinct tail pointer in the same way).
7.  "I use recursion." (Stack overflow on large lists).
8.  "I break the circle then count." (Destructive).
9.  "I return `list.size`." (Field access not an algorithm).
10. "I use two pointers." (Unnecessary).
11. "I assume size is stored in head." (Safe assumption only if specified).
12. "I count until `curr.value` repeats." (Values can be duplicates; must check pointers).

**✅ 3 Correctly Worded Answers:**

1.  "I handle the empty case (return 0). Else, I initialize `count = 1` and `curr = head.next`. I loop while `curr != head`. Inside, `count++` and `curr = curr.next`. Return `count`."
2.  "I mark the starting point (`head`). I traverse the list, incrementing a counter for each step. I stop the traversal exactly when my pointer lands back on the `head` reference."
3.  "I initialize `temp = head`. Do-While loop: move `temp` forward, increment count. Condition: `while temp != head`. This ensures I count the list exactly once."

**💡 Explanation:**
In circular lists, null doesn't exist. The stop condition is "Have I arrived home?"

---

## Q29: The "Reverser" Archetype (String Stack)

**Question:** "Sketch an algorithm to **reverse a string** using a **Stack**."

**⚠️ The Tricky Part:**
Strings are often immutable (in Java/Python). You need to build a new string or char array. Logic: Push all chars, Pop all chars.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I push the string, then pop the string." (Pushing the whole string object doesn't reverse characters).
2.  "I use a Queue." (Queue preserves order, doesn't reverse).
3.  "I swap the first and last characters." (Two-pointer approach, valid but doesn't use Stack as requested).
4.  "I use recursion." (Uses Call Stack, but question implies explicit Stack).
5.  "I push half the string." (Partial reverse).
6.  "I use an array." (Not a Stack).
7.  "I traverse backwards." (Valid, but doesn't use Stack).
8.  "I push chars, then peek." (Peek doesn't remove/iterate).
9.  "I push words, not chars." (Reverses word order, not string).
10. "I use `string.reverse()`." (Library function).
11. "I pop before pushing." (Crash).
12. "I use two stacks." (Redundant).

**✅ 3 Correctly Worded Answers:**

1.  "I create an empty Stack. I iterate over the string, pushing each **character** onto the Stack. Then, I create a StringBuilder (or char array). While Stack is not empty, I `pop` the character and append it to the builder. Return the built string."
2.  "I exploit the LIFO property. First pass: read string left-to-right, pushing characters. Second pass: pop characters (which come out right-to-left) and construct the new string."
3.  "I transfer the string data into a Stack. Since the last character entered is the first one retrieved, simply emptying the Stack into a new buffer produces the reversed string."

**💡 Explanation:**
Stack = LIFO = Reversal Machine.

---

## Q30: The "Searcher" Archetype (Rotated Array)

**Question:** "Sketch an algorithm to find the **minimum element** in a **Sorted Array that has been Rotated** (e.g., `[4, 5, 1, 2, 3]`)."

**⚠️ The Tricky Part:**
You want $O(\log N)$. Linear scan $O(N)$ is trivial but misses the point. Modified Binary Search is needed. If `mid > right`, the dip is to the right. If `mid < right`, the dip is to the left (or current).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will iterate and find the min." (O(N) - not optimal).
2.  "I will sort the array." (O(N log N) - destroys rotation property).
3.  "I will use standard Binary Search looking for 0." (You don't know the value).
4.  "I will check if `arr[0] < arr[last]`." (Only tells you if it's rotated).
5.  "I will split the array in half and check mins recursively." (O(N)).
6.  "I will use a Hash Set." (O(N)).
7.  "I will compare `mid` with `left`." (Less reliable than comparing with `right`).
8.  "I will stop when `mid == target`." (No target).
9.  "I will use a Stack." (Irrelevant).
10. "I will swap elements back to sorted." (O(N)).
11. "I will return `arr[0]`." (Wrong).
12. "I will check neighbors of mid only." (Not enough context).

**✅ 3 Correctly Worded Answers:**

1.  "I use **Binary Search**. `Lo=0`, `Hi=len-1`. Loop while `Lo < Hi`. `Mid = (Lo+Hi)/2`. If `arr[mid] > arr[Hi]`, the min is in the **right** half (`Lo = Mid + 1`). Else, min is in **left** half or is mid (`Hi = Mid`). Return `arr[Lo]`."
2.  "I perform a logarithmic search. I compare the middle element to the right-most element. If the middle is larger, the 'reset point' (minimum) must be to the right. Otherwise, it's to the left. I narrow the range until one element remains."
3.  "I detect the inflection point using Binary Search. The inflection point is the only place where `Element(i) > Element(i+1)`. I adjust my bounds to hone in on this drop."

**💡 Explanation:**
The "cliff" where the numbers drop is the minimum. Binary Search finds this cliff.

---

---

## Q31: The "Mirror" Archetype (Tree Inversion)

**Question:** "Sketch an algorithm to **invert** (mirror) a **Binary Tree**."

**⚠️ The Tricky Part:**
You must swap the children of _every_ node. A common mistake is only swapping the root's children and stopping. You need a recursive traversal (Post-Order or Pre-Order) or iterative BFS/DFS.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will swap the root's left and right children." (Only inverts the top level).
2.  "I will traverse In-Order and swap." (Swapping a child after visiting it might cause it to be visited again or skipped).
3.  "I will swap nodes with same values." (Nonsense).
4.  "I will create a new tree and insert nodes in reverse order." (Complex and inefficient).
5.  "I will use a Stack to reverse the node values." (Structure needs reversing, not just values).
6.  "I will rotate the tree left." (Rotation is for balancing, not inverting).
7.  "I will sort the tree descending." (BSTs are sorted; generic trees aren't).
8.  "I will swap leaf nodes only." (Internal nodes need swapping too).
9.  "I will change the pointers to point up." (That makes a parent pointer tree).
10. "I will mirror the array representation." (Only works if the tree is complete/Heap).
11. "I will swap left.left with right.right." (Too specific, misses other cousins).
12. "I will use binary search." (No).

**✅ 3 Correctly Worded Answers:**

1.  "I use **Recursion**. Base case: if node is null, return. Recursive step: `invert(node.left)`, `invert(node.right)`. Then, perform the swap: `temp = node.left`, `node.left = node.right`, `node.right = temp`."
2.  "I use **Iterative BFS** (Queue). Enqueue root. While queue not empty: Dequeue node. Swap its left and right pointers. If left exists, enqueue it. If right exists, enqueue it. Return root."
3.  "I perform a recursive Post-Order traversal. I visit the left child, then the right child. Once the recursion returns, I swap the left and right pointers of the current node. This propagates the inversion from bottom to top."

**💡 Explanation:**
Swapping children at every node creates the mirror image.

---

## Q32: The "Encoder" Archetype (Serialization)

**Question:** "Sketch an algorithm to **serialize** a Binary Tree into a **String**."

**⚠️ The Tricky Part:**
You must record the `null` pointers (e.g., using `#` or `null`). If you don't save nulls, you cannot reconstruct the unique tree later (e.g., distinguishing a left-skewed tree from a right-skewed one).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will perform In-Order traversal and save values." (In-Order is ambiguous for structure reconstruction).
2.  "I will save just the values in a list." (Loses structure).
3.  "I will save root, then leaves." (Middle nodes lost).
4.  "I will use a Hash Map." (Overkill).
5.  "I will save the height and width." (Insufficient).
6.  "I will convert it to a Heap array." (Only works if tree is Complete).
7.  "I will save `node.value` string." (What about connections?).
8.  "I will ignore null nodes." (Crucial mistake: cannot reconstruct without null markers).
9.  "I will use BFS but skip nulls." (Same mistake).
10. "I will save parent pointers." (Complicated).
11. "I will print the tree." (Visual print != Serialization).
12. "I will sort the values." (Destroys tree structure).

**✅ 3 Correctly Worded Answers:**

1.  "I use **Pre-Order Traversal** (DFS). If node is null, append `#` to string. Else, append `node.val` + `,`. Then recurse left, then recurse right. The string captures the structure uniquely."
2.  "I use **Level-Order Traversal** (Queue). I enqueue the root. When I dequeue a node, if it is null, I append `null`. If it is real, I append its value and enqueue its children (even if they are null). This creates an array-like representation."
3.  "I build a string recursively. I define the structure as `Root(Left,Right)`. If a child is missing, I write `()`. This recursive bracket notation preserves the hierarchy."

**💡 Explanation:**
Pre-order with Null Markers is the standard efficient way.

---

## Q33: The "Shifter" Archetype (Zero Mover)

**Question:** "Sketch an algorithm to move all **zeros** in an integer array to the **end**, while maintaining the relative order of non-zero elements."

**⚠️ The Tricky Part:**
You must do this **in-place** ($O(1)$ space) to get full marks. Creating a new array is too easy ($O(N)$ space). Use the "Snowball" or "Writer Index" technique.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will sort the array." (Zeros move to front/end, but non-zeros lose order).
2.  "I will create a new array, copy non-zeros, then fill zeros." (O(N) space, suboptimal).
3.  "I will loop and swap zeros with the last element." (Breaks relative order of non-zeros).
4.  "I will delete zeros." (Array size changes, slow).
5.  "I will use a Stack for non-zeros." (O(N) space).
6.  "I will use Bubble Sort logic." (O(N^2) slow).
7.  "I will count zeros and restart the array." (Requires overwriting, doesn't shift).
8.  "I will search for 0 and shift the whole array left." (O(N^2) shift).
9.  "I will use two pointers at start and end." (Unstable).
10. "I will use recursion." (Stack depth O(N)).
11. "I will replace zeros with -1." (Data corruption).
12. "I will rotate the array." (Wrong operation).

**✅ 3 Correctly Worded Answers:**

1.  "I use a **`writeIndex`** initialized to 0. I loop through the array. If `array[i] != 0`, I set `array[writeIndex] = array[i]` and increment `writeIndex`. After the loop, I fill indices from `writeIndex` to end with `0`."
2.  "I maintain a pointer for the 'Last Non-Zero Found'. I iterate through the array. When I find a non-zero, I swap it with the element at the 'Last Non-Zero' pointer and advance that pointer. This bubbles non-zeros to the front and zeros to the back."
3.  "I treat the array as a queue. I iterate through. If I see a non-zero, I move it to the first available 'slot' (tracked by a counter). I don't care what happens to the zeros initially. Finally, I overwrite the remaining tail slots with 0."

**💡 Explanation:**
Shift non-zeros left. Fill rest with zeros.

---

## Q34: The "Detective II" Archetype (Anagrams)

**Question:** "Sketch an algorithm to check if two Strings are **valid anagrams** of each other."

**⚠️ The Tricky Part:**
Strings might contain unicode. Sorting is $O(N \log N)$. Frequency Map (Hash Table) or Fixed Array (for ASCII) is $O(N)$.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will sort both strings and compare." (Valid, but strictly speaking O(N log N) is worse than O(N)).
2.  "I will check if they have the same length." (Necessary but insufficient).
3.  "I will check if they contain the same characters." (Fails on counts: `AAB` vs `ABB`).
4.  "I will sum the ASCII values." (Collision: `AD` (1+4=5) vs `BC` (2+3=5)).
5.  "I will multiply the ASCII values." (Collision risk low but possible).
6.  "I will use a Set." (Sets remove duplicates, so `Hello` == `Helo`).
7.  "I will iterate nested loops." (O(N^2)).
8.  "I will reverse one string." (That's Palindrome, not Anagram).
9.  "I will remove chars from String B as I find them in String A." (String manipulation is expensive O(N^2)).
10. "I will use recursion." (Unnecessary).
11. "I will check first and last chars." (No).
12. "I will use a Stack." (Order matters in stack, not in anagrams).

**✅ 3 Correctly Worded Answers:**

1.  "I use a **Frequency Map** (or integer array size 26). I iterate String A, incrementing counts for each char. I iterate String B, decrementing counts. Finally, I check if all counts are zero. If yes, True."
2.  "I create two Hash Maps. I populate them with character frequencies from String A and String B respectively. I then compare if `MapA.equals(MapB)`. Return the result."
3.  "I verify lengths match. Then I sort both strings alphabetically. I iterate through the sorted arrays comparing index `i`. If any mismatch found, return False. Else True." (Sorting is acceptable if explicitly stated as the strategy).

**💡 Explanation:**
Anagrams = Permutations. Character counts must match exactly.

---

## Q35: The "Combiner" Archetype (List Intersection)

**Question:** "Sketch an algorithm to find the node where two **Singly Linked Lists intersect** (merge)."

**⚠️ The Tricky Part:**
The lists might have different lengths. If you just iterate, pointers won't align.
Trick: Calculate lengths `L1` and `L2`. Advance the pointer of the longer list by `|L1 - L2|`. Then move both forward until they meet.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will iterate both lists until values match." (Values can be duplicate, must check reference/pointer).
2.  "I will use a hash map for values." (Duplicate values break this).
3.  "I will check if tails are different." (If tails different, no intersection. If same, intersection exists, but where?).
4.  "I will iterate `i` and `j`." (O(N^2) if nested).
5.  "I will reverse both lists." (Modifies structure, complex to fix).
6.  "I will traverse one list, then the other." (Doesn't find merge point).
7.  "I will compare heads." (Intersection is usually deep).
8.  "I will use a Stack." (Actually valid! Push both to stacks, pop until divergence. But space O(N)).
9.  "I will assume same length." (Unsafe).
10. "I will use recursion." (Stack overflow).
11. "I will add lists values together." (No).
12. "I will use Tortoise and Hare." (That's for cycles).

**✅ 3 Correctly Worded Answers:**

1.  "I calculate the **length** of List A and List B. I calculate the difference `d`. I advance the pointer of the longer list by `d` steps. Now both pointers are equidistant from the end. I move both forward until `ptrA == ptrB`. Return that node."
2.  "I traverse List A and insert all nodes (references) into a **Hash Set**. Then I traverse List B. The first node from B that already exists in the Set is the intersection point." (O(N) Space).
3.  "I use the **Two Pointer Switch** trick. Pointers `pA` and `pB`. Traverse. When `pA` reaches end, redirect it to Head B. When `pB` reaches end, redirect to Head A. They will meet at the intersection after 1 extra pass." (Clever O(1) space solution).

**💡 Explanation:**
Geometric alignment is key. Equalize the starting line.

---

## Q36: The "Cloner" Archetype (Graph Copy)

**Question:** "Sketch an algorithm to **Deep Clone** a Graph (given a starting node)."

**⚠️ The Tricky Part:**
You need to copy nodes AND edges. You need a **Hash Map** (`OldNode -> NewNode`) to track created clones and handle cycles (so you don't clone the same node infinitely).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will just return the reference to the start node." (Shallow copy).
2.  "I will iterate and create new nodes." (Fails to link edges correctly).
3.  "I will use BFS but no map." (Will create duplicate clones for nodes visited twice).
4.  "I will use recursion without visited set." (Infinite loop on cycles).
5.  "I will copy the adjacency matrix." (Valid only if matrix provided).
6.  "I will serialize and deserialize." (Technically works, but lazy answer).
7.  "I will create a new graph object." (Empty graph).
8.  "I will copy values only." (Lost structure).
9.  "I will use Dijkstra." (Not a path problem).
10. "I will assume it is a tree." (Graph implies cycles possible).
11. "I will use an array." (Graph nodes aren't indexed 0..N necessarily).
12. "I will clone neighbors first." (Chicken-egg problem).

**✅ 3 Correctly Worded Answers:**

1.  "I use **BFS** with a Queue and a **Hash Map** mapping `Original -> Clone`. Enqueue start. Create clone, put in Map. While queue not empty: Dequeue `u`. For each neighbor `v`: If `v` not in Map, clone it, map it, enqueue it. Link `Map[u].neighbors.add(Map[v])`."
2.  "I use **DFS** (Recursion). Function `clone(node)`: If `node` is in Map, return `Map[node]`. Else, create `newNode`, add to Map. For each neighbor, `newNode.neighbors.add(clone(neighbor))`. Return `newNode`."
3.  "I traverse the graph. I maintain a registry (Map) of copied nodes. For every node I encounter, I check the registry. If it exists, I use the existing copy. If not, I mint a fresh copy and register it before processing its edges."

**💡 Explanation:**
Map is essential to map the "Old Universe" to the "New Universe" and handle cycles.

---

## Q37: The "Genealogist" Archetype (LCA)

**Question:** "Sketch an algorithm to find the **Lowest Common Ancestor (LCA)** of two nodes in a **Binary Search Tree**."

**⚠️ The Tricky Part:**
For BST, use the property: If both nodes < Root, LCA is in Left. If both > Root, LCA is in Right. If they split (one left, one right), Root is the LCA.
_Note:_ For generic Binary Tree, it's harder (requires bottom-up recursion).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will search for both nodes." (Doesn't find ancestor).
2.  "I will return the root." (Root is _an_ ancestor, but not always the _lowest_).
3.  "I will use BFS." (Hard to track ancestry).
4.  "I will store paths to both nodes and compare." (Valid O(N) space, but O(1) space is possible for BST).
5.  "I will use the parent pointers." (Assuming parent pointers exist is risky).
6.  "I will find the node with max value." (Irrelevant).
7.  "I will check if `left == right`." (No).
8.  "I will use Dijkstra." (No).
9.  "I will calculate depth." (Depth doesn't define ancestry).
10. "I will use In-Order traversal." (Sorted list loses hierarchy).
11. "I will start from leaves and go up." (Impossible without parent pointers).
12. "I will check `root.left` and `root.right`." (Too shallow).

**✅ 3 Correctly Worded Answers:**

1.  "Since it's a **BST**, I start at Root. I compare `p.val` and `q.val` with `root.val`. If both are smaller than root, I move `root = root.left`. If both are larger, `root = root.right`. If they split (one smaller, one larger) or one equals root, **this** root is the LCA. Return it."
2.  "I use Iteration. `curr = root`. While `curr` is not null: if `p` and `q` are both > `curr`, go right. If both < `curr`, go left. Else, break and return `curr`. This works because the LCA is the split point."
3.  "I use Recursion. If `root.val` > max(p, q), return `LCA(root.left)`. If `root.val` < min(p, q), return `LCA(root.right)`. Otherwise, we found the split point, return `root`."

**💡 Explanation:**
BST property makes this $O(H)$ without extra memory.

---

## Q38: The "Surveyor II" Archetype (Tree Diameter)

**Question:** "Sketch an algorithm to find the **Diameter** (longest path between any two nodes) of a Binary Tree."

**⚠️ The Tricky Part:**
The longest path might **not** pass through the root! (It could be entirely in the left subtree). You need to calculate `Height` but update a global `MaxDiameter` at every node (`LeftHeight + RightHeight`).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will return `height(left) + height(right)`." (Assumes path goes through root).
2.  "I will find the two deepest leaves and measure distance." (Which leaves? Hard to coordinate).
3.  "I will use BFS to find width." (Width != Diameter).
4.  "I will sum all edges." (Total size, not path).
5.  "I will use Dijkstra from root." (Only finds height).
6.  "I will check left-most and right-most nodes." (Tree might be skewed).
7.  "I will simply calculate height." (Height is root-to-leaf).
8.  "I will traverse In-Order." (Topology lost).
9.  "I will use a matrix." (Overkill).
10. "I will modify the tree." (Bad).
11. "I will return `max(left, right) + 1`." (That's height).
12. "I will assume the tree is balanced." (Unsafe).

**✅ 3 Correctly Worded Answers:**

1.  "I define a recursive function `getHeight(node)`. It returns `1 + max(leftH, rightH)`. Inside this function, before returning, I update a global variable `maxDiameter = max(maxDiameter, leftH + rightH)`. This checks the path through _every_ node."
2.  "I use DFS. At every node, I compute the depth of the left and right branches. The potential diameter through _this_ node is `leftDepth + rightDepth`. I verify if this is the new maximum. Then I return the max depth to the parent."
3.  "I treat every node as a potential 'turning point' (anchor) of the path. I calculate the longest arms extending from each node. The maximum sum of two arms found anywhere in the tree is the diameter."

**💡 Explanation:**
You calculate Height, but you _observe_ Diameter as a side effect.

---

## Q39: The "Reflector" Archetype (Symmetric Tree)

**Question:** "Sketch an algorithm to check if a Binary Tree is **Symmetric** (a mirror of itself around the center)."

**⚠️ The Tricky Part:**
You need a helper function that takes **two** nodes (left child and right child) and compares them. `Left.Left` must match `Right.Right` (Outer), and `Left.Right` must match `Right.Left` (Inner).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will check if `root.left == root.right`." (Only checks immediate children).
2.  "I will check if left subtree is same as right subtree." (No, they must be _mirrors_, not clones).
3.  "I will use In-Order traversal and check palindrome." (Works for values, but structure might differ).
4.  "I will invert the left subtree and compare with right." (Valid, but modifying the tree is destructive/slow).
5.  "I will check if `left.key == right.key` recursively." (Must cross-check children `L.L vs R.R`).
6.  "I will use a Stack for one side." (Hard to coordinate).
7.  "I will count nodes on both sides." (Count != Structure).
8.  "I will check height balance." (Balanced != Symmetric).
9.  "I will assume it's a heap." (No).
10. "I will compare root with leaves." (No).
11. "I will use BFS queue." (Need special order to check symmetry).
12. "I will return False." (Lazy).

**✅ 3 Correctly Worded Answers:**

1.  "I define a helper `isMirror(node1, node2)`. If both null, True. If one null, False. If values differ, False. Else, return `isMirror(node1.left, node2.right)` AND `isMirror(node1.right, node2.left)`. Call this on `root.left` and `root.right`."
2.  "I use an Iterative approach with a Queue. I enqueue `root.left` and `root.right`. Loop: Dequeue `u` and `v`. Check equality. Enqueue `u.left, v.right` (Outers) and `u.right, v.left` (Inners). If mismatch, return False."
3.  "I verify symmetry by checking: 1. Roots match. 2. The left subtree is a mirror reflection of the right subtree. This requires recursive cross-comparison of children."

**💡 Explanation:**
Mirror logic: Outer matches Outer, Inner matches Inner.

---

## Q40: The "Flattener" Archetype (Tree to List)

**Question:** "Sketch an algorithm to **flatten** a Binary Tree into a **Linked List** in-place (following Pre-Order `Root-Left-Right`)."

**⚠️ The Tricky Part:**
You need to move the Left Subtree to the Right. But you must attach the _original_ Right Subtree to the _end_ of the new Right Subtree (formerly Left).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will create a new Linked List." (Question says in-place).
2.  "I will set `root.right = root.left`." (You lose the old right child).
3.  "I will use a Stack to print." (Printing != Flattening structure).
4.  "I will set `left = null`." (Must move it first).
5.  "I will traverse In-Order." (Flattening usually implies Pre-Order).
6.  "I will swap left and right." (Inversion, not flattening).
7.  "I will use a Queue." (Level order, wrong).
8.  "I will delete the tree." (No).
9.  "I will put all nodes in an array." (Not in-place).
10. "I will link `node.next`." (Tree nodes use Left/Right, not Next. Usually Right acts as Next).
11. "I will start from leaves." (Top-down is easier).
12. "I will use recursion without fixing pointers." (Does nothing).

**✅ 3 Correctly Worded Answers:**

1.  "I use Recursion. `flatten(root)`. 1. Flatten Left and Right subtrees. 2. Store `root.right` in `temp`. 3. Move `root.left` to `root.right`. 4. Set `root.left` to null. 5. Traverse to the _end_ of the new right list. 6. Attach `temp` to the end."
2.  "I use a Stack. Push Root. While stack not empty: Pop `curr`. If `curr.right` exists, push it. If `curr.left` exists, push it. Link `curr.right` to `stack.peek()` (the next node in Pre-Order). Set `curr.left` to null."
3.  "I iterate down the right spine. If a node has a left child, I find the right-most node of that left child (predecessor). I connect that predecessor to the current node's right child. Then I move the whole left subtree to the right." (Morris Traversal logic).

**💡 Explanation:**
This is pointer surgery on a tree. Left becomes Right. Old Right appends to end of New Right.

---

## Q41: The "Finder" Archetype (Kth Smallest in BST)

**Question:** "Sketch an algorithm to find the **Kth Smallest** element in a **Binary Search Tree**."

**⚠️ The Tricky Part:**
The naive approach collects _all_ nodes ($O(N)$ space/time). The optimal approach uses the property of BSTs: **In-Order Traversal** gives sorted values. You stop as soon as you visit the $K$-th node.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will use BFS and return the Kth element." (BFS is level-order, not sorted).
2.  "I will go Left K times." (Assumes a straight line left).
3.  "I will collect all nodes in an array and return `array[K-1]`." (Correct logic but $O(N)$ space is worse than $O(H)$ iterative stack).
4.  "I will use a Min-Heap." (BST is already sorted; Heapifying is wasteful).
5.  "I will use Pre-Order traversal." (Root comes first, but root is middle value).
6.  "I will search for value `K`." (K is the _rank_, not the value).
7.  "I will modify the tree to count children." (Valid optimization but destructive/complex).
8.  "I will start from the max and go backwards." (Kth _smallest_ is from min).
9.  "I will use recursion without a counter." (Stateless recursion can't track K).
10. "I will check `root.left.left...`." (No).
11. "I will return the Kth level." (Level != Rank).
12. "I will assume the tree is balanced." (BST might be a linked list).

**✅ 3 Correctly Worded Answers:**

1.  "I will use an **Iterative In-Order Traversal** with a Stack. I push nodes going left. Then, I pop a node and increment a counter. If `counter == K`, I return that node's value. Else, I go right."
2.  "I define a recursive function `inOrder(node)`. It traverses left first. I maintain a global counter. Every time I visit a node (after returning from left), I decrement K. When `K == 0`, I record the result and stop recursion."
3.  "I perform a simulation of sorted reading. I descend to the leftmost node (minimum). I then trace the 'next' successor path $K-1$ times. The node I land on is the answer."

**💡 Explanation:**
In-Order on BST = Sorted Stream. Just consume $K$ items from the stream.

---

## Q42: The "Inserter" Archetype (Sorted List)

**Question:** "Sketch an algorithm to **insert** a new node with value `V` into a **Sorted Singly Linked List** while maintaining sorted order."

**⚠️ The Tricky Part:**
Edge cases: Inserting at the **Head** (new min) or **Tail** (new max). You need to find the node where `curr.val < V < curr.next.val`.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will just append to the tail." (Breaks sort order).
2.  "I will sort the list after insertion." (O(N log N), inefficient).
3.  "I will swap values until it fits." (Complex value swapping vs simple pointer change).
4.  "I will check `curr.val == V`." (Duplicates handled? Doesn't find insertion spot).
5.  "I will start from the middle." (Cannot random access linked list).
6.  "I will use Binary Search." (Cannot binary search a linked list).
7.  "I will insert at head if `head > V` then stop." (Must handle middle/end cases too).
8.  "I will use `curr.prev`." (Singly list has no prev).
9.  "I will use a second list." (Space overhead).
10. "I will traverse until `curr > V`." (If you stop _at_ the larger node, you can't insert _before_ it without a `prev` pointer).
11. "I will insert it randomly." (No).
12. "I will check neighbors." (Vague).

**✅ 3 Correctly Worded Answers:**

1.  "I handle the Head case: If `head` is null or `head.val >= V`, I insert at start and update head. Else, I traverse with `curr`. I look ahead: while `curr.next` is not null and `curr.next.val < V`, I move forward. Then I insert `newNode` between `curr` and `curr.next`."
2.  "I maintain `prev` and `curr` pointers. I iterate until I find a node `curr` where `curr.val > V`. I insert `newNode` between `prev` and `curr`. If `prev` is null, I update head. If `curr` is null, I append to tail."
3.  "I scan the list to find the 'gap'. The gap is the first position where the next value exceeds `V`. I perform a standard pointer splice at that gap."

**💡 Explanation:**
Always look one step ahead (`curr.next`) in Singly Lists so you stop _before_ the insertion point.

---

## Q43: The "Filter" Archetype (Delete Evens)

**Question:** "Sketch an algorithm to **delete all even numbers** from a Singly Linked List."

**⚠️ The Tricky Part:**
Deleting the **Head** if it's even. Also, consecutive evens (e.g., `2 -> 4 -> 5`). If you delete `2`, your `curr` pointer might get messed up if not careful.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will verify if `curr % 2 == 0` and set `curr = null`." (Does not remove node from chain).
2.  "I will iterate and set `curr.next = curr.next.next`." (Only deletes the _next_ node, not current).
3.  "I will make a new list with odds." (O(N) space, better to do in-place).
4.  "I will traverse backwards." (Impossible).
5.  "I will assume head is odd." (Unsafe).
6.  "I will use `curr.prev`." (No prev).
7.  "I will delete the node and move `curr`." (If you delete `curr`, you can't access `curr.next` unless saved).
8.  "I will use a Stack." (Irrelevant).
9.  "I will replace values with 0." (Data corruption, not deletion).
10. "I will use recursion." (Stack depth risk).
11. "I will stop at the first even." (Must delete _all_).
12. "I will use two pointers but forget head update." (Fails if head is even).

**✅ 3 Correctly Worded Answers:**

1.  "First, I handle the Head: while `head` is not null and even, `head = head.next`. Then, I traverse with `curr`. While `curr.next` is not null: if `curr.next.val` is even, I bypass it (`curr.next = curr.next.next`). Else, I advance `curr`. Return head."
2.  "I use a 'Sentinel' or 'Dummy' node pointing to head. This simplifies edge cases. I traverse using `prev` (starts at dummy) and `curr` (starts at head). If `curr` is even, `prev.next = curr.next`. Else `prev = curr`. Move `curr` forward. Return `dummy.next`."
3.  "I iterate through the list. I aggressively prune 'next' nodes. If the upcoming node is even, I snip it out immediately and check the _new_ upcoming node (without advancing). Only when the upcoming node is odd do I step forward."

**💡 Explanation:**
The "Dummy Node" trick is the professional way to handle Head deletions gracefully.

---

## Q44: The "Rotator" Archetype (List Rotation)

**Question:** "Sketch an algorithm to **rotate** a Singly Linked List to the right by `K` places."

**⚠️ The Tricky Part:**

1. `K` can be larger than length `N` (use `K % N`).
2. Making it circular first, then breaking the circle at the new tail (`N - K - 1`) is the cleanest logic.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will move the tail to head `K` times." (O(N\*K) time, slow).
2.  "I will use an array." (O(N) space).
3.  "I will swap values." (Complex).
4.  "I will pointer arithmetic." (No random access).
5.  "I will reverse the list." (Reverse != Rotate).
6.  "I will start from the Kth node." (Need to move end to front).
7.  "I will use a Queue." (No).
8.  "I will ignore `K > N`." (Crash).
9.  "I will split the list and swap halves." (Correct logic, but tricky to find split point without counting).
10. "I will use recursion." (Hard).
11. "I will use Doubly list logic." (Singly list).
12. "I will return null." (Lazy).

**✅ 3 Correctly Worded Answers:**

1.  "I traverse to find the length `Len` and the `Tail`. I set `K = K % Len`. If `K==0` return head. I connect `Tail.next = Head` (forming a ring). Then I traverse `Len - K` steps from the connection. I set the new head, and break the ring (`newTail.next = null`)."
2.  "I visualize the list as a ring. I close the ring first. Then I shift my starting point (Head) forward by `Length - K` steps. I cut the ring just before this new Head."
3.  "I find the pivot point. The new tail is at index `Len - K - 1`. The new head is `newTail.next`. I set `oldTail.next = oldHead` and `newTail.next = null`. Return `newHead`."

**💡 Explanation:**
Ring method avoids edge case hell. Calculate length, Connect circle, Find break point, Cut.

---

## Q45: The "Pathfinder" Archetype (Binary Tree Paths)

**Question:** "Sketch an algorithm to return **all root-to-leaf paths** in a Binary Tree (as a list of strings `1->2->5`)."

**⚠️ The Tricky Part:**
Backtracking. You need to pass the "current path string" down the recursion. Or use a Stack of objects `(Node, PathSoFar)`.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will use BFS." (Hard to track history of path in BFS).
2.  "I will only print the path." (Question asks to _return list_).
3.  "I will use a global string." (Will mix up branches).
4.  "I will traverse In-Order." (Order doesn't construct paths).
5.  "I will use a single list and remove items." (Valid backtracking, but easy to mess up add/remove logic).
6.  "I will return the longest path." (Question asks for _all_).
7.  "I will store nodes in a Hash Map." (No order).
8.  "I will use a Queue." (State management is hard).
9.  "I will start from leaves." (Cannot go up).
10. "I will check for cycles." (Trees don't have cycles).
11. "I will use Dijkstra." (No).
12. "I will append `node` to string." (Need arrows `->`).

**✅ 3 Correctly Worded Answers:**

1.  "I use **DFS** (Recursion). The function takes a Node and a String `path`. I append `node.val` to `path`. If leaf, add `path` to result list. Else, recurse left with `path`, recurse right with `path`. Strings are immutable so backtracking is handled automatically."
2.  "I use an Iterative DFS with **two Stacks**. One for Nodes, one for `PathStrings`. When I push a child node, I also push `currentPath + "->" + child.val`. If I pop a leaf, I store the path string."
3.  "I build paths incrementally. As I descend, I construct the lineage of the node. When the descent hits a leaf node, I commit the current lineage to the final records."

**💡 Explanation:**
Immutable strings in recursion make this easy (each branch gets its own copy).

---

## Q46: The "Measurer" Archetype (N-ary Depth)

**Question:** "Sketch an algorithm to find the **max depth** of an **N-ary Tree** (each node has a list of children)."

**⚠️ The Tricky Part:**
It's not just `max(left, right)`. It's `max(all children)`. You need a loop.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will return `1 + children.size()`." (Degree != Depth).
2.  "I will check `child[0]` and `child[last]`." (Any child could be deep).
3.  "I will use binary tree logic." (Fails for >2 children).
4.  "I will use a Stack." (Need to track depths).
5.  "I will use BFS and return queue size." (Size is width, not depth).
6.  "I will count total nodes." (No).
7.  "I will assume children are sorted by height." (Unsafe).
8.  "I will use an array." (Irrelevant).
9.  "I will add 1 for every child." (Sums them).
10. "I will return 0." (No).
11. "I will delete nodes." (No).
12. "I will use In-Order." (N-ary trees don't have standard In-Order).

**✅ 3 Correctly Worded Answers:**

1.  "I use **Recursion**. Base case: if children list is empty, return 1 (or 0). Else, initialize `max = 0`. Loop through all children: `max = Math.max(max, depth(child))`. Return `max + 1`."
2.  "I use **BFS** to count levels. I use a Queue. I keep a `level` counter. At the start of the outer loop, I capture `size = queue.size()`. I process that many nodes (adding all their children). Increment level. Repeat."
3.  "I traverse the tree. For every node, I poll all its subtrees to find the deepest one. I take that maximum depth and add one for the current node."

**💡 Explanation:**
Generalized height formula: $1 + \max(\text{foreach child in children})$.

---

## Q47: The "Bipartite" Archetype (Graph Coloring)

**Question:** "Sketch an algorithm to check if an undirected Graph is **Bipartite** (can be colored with 2 colors such that no edge connects same colors)."

**⚠️ The Tricky Part:**
This is the "Odd Cycle" check. Use BFS. Color start Red. Neighbors must be Blue. If neighbor is already Red, False.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will check if the number of nodes is even." (Irrelevant).
2.  "I will check if it has cycles." (Even cycles are fine, only odd ones break it).
3.  "I will use DFS and check back-edges." (Harder logic than coloring).
4.  "I will check vertex degrees." (No).
5.  "I will count edges." (No).
6.  "I will use Dijkstra." (No).
7.  "I will use Union-Find." (Can detect cycles, but not parity easily).
8.  "I will color randomly." (Not deterministic).
9.  "I will split nodes into two sets randomly." (No).
10. "I will check if the graph is connected." (Disconnected graphs can be bipartite).
11. "I will assume it is a tree." (Trees are always bipartite, graphs not).
12. "I will use a Stack." (Need to track colors).

**✅ 3 Correctly Worded Answers:**

1.  "I use **BFS** with a `Colors` array (0=Uncolored, 1=Red, 2=Blue). Loop all nodes (to handle disconnected). If uncolored, queue it and color Red. While queue not empty: Dequeue `u`. For neighbor `v`: If uncolored, color it opposite of `u` and enqueue. If colored same as `u`, return False."
2.  "I simulate a 2-coloring process. I paint the starting node Black. I enforce that all neighbors must be White. I propagate this constraint. If I ever find a neighbor that is already painted the 'wrong' color, I conclude it's impossible (not Bipartite)."
3.  "I traverse the graph. I maintain two sets: Set A and Set B. For every edge `(u, v)`, if `u` is in A, `v` must be in B. If I find a conflict where both ends of an edge fall in Set A, it fails."

**💡 Explanation:**
Bipartite = No Odd Cycles. 2-Coloring BFS detects this.

---

## Q48: The "Median" Archetype (Data Stream)

**Question:** "Sketch an algorithm to efficiently find the **median** of a stream of integers."

**⚠️ The Tricky Part:**
Sorting every time is too slow. The pro solution uses **Two Heaps**: A Max-Heap (for the smaller half) and a Min-Heap (for the larger half).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will sort the array every time." (O(N log N) per insert).
2.  "I will use a Linked List and find middle." (Insertion O(N)).
3.  "I will use a BST." (Can work if augmented with counts, but standard BST is O(N) to find rank).
4.  "I will average the min and max." (That's mean range, not median).
5.  "I will use a Hash Map." (No order).
6.  "I will use a single Heap." (Access to root only, not median).
7.  "I will use a Queue." (FIFO).
8.  "I will use just an array." (O(N) insert).
9.  "I will randomly sample." (Approximate, not exact).
10. "I will swap elements." (No).
11. "I will use pointers." (No).
12. "I will use a Stack." (No).

**✅ 3 Correctly Worded Answers:**

1.  "I use **Two Heaps**: a `low` Max-Heap and a `high` Min-Heap. I balance them so their sizes differ by at most 1. New numbers go into `low`, then `low`'s max moves to `high` (to sort). If `high` is too big, move min back to `low`. Median is the top of the larger heap or average of both tops."
2.  "I maintain two halves of the dataset. The lower half is kept in a structure that gives me the maximum instantly. The upper half gives me the minimum instantly. The median sits at the boundary of these two structures."
3.  "I insert elements into a sorted structure (like two balanced heaps). I ensure the count of elements in both halves remains equal. The median is derived from the boundary elements."

**💡 Explanation:**
Two Heaps balance the center.

---

## Q49: The "Validator" Archetype (Valid Anagram)

_Note: We did this in Q34, so let's do "Valid Palindrome with Cleanup"._
**Question:** "Sketch an algorithm to check if a string is a **palindrome**, ignoring non-alphanumeric characters."

**⚠️ The Tricky Part:**
You must skip garbage characters without allocating a new string ($O(1)$ space). Use `while` loops _inside_ the main pointer loop to skip symbols.

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will replace all symbols using Regex." (Allocates new string O(N)).
2.  "I will create a new clean string." (O(N) space).
3.  "I will skip only spaces." (Fails on commas/colons).
4.  "I will check char codes." (Tedious manual checking).
5.  "I will use a Stack." (O(N) space).
6.  "I will compare index `i` and `N-i`." (Fails if garbage exists at asymmetric indices).
7.  "I will reverse and compare." (O(N) space).
8.  "I will use hashing." (No).
9.  "I will use recursion." (Stack depth).
10. "I will sort it." (Destroys order).
11. "I will delete symbols." (String immutable).
12. "I will assume clean input." (Fails prompt).

**✅ 3 Correctly Worded Answers:**

1.  "I use **Two Pointers** (Head, Tail). Loop `Head < Tail`. Inside, I run small while loops: `while Head is symbol, Head++` and `while Tail is symbol, Tail--`. Then compare characters (case-insensitive). If match, advance both. Else return False."
2.  "I scan from both ends. If I encounter a non-letter, I skip it. When both pointers rest on valid letters, I compare them. Mismatch implies false. Meeting in the middle implies true."
3.  "I iterate inwards. I effectively ignore any character that isn't a digit or letter by advancing my pointers past them dynamically. This allows me to verify the palindrome property in-place."

**💡 Explanation:**
Skipping logic must happen _before_ comparison logic in the loop.

---

## Q50: The "Final Boss" Archetype (Expression Tree)

**Question:** "Sketch an algorithm to **evaluate** a mathematical **Expression Tree** (Leafs are numbers, Internal nodes are operators `+ - * /`)."

**⚠️ The Tricky Part:**
This is a recursive evaluation. You must evaluate Left, evaluate Right, _then_ apply the operator. (Post-Order).

**❌ 12 Convincing (But WRONG) Answers:**

1.  "I will use In-Order traversal." (Produces `3 + 5`, doesn't calculate).
2.  "I will use BFS." (Wrong order of operations).
3.  "I will return the root value." (Root is just `+` or `*`).
4.  "I will use a Stack." (Good for parsing string, but tree is already parsed).
5.  "I will add all leaves." (Ignores structure/operators).
6.  "I will assume the tree is a heap." (No).
7.  "I will multiply the height." (No).
8.  "I will swap operands." (Non-commutative operators `- /` will fail).
9.  "I will flatten to a list." (Hard to eval).
10. "I will check for cycles." (Trees don't have cycles).
11. "I will use Dijkstra." (No).
12. "I will return 0." (No).

**✅ 3 Correctly Worded Answers:**

1.  "I use **Recursion**. Base case: If node is Leaf, return its value. Recursive step: `leftVal = eval(node.left)`, `rightVal = eval(node.right)`. Then apply `node.operator` to `leftVal` and `rightVal`. Return the result."
2.  "I perform a Post-Order traversal. I compute the result of the left subtree and the right subtree first. Once I have those two numbers, I combine them using the operation stored in the current node."
3.  "I collapse the tree from bottom up. Leaves return numbers. Operator nodes wait for their children to return numbers, then perform the math and return the result up to _their_ parent."

**💡 Explanation:**
Code is Data. The tree structure _is_ the order of operations. Post-Order is "Evaluate operands, then Operator".
