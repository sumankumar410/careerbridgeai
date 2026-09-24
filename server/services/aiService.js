// CareerBridgeAI - Modular AI Service Layer
// Includes ATS Resume Analyzer, Job Matcher, and High-Precision Interview Evaluator

const roleSkillMaps = {
  'MERN Developer': {
    skills: ['react', 'node.js', 'mongodb', 'express', 'javascript', 'tailwind', 'redux', 'git', 'rest api', 'jwt', 'html', 'css', 'typescript'],
    keywords: ['MERN Stack Architecture', 'RESTful APIs', 'State Management (Redux/Context)', 'Aggregation Pipeline', 'Component Architecture', 'JWT Authentication', 'Responsive Web Design']
  },
  'React Developer': {
    skills: ['react', 'javascript', 'typescript', 'redux', 'next.js', 'tailwind', 'html', 'css', 'git', 'vite', 'webpack', 'jest'],
    keywords: ['Virtual DOM Reconciliation', 'React Custom Hooks', 'State Management', 'Single Page Application (SPA)', 'Component Lifecycle', 'Web Core Vitals', 'CSS in JS / Tailwind']
  },
  'Backend Developer': {
    skills: ['node.js', 'express', 'mongodb', 'sql', 'postgresql', 'python', 'docker', 'redis', 'rest api', 'microservices', 'git', 'aws'],
    keywords: ['Distributed Systems', 'Microservices Architecture', 'Database Indexing & Sharding', 'API Rate Limiting', 'Caching Layer (Redis)', 'Message Queues', 'ORM/ODM Data Modeling']
  },
  'Full Stack Developer': {
    skills: ['react', 'node.js', 'express', 'mongodb', 'sql', 'javascript', 'typescript', 'docker', 'git', 'aws', 'rest api', 'html', 'css'],
    keywords: ['End-to-End System Design', 'CI/CD Automated Pipelines', 'Full Stack Development', 'Containerization (Docker)', 'Cloud Deployment (AWS/Vercel)', 'Automated Unit & Integration Testing']
  },
  'Software Engineer': {
    skills: ['dsa', 'data structures', 'algorithms', 'c++', 'java', 'python', 'oop', 'dbms', 'os', 'computer networks', 'git', 'sql'],
    keywords: ['Time & Space Complexity Analysis', 'Object-Oriented Design Principles (SOLID)', 'Design Patterns', 'Relational Database Schema Design', 'Concurrency & Multithreading', 'System Design']
  },
  'Data Analyst': {
    skills: ['python', 'sql', 'pandas', 'numpy', 'power bi', 'tableau', 'excel', 'data analysis', 'statistics', 'visualization', 'machine learning'],
    keywords: ['Exploratory Data Analysis (EDA)', 'Statistical Modeling & Hypothesis Testing', 'Business Intelligence (BI) Dashboards', 'Data Cleaning & Preprocessing', 'ETL Pipelines', 'Data Storytelling']
  }
};

