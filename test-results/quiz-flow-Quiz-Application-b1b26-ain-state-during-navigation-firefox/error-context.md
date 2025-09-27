# Page snapshot

```yaml
- generic [active] [ref=e1]:
    - generic [ref=e2]:
        - heading "Markdown Parser Tests" [level=1] [ref=e3]
        - button "Run Tests" [ref=e4] [cursor=pointer]
        - generic [ref=e5]:
            - heading "Test Data Preview" [level=2] [ref=e6]
            - generic [ref=e7]:
                - generic [ref=e8]:
                    - 'heading "Format 1: Options/Correct" [level=3] [ref=e9]'
                    - generic [ref=e10]: "# MCQ Compact Output Description: _Fundamentals of Computer Science_ ## Chapter 1: Algorithm Fundamentals <!-- CH_ID: ch_fundamentals_1 --> **Q1:** What is the primary purpose of algorithm analysis? <!-- Q_ID: ch_fundamentals_1_q1 --> **Options:** - **A1:** To determine the correctness of an algorithm - **A2:** To measure the efficiency and resource usage of an algorithm - **A3:** To write the algorithm in a specific programming language **Correct:** A2 **Explanation:** Algorithm analysis primarily focuses on measuring efficiency and resource usage, including time and space complexity. --- **Q2:** Which of the following best describes Big O notation? <!-- Q_ID: ch_fundamentals_1_q2 --> **Opt:** - **A1:** It provides the exact running time of an algorithm - **A2:** It describes the upper bound of an algorithm's growth rate - **A3:** It only applies to sorting algorithms **Ans:** A2 **Explanation:** Big O notation describes the upper bound of an algorithm's growth rate as input size approaches infinity."
                - generic [ref=e11]:
                    - 'heading "Format 2: Opt/Ans" [level=3] [ref=e12]'
                    - generic [ref=e13]: '# Advanced Algorithms Quiz Description: _Advanced topics in algorithm design and analysis_ ## Chapter 1: Sorting Algorithms <!-- CH_ID: sorting_algorithms --> **Q1:** What is the worst-case time complexity of QuickSort? <!-- Q_ID: sorting_q1 --> **Options:** **A1:** O(n log n) **A2:** O(n²) **A3:** O(n) **Correct:** A2 **Explanation:** QuickSort has O(n²) worst-case time complexity when the pivot is always the smallest or largest element. --- **Q2:** Which sorting algorithm is stable? <!-- Q_ID: sorting_q2 --> **Opt:** **A1:** QuickSort **A2:** MergeSort **A3:** HeapSort **Ans:** A2 **Explanation:** MergeSort is stable because it preserves the relative order of equal elements.'
    - status [ref=e14]
    - generic [ref=e19] [cursor=pointer]:
        - button "Open Next.js Dev Tools" [ref=e20] [cursor=pointer]:
            - img [ref=e21] [cursor=pointer]
        - generic [ref=e25] [cursor=pointer]:
            - button "Open issues overlay" [ref=e26] [cursor=pointer]:
                - generic [ref=e27] [cursor=pointer]:
                    - generic [ref=e28] [cursor=pointer]: '0'
                    - generic [ref=e29] [cursor=pointer]: '1'
                - generic [ref=e30] [cursor=pointer]: Issue
            - button "Collapse issues badge" [ref=e31] [cursor=pointer]:
                - img [ref=e32] [cursor=pointer]
    - alert [ref=e34]
```
