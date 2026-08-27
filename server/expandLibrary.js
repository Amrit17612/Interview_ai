const fs = require('fs');
const path = require('path');

// Keep original questions
const originalLibrary = require('./src/data/questionLibrary.json');

const library = [...originalLibrary];
const usedIds = new Set(library.map(q => q.id));

let nextIdCounter = 1000;
const generateId = (prefix) => {
  let newId = `${prefix}-${nextIdCounter++}`;
  while (usedIds.has(newId)) {
    newId = `${prefix}-${nextIdCounter++}`;
  }
  usedIds.add(newId);
  return newId;
};

// Data templates to procedurally generate questions
const techTopics = [
  { skill: 'javascript', topics: ['closures', 'promises', 'event loop', 'hoisting', 'es6 features', 'prototypal inheritance', 'async/await', 'scope', 'this keyword', 'arrow functions'] },
  { skill: 'react', topics: ['hooks', 'context api', 'virtual dom', 'useeffect', 'component lifecycle', 'state management', 'performance optimization', 'react router', 'server components', 'custom hooks'] },
  { skill: 'node.js', topics: ['event emitter', 'streams', 'buffers', 'child processes', 'cluster module', 'error handling', 'npm', 'middleware', 'event loop in node', 'asynchronous patterns'] },
  { skill: 'express', topics: ['routing', 'middleware', 'error handling', 'authentication integration', 'restful routes', 'request body parsing', 'security headers', 'rate limiting in express', 'sessions', 'cors'] },
  { skill: 'mongodb', topics: ['aggregation framework', 'indexing', 'replica sets', 'sharding', 'crud operations', 'schema design', 'transactions', 'mongoose', 'query optimization', 'data modeling'] },
  { skill: 'sql', topics: ['joins', 'indexes', 'transactions', 'normalization', 'subqueries', 'window functions', 'stored procedures', 'triggers', 'views', 'query execution plans'] },
  { skill: 'java', topics: ['jvm', 'garbage collection', 'multithreading', 'collections framework', 'generics', 'exception handling', 'streams api', 'lambdas', 'interfaces', 'spring boot basics'] },
  { skill: 'c++', topics: ['pointers', 'memory management', 'raii', 'stl', 'templates', 'move semantics', 'smart pointers', 'virtual functions', 'multithreading', 'object slicing'] },
  { skill: 'python', topics: ['generators', 'decorators', 'list comprehensions', 'gil', 'multiprocessing', 'dunder methods', 'virtual environments', 'type hinting', 'pandas basics', 'flask vs django'] },
  { skill: 'html/css', topics: ['flexbox', 'css grid', 'accessibility', 'semantic html', 'responsive design', 'css specificity', 'animations', 'preprocessors', 'dom', 'web components'] },
  { skill: 'rest apis', topics: ['http methods', 'status codes', 'authentication', 'rate limiting', 'versioning', 'caching', 'hateoas', 'pagination', 'idempotency', 'openapi'] },
  { skill: 'git', topics: ['branching strategies', 'rebase vs merge', 'cherry-pick', 'resolving conflicts', 'stash', 'git hooks', 'reflog', 'submodules', 'reset vs checkout', 'squashing'] },
  { skill: 'computer networks', topics: ['osi model', 'tcp vs udp', 'dns', 'http/2', 'websockets', 'ssl/tls', 'load balancing', 'cdns', 'bgp', 'subnets'] },
  { skill: 'oop', topics: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'solid principles', 'design patterns', 'composition vs inheritance', 'interfaces', 'dependency injection', 'singleton'] },
  { skill: 'data structures', topics: ['arrays vs linked lists', 'hash tables', 'binary search trees', 'graphs', 'heaps', 'stacks and queues', 'tries', 'avl trees', 'graph traversals', 'dynamic programming'] },
  { skill: 'system design', topics: ['microservices', 'caching strategies', 'database scaling', 'message queues', 'api gateways', 'event sourcing', 'cap theorem', 'consistent hashing', 'cdn', 'sharding'] },
];

const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const generateTechnicalQuestion = (topic, skill, diff) => {
  const baseId = generateId(`tech-${skill.replace(/[^a-z]/g, '')}`);
  const qObj = {
    id: baseId,
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: diff,
    category: 'technical',
    skills: [skill],
    question: `Can you explain the concept of ${topic} in ${skill}? How is it applied in a typical application?`,
    followUps: { strong: [], neutral: [], weak: [] }
  };

  // Adjust wording by difficulty
  if (diff === 'INTERMEDIATE') {
    qObj.question = `Describe a scenario where understanding ${topic} in ${skill} is critical for performance or maintainability. What are the common pitfalls?`;
  } else if (diff === 'ADVANCED') {
    qObj.question = `How does the underlying architecture of ${skill} handle ${topic} at scale? Discuss edge cases and trade-offs you would consider in a distributed environment.`;
  }

  // Create FollowUps
  const strongFollowUpId = generateId(`${baseId}-followup-strong`);
  library.push({
    id: strongFollowUpId,
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: diff,
    category: 'follow-up',
    skills: [],
    question: `If you had to optimize this further for a highly constrained environment, what advanced techniques regarding ${topic} would you use?`,
    followUps: { strong: [], neutral: [], weak: [] }
  });
  qObj.followUps.strong.push(strongFollowUpId);

  const neutralFollowUpId = generateId(`${baseId}-followup-neutral`);
  library.push({
    id: neutralFollowUpId,
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: diff,
    category: 'follow-up',
    skills: [],
    question: `Can you provide a specific code example or real-world use case where you implemented ${topic}?`,
    followUps: { strong: [], neutral: [], weak: [] }
  });
  qObj.followUps.neutral.push(neutralFollowUpId);

  const weakFollowUpId = generateId(`${baseId}-followup-weak`);
  library.push({
    id: weakFollowUpId,
    domain: 'Software Engineering',
    type: 'TECHNICAL',
    difficulty: diff,
    category: 'follow-up',
    skills: [],
    question: `Let's step back. What is the fundamental purpose of ${topic}, and why was it introduced in ${skill}?`,
    followUps: { strong: [], neutral: [], weak: [] }
  });
  qObj.followUps.weak.push(weakFollowUpId);

  library.push(qObj);
};

