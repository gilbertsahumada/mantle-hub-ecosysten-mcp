import { QdrantClient } from "@qdrant/js-client-rest";
import { Project } from "@/types/index";

export class QdranService {
  private client: QdrantClient;
  private collectionName: "daat";
  private projectsCollection = "projects";

  constructor() {
    this.client = new QdrantClient({
      url:
        process.env.QDRANT_URL ||
        "https://15d2f546-dddd-4a8c-bed6-56764cfc9f39.us-west-1-0.aws.cloud.qdrant.io",
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = "daat";
  }

  async initialize() {
    try {
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: 384,
          distance: "Cosine",
        },
      });

      // This goes without vectors, only metadata
      await this.client.createCollection(this.projectsCollection, {
        vectors: {
          size: 1,
          distance: "Cosine",
        },
      });
    } catch (error) {
      throw new Error(`Failed to initialize Qdrant: ${error}`);
    }
  }

  async saveProject(project: Project) {
    await this.client.upsert(this.projectsCollection, {
      wait: true,
      points: [
        {
          id: this.hashString(project.id),
          vector: [0], // Dummy vector, since we are not using vectors for projects
          payload: {
            projectId: project.id,
            name: project.name,
            description: project.description,
            url: project.url,
            status: project.status,
            documentsCount: project.documentsCount,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
            tags: project.tags || [],
          },
        },
      ],
    });
  }

  async getProject(projectId: string): Promise<Project | null> {
    try {
        const result = await this.client.retrieve(this.projectsCollection, {
            ids: [this.hashString(projectId)],
            with_payload: true,
        });

        if(result.length === 0) return null;

        const payload = result[0].payload;
        return {
            id: payload?.projectId as string,
            name: payload?.name as string,
            description: payload?.description as string,
            url: payload?.url as string,
            status: payload?.status as any,
            documentsCount: payload?.documentsCount as number,
            createdAt: new Date(payload?.createdAt as string),
            updatedAt: new Date(payload?.updatedAt as string),
            tags: payload?.tags as string[],
        }
    } catch (error) {
        return null;
    }
  }

  async listProjects(): Promise<Project[]> { 
    const result = await this.client.scroll(this.projectsCollection, {
        limit: 100,
        with_payload: true,
    });

    return result.points.map(point => ({
        id: point.payload?.projectId as string,
        name: point.payload?.name as string,
        description: point.payload?.description as string,
        url: point.payload?.url as string,
        status: point.payload?.status as 'pending' | 'indexing' | 'completed' | 'error',
        documentsCount: point.payload?.documentsCount as number,
        createdAt: new Date(point.payload?.createdAt as string),
        updatedAt: new Date(point.payload?.updatedAt as string),
        tags: point.payload?.tags as string[] || [],
    }))
  }

  private generateId(projectId: string, path: string): string {
    return `${projectId}-${path}`;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
