import { useGraphStore } from '../store/graphStore'

const FONT = "'Pretendard', -apple-system, sans-serif"

function Btn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: FONT, fontSize: '0.82rem', fontWeight: 500,
      color: disabled ? '#ccc' : '#555',
      background: 'transparent',
      border: `1px solid ${disabled ? '#e0e0e0' : '#d0d0d0'}`,
      borderRadius: 6, padding: '6px 14px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }}>{label}</button>
  )
}

export default function GraphControls() {
  const { history, future, graph, undo, redo, clearPoints } = useGraphStore()
  return (
    <div style={{
      background: '#fff', borderTop: '1px solid #e0e0e0',
      padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center',
      flexShrink: 0,
    }}>
      <Btn label="◀ 이전" onClick={undo} disabled={history.length === 0} />
      <Btn label="다음 ▶" onClick={redo} disabled={future.length === 0} />
      <div style={{ width: 1, height: 20, background: '#e0e0e0', margin: '0 4px' }} />
      <Btn label="전체 지우기" onClick={clearPoints} disabled={graph.points.length === 0} />
    </div>
  )
}
