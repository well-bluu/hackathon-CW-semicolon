import { useState } from 'react'
import { queryOllama } from './aiService'

function Flashcard() {
  const [prompt, setPrompt] = useState('Explain React hooks')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [startedAt, setStartedAt] = useState(null)
  const [finishedAt, setFinishedAt] = useState(null)

  const handleAsk = async () => {
    setLoading(true)
    setStartedAt(new Date())
    setFinishedAt(null)
    setResponse('')

    try {
      const data = await queryOllama(prompt)
      console.log('Ollama response raw:', data)
      setResponse(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error('Ollama error', err)
      setResponse(`Error: ${err.message}`)
    } finally {
      setLoading(false)
      setFinishedAt(new Date())
    }
  }

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        style={{ width: '100%' }}
      />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? 'Asking...' : 'Ask AI'}
      </button>

      {startedAt && (
        <div style={{ fontSize: 'smaller', color: '#666' }}>
          Sent: {startedAt.toLocaleTimeString()}
          {finishedAt && (<> – Received: {finishedAt.toLocaleTimeString()}</>)}
        </div>
      )}

      <pre>{response}</pre>
    </div>
  )
}

export default Flashcard