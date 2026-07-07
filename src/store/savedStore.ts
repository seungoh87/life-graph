import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SavedGraph } from '../types/saved'
import type { GraphPoint } from '../types/graph'

interface SavedStore {
  savedGraphs: SavedGraph[]
  save: (name: string, points: GraphPoint[], ageRange: [number, number]) => void
  remove: (id: string) => void
}

export const useSavedStore = create<SavedStore>()(
  persist(
    (set) => ({
      savedGraphs: [],
      save: (name, points, ageRange) => set((s) => ({
        savedGraphs: [...s.savedGraphs, {
          id: crypto.randomUUID(),
          name,
          points,
          ageRange,
          savedAt: Date.now(),
        }],
      })),
      remove: (id) => set((s) => ({
        savedGraphs: s.savedGraphs.filter(g => g.id !== id),
      })),
    }),
    { name: 'life-graph-saved' }
  )
)
