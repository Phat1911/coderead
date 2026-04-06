import { Challenge } from '@/types/challenge'

export const challenges: Challenge[] = [
  {
    id: '1',
    title: 'What does this function return?',
    description: 'A common JavaScript function used in almost every AI-generated app.',
    language: 'javascript',
    difficulty: 'beginner',
    code: `function formatName(firstName, lastName) {
  if (!firstName && !lastName) {
    return 'Anonymous'
  }
  return \`\${firstName} \${lastName}\`.trim()
}`,
    question: 'What does this function return if you call formatName("", "Tran")?',
    explanation: `It returns "Tran". 
Here is why: the first check (!firstName && !lastName) requires BOTH to be empty to return "Anonymous". Since lastName is "Tran", that condition is false. 
The template literal produces " Tran" (with a leading space), and .trim() removes that space, giving you "Tran".
Key insight: && means BOTH conditions must be true. If only one is empty, it falls through to the return statement.`,
    keyConceptsToSpot: ['&& vs || logic', 'template literals', '.trim()', 'truthy/falsy values']
  },
  {
    id: '2',
    title: 'Spot the async pattern',
    description: 'AI generates this pattern constantly when fetching data from an API.',
    language: 'javascript',
    difficulty: 'beginner',
    code: `async function getUser(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
}`,
    question: 'What does this function return if the API call fails?',
    explanation: `It returns null.
When the fetch fails (network error, server down), JavaScript throws an error. The catch block catches that error, logs it to the console, and returns null instead of crashing.
Key insight: async/await functions always need try/catch. Without it, errors would crash your app silently. The return null is a safe fallback so the rest of your code does not break.`,
    keyConceptsToSpot: ['async/await', 'try/catch error handling', 'fetch API', 'return null as fallback']
  },
  {
    id: '3',
    title: 'Read this React hook',
    description: 'The most common React pattern AI writes for managing component data.',
    language: 'typescript',
    difficulty: 'beginner',
    code: `import { useState, useEffect } from 'react'

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width
}`,
    question: 'What does the "return () =>" line inside useEffect do?',
    explanation: `It is a cleanup function. React runs it when the component is removed from the screen.
Without it, every time this component mounts it would add a new resize listener. Over time you would have dozens of listeners stacking up, causing memory leaks and performance issues.
The cleanup says: "When this component is gone, remove the listener you added."
Key insight: The [] at the end of useEffect means "run this once when the component appears." The return function means "run this when it disappears."`,
    keyConceptsToSpot: ['useState', 'useEffect cleanup', 'event listeners', 'memory leaks', 'empty dependency array']
  },
  {
    id: '4',
    title: 'Trace this array transformation',
    description: 'AI uses this pattern to transform lists of data before displaying them.',
    language: 'typescript',
    difficulty: 'intermediate',
    code: `const users = [
  { id: 1, name: 'Phat', active: true },
  { id: 2, name: 'Nam', active: false },
  { id: 3, name: 'Linh', active: true },
]

const activeNames = users
  .filter(user => user.active)
  .map(user => user.name.toUpperCase())`,
    question: 'What is the value of activeNames after this code runs?',
    explanation: `The value is ["PHAT", "LINH"].
Step 1 - .filter(): Goes through every user, keeps only the ones where active is true. That gives you Phat and Linh. Nam is removed.
Step 2 - .map(): Takes each remaining user and returns just their name in uppercase.
Result: ["PHAT", "LINH"]
Key insight: filter reduces the array (removes items), map transforms it (changes each item). Chaining them is one of the most common patterns in AI-generated code.`,
    keyConceptsToSpot: ['.filter()', '.map()', 'method chaining', 'arrow functions', '.toUpperCase()']
  },
  {
    id: '5',
    title: 'Read this error message pattern',
    description: 'Understanding how AI structures error responses from a backend API.',
    language: 'typescript',
    difficulty: 'intermediate',
    code: `async function createPost(title: string, content: string) {
  if (!title.trim()) {
    throw new Error('Title is required')
  }
  if (content.length < 10) {
    throw new Error('Content must be at least 10 characters')
  }

  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}`,
    question: 'How many different ways can this function throw an error?',
    explanation: `Three ways:
1. If title is empty or just spaces - throws "Title is required" before any network call.
2. If content is shorter than 10 characters - throws the length error before any network call.
3. If the server responds with a non-OK status (400, 404, 500, etc.) - reads the error from the server and throws it.
Key insight: Good AI-generated functions validate input BEFORE calling the API. This saves unnecessary network requests. The !response.ok check is how you detect server errors - a response can "succeed" technically (no network failure) but still return an error status from the server.`,
    keyConceptsToSpot: ['input validation', 'throw new Error', 'response.ok', 'JSON.stringify', 'multiple error paths']
  }
]
