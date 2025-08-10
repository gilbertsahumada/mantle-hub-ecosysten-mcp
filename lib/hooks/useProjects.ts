import { useState, useEffect } from 'react';
import { ProjectWithRelations } from '@/lib/types/database.types';

interface UseProjectsOptions {
  category?: string;
}

interface UseProjectsReturn {
  projects: ProjectWithRelations[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = new URL('/api/projects', window.location.origin);
      if (options.category) {
        url.searchParams.set('category', options.category);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      setProjects(data.projects || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [options.category]);

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
  };
}