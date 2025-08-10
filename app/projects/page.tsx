'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { useState } from 'react';
import { useProjects } from '@/lib/hooks/useProjects';
import { ExternalLink, MessageCircle, Star } from 'lucide-react';

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { projects, isLoading, error } = useProjects({ 
    category: selectedCategory === 'all' ? undefined : selectedCategory 
  });

  const categories = [
    { id: 'all', name: 'All Projects' },
    { id: 'oracles', name: 'Oracles' },
    { id: 'wallets', name: 'Wallets' },
    { id: 'others', name: 'Others' }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Error loading projects</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-semibold tracking-tight">Mantle MCP</h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Chat
              </Link>
              <Link href="/projects" className="text-sm font-medium text-foreground border-b-2 border-primary pb-1">
                Projects
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs h-6 px-3 font-medium">AI Assistant</Badge>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Projects Container */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-tight mb-2">Projects</h2>
          <p className="text-sm text-muted-foreground mb-6">Manage and track your development projects</p>
          
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="text-xs h-7 px-3 font-medium cursor-pointer hover:bg-muted"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-48 flex flex-col animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="pt-0 flex-1">
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:bg-muted/30 transition-all duration-200 hover:shadow-md border-border/60 h-72 flex flex-col relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <h3 className="text-base font-medium hover:text-primary transition-colors cursor-pointer">
                        {project.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      {project.twitterUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.twitterUrl!, '_blank');
                          }}
                        >
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </Button>
                      )}
                      {project.projectUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.projectUrl!, '_blank');
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      <Badge 
                        variant={project.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs h-5 px-2 font-medium capitalize"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                  <Link href={`/projects/${project.id}`} className="flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed flex-1">
                      {project.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex gap-1 flex-wrap">
                        {project.categories.slice(0, 2).map((category) => (
                          <Badge key={category.id} variant="outline" className="text-xs h-4 px-2 font-medium">
                            {category.name}
                          </Badge>
                        ))}
                        {project.categories.length > 2 && (
                          <Badge variant="outline" className="text-xs h-4 px-2 font-medium">
                            +{project.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                      {project.documentsCount > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {project.documentsCount} document{project.documentsCount !== 1 ? 's' : ''} indexed
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border/40 pt-3 mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>{project.starsCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{project.commentsCount || 0}</span>
                          </div>
                        </div>
                        {project.documentsCount > 0 && (
                          <span>{project.documentsCount} docs</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}