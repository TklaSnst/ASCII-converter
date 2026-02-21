import { useState, useRef } from 'react'
import './index.css'

const IMAGE_API_URL = '/api/process-image'
const CONVERT_GIF_URL = '/api/convert-gif'
const CONVERT_VIDEO_URL = '/api/convert-video'

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaUrl, setMediaUrl] = useState(null)
  const [mediaType, setMediaType] = useState(null) // 'image', 'gif', 'video'
  const [asciiText, setAsciiText] = useState(null)
  const [asciiVideoUrl, setAsciiVideoUrl] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [asciiDimensions, setAsciiDimensions] = useState({ width: 0, height: 0 })
  const videoRef = useRef(null)

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const getMediaType = (file) => {
    if (file.type.startsWith('image/gif')) return 'gif'
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return null
  }

  const handleFile = async (file) => {
    const type = getMediaType(file)
    if (!type) return

    const url = URL.createObjectURL(file)
    setMediaUrl(url)
    setMediaType(type)

    if (type === 'image' || type === 'gif') {
      const img = new Image()
      img.onload = () => {
        setAspectRatio(img.naturalWidth / img.naturalHeight)
      }
      img.src = url
    } else if (type === 'video') {
      const video = document.createElement('video')
      video.onloadedmetadata = () => {
        setAspectRatio(video.videoWidth / video.videoHeight)
      }
      video.src = url
    }

    setMediaFile(file)
    setProcessing(true)
    setAsciiText(null)
    setAsciiVideoUrl(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Для изображений - получаем текст, для GIF/видео - сразу видео
      if (type === 'image') {
        const res = await fetch(IMAGE_API_URL, { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          setAsciiText(data.ascii || '')
          setAsciiDimensions({ width: data.width || 0, height: data.height || 0 })
        } else {
          alert('Ошибка при обработке изображения')
        }
      } else {
        // Для GIF и видео - сразу конвертируем в видео
        const convertUrl = type === 'gif' ? CONVERT_GIF_URL : CONVERT_VIDEO_URL
        const res = await fetch(convertUrl, { method: 'POST', body: formData })
        
        if (res.ok) {
          const blob = await res.blob()
          const blobUrl = URL.createObjectURL(blob)
          setAsciiVideoUrl(blobUrl)
        } else {
          alert('Ошибка при конвертации в ASCII видео')
        }
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка при обработке файла')
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
    if (mediaUrl?.startsWith('blob:')) URL.revokeObjectURL(mediaUrl)
    if (asciiVideoUrl?.startsWith('blob:')) URL.revokeObjectURL(asciiVideoUrl)
    setMediaFile(null)
    setMediaUrl(null)
    setMediaType(null)
    setAsciiText(null)
    setAsciiVideoUrl(null)
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
        accept="image/*,video/*,.gif"
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
            {!mediaUrl && !asciiText && !asciiVideoUrl ? (
              <button 
                onClick={() => document.getElementById('fileInput').click()}
                className="flex flex-col items-center gap-4 bg-white dark:bg-gray-900 border-[3px] border-dashed border-green-500 rounded-2xl px-16 py-12 cursor-pointer transition-all duration-300 hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-green-600 dark:text-green-400"
              >
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span className="text-lg font-semibold">Загрузить изображение, GIF или видео</span>
              </button>
            ) : (
              <>
                {!asciiText && !asciiVideoUrl ? (
                  <div
                    className={`w-full bg-white dark:bg-gray-900 border-[3px] ${mediaUrl ? 'border-solid' : 'border-dashed'} border-green-500 rounded-2xl flex items-center justify-center cursor-default shadow-lg overflow-hidden relative ${processing ? 'pointer-events-none' : ''}`}
                    style={{ aspectRatio }}
                  >
                    {mediaUrl && mediaType === 'image' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src={mediaUrl} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                      </div>
                    )}
                    {mediaUrl && mediaType === 'gif' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src={mediaUrl} alt="GIF Preview" className="w-full h-full object-contain rounded-xl" />
                      </div>
                    )}
                    {mediaUrl && mediaType === 'video' && (
                      <video 
                        src={mediaUrl} 
                        controls 
                        className="w-full h-full object-contain rounded-xl"
                        style={{ maxHeight: '65vh' }}
                      />
                    )}
                  </div>
                ) : asciiVideoUrl ? (
                  <div className="max-w-[55vw] max-h-[55vh] bg-white dark:bg-gray-900 border-[3px] border-green-500 rounded-2xl shadow-lg overflow-hidden">
                    <video 
                      ref={videoRef}
                      src={asciiVideoUrl} 
                      controls 
                      autoPlay 
                      loop
                      className="w-full h-full"
                    />
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
            {(mediaUrl || asciiText || asciiVideoUrl) && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg transition-colors duration-300">
                {processing ? (
                  <div className="flex flex-col items-center gap-4 text-green-500">
                    <div className="w-12 h-12 border-4 border-green-900 dark:border-green-900 border-t-green-500 rounded-full animate-spin"></div>
                    <p className="text-lg font-medium text-green-600 dark:text-green-400">
                      {mediaType === 'video' || mediaType === 'gif'
                        ? 'Конвертация в ASCII видео...'
                        : 'Обработка изображения...'
                      }
                    </p>
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
                    {asciiVideoUrl && (
                      <a
                        href={asciiVideoUrl}
                        download={mediaType === 'gif' ? 'ascii-animation.gif' : 'ascii-video.mp4'}
                        className="bg-green-500 text-white text-center px-6 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5 shadow-md hover:shadow-lg w-full no-underline block"
                      >
                        Скачать {mediaType === 'gif' ? 'GIF' : 'Видео'}
                      </a>
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
