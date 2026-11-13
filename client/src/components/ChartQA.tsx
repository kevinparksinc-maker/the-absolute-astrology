import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Streamdown } from 'streamdown';
import { Sparkles, Loader2, Send } from 'lucide-react';

interface ChartQAProps {
  natalPlacements?: string;
  transitPlacements?: string;
  context?: string;
  gender?: 'male' | 'female' | 'other';
  disabled?: boolean;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
}

export function ChartQA({
  natalPlacements = "",
  transitPlacements,
  context,
  gender = 'other',
  disabled = false,
}: ChartQAProps) {
  const [question, setQuestion] = useState('');
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [error, setError] = useState<string | null>(null);

  const answerMutation = trpc.ai.answerChartQuestion.useMutation();

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError('Please enter a question about your life or chart.');
      return;
    }

    setError(null);

    try {
      const answer = await answerMutation.mutateAsync({
        question: question.trim(),
        natalPlacements: natalPlacements || "Default Natal Horizon",
        transitPlacements,
        context,
        gender: gender as 'male' | 'female' | 'other',
      });

      const newQAPair: QAPair = {
        id: Date.now().toString(),
        question: question.trim(),
        answer,
        timestamp: Date.now(),
      };

      setQAPairs([newQAPair, ...qaPairs]);
      setQuestion('');
    } catch (err) {
      setError('The Observatory guide encountered an issue. Please try again.');
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-slate-950/90 via-cyan-950/20 to-violet-950/30 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
          <span>Ask Your Chart · Life Storytelling Q&A</span>
        </div>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
          Ask any question about your life, childhood roots, relationships, or career. The Master Interpreter answers in full narrative life-story mode in real-world 2026 terms.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to know? (e.g., 'What patterns did I carry from childhood into my 20s and 30s?' or 'What is my greatest real-world strength in 2026?')"
          className="min-h-24 resize-none rounded-xl border border-white/15 bg-black/40 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          disabled={disabled || answerMutation.isPending}
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Press <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-slate-200">Ctrl+Enter</kbd> to submit</span>
          <Button
            onClick={handleAskQuestion}
            disabled={disabled || answerMutation.isPending || !question.trim()}
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 font-semibold text-slate-950 hover:from-cyan-300 hover:to-cyan-200 shadow-md shadow-cyan-950/30"
          >
            {answerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reading the Celestial Story...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Ask Your Chart
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-950/40 p-2.5 text-xs text-rose-300">
          {error}
        </div>
      )}

      {qaPairs.length > 0 && (
        <div className="space-y-4 pt-3 border-t border-white/10">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
            Recent Life Story Answers
          </div>
          {qaPairs.map((pair) => (
            <div
              key={pair.id}
              className="rounded-xl border border-white/10 bg-black/35 p-4 text-slate-200 space-y-2 shadow-inner"
            >
              <div className="font-serif text-sm font-semibold text-cyan-200">
                Q: {pair.question}
              </div>
              <div className="prose prose-invert max-w-none text-xs sm:text-[13px] leading-relaxed text-slate-300">
                <Streamdown>{pair.answer}</Streamdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
