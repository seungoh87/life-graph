import MiniGraph from './MiniGraph'
import type { SavedGraph } from '../types/saved'

const FONT = "'Pretendard', -apple-system, sans-serif"

interface Props {
  graphs: SavedGraph[]
  onView: (g: SavedGraph) => void
  onDelete: (id: string) => void
  onCompare: () => void
  hasMultiple: boolean
  onClose: () => void
}

export default function SavedPanel({ graphs, onView, onDelete, onCompare, hasMultiple, onClose }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.25)',
      display: 'flex', justifyContent: 'flex-end',
    }} onMouseDown={onClose}>
      <div style={{
        width: 340, height: '100%',
        background: '#fff', borderLeft: '1px solid #e0e0e0',
        display: 'flex', flexDirection: 'column',
        fontFamily: FONT, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111' }}>저장된 그래프</div>
            <div style={{ fontSize: '0.76rem', color: '#aaa', marginTop: 2 }}>{graphs.length}개 저장됨</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {hasMultiple && (
              <button onClick={onCompare} style={{
                fontFamily: FONT, fontSize: '0.78rem', fontWeight: 600,
                color: '#ff9800', border: '1px solid #ff9800', borderRadius: 5,
                padding: '5px 12px', background: 'transparent', cursor: 'pointer',
              }}>📊 평균 비교</button>
            )}
            <button onClick={onClose} style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {graphs.map(g => (
            <div key={g.id} style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: '12px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111' }}>{g.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: 2 }}>
                    {new Date(g.savedAt).toLocaleDateString('ko-KR')} · {g.points.length}pts
                  </div>
                </div>
                <button onClick={() => onDelete(g.id)} style={{
                  fontSize: '0.72rem', color: '#f6465d', background: 'none',
                  border: '1px solid #fcc', borderRadius: 4, padding: '3px 8px', cursor: 'pointer',
                }}>삭제</button>
              </div>
              <MiniGraph points={g.points} ageRange={g.ageRange} width={290} height={80} />
              <button onClick={() => onView(g)} style={{
                width: '100%', marginTop: 10, fontFamily: FONT, fontSize: '0.82rem', fontWeight: 500,
                color: '#1976d2', border: '1px solid #bbdefb', borderRadius: 6,
                padding: '7px', background: 'transparent', cursor: 'pointer',
              }}>자세히 보기 →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
