import { create } from 'zustand'
import type { FeedJob } from '@/lib/types/domain'

interface FeedState {
  jobs: FeedJob[]
  currentIndex: number
  cursor: string | null
  isLoading: boolean
  hasMore: boolean
  setJobs: (jobs: FeedJob[]) => void
  appendJobs: (jobs: FeedJob[], cursor: string | null) => void
  nextJob: () => void
  previousJob: () => void
  setLoading: (loading: boolean) => void
}

export const useFeedStore = create<FeedState>((set, get) => ({
  jobs: [],
  currentIndex: 0,
  cursor: null,
  isLoading: false,
  hasMore: true,

  setJobs: (jobs) => set({ jobs, currentIndex: 0 }),

  appendJobs: (newJobs, cursor) =>
    set((state) => ({
      jobs: [...state.jobs, ...newJobs],
      cursor,
      hasMore: newJobs.length > 0,
    })),

  nextJob: () => {
    const { currentIndex, jobs } = get()
    if (currentIndex < jobs.length - 1) {
      set({ currentIndex: currentIndex + 1 })
    }
  },

  previousJob: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 })
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
}))
