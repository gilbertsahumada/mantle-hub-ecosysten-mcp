'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';

interface Comment {
  id: number;
  text: string;
  author: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  userReaction?: 'like' | 'dislike' | null;
  replies?: Comment[];
}

export default function ProjectDetail() {
  const params = useParams();
  const [url, setUrl] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock project data
  const project = {
    id: params.id,
    name: "Mantle MCP",
    description: "AI-powered chat interface with modern UI components",
    status: "active",
    tech: ["Next.js", "Tailwind", "Shadcn/UI"]
  };

  // Mock comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      text: "This project looks great! The UI is very clean and modern.",
      author: "Alice",
      timestamp: "2 hours ago",
      likes: 5,
      dislikes: 1,
      userReaction: null,
      replies: [
        {
          id: 2,
          text: "I agree! The minimalist design really works well.",
          author: "Bob",
          timestamp: "1 hour ago",
          likes: 2,
          dislikes: 0,
          userReaction: null
        }
      ]
    },
    {
      id: 3,
      text: "Any plans to add more AI features?",
      author: "Charlie",
      timestamp: "4 hours ago",
      likes: 3,
      dislikes: 0,
      userReaction: null,
      replies: []
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting URL:', url);
  };

  const handleSync = async() => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: params.id,
          filePath: 'docs/daat-project.md'
        })
      })

      const data = await response.json();
      console.log('Sync response:', data);
    } catch (error) {
      console.error('Error syncing project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        text: newComment,
        author: "You",
        timestamp: "now",
        likes: 0,
        dislikes: 0,
        userReaction: null,
        replies: []
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleAddReply = (commentId: number) => {
    if (replyText.trim()) {
      const reply: Comment = {
        id: Date.now(),
        text: replyText,
        author: "You",
        timestamp: "now",
        likes: 0,
        dislikes: 0,
        userReaction: null
      };

      setComments(comments.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));

      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleReaction = (commentId: number, reaction: 'like' | 'dislike', isReply: boolean = false, parentId?: number) => {
    setComments(comments.map(comment => {
      if (isReply && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies?.map(reply => {
            if (reply.id === commentId) {
              const currentReaction = reply.userReaction;
              let newLikes = reply.likes;
              let newDislikes = reply.dislikes;
              let newReaction: 'like' | 'dislike' | null = reaction;

              // Handle previous reaction
              if (currentReaction === 'like') newLikes--;
              if (currentReaction === 'dislike') newDislikes--;

              // Handle new reaction
              if (currentReaction === reaction) {
                // Toggle off if same reaction
                newReaction = null;
              } else {
                // Add new reaction
                if (reaction === 'like') newLikes++;
                if (reaction === 'dislike') newDislikes++;
              }

              return {
                ...reply,
                likes: newLikes,
                dislikes: newDislikes,
                userReaction: newReaction
              };
            }
            return reply;
          })
        };
      } else if (!isReply && comment.id === commentId) {
        const currentReaction = comment.userReaction;
        let newLikes = comment.likes;
        let newDislikes = comment.dislikes;
        let newReaction: 'like' | 'dislike' | null = reaction;

        // Handle previous reaction
        if (currentReaction === 'like') newLikes--;
        if (currentReaction === 'dislike') newDislikes--;

        // Handle new reaction
        if (currentReaction === reaction) {
          // Toggle off if same reaction
          newReaction = null;
        } else {
          // Add new reaction
          if (reaction === 'like') newLikes++;
          if (reaction === 'dislike') newDislikes++;
        }

        return {
          ...comment,
          likes: newLikes,
          dislikes: newDislikes,
          userReaction: newReaction
        };
      }
      return comment;
    }));
  };

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
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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

      {/* Project Detail Container */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Project Info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl font-semibold tracking-tight">{project.name}</h2>
            <Badge
              variant={project.status === 'active' ? 'default' : 'secondary'}
              className="text-xs h-6 px-3 font-medium capitalize"
            >
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{project.description}</p>
          <div className="flex gap-2 flex-wrap">
            {project.tech.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs h-5 px-2 font-medium">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* URL Section */}
        <Card className="mb-8 border-border/60">
          <CardHeader className="pb-4">
            <h3 className="text-base font-medium">Project URL</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="flex-1 text-sm h-10 px-3"
              />
              <Button type="submit" size="sm" className="h-10 px-6 text-sm font-medium">
                Submit
              </Button>
            </form>
            <Button
              onClick={handleSync}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="h-10 px-6 text-sm font-medium cursor-pointer"
            >
              {isLoading ? 'Syncing...' : 'Sync'}
            </Button>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <h3 className="text-base font-medium">Comments</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="p-4 bg-muted/30 rounded-xl border border-border/40">
              <div className="flex gap-3">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 text-sm h-10 px-3"
                />
                <Button type="submit" size="sm" className="h-10 px-6 text-sm font-medium">
                  Comment
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-card/30 rounded-xl border border-border/40 p-4">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground mb-3 leading-relaxed">{comment.text}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleReaction(comment.id, 'like')}
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-3 text-xs ${comment.userReaction === 'like' ? 'text-green-600 bg-green-50 dark:bg-green-950/30' : ''}`}
                      >
                        👍 {comment.likes}
                      </Button>
                      <Button
                        onClick={() => handleReaction(comment.id, 'dislike')}
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-3 text-xs ${comment.userReaction === 'dislike' ? 'text-red-600 bg-red-50 dark:bg-red-950/30' : ''}`}
                      >
                        👎 {comment.dislikes}
                      </Button>
                      <Button
                        onClick={() => setReplyingTo(comment.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mb-4 ml-6 p-3 bg-muted/40 rounded-lg border border-border/30">
                      <div className="flex gap-3">
                        <Input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Reply to comment..."
                          className="flex-1 text-sm h-9 px-3"
                        />
                        <Button
                          onClick={() => handleAddReply(comment.id)}
                          size="sm"
                          className="h-9 px-4 text-xs font-medium"
                        >
                          Reply
                        </Button>
                        <Button
                          onClick={() => setReplyingTo(null)}
                          variant="ghost"
                          size="sm"
                          className="h-9 px-4 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-muted/20 rounded-lg border border-border/20 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">{reply.author}</span>
                            <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{reply.text}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleReaction(reply.id, 'like', true, comment.id)}
                              variant="ghost"
                              size="sm"
                              className={`h-7 px-2 text-xs ${reply.userReaction === 'like' ? 'text-green-600 bg-green-50 dark:bg-green-950/30' : ''}`}
                            >
                              👍 {reply.likes}
                            </Button>
                            <Button
                              onClick={() => handleReaction(reply.id, 'dislike', true, comment.id)}
                              variant="ghost"
                              size="sm"
                              className={`h-7 px-2 text-xs ${reply.userReaction === 'dislike' ? 'text-red-600 bg-red-50 dark:bg-red-950/30' : ''}`}
                            >
                              👎 {reply.dislikes}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}