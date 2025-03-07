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
    colorMode: 'normal',
    edgeDetection: {
        enabled: false,
        value: 0
    },
    threshold: {
        enabled: false,
        value: 128
    }
};

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
        await processImage(file);
    }
});

async function processImage(file) {
    currentImageFile = file;
    document.getElementById('initialMessage').style.opacity = '0';
    document.getElementById('asciiControls').style.display = 'flex';
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

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    }
}

animate(); 