const grid = document.getElementById('grid');
const converterContainer = document.getElementById('converterContainer');
const container = document.querySelector('.space-container');
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let lastDragX = 0;
let lastDragY = 0;
let cursorTargetX = 0;
let cursorTargetY = 0;

// ASCII characters from darkest to lightest
let ASCII_CHARS = '@%#*+=-:. ';

// Image processing options
let currentImageFile = null;
let imageProcessingOptions = {
    brightness: 100,
    contrast: 100,
    dithering: 'none',
    colorMode: 'inverted',
    edgeDetection: {
        enabled: false,
        value: 0
    },
    threshold: {
        enabled: false,
        value: 128
    }
};

let isWebcamActive = false;
let webcamAnimationFrame = null;

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function updateTextColor(color) {
    document.getElementById('asciiOutput').style.color = color;
}

function updateFontSize(size) {
    const output = document.getElementById('asciiOutput');
    output.style.fontSize = size + 'px';
    output.style.lineHeight = size + 'px';
    document.getElementById('fontSizeValue').textContent = size + 'px';
}

function updateCharSet(chars) {
    if (chars.length > 0) {
        ASCII_CHARS = chars;
    }
}

function getAsciiChar(brightness) {
    return ASCII_CHARS[Math.floor((ASCII_CHARS.length - 1) * brightness)];
}

function updateValue(input, displayId, suffix = '') {
    document.getElementById(displayId).textContent = input.value + suffix;
    
    if (input.id === 'brightnessInput') {
        imageProcessingOptions.brightness = parseInt(input.value);
    } else if (input.id === 'contrastInput') {
        imageProcessingOptions.contrast = parseInt(input.value);
    } else if (input.id === 'edgeInput') {
        imageProcessingOptions.edgeDetection.value = parseInt(input.value);
    } else if (input.id === 'thresholdInput') {
        imageProcessingOptions.threshold.value = parseInt(input.value);
    }
    
    if (isWebcamActive) {
        // Don't reprocess for webcam as it's already updating in real-time
        return;
    }
    reprocessImage();
}

function updateCharSetFromPreset(preset) {
    const presets = {
        'standard': '@%#*+=-:. ',
        'blocks': '█▓▒░ ',
        'minimal': '#. ',
        'letters': 'MWBHKDPO. ',
        'custom': document.getElementById('charSetInput').value
    };
    
    const chars = presets[preset];
    document.getElementById('charSetInput').value = chars;
    ASCII_CHARS = chars;
    reprocessImage();
}

function updateColorMode(mode) {
    imageProcessingOptions.colorMode = mode;
    reprocessImage();
}

function updateDithering(method) {
    imageProcessingOptions.dithering = method;
    reprocessImage();
}

function toggleEdgeDetection() {
    const enabled = document.getElementById('edgeToggle').checked;
    document.getElementById('edgeControls').style.display = enabled ? 'block' : 'none';
    imageProcessingOptions.edgeDetection.enabled = enabled;
    reprocessImage();
}

function toggleThreshold() {
    const enabled = document.getElementById('thresholdToggle').checked;
    document.getElementById('thresholdControls').style.display = enabled ? 'block' : 'none';
    imageProcessingOptions.threshold.enabled = enabled;
    reprocessImage();
}

// Mouse and touch event handlers
document.addEventListener('mousedown', (e) => {
    if (e.target === container || e.target === grid) {
        isDragging = true;
        container.classList.add('dragging');
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        lastDragX = targetX;
        lastDragY = targetY;
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = (e.clientX - dragStartX) / window.innerWidth * 800;
        const deltaY = (e.clientY - dragStartY) / window.innerHeight * 800;
        
        targetX = lastDragX + deltaX;
        targetY = lastDragY + deltaY;
    } else {
        cursorTargetX = (e.clientX - window.innerWidth / 2) * 0.1;
        cursorTargetY = (e.clientY - window.innerHeight / 2) * 0.1;
        
        mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    container.classList.remove('dragging');
});

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    lastDragX = targetX;
    lastDragY = targetY;
    isDragging = true;
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    const deltaX = (touchX - touchStartX) / window.innerWidth * 800;
    const deltaY = (touchY - touchStartY) / window.innerHeight * 800;
    
    targetX = lastDragX + deltaX;
    targetY = lastDragY + deltaY;
    
    e.preventDefault();
});

document.addEventListener('touchend', () => {
    isDragging = false;
});

function animate() {
    if (!isDragging) {
        targetX += (cursorTargetX - targetX) * 0.02;
        targetY += (cursorTargetY - targetY) * 0.02;
    }

    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;

    const transform = `translate(-50%, -50%) 
                      translate3d(${currentX}px, ${currentY}px, 0)
                      rotateX(${-mouseY * 3}deg) 
                      rotateY(${mouseX * 3}deg)`;

    grid.style.transform = transform;
    converterContainer.style.transform = transform;

    requestAnimationFrame(animate);
}

// Reset cursor position when mouse leaves window
document.addEventListener('mouseleave', () => {
    if (!isDragging) {
        cursorTargetX = 0;
        cursorTargetY = 0;
    }
});

// Drag and drop handling
const dropZone = document.getElementById('dropZone');

document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    if (!dropZone.classList.contains('active')) {
        dropZone.classList.add('active');
    }
});

document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    const rect = dropZone.getBoundingClientRect();
    if (
        e.clientX <= rect.left ||
        e.clientX >= rect.right ||
        e.clientY <= rect.top ||
        e.clientY >= rect.bottom
    ) {
        dropZone.classList.remove('active');
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        stopWebcam(); // Stop webcam before processing new image
        await processImage(file);
    }
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        stopWebcam(); // Stop webcam before processing new image
        processImage(file);
    }
}

// Image preview functionality
function updateImagePreview(source) {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('imagePreview');
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    
    // Show the preview container
    previewContainer.style.display = 'block';
    
    if (source instanceof File) {
        // Handle file preview
        previewImg.src = URL.createObjectURL(source);
        previewImg.style.display = 'block';
        
        // Let the browser maintain aspect ratio naturally
        previewImg.style.width = 'auto';
        previewImg.style.height = 'auto';
        previewImg.style.maxWidth = '100%';
        previewImg.style.maxHeight = '100%';
        
    } else if (source instanceof HTMLVideoElement) {
        // For webcam preview, keep aspect ratio 
        const videoRatio = source.videoWidth / source.videoHeight;
        
        // Set canvas size to match video's aspect ratio
        const maxWidth = previewContainer.clientWidth;
        const maxHeight = previewContainer.clientHeight;
        
        let canvasWidth, canvasHeight;
        
        if (maxWidth / videoRatio <= maxHeight) {
            // Width is the limiting factor
            canvasWidth = maxWidth;
            canvasHeight = maxWidth / videoRatio;
        } else {
            // Height is the limiting factor
            canvasHeight = maxHeight;
            canvasWidth = maxHeight * videoRatio;
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Draw video frame to canvas, maintaining aspect ratio
        ctx.drawImage(source, 0, 0, canvasWidth, canvasHeight);
        
        // Convert canvas to image
        previewImg.src = canvas.toDataURL('image/png');
        previewImg.style.display = 'block';
        previewImg.style.width = 'auto';
        previewImg.style.height = 'auto';
        previewImg.style.maxWidth = '100%';
        previewImg.style.maxHeight = '100%';
    }
}

async function processImage(file) {
    currentImageFile = file;
    const initialMessage = document.getElementById('initialMessage');
    initialMessage.classList.add('bottom');
    document.getElementById('asciiControls').style.display = 'flex';
    
    // Update preview with the file
    updateImagePreview(file);
    
    reprocessImage();
}

async function reprocessImage() {
    if (!currentImageFile) return;

    const img = new Image();
    img.src = URL.createObjectURL(currentImageFile);

    await new Promise((resolve) => {
        img.onload = resolve;
    });

    const width = parseInt(document.getElementById('widthInput').value);
    // Calculate height to maintain aspect ratio
    const height = Math.floor(width * (img.height / img.width) * 0.5);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    ctx.filter = `brightness(${imageProcessingOptions.brightness}%) contrast(${imageProcessingOptions.contrast}%)`;
    ctx.drawImage(img, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    applyImageProcessing(pixels, width, height);

    let ascii = '';
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 765;
            ascii += getAsciiChar(brightness);
        }
        ascii += '\n';
    }

    document.getElementById('asciiOutput').textContent = ascii;
}

function applyImageProcessing(pixels, width, height) {
    if (imageProcessingOptions.threshold.enabled) {
        for (let i = 0; i < pixels.length; i += 4) {
            const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            const value = avg > imageProcessingOptions.threshold.value ? 255 : 0;
            pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
        }
    }

    if (imageProcessingOptions.colorMode === 'inverted') {
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i];
            pixels[i + 1] = 255 - pixels[i + 1];
            pixels[i + 2] = 255 - pixels[i + 2];
        }
    } else if (imageProcessingOptions.colorMode === 'grayscale') {
        for (let i = 0; i < pixels.length; i += 4) {
            const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            pixels[i] = pixels[i + 1] = pixels[i + 2] = avg;
        }
    }

    if (imageProcessingOptions.edgeDetection.enabled && imageProcessingOptions.edgeDetection.value > 0) {
        const edgePixels = new Uint8ClampedArray(pixels.length);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                const surrounding = [
                    pixels[((y-1) * width + (x-1)) * 4],
                    pixels[((y-1) * width + x) * 4],
                    pixels[((y-1) * width + (x+1)) * 4],
                    pixels[(y * width + (x-1)) * 4],
                    pixels[(y * width + (x+1)) * 4],
                    pixels[((y+1) * width + (x-1)) * 4],
                    pixels[((y+1) * width + x) * 4],
                    pixels[((y+1) * width + (x+1)) * 4]
                ];
                const avg = surrounding.reduce((a, b) => a + b) / 8;
                const diff = Math.abs(pixels[idx] - avg);
                edgePixels[idx] = edgePixels[idx + 1] = edgePixels[idx + 2] = 
                    diff * (imageProcessingOptions.edgeDetection.value / 50);
            }
        }
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = edgePixels[i];
            pixels[i + 1] = edgePixels[i + 1];
            pixels[i + 2] = edgePixels[i + 2];
        }
    }
}

function copyToClipboard() {
    const ascii = document.getElementById('asciiOutput').textContent;
    navigator.clipboard.writeText(ascii);
}

function exportAsTxt() {
    const ascii = document.getElementById('asciiOutput').textContent;
    const blob = new Blob([ascii], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ascii_art.txt';
    link.click();
    URL.revokeObjectURL(url);
}

async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        const video = document.getElementById('webcamVideo');
        video.srcObject = stream;
        await video.play();
        
        // Move buttons to bottom and show controls
        const initialMessage = document.getElementById('initialMessage');
        initialMessage.classList.add('bottom');
        document.getElementById('asciiControls').style.display = 'flex';
        
        // Update webcam button
        const webcamButton = document.querySelector('.webcam-button');
        webcamButton.classList.add('active');
        webcamButton.innerHTML = `
            <span class="pulse-dot active"></span>
            <i class="fas fa-video"></i>
            <span class="button-text">STOP WEBCAM</span>
        `;
        webcamButton.onclick = stopWebcam;
        
        isWebcamActive = true;
        processWebcamFrame();
        
    } catch (err) {
        console.error('Error accessing webcam:', err);
        alert('Unable to access webcam. Please make sure you have granted camera permissions.');
    }
}

function stopWebcam() {
    if (isWebcamActive) {
        const video = document.getElementById('webcamVideo');
        if (video.srcObject) {
            const stream = video.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
        }
        
        if (webcamAnimationFrame) {
            cancelAnimationFrame(webcamAnimationFrame);
            webcamAnimationFrame = null;
        }
        
        // Reset webcam button
        const webcamButton = document.querySelector('.webcam-button');
        webcamButton.classList.remove('active');
        webcamButton.innerHTML = `
            <span class="pulse-dot"></span>
            <i class="fas fa-video"></i>
            <span class="button-text">WEBCAM</span>
        `;
        webcamButton.onclick = startWebcam;
        
        isWebcamActive = false;
        document.getElementById('asciiOutput').textContent = ''; // Clear the output
        
        // Hide preview container
        document.getElementById('imagePreviewContainer').style.display = 'none';
    }
}

function processWebcamFrame() {
    if (!isWebcamActive) return;

    const video = document.getElementById('webcamVideo');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Update preview with webcam
    updateImagePreview(video);
    
    const width = parseInt(document.getElementById('widthInput').value);
    // Calculate height maintaining aspect ratio
    const height = Math.floor(width * (video.videoHeight / video.videoWidth) * 0.5);
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.filter = `brightness(${imageProcessingOptions.brightness}%) contrast(${imageProcessingOptions.contrast}%)`;
    ctx.drawImage(video, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    applyImageProcessing(pixels, width, height);
    
    let ascii = '';
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 765;
            ascii += getAsciiChar(brightness);
        }
        ascii += '\n';
    }
    
    document.getElementById('asciiOutput').textContent = ascii;
    webcamAnimationFrame = requestAnimationFrame(processWebcamFrame);
}

// Function to update preview when customization settings change
function updatePreviewWithSettings() {
    if (isWebcamActive) {
        const video = document.getElementById('webcamVideo');
        updateImagePreview(video);
    } else if (currentImageFile) {
        updateImagePreview(currentImageFile);
    }
}

// Add listeners to update preview when settings change
document.getElementById('brightnessInput').addEventListener('input', updatePreviewWithSettings);
document.getElementById('contrastInput').addEventListener('input', updatePreviewWithSettings);
document.getElementById('ditheringInput').addEventListener('change', updatePreviewWithSettings);
document.getElementById('colorMode').addEventListener('change', updatePreviewWithSettings);

animate();

// Clean up webcam when window is closed
window.addEventListener('beforeunload', stopWebcam);