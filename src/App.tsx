import { useState, useEffect } from 'react'
import LifeGraph from './components/LifeGraph'
import GraphControls from './components/GraphControls'
import SaveDialog from './components/SaveDialog'
import SavedPanel from './components/SavedPanel'
import ReadOnlyGraph from './components/ReadOnlyGraph'
import { useGraphStore } from './store/graphStore'
import { useSavedStore } from './store/savedStore'
import type { SavedGraph } from './types/saved'
import { computeAverage } from './utils/average'

const FONT = "'Pretendard', -apple-system, sans-serif"
type Page = 'edit' | 'detail' | 'comparison' | 'shared'

function HeaderBtn({ label, onClick, primary, disabled }: {
  label: string; onClick: () => void; primary?: boolean; disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: FONT, fontSize: '0.82rem', fontWeight: primary ? 700 : 500,
      color: disabled ? '#ccc' : primary ? '#fff' : '#555',
      background: disabled ? '#f5f5f5' : primary ? '#1976d2' : 'transparent',
      border: `1px solid ${disabled ? '#e0e0e0' : primary ? '#1976d2' : '#d0d0d0'}`,
      borderRadius: 6, padding: '6px 16px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }}>{label}</button>
  )
}

function GraphCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'relative', flex: 1, minHeight: 0,
      margin: '12px 12px 6px',
      background: '#fff', border: '1px solid #e0e0e0',
      borderRadius: 8, overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    }}>
      {children}
    </div>
  )
}

export default function App() {
  const { graph } = useGraphStore()
  const { savedGraphs, save, remove } = useSavedStore()
  const [page, setPage] = useState<Page>('edit')
  const [detailGraph, setDetailGraph] = useState<SavedGraph | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showSavedPanel, setShowSavedPanel] = useState(false)
  const [shareToast, setShareToast] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#share=')) {
      try {
        const data: SavedGraph = JSON.parse(decodeURIComponent(atob(hash.slice(7))))
        setDetailGraph(data)
        setPage('shared')
        history.replaceState(null, '', window.location.pathname)
      } catch {}
    }
  }, [])

  const hasData = graph.points.filter(p => !(p.age === 0 && p.satisfaction === 0)).length > 0

  const handleSave = (name: string) => {
    save(name, graph.points, graph.ageRange)
    setShowSaveDialog(false)
  }

  const handleShare = (g: SavedGraph) => {
    const encoded = btoa(encodeURIComponent(JSON.stringify(g)))
    const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2500)
    })
  }

  const avgPoints = computeAverage(savedGraphs)

  const pageWrapper = (header: React.ReactNode, content: React.ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f5f5', fontFamily: FONT }}>
      <header style={{
        background: '#fff', borderBottom: '1px solid #e0e0e0',
        padding: '10px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>{header}</header>
      {content}
    </div>
  )

  // ── 공유/상세 뷰 ──
  if (page === 'detail' || page === 'shared') {
    const g = detailGraph!
    return pageWrapper(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {page === 'detail' && (
            <button onClick={() => { setPage('edit'); setDetailGraph(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.84rem', fontFamily: FONT }}>← 뒤로</button>
          )}
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111' }}>{g.name}</div>
            <div style={{ fontSize: '0.74rem', color: '#aaa' }}>{new Date(g.savedAt).toLocaleDateString('ko-KR')} 저장 · 수정 불가</div>
          </div>
        </div>
        <button onClick={() => handleShare(g)} style={{
          fontFamily: FONT, fontSize: '0.84rem', fontWeight: 600,
          color: '#1976d2', border: '1px solid #1976d2', borderRadius: 6,
          padding: '7px 18px', background: 'transparent', cursor: 'pointer',
        }}>🔗 공유하기</button>
      </div>,
      <>
        <GraphCard><ReadOnlyGraph points={g.points} ageRange={g.ageRange} /></GraphCard>
        {shareToast && (
          <div style={{
            position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            background: '#222', color: '#fff', borderRadius: 8, padding: '10px 20px',
            fontSize: '0.84rem', fontFamily: FONT, whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)', zIndex: 300,
          }}>📋 공유 URL이 클립보드에 복사되었습니다</div>
        )}
        {page === 'shared' && (
          <div style={{
            background: '#fff', borderTop: '1px solid #e0e0e0',
            padding: '16px 20px', flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555', textAlign: 'center', lineHeight: 1.5 }}>
              나의 인생 만족도는 어떤가요?<br />
              <span style={{ color: '#111', fontWeight: 600 }}>직접 그래프를 그려보세요 — 로그인 없이 무료</span>
            </p>
            <button onClick={() => { setPage('edit'); setDetailGraph(null) }} style={{
              fontFamily: FONT, fontSize: '1rem', fontWeight: 700,
              color: '#fff', background: '#f6465d', border: 'none',
              borderRadius: 10, padding: '14px 40px', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(246,70,93,0.35)',
            }}>✏️ 나도 만들기</button>
          </div>
        )}
      </>
    )
  }

  // ── 비교 뷰 ──
  if (page === 'comparison') {
    return pageWrapper(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setPage('edit')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.84rem', fontFamily: FONT }}>← 뒤로</button>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111' }}>평균 비교</div>
            <div style={{ fontSize: '0.74rem', color: '#aaa' }}>저장된 {savedGraphs.length}개 그래프 평균 vs 내 그래프</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem' }}>
          <span style={{ color: '#1976d2', fontWeight: 600 }}>● 내 그래프</span>
          <span style={{ color: '#ff9800', fontWeight: 600 }}>– – 전체 평균</span>
        </div>
      </div>,
      <GraphCard>
        <ReadOnlyGraph points={graph.points} ageRange={graph.ageRange} overlayPoints={avgPoints} overlayLabel="전체 평균" />
      </GraphCard>
    )
  }

  // ── 편집 뷰 ──
  return pageWrapper(
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>인생 그래프</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {(savedGraphs.length > 0 || savedGraphs.length >= 2) && (
          <button onClick={() => setShowSavedPanel(true)} style={{
            background: 'none', border: '1px solid #d0d0d0', borderRadius: 6,
            padding: '6px 10px', cursor: 'pointer', fontSize: '1rem', color: '#555',
          }}>⋯</button>
        )}
        <HeaderBtn label="완료" primary onClick={() => setShowSaveDialog(true)} disabled={!hasData} />
      </div>
    </div>,
    <>
      <GraphCard><LifeGraph /></GraphCard>
      <GraphControls />
      {showSaveDialog && <SaveDialog onSave={handleSave} onCancel={() => setShowSaveDialog(false)} />}
      {showSavedPanel && (
        <SavedPanel
          graphs={savedGraphs}
          hasMultiple={savedGraphs.length >= 2}
          onView={g => { setDetailGraph(g); setPage('detail'); setShowSavedPanel(false) }}
          onDelete={id => remove(id)}
          onCompare={() => { setPage('comparison'); setShowSavedPanel(false) }}
          onClose={() => setShowSavedPanel(false)}
        />
      )}
    </>
  )
}
