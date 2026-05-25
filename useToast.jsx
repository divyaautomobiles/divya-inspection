import { createContext, useCallback, useContext, useState } from 'react'
const ToastCtx = createContext(null)
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p.slice(-4), { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }, [])
  const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  const COLORS = {
    success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f97316'
  }
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position:'fixed', bottom:24, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none', maxWidth:340 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background:'#12152a', border:`1px solid ${COLORS[t.type]}44`,
            borderLeft:`3px solid ${COLORS[t.type]}`,
            borderRadius:10, padding:'11px 16px',
            fontSize:13, fontWeight:600, color:'#f1f3ff',
            boxShadow:'0 4px 20px rgba(0,0,0,.5)',
            animation:'fadeUp .3s ease both',
            display:'flex', alignItems:'center', gap:8, pointerEvents:'all',
          }}>
            <span>{ICONS[t.type]}</span><span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)
