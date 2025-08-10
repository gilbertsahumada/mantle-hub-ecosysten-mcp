# DAAT Project - Documentation RAG System

A RAG (Retrieval-Augmented Generation) system for indexing project documentation with a GitHub-like social platform for the developer community.

## 🏗️ General Architecture

```mermaid
graph TB
    subgraph "Input Sources"
        GIT[📦 Git Repositories]
        DOCS[📄 Documentation Files]
        WEB[🌐 Web Documentation]
    end

    subgraph "Processing Pipeline"
        EXTRACT[🔍 Document Extractor]
        CHUNK[✂️ Text Chunker]
        EMBED[🧠 OpenAI Embeddings]
    end

    subgraph "Storage Layer"
        QDRANT[(🗄️ Qdrant Vector DB)]
        SUPABASE[(🐘 Supabase PostgreSQL)]
    end

    subgraph "Application Layer"
        API[🔌 Next.js API Routes]
        SERVICE[⚡ Business Logic Layer]
        UI[🖥️ Next.js 15 UI]
    end

    subgraph "Social Features"
        COMMENTS[💬 Comments System]
        STARS[⭐ GitHub-like Stars]
        REACTIONS[👍 Reactions]
        USERS[👤 User Management]
    end

    GIT --> EXTRACT
    DOCS --> EXTRACT
    WEB --> EXTRACT
    
    EXTRACT --> CHUNK
    CHUNK --> EMBED
    EMBED --> QDRANT
    EXTRACT --> SUPABASE
    
    QDRANT --> SERVICE
    SUPABASE --> SERVICE
    SERVICE --> API
    API --> UI
    
    USERS --> COMMENTS
    USERS --> STARS
    USERS --> REACTIONS
    COMMENTS --> SUPABASE
    STARS --> SUPABASE
    REACTIONS --> SUPABASE
```

## 🎯 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Lucide React** - Icon library

### Backend & Database
- **Supabase PostgreSQL** - Relational database
- **Drizzle ORM** - Type-safe ORM for PostgreSQL
- **Qdrant** - Vector database for semantic search
- **OpenAI API** - Embeddings generation (text-embedding-3-small, 1536D)

### Infrastructure
- **Vercel** - Deployment and hosting
- **Docker** - Containerization (Qdrant)

## 🗄️ Database Architecture

### Relational Schema (Supabase)

```mermaid
erDiagram
    projects {
        uuid id PK
        text name
        text description
        text project_url
        text twitter_url
        text status
        timestamp created_at
        timestamp updated_at
    }
    
    users {
        uuid id PK
        text email
        text username
        text avatar_url
        timestamp created_at
    }
    
    categories {
        uuid id PK
        text name
        text slug
        timestamp created_at
    }
    
    documents {
        uuid id PK
        uuid project_id FK
        text name
        text description
        text github_url
        text file_path
        text file_name
        text qdrant_collection
        integer chunks_count
        timestamp indexed_at
    }
    
    comments {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        text content
        uuid parent_id FK
        timestamp created_at
    }
    
    reactions {
        uuid id PK
        uuid comment_id FK
        uuid user_id FK
        text type
        timestamp created_at
    }
    
    project_stars {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        timestamp starred_at
    }
    
    project_categories {
        uuid id PK
        uuid project_id FK
        uuid category_id FK
    }

    projects ||--o{ documents : "has many"
    projects ||--o{ comments : "has many"
    projects ||--o{ project_stars : "has many"
    projects ||--o{ project_categories : "belongs to many"
    categories ||--o{ project_categories : "belongs to many"
    users ||--o{ comments : "creates"
    users ||--o{ reactions : "creates"
    users ||--o{ project_stars : "creates"
    comments ||--o{ reactions : "receives"
    comments ||--o{ comments : "has replies"
```

### Vector Schema (Qdrant)

```json
{
    "collection": "project_<uuid>",
    "vector": [0.1, -0.3, 0.8, ...], // 1536 dimensions
    "payload": {
        "project_id": "uuid-project",
        "document_id": "uuid-document", 
        "title": "Getting Started with React",
        "content": "React is a JavaScript library...",
        "file_path": "docs/getting-started.md",
        "chunk_index": 1,
        "metadata": {
            "headers": ["h1", "h2"],
            "word_count": 150
        }
    }
}
```

## 🔄 Data Flow

### 1. Document Indexing

```mermaid
sequenceDiagram
    participant UI as Next.js UI
    participant API as API Routes
    participant SERVICE as ProjectService
    participant QDRANT as QdrantService
    participant OPENAI as OpenAI API
    participant DB as Supabase

    UI->>API: POST /api/projects
    API->>SERVICE: createProject()
    SERVICE->>DB: Insert project + categories
    DB->>SERVICE: Project created
    
    UI->>API: POST /api/documents/index
    API->>QDRANT: processMarkdownFile()
    QDRANT->>QDRANT: Extract + chunk text
    
    loop For each chunk
        QDRANT->>OPENAI: Generate embedding
        OPENAI->>QDRANT: Vector[1536]
        QDRANT->>QDRANT: Store vector + metadata
    end
    
    QDRANT->>DB: Update chunks_count
    API->>UI: Indexing completed
```

### 2. Semantic Search