// Generate Technical Questions (16 skills * 10 topics * 3 diffs = 480 questions + followups)
techTopics.forEach(({ skill, topics }) => {
  topics.forEach(topic => {
    difficulties.forEach(diff => {
      // Create some variation in types if skill is system design
      if (skill === 'system design') {
        const baseId = generateId(`sys-${skill.replace(/[^a-z]/g, '')}`);
        const qObj = {
          id: baseId,
          domain: 'Software Engineering',
          type: 'SYSTEM_DESIGN',
          difficulty: diff,
          category: 'technical',
          skills: [skill, 'architecture', 'distributed systems'],
          question: `How would you approach designing a system that relies heavily on ${topic}? What are the primary bottlenecks?`,
          followUps: { strong: [], neutral: [], weak: [] }
        };
        // Add followups
        const strongFollowUpId = generateId(`${baseId}-followup-strong`);
        library.push({
          id: strongFollowUpId,
          domain: 'Software Engineering',
          type: 'SYSTEM_DESIGN',
          difficulty: diff,
          category: 'follow-up',
          skills: [],
          question: `How does CAP theorem impact your decisions when implementing ${topic} across multiple regions?`,
          followUps: { strong: [], neutral: [], weak: [] }
        });
        qObj.followUps.strong.push(strongFollowUpId);

        const neutralFollowUpId = generateId(`${baseId}-followup-neutral`);
        library.push({
          id: neutralFollowUpId,
          domain: 'Software Engineering',
          type: 'SYSTEM_DESIGN',
          difficulty: diff,
          category: 'follow-up',
          skills: [],
          question: `Walk me through the data flow when a user request interacts with the ${topic} component.`,
          followUps: { strong: [], neutral: [], weak: [] }
        });
        qObj.followUps.neutral.push(neutralFollowUpId);

        const weakFollowUpId = generateId(`${baseId}-followup-weak`);
        library.push({
          id: weakFollowUpId,
          domain: 'Software Engineering',
          type: 'SYSTEM_DESIGN',
          difficulty: diff,
          category: 'follow-up',
          skills: [],
          question: `What is the basic definition of ${topic} and when should it NOT be used?`,
          followUps: { strong: [], neutral: [], weak: [] }
        });
        qObj.followUps.weak.push(weakFollowUpId);

        library.push(qObj);
      } else {
        generateTechnicalQuestion(topic, skill, diff);
      }
    });
  });
});

// Generate some BEHAVIORAL and GENERAL questions
const behavioralSkills = ['communication', 'learning', 'conflict resolution', 'collaboration', 'leadership', 'project management', 'problem solving'];
const behavioralTopics = ['handling failure', 'tight deadlines', 'difficult team members', 'learning curves', 'managing expectations'];

behavioralSkills.forEach(skill => {
  behavioralTopics.forEach(topic => {
    const baseId = generateId(`beh-${skill.replace(/[^a-z]/g, '')}`);
    const qObj = {
      id: baseId,
      domain: 'Software Engineering',
      type: 'BEHAVIORAL',
      difficulty: 'INTERMEDIATE',
      category: 'behavioral',
      skills: [skill],
      question: `Tell me about a time you utilized your ${skill} skills when dealing with ${topic}. What was the outcome?`,
      followUps: { strong: [], neutral: [], weak: [] }
    };

    const strongFollowUpId = generateId(`${baseId}-followup-strong`);
    library.push({
      id: strongFollowUpId,
      domain: 'Software Engineering',
      type: 'BEHAVIORAL',
      difficulty: 'INTERMEDIATE',
      category: 'follow-up',
      skills: [],
      question: `What proactive measures have you since put in place to prevent similar issues regarding ${topic}?`,
      followUps: { strong: [], neutral: [], weak: [] }
    });
    qObj.followUps.strong.push(strongFollowUpId);

    const neutralFollowUpId = generateId(`${baseId}-followup-neutral`);
    library.push({
      id: neutralFollowUpId,
      domain: 'Software Engineering',
      type: 'BEHAVIORAL',
      difficulty: 'INTERMEDIATE',
      category: 'follow-up',
      skills: [],
      question: `Who else was involved in that situation, and how did they react to your approach?`,
      followUps: { strong: [], neutral: [], weak: [] }
    });
    qObj.followUps.neutral.push(neutralFollowUpId);

    const weakFollowUpId = generateId(`${baseId}-followup-weak`);
    library.push({
      id: weakFollowUpId,
      domain: 'Software Engineering',
      type: 'BEHAVIORAL',
      difficulty: 'INTERMEDIATE',
      category: 'follow-up',
      skills: [],
      question: `Could you clarify the specific steps you took individually versus the team's contribution?`,
      followUps: { strong: [], neutral: [], weak: [] }
    });
    qObj.followUps.weak.push(weakFollowUpId);

    library.push(qObj);
  });
});

fs.writeFileSync('./src/data/questionLibrary.json', JSON.stringify(library, null, 2));

console.log(`Generated total of ${library.length} questions in library.`);
