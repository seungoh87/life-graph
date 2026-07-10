import { useGraphStore } from '../store/graphStore'

const FONT = "'Pretendard', -apple-system, sans-serif"

const selectStyle: React.CSSProperties = {
  fontFamily: FONT, fontSize: '0.85rem', fontWeight: 500,
  color: '#555', background: '#fff',
  border: '1px solid #d0d0d0', borderRadius: 6,
  padding: '6px 4px', cursor: 'pointer', outline: 'none',
}

function IconBtn({ label, title, onClick, disabled }: { label: string; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      fontFamily: FONT, fontSize: '0.9rem', fontWeight: 500,
      color: disabled ? '#ccc' : '#555',
      background: 'transparent',
      border: `1px solid ${disabled ? '#e0e0e0' : '#d0d0d0'}`,
      borderRadius: 8, padding: '8px 12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      display: 'flex', alignItems: 'center', gap: 4,
    }}>{label}</button>
  )
}

const MIN_OPTIONS = [0, 10, 20, 30]
const MAX_OPTIONS = [40, 50, 60, 70, 80, 90, 100]

export default function GraphControls() {
  const { history, future, graph, undo, redo, clearPoints, setAgeRange } = useGraphStore()
  const [minAge, maxAge] = graph.ageRange

  return (
    <div style={{
      background: '#fff', borderTop: '1px solid #e0e0e0',
      padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center',
      flexShrink: 0, justifyContent: 'space-between', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <IconBtn label="↩" title="실행 취소" onClick={undo} disabled={history.length === 0} />
        <IconBtn label="↪" title="다시 실행" onClick={redo} disabled={future.length === 0} />
        <span style={{ fontSize: '0.78rem', color: '#aaa', fontFamily: FONT, marginLeft: 2 }}>범위</span>
        <select
          style={selectStyle}
          value={minAge}
          onChange={e => {
            const v = Number(e.target.value)
            if (v < maxAge) setAgeRange([v, maxAge])
          }}
        >
          {MIN_OPTIONS.filter(o => o < maxAge).map(o => (
            <option key={o} value={o}>{o}세</option>
          ))}
        </select>
        <span style={{ fontSize: '0.8rem', color: '#bbb', fontFamily: FONT }}>—</span>
        <select
          style={selectStyle}
          value={maxAge}
          onChange={e => {
            const v = Number(e.target.value)
            if (v > minAge) setAgeRange([minAge, v])
          }}
        >
          {MAX_OPTIONS.filter(o => o > minAge).map(o => (
            <option key={o} value={o}>{o}세</option>
          ))}
        </select>
      </div>
      <IconBtn label="🗑" title="전체 지우기" onClick={clearPoints} disabled={graph.points.length === 0} />
    </div>
  )
}
