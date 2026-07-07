import type { GraphPoint } from './graph'

export interface SavedGraph {
  id: string
  name: string
  points: GraphPoint[]
  ageRange: [number, number]
  savedAt: number
}
