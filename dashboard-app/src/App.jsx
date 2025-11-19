import React from 'react'
import DocumentScreen from './DocumentScreen'

const documents = [
  { id: 'DOC1', pdfUrl: '/sample.pdf', formUrl: 'http://localhost:5174' },
  { id: 'DOC2', pdfUrl: '/sample.pdf', formUrl: 'http://localhost:5174' }
]

export default function App(){
  return (
    <div style={{ padding: 20 }}>
      <h1>📚 Dashboard App (Parent)</h1>
      {documents.map(d => (
        <DocumentScreen key={d.id} doc={d} />
      ))}
    </div>
  )
}
