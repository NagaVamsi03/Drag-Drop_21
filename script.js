const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const uploadBtn = document.getElementById('uploadBtn');
const notification = document.getElementById('notification');

let filesArray = [];

// Drag and drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
});

dropZone.addEventListener('drop', handleDrop, false);
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
uploadBtn.addEventListener('click', uploadFiles);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    [...files].forEach(file => {
        if (validateFile(file)) {
            filesArray.push(file);
            displayFile(file);
        }
    });
    
    if (filesArray.length > 0) {
        uploadBtn.style.display = 'block';
    }
}

function validateFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (file.size > maxSize) {
        showNotification(`${file.name} exceeds 5MB limit`, 'error');
        return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
        showNotification(`${file.name} is not a supported file type`, 'error');
        return false;
    }
    
    return true;
}

function displayFile(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.fileName = file.name;
    
    const isImage = file.type.startsWith('image/');
    
    if (isImage) {
        const img = document.createElement('img');
        img.className = 'file-preview';
        const reader = new FileReader();
        reader.onload = (e) => img.src = e.target.result;
        reader.readAsDataURL(file);
        fileItem.appendChild(img);
    } else {
        const icon = document.createElement('div');
        icon.className = 'file-icon';
        icon.textContent = file.name.split('.').pop().toUpperCase();
        fileItem.appendChild(icon);
    }
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.innerHTML = `
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
    `;
    
    const actions = document.createElement('div');
    actions.className = 'file-actions';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeFile(file.name, fileItem);
    
    actions.appendChild(removeBtn);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(actions);
    fileList.appendChild(fileItem);
}

function removeFile(fileName, fileItem) {
    filesArray = filesArray.filter(f => f.name !== fileName);
    fileItem.remove();
    
    if (filesArray.length === 0) {
        uploadBtn.style.display = 'none';
    }
}

function uploadFiles() {
    if (filesArray.length === 0) return;
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    
    const fileItems = fileList.querySelectorAll('.file-item');
    
    fileItems.forEach((item, index) => {
        const fileInfo = item.querySelector('.file-info');
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        fileInfo.appendChild(progressBar);
        
        const progressFill = progressBar.querySelector('.progress-fill');
        const actions = item.querySelector('.file-actions');
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                progressBar.remove();
                const status = document.createElement('span');
                status.className = 'status success';
                status.textContent = '✓ Uploaded';
                actions.innerHTML = '';
                actions.appendChild(status);
                
                if (index === fileItems.length - 1) {
                    uploadBtn.textContent = 'Upload Complete';
                    showNotification('All files uploaded successfully!', 'success');
                    setTimeout(() => {
                        filesArray = [];
                        fileList.innerHTML = '';
                        uploadBtn.style.display = 'none';
                        uploadBtn.disabled = false;
                        uploadBtn.textContent = 'Upload Files';
                    }, 2000);
                }
            }
            progressFill.style.width = progress + '%';
        }, 200);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
