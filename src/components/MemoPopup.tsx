import { useEffect, useRef, useState } from 'react'

const FONT = "'Pretendard', -apple-system, sans-serif"

interface Props {
  mode: 'new' | 'edit'
  age: number
  initialMemo: string
  screenX: number
  screenY: number
  containerW: number
  containerH: number
  onSave: (memo: string) => void
  onDelete?: () => void
  onCancel: () => void
}

export default function MemoPopup({ mode, age, initialMemo, screenX, screenY, containerW, onSave, onDelete, onCancel }: Props) {
  const [text, setText] = useState(initialMemo)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  const popW = 280, popH = 150
  let left = screenX - popW / 2
  let top = screenY - popH - 20
  if (left < 8) left = 8
  if (left + popW > containerW - 8) left = containerW - popW - 8
  if (top < 8) top = screenY + 30

  return (
    <div style={{
      position: 'absolute', left, top, width: popW, zIndex: 100,
      background: '#fff', borderRadius: 12, padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid #e8e8e8',
      fontFamily: FONT,
    }}>
      <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: 8 }}>
        {age}세 메모 {mode === 'edit' ? '수정' : ''}
      </div>
      <textarea
        ref={inputRef}
        autoComplete="off"
        spellCheck={false}
        lang="ko"
        inputMode="text"
        value={text}
        onChange={e => setText(e.target.value.slice(0, 20))}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); onSave(text) }
          if (e.key === 'Escape') onCancel()
        }}
        placeholder="최대 20자"
        maxLength={20}
        rows={1}
        style={{
          width: '100%', padding: '8px 10px', borderRadius: 7,
          border: '1px solid #ddd', fontSize: '0.9rem', fontFamily: FONT,
          outline: 'none', marginBottom: 10, resize: 'none',
          lineHeight: '1.5',
        }}
      />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        {mode === 'edit' && (
          <button onClick={onDelete} style={{
            padding: '6px 12px', borderRadius: 6, border: '1px solid #fcc',
            background: 'transparent', color: '#f6465d', fontSize: '0.8rem',
            fontFamily: FONT, cursor: 'pointer',
          }}>삭제</button>
        )}
        <button onClick={onCancel} style={{
          padding: '6px 12px', borderRadius: 6, border: '1px solid #e0e0e0',
          background: 'transparent', color: '#888', fontSize: '0.8rem',
          fontFamily: FONT, cursor: 'pointer',
        }}>취소</button>
        <button onClick={() => onSave(text)} style={{
          padding: '6px 12px', borderRadius: 6, border: 'none',
          background: '#1976d2', color: '#fff', fontSize: '0.8rem',
          fontFamily: FONT, cursor: 'pointer',
        }}>{mode === 'edit' ? '수정' : '저장'}</button>
      </div>
    </div>
  )
}
