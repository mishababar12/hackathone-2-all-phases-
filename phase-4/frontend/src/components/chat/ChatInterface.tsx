'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, LogIn, CheckCircle, CircleX, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { isAuthenticated, getToken } from '@/lib/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Separate component for authenticated chat
function AuthenticatedChatInterface() {
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: input,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      const userInput = input;
      setInput('');

      // Create a new AbortController for this request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Send to backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken() || ''}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split by newlines to process each SSE event
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix

            if (data === '[DONE]') {
              // Finished receiving response
              if (assistantMessage) {
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg.role === 'assistant' && lastMsg.id === 'temp') {
                    // Update temporary message
                    return [...prev.slice(0, -1), {
                      id: Date.now().toString(),
                      role: 'assistant',
                      content: assistantMessage,
                      timestamp: new Date()
                    }];
                  } else {
                    // Add new message
                    return [...prev, {
                      id: Date.now().toString(),
                      role: 'assistant',
                      content: assistantMessage,
                      timestamp: new Date()
                    }];
                  }
                });
              }
              return;
            }

            try {
              const parsed = JSON.parse(data);

              // Handle the AI response content
              if (parsed.choices && parsed.choices[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                assistantMessage += content;

                // Update temporary message in UI
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg.role === 'assistant' && lastMsg.id === 'temp') {
                    // Update existing temp message
                    return [...prev.slice(0, -1), {
                      id: 'temp',
                      role: 'assistant',
                      content: assistantMessage,
                      timestamp: new Date()
                    }];
                  } else {
                    // Add new temp message
                    return [...prev, {
                      id: 'temp',
                      role: 'assistant',
                      content: assistantMessage,
                      timestamp: new Date()
                    }];
                  }
                });
              }
            } catch (e) {
              // Ignore malformed JSON lines
              continue;
            }
          }
        }
      }

      // Handle case where stream ends without [DONE]
      if (assistantMessage) {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.role === 'assistant' && lastMsg.id === 'temp') {
            return [...prev.slice(0, -1), {
              id: Date.now().toString(),
              role: 'assistant',
              content: assistantMessage,
              timestamp: new Date()
            }];
          } else {
            return [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: assistantMessage,
              timestamp: new Date()
            }];
          }
        });

        // Show toast notifications based on the assistant message content
        if (assistantMessage.toLowerCase().includes('created') && assistantMessage.toLowerCase().includes('task')) {
          toast.success('Task created successfully!', {
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #06b6d4',
            },
          });
        } else if (assistantMessage.toLowerCase().includes('completed') && assistantMessage.toLowerCase().includes('task')) {
          // Check if the completion was for a task that was supposed to be removed/deleted
          if (assistantMessage.toLowerCase().includes('remove') ||
              assistantMessage.toLowerCase().includes('delete') ||
              assistantMessage.toLowerCase().includes('was supposed to be deleted') ||
              (assistantMessage.toLowerCase().includes('will delete') &&
               !assistantMessage.toLowerCase().includes('could not delete'))) {
            toast.error('Task was completed instead of deleted', {
              icon: <AlertCircle className="h-5 w-5 text-red-500" />,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #ef4444',
              },
            });
          } else {
            toast.success('Task completed!', {
              icon: <CheckCircle className="h-5 w-5 text-green-500" />,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #06b6d4',
              },
            });
          }
        } else if (assistantMessage.toLowerCase().includes('updated') ||
                   assistantMessage.toLowerCase().includes('changed') ||
                   assistantMessage.toLowerCase().includes('modified') ||
                   (assistantMessage.toLowerCase().includes('priority') &&
                    (assistantMessage.toLowerCase().includes('set') ||
                     assistantMessage.toLowerCase().includes('changed') ||
                     assistantMessage.toLowerCase().includes('updated'))) ||
                   (assistantMessage.toLowerCase().includes('description') &&
                    (assistantMessage.toLowerCase().includes('added') ||
                     assistantMessage.toLowerCase().includes('updated') ||
                     assistantMessage.toLowerCase().includes('description')))) {
          // Handle task updates (description, priority, etc.)
          if (assistantMessage.toLowerCase().includes('priority')) {
            toast.success('Task priority updated!', {
              icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #3b82f6',
              },
            });
          } else if (assistantMessage.toLowerCase().includes('description')) {
            toast.success('Task description updated!', {
              icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #3b82f6',
              },
            });
          } else {
            toast.success('Task updated!', {
              icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #3b82f6',
              },
            });
          }
        } else if (assistantMessage.toLowerCase().includes('list') &&
                   assistantMessage.toLowerCase().includes('tasks') &&
                   (assistantMessage.toLowerCase().includes('current') ||
                    assistantMessage.toLowerCase().includes('would you like'))) {
          // Handle task listing responses that indicate outdated information
          toast('Task list updated', {
            icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #3b82f6',
            },
          });
        } else if (assistantMessage.toLowerCase().includes('sorry') &&
                  (assistantMessage.toLowerCase().includes('could not find') ||
                   assistantMessage.toLowerCase().includes('not found')) &&
                  assistantMessage.toLowerCase().includes('task')) {
          // Handle task not found scenario
          toast.error('Task not found', {
            icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #f97316',
            },
          });
        } else if ((assistantMessage.toLowerCase().includes('deleted') ||
                   assistantMessage.toLowerCase().includes('removed') ||
                   assistantMessage.toLowerCase().includes('deleted task')) &&
                   assistantMessage.toLowerCase().includes('task')) {
          // Check if it's about deleting a specific task
          if (assistantMessage.toLowerCase().includes('could not') ||
              assistantMessage.toLowerCase().includes('not found') ||
              assistantMessage.toLowerCase().includes('already') ||
              assistantMessage.toLowerCase().includes('cannot delete')) {
            toast.error('Cannot delete task', {
              icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #f97316',
              },
            });
          } else {
            toast.success('Task deleted!', {
              icon: <CircleX className="h-5 w-5 text-red-500" />,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #ef4444',
              },
            });
          }
        } else if (assistantMessage.toLowerCase().includes('error') || assistantMessage.toLowerCase().includes('failed')) {
          toast.error('Operation failed', {
            icon: <AlertCircle className="h-5 w-5 text-red-500" />,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #ef4444',
            },
          });
        } else if (assistantMessage.toLowerCase().includes('sorry') &&
                  (assistantMessage.toLowerCase().includes('understand') ||
                   assistantMessage.toLowerCase().includes('interpret') ||
                   assistantMessage.toLowerCase().includes('recognize') ||
                   assistantMessage.toLowerCase().includes('support'))) {
          // Handle commands that AI doesn't understand
          toast.error('Command not recognized', {
            icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #f97316',
            },
          });
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat error:', err);
        setError(err.message || 'An error occurred while chatting');

        // Add error message to UI
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${err.message || 'Something went wrong'}`,
          timestamp: new Date()
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-6 w-6 text-cyan-400 animate-pulse" />
        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          AI Task Assistant
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[300px] pr-2">
        {messages
          .filter(msg => msg.id !== 'temp') // Don't show the temporary message in the list
          .map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-xl ${
              message.role === 'user'
                ? 'bg-blue-500/20 ml-10 self-end'
                : 'bg-cyan-500/20 mr-10 self-start'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="font-medium text-sm">
                {message.role === 'user' ? 'You:' : 'AI Assistant:'}
              </div>
              <div className="text-xs text-gray-400">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="text-gray-200 mt-1 whitespace-pre-wrap">
              {(() => {
                // Clean up the message content by removing tool usage statements
                let cleanContent = message.content;

                // Remove tool usage statements
                cleanContent = cleanContent.replace(/I will use the [a-z_]+ tool to .*\./g, '');
                cleanContent = cleanContent.replace(/Using [a-z_]+ tool.*/g, '');
                cleanContent = cleanContent.replace(/Calling [a-z_]+ function.*/g, '');
                cleanContent = cleanContent.trim();

                // Check if this is a task listing message
                if (cleanContent.toLowerCase().includes('task') && (cleanContent.toLowerCase().includes('have') || cleanContent.toLowerCase().includes('list'))) {
                  // Split content into parts and process tasks
                  const lines = cleanContent.split('\n');

                  return lines.map((line, idx) => {
                    // Look for task list indicators
                    if (line.includes('- ') || /^\d+\.\s/.test(line)) {
                      // Process individual task lines
                      const taskItems = line.split(/(-|\d+\.\s)/);

                      return (
                        <div key={idx} className="mt-1">
                          {taskItems.map((part, partIdx) => {
                            if (part.startsWith('- ')) {
                              const taskText = part.substring(2).trim();
                              // Simple heuristic to determine if task is completed
                              const isCompleted = taskText.toLowerCase().includes('completed') ||
                                                 taskText.toLowerCase().includes('done') ||
                                                 taskText.toLowerCase().includes('finished');

                              return (
                                <div key={partIdx} className="flex items-center gap-2 ml-2 my-1">
                                  {isCompleted ? (
                                    <span className="text-green-400">✅</span>
                                  ) : (
                                    <span className="text-yellow-400">⏳</span>
                                  )}
                                  <span>{taskText}</span>
                                </div>
                              );
                            } else if (/^\d+\.\s/.test(part)) {
                              // Numbered list item
                              const taskMatch = part.match(/^(\d+)\.\s+(.*)/);
                              if (taskMatch) {
                                const [, number, taskText] = taskMatch;
                                const isCompleted = taskText.toLowerCase().includes('completed') ||
                                                   taskText.toLowerCase().includes('done') ||
                                                   taskText.toLowerCase().includes('finished');

                                return (
                                  <div key={partIdx} className="flex items-center gap-2 ml-2 my-1">
                                    {isCompleted ? (
                                      <span className="text-green-400">✅</span>
                                    ) : (
                                      <span className="text-yellow-400">⏳</span>
                                    )}
                                    <span>{number}. {taskText}</span>
                                  </div>
                                );
                              }
                              return <span key={partIdx}>{part}</span>;
                            }
                            return <span key={partIdx}>{part}</span>;
                          })}
                        </div>
                      );
                    }
                    // For non-empty lines, return them
                    if (line.trim()) {
                      return <span key={idx}>{line}<br /></span>;
                    }
                    return null;
                  }).filter(Boolean); // Remove null entries
                }

                // For non-task messages, return the cleaned content
                return cleanContent;
              })()}
            </div>
          </div>
        ))}

        {/* Show temporary message if loading */}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
          <div className="p-4 rounded-xl bg-cyan-500/20 mr-10 self-start">
            <div className="font-medium text-sm">AI Assistant:</div>
            <div className="text-gray-200 mt-1 flex space-x-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/30">
            <div className="font-medium text-sm text-red-300">Error:</div>
            <div className="text-red-200 mt-1">{error}</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-auto">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to create or manage tasks..."
            className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="default"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Ask me to create tasks, mark tasks as complete, or list your tasks
        </p>
      </form>
    </div>
  );
}

export function ChatInterface() {
  const [hasValidToken, setHasValidToken] = useState<boolean | null>(null); // Start with null to indicate loading state
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Function to check authentication status
  const checkAuthStatus = useCallback(() => {
    const token = getToken();
    setHasValidToken(!!token);
    return !!token;
  }, []);

  // Check if user is authenticated when component mounts
  useEffect(() => {
    checkAuthStatus();
    setIsLoadingAuth(false);

    // Listen for storage events to detect when token is added after login
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuthStatus]);

  // Refresh auth status when component updates
  useEffect(() => {
    if (hasValidToken === false) {
      const token = getToken();
      if (token) {
        setHasValidToken(true);
      }
    }
  }, [hasValidToken]);

  // Show loading state while checking auth
  if (isLoadingAuth || hasValidToken === null) {
    return (
      <div className="flex flex-col h-[500px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-cyan-400 animate-pulse" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            AI Task Assistant
          </h3>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-gray-400">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if no valid token
  if (!hasValidToken) {
    return (
      <div className="flex flex-col h-[500px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-cyan-400 animate-pulse" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            AI Task Assistant
          </h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Sparkles className="h-12 w-12 text-cyan-400 mb-4" />
          <h4 className="text-lg font-semibold text-gray-200 mb-2">Authentication Required</h4>
          <p className="text-gray-400 mb-6">
            Please log in to use the AI Task Assistant
          </p>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              <LogIn className="h-4 w-4 mr-2" />
              Log In
            </Button>
          </Link>
        </div>

        <div className="mt-auto p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-xl">
          <p className="text-xs text-yellow-300 text-center">
            Note: You need to be logged in to use the chatbot
          </p>
        </div>
      </div>
    );
  }

  // When authenticated, render the authenticated chat component
  return <AuthenticatedChatInterface />;
}