import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GraphPoint, LifeGraphData } from '../types/graph'
import { DEFAULT_GRAPH } from '../types/graph'

interface GraphStore {
  graph: LifeGraphData
  history: GraphPoint[][]
  future: GraphPoint[][]
  addPoint: (p: GraphPoint) => void
  updateMemo: (age: number, memo: string) => void
  deletePoint: (age: number) => void
  setAgeRange: (range: [number, number]) => void
  clearPoints: () => void
  undo: () => void
  redo: () => void
}

const MAX_HISTORY = 10

export const useGraphStore = create<GraphStore>()(
  persist(
    (set) => ({
      graph: DEFAULT_GRAPH,
      history: [],
      future: [],

      addPoint: (p) => set((s) => {
        const prev = s.graph.points
        const history = [...s.history, prev].slice(-MAX_HISTORY)
        let points = prev.filter(x => x.age !== p.age)
        if (p.age !== 0 && !prev.some(x => x.age === 0)) {
          points = [{ age: 0, satisfaction: 0 }, ...points, p]
        } else {
          points = [...points, p]
        }
        points.sort((a, b) => a.age - b.age)
        return { graph: { ...s.graph, points }, history, future: [] }
      }),

      updateMemo: (age, memo) => set((s) => {
        const prev = s.graph.points
        const history = [...s.history, prev].slice(-MAX_HISTORY)
        const points = prev.map(p => p.age === age ? { ...p, memo } : p)
        return { graph: { ...s.graph, points }, history, future: [] }
      }),

      deletePoint: (age) => set((s) => {
        const prev = s.graph.points
        const history = [...s.history, prev].slice(-MAX_HISTORY)
        const points = prev.filter(p => p.age !== age)
        return { graph: { ...s.graph, points }, history, future: [] }
      }),

      setAgeRange: (range) => set((s) => ({
        graph: { ...s.graph, ageRange: range },
      })),

      clearPoints: () => set((s) => ({
        graph: { ...s.graph, points: [] },
        history: [...s.history, s.graph.points].slice(-MAX_HISTORY),
        future: [],
      })),

      undo: () => set((s) => {
        if (s.history.length === 0) return s
        const history = [...s.history]
        const prev = history.pop()!
        return {
          graph: { ...s.graph, points: prev },
          history,
          future: [s.graph.points, ...s.future].slice(0, MAX_HISTORY),
        }
      }),

      redo: () => set((s) => {
        if (s.future.length === 0) return s
        const future = [...s.future]
        const next = future.shift()!
        return {
          graph: { ...s.graph, points: next },
          history: [...s.history, s.graph.points].slice(-MAX_HISTORY),
          future,
        }
      }),
    }),
    { name: 'life-graph-data' }
  )
)
