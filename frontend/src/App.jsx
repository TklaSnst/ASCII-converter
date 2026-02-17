import { useState } from 'react'
import './index.css'

const API_URL = '/api/process-image'

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [asciiText, setAsciiText] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [asciiDimensions, setAsciiDimensions] = useState({ width: 0, height: 0 })

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const handleFile = async (file) => {
    if (!file?.type?.startsWith('image/')) return

    const url = URL.createObjectURL(file)
    setImageUrl(url)

    const img = new Image()
    img.onload = () => {
      setAspectRatio(img.naturalWidth / img.naturalHeight)
    }
    img.src = url

    setImage(file)
    setProcessing(true)
    setAsciiText(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(API_URL, { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setAsciiText(data.ascii || '')
        setAsciiDimensions({ width: data.width || 0, height: data.height || 0 })
      } else {
        alert('Ошибка при обработке изображения')
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка при обработке изображения')
    } finally {
      setProcessing(false)
    }
  }

  const onFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const copyToClipboard = () => {
    if (asciiText) {
      navigator.clipboard.writeText(asciiText).catch(() => alert('Не удалось скопировать'))
    }
  }

  const reset = () => {
    if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl)
    setImage(null)
    setImageUrl(null)
    setAsciiText(null)
    setAsciiDimensions({ width: 0, height: 0 })
    setAspectRatio(1)
  }

  return (
    <div className={theme + '-theme'} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileSelect}
      />
      <header className="header">
        <h1 className="header-title">ASCII Converter</h1>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Переключить тему">
          <svg className="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg className="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </header>

      <main className="main-content">
        <div className="content-wrapper">
          <div className="work-zone">
            {!imageUrl && !asciiText ? (
              <button className="upload-btn-main" onClick={() => document.getElementById('fileInput').click()}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Загрузить изображение</span>
              </button>
            ) : (
              <>
                {!asciiText ? (
                  <div
                    className={`upload-area ${imageUrl ? 'has-image' : ''} ${processing ? 'processing' : ''}`}
                    style={{ aspectRatio }}
                  >
                    {imageUrl ? (
                      <div className="image-preview">
                        <img src={imageUrl} alt="Preview" />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="ascii-output-wrap">
                    <pre className="ascii-output">
                      {asciiText}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="sidebar">
            {(imageUrl || asciiText) && (
              <div className="status-section">
                {processing ? (
                  <div className="processing-indicator">
                    <div className="spinner"></div>
                    <p>Обработка изображения...</p>
                  </div>
                ) : (
                  <div className="actions">
                    {asciiText && (
                      <>
                        <button className="copy-btn" onClick={copyToClipboard}>
                          Скопировать ASCII
                        </button>
                        <button className="download-btn">
                          <a
                            href={`/api/download-ascii?text=${encodeURIComponent(asciiText)}`}
                            download="ascii-art.txt"
                            style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}
                          >
                            Скачать .txt
                          </a>
                        </button>
                      </>
                    )}
                    <button className="upload-another-btn" onClick={reset}>
                      Загрузить другое
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 ASCII Converter. Все права защищены.</p>
      </footer>
    </div>
  )
}

export default App
