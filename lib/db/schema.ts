import { pgTable, text, uuid, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  projectUrl: text('project_url'),
  twitterUrl: text('twitter_url'),
  status: text('status', { enum: ['pending', 'active', 'completed', 'archived'] }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reactions = pgTable('reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  commentId: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['like', 'dislike'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const projectStars = pgTable('project_stars', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  starredAt: timestamp('starred_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const projectCategories = pgTable('project_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
});

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g. "SDK Documentation", "API Reference"
  description: text('description'), // optional description
  githubUrl: text('github_url').notNull(), // GitHub repo URL
  filePath: text('file_path').notNull(), // local file path
  fileName: text('file_name').notNull(), // file name
  qdrantCollection: text('qdrant_collection').notNull(),
  chunksCount: integer('chunks_count').default(0),
  indexedAt: timestamp('indexed_at').defaultNow(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  categories: many(projectCategories),
  documents: many(documents),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  projects: many(projectCategories),
}));

export const projectCategoriesRelations = relations(projectCategories, ({ one }) => ({
  project: one(projects, {
    fields: [projectCategories.projectId],
    references: [projects.id],
  }),
  category: one(categories, {
    fields: [projectCategories.categoryId],
    references: [categories.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
}));