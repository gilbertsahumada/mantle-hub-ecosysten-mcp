import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { projects, categories, documents } from '@/lib/db/schema';

// Base types from schema
export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

export type Document = InferSelectModel<typeof documents>;
export type NewDocument = InferInsertModel<typeof documents>;

// Extended types with relations
export type ProjectWithRelations = Project & {
  categories: Category[];
  documents: Document[];
  documentsCount: number;
  commentsCount: number;
  starsCount: number;
};

export type ProjectWithCategories = Project & {
  categories: Category[];
};

export type DocumentWithProject = Document & {
  project: Project;
};