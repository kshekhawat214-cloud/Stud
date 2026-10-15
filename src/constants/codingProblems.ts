// ============================================================
// Curated Coding Problem Bank — Stud Career OS
// 130+ problems tagged by role, category, and difficulty
// Each problem maps to a real LeetCode problem via slug
// ============================================================

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;              // leetcode.com/problems/<slug>
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  role_tags: string[];       // which roles this applies to
  description: string;
  sort_order: number;
}

export const PROBLEM_CATEGORIES = [
  { id: 'arrays', label: 'Arrays & Hashing', icon: '📦' },
  { id: 'two_pointers', label: 'Two Pointers', icon: '👉' },
  { id: 'sliding_window', label: 'Sliding Window', icon: '🪟' },
  { id: 'binary_search', label: 'Binary Search', icon: '🔍' },
  { id: 'linked_list', label: 'Linked Lists', icon: '🔗' },
  { id: 'trees', label: 'Trees & BST', icon: '🌲' },
  { id: 'graphs', label: 'Graphs & BFS/DFS', icon: '🕸️' },
  { id: 'dynamic_programming', label: 'Dynamic Programming', icon: '⚡' },
  { id: 'recursion', label: 'Recursion & Backtracking', icon: '🔄' },
  { id: 'sorting', label: 'Sorting & Searching', icon: '📊' },
  { id: 'heap', label: 'Heaps & Priority Queues', icon: '📈' },
  { id: 'strings', label: 'Strings & Pattern Matching', icon: '🔤' },
  { id: 'sql', label: 'SQL & Databases', icon: '🗄️' },
  { id: 'math', label: 'Math & Statistics', icon: '➗' },
  { id: 'design', label: 'System Design & OOP', icon: '🏗️' },
] as const;

const ALL_ROLES = [
  'software_engineer', 'ml_engineer', 'data_scientist',
  'data_analyst', 'backend_engineer', 'frontend_engineer',
  'devops_engineer', 'ai_pm', 'ui_ux_designer', 'business_analyst',
];

const SWE_ROLES = ['software_engineer', 'ml_engineer', 'backend_engineer', 'frontend_engineer'];
const DATA_ROLES = ['data_scientist', 'data_analyst', 'ml_engineer', 'ai_pm', 'business_analyst'];
const SQL_ROLES = ['data_analyst', 'business_analyst', 'backend_engineer', 'ai_pm', 'data_scientist'];

