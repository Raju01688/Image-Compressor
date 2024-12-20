const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const uploadButton = document.getElementById('uploadButton');
const previewContainer = document.getElementById('preview');
const compressButton = document.getElementById('compressButton');
const downloadAllButton = document.getElementById('downloadAllButton');
const compressionRange = document.getElementById('compressionRange');
const compressionValue = document.getElementById('compressionValue');
const controls = document.getElementById('controls');
const addMoreButton = document.getElementById('addMoreButton');
const title = document.getElementById('title');

let images = [];
let compressedImages = [];

// Update compression value display
compressionRange.addEventListener('input', () => {
  compressionValue.innerText = compressionRange.value;
});

// Drag-and-Drop functionality
uploadArea.addEventListener('dragover', (event) => {
  event.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (event) => {
  event.preventDefault();
  uploadArea.classList.remove('dragover');
  handleFiles(event.dataTransfer.files);
});

uploadButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', (event) => handleFiles(event.target.files));

// Handle file selection
function handleFiles(files) {
  const fileList = Array.from(files);
  if (images.length === 0) {
    title.classList.add('hidden');
    uploadArea.classList.add('hidden');
    controls.classList.remove('hidden');
  }

  fileList.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      const item = document.createElement('div');
      item.className = 'preview-item';

      const closeButton = document.createElement('button');
      closeButton.className = 'close-button';
      closeButton.innerText = '×';
      closeButton.onclick = () => {
        images = images.filter((image) => image.file !== file);
        compressedImages = compressedImages.filter((image) => image.file !== file);
        item.remove();
        if (images.length === 0) {
          resetUI();
        }
      };

      const info = document.createElement('div');
      info.className = 'info';
      info.innerText = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;

      item.appendChild(img);
      item.appendChild(info);
      item.appendChild(closeButton);
      previewContainer.appendChild(item);

      images.push({ file, src: e.target.result });
    };
    reader.readAsDataURL(file);
  });
}

addMoreButton.addEventListener('click', () => imageInput.click());

// Compress all images
compressButton.addEventListener('click', () => {
  compressedImages = []; // Reset compressed images
  images.forEach((image, index) => {
    const compressionRatio = compressionRange.value / 100;
    const img = new Image();
    img.src = image.src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], image.file.name, {
            type: image.file.type,
          });
          compressedImages.push({ file: compressedFile, src: URL.createObjectURL(blob) });

          // Update preview with compressed size
          const previewItem = previewContainer.children[index];
          const info = previewItem.querySelector('.info');
          info.innerText = `${compressedFile.name} (${(compressedFile.size / 1024).toFixed(2)} KB)`;
        },
        image.file.type,
        compressionRatio
      );
    };
  });
});

// Download all compressed images
downloadAllButton.addEventListener('click', () => {
  if (compressedImages.length === 0) {
    alert('Please compress the images first!');
    return;
  }

  const zip = new JSZip();
  compressedImages.forEach((image, index) => {
    zip.file(image.file.name, image.file);
  });

  zip.generateAsync({ type: 'blob' }).then((content) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'compressed_images.zip';
    link.click();
  });
});

// Reset UI if all images are removed
function resetUI() {
  title.classList.remove('hidden');
  uploadArea.classList.remove('hidden');
  controls.classList.add('hidden');
  previewContainer.innerHTML = '';
  images = [];
  compressedImages = [];
}
