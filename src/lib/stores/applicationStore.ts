import { create } from 'zustand'
import type { ApplicationStage } from '@/lib/types/domain'

interface ApplicationState {
  selectedVideoIds: string[]
  coverVideoId: string | null
  notes: string
  isSubmitting: boolean
  toggleVideo: (videoId: string) => void
  setCoverVideo: (videoId: string | null) => void
  setNotes: (notes: string) => void
  setSubmitting: (submitting: boolean) => void
  reset: () => void
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  selectedVideoIds: [],
  coverVideoId: null,
  notes: '',
  isSubmitting: false,

  toggleVideo: (videoId) =>
    set((state) => ({
      selectedVideoIds: state.selectedVideoIds.includes(videoId)
        ? state.selectedVideoIds.filter((id) => id !== videoId)
        : [...state.selectedVideoIds, videoId],
    })),

  setCoverVideo: (coverVideoId) => set({ coverVideoId }),
  setNotes: (notes) => set({ notes }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  reset: () =>
    set({
      selectedVideoIds: [],
      coverVideoId: null,
      notes: '',
      isSubmitting: false,
    }),
}))
