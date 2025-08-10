import { db } from '@/lib/db';
import { projects, categories, projectCategories, documents, comments, projectStars } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';

export class ProjectService {
  
  async getAllProjects() {
    const result = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        projectUrl: projects.projectUrl,
        twitterUrl: projects.twitterUrl,
        status: projects.status,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .orderBy(desc(projects.updatedAt));

    // Get categories for each project
    const projectsWithCategories = await Promise.all(
      result.map(async (project) => {
        const projectCats = await db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          })
          .from(categories)
          .innerJoin(projectCategories, eq(categories.id, projectCategories.categoryId))
          .where(eq(projectCategories.projectId, project.id));

        const projectDocs = await db
          .select({
            id: documents.id,
            name: documents.name,
            description: documents.description,
            githubUrl: documents.githubUrl,
            fileName: documents.fileName,
            chunksCount: documents.chunksCount,
            indexedAt: documents.indexedAt,
          })
          .from(documents)
          .where(eq(documents.projectId, project.id))
          .orderBy(desc(documents.indexedAt));

        // Count comments
        const commentsCountResult = await db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.projectId, project.id));

        // Count stars  
        const starsCountResult = await db
          .select({ count: count() })
          .from(projectStars)
          .where(eq(projectStars.projectId, project.id));

        return {
          ...project,
          categories: projectCats,
          documents: projectDocs,
          documentsCount: projectDocs.length,
          commentsCount: commentsCountResult[0]?.count || 0,
          starsCount: starsCountResult[0]?.count || 0,
        };
      })
    );

    return projectsWithCategories;
  }

  async getProjectById(projectId: string) {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (result.length === 0) return null;

    const project = result[0];

    // Get categories
    const projectCats = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .innerJoin(projectCategories, eq(categories.id, projectCategories.categoryId))
      .where(eq(projectCategories.projectId, project.id));

    // Get documents
    const projectDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, project.id))
      .orderBy(desc(documents.indexedAt));

    return {
      ...project,
      categories: projectCats,
      documents: projectDocs,
      documentsCount: projectDocs.length,
    };
  }

  async getProjectsByCategory(categorySlug: string) {
    const result = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        projectUrl: projects.projectUrl,
        twitterUrl: projects.twitterUrl,
        status: projects.status,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .innerJoin(projectCategories, eq(projects.id, projectCategories.projectId))
      .innerJoin(categories, eq(projectCategories.categoryId, categories.id))
      .where(eq(categories.slug, categorySlug))
      .orderBy(desc(projects.updatedAt));

    return result;
  }
}