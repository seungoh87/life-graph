import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import type { GraphPoint } from '../types/graph'

const M = { top: 24, right: 24, bottom: 56, left: 64 }
const FONT = "'Pretendard', -apple-system, sans-serif"
const UP = '#f6465d', DN = '#2196f3', AVG = '#ff9800'
const GRID = '#e8e8e8', ZERO = '#cccccc'
const HAPPY = ['😊','😄','😁','🥰','😆','😀','🤩','☺️']
const SAD   = ['😢','😞','😠','😤','😣','😩','😰','🥺']

interface Props {
  points: GraphPoint[]
  ageRange: [number, number]
  overlayPoints?: GraphPoint[]
  overlayLabel?: string
}

export default function ReadOnlyGraph({ points, ageRange, overlayPoints, overlayLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const draw = useCallback(() => {
    const svg = svgRef.current, container = containerRef.current
    if (!svg || !container) return
    const W = container.clientWidth, H = container.clientHeight
    if (W === 0 || H === 0) return

    svg.setAttribute('width', String(W))
    svg.setAttribute('height', String(H))

    const [minAge, maxAge] = ageRange
    const xS = d3.scaleLinear().domain([minAge, maxAge]).range([M.left, W - M.right])
    const yS = d3.scaleLinear().domain([-100, 100]).range([H - M.bottom, M.top])
    const cL = M.left, cR = W - M.right, cT = M.top, cB = H - M.bottom, z = yS(0)

    const root = d3.select(svg)
    root.selectAll('*').remove()
    const defs = root.append('defs')

    root.append('rect').attr('x', cL).attr('y', cT).attr('width', cR - cL).attr('height', cB - cT).attr('fill', '#fff')

    ;[-100, -50, 0, 50, 100].forEach(t => {
      root.append('line').attr('x1', cL).attr('x2', cR).attr('y1', yS(t)).attr('y2', yS(t))
        .attr('stroke', t === 0 ? ZERO : GRID).attr('stroke-width', t === 0 ? 1.5 : 1)
    })
    const step = (maxAge - minAge) <= 40 ? 5 : 10
    d3.range(minAge, maxAge + 1, step).forEach(age => {
      root.append('line').attr('x1', xS(age)).attr('x2', xS(age)).attr('y1', cT).attr('y2', cB)
        .attr('stroke', GRID).attr('stroke-width', 1)
    })
    d3.range(minAge, maxAge + 1, step).forEach(age => {
      root.append('text').attr('x', xS(age)).attr('y', cB + 20).attr('text-anchor', 'middle')
        .attr('fill', '#888').attr('font-family', FONT).attr('font-size', '14px').text(`${age}세`)
    })
    ;[-100, -50, 0, 50, 100].forEach(t => {
      root.append('text').attr('x', cL - 8).attr('y', yS(t) + 4).attr('text-anchor', 'end')
        .attr('fill', t === 0 ? '#111' : '#888').attr('font-family', FONT)
        .attr('font-size', '14px').attr('font-weight', t === 0 ? '600' : '400')
        .text(t > 0 ? `+${t}` : `${t}`)
    })
    root.append('text').attr('x', cL + 4).attr('y', z - 5)
      .attr('fill', '#aaa').attr('font-family', FONT).attr('font-size', '12px').text('ZERO')

    if (points.length >= 2) {
      const uid = `rog-${Math.random().toString(36).slice(2, 7)}`
      defs.append('clipPath').attr('id', `${uid}-up`).append('rect').attr('x', cL).attr('y', cT).attr('width', cR - cL).attr('height', z - cT)
      defs.append('clipPath').attr('id', `${uid}-dn`).append('rect').attr('x', cL).attr('y', z).attr('width', cR - cL).attr('height', cB - z)
      const line = d3.line<GraphPoint>().x(d => xS(d.age)).y(d => yS(d.satisfaction)).curve(d3.curveCatmullRom.alpha(0.5))
      const area = d3.area<GraphPoint>().x(d => xS(d.age)).y0(yS(0)).y1(d => yS(d.satisfaction)).curve(d3.curveCatmullRom.alpha(0.5))
      root.append('path').datum(points).attr('d', area).attr('fill', UP).attr('opacity', 0.10).attr('clip-path', `url(#${uid}-up)`)
      root.append('path').datum(points).attr('d', area).attr('fill', DN).attr('opacity', 0.10).attr('clip-path', `url(#${uid}-dn)`)
      root.append('path').datum(points).attr('d', line).attr('fill', 'none').attr('stroke', UP).attr('stroke-width', 2.5).attr('clip-path', `url(#${uid}-up)`)
      root.append('path').datum(points).attr('d', line).attr('fill', 'none').attr('stroke', DN).attr('stroke-width', 2.5).attr('clip-path', `url(#${uid}-dn)`)
    }

    if (overlayPoints && overlayPoints.length >= 2) {
      const line = d3.line<GraphPoint>().x(d => xS(d.age)).y(d => yS(d.satisfaction)).curve(d3.curveCatmullRom.alpha(0.5))
      root.append('path').datum(overlayPoints).attr('d', line)
        .attr('fill', 'none').attr('stroke', AVG).attr('stroke-width', 2.5).attr('stroke-dasharray', '8,4').attr('opacity', 0.9)
      const lx = cR - 8, ly = cT + 12
      root.append('line').attr('x1', lx - 36).attr('x2', lx - 8).attr('y1', ly).attr('y2', ly)
        .attr('stroke', AVG).attr('stroke-width', 2.5).attr('stroke-dasharray', '8,4')
      root.append('text').attr('x', lx - 40).attr('y', ly + 4).attr('text-anchor', 'end')
        .attr('fill', AVG).attr('font-family', FONT).attr('font-size', '13px').attr('font-weight', '600')
        .text(overlayLabel ?? '전체 평균')
    }

    points.filter(d => !(d.age === 0 && d.satisfaction === 0)).forEach(d => {
      const cx = xS(d.age), cy = yS(d.satisfaction)
      const emoji = d.satisfaction > 0 ? HAPPY[d.age % 8] : SAD[d.age % 8]
      root.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 15)
        .attr('fill', '#fff').attr('stroke', d.satisfaction >= 0 ? UP : DN).attr('stroke-width', 1.5)
      root.append('text').attr('x', cx).attr('y', cy + 9).attr('text-anchor', 'middle').attr('font-size', '18px').text(emoji)
      if (d.memo) {
        const above = cy > H / 2
        const lines: string[] = []
        for (let i = 0; i < d.memo.length; i += 10) lines.push(d.memo.slice(i, i + 10))
        const my = above ? cy - 42 : cy + 30
        const textEl = root.append('text').attr('text-anchor', 'middle')
          .attr('font-family', FONT).attr('font-size', '13px').attr('font-weight', '500').attr('fill', '#111')
        lines.forEach((ln, i) => textEl.append('tspan').attr('x', cx).attr('y', my + i * 18).text(ln))
      }
    })
  }, [points, ageRange, overlayPoints, overlayLabel])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(timer); timer = setTimeout(draw, 150) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer) }
  }, [draw])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  )
}
