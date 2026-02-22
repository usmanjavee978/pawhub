'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, Search, X } from 'lucide-react'

import { useQuestions, useCreateQuestion } from '@/hooks/queries/use-community'
import { QuestionCard } from '@/components/community/QuestionCard'
import { AskQuestionForm } from '@/components/community/AskQuestionForm'
import { cn } from '@/lib/utils'

const CATEGORIES = ['all', 'nutrition', 'health', 'training', 'behavior', 'grooming', 'gear', 'general']

export function CommunityClient() {
    const [activeCategory, setActiveCategory] = useState<string>('all')
    const [isAsking, setIsAsking] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const { data: questions = [], isLoading } = useQuestions(activeCategory)
    const { mutateAsync: createQuestion, isPending: isCreating } = useCreateQuestion()

    const handleAskQuestion = async (data: any) => {
        try {
            await createQuestion(data)
            setIsAsking(false)
        } catch (err) {
            console.error('Failed to create question:', err)
            throw err
        }
    }

    const filteredQuestions = questions.filter((q: any) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-[hsl(var(--foreground))] tracking-tight">Community</h1>
                    <p className="text-[hsl(var(--foreground-muted))] font-bold text-lg">
                        Connect with fellow pet parents.
                    </p>
                </div>

                {!isAsking && (
                    <button
                        onClick={() => setIsAsking(true)}
                        className="btn-game-primary px-6 py-4 flex items-center gap-2 group"
                    >
                        <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-black uppercase tracking-wider text-sm">Ask Question</span>
                    </button>
                )}
            </motion.div>

            {/* ── Ask Question Compose Area ── */}
            <AnimatePresence>
                {isAsking && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="block-card p-8 border-[hsl(var(--accent))]"
                    >
                        <div className="flex items-center justify-between mb-6 border-b border-[hsl(var(--border))] pb-4">
                            <h2 className="text-xl font-black uppercase tracking-tight">New Discussion</h2>
                            <button
                                onClick={() => setIsAsking(false)}
                                className="p-2 rounded-2xl bg-[hsl(var(--surface-overlay))] hover:bg-red-50 hover:text-red-500 transition-colors shadow-inner"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <AskQuestionForm
                            onSubmit={handleAskQuestion}
                            onCancel={() => setIsAsking(false)}
                            isSubmitting={isCreating}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Filters & Search ── */}
            <div className="space-y-6 sticky top-4 z-20 bg-[hsl(var(--background))]/80 backdrop-blur-xl pb-6 pt-2 -mx-4 px-4">
                <div className="relative group">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-muted))] group-focus-within:text-[hsl(var(--accent))] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search the forums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-block pl-12 h-14 w-full font-bold text-lg"
                    />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x pt-1 px-1">
                    {CATEGORIES.map((cat, i) => (
                        <motion.button
                            key={cat}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "snap-start whitespace-nowrap px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                activeCategory === cat
                                    ? "bg-[hsl(var(--accent))] text-white shadow-[0_4px_0_0_hsl(var(--accent-depth))]"
                                    : "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] shadow-[0_4px_0_0_hsl(var(--border-depth))]"
                            )}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* ── Feed ── */}
            <div className="space-y-6 pb-20">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="block-card h-40 animate-pulse-slow" />
                    ))
                ) : filteredQuestions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 block-card bg-transparent border-dashed"
                    >
                        <p className="text-2xl font-black mb-2 opacity-50">Empty Terrarium 🌵</p>
                        <p className="text-[hsl(var(--foreground-muted))] font-bold">No questions found in this category.</p>
                    </motion.div>
                ) : (
                    <div className="grid gap-6">
                        {filteredQuestions.map((question: any, i: number) => (
                            <motion.div
                                key={question.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, type: 'spring' }}
                            >
                                <QuestionCard question={question} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}
