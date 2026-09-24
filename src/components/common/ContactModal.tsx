import React, { useState } from 'react';
import { X, Send, MessageSquare, HelpCircle, Lightbulb, Bug, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { feedbackService } from '../../services/supabase/feedbackService';
import type { FeedbackType } from '../../types';

export const ContactModal: React.FC = () => {
  const { isContactModalOpen, closeContactModal, user } = useAuthStore();
  const [type, setType] = useState<FeedbackType>('feedback');
  const [name, setName] = useState(user?.fullName || user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isContactModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message.trim()) return;

    setIsSubmitting(true);
    await feedbackService.submitFeedback({
      userId: user?.id,
      email,
      name: name || undefined,
      type,
      message
    });
    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setMessage('');
      closeContactModal();
    }, 2000);
  };

  const TYPE_OPTIONS: Array<{ id: FeedbackType; label: string; icon: React.ElementType }> = [
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'query', label: 'Question', icon: HelpCircle },
    { id: 'feature_request', label: 'Idea / Feature', icon: Lightbulb },
    { id: 'bug', label: 'Report Bug', icon: Bug }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#0F1117] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/10">
        <button
          onClick={closeContactModal}
          className="absolute top-5 right-5 p-2 rounded-full glass-dock text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-white tracking-wide">
            Contact & Feedback
          </h2>
          <p className="text-xs text-white/50 font-light mt-1">
            Have a question, requested feature, or feedback? Share it directly with the team.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-1">
              Thank You for Reaching Out!
            </h3>
            <p className="text-xs text-white/50 max-w-xs">
              Your message has been safely received. We appreciate your input to make Ambient better.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-2">
                Type of Inquiry
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = type === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setType(opt.id)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-white/40'}`} />
                      <span className="text-[11px] font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name & Email inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional or Your Name"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>
            </div>

            {/* Message input */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1">
                Your Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts, suggestions, or issues..."
                rows={4}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
