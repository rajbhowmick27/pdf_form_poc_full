import React, { useEffect, useMemo, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min?url'
import throttle from 'lodash.throttle'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default function DocumentScreen({ doc }) {
  const { id, pdfUrl, formUrl } = doc
  const channelId = useMemo(() => crypto.randomUUID(), [])
  const containerRef = useRef(null)
  const latestEventRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      console.log('Loading PDF:', pdfUrl)
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise
        const container = containerRef.current
        container.innerHTML = ''

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 1.2 })
          const canvas = window.document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({ canvasContext: ctx, viewport }).promise

          const div = window.document.createElement('div')
          div.className = 'page'
          div.dataset.pageNumber = i
          div.appendChild(canvas)
          container.appendChild(div)
        }
      } catch (err) {
        console.error('PDF Load failed:', err)
      }
    }
    load()
  }, [pdfUrl])

  const scrollToPage = (pageNo) => {
    const el = containerRef.current?.querySelector(`.page[data-page-number="${pageNo}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleMessage = throttle((event) => {
    const allowed = new URL(formUrl).origin
    if (event.origin !== allowed) return
    const msg = event.data
    if (msg?.type === 'FIELD_FOCUS') {
      const { channelId: msgChannel, pageNo, timestamp } = msg.payload || {}
      if (msgChannel === channelId && (!latestEventRef.current || timestamp > latestEventRef.current.timestamp)) {
        latestEventRef.current = { timestamp }
        scrollToPage(pageNo)
      }
    }
  }, 150)

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  return (
    <div style={{ border: '2px solid #ccc', padding: 16, borderRadius: 8, marginBottom: 24 }}>
      <h3>{id}</h3>
      <div ref={containerRef} style={{ height: 400, overflowY: 'auto', border: '1px solid #aaa' }}></div>
      <iframe
        src={`${formUrl}?pdfId=${id}&channelId=${channelId}`}
        style={{ width: '100%', height: 300, marginTop: 12, border: '1px solid #888' }}
        title={`form-${id}`}
      />
    </div>
  )
}
