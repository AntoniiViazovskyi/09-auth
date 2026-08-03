import { create } from 'zustand'
import { CreateNoteRequest } from '../api'
import { NoteTag } from '@/types/note'
import { persist } from 'zustand/middleware'

type NoteDraftStore = {
  draft: CreateNoteRequest
  setDraft: (note: CreateNoteRequest) => void
  clearDraft: () => void
}

const initialDraft = {
  title: '',
  content: '',
  tag: 'Todo' as NoteTag
}

export const useNoteDraftStore = create<NoteDraftStore>()(
  persist(
    (set) => ({
      draft: initialDraft,
      setDraft: (note) => set(() => ({ draft: note })),
      clearDraft: () => set(() => ({ draft: initialDraft }))
    }),
    {
      name: 'note-draft',
      partialize: (state) => ({ draft: state.draft })
    }
  )
)
