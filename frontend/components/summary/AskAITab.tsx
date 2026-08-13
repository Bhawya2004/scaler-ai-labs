'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { api } from '@/lib/api';

interface AskAITabProps {
  meetingId: string;
  chatMessages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
}

const SUGGESTED_PROMPTS = [
  'What are the key action items and assignees?',
  'What decisions were agreed upon regarding the roadmap?',
  'Summarize the main points discussed by the team.',
  'What questions or blockers were raised?',
];

export function AskAITab({
  meetingId,
  chatMessages,
  onMessagesChange,
}: AskAITabProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, loading]);

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      meeting: meetingId,
      role: 'user',
      content: q,
      created_at: new Date().toISOString(),
    };

    onMessagesChange([...chatMessages, tempUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.askAI(meetingId, q, true);
      const assistantMsg: ChatMessage = {
        id: response.message_id || `assistant-${Date.now()}`,
        meeting: meetingId,
        role: 'assistant',
        content: response.answer,
        created_at: response.created_at || new Date().toISOString(),
      };
      onMessagesChange([...chatMessages, tempUserMsg, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        meeting: meetingId,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to get answer from Groq AI.'}`,
        created_at: new Date().toISOString(),
      };
      onMessagesChange([...chatMessages, tempUserMsg, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[580px] rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-100 p-3.5 dark:border-surface-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-surface-900 dark:text-white">
              Ask AI about this Meeting
            </h4>
            <p className="text-[10px] text-surface-400">Powered by Groq LLM (LLaMA 3.3)</p>
          </div>
        </div>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          Grounded Context
        </span>
      </div>

      {/* Chat Messages List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-surface-400">
            <Sparkles className="h-8 w-8 mb-2 text-brand-500 animate-pulse" />
            <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
              Have a question about what was said?
            </p>
            <p className="text-[11px] mt-0.5 max-w-xs text-surface-500">
              Ask questions about specific decisions, speaker quotes, timestamps, or action items.
            </p>

            {/* Suggested prompts */}
            <div className="mt-4 flex flex-col gap-1.5 w-full">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="rounded-xl border border-surface-200 bg-surface-50/80 px-3 py-2 text-left text-xs font-medium text-surface-700 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-surface-800 dark:bg-surface-800/60 dark:text-surface-300 dark:hover:border-brand-800 dark:hover:bg-brand-950 dark:hover:text-brand-300"
                >
                  ✨ &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'border border-surface-200 bg-surface-50 text-surface-800 dark:border-surface-800 dark:bg-surface-800 dark:text-surface-100 whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>
              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-200 text-xs font-bold text-surface-700 dark:bg-surface-800 dark:text-surface-300">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-surface-400">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white animate-pulse">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 dark:border-surface-800 dark:bg-surface-800">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600 dark:text-brand-400" />
              <span>Thinking with Groq LLaMA 3.3...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/30"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask a question about this meeting..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-3.5 pr-10 text-xs text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs transition-opacity hover:bg-brand-700 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