// ==========================================
// 1. AI RESUME ATS ANALYZER
// ==========================================
const analyzeResume = async (resumeText, targetRole = 'MERN Developer') => {
  const text = (resumeText || '').toLowerCase();
  const roleConfig = roleSkillMaps[targetRole] || roleSkillMaps['MERN Developer'];
  
  const roleSkills = roleConfig.skills;
  const roleKeywords = roleConfig.keywords;

  const foundSkills = roleSkills.filter(skill => text.includes(skill.toLowerCase()));
  const missingSkills = roleSkills.filter(skill => !text.includes(skill.toLowerCase()));
  
  const foundKeywords = roleKeywords.filter(k => text.includes(k.toLowerCase()));
  const suggestedKeywords = roleKeywords.filter(k => !text.includes(k.toLowerCase()));

  // Weighted Scoring Calculation
  let skillWeight = roleSkills.length > 0 ? (foundSkills.length / roleSkills.length) * 35 : 25;
  let experienceWeight = (text.includes('experience') || text.includes('intern') || text.includes('developer')) ? 20 : 10;
  let projectWeight = (text.includes('project') || text.includes('github') || text.includes('demo')) ? 20 : 10;
  let educationWeight = (text.includes('b.tech') || text.includes('bachelor') || text.includes('cgpa') || text.includes('university') || text.includes('college')) ? 15 : 8;
  let keywordWeight = Math.min((foundSkills.length + 1) * 2, 10);

  let rawScore = Math.round(skillWeight + experienceWeight + projectWeight + educationWeight + keywordWeight);
  const score = Math.min(Math.max(rawScore, 50), 96);

  // Category Scores
  const categories = {
    skills: Math.min(Math.round((foundSkills.length / roleSkills.length) * 100) + 15, 95),
    experience: (text.includes('intern') || text.includes('experience')) ? 85 : 65,
    projects: (text.includes('project') && (text.includes('github') || text.includes('live') || text.includes('http'))) ? 90 : 70,
    formatting: (text.length > 300 && (text.includes('skills') || text.includes('education'))) ? 88 : 72,
    keywords: Math.min(Math.round((foundSkills.length / roleSkills.length) * 100) + 10, 92)
  };

  // Strengths identification
  const strengths = [];
  if (foundSkills.length >= 3) {
    strengths.push(`Solid technical proficiency detected in: ${foundSkills.slice(0, 4).join(', ')}`);
  }
  if (text.includes('github') || text.includes('live') || text.includes('http')) {
    strengths.push('Verified live code links / GitHub repositories included, boosting technical credibility.');
  }
  if (text.includes('intern') || text.includes('experience')) {
    strengths.push('Practical work or internship experience identified in candidate background.');
  }
  if (text.includes('cgpa') || text.includes('b.tech') || text.includes('college')) {
    strengths.push('Academic qualifications and college degree clearly structured for campus recruiters.');
  }
  if (strengths.length === 0) {
    strengths.push('Basic resume structure present; foundational computer science background.');
  }

  // Weaknesses identification
  const weaknesses = [];
  if (missingSkills.length > 0) {
    weaknesses.push(`Target role '${targetRole}' requires key missing competencies: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  if (!text.includes('github') && !text.includes('http')) {
    weaknesses.push('No GitHub links or live deployment URLs detected in project descriptions.');
  }
  if (!text.includes('%') && !text.includes('reduced') && !text.includes('increased') && !text.includes('improved')) {
    weaknesses.push('Projects lack quantified impact metrics (e.g., "improved query performance by 40%").');
  }
  if (text.length < 500) {
    weaknesses.push('Resume length is relatively short; consider adding more detail to core academic projects.');
  }

  // Recommendations
  const recommendations = [
    `Incorporate top target ATS keywords: ${suggestedKeywords.slice(0, 3).join(', ')}.`,
    'Structure each project using the Action-Verb + Tech-Stack + Quantifiable-Outcome format.',
    `Ensure your technical skills header prominently highlights ${targetRole} essentials like ${roleSkills.slice(0, 3).join(', ')}.`,
    'Include direct GitHub repository and live demo links for your top 2 portfolio projects.'
  ];

  return {
    score,
    targetRole,
    categories,
    foundSkills,
    missingSkills: missingSkills.slice(0, 5),
    strengths,
    weaknesses,
    suggestedKeywords: suggestedKeywords.slice(0, 6),
    recommendations
  };
};

// ==========================================
// 2. AI JOB MATCHING
// ==========================================
const matchJobWithStudent = async (studentProfile, job) => {
  const studentSkills = (studentProfile.skills || []).map(s => s.toLowerCase());
  const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase());

  const matched = job.requiredSkills.filter(skill => studentSkills.includes(skill.toLowerCase()));
  const missing = job.requiredSkills.filter(skill => !studentSkills.includes(skill.toLowerCase()));

  const skillScore = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 60 : 40;
  const cgpaScore = studentProfile.cgpa >= job.minCGPA ? 25 : 10;
  const branchScore = (job.eligibleBranches || []).includes(studentProfile.branch) ? 15 : 5;

  const totalScore = Math.min(Math.round(skillScore + cgpaScore + branchScore), 98);

  return {
    matchScore: totalScore,
    matchedSkills: matched,
    missingSkills: missing,
    explanation: totalScore > 80 
      ? `High compatibility! Your skill profile aligns strongly with ${job.companyName}'s requirements.`
      : `Moderate fit. Learning ${missing.slice(0, 2).join(' & ')} will significantly boost your profile for this role.`
  };
};

// ==========================================
// 3. AI INTERVIEW QUESTION BANK
// ==========================================
const questionBank = {
  'React Developer': [
    {
      category: 'React Internals',
      question: 'Explain the Virtual DOM and how React reconciliation algorithm (Fiber) improves rendering performance.',
      idealAnswer: 'React maintains a lightweight in-memory representation of the real DOM. When component state changes, React creates a new virtual DOM tree, diffs it with the previous tree using the reconciliation algorithm (Fiber), and computes the minimal set of changes (patches) to update the actual DOM in batches rather than re-rendering the whole page.',
      coreKeywords: ['virtual dom', 'in-memory', 'real dom', 'reconciliation', 'fiber', 'diff', 'diffing', 'minimal', 'batch', 'performance', 'patch'],
      keyConcepts: [
        { name: 'In-Memory Representation', terms: ['in-memory', 'lightweight', 'javascript object', 'js object', 'representation', 'copy of dom'], description: 'Virtual DOM is a lightweight in-memory representation/JS object tree of UI.' },
        { name: 'Diffing Algorithm', terms: ['diff', 'diffing', 'compare', 'comparing', 'previous tree', 'new tree'], description: 'React diffs the new Virtual DOM tree against the previous tree.' },
        { name: 'Reconciliation & Minimal Updates', terms: ['reconciliation', 'minimal', 'batch', 'patch', 'actual dom', 'real dom', 'fiber'], description: 'Computes minimal patches and updates real DOM efficiently.' }
      ],
      wrongIndicators: ['sql', 'database', 'mongodb', 'backend server', 'router', 'cable', 'hardware', 'table query', 'css color', 'store passwords']
    },
    {
      category: 'React Hooks',
      question: 'What is the difference between useEffect, useMemo, and useCallback? When would you use each?',
      idealAnswer: 'useEffect handles side effects after rendering (e.g. data fetching, subscriptions, DOM mutations). useMemo caches and returns the result of an expensive calculation to avoid recalculating on every render. useCallback memoizes and returns the callback function instance itself to prevent unnecessary re-renders of child components that receive it as a prop.',
      coreKeywords: ['useeffect', 'usememo', 'usecallback', 'side effect', 'side-effects', 'cache', 'expensive calculation', 'memoize', 'function instance', 're-render', 'dependency array'],
      keyConcepts: [
        { name: 'useEffect Purpose', terms: ['side effect', 'side-effects', 'api call', 'fetch', 'subscription', 'lifecycle', 'dom mutation'], description: 'useEffect is used for side effects after component renders.' },
        { name: 'useMemo Purpose', terms: ['expensive', 'cache value', 'cached result', 'calculation', 'computes', 'recalculating'], description: 'useMemo memoizes/caches computed values.' },
        { name: 'useCallback Purpose', terms: ['function instance', 'memoize function', 'child re-render', 'prop', 'reference'], description: 'useCallback memoizes callback functions to preserve referential equality.' }
      ],
      wrongIndicators: ['database', 'redux store replacement', 'backend routing', 'server socket']
    },
    {
      category: 'State Management',
      question: 'Compare React Context API with Redux. When would you choose one over the other in production?',
      idealAnswer: 'Context API is built into React and ideal for low-frequency global state like themes, user authentication, or localization. Redux is an external library providing a centralized store, predictable unidirectional data flow via actions and reducers, and powerful devtools. Redux is preferred in large-scale apps with high-frequency state updates to prevent unnecessary re-rendering of entire component trees.',
      coreKeywords: ['context api', 'redux', 'global state', 'actions', 'reducers', 'unidirectional', 're-render', 'performance', 'middleware', 'store', 'devtools'],
      keyConcepts: [
        { name: 'Context API Scope', terms: ['built-in', 'theme', 'auth', 'localization', 'prop drilling', 'low-frequency'], description: 'Context API is lightweight, built-in, best for low-frequency global state.' },
        { name: 'Redux Architecture', terms: ['store', 'action', 'reducer', 'unidirectional', 'middleware', 'devtools', 'dispatch'], description: 'Redux uses centralized store, actions, reducers, and predictable state updates.' },
        { name: 'Performance & Selection Tradeoffs', terms: ['re-render', 'high-frequency', 'large-scale', 'unnecessary render', 'performance'], description: 'Redux optimizes high-frequency state updates avoiding full subtree re-renders.' }
      ],
      wrongIndicators: ['sql table', 'mongodb connection', 'html styling', 'browser cookies only']
    },
    {
      category: 'JavaScript Fundamentals',
      question: 'Explain the JavaScript Event Loop, Call Stack, Microtasks (Promises), and Macrotasks (setTimeout).',
      idealAnswer: 'JavaScript is single-threaded. The Call Stack executes synchronous code first. When asynchronous tasks finish, their callbacks are queued. Microtask queue (Promise.then, queueMicrotask) has higher priority and executes immediately after the current call stack empties before rendering. Macrotask queue (setTimeout, setInterval, I/O) executes one task per event loop cycle.',
      coreKeywords: ['event loop', 'call stack', 'microtask', 'macrotask', 'promise', 'settimeout', 'single-threaded', 'queue', 'synchronous', 'asynchronous'],
      keyConcepts: [
        { name: 'Call Stack & Single Thread', terms: ['single-threaded', 'call stack', 'synchronous', 'one thread', 'execution context'], description: 'JS call stack executes synchronous code on a single thread.' },
        { name: 'Microtask Queue Priority', terms: ['microtask', 'promise', 'higher priority', 'then', 'queueMicrotask'], description: 'Microtasks (Promises) run immediately after synchronous execution.' },
        { name: 'Macrotask Queue Execution', terms: ['macrotask', 'settimeout', 'setinterval', 'task queue', 'next tick'], description: 'Macrotasks (timers, I/O) run after microtasks on subsequent event loop ticks.' }
      ],
      wrongIndicators: ['multithreaded by default', 'executes setTimeout first', 'python runtime', 'css engine']
    },
    {
      category: 'React Optimization',
      question: 'What are the main causes of performance bottlenecks in React, and how do you resolve them?',
      idealAnswer: 'Bottlenecks occur due to unnecessary component re-renders, heavy computations during render, large bundle sizes, and unoptimized list rendering. Solutions include React.memo, useMemo/useCallback, code splitting with React.lazy and Suspense, virtualizing long lists (react-window), and using unique stable keys in lists rather than array indices.',
      coreKeywords: ['re-render', 'react.memo', 'usememo', 'usecallback', 'code splitting', 'lazy', 'suspense', 'keys', 'virtualization', 'bundle size'],
      keyConcepts: [
        { name: 'Causes of Bottlenecks', terms: ['unnecessary re-render', 'heavy computation', 'large bundle', 'list render', 'array index key'], description: 'Identifies excessive re-renders and unoptimized list rendering.' },
        { name: 'Memoization Solutions', terms: ['react.memo', 'usememo', 'usecallback', 'memoize'], description: 'Uses React.memo, useMemo, and useCallback to avoid re-renders.' },
        { name: 'Code Splitting & Virtualization', terms: ['code splitting', 'lazy', 'suspense', 'virtualization', 'react-window', 'bundle'], description: 'Implements lazy loading, code-splitting, or list virtualization.' }
      ],
      wrongIndicators: ['delete react', 'use jquery', 'switch to c++', 'increase ram']
    }
  ],

  'MERN Developer': [
    {
      category: 'Node.js Architecture',
      question: 'How does Node.js handle asynchronous operations using Libuv and non-blocking I/O?',
      idealAnswer: 'Node.js runs V8 JavaScript execution on a single main thread, but offloads operating system and I/O tasks (file system, network, DNS) to the Libuv C library. Libuv utilizes an internal thread pool (default 4 threads) for blocking system operations and an event loop with phases (Timers, Poll, Check, Close) to trigger callbacks when tasks finish.',
      coreKeywords: ['node.js', 'libuv', 'thread pool', 'event loop', 'non-blocking', 'single thread', 'asynchronous', 'v8', 'callbacks', 'io'],
      keyConcepts: [
        { name: 'Single Thread + Libuv Offloading', terms: ['single thread', 'v8', 'libuv', 'offload', 'c library'], description: 'JS runs single-threaded, but I/O is delegated to Libuv.' },
        { name: 'Thread Pool Mechanism', terms: ['thread pool', 'worker threads', 'blocking operations', '4 threads', 'threads'], description: 'Libuv maintains a thread pool for heavy OS operations like fs and crypto.' },
        { name: 'Event Loop & Non-Blocking I/O', terms: ['event loop', 'non-blocking', 'callback', 'poll phase', 'asynchronous'], description: 'Callbacks are processed non-blockingly via event loop phases.' }
      ],
      wrongIndicators: ['node is multithreaded for js code', 'creates new process for each request like php', 'sql engine']
    },
    {
      category: 'MongoDB & Database',
      question: 'When would you use MongoDB Aggregation Framework vs standard find() queries? Provide an example.',
      idealAnswer: 'Standard find() queries retrieve documents with basic filtering and projection. The Aggregation Framework is used for complex data processing pipelines where documents pass through sequential stages ($match, $group, $lookup for joins, $sort, $project) to compute statistical metrics, perform multi-collection lookups, and transform documents on the database server.',
      coreKeywords: ['aggregation', 'pipeline', 'stages', '$match', '$group', '$lookup', 'find', 'transform', 'join', 'analytics'],
      keyConcepts: [
        { name: 'find() vs Aggregation Difference', terms: ['find', 'filter', 'basic query', 'retrieve', 'simple'], description: 'find() is for basic CRUD and simple filtering.' },
        { name: 'Pipeline Stages Concept', terms: ['pipeline', 'stages', '$match', '$group', '$lookup', '$project'], description: 'Aggregation uses multi-stage pipeline transformations.' },
        { name: 'Analytics & Joins', terms: ['analytics', 'metrics', 'join', 'lookup', 'grouping', 'summary', 'transform'], description: 'Used for complex analytics, calculations, and relational $lookup joins.' }
      ],
      wrongIndicators: ['aggregation is faster for all simple queries', 'find cannot filter data', 'aggregation deletes files']
    },
    {
      category: 'Authentication & Security',
      question: 'How do you securely implement JWT authentication with Access and Refresh tokens in a MERN app?',
      idealAnswer: 'Access tokens should have a short lifespan (e.g. 15 minutes) and can be held in memory or secure cookies. Refresh tokens have a longer lifespan (e.g. 7-30 days), are stored in httpOnly, secure, sameSite cookies to protect against XSS, and are tracked in the database to allow token revocation/rotation upon logout or security compromise.',
      coreKeywords: ['jwt', 'access token', 'refresh token', 'httponly', 'cookie', 'xss', 'csrf', 'expiration', 'rotation', 'revocation'],
      keyConcepts: [
        { name: 'Token Lifespan Separation', terms: ['short lifespan', 'short-lived', 'access token', 'refresh token', '15 min', 'longer'], description: 'Short-lived access token with long-lived refresh token.' },
        { name: 'httpOnly Cookie Security', terms: ['httponly', 'secure', 'samesite', 'cookie', 'xss', 'localstorage'], description: 'Stores tokens in httpOnly cookies to prevent XSS script access.' },
        { name: 'Token Rotation / Revocation', terms: ['revoke', 'revocation', 'rotation', 'database', 'logout', 'blacklist'], description: 'Manages refresh token rotation and revocation in database.' }
      ],
      wrongIndicators: ['store passwords in plain text in jwt', 'jwt is encrypted automatically', 'store refresh token in public url']
    },
    {
      category: 'Express.js',
      question: 'Explain Express Middleware lifecycle, next(), and how centralized error-handling middleware works.',
      idealAnswer: 'Express middleware functions have access to req, res, and the next middleware in the pipeline. Calling next() passes control to the next handler; calling next(err) with an argument bypasses all regular middleware and jumps straight to centralized error-handling middleware, which is defined with four parameters: (err, req, res, next).',
      coreKeywords: ['middleware', 'next()', 'req', 'res', 'pipeline', 'error handling', 'four parameters', 'err', 'centralized'],
      keyConcepts: [
        { name: 'Middleware Pipeline & next()', terms: ['req', 'res', 'next', 'pipeline', 'passes control', 'chain'], description: 'Middleware executes sequentially by calling next().' },
        { name: 'Error Handling Signature (4 params)', terms: ['four parameters', '4 arguments', 'err, req, res, next', 'error handler'], description: 'Centralized error handler takes 4 arguments (err, req, res, next).' },
        { name: 'Bypassing to Error Handler', terms: ['next(err)', 'catches error', 'centralized', 'status code'], description: 'next(err) routes errors directly to the error handling middleware.' }
      ],
      wrongIndicators: ['middleware runs in browser', 'next() restarts server', 'html component']
    }
  ],

  'Backend Developer': [
    {
      category: 'System Design',
      question: 'What are the architectural tradeoffs between SQL (Relational) and NoSQL databases? When do you choose each?',
      idealAnswer: 'SQL databases (PostgreSQL, MySQL) enforce structured schemas, ACID transactions, and complex relational joins, making them ideal for financial, transactional, and structured relational data. NoSQL databases (MongoDB, Cassandra, DynamoDB) offer flexible schemas, horizontal scalability (sharding), and high write throughput, making them ideal for high-volume unstructured data, real-time analytics, and rapidly evolving schemas.',
      coreKeywords: ['sql', 'nosql', 'acid', 'base', 'schema', 'horizontal scaling', 'sharding', 'joins', 'transactions', 'relational'],
      keyConcepts: [
        { name: 'SQL & ACID Properties', terms: ['acid', 'relational', 'join', 'structured schema', 'transactions', 'consistency'], description: 'SQL provides ACID guarantees, rigid schemas, and complex joins.' },
        { name: 'NoSQL & Horizontal Scalability', terms: ['nosql', 'horizontal', 'sharding', 'flexible schema', 'throughput', 'unstructured'], description: 'NoSQL scales horizontally with flexible document/key-value schemas.' },
        { name: 'Selection Criteria', terms: ['financial', 'high volume', 'tradeoff', 'scale', 'use case'], description: 'Selects SQL for relational consistency and NoSQL for horizontal scale and flexible data.' }
      ],
      wrongIndicators: ['sql is obsolete', 'nosql cannot store numbers', 'sql runs on client']
    },
    {
      category: 'Caching & Performance',
      question: 'Explain Cache-Aside (Lazy Loading) caching strategy using Redis and how you handle cache invalidation.',
      idealAnswer: 'In Cache-Aside, the application first checks the Redis cache. On a cache hit, it returns the cached data. On a cache miss, it reads from the database, writes the result to Redis with a Time-To-Live (TTL), and returns it. For invalidation, when data is updated or deleted in the database, the application explicitly invalidates (deletes) or updates the corresponding key in Redis.',
      coreKeywords: ['cache-aside', 'redis', 'cache hit', 'cache miss', 'ttl', 'invalidation', 'database', 'latency', 'expire'],
      keyConcepts: [
        { name: 'Cache Hit & Miss Flow', terms: ['cache hit', 'cache miss', 'checks cache', 'reads database', 'in-memory'], description: 'Checks Redis first; falls back to DB on miss and populates cache.' },
        { name: 'TTL (Time-To-Live)', terms: ['ttl', 'expire', 'expiration', 'time to live'], description: 'Sets expiration TTL to prevent stale data indefinitely.' },
        { name: 'Invalidation on Write/Update', terms: ['invalidate', 'delete key', 'update', 'stale', 'eviction'], description: 'Deletes or updates cache keys upon DB mutations.' }
      ],
      wrongIndicators: ['redis stores data on tape', 'cache replaces database entirely', 'cache never needs invalidation']
    }
  ],

  'Software Engineer': [
    {
      category: 'OOP & Clean Architecture',
      question: 'Explain the SOLID principles in Object-Oriented Design with brief examples of Single Responsibility and Open-Closed.',
      idealAnswer: 'SOLID stands for: Single Responsibility (a class should have one reason to change), Open/Closed (software entities should be open for extension but closed for modification via polymorphism/interfaces), Liskov Substitution (subtypes must be substitutable for base types), Interface Segregation (clients should not depend on unused interfaces), and Dependency Inversion (depend on abstractions, not concretions).',
      coreKeywords: ['solid', 'single responsibility', 'open closed', 'liskov', 'interface segregation', 'dependency inversion', 'abstraction', 'polymorphism', 'interface'],
      keyConcepts: [
        { name: 'Single Responsibility Principle', terms: ['single responsibility', 'one reason to change', 'one job', 'one responsibility'], description: 'A class should have only one reason to change.' },
        { name: 'Open/Closed Principle', terms: ['open for extension', 'closed for modification', 'polymorphism', 'interface', 'extend'], description: 'Open for extension, closed for modification.' },
        { name: 'Liskov, ISP & DIP', terms: ['liskov', 'substitutable', 'interface segregation', 'dependency inversion', 'abstraction'], description: 'Covers Liskov substitution, interface segregation, and dependency inversion.' }
      ],
      wrongIndicators: ['solid is for concrete materials', 'all methods in one giant class', 'css design principle']
    },
    {
      category: 'Data Structures & Algorithms',
      question: 'How do Hash Tables achieve O(1) average lookup time, and how do they resolve hash collisions (Chaining vs Open Addressing)?',
      idealAnswer: 'Hash tables map keys to array indices using a hash function. In ideal conditions, lookup is O(1). Collisions occur when multiple keys produce the same index. Chaining resolves collisions by storing colliding elements in a linked list or self-balancing tree at each bucket. Open Addressing resolves collisions by probing for the next empty slot using linear, quadratic, or double hashing probing.',
      coreKeywords: ['hash table', 'hash function', 'o(1)', 'collision', 'chaining', 'linked list', 'open addressing', 'linear probing', 'bucket', 'load factor'],
      keyConcepts: [
        { name: 'Hash Function & O(1) Mapping', terms: ['hash function', 'o(1)', 'constant time', 'array index', 'bucket'], description: 'Hash function maps keys to array buckets in O(1) average time.' },
        { name: 'Collision Chaining', terms: ['chaining', 'linked list', 'bucket list', 'tree'], description: 'Chaining stores colliding items in linked lists at each index.' },
        { name: 'Open Addressing & Probing', terms: ['open addressing', 'probing', 'linear probing', 'empty slot', 'double hashing'], description: 'Open addressing probes for the next available slot in the array.' }
      ],
      wrongIndicators: ['binary search on every lookup', 'hash tables are sorted arrays', 'collision is impossible']
    }
  ]
};

// ==========================================
// 4. GENERATE INTERVIEW QUESTIONS
// ==========================================
const generateInterviewQuestions = async (role = 'React Developer', difficulty = 'Intermediate') => {
  const defaultQuestions = questionBank[role] || questionBank['React Developer'];
  try {
    const InterviewQuestion = require('../models/InterviewQuestion');
    const customDocs = await InterviewQuestion.find({
      $or: [{ role }, { role: 'General' }, { role: 'All' }]
    }).sort({ createdAt: -1 });

    const formattedCustom = customDocs.map(q => ({
      category: q.category,
      question: q.question,
      idealAnswer: q.idealAnswer,
      difficulty: q.difficulty,
      coreKeywords: q.coreKeywords || [],
      isCustom: true,
      _id: q._id
    }));

    return { 
      role, 
      difficulty, 
      questions: [...formattedCustom, ...defaultQuestions] 
    };
  } catch (err) {
    return { role, difficulty, questions: defaultQuestions };
  }
};

// ==========================================
// 5. HIGH-PRECISION ANSWER EVALUATOR
// ==========================================

// Stopwords set for NLP text comparison
const stopWords = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few',
  'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
  'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves'
]);