```mermaid
sequenceDiagram
    participant USER as User
    participant UI as Chat Interface
    participant API as API Routes
    participant QDRANT as QdrantService
    participant OPENAI as OpenAI API

    USER->>UI: "How to use React hooks?"
    UI->>API: POST /api/search
    API->>OPENAI: Generate query embedding
    OPENAI->>API: Query vector[1536]
    API->>QDRANT: searchDocuments(vector)
    QDRANT->>QDRANT: Cosine similarity search
    QDRANT->>API: Top 5 relevant chunks
    API->>UI: Contextual response
    UI->>USER: Answer with sources
```

## 🎨 UI/UX Features

### Project Cards
- **Optimized height**: `h-72` for better content visualization
- **Flexible layout**: Adaptive content distribution
- **Social stats**: GitHub-style stars and comments counter
- **External links**: Buttons for Twitter/X and project URL
- **Categories**: Category badges with visual limits
- **Status indicators**: Visual project states

### Social Features
- **GitHub-style stars**: Favorites system for projects
- **Comments system**: Nested comments with replies
- **Reactions**: Like/dislike on comments
- **User profiles**: Basic user management

## 📊 Data Types

### Project with Relations
```typescript
interface ProjectWithRelations extends Project {
  categories: Category[];
  documents: Document[];
  documentsCount: number;
  commentsCount: number;
  starsCount: number;
}
```

### Business Services
```typescript
class ProjectService {
  async getAllProjects(): Promise<ProjectWithRelations[]>
  async getProjectById(id: string): Promise<ProjectWithRelations | null>
  async getProjectsByCategory(slug: string): Promise<Project[]>
}
```

## 🛠️ Development Commands

```bash
# Install dependencies
yarn install

# Next.js development
yarn dev

# Database
yarn db:generate    # Generate migrations
yarn db:push        # Apply schema changes
yarn db:seed        # Populate with initial data

# Linting and formatting
yarn lint
yarn typecheck

# Production build
yarn build
```

## 🗂️ Project Structure

```
repo-docs-next/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── chat/               # Chat functionality
│   │   └── projects/           # Projects CRUD
│   ├── projects/               # Projects pages
│   └── globals.css             # Global styles
├── lib/
│   ├── db/                     # Database layer
│   │   ├── schema.ts          # Drizzle schema
│   │   └── index.ts           # DB connection
│   ├── services/               # Business logic
│   │   └── project.service.ts # Projects service
│   ├── hooks/                  # React hooks
│   │   └── useProjects.ts     # Projects data fetching
│   ├── types/                  # TypeScript types
│   ├── qdrant.ts              # Vector database service
│   └── utils.ts               # Utilities
├── components/                  # React components
│   ├── ui/                    # shadcn/ui components
│   ├── theme-provider.tsx     # Theme management
│   └── theme-toggle.tsx       # Dark mode toggle
├── scripts/
│   └── seed.ts                # Database seeding
└── drizzle/                   # Database migrations
```

## 🌟 Use Cases

### For Developers
1. **Centralized Documentation**: Unified access to docs from multiple projects
2. **Semantic Search**: "How to implement authentication in Next.js?"
3. **Comparisons**: Differences between frameworks or libraries
4. **Community Feedback**: Project comments and ratings

### For Project Maintainers
1. **Visibility**: Project showcase with social metrics
2. **Feedback Loop**: Direct community feedback
3. **Analytics**: Usage and popularity metrics
4. **Documentation as Code**: Automatic indexing from repositories

## 🔧 Environment Configuration

### Required Variables (.env.local)
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Qdrant
QDRANT_URL="http://localhost:6333"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### External Services
1. **Supabase**: Hosted PostgreSQL database
2. **OpenAI**: High-quality embeddings API
3. **Qdrant Cloud** or **Local Docker**: Vector database

## 🚀 Roadmap

### ✅ Phase 1: Core Infrastructure (Completed)
- [x] Next.js 15 + TypeScript setup
- [x] Supabase + Drizzle ORM integration
- [x] Complete relational schema
- [x] QdrantService with OpenAI embeddings
- [x] Base UI with shadcn/ui
- [x] Projects and categories system

### ✅ Phase 2: Social Features (Completed)
- [x] Users, comments, reactions tables
- [x] GitHub-style stars system
- [x] Project cards with social stats
- [x] External links (Twitter/X, project URL)
- [x] Service layer with business logic

### 🔄 Phase 3: In Development
- [ ] Chat interface for RAG queries
- [ ] MD document indexing from GitHub
- [ ] Functional semantic search
- [ ] Comments system frontend
- [ ] User authentication

### 📅 Phase 4: Future
- [ ] MCP Server for Claude Code integration
- [ ] Analytics dashboard
- [ ] Public API for third parties
- [ ] Mobile-responsive improvements
- [ ] Advanced search filters

## 🤝 Contributing

This project is designed to be extensible and maintainable. Contributions are welcome following established conventions:

- **Database**: Use Drizzle migrations for schema changes
- **API**: RESTful endpoints under `/api`
- **UI**: shadcn/ui components with Tailwind CSS
- **Types**: Strict TypeScript throughout the application

---

**Current Status**: Functional base system with social architecture. Next step: implement complete RAG with chat interface.