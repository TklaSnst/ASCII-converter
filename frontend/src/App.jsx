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

  const bgGradient = theme === 'dark' 
    ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
    : 'bg-gradient-to-br from-gray-100 to-gray-300'

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} ${bgGradient} min-h-screen flex flex-col transition-colors duration-300`}>
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        className="hidden"
        onChange={onFileSelect}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 px-8 py-5 flex justify-between items-center transition-colors duration-300">
        <h1 className="text-2xl font-bold text-green-500 tracking-tight">ASCII Converter</h1>
        <button 
          onClick={toggleTheme} 
          aria-label="Переключить тему"
          className="bg-transparent border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2 cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
        >
          {theme === 'dark' ? (
            <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          ) : (
            <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
          
          {/* Work Zone */}
          <div className="w-full max-w-full max-h-[65vh] flex items-center justify-center overflow-auto">
            {!imageUrl && !asciiText ? (
              <button 
                onClick={() => document.getElementById('fileInput').click()}
                className="flex flex-col items-center gap-4 bg-white dark:bg-gray-900 border-[3px] border-dashed border-green-500 rounded-2xl px-16 py-12 cursor-pointer transition-all duration-300 hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-green-600 dark:text-green-400"
              >
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span className="text-lg font-semibold">Загрузить изображение</span>
              </button>
            ) : (
              <>
                {!asciiText ? (
                  <div
                    className={`w-full bg-white dark:bg-gray-900 border-[3px] ${imageUrl ? 'border-solid' : 'border-dashed'} border-green-500 rounded-2xl flex items-center justify-center cursor-default shadow-lg overflow-hidden relative ${processing ? 'pointer-events-none' : ''}`}
                    style={{ aspectRatio }}
                  >
                    {imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-[55vw] max-h-[55vh] bg-white dark:bg-gray-900 border-[3px] border-green-500 rounded-2xl shadow-lg overflow-auto block">
                    <pre className="block m-0 p-4 font-mono text-[10px] leading-none tracking-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 whitespace-pre select-all">
                      {asciiText}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="min-w-[200px] lg:min-w-fit flex flex-col gap-4">
            {(imageUrl || asciiText) && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg transition-colors duration-300">
                {processing ? (
                  <div className="flex flex-col items-center gap-4 text-green-500">
                    <div className="w-12 h-12 border-4 border-green-900 dark:border-green-900 border-t-green-500 rounded-full animate-spin"></div>
                    <p className="text-lg font-medium text-green-600 dark:text-green-400">Обработка изображения...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {asciiText && (
                      <>
                        <button 
                          onClick={copyToClipboard}
                          className="bg-green-500 text-white border-none px-6 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5 shadow-md hover:shadow-lg w-full"
                        >
                          Скопировать ASCII
                        </button>
                        <button className="bg-green-500 text-white border-none px-6 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5 shadow-md hover:shadow-lg w-full">
                          <a
                            href={`/api/download-ascii?text=${encodeURIComponent(asciiText)}`}
                            download="ascii-art.txt"
                            className="text-inherit no-underline block"
                          >
                            Скачать .txt
                          </a>
                        </button>
                      </>
                    )}
                    <button 
                      onClick={reset}
                      className="bg-transparent text-green-500 border-2 border-green-500 px-6 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-green-500 hover:text-white hover:-translate-y-0.5 shadow-md hover:shadow-lg w-full"
                    >
                      Загрузить другое
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 px-8 py-6 text-center border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors duration-300">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          &copy; 2026 ASCII Converter. Все права защищены.
        </p>
      </footer>
    </div>
  )
}

export default App
