import type { GraphPoint } from '../types/graph'
import type { SavedGraph } from '../types/saved'

function lerp(points: GraphPoint[], age: number): number | null {
  const sorted = [...points].sort((a, b) => a.age - b.age)
  if (sorted.length === 0) return null
  if (age < sorted[0].age || age > sorted[sorted.length - 1].age) return null
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1]
    if (age >= a.age && age <= b.age) {
      const t = (age - a.age) / (b.age - a.age)
      return a.satisfaction + t * (b.satisfaction - a.satisfaction)
    }
  }
  return null
}

export function computeAverage(graphs: SavedGraph[]): GraphPoint[] {
  if (graphs.length === 0) return []
  const ages = new Set<number>()
  graphs.forEach(g => g.points.forEach(p => ages.add(p.age)))
  const minAge = Math.min(...graphs.flatMap(g => g.points.map(p => p.age)))
  const maxAge = Math.max(...graphs.flatMap(g => g.points.map(p => p.age)))
  const result: GraphPoint[] = []
  for (let age = minAge; age <= maxAge; age++) {
    const vals = graphs.map(g => lerp(g.points, age)).filter((v): v is number => v !== null)
    if (vals.length > 0) {
      result.push({ age, satisfaction: vals.reduce((a, b) => a + b, 0) / vals.length })
    }
  }
  return result
}
