  // --- Single image upload section ---
  const uploadBox = document.getElementById('upload-box');
  const fileInput = document.getElementById('single-file-input');
  const previewImg = uploadBox.querySelector('img');
  const singleContent = document.getElementById('single-image-content');
  const widthInput = document.getElementById('width-input');
  const heightInput = document.getElementById('height-input');
  const ratioInput = document.getElementById('ratio');
  const qualityInput = document.getElementById('quality');
  const downloadBtn = document.getElementById('single-download-btn');

  let ogImageRatio;

  uploadBox.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;

    previewImg.src = URL.createObjectURL(file);
    previewImg.style.objectFit = "contain";
    uploadBox.classList.add('active');
    singleContent.style.display = 'block';

    previewImg.onload = () => {
      widthInput.value = previewImg.naturalWidth;
      heightInput.value = previewImg.naturalHeight;
      ogImageRatio = previewImg.naturalWidth / previewImg.naturalHeight;
    }
  });

  widthInput.addEventListener('input', () => {
    if(ratioInput.checked){
      heightInput.value = Math.floor(widthInput.value / ogImageRatio);
    }
  });

  heightInput.addEventListener('input', () => {
    if(ratioInput.checked){
      widthInput.value = Math.floor(heightInput.value * ogImageRatio);
    }
  });

  downloadBtn.addEventListener('click', () => {
    resizeAndDownloadSingle(fileInput.files[0], widthInput.value, heightInput.value, qualityInput.checked);
  });

  function resizeAndDownloadSingle(file, width, height, reduceQuality){
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = parseInt(width);
        canvas.height = parseInt(height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const quality = reduceQuality ? 0.5 : 1.0;
        canvas.toBlob(blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `resized_${file.name}`;
          a.click();
          URL.revokeObjectURL(a.href);
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- Folder upload section ---
  const selectFolderBtn = document.getElementById('select-folder-btn');
  const folderInput = document.getElementById('folder-input');
  const imageList = document.getElementById('image-list');
  const globalQualityCheckbox = document.getElementById('global-quality');

  selectFolderBtn.addEventListener('click', () => folderInput.click());

  folderInput.addEventListener('change', e => {
    const files = Array.from(e.target.files);
    if(!files.length) return;

    imageList.innerHTML = '';

    // Filter images only
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    imageFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        addImageItem(file, url, img.naturalWidth, img.naturalHeight);
      };

      img.src = url;
    });
  });

  function addImageItem(file, url, originalWidth, originalHeight) {
    const ratio = originalWidth / originalHeight;

    const div = document.createElement('div');
    div.className = 'image-item';

    div.innerHTML = `
      <img src="${url}" alt="preview" />
      <div class="controls">
        <label>Width: <input type="number" min="1" value="${originalWidth}" class="width-input" /></label>
        <label>Height: <input type="number" min="1" value="${originalHeight}" class="height-input" /></label>
        <label><input type="checkbox" class="ratio-lock" checked /> Lock Ratio</label>
        <button class="download-btn">Download</button>
      </div>
    `;

    imageList.appendChild(div);

    const widthInput = div.querySelector('.width-input');
    const heightInput = div.querySelector('.height-input');
    const ratioLock = div.querySelector('.ratio-lock');
    const downloadBtn = div.querySelector('.download-btn');

    widthInput.addEventListener('input', () => {
      if(ratioLock.checked){
        heightInput.value = Math.floor(widthInput.value / ratio);
      }
    });

    heightInput.addEventListener('input', () => {
      if(ratioLock.checked){
        widthInput.value = Math.floor(heightInput.value * ratio);
      }
    });

    downloadBtn.addEventListener('click', () => {
      resizeAndDownloadFolder(file, widthInput.value, heightInput.value, globalQualityCheckbox.checked);
    });
  }

  function resizeAndDownloadFolder(file, width, height, reduceQuality){
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = parseInt(width);
        canvas.height = parseInt(height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const quality = reduceQuality ? 0.5 : 1.0;
        canvas.toBlob(blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `resized_${file.name}`;
          a.click();
          URL.revokeObjectURL(a.href);
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }