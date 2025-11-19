import React, { useMemo } from 'react'
const fieldToPageMap = { firstName: 1, address: 2, phone: 3 }

export default function FormApp(){
  const params = useMemo(()=> new URLSearchParams(window.location.search), [])
  const pdfId = params.get('pdfId')
  const channelId = params.get('channelId')

  const handleFocus = (field) => {
    const pageNo = fieldToPageMap[field]
    window.parent.postMessage({ type: 'FIELD_FOCUS', payload: { pdfId, channelId, field, pageNo, timestamp: Date.now() } }, '*')
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>Form UI (Child)</h3>
      <div style={{ marginBottom: 10, color: '#555' }}>
        <strong>pdfId:</strong> {pdfId}<br/>
        <strong>channelId:</strong> {channelId}
      </div>
      <form style={{ display: 'grid', gap: 10 }}>
        {Object.keys(fieldToPageMap).map(f => (
          <div key={f}>
            <label>{f}</label>
            <input name={f} onFocus={()=>handleFocus(f)} style={{ width: '100%', padding: 6 }} />
          </div>
        ))}
      </form>
    </div>
  )
}
