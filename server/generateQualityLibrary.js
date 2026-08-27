const fs = require('fs');

const baseQuestions = [
  // JAVASCRIPT
  {
    baseId: 'js-closures',
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: 'INTERMEDIATE',
    category: 'technical',
    skills: ['javascript'],
    question: 'How do closures work in JavaScript, and what are some practical use cases where you would rely on them?',
    strong: 'If you use closures extensively, how do you prevent memory leaks associated with them?',
    neutral: 'Can you write a brief example showing how a closure maintains access to its outer scope?',
    weak: 'What exactly is the scope chain, and how does it relate to the concept of a closure?'
  },
  {
    baseId: 'js-eventloop',
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: 'ADVANCED',
    category: 'technical',
    skills: ['javascript', 'node.js'],
    question: 'Explain the JavaScript event loop. How do microtasks and macrotasks differ in execution priority?',
    strong: 'How does this execution model impact CPU-intensive operations, and what architectural solutions mitigate this?',
    neutral: 'Could you trace the execution order if we have a setTimeout and a Promise.resolve in the same block?',
    weak: 'Why is JavaScript considered single-threaded if it can handle asynchronous operations?'
  },
  
  // REACT
  {
    baseId: 'react-hooks',
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: 'BEGINNER',
    category: 'technical',
    skills: ['react'],
    question: 'What are React Hooks, and what problems do they solve compared to class components?',
    strong: 'How does React internally track the state of hooks between renders?',
    neutral: 'Can you explain the rules of hooks and why they cannot be called conditionally?',
    weak: 'What is the primary difference between state and props in a React component?'
  },
  {
    baseId: 'react-perf',
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: 'ADVANCED',
    category: 'technical',
    skills: ['react', 'performance'],
    question: 'Describe how you would identify and resolve unnecessary re-renders in a complex React application.',
    strong: 'When would you choose useMemo over React.memo, and what are the hidden costs of memoization?',
    neutral: 'Can you provide an example of how you used the React Profiler to find a bottleneck?',
    weak: 'What exactly triggers a component to re-render in React by default?'
  },

  // NODE.JS
  {
    baseId: 'node-async',
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: 'INTERMEDIATE',
    category: 'technical',
    skills: ['node.js', 'backend'],
    question: 'How does Node.js handle high-concurrency without creating a new OS thread per request?',
    strong: 'If your application is blocking the event loop with synchronous cryptography, how would you fix it using Worker Threads?',
    neutral: 'Can you explain how the libuv library contributes to Node.js asynchronous I/O?',
    weak: 'What is a callback function and why is it used heavily in older Node APIs?'
  },

  // MONGODB
  {
    baseId: 'mongo-schema',
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: 'INTERMEDIATE',
    category: 'technical',
    skills: ['mongodb', 'databases'],
    question: 'When designing a schema in MongoDB, how do you decide between embedding documents versus referencing them?',
    strong: 'How does document size limit affect your decision, and how do you handle unbounded arrays?',
    neutral: 'Can you give an example of a relationship that is strictly better as a reference?',
    weak: 'What is the fundamental difference between a NoSQL database like MongoDB and a relational database?'
  },

  // SQL
  {
    baseId: 'sql-joins',
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: 'BEGINNER',
    category: 'technical',
    skills: ['sql', 'databases'],
    question: 'Can you explain the difference between an INNER JOIN and a LEFT JOIN in SQL?',
    strong: 'How do you optimize join performance across tables containing millions of rows?',
    neutral: 'Provide an example scenario where a FULL OUTER JOIN would be the only correct approach.',
    weak: 'What is a primary key, and how does it relate to foreign keys when joining tables?'
  },

  // OOP
  {
    baseId: 'oop-poly',
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: 'INTERMEDIATE',
    category: 'technical',
    skills: ['oop', 'architecture'],
    question: 'What is polymorphism in Object-Oriented Programming, and how does it enhance code maintainability?',
    strong: 'How does polymorphism interact with the Liskov Substitution Principle?',
    neutral: 'Can you provide a code example where you used interfaces to achieve polymorphic behavior?',
    weak: 'What is the difference between overriding and overloading a method?'
  },

  // SYSTEM DESIGN
  {
    baseId: 'sys-rate-limit',
    domain: 'Software Engineering',
    type: 'SYSTEM_DESIGN',
    difficulty: 'ADVANCED',
    category: 'technical',
    skills: ['system design', 'rate limiting', 'distributed systems'],
    question: 'How would you design a distributed rate limiter for a public-facing API?',
    strong: 'If a Redis instance storing your rate limit counters fails, how does your system recover without allowing a flood of requests?',
    neutral: 'Compare the token bucket algorithm with the sliding window log algorithm for this use case.',
    weak: 'What is the basic purpose of rate limiting in a web architecture?'
  },

  // BEHAVIORAL
  {
    baseId: 'beh-conflict',
    domain: 'Software Engineering',
    type: 'BEHAVIORAL',
    difficulty: 'INTERMEDIATE',
    category: 'behavioral',
    skills: ['conflict resolution', 'communication'],
    question: 'Describe a time when you had a fundamental technical disagreement with a senior engineer. How did you handle it?',
    strong: 'If the decision ultimately went against your recommendation and later caused a production incident, how would you address it post-mortem?',
    neutral: 'What specific data or metrics did you bring to the discussion to support your view?',
    weak: 'Why is it important to maintain professional communication during disagreements?'
  }
];

const library = [];

baseQuestions.forEach(item => {
  // Primary Question
  const primaryObj = {
    id: item.baseId,
    domain: item.domain,
    type: item.type,
    difficulty: item.difficulty,
    category: item.category,
    skills: item.skills,
    question: item.question,
    followUps: {
      strong: [`${item.baseId}-followup-strong`],
      neutral: [`${item.baseId}-followup-neutral`],
      weak: [`${item.baseId}-followup-weak`]
    }
  };
  library.push(primaryObj);

  // Strong Follow Up
  library.push({
    id: `${item.baseId}-followup-strong`,
    domain: item.domain,
    type: item.type,
    difficulty: item.difficulty,
    category: 'follow-up',
    skills: [],
    question: item.strong,
    followUps: { strong: [], neutral: [], weak: [] }
  });

  // Neutral Follow Up
  library.push({
    id: `${item.baseId}-followup-neutral`,
    domain: item.domain,
    type: item.type,
    difficulty: item.difficulty,
    category: 'follow-up',
    skills: [],
    question: item.neutral,
    followUps: { strong: [], neutral: [], weak: [] }
  });

  // Weak Follow Up
  library.push({
    id: `${item.baseId}-followup-weak`,
    domain: item.domain,
    type: item.type,
    difficulty: item.difficulty,
    category: 'follow-up',
    skills: [],
    question: item.weak,
    followUps: { strong: [], neutral: [], weak: [] }
  });
});

fs.writeFileSync('./src/data/questionLibrary.json', JSON.stringify(library, null, 2));

console.log(`Generated highly curated library of ${library.length} questions (including follow-ups).`);
