'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-semibold tracking-tight">Mantle MCP</h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-sm font-medium text-foreground border-b-2 border-primary pb-1">
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

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-6 py-8 min-h-[calc(100vh-80px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 space-y-6 mb-8">
          {messages.length === 0 ? (
            <div className="text-center mt-20">
              <div className="text-muted-foreground text-sm max-w-md mx-auto">
                How can I help you today?
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted/60 mr-12 border border-border/40'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 mt-0.5 ${
                        message.role === 'user'
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {message.role === 'user' ? 'U' : 'AI'}
                    </div>
                    <div className="flex-1 pt-0.5">
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case 'text':
                            return (
                              <div
                                key={`${message.id}-${i}`}
                                className="whitespace-pre-wrap text-sm leading-relaxed"
                              >
                                {part.text}
                              </div>
                            );
                          default:
                            return null;
                        }
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <div className="border border-border/60 rounded-2xl p-4 bg-card/50 backdrop-blur-sm shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput('');
              }
            }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border-0 text-sm h-10 px-4 focus-visible:ring-0 bg-transparent"
            />
            <Button 
              type="submit" 
              disabled={!input.trim()} 
              size="sm" 
              className="h-10 px-6 text-sm font-medium rounded-xl"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}