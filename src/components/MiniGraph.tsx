import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { GraphPoint } from '../types/graph'

const UP = '#f6465d', DN = '#2196f3'
const M = { top: 6, right: 6, bottom: 14, left: 28 }

interface Props { points: GraphPoint[]; ageRange: [number, number]; width?: number; height?: number }

export default function MiniGraph({ points, ageRange, width = 160, height = 80 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current; if (!svg) return
    const [minAge, maxAge] = ageRange
    const xS = d3.scaleLinear().domain([minAge, maxAge]).range([M.left, width - M.right])
    const yS = d3.scaleLinear().domain([-100, 100]).range([height - M.bottom, M.top])
    const root = d3.select(svg); root.selectAll('*').remove()
    const z = yS(0)

    root.append('rect').attr('width', width).attr('height', height).attr('fill', '#fafafa')
    root.append('line').attr('x1', M.left).attr('x2', width - M.right)
      .attr('y1', z).attr('y2', z).attr('stroke', '#e0e0e0').attr('stroke-width', 1)

    ;[minAge, maxAge].forEach(age => {
      root.append('text').attr('x', xS(age)).attr('y', height - 2)
        .attr('text-anchor', 'middle').attr('fill', '#aaa')
        .attr('font-size', '9px').attr('font-family', 'Pretendard, sans-serif')
        .text(`${age}세`)
    })

    if (points.length < 2) return

    const uid = `mg-${Math.random().toString(36).slice(2, 7)}`
    const defs = root.append('defs')
    defs.append('clipPath').attr('id', `${uid}-up`).append('rect')
      .attr('x', M.left).attr('y', M.top).attr('width', width - M.left - M.right).attr('height', z - M.top)
    defs.append('clipPath').attr('id', `${uid}-dn`).append('rect')
      .attr('x', M.left).attr('y', z).attr('width', width - M.left - M.right).attr('height', height - M.bottom - z)

    const line = d3.line<GraphPoint>().x(d => xS(d.age)).y(d => yS(d.satisfaction)).curve(d3.curveCatmullRom.alpha(0.5))
    const area = d3.area<GraphPoint>().x(d => xS(d.age)).y0(yS(0)).y1(d => yS(d.satisfaction)).curve(d3.curveCatmullRom.alpha(0.5))

    root.append('path').datum(points).attr('d', area).attr('fill', UP).attr('opacity', 0.12).attr('clip-path', `url(#${uid}-up)`)
    root.append('path').datum(points).attr('d', area).attr('fill', DN).attr('opacity', 0.12).attr('clip-path', `url(#${uid}-dn)`)
    root.append('path').datum(points).attr('d', line).attr('fill', 'none').attr('stroke', UP).attr('stroke-width', 1.5).attr('clip-path', `url(#${uid}-up)`)
    root.append('path').datum(points).attr('d', line).attr('fill', 'none').attr('stroke', DN).attr('stroke-width', 1.5).attr('clip-path', `url(#${uid}-dn)`)
  }, [points, ageRange, width, height])

  return <svg ref={svgRef} width={width} height={height} style={{ display: 'block', borderRadius: 4, border: '1px solid #eee' }} />
}