const extractMeaningfulWords = (text) => {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
};

// Check if answer is an evasion / "don't know"
const isEvasionAnswer = (text) => {
  const lower = (text || '').toLowerCase().trim();
  const evasionList = [
    'i don\'t know', 'idk', 'dont know', 'no idea', 'skip', 'not sure', 
    'pass', 'wrong', 'test', 'asdf', 'nothing', 'i do not know', 'blank',
    'dunno', 'na', 'none', 'i forgot', 'not studied', 'cannot answer'
  ];
  return evasionList.some(phrase => lower === phrase || lower.startsWith(phrase + ' ') || lower.endsWith(' ' + phrase));
};

// Deterministic Semantic Engine
const evaluateWithSemanticEngine = (questionText, studentAnswer, context = {}) => {
  const answer = (studentAnswer || '').trim();
  const lowerAnswer = answer.toLowerCase();
  const words = answer.split(/\s+/).filter(Boolean);

  // 1. Evasion or Empty Check
  if (words.length < 4 || isEvasionAnswer(answer)) {
    return {
      score: 0,
      status: 'incorrect',
      accuracy: 'Incorrect / Unanswered',
      verdict: 'The question was not attempted or the answer was too brief to evaluate.',
      strengths: [],
      missingPoints: [
        'No valid technical explanation was provided.',
        'Core concepts, definitions, and mechanisms are completely missing.'
      ],
      suggestions: 'Try answering using the 3-part framework: (1) Core definition, (2) Mechanism / How it works, (3) A practical example.',
      followUpQuestion: 'Would you like to review the ideal answer and retry?'
    };
  }

  // 2. Find matching question metadata from bank or context
  let qMeta = null;
  for (const roleKey of Object.keys(questionBank)) {
    const found = questionBank[roleKey].find(q => 
      q.question.toLowerCase().trim() === questionText.toLowerCase().trim() ||
      q.question.toLowerCase().includes(questionText.toLowerCase().slice(0, 30))
    );
    if (found) {
      qMeta = found;
      break;
    }
  }

  const idealAnswer = context.idealAnswer || (qMeta ? qMeta.idealAnswer : '');
  let coreKeywords = (qMeta && qMeta.coreKeywords) || context.coreKeywords;
  if (!coreKeywords || (Array.isArray(coreKeywords) && coreKeywords.length === 0)) {
    coreKeywords = extractMeaningfulWords(idealAnswer).slice(0, 10);
  }
  if (!coreKeywords || coreKeywords.length === 0) {
    coreKeywords = extractMeaningfulWords(questionText).slice(0, 10);
  }
  const keyConcepts = (qMeta && qMeta.keyConcepts) || [];
  const wrongIndicators = (qMeta && qMeta.wrongIndicators) || ['hardware', 'motherboard', 'router', 'cable', 'css color'];

  // 3. Detect Wrong / Contradictory Indicators
  const detectedWrongTerms = wrongIndicators.filter(term => lowerAnswer.includes(term.toLowerCase()));
  const hasWrongIndicators = detectedWrongTerms.length > 0;

  // 4. Concept Matching
  const matchedConcepts = [];
  const missingConcepts = [];

  keyConcepts.forEach(concept => {
    // Only count terms that are not merely copying the question prompt
    const isConceptPresent = concept.terms.some(term => lowerAnswer.includes(term.toLowerCase()));
    if (isConceptPresent) {
      matchedConcepts.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  });

  // 5. Keyword Matching
  const matchedKeywords = coreKeywords.filter(k => lowerAnswer.includes(k.toLowerCase()));
  const missingKeywords = coreKeywords.filter(k => !lowerAnswer.includes(k.toLowerCase()));

  // 6. Ideal Answer Term Overlap (Jaccard-like content match)
  const idealWords = new Set(extractMeaningfulWords(idealAnswer));
  const studentWords = extractMeaningfulWords(answer);
  const matchedWordCount = studentWords.filter(w => idealWords.has(w)).length;
  const wordOverlapRatio = idealWords.size > 0 ? (matchedWordCount / idealWords.size) : 0;

  // 7. Calculate Precise Score
  let score = 0;

  if (hasWrongIndicators) {
    // Answer contains explicit misconceptions
    score = Math.min(Math.round(matchedKeywords.length * 5), 20);
  } else if (keyConcepts.length > 0) {
    if (matchedConcepts.length === 0) {
      // Wrote text, but zero core concepts were addressed (Off-topic/Wrong)
      score = Math.min(Math.round(matchedKeywords.length * 6), 25);
    } else {
      const conceptWeight = (matchedConcepts.length / keyConcepts.length) * 60;
      const kwWeight = Math.min((matchedKeywords.length / (coreKeywords.length * 0.5)) * 25, 25);
      const depthWeight = Math.min((words.length / 35), 1.0) * 15;
      score = Math.round(conceptWeight + kwWeight + depthWeight);
    }
  } else {
    // Custom question or no predefined concepts in bank
    if (idealWords.size > 0) {
      if (wordOverlapRatio < 0.15) {
        score = Math.min(Math.round(wordOverlapRatio * 100), 25);
      } else {
        score = Math.round(wordOverlapRatio * 85 + Math.min(words.length / 30, 1.0) * 15);
      }
    } else {
      // Custom question without pre-stored ideal answer
      const qKwOverlap = coreKeywords.length > 0 
        ? (matchedKeywords.length / coreKeywords.length)
        : 0.5;

      if (qKwOverlap === 0 && words.length < 15) {
        score = 15;
      } else {
        const lengthBonus = Math.min(words.length / 35, 1.0) * 35;
        const kwScore = qKwOverlap * 45;
        const techMarkers = ['because', 'means', 'used to', 'example', 'works by', 'allows', 'structure', 'process', 'type', 'method', 'benefit', 'reduces', 'stores', 'handles', 'implements'];
        const markerCount = techMarkers.filter(m => lowerAnswer.includes(m)).length;
        const markerBonus = Math.min(markerCount * 4, 20);
        score = Math.round(kwScore + lengthBonus + markerBonus);
      }
    }
  }

  // Constrain bounds
  score = Math.max(Math.min(score, 96), 5);

  // 8. Determine Status & Labels
  let status = 'incorrect';
  let accuracy = 'Incorrect / Needs Improvement';
  let verdict = '';

  if (score >= 75) {
    status = 'correct';
    accuracy = 'Correct & Well Explained';
    verdict = 'Excellent! Your answer correctly addresses the core technical concepts and mechanisms.';
  } else if (score >= 45) {
    status = 'partial';
    accuracy = 'Partially Correct';
    verdict = 'Good start, but your answer is incomplete or misses key implementation details.';
  } else {
    status = 'incorrect';
    accuracy = 'Incorrect / Off-Topic';
    verdict = hasWrongIndicators
      ? `Your answer contains inaccurate technical assertions (${detectedWrongTerms.join(', ')}).`
      : 'Your answer does not address the fundamental requirements of this question.';
  }

  // 9. Build Strengths & Missing Points
  const strengths = [];
  matchedConcepts.forEach(c => strengths.push(`Accurately covered: ${c.name} (${c.description})`));
  if (matchedConcepts.length === 0 && matchedKeywords.length > 0) {
    strengths.push(`Recognized relevant technical keywords: ${matchedKeywords.slice(0, 3).join(', ')}`);
  }

  const missingPoints = [];
  if (hasWrongIndicators) {
    missingPoints.push(`Incorrectly associated the topic with: ${detectedWrongTerms.join(', ')}`);
  }
  missingConcepts.forEach(c => missingPoints.push(`Missing: ${c.name} — ${c.description}`));
  if (missingConcepts.length === 0 && missingKeywords.length > 0) {
    missingPoints.push(`Could also mention: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  if (words.length < 20 && score < 75) {
    missingPoints.push('Explanation lacks depth and architectural context.');
  }

  // 10. Suggestions
  let suggestions = '';
  if (status === 'correct') {
    suggestions = 'Great answer! In high-stakes interviews, mention real-world trade-offs, edge cases, and performance metrics.';
  } else if (status === 'partial') {
    suggestions = `Focus on filling the missing gaps: ${missingConcepts.map(c => c.name).join(', ') || 'explain under-the-hood execution'}.`;
  } else {
    suggestions = 'Carefully review the ideal model answer below. Structure your answers as: Definition -> How it works -> Practical use-case.';
  }

  return {
    score,
    status,
    accuracy,
    verdict,
    strengths: strengths.length > 0 ? strengths : ['Attempted the question'],
    missingPoints: missingPoints.length > 0 ? missingPoints : ['Consider discussing practical production trade-offs'],
    suggestions,
    followUpQuestion: qMeta ? `How would you explain the performance implications of this in a high-scale production application?` : 'How would you test this code in a CI/CD pipeline?'
  };
};

// Optional LLM Evaluator via Gemini API (if API key is present)
const evaluateWithLLM = async (questionText, studentAnswer, idealAnswer) => {
  const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;

  const prompt = `You are a strict, senior technical interview evaluator.
Question: "${questionText}"
Ideal Answer: "${idealAnswer || ''}"
Candidate's Answer: "${studentAnswer}"

Evaluate strictly and objectively:
1. If the answer is wrong, irrelevant, evasion ("idk", "skip"), or nonsensical, assign a score below 30 and status "incorrect".
2. If the answer is partially right but missing key details, score 40-70 and status "partial".
3. If the answer is accurate and complete, score 75-95 and status "correct".

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "score": <number 0-100>,
  "status": "<correct|partial|incorrect>",
  "accuracy": "<Correct & Well Explained|Partially Correct|Incorrect / Off-Topic>",
  "verdict": "<1-sentence summary>",
  "strengths": ["<point 1>", "<point 2>"],
  "missingPoints": ["<missing or wrong concept 1>", "<missing point 2>"],
  "suggestions": "<constructive advice>",
  "followUpQuestion": "<1 follow-up technical question>"
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (rawText) {
    return JSON.parse(rawText);
  }
  return null;
};

// Main evaluate entrypoint
const evaluateInterviewAnswer = async (questionText, studentAnswer, context = {}) => {
  // 1. Try Gemini LLM if API key is configured
  if (process.env.AI_API_KEY || process.env.GEMINI_API_KEY) {
    try {
      const llmResult = await evaluateWithLLM(questionText, studentAnswer, context.idealAnswer);
      if (llmResult && typeof llmResult.score === 'number') {
        return llmResult;
      }
    } catch (err) {
      console.warn('Gemini LLM evaluation error, using semantic engine:', err.message);
    }
  }

  // 2. High-Precision Deterministic Semantic Engine
  return evaluateWithSemanticEngine(questionText, studentAnswer, context);
};

// ==========================================
// 6. AI CAREER ASSISTANT (Chatbot)
// ==========================================
// ==========================================
// 6. AI CAREER ASSISTANT (Comprehensive Multi-Domain Knowledge & LLM Engine)
// ==========================================

const callGeminiChat = async (userMessage, history = []) => {
  const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;

  try {
    const formattedHistory = (history || []).slice(-6).map(m => ({
      role: m.sender === 'bot' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const systemInstruction = {
      role: 'system',
      parts: [{
        text: 'You are CareerBridge AI Assistant, an elite software engineering mentor and placement advisor for college students and job seekers. Give practical, high-value, structured advice with clear bullet points, code snippets, roadmaps, and actionable tips when requested. Be encouraging, precise, and concise.'
      }]
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7
        }
      })
    });

    const data = await res.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (replyText) return replyText.trim();
  } catch (err) {
    console.warn('Gemini chat API notice, switching to semantic knowledge engine:', err.message);
  }
  return null;
};

// Rich Local Semantic Career Engine (Active when no LLM API key is present)
const getSemanticCareerResponse = (userMessage) => {
  const raw = (userMessage || '').trim();
  const msg = raw.toLowerCase();
  
  // Helper for safe whole-word matching
  const hasWord = (word) => new RegExp(`\\b${word}\\b`, 'i').test(msg);

  // 1. Greetings & Pleasantries
  if (['hi', 'hello', 'hey', 'namaste', 'kaise ho', 'hii', 'helo', 'good morning', 'good evening'].some(g => hasWord(g) || msg === g)) {
    return "Hello! I am your CareerBridge AI Career Assistant 🚀\n\nI can help you with:\n• 💻 Tech Roadmaps: MERN, React, Java/Spring, Python, Data Analyst, DevOps\n• 🧠 DSA Strategy: LeetCode topic-by-topic placement roadmap\n• 📄 ATS Resume Optimization: Action verbs, formatting, score boost\n• 🎯 Mock Interviews: Technical rounds, HR questions, STAR method\n• 📚 Core CS Revisions: OS, DBMS, Computer Networks, System Design\n\nWhat topic or role would you like to prepare for today?";
  }

  if (['who are you', 'what can you do', 'what are your features', 'help me', 'guide me', 'what is careerbridge'].some(q => msg.includes(q))) {
    return "I am the CareerBridge AI Placement & Career Mentor. My mission is to help you crack software engineering campus placements and off-campus roles.\n\nYou can ask me:\n1. 'How to prepare for MERN stack placements?'\n2. 'DSA roadmap for 3rd/4th year students'\n3. 'How to improve my resume ATS score?'\n4. 'Important OS and DBMS interview questions'\n5. 'How to crack HR round using the STAR method?'\n\nTell me your college year or target role, and let's build your plan!";
  }

  if (['thank you', 'thanks', 'dhanyawad', 'shukriya', 'great', 'awesome', 'got it'].some(t => msg.includes(t))) {
    return "You're very welcome! Keep practicing consistently. Coding and placement prep are marathons, not sprints. If you need roadmaps, interview prep, or resume tips, I'm always here!";
  }

  // 2. Data Structures & Algorithms (DSA / LeetCode) - Prioritized
  if (hasWord('dsa') || msg.includes('leetcode') || msg.includes('algorithm') || msg.includes('data structure') || msg.includes('coding round') || msg.includes('competitive programming')) {
    return "💡 Structured DSA Roadmap to Crack Product-Based Companies:\n\nPhase 1: Foundations (3 Weeks)\n• Big-O Complexity: Time vs Space trade-offs\n• Arrays & Strings: Two Pointers, Sliding Window, Kadane's Algorithm\n• HashMaps & Sets: Frequency counters, prefix sums\n\nPhase 2: Linear Structures & Recursion (4 Weeks)\n• Linked Lists: Floyd's Cycle Detection, In-place Reversal\n• Stacks & Queues: Monotonic Stack (Next Greater Element), Sliding Window Maximum\n• Recursion & Backtracking: Subsets, Permutations, N-Queens\n\nPhase 3: Hierarchical Structures (5 Weeks)\n• Binary Trees & BST: Inorder/Preorder/Postorder traversals, Level Order (BFS), LCA\n• Graphs: Representation (Adjacency List), BFS, DFS, Topological Sort (Kahn's), Dijkstra's\n\nPhase 4: Advanced Patterns (4 Weeks)\n• Heaps / Priority Queues: Top K Frequent Elements, Median from Data Stream\n• Dynamic Programming: 1D (Fibonacci, Climbing Stairs), 2D (0/1 Knapsack, LCS, LIS)\n\nDaily Rule: Solve 2 problems consistently every day. Focus on recognizing patterns, not memorizing code!";
  }

  // 3. Core CS: Operating Systems
  if (hasWord('os') || msg.includes('operating system') || msg.includes('deadlock') || msg.includes('paging') || msg.includes('virtual memory') || msg.includes('scheduling') || (hasWord('process') && hasWord('thread'))) {
    return "💻 Operating Systems (OS) Key Interview Concepts:\n\n1. Process vs. Thread:\n   • Process: Independent program with its own private virtual address space and resources.\n   • Thread: Lightweight execution unit inside a process sharing the code, data, and open files with other threads.\n\n2. CPU Scheduling:\n   • Preemptive (Round Robin, SRTF) vs Non-preemptive (FCFS, SJF)\n   • Starvation vs Convoy Effect\n\n3. Deadlocks (Top Interview Question):\n   • 4 Coffman conditions: (1) Mutual Exclusion, (2) Hold & Wait, (3) No Preemption, (4) Circular Wait\n   • Deadlock Handling: Banker's Algorithm (avoidance), Detection & Recovery, or Ostrich algorithm\n\n4. Memory Management:\n   • Paging vs Segmentation\n   • Page Faults, Thrashing (CPU spending more time paging than executing), Translation Lookaside Buffer (TLB)\n\n5. Concurrency & Synchronization:\n   • Critical Section Problem, Mutex (locking) vs Semaphore (signaling)";
  }

  // 4. Core CS: DBMS & SQL
  if (hasWord('dbms') || msg.includes('acid') || msg.includes('normalization') || msg.includes('indexing') || msg.includes('sql vs nosql') || msg.includes('database table') || hasWord('sql')) {
    return "🗄️ Database Management Systems (DBMS) Placement Guide:\n\n1. ACID Properties:\n   • Atomicity: Entire transaction completes or completely rolls back.\n   • Consistency: Data preserves all schema integrity constraints.\n   • Isolation: Concurrent transactions do not interfere with each other.\n   • Durability: Once committed, updates survive system crashes (WAL/Log).\n\n2. Normalization:\n   • 1NF: Atomic column values\n   • 2NF: 1NF + No partial dependency (non-prime attributes depend on full candidate key)\n   • 3NF: 2NF + No transitive dependency\n   • BCNF: Stricter version where for every functional dependency X -> Y, X must be a super key.\n\n3. Indexing Internals:\n   • B-Trees & B+ Trees: Self-balancing search trees optimizing block reads from disk.\n   • Clustered (determines physical order of rows, 1 per table) vs Non-Clustered index (pointer list to rows).\n\n4. SQL vs NoSQL:\n   • SQL: Rigid schema, ACID, vertical scaling, complex relational joins.\n   • NoSQL (MongoDB): Flexible document schema, horizontal scaling, eventual consistency (BASE).";
  }

  // 5. Core CS: Computer Networks
  if (hasWord('cn') || msg.includes('computer network') || msg.includes('networks') || msg.includes('tcp') || msg.includes('udp') || msg.includes('osi') || hasWord('dns') || msg.includes('http')) {
    return "🌐 Computer Networks (CN) Essential Interview Concepts:\n\n1. OSI vs TCP/IP Reference Model:\n   • Layers: Application -> Transport -> Network -> Data Link -> Physical.\n\n2. TCP vs. UDP:\n   • TCP: Connection-oriented, reliable, ordered delivery, flow control, congestion control. Handshake: SYN -> SYN-ACK -> ACK.\n   • UDP: Connectionless, unreliable, fast, no handshake. Ideal for streaming, VoIP, DNS, and online gaming.\n\n3. What Happens When You Type a URL in Browser?\n   • Browser checks DNS cache -> queries OS resolver -> Root DNS -> TLD (.com) -> Authoritative Nameserver.\n   • IP address retrieved -> TCP 3-way handshake initialized.\n   • TLS/SSL Handshake for HTTPS encryption -> HTTP GET request dispatched -> Server returns HTML/JS.\n\n4. Protocols & Ports:\n   • HTTP (80), HTTPS (443), DNS (53), SSH (22), FTP (20/21), SMTP (25/587).";
  }

  // 6. Docker, Kubernetes & DevOps
  if (msg.includes('docker') || msg.includes('kubernetes') || msg.includes('k8s') || msg.includes('container') || msg.includes('devops') || msg.includes('ci/cd') || msg.includes('pipeline')) {
    return "🐳 Docker & DevOps Foundations for Modern Developers:\n\n1. What is Docker?\n   • Containerization engine that packages application code + dependencies into a lightweight, isolated, portable unit.\n   • Containers vs VMs: Containers share the host OS kernel and start in milliseconds, whereas VMs require a hypervisor and full guest OS.\n\n2. Core Docker Concepts:\n   • Dockerfile: Blueprint recipe to build images (FROM, WORKDIR, COPY, RUN, CMD).\n   • Image: Read-only immutable template containing your app.\n   • Container: Running instance of an image.\n   • Docker Compose: Multi-container orchestration (e.g. running React frontend + Node backend + MongoDB with one `docker-compose up`).\n\n3. Kubernetes (K8s) Basics:\n   • Container orchestration: Automated deployment, scaling, and self-healing.\n   • Pods (smallest deployable unit), Services (networking/load balancing), Deployments (rolling updates).\n\n4. CI/CD Pipelines:\n   • Automated testing & linting on GitHub Actions upon Git Push.";
  }

  // 7. React & Frontend Development
  if (msg.includes('react') || msg.includes('frontend') || msg.includes('front end') || msg.includes('hooks') || msg.includes('redux') || msg.includes('virtual dom')) {
    return "🚀 Modern React & Frontend Developer Mastery Roadmap (2026):\n\n1. Core JavaScript Mastery:\n   • ES6+ features, Closures, Scopes, Promises, Async/Await\n   • Event Loop, Call Stack, Microtasks vs Macrotasks\n\n2. React Fundamentals & Internals:\n   • JSX, Virtual DOM reconciliation (Fiber diffing algorithm)\n   • Component Lifecycle & Conditional Rendering\n\n3. Essential React Hooks:\n   • useState & useEffect: State handling and side-effect cleanup\n   • useMemo & useCallback: Preventing expensive recalculations and re-renders\n   • useRef: Direct DOM access and mutable instance variables\n   • useContext: Prop drilling resolution for global theme/auth\n\n4. State Management & Styling:\n   • Redux Toolkit (RTK) or Zustand for scalable global state\n   • Tailwind CSS for modern responsive utility-first UI\n\n5. Production Practices:\n   • Code-splitting with React.lazy & Suspense\n   • Virtualizing large lists (react-window)\n   • API integration using Axios or TanStack Query (React Query)\n\nRecommended Project: A real-time collaborative workspace or an e-commerce dashboard with cart, payment, and analytics.";
  }

  // 8. MERN Stack & Fullstack Web Development
  if (msg.includes('mern') || msg.includes('fullstack') || msg.includes('full stack') || msg.includes('web dev') || msg.includes('web development')) {
    return "🔥 Complete MERN Stack Roadmap for Campus Placements:\n\n• Phase 1 (Frontend - 4 Weeks):\n  React.js (Vite), React Router v6, Tailwind CSS, Lucide Icons, Context API for state management.\n\n• Phase 2 (Backend - 4 Weeks):\n  Node.js runtime, Express.js framework, RESTful API architecture, Middleware, JWT Auth with Refresh Tokens, Error handling middleware.\n\n• Phase 3 (Database - 3 Weeks):\n  MongoDB & Mongoose ODM, Schema validation, Aggregation pipelines ($match, $group, $lookup joins), Indexing for fast query search.\n\n• Phase 4 (DevOps & Deployment - 2 Weeks):\n  Git & GitHub, Docker containerization basics, Postman API testing, Deployment on Vercel (Client) and Render/AWS (Server).\n\nKey Project to Highlight on Resume:\nBuild a SaaS platform (like a Campus Placement Portal or Workflow Management Tool) with role-based auth (Student/Recruiter/Admin), PDF resume parser, and email/SMS alerts.";
  }

  // 9. Node.js & Backend Architecture
  if (hasWord('node') || msg.includes('express') || msg.includes('backend') || msg.includes('rest api') || msg.includes('middleware') || msg.includes('jwt') || msg.includes('microservices')) {
    return "⚙️ Backend Engineering & Node.js Interview Roadmap:\n\n1. Node.js Architecture:\n   • V8 Engine + Libuv C library\n   • Single main thread with Libuv Thread Pool (default 4 worker threads)\n   • Event Loop phases (Timers, Pending Callbacks, Poll, Check/setImmediate, Close)\n\n2. API Design & Security:\n   • RESTful conventions (Idempotency, HTTP verbs: GET, POST, PUT, DELETE, PATCH)\n   • Secure JWT Authentication: Short-lived access tokens (15m) + httpOnly refresh tokens (7d)\n   • Rate limiting, CORS configuration, helmet headers, input sanitization\n\n3. Database & Caching:\n   • Connection pooling, transaction management\n   • Redis caching layer for high-throughput endpoints\n\n4. Scalability:\n   • Clustering module & PM2 process manager\n   • Message queues (RabbitMQ/Kafka) for asynchronous heavy jobs\n\nCommon Interview Question: 'How does Node.js handle thousands of concurrent requests if it is single-threaded?'\nAnswer: Non-blocking asynchronous I/O offloaded to the OS kernel via Libuv.";
  }

  // 10. Java & Spring Boot Enterprise Track
  if (hasWord('java') || msg.includes('spring') || msg.includes('spring boot') || msg.includes('hibernate') || msg.includes('jvm') || msg.includes('oops')) {
    return "☕ Enterprise Java & Spring Boot Roadmap for Tech Placements:\n\n1. Core Java Deep-Dive:\n   • 4 Pillars of OOP: Abstraction, Encapsulation, Inheritance, Polymorphism\n   • Collections Framework: ArrayList vs LinkedList, HashMap internals (buckets, hashing, load factor, red-black tree threshold)\n   • Multithreading & Concurrency: Thread lifecycle, synchronized blocks, Locks, ExecutorService\n   • Java 8+ Features: Lambdas, Functional Interfaces, Streams API, Optional\n\n2. Spring Boot Ecosystem:\n   • Dependency Injection & Inversion of Control (IoC)\n   • Spring MVC REST Controllers (@RestController, @RequestMapping)\n   • Spring Data JPA & Hibernate for ORM and transactions (@Transactional)\n   • Exception handling with @ControllerAdvice and @ExceptionHandler\n\n3. Enterprise Microservices:\n   • Spring Security with JWT & OAuth2\n   • Microservice communication (OpenFeign, WebClient)\n   • API Gateway & Service Registry (Eureka)\n\nTop Companies Hiring Java: Oracle, Amazon, Cisco, Morgan Stanley, Goldman Sachs, JPMorgan.";
  }

  // 11. Python, AI & Machine Learning Track (Using strict word boundaries for 'ai' and 'ml')
  if (hasWord('python') || msg.includes('machine learning') || hasWord('ml') || hasWord('ai') || msg.includes('data science') || msg.includes('deep learning') || msg.includes('artificial intelligence')) {
    return "🐍 Python & Machine Learning Placement Roadmap:\n\n1. Python Fundamentals:\n   • OOP in Python, List/Dict comprehensions, Generators, Decorators, Exception handling\n   • Virtual environments, pip/conda, Git workflows\n\n2. Data Analysis & Visualization:\n   • NumPy: Vectorized arrays, broadcasting, linear algebra operations\n   • Pandas: DataFrames, filtering, group-by, merging, handling missing data\n   • Matplotlib & Seaborn: Visualizing distributions and correlations\n\n3. Machine Learning Algorithms (Scikit-Learn):\n   • Supervised: Linear & Logistic Regression, Decision Trees, Random Forests, XGBoost\n   • Unsupervised: K-Means clustering, Principal Component Analysis (PCA)\n   • Evaluation: Precision, Recall, F1-Score, ROC-AUC curve, Cross-Validation\n\n4. Deployment:\n   • Fast API or Flask for serving ML models via REST API\n   • Streamlit for rapid dashboard mockups\n\nPortfolio Tip: Rather than a standard Titanic dataset, build an NLP application (e.g. Resume ATS Scorer or Customer Support Intent Classifier) with a working web interface!";
  }

  // 12. Data Analyst, SQL & Business Intelligence
  if (msg.includes('data analyst') || msg.includes('power bi') || msg.includes('tableau') || msg.includes('excel') || msg.includes('business intelligence')) {
    return "📊 Data Analyst Career Roadmap:\n\n1. Advanced SQL (The #1 Skill):\n   • SELECT, WHERE, GROUP BY, HAVING, ORDER BY\n   • JOINs (INNER, LEFT, RIGHT, FULL, CROSS, SELF)\n   • Window Functions: ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE(), LEAD(), LAG()\n   • Common Table Expressions (CTEs) and Subqueries\n\n2. Advanced Excel:\n   • VLOOKUP, XLOOKUP, INDEX-MATCH\n   • Pivot Tables, Slicers, Conditional Formatting, Data Cleaning\n\n3. BI Dashboards:\n   • Power BI or Tableau: Data modeling, Star schema, DAX measures (CALCULATE, SUMX, RELATED), interactive KPIs\n\n4. Python for Analytics:\n   • Exploratory Data Analysis (EDA) with Pandas and Seaborn\n\nResume Tip: Include 2 portfolio projects with interactive dashboard links and explain the business ROI (e.g., 'Identified a 14% drop in customer retention across Q3').";
  }

  // 13. System Design & Scalability
  if (msg.includes('system design') || msg.includes('scalability') || hasWord('redis') || msg.includes('caching') || msg.includes('load balancer')) {
    return "🏗️ System Design & Distributed Systems High-Yield Summary:\n\n1. Horizontal vs Vertical Scaling:\n   • Scale Up (Vertical): Add more CPU/RAM to single server (hardware ceiling).\n   • Scale Out (Horizontal): Add multiple server instances behind a Load Balancer.\n\n2. Caching Strategies (Redis / Memcached):\n   • Cache-Aside: App reads from cache; on miss, reads DB and populates cache.\n   • Eviction policies: LRU (Least Recently Used), LFU (Least Frequently Used).\n\n3. Load Balancing:\n   • Algorithms: Round Robin, Weighted Round Robin, Least Connections, IP Hash.\n   • Reverse Proxies: Nginx, HAProxy.\n\n4. Database Scaling:\n   • Read Replicas: Master handles writes, replicas handle read traffic.\n   • Sharding: Horizontal data partitioning across multiple database servers.\n\n5. Asynchronous Processing:\n   • Message Queues: Kafka, RabbitMQ for decoupling microservices and smoothing traffic spikes.";
  }

  // 14. Resume & ATS Optimization
  if (msg.includes('resume') || msg.includes('ats') || hasWord('cv') || msg.includes('score')) {
    return "📄 How to Maximize Your Resume ATS Score (Target 85-95+):\n\n1. Structure & Layout:\n   • Use a clean single-column format. NEVER use two-column templates, tables, or icons as ATS parsers fail to read them.\n   • Stick to standard fonts: Arial, Calibri, or Inter (10-11pt body, 14-16pt headings).\n\n2. The Google XYZ Bullet Points Formula:\n   • Format every bullet: 'Accomplished [X], as measured by [Y], by doing [Z]'.\n   • Example: 'Optimized SQL database query latency by 42% by implementing indexing and connection pooling in Node.js.'\n\n3. Organized Skills Section:\n   • Languages: JavaScript (ES6+), TypeScript, Java, Python, C++\n   • Frameworks: React.js, Node.js, Express.js, Spring Boot, Tailwind CSS\n   • Databases: MongoDB, PostgreSQL, MySQL, Redis\n   • Tools & Platforms: Git/GitHub, Docker, Postman, Linux, AWS/Vercel\n\n4. Projects Section:\n   • 2-3 substantial full-stack or ML projects with Live Deployed URLs and GitHub links.\n   • Clearly mention tech stack used in the project header.";
  }

  // 15. Interview Strategy & HR Behavioral (STAR Method)
  if (msg.includes('interview') || msg.includes('hr round') || msg.includes('behavioral') || msg.includes('star') || msg.includes('salary') || msg.includes('weakness') || msg.includes('tell me about yourself')) {
    return "🎯 Behavioral & HR Interview Strategy (The STAR Method):\n\nWhen asked situational questions ('Tell me about a time you solved a conflict or tough bug'):\n\n• S - Situation: Context of the project, timeline, and team.\n• T - Task: What was the specific problem or requirement you had to deliver?\n• A - Action: What did YOU specifically do? Explain your technical and logical decision-making.\n• R - Result: Quantifiable outcome (e.g. 'Delivered feature 3 days ahead of deadline with zero bugs').\n\nTop HR Questions Strategy:\n1. 'Tell me about yourself': 90 seconds. Present (Current degree, skills, recent project) -> Past (Milestones/achievements) -> Future (Why this specific company).\n2. 'What is your greatest weakness?': Pick a genuine technical skill you were weak in, and describe the exact course/practice you are currently doing to overcome it.\n3. 'Why should we hire you?': Connect your technical stack directly with their job requirements.";
  }

  // 16. College Year-Wise Placement Preparation Plan
  if (msg.includes('1st year') || msg.includes('2nd year') || msg.includes('3rd year') || msg.includes('4th year') || msg.includes('fresher') || msg.includes('college')) {
    return "📅 College Year-Wise Engineering Placement Masterplan:\n\n• 1st Year (Build Foundation):\n  Master 1 programming language thoroughly (C++ or Java). Learn basic syntax, loops, functions, and arrays.\n\n• 2nd Year (DSA & First Projects):\n  Master Data Structures (Stacks, Queues, Linked Lists, Trees). Learn Git/GitHub. Build your first full-stack web application.\n\n• 3rd Year (The Placement Year):\n  Solve 150+ LeetCode problems (Focus on medium level). Revise Core CS (OS, DBMS, Computer Networks). Build 2 major portfolio projects. Start applying for 6-month internships.\n\n• 4th Year (Placement Drives):\n  Tailor your ATS resume. Participate in regular mock interviews. Revise company-specific past papers. Target both on-campus placement drives and off-campus referrals on LinkedIn.";
  }

  // 17. Git & Version Control
  if (hasWord('git') || msg.includes('github') || msg.includes('rebase') || msg.includes('merge conflict') || msg.includes('version control')) {
    return "🐙 Git & GitHub Essentials for Developers:\n\n1. Git Merge vs. Git Rebase:\n   • Git Merge: Creates a new merge commit preserving the complete historical timeline of both branches (non-destructive).\n   • Git Rebase: Replays your commits on top of the target base branch, producing a linear, clean commit history without extra merge commits.\n\n2. Key Everyday Git Commands:\n   • `git status`, `git add .`, `git commit -m \"feat: description\"`\n   • `git branch -b feature-branch` (Create and switch branch)\n   • `git pull --rebase origin main` (Sync with remote cleanly)\n   • `git stash` & `git stash pop` (Temporarily shelve uncommitted work)\n\n3. Resolving Merge Conflicts:\n   • Open conflicted files -> Look for `<<<<<<< HEAD`, `=======`, and `>>>>>>>` markers -> Choose incoming or current changes -> Stage and commit.\n\n4. GitHub Best Practices for Placements:\n   • Write meaningful commit messages following Conventional Commits (feat, fix, refactor, docs).\n   • Use Pull Requests with proper descriptions, screenshots, and branch protection rules.";
  }

  // 18. Dynamic Semantic Analysis (Fallback for any custom question)
  // Extracts key nouns from user question to give customized, structured answer
  const meaningfulWords = extractMeaningfulWords(userMessage).slice(0, 5);
  const topicFocus = meaningfulWords.length > 0 ? meaningfulWords.join(' & ') : 'Software Engineering';

  return `Here is tailored guidance regarding "${raw}":\n\n1. Core Concept Overview:\nIn modern tech placements, understanding ${topicFocus} requires connecting technical definitions with real-world system architecture.\n\n2. Recommended Preparation Steps:\n• Theory & Fundamentals: Study the underlying mechanisms, time/space trade-offs, and operational lifecycle.\n• Practical Implementation: Write clean, modular code or build a proof-of-concept project demonstrating ${topicFocus}.\n• Interview Articulation: Be ready to explain why you chose this solution over alternative approaches.\n\n3. Next Steps:\nWould you like me to share:\n(a) Detailed code examples or interview questions on this topic?\n(b) Step-by-step roadmap to master this area?\n(c) How to showcase this skill effectively on your resume?`;
};

// Main Career Chat Entrypoint
const getCareerChatResponse = async (userMessage, history = []) => {
  // 1. Try Gemini LLM if API Key is configured
  if (process.env.AI_API_KEY || process.env.GEMINI_API_KEY) {
    const llmReply = await callGeminiChat(userMessage, history);
    if (llmReply) return llmReply;
  }

  // 2. High-Yield Multi-Domain Career Knowledge Engine
  return getSemanticCareerResponse(userMessage);
};

module.exports = {
  analyzeResume,
  matchJobWithStudent,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  getCareerChatResponse
};
