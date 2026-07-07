import { useState } from 'react'

const FONT = "'Pretendard', -apple-system, sans-serif"

interface Props { onSave: (name: string) => void; onCancel: () => void }

export default function SaveDialog({ onSave, onCancel }: Props) {
  const [name, setName] = useState('')
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onMouseDown={onCancel}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: '24px',
        width: 320, fontFamily: FONT,
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
      }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: 6 }}>그래프 저장</div>
        <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 16 }}>이름을 입력하면 저장 목록에 추가됩니다</div>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value.slice(0, 20))}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()); if (e.key === 'Escape') onCancel() }}
          placeholder="예: 나의 인생 그래프"
          maxLength={20}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: '1px solid #ddd', fontSize: '0.95rem', fontFamily: FONT,
            outline: 'none', marginBottom: 14,
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 18px', borderRadius: 7, border: '1px solid #e0e0e0',
            background: 'transparent', color: '#888', fontSize: '0.88rem',
            fontFamily: FONT, cursor: 'pointer',
          }}>취소</button>
          <button onClick={() => name.trim() && onSave(name.trim())} disabled={!name.trim()} style={{
            padding: '8px 18px', borderRadius: 7, border: 'none',
            background: name.trim() ? '#1976d2' : '#e0e0e0',
            color: name.trim() ? '#fff' : '#bbb', fontSize: '0.88rem',
            fontFamily: FONT, cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}>저장</button>
        </div>
      </div>
    </div>
  )
}
