import { useEffect, useRef, useCallback, useState } from 'react'
import * as d3 from 'd3'
import { useGraphStore } from '../store/graphStore'
import type { GraphPoint } from '../types/graph'
import MemoPopup from './MemoPopup'

const M_PC = { top: 24, right: 24, bottom: 56, left: 64 }
const M_MB = { top: 16, right: 24, bottom: 44, left: 44 }
const FONT = "'Pretendard', -apple-system, sans-serif"
const UP = '#f6465d', DN = '#2196f3', AVG = '#ff9800'
const GRID = '#e8e8e8', ZERO = '#cccccc'
const HAPPY = ['😊','😄','😁','🥰','😆','😀','🤩','☺️']
const SAD   = ['😢','😞','😠','😤','😣','😩','😰','🥺']

interface PopupState {
  mode: 'new' | 'edit'
  age: number
  satisfaction: number
  initialMemo: string
  screenX: number
  screenY: number
}

interface Props {
  overlayPoints?: GraphPoint[]
  overlayLabel?: string
}

export default function LifeGraph({ overlayPoints, overlayLabel }: Props) {
  const { graph, addPoint, updateMemo, deletePoint } = useGraphStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [popup, setPopup] = useState<PopupState | null>(null)

  const draw = useCallback(() => {
    const svg = svgRef.current
    const container = containerRef.current
    if (!svg || !container) return

    const W = container.clientWidth
    const H = container.clientHeight
    if (W === 0 || H === 0) return

    svg.setAttribute('width', String(W))
    svg.setAttribute('height', String(H))

    const isMobile = W < 480
    const M = isMobile ? M_MB : M_PC
    const [minAge, maxAge] = graph.ageRange
    const xS = d3.scaleLinear().domain([minAge, maxAge]).range([M.left, W - M.right])
    const yS = d3.scaleLinear().domain([-100, 100]).range([H - M.bottom, M.top])
    const cL = M.left, cR = W - M.right, cT = M.top, cB = H - M.bottom, z = yS(0)

    const root = d3.select(svg)
    root.selectAll('*').remove()
    const defs = root.append('defs')

    // 배경
    root.append('rect').attr('x', cL).attr('y', cT).attr('width', cR - cL).attr('height', cB - cT).attr('fill', '#fff')

    // 그리드
    ;[-100, -50, 0, 50, 100].forEach(t => {
      root.append('line').attr('x1', cL).attr('x2', cR).attr('y1', yS(t)).attr('y2', yS(t))
        .attr('stroke', t === 0 ? ZERO : GRID).attr('stroke-width', t === 0 ? 1.5 : 1)
    })
    const step = isMobile ? 10 : ((maxAge - minAge) <= 40 ? 5 : 10)
    d3.range(minAge, maxAge + 1, step).forEach((age: number) => {
      root.append('line').attr('x1', xS(age)).attr('x2', xS(age)).attr('y1', cT).attr('y2', cB)
        .attr('stroke', GRID).attr('stroke-width', 1)
    })

    // 축 레이블
    const fontSize = isMobile ? '12px' : '14px'
    d3.range(minAge, maxAge + 1, step).forEach((age: number) => {
      root.append('text').attr('x', xS(age)).attr('y', cB + 18).attr('text-anchor', 'middle')
        .attr('fill', '#888').attr('font-family', FONT).attr('font-size', fontSize).text(`${age}세`)
    })
    ;[-100, -50, 0, 50, 100].forEach(t => {
      root.append('text').attr('x', cL - 8).attr('y', yS(t) + 4).attr('text-anchor', 'end')
        .attr('fill', t === 0 ? '#111' : '#888').attr('font-family', FONT)
        .attr('font-size', fontSize).attr('font-weight', t === 0 ? '600' : '400')
        .text(t > 0 ? `+${t}` : `${t}`)
    })

    const pts = graph.points
    const hasReal = pts.filter(p => !(p.age === 0 && p.satisfaction === 0)).length > 0

    // 빈 상태 안내
    if (!hasReal) {
      root.append('text').attr('x', (cL + cR) / 2).attr('y', cT + (cB - cT) * 0.28)
        .attr('text-anchor', 'middle').attr('fill', '#ccc').attr('font-family', FONT)
        .attr('font-size', '15px').text('그래프를 클릭해서 인생 만족도를 기록해보세요')
    }

    // 메인 라인
    if (pts.length >= 2) {
      const uid = `lg-${Math.random().toString(36).slice(2, 7)}`
      defs.append('clipPath').attr('id', `${uid}-up`).append('rect').attr('x', cL).attr('y', cT).attr('width', cR - cL).attr('height', z - cT)
      defs.append('clipPath').attr('id', `${uid}-dn`).append('rect').attr('x', cL).attr('y', z).attr('width', cR - cL).attr('height', cB - z)
      const line = d3.line<GraphPoint>().x(d => xS(d.age)).y(d => yS(d.satisfaction))
      const area = d3.area<GraphPoint>().x(d => xS(d.age)).y0(yS(0)).y1(d => yS(d.satisfaction))
      root.append('path').datum(pts).attr('d', area).attr('fill', UP).attr('opacity', 0.10).attr('clip-path', `url(#${uid}-up)`)
      root.append('path').datum(pts).attr('d', area).attr('fill', DN).attr('opacity', 0.10).attr('clip-path', `url(#${uid}-dn)`)
      root.append('path').datum(pts).attr('d', line).attr('fill', 'none').attr('stroke', UP).attr('stroke-width', 2.5).attr('clip-path', `url(#${uid}-up)`)
      root.append('path').datum(pts).attr('d', line).attr('fill', 'none').attr('stroke', DN).attr('stroke-width', 2.5).attr('clip-path', `url(#${uid}-dn)`)
    }

    // 오버레이
    if (overlayPoints && overlayPoints.length >= 2) {
      const line = d3.line<GraphPoint>().x(d => xS(d.age)).y(d => yS(d.satisfaction))
      root.append('path').datum(overlayPoints).attr('d', line)
        .attr('fill', 'none').attr('stroke', AVG).attr('stroke-width', 2.5).attr('stroke-dasharray', '8,4').attr('opacity', 0.9)
      const lx = cR - 8, ly = cT + 12
      root.append('line').attr('x1', lx - 36).attr('x2', lx - 8).attr('y1', ly).attr('y2', ly)
        .attr('stroke', AVG).attr('stroke-width', 2.5).attr('stroke-dasharray', '8,4')
      root.append('text').attr('x', lx - 40).attr('y', ly + 4).attr('text-anchor', 'end')
        .attr('fill', AVG).attr('font-family', FONT).attr('font-size', '13px').attr('font-weight', '600')
        .text(overlayLabel ?? '전체 평균')
    }

    // 포인트 + 이모지
    pts.forEach(d => {
      if (d.age === 0 && d.satisfaction === 0) return
      const cx = xS(d.age), cy = yS(d.satisfaction)
      const emoji = d.satisfaction > 0 ? HAPPY[d.age % 8] : SAD[d.age % 8]
      root.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 15)
        .attr('fill', '#fff').attr('stroke', d.satisfaction >= 0 ? UP : DN).attr('stroke-width', 1.5)
      root.append('text').attr('x', cx).attr('y', cy + 9).attr('text-anchor', 'middle').attr('font-size', '18px').text(emoji)
    })

    // 메모 (겹침 감지 후 위치 조정)
    const LINE_H = 18, CHAR_W = 7.5
    type Box = { x1: number; y1: number; x2: number; y2: number }
    const placed: Box[] = []
    const overlaps = (a: Box, b: Box) =>
      !(a.x2 + 4 < b.x1 || b.x2 + 4 < a.x1 || a.y2 + 4 < b.y1 || b.y2 + 4 < a.y1)

    pts.forEach(d => {
      if (d.age === 0 && d.satisfaction === 0) return
      if (!d.memo) return
      const cx = xS(d.age), cy = yS(d.satisfaction)
      const lines: string[] = []
      for (let i = 0; i < d.memo.length; i += 10) lines.push(d.memo.slice(i, i + 10))
      const tw = Math.max(...lines.map(l => l.length)) * CHAR_W
      const th = lines.length * LINE_H
      const hw = tw / 2 + 6

      // 기본 방향: 포인트가 아래쪽이면 위에, 위쪽이면 아래에
      const preferAbove = cy > H / 2
      const sides = preferAbove ? ['above', 'below'] : ['below', 'above']

      let chosenY = 0
      let placed_this = false

      for (const side of sides) {
        const my = side === 'above' ? cy - 24 - th : cy + 30
        const box: Box = { x1: cx - hw, y1: my, x2: cx + hw, y2: my + th }
        if (!placed.some(p => overlaps(p, box))) {
          placed.push(box)
          chosenY = my
          placed_this = true
          break
        }
      }

      // 양쪽 다 겹치면 기본 위치에 강제 배치 (약간 겹침 감수)
      if (!placed_this) {
        chosenY = preferAbove ? cy - 24 - th : cy + 30
        placed.push({ x1: cx - hw, y1: chosenY, x2: cx + hw, y2: chosenY + th })
      }

      const textEl = root.append('text').attr('text-anchor', 'middle')
        .attr('font-family', FONT).attr('font-size', '13px').attr('font-weight', '500').attr('fill', '#333')
      lines.forEach((ln, i) => textEl.append('tspan').attr('x', cx).attr('y', chosenY + i * LINE_H).text(ln))
    })

    // 클릭 이벤트
    const overlay = root.append('rect')
      .attr('x', cL).attr('y', cT).attr('width', cR - cL).attr('height', cB - cT)
      .attr('fill', 'transparent').attr('cursor', 'crosshair')
      .on('click', (event: MouseEvent) => {
        const [mx, my] = d3.pointer(event)
        const age = Math.round(xS.invert(mx))
        const satisfaction = Math.round(yS.invert(my))
        const clamped = Math.max(-100, Math.min(100, satisfaction))
        const clampedAge = Math.max(minAge, Math.min(maxAge, age))

        // 기존 포인트 클릭 여부 확인
        const existing = pts.find(p => Math.abs(xS(p.age) - mx) < 18 && Math.abs(yS(p.satisfaction) - my) < 18)
        if (existing && !(existing.age === 0 && existing.satisfaction === 0)) {
          setPopup({
            mode: 'edit', age: existing.age, satisfaction: existing.satisfaction,
            initialMemo: existing.memo ?? '',
            screenX: xS(existing.age), screenY: yS(existing.satisfaction),
          })
          return
        }

        addPoint({ age: clampedAge, satisfaction: clamped })
        setPopup({
          mode: 'new', age: clampedAge, satisfaction: clamped,
          initialMemo: '',
          screenX: mx, screenY: my,
        })
      })

    // PC 전용 마우스 미리보기
    if (!isMobile) {
      const hLine = root.append('line').attr('stroke', '#aaa').attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,3').attr('pointer-events', 'none').attr('visibility', 'hidden')
      const vLine = root.append('line').attr('stroke', '#aaa').attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,3').attr('pointer-events', 'none').attr('visibility', 'hidden')
      const tip = root.append('g').attr('pointer-events', 'none').attr('visibility', 'hidden')
      const tipRect = tip.append('rect').attr('rx', 6).attr('fill', 'rgba(20,20,20,0.78)').attr('height', 30).attr('y', -15)
      const tipText = tip.append('text').attr('fill', '#fff').attr('font-family', FONT)
        .attr('font-size', '13px').attr('font-weight', '600').attr('dominant-baseline', 'middle').attr('text-anchor', 'middle').attr('y', 1)

      overlay.on('mousemove', (event: MouseEvent) => {
        const [mx, my] = d3.pointer(event)
        const age = Math.max(minAge, Math.min(maxAge, Math.round(xS.invert(mx))))
        const sat = Math.max(-100, Math.min(100, Math.round(yS.invert(my))))
        const label = `${age}세  ${sat >= 0 ? '+' : ''}${sat}`
        tipText.text(label)
        const tw = (tipText.node() as SVGTextElement)?.getBBox().width ?? 80
        const pw = tw + 24
        tipRect.attr('width', pw).attr('x', -pw / 2)
        const tx = Math.max(cL + pw / 2 + 4, Math.min(cR - pw / 2 - 4, mx))
        const ty = my < cT + 44 ? my + 38 : my - 22
        tip.attr('transform', `translate(${tx},${ty})`).attr('visibility', 'visible')
        hLine.attr('x1', cL).attr('x2', cR).attr('y1', my).attr('y2', my).attr('visibility', 'visible')
        vLine.attr('x1', mx).attr('x2', mx).attr('y1', cT).attr('y2', cB).attr('visibility', 'visible')
      })
      overlay.on('mouseleave', () => {
        tip.attr('visibility', 'hidden')
        hLine.attr('visibility', 'hidden')
        vLine.attr('visibility', 'hidden')
      })
    }
  }, [graph, overlayPoints, overlayLabel, addPoint])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(timer); timer = setTimeout(draw, 150) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer) }
  }, [draw])

  const cw = containerRef.current?.clientWidth ?? 600
  const ch = containerRef.current?.clientHeight ?? 400

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      {popup && (
        <MemoPopup
          mode={popup.mode}
          age={popup.age}
          initialMemo={popup.initialMemo}
          screenX={popup.screenX}
          screenY={popup.screenY}
          containerW={cw}
          containerH={ch}
          onSave={(memo) => {
            if (memo.trim()) updateMemo(popup.age, memo.trim())
            setPopup(null)
            draw()
          }}
          onDelete={() => {
            deletePoint(popup.age)
            setPopup(null)
            draw()
          }}
          onCancel={() => setPopup(null)}
        />
      )}
    </div>
  )
}
