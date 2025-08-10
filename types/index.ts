export interface Project {
    id: string;
    name: string;
    description?: string;
    url: string;
    status: 'pending' | 'indexing' | 'completed' | 'error';
    documentsCount: number;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
}

export interface ExtratedDoc {
    projectId: string;
    path: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
    repoUrl: string;
    filType: string;
}