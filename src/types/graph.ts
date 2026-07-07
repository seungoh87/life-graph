export interface GraphPoint {
  age: number
  satisfaction: number
  memo?: string
}

export interface LifeGraphData {
  points: GraphPoint[]
  ageRange: [number, number]
}

export const DEFAULT_GRAPH: LifeGraphData = {
  points: [],
  ageRange: [0, 40],
}