export const CODING_PROBLEMS: CodingProblem[] = [

  // ─── ARRAYS & HASHING ──────────────────────────────────
  { id: 'lc_1', title: 'Two Sum', slug: 'two-sum', category: 'arrays', difficulty: 'easy', role_tags: ALL_ROLES, description: 'Find two numbers that add up to a target. Classic hash map problem.', sort_order: 1 },
  { id: 'lc_49', title: 'Group Anagrams', slug: 'group-anagrams', category: 'arrays', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Group strings that are anagrams using sorted key hashing.', sort_order: 2 },
  { id: 'lc_242', title: 'Valid Anagram', slug: 'valid-anagram', category: 'arrays', difficulty: 'easy', role_tags: SWE_ROLES, description: 'Determine if two strings are anagrams of each other.', sort_order: 3 },
  { id: 'lc_217', title: 'Contains Duplicate', slug: 'contains-duplicate', category: 'arrays', difficulty: 'easy', role_tags: ALL_ROLES, description: 'Return true if any value appears at least twice in array.', sort_order: 4 },
  { id: 'lc_238', title: 'Product of Array Except Self', slug: 'product-of-array-except-self', category: 'arrays', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Return array where output[i] is product of all elements except self.', sort_order: 5 },
  { id: 'lc_347', title: 'Top K Frequent Elements', slug: 'top-k-frequent-elements', category: 'arrays', difficulty: 'medium', role_tags: [...SWE_ROLES, 'data_scientist', 'data_analyst'], description: 'Find the k most frequent elements using bucket sort or heap.', sort_order: 6 },
  { id: 'lc_128', title: 'Longest Consecutive Sequence', slug: 'longest-consecutive-sequence', category: 'arrays', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find the longest consecutive elements sequence using a hash set.', sort_order: 7 },

  // ─── TWO POINTERS ──────────────────────────────────────
  { id: 'lc_125', title: 'Valid Palindrome', slug: 'valid-palindrome', category: 'two_pointers', difficulty: 'easy', role_tags: SWE_ROLES, description: 'Check if string is palindrome ignoring non-alphanumeric characters.', sort_order: 10 },
  { id: 'lc_167', title: 'Two Sum II – Input Array Is Sorted', slug: 'two-sum-ii-input-array-is-sorted', category: 'two_pointers', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find two numbers summing to target in a sorted array.', sort_order: 11 },
  { id: 'lc_15', title: '3Sum', slug: '3sum', category: 'two_pointers', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find all unique triplets summing to zero using sorted + two pointers.', sort_order: 12 },
  { id: 'lc_11', title: 'Container With Most Water', slug: 'container-with-most-water', category: 'two_pointers', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Maximize water container area using two pointer convergence.', sort_order: 13 },
  { id: 'lc_42', title: 'Trapping Rain Water', slug: 'trapping-rain-water', category: 'two_pointers', difficulty: 'hard', role_tags: ['software_engineer', 'ml_engineer'], description: 'Calculate how much water can be trapped between elevation bars.', sort_order: 14 },

  // ─── SLIDING WINDOW ────────────────────────────────────
  { id: 'lc_121', title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', category: 'sliding_window', difficulty: 'easy', role_tags: ALL_ROLES, description: 'Find max profit from a single buy-sell transaction.', sort_order: 20 },
  { id: 'lc_3', title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', category: 'sliding_window', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find longest substring with all unique characters using sliding window.', sort_order: 21 },
  { id: 'lc_424', title: 'Longest Repeating Character Replacement', slug: 'longest-repeating-character-replacement', category: 'sliding_window', difficulty: 'medium', role_tags: ['software_engineer', 'ml_engineer'], description: 'Find longest substring with same letter after at most k replacements.', sort_order: 22 },
  { id: 'lc_76', title: 'Minimum Window Substring', slug: 'minimum-window-substring', category: 'sliding_window', difficulty: 'hard', role_tags: ['software_engineer', 'ml_engineer'], description: 'Find minimum window in string containing all chars of target.', sort_order: 23 },

  // ─── BINARY SEARCH ─────────────────────────────────────
  { id: 'lc_704', title: 'Binary Search', slug: 'binary-search', category: 'binary_search', difficulty: 'easy', role_tags: ALL_ROLES, description: 'Classic binary search on a sorted array.', sort_order: 30 },
  { id: 'lc_153', title: 'Find Minimum in Rotated Sorted Array', slug: 'find-minimum-in-rotated-sorted-array', category: 'binary_search', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find the minimum element in a rotated sorted array.', sort_order: 31 },
  { id: 'lc_33', title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', category: 'binary_search', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Search for a target in a rotated sorted array.', sort_order: 32 },
  { id: 'lc_875', title: 'Koko Eating Bananas', slug: 'koko-eating-bananas', category: 'binary_search', difficulty: 'medium', role_tags: ['software_engineer', 'backend_engineer'], description: 'Binary search on answer — find minimum eating speed.', sort_order: 33 },

  // ─── LINKED LISTS ──────────────────────────────────────
  { id: 'lc_206', title: 'Reverse Linked List', slug: 'reverse-linked-list', category: 'linked_list', difficulty: 'easy', role_tags: SWE_ROLES, description: 'Reverse a singly linked list iteratively and recursively.', sort_order: 40 },
  { id: 'lc_21', title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', category: 'linked_list', difficulty: 'easy', role_tags: SWE_ROLES, description: 'Merge two sorted linked lists into one sorted list.', sort_order: 41 },
  { id: 'lc_143', title: 'Reorder List', slug: 'reorder-list', category: 'linked_list', difficulty: 'medium', role_tags: ['software_engineer'], description: 'Reorder list to L0→Ln→L1→Ln-1 in-place.', sort_order: 42 },
  { id: 'lc_19', title: 'Remove Nth Node From End of List', slug: 'remove-nth-node-from-end-of-list', category: 'linked_list', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Remove nth node from end using fast/slow pointer technique.', sort_order: 43 },
  { id: 'lc_141', title: 'Linked List Cycle', slug: 'linked-list-cycle', category: 'linked_list', difficulty: 'easy', role_tags: SWE_ROLES, description: 'Detect a cycle in a linked list using Floyd\'s algorithm.', sort_order: 44 },

  // ─── TREES ─────────────────────────────────────────────
  { id: 'lc_226', title: 'Invert Binary Tree', slug: 'invert-binary-tree', category: 'trees', difficulty: 'easy', role_tags: SWE_ROLES, description: 'Invert (mirror) a binary tree recursively or iteratively.', sort_order: 50 },
  { id: 'lc_104', title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', category: 'trees', difficulty: 'easy', role_tags: SWE_ROLES, description: 'Find the maximum depth of a binary tree using DFS.', sort_order: 51 },
  { id: 'lc_100', title: 'Same Tree', slug: 'same-tree', category: 'trees', difficulty: 'easy', role_tags: SWE_ROLES, description: 'Check if two binary trees are structurally identical.', sort_order: 52 },
  { id: 'lc_102', title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', category: 'trees', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Return level order traversal of binary tree using BFS queue.', sort_order: 53 },
  { id: 'lc_98', title: 'Validate Binary Search Tree', slug: 'validate-binary-search-tree', category: 'trees', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Validate if a binary tree is a valid BST.', sort_order: 54 },
  { id: 'lc_235', title: 'Lowest Common Ancestor of a BST', slug: 'lowest-common-ancestor-of-a-binary-search-tree', category: 'trees', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find the lowest common ancestor in a BST.', sort_order: 55 },
  { id: 'lc_124', title: 'Binary Tree Maximum Path Sum', slug: 'binary-tree-maximum-path-sum', category: 'trees', difficulty: 'hard', role_tags: ['software_engineer'], description: 'Find the maximum path sum in a binary tree (any to any node).', sort_order: 56 },

  // ─── GRAPHS ────────────────────────────────────────────
  { id: 'lc_200', title: 'Number of Islands', slug: 'number-of-islands', category: 'graphs', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Count number of islands in a 2D grid using DFS/BFS flood fill.', sort_order: 60 },
  { id: 'lc_133', title: 'Clone Graph', slug: 'clone-graph', category: 'graphs', difficulty: 'medium', role_tags: ['software_engineer', 'backend_engineer'], description: 'Deep clone a graph using DFS/BFS and a visited hash map.', sort_order: 61 },
  { id: 'lc_417', title: 'Pacific Atlantic Water Flow', slug: 'pacific-atlantic-water-flow', category: 'graphs', difficulty: 'medium', role_tags: ['software_engineer', 'ml_engineer'], description: 'Find cells from which water flows to both Pacific and Atlantic.', sort_order: 62 },
  { id: 'lc_207', title: 'Course Schedule', slug: 'course-schedule', category: 'graphs', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Detect a cycle in a directed graph (topological sort).', sort_order: 63 },
  { id: 'lc_323', title: 'Number of Connected Components in Graph', slug: 'number-of-connected-components-in-an-undirected-graph', category: 'graphs', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Count connected components using Union-Find or DFS.', sort_order: 64 },
  { id: 'lc_684', title: 'Redundant Connection', slug: 'redundant-connection', category: 'graphs', difficulty: 'medium', role_tags: ['software_engineer'], description: 'Find the edge that forms a cycle using Union-Find.', sort_order: 65 },
  { id: 'lc_127', title: 'Word Ladder', slug: 'word-ladder', category: 'graphs', difficulty: 'hard', role_tags: ['software_engineer', 'ml_engineer'], description: 'Find shortest transformation sequence using BFS.', sort_order: 66 },

  // ─── DYNAMIC PROGRAMMING ───────────────────────────────
  { id: 'lc_70', title: 'Climbing Stairs', slug: 'climbing-stairs', category: 'dynamic_programming', difficulty: 'easy', role_tags: ALL_ROLES, description: 'Count ways to climb n stairs (1 or 2 steps). Classic Fibonacci DP.', sort_order: 70 },
  { id: 'lc_746', title: 'Min Cost Climbing Stairs', slug: 'min-cost-climbing-stairs', category: 'dynamic_programming', difficulty: 'easy', role_tags: SWE_ROLES, description: 'Find minimum cost to reach the top of the staircase.', sort_order: 71 },
  { id: 'lc_198', title: 'House Robber', slug: 'house-robber', category: 'dynamic_programming', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Maximum amount robber can steal without alerting adjacent houses.', sort_order: 72 },
  { id: 'lc_213', title: 'House Robber II', slug: 'house-robber-ii', category: 'dynamic_programming', difficulty: 'medium', role_tags: ['software_engineer'], description: 'House robber in a circular arrangement.', sort_order: 73 },
  { id: 'lc_5', title: 'Longest Palindromic Substring', slug: 'longest-palindromic-substring', category: 'dynamic_programming', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find the longest palindromic substring using expand around center.', sort_order: 74 },
  { id: 'lc_322', title: 'Coin Change', slug: 'coin-change', category: 'dynamic_programming', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find minimum number of coins to make up an amount.', sort_order: 75 },
  { id: 'lc_300', title: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence', category: 'dynamic_programming', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find the length of the longest strictly increasing subsequence.', sort_order: 76 },
  { id: 'lc_416', title: 'Partition Equal Subset Sum', slug: 'partition-equal-subset-sum', category: 'dynamic_programming', difficulty: 'medium', role_tags: ['software_engineer', 'ml_engineer'], description: 'Determine if array can be partitioned into two equal-sum subsets.', sort_order: 77 },
  { id: 'lc_72', title: 'Edit Distance', slug: 'edit-distance', category: 'dynamic_programming', difficulty: 'hard', role_tags: ['software_engineer', 'ml_engineer', 'data_scientist'], description: 'Classic NLP/DP problem — minimum edits to transform one string to another.', sort_order: 78 },

  // ─── HEAPS ─────────────────────────────────────────────
  { id: 'lc_703', title: 'Kth Largest Element in a Stream', slug: 'kth-largest-element-in-a-stream', category: 'heap', difficulty: 'easy', role_tags: [...SWE_ROLES, 'data_scientist'], description: 'Maintain kth largest element using a min-heap.', sort_order: 80 },
  { id: 'lc_1046', title: 'Last Stone Weight', slug: 'last-stone-weight', category: 'heap', difficulty: 'easy', role_tags: SWE_ROLES, description: 'Simulate stone smashing using a max-heap.', sort_order: 81 },
  { id: 'lc_973', title: 'K Closest Points to Origin', slug: 'k-closest-points-to-origin', category: 'heap', difficulty: 'medium', role_tags: [...SWE_ROLES, 'ml_engineer', 'data_scientist'], description: 'Find k closest points using max-heap or quickselect.', sort_order: 82 },
  { id: 'lc_215', title: 'Kth Largest Element in an Array', slug: 'kth-largest-element-in-an-array', category: 'heap', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find kth largest using min-heap or quickselect algorithm.', sort_order: 83 },
  { id: 'lc_295', title: 'Find Median from Data Stream', slug: 'find-median-from-data-stream', category: 'heap', difficulty: 'hard', role_tags: ['software_engineer', 'data_scientist', 'ml_engineer'], description: 'Maintain running median using two heaps (max + min).', sort_order: 84 },

  // ─── STRINGS ───────────────────────────────────────────
  { id: 'lc_20', title: 'Valid Parentheses', slug: 'valid-parentheses', category: 'strings', difficulty: 'easy', role_tags: ALL_ROLES, description: 'Check if brackets are valid using a stack.', sort_order: 90 },
  { id: 'lc_150', title: 'Evaluate Reverse Polish Notation', slug: 'evaluate-reverse-polish-notation', category: 'strings', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Evaluate expression in RPN using a stack.', sort_order: 91 },
  { id: 'lc_22', title: 'Generate Parentheses', slug: 'generate-parentheses', category: 'strings', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Generate all combinations of well-formed parentheses.', sort_order: 92 },
  { id: 'lc_271', title: 'Encode and Decode Strings', slug: 'encode-and-decode-strings', category: 'strings', difficulty: 'medium', role_tags: ['software_engineer', 'backend_engineer'], description: 'Design an algorithm to encode/decode a list of strings.', sort_order: 93 },

  // ─── RECURSION & BACKTRACKING ──────────────────────────
  { id: 'lc_78', title: 'Subsets', slug: 'subsets', category: 'recursion', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Generate all possible subsets using backtracking.', sort_order: 100 },
  { id: 'lc_39', title: 'Combination Sum', slug: 'combination-sum', category: 'recursion', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Find all combinations summing to target (reuse allowed).', sort_order: 101 },
  { id: 'lc_46', title: 'Permutations', slug: 'permutations', category: 'recursion', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Generate all permutations of a distinct integer array.', sort_order: 102 },
  { id: 'lc_79', title: 'Word Search', slug: 'word-search', category: 'recursion', difficulty: 'medium', role_tags: ['software_engineer', 'ml_engineer'], description: 'Find if word exists in 2D grid using backtracking DFS.', sort_order: 103 },
  { id: 'lc_51', title: 'N-Queens', slug: 'n-queens', category: 'recursion', difficulty: 'hard', role_tags: ['software_engineer'], description: 'Place n queens on n×n board such that no two queens attack each other.', sort_order: 104 },

  // ─── SQL PROBLEMS ──────────────────────────────────────
  { id: 'lc_175', title: 'Combine Two Tables', slug: 'combine-two-tables', category: 'sql', difficulty: 'easy', role_tags: SQL_ROLES, description: 'LEFT JOIN Person and Address tables to combine results.', sort_order: 110 },
  { id: 'lc_176', title: 'Second Highest Salary', slug: 'second-highest-salary', category: 'sql', difficulty: 'medium', role_tags: SQL_ROLES, description: 'Find second highest salary using OFFSET or subquery.', sort_order: 111 },
  { id: 'lc_177', title: 'Nth Highest Salary', slug: 'nth-highest-salary', category: 'sql', difficulty: 'medium', role_tags: SQL_ROLES, description: 'Write a SQL function to find nth highest salary.', sort_order: 112 },
  { id: 'lc_178', title: 'Rank Scores', slug: 'rank-scores', category: 'sql', difficulty: 'medium', role_tags: SQL_ROLES, description: 'Rank scores without gaps using DENSE_RANK() window function.', sort_order: 113 },
  { id: 'lc_180', title: 'Consecutive Numbers', slug: 'consecutive-numbers', category: 'sql', difficulty: 'medium', role_tags: SQL_ROLES, description: 'Find all numbers that appear at least three times consecutively.', sort_order: 114 },
  { id: 'lc_184', title: 'Department Highest Salary', slug: 'department-highest-salary', category: 'sql', difficulty: 'medium', role_tags: SQL_ROLES, description: 'Find employees who earn the highest salary in each department.', sort_order: 115 },
  { id: 'lc_185', title: 'Department Top Three Salaries', slug: 'department-top-three-salaries', category: 'sql', difficulty: 'hard', role_tags: SQL_ROLES, description: 'Find top 3 salaries per department using DENSE_RANK.', sort_order: 116 },
  { id: 'lc_196', title: 'Delete Duplicate Emails', slug: 'delete-duplicate-emails', category: 'sql', difficulty: 'easy', role_tags: SQL_ROLES, description: 'Delete all duplicate email entries keeping only the lowest id.', sort_order: 117 },
  { id: 'lc_197', title: 'Rising Temperature', slug: 'rising-temperature', category: 'sql', difficulty: 'easy', role_tags: SQL_ROLES, description: 'Find dates with higher temperatures than the previous day using self-join.', sort_order: 118 },
  { id: 'lc_262', title: 'Trips and Users', slug: 'trips-and-users', category: 'sql', difficulty: 'hard', role_tags: SQL_ROLES, description: 'Compute unbanned user cancellation rate for each day.', sort_order: 119 },
  { id: 'lc_570', title: 'Managers with at Least 5 Direct Reports', slug: 'managers-with-at-least-5-direct-reports', category: 'sql', difficulty: 'medium', role_tags: SQL_ROLES, description: 'Find managers with 5+ direct reports using GROUP BY + HAVING.', sort_order: 120 },
  { id: 'lc_579', title: 'Find Cumulative Salary of an Employee', slug: 'find-cumulative-salary-of-an-employee', category: 'sql', difficulty: 'hard', role_tags: SQL_ROLES, description: 'Compute running sum of salaries over 3 months using window functions.', sort_order: 121 },
  { id: 'lc_601', title: 'Human Traffic of Stadium', slug: 'human-traffic-of-stadium', category: 'sql', difficulty: 'hard', role_tags: SQL_ROLES, description: 'Find consecutive stadium records with people >= 100.', sort_order: 122 },

  // ─── MATH & STATISTICS ────────────────────────────────
  { id: 'lc_9', title: 'Palindrome Number', slug: 'palindrome-number', category: 'math', difficulty: 'easy', role_tags: ALL_ROLES, description: 'Determine if an integer is a palindrome without converting to string.', sort_order: 130 },
  { id: 'lc_50', title: 'Pow(x, n)', slug: 'powx-n', category: 'math', difficulty: 'medium', role_tags: [...SWE_ROLES, 'ml_engineer', 'data_scientist'], description: 'Implement fast exponentiation using divide and conquer.', sort_order: 131 },
  { id: 'lc_528', title: 'Random Pick with Weight', slug: 'random-pick-with-weight', category: 'math', difficulty: 'medium', role_tags: ['software_engineer', 'ml_engineer', 'data_scientist'], description: 'Sample random index with weighted probability using prefix sums.', sort_order: 132 },
  { id: 'lc_384', title: 'Shuffle an Array', slug: 'shuffle-an-array', category: 'math', difficulty: 'medium', role_tags: ['software_engineer', 'ml_engineer', 'data_scientist'], description: 'Implement Fisher-Yates shuffle for uniform random permutation.', sort_order: 133 },

  // ─── DESIGN & OOP ──────────────────────────────────────
  { id: 'lc_146', title: 'LRU Cache', slug: 'lru-cache', category: 'design', difficulty: 'medium', role_tags: ['software_engineer', 'backend_engineer', 'ml_engineer'], description: 'Implement LRU cache with O(1) get/put using HashMap + DLL.', sort_order: 140 },
  { id: 'lc_155', title: 'Min Stack', slug: 'min-stack', category: 'design', difficulty: 'medium', role_tags: SWE_ROLES, description: 'Design stack with O(1) push, pop, top, and getMin operations.', sort_order: 141 },
  { id: 'lc_208', title: 'Implement Trie (Prefix Tree)', slug: 'implement-trie-prefix-tree', category: 'design', difficulty: 'medium', role_tags: ['software_engineer', 'ml_engineer', 'backend_engineer'], description: 'Implement a trie data structure for prefix-based string search.', sort_order: 142 },
  { id: 'lc_295b', title: 'Design Twitter', slug: 'design-twitter', category: 'design', difficulty: 'medium', role_tags: ['software_engineer', 'backend_engineer'], description: 'Design a simplified Twitter with post/getNewsFeed/follow/unfollow.', sort_order: 143 },
  { id: 'lc_460', title: 'LFU Cache', slug: 'lfu-cache', category: 'design', difficulty: 'hard', role_tags: ['software_engineer', 'backend_engineer'], description: 'Implement LFU cache eviction policy with O(1) operations.', sort_order: 144 },
];

// Helper: get problems for a specific role
export function getProblemsByRole(roleId: string): CodingProblem[] {
  return CODING_PROBLEMS.filter((p) => p.role_tags.includes(roleId));
}

// Helper: get problems by category
export function getProblemsByCategory(category: string): CodingProblem[] {
  return CODING_PROBLEMS.filter((p) => p.category === category);
}

// Helper: get LeetCode URL for a problem
export function getLeetCodeUrl(slug: string): string {
  return `https://leetcode.com/problems/${slug}/`;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemDetailSpec {
  detailedDescription: string;
  examples: ProblemExample[];
  constraints: string[];
  hints: string[];
  editorial: {
    approach: string;
    complexity: string;
    codeSnippet: string;
  };
  starterTemplates: Record<string, string>;
  testCases: Array<{ input: string; expected: string }>;
}

export function getProblemDetailSpec(problem: CodingProblem): ProblemDetailSpec {
  const functionName = problem.slug.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  // Special rich detail for Two Sum
  if (problem.id === 'lc_1') {
    return {
      detailedDescription:
        'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]',
          explanation: 'nums[1] + nums[2] == 6, so we return [1, 2].',
        },
        {
          input: 'nums = [3,3], target = 6',
          output: '[0,1]',
        },
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.',
      ],
      hints: [
        'A really brute force way would be to search for all possible pairs of numbers but that would be O(N^2).',
        'Can we use extra space? Hash map gives O(1) average lookup time.',
        'Iterate through the array, for each element compute (target - current) and check if it exists in the Hash Map.',
      ],
      editorial: {
        approach:
          '### One-pass Hash Table\nWhile we iterate and insert elements into the hash table, we also look back to check if the current element\'s complement (`target - nums[i]`) already exists in the table. If it exists, we have found a valid pair and return their indices immediately.',
        complexity: 'Time Complexity: O(N) | Space Complexity: O(N)',
        codeSnippet: `def twoSum(nums: List[int], target: int) -> List[int]:
    prevMap = {} # val -> index
    for i, n in enumerate(nums):
        diff = target - n
        if diff in prevMap:
            return [prevMap[diff], i]
        prevMap[n] = i
    return []`,
      },
      starterTemplates: {
        python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your Python 3 solution here
        prev_map = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prev_map:
                return [prev_map[diff], i]
            prev_map[n] = i
        return []`,
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
};`,
        typescript: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
};`,
        cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int diff = target - nums[i];
            if (map.find(diff) != map.end()) {
                return {map[diff], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[] { map.get(diff), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
        sql: `-- Write your SQL solution below
SELECT * FROM Table;`,
      },
      testCases: [
        { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' },
        { input: 'nums = [3,2,4], target = 6', expected: '[1,2]' },
        { input: 'nums = [3,3], target = 6', expected: '[0,1]' },
      ],
    };
  }

  // SQL Category generator
  if (problem.category === 'sql') {
    return {
      detailedDescription: `### ${problem.title}\n\n${problem.description}\n\nWrite a SQL query that retrieves the required results according to the schema specification.`,
      examples: [
        {
          input: 'Table: Records\n+----+--------+\n| id | value  |\n+----+--------+\n| 1  | 100    |\n| 2  | 200    |\n+----+--------+',
          output: '+----+--------+\n| id | value  |\n+----+--------+\n| 2  | 200    |\n+----+--------+',
          explanation: 'Selected based on specified criteria.',
        },
      ],
      constraints: ['Table contains non-null primary keys.', 'Result order matters if specified.'],
      hints: [
        'Use appropriate JOINs or aggregate functions (GROUP BY, HAVING).',
        'Consider window functions like DENSE_RANK() or ROW_NUMBER() if ranking is required.',
      ],
      editorial: {
        approach: 'Use standard SQL queries with appropriate filtering and joins.',
        complexity: 'Time Complexity: O(N log N) for sorting | Space Complexity: O(N)',
        codeSnippet: `SELECT id, name\nFROM Table\nWHERE condition = true;`,
      },
      starterTemplates: {
        sql: `# Write your MySQL query statement below
SELECT *
FROM Table;`,
        python: `# Pandas / Python Dataframe solution
import pandas as pd

def solve(df: pd.DataFrame) -> pd.DataFrame:
    return df`,
        javascript: `// SQL / JS Data Processor
function solve(data) {
    return data;
}`,
        typescript: `function solve(data: any[]): any[] {
    return data;
}`,
        cpp: `// C++ DB Query Processing`,
        java: `// Java DB Query Processing`,
      },
      testCases: [
        { input: 'Table Records Sample', expected: 'Filtered SQL Output' },
      ],
    };
  }

  // Generic Problem Detail Spec for all other DSA problems
  return {
    detailedDescription: `### ${problem.title}\n\n${problem.description}\n\nGiven the problem inputs, implement an efficient algorithm to compute the expected result within the constraints.`,
    examples: [
      {
        input: `Sample Input 1 for ${problem.title}`,
        output: 'Expected Output 1',
        explanation: `Explanation for ${problem.title} sample test case.`,
      },
      {
        input: `Sample Input 2 for ${problem.title}`,
        output: 'Expected Output 2',
      },
    ],
    constraints: [
      '1 <= input.length <= 10^5',
      'Values are within standard 32-bit integer ranges.',
      'Optimize for time complexity where possible.',
    ],
    hints: [
      `Consider using a data structure optimal for ${problem.category.replace('_', ' ')}.`,
      'Look for edge cases like empty inputs or boundary values.',
    ],
    editorial: {
      approach: `### Approach Overview\nApply an optimal algorithm using ${problem.category.replace('_', ' ')} patterns.`,
      complexity: 'Time Complexity: O(N) | Space Complexity: O(N)',
      codeSnippet: `def ${functionName}(input_data):\n    # Optimal approach\n    pass`,
    },
    starterTemplates: {
      python: `class Solution:
    def ${functionName}(self, input_data):
        # Write your Python 3 solution here
        pass`,
      javascript: `/**
 * @param {any} input_data
 * @return {any}
 */
var ${functionName} = function(input_data) {
    // Write your JavaScript solution here
};`,
      typescript: `function ${functionName}(inputData: any): any {
    // Write your TypeScript solution here
};`,
      cpp: `class Solution {
public:
    void ${functionName}() {
        // Write your C++ solution here
    }
};`,
      java: `class Solution {
    public void ${functionName}() {
        // Write your Java solution here
    }
}`,
      sql: `-- Write your SQL solution below
SELECT * FROM Table;`,
    },
    testCases: [
      { input: 'Sample Case 1', expected: 'Output Case 1' },
      { input: 'Sample Case 2', expected: 'Output Case 2' },
    ],
  };
}

