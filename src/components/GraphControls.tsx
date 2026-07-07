import { useGraphStore } from '../store/graphStore'

const FONT = "'Pretendard', -apple-system, sans-serif"

function IconBtn({ label, title, onClick, disabled }: { label: string; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      fontFamily: FONT, fontSize: '0.9rem', fontWeight: 500,
      color: disabled ? '#ccc' : '#555',
      background: 'transparent',
      border: `1px solid ${disabled ? '#e0e0e0' : '#d0d0d0'}`,
      borderRadius: 8, padding: '8px 16px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      display: 'flex', alignItems: 'center', gap: 4,
    }}>{label}</button>
  )
}

export default function GraphControls() {
  const { history, future, graph, undo, redo, clearPoints } = useGraphStore()
  return (
    <div style={{
      background: '#fff', borderTop: '1px solid #e0e0e0',
      padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center',
      flexShrink: 0, justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <IconBtn label="◀ 이전" title="이전으로" onClick={undo} disabled={history.length === 0} />
        <IconBtn label="다음 ▶" title="다음으로" onClick={redo} disabled={future.length === 0} />
      </div>
      <IconBtn label="🗑 지우기" title="전체 지우기" onClick={clearPoints} disabled={graph.points.length === 0} />
    </div>
  )
}
