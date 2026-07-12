export const projects = [
  { id: 'rag-research', name: 'RAG Research', count: 9 },
  { id: 'extension-build', name: 'Extension Build', count: 6 },
  { id: 'hackathon-ops', name: 'Hackathon Ops', count: 3 },
]

export const memories = [
  {
    id: '1',
    title: 'Vector Databases, Explained',
    url: 'https://pinecone.io/learn/vector-databases',
    domain: 'pinecone.io',
    projectId: 'rag-research',
    savedAt: '2026-07-07T10:00:00Z',
    summary:
      'A walkthrough of how vector databases index high-dimensional embeddings and use approximate nearest-neighbor search to retrieve semantically similar items quickly.',
    content:
      'Vector databases store embeddings — numerical representations of text, images, or audio — and let you query for the nearest vectors to a given point. Instead of matching exact keywords, they match meaning. Most production systems use approximate nearest-neighbor (ANN) algorithms like HNSW to keep search fast even at millions of vectors, trading a small amount of accuracy for large speed gains.',
    tags: ['embeddings', 'infrastructure'],
  },
  {
    id: '2',
    title: 'Chunking Strategies for RAG',
    url: 'https://docs.llamaindex.ai/chunking',
    domain: 'docs.llamaindex.ai',
    projectId: 'rag-research',
    savedAt: '2026-07-07T14:30:00Z',
    summary:
      'Compares fixed-size, sentence-aware, and semantic chunking, and recommends ~500-token chunks with 50-token overlap to preserve context across boundaries.',
    content:
      'How you split a document before embedding it changes what your retrieval system can find. Fixed-size chunking is simple but can cut sentences mid-thought. Sentence-aware chunking respects boundaries but produces uneven sizes. Semantic chunking groups by topic shift and tends to perform best for long-form content. A ~50-token overlap between chunks helps preserve context that would otherwise be lost at a boundary.',
    tags: ['chunking', 'retrieval'],
  },
  {
    id: '3',
    title: 'Manifest V3 Migration Guide',
    url: 'https://developer.chrome.com/docs/extensions/mv3',
    domain: 'developer.chrome.com',
    projectId: 'extension-build',
    savedAt: '2026-07-06T09:15:00Z',
    summary:
      'Explains the shift from background pages to service workers in Manifest V3, and the new restrictions on remote code execution.',
    content:
      'Manifest V3 replaces persistent background pages with service workers that can be terminated when idle. Extensions must now bundle all logic locally — remote code execution is disallowed for review compliance. Host permissions are also more explicit, and users can grant them per-site instead of all at once.',
    tags: ['chrome-extension', 'manifest-v3'],
  },
  {
    id: '4',
    title: 'Cosine Similarity, Intuitively',
    url: 'https://towardsdatascience.com/cosine-similarity',
    domain: 'towardsdatascience.com',
    projectId: 'rag-research',
    savedAt: '2026-07-05T18:45:00Z',
    summary:
      'Breaks down why cosine similarity is preferred over Euclidean distance for comparing text embeddings.',
    content:
      'Cosine similarity measures the angle between two vectors rather than their distance, which makes it robust to differences in vector magnitude. For text embeddings, where magnitude often reflects document length rather than meaning, this makes cosine similarity a better fit than Euclidean distance for most retrieval tasks.',
    tags: ['embeddings', 'math'],
  },
  {
    id: '5',
    title: 'Readability.js Internals',
    url: 'https://github.com/mozilla/readability',
    domain: 'github.com',
    projectId: 'extension-build',
    savedAt: '2026-07-05T11:20:00Z',
    summary:
      "Mozilla's algorithm for stripping ads and navigation from a page, scoring DOM nodes by text density.",
    content:
      'Readability scores each DOM node based on text density, link density, and tag type, then walks up the tree to find the most likely "main content" container. It strips scripts, ads, and navigation, leaving clean article text — the same engine behind Firefox Reader View.',
    tags: ['content-extraction'],
  },
  {
    id: '6',
    title: 'Judging Criteria — DevHack 2026',
    url: 'https://devhack.dev/judging',
    domain: 'devhack.dev',
    projectId: 'hackathon-ops',
    savedAt: '2026-07-04T08:00:00Z',
    summary: 'Judges weigh technical execution, originality, and demo clarity roughly equally.',
    content:
      'Scoring is split across four categories: technical execution, originality, design/UX, and presentation. Teams get 5 minutes to demo live, followed by 2 minutes of Q&A. Pre-recorded fallback clips are allowed in case of live technical issues.',
    tags: ['hackathon'],
  },
]

export const currentUser = {
  name: 'Lokesh Kumar',
  email: 'lokesh@orma.app',
  memoriesSaved: memories.length,
  projectsCount: projects.length,
  joined: 'July 2026',
}
