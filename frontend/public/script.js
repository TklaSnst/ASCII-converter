// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
body.className = savedTheme + '-theme';
updateThemeIcon();

themeToggle.addEventListener('click', () => {
  const isDark = body.classList.contains('dark-theme');
  body.className = isDark ? 'light-theme' : 'dark-theme';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
  updateThemeIcon();
});

function updateThemeIcon() {
  const isDark = body.classList.contains('dark-theme');
  // Icon visibility is handled by CSS
}

// File upload functionality
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const downloadBtn = document.getElementById('downloadBtn');
const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
const processingIndicator = document.getElementById('processingIndicator');
const statusSection = document.getElementById('statusSection');
const actions = document.getElementById('actions');

let currentImageUrl = null;
let processedImageUrl = null;

// Click on upload area
uploadArea.addEventListener('click', (e) => {
  if (!imagePreview.style.display || imagePreview.style.display === 'none') {
    fileInput.click();
  }
});

// File selection
fileInput.addEventListener('change', handleFileSelect);

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  if (!uploadArea.classList.contains('has-image')) {
    uploadArea.style.borderColor = 'var(--green-hover)';
  }
});

uploadArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  if (!uploadArea.classList.contains('has-image')) {
    uploadArea.style.borderColor = 'var(--green-primary)';
  }
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = 'var(--green-primary)';
  
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleFile(file);
  } else {
    alert('Пожалуйста, выберите изображение');
  }
});

function handleFileSelect(event) {
  const file = event.target.files?.[0];
  if (file) {
    handleFile(file);
  }
}

async function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выберите изображение');
    return;
  }

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageUrl = e.target.result;
    showPreview(currentImageUrl);
  };
  reader.readAsDataURL(file);

  // Show processing indicator in sidebar
  statusSection.style.display = 'block';
  processingIndicator.style.display = 'flex';
  actions.style.display = 'none';
  uploadPlaceholder.style.display = 'none';
  imagePreview.style.display = 'none';
  uploadArea.classList.add('processing');

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8000/api/process-image', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      processedImageUrl = URL.createObjectURL(blob);
      showPreview(processedImageUrl);
      processingIndicator.style.display = 'none';
      actions.style.display = 'flex';
    } else {
      alert('Ошибка при обработке изображения');
      showPreview(currentImageUrl);
      processingIndicator.style.display = 'none';
    }
  } catch (error) {
    console.error('Error processing image:', error);
    alert('Ошибка при обработке изображения');
    showPreview(currentImageUrl);
    processingIndicator.style.display = 'none';
  } finally {
    uploadArea.classList.remove('processing');
  }
}

function showPreview(imageUrl) {
  previewImage.src = imageUrl;
  uploadPlaceholder.style.display = 'none';
  imagePreview.style.display = 'flex';
  uploadArea.classList.add('has-image');
}

downloadBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (processedImageUrl) {
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = 'processed-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});

uploadAnotherBtn.addEventListener('click', () => {
  // Cleanup
  if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
    URL.revokeObjectURL(currentImageUrl);
  }
  if (processedImageUrl && processedImageUrl.startsWith('blob:')) {
    URL.revokeObjectURL(processedImageUrl);
  }
  
  currentImageUrl = null;
  processedImageUrl = null;
  fileInput.value = '';
  
  uploadPlaceholder.style.display = 'flex';
  imagePreview.style.display = 'none';
  statusSection.style.display = 'none';
  processingIndicator.style.display = 'none';
  actions.style.display = 'none';
  uploadArea.classList.remove('has-image');
});
