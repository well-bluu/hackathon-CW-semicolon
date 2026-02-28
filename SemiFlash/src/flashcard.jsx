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
      // example using streaming callback; remove onProgress if you want normal JSON
      const data = await queryOllama(prompt, {
        // only pass options when you need to override defaults
        // endpoint: '/ollama/api/chat',
        // stream: true,
        // timeoutMs: 0, // disable our abort for long streams
        onProgress: (partial) => {
          // when streaming, the partial string may already be just the response text,
          // so show it as-is
          setResponse(partial)
        },
      })

      console.log('Ollama final response:', data)
      // if the helper returned an object or a JSON string, extract the text field(s)
      let output = data
      if (typeof data === 'string') {
        try {
          const obj = JSON.parse(data)
          if (obj?.choices && obj.choices.length) {
            output = obj.choices.map(c => c.text).join('')
          }
        } catch {
          // not JSON, leave as-is
        }
      } else if (data?.choices && data.choices.length) {
        output = data.choices.map(c => c.text).join('')
      }
      setResponse(output)
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