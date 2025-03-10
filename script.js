const grid = document.getElementById('grid');
const converterContainer = document.getElementById('converterContainer');
const container = document.querySelector('.space-container');

// Add click handler for BITBLOCK logo
document.querySelector('.logo-letters').addEventListener('click', () => {
    window.location.reload();
});

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

let isVideoPlaying = false;
let videoAnimationFrame = null;

// Add state management at the top
const AppState = {
    INITIAL: 'initial',
    IMAGE: 'image',
    VIDEO: 'video',
    WEBCAM: 'webcam'
};

let currentState = AppState.INITIAL;

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
    if (!file) return;

    cleanup(); // Clean up any existing state first

    if (file.type.startsWith('image/')) {
        await processImage(file);
    } else if (file.type.startsWith('video/')) {
        await processVideo(file);
    }
});

function handleMediaSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    cleanup(); // Clean up any existing state

    if (file.type.startsWith('image/')) {
        processImage(file);
    } else if (file.type.startsWith('video/')) {
        processVideo(file);
    }
    
    // Reset file input to allow selecting the same file again
    event.target.value = '';
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
        const url = URL.createObjectURL(source);
        previewImg.src = url;
        previewImg.style.display = 'block';
        canvas.style.display = 'none';
        
        // Cleanup URL when image loads
        previewImg.onload = () => URL.revokeObjectURL(url);
        
    } else if (source instanceof HTMLVideoElement) {
        // For video preview, use canvas
        canvas.style.display = 'block';
        previewImg.style.display = 'none';
        
        // Set canvas size to match container size
        const containerWidth = previewContainer.clientWidth;
        const containerHeight = previewContainer.clientHeight;
        const videoRatio = source.videoWidth / source.videoHeight;
        
        // Calculate dimensions to fill container while maintaining aspect ratio
        let canvasWidth, canvasHeight;
        
        if (containerWidth / videoRatio <= containerHeight) {
            // Width is the limiting factor
            canvasWidth = containerWidth;
            canvasHeight = containerWidth / videoRatio;
        } else {
            // Height is the limiting factor
            canvasHeight = containerHeight;
            canvasWidth = containerHeight * videoRatio;
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Center the canvas in the container
        canvas.style.position = 'absolute';
        canvas.style.left = '50%';
        canvas.style.top = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        
        // Draw video frame to canvas
        ctx.drawImage(source, 0, 0, canvasWidth, canvasHeight);
    }
}

// Add video preview update function
function updateVideoPreview() {
    if (!isVideoPlaying && currentState !== AppState.VIDEO) return;
    
    const video = document.getElementById('videoPlayer');
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    
    // Update canvas with current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Request next frame
    requestAnimationFrame(updateVideoPreview);
}

async function processImage(file) {
    cleanup(); // Clean up any existing state before processing image
    
    currentImageFile = file;
    currentState = AppState.IMAGE;
    
    const initialMessage = document.getElementById('initialMessage');
    const asciiControls = document.getElementById('asciiControls');
    const videoControls = document.getElementById('videoControls');
    
    initialMessage.classList.add('bottom');
    asciiControls.style.display = 'flex';
    videoControls.style.display = 'none';
    
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
    cleanup(); // Clean up any existing state before starting webcam
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        // Update state
        currentState = AppState.WEBCAM;
        
        const video = document.getElementById('webcamVideo');
        const initialMessage = document.getElementById('initialMessage');
        const asciiControls = document.getElementById('asciiControls');
        const videoControls = document.getElementById('videoControls');
        
        video.srcObject = stream;
        await video.play();
        
        // Show/hide appropriate controls
        initialMessage.classList.add('bottom');
        asciiControls.style.display = 'flex';
        videoControls.style.display = 'none';
        
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
        cleanup();
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
        currentState = AppState.INITIAL;
        document.getElementById('asciiOutput').textContent = '';
        document.getElementById('imagePreviewContainer').style.display = 'none';
        document.getElementById('asciiControls').style.display = 'none';
        document.getElementById('initialMessage').classList.remove('bottom');
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

async function processVideo(file) {
    if (!file || !file.type.startsWith('video/')) {
        console.error('Invalid video file');
        return;
    }

    cleanup(); // Clean up any existing state before processing video
    
    const video = document.getElementById('videoPlayer');
    const videoControls = document.getElementById('videoControls');
    const initialMessage = document.getElementById('initialMessage');
    const asciiControls = document.getElementById('asciiControls');
    const asciiOutput = document.getElementById('asciiOutput');
    
    // Update state
    currentState = AppState.VIDEO;
    
    try {
        // Create video URL and set up video element
        const videoUrl = URL.createObjectURL(file);
        video.src = videoUrl;
        video.currentTime = 0;
        
        // Set initial volume
        video.volume = 1.0;
        video.muted = false;
        
        // Show necessary elements
        initialMessage.classList.add('bottom');
        asciiControls.style.display = 'flex';
        videoControls.style.display = 'flex';
        asciiOutput.style.display = 'block';
        
        // Wait for video metadata to load
        await new Promise((resolve, reject) => {
            video.onloadedmetadata = resolve;
            video.onerror = reject;
        });
        
        // Initialize preview
        updateImagePreview(video);
        
        // Start playing automatically
        try {
            await video.play();
            isVideoPlaying = true;
            const playPauseIcon = document.getElementById('playPauseIcon');
            playPauseIcon.className = 'fas fa-pause';
            processVideoFrame();
            updateVideoPreview();
        } catch (error) {
            console.error('Autoplay failed:', error);
            // If autoplay fails (e.g., browser policy), fall back to paused state
            video.pause();
            isVideoPlaying = false;
            const playPauseIcon = document.getElementById('playPauseIcon');
            playPauseIcon.className = 'fas fa-play';
        }
        
        updateVideoTime();
        
    } catch (error) {
        console.error('Error loading video:', error);
        alert('Error loading video. Please try another file.');
        cleanup();
    }
}

function processVideoFrame() {
    if (!isVideoPlaying) return;
    
    const video = document.getElementById('videoPlayer');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const asciiOutput = document.getElementById('asciiOutput');
    
    // Set dimensions
    const width = parseInt(document.getElementById('widthInput').value);
    const height = Math.floor(width * (video.videoHeight / video.videoWidth) * 0.5);
    
    canvas.width = width;
    canvas.height = height;
    
    try {
        // Draw and process frame
        ctx.drawImage(video, 0, 0, width, height);
        
        // Apply filters
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.filter = `brightness(${imageProcessingOptions.brightness}%) contrast(${imageProcessingOptions.contrast}%)`;
        tempCtx.drawImage(canvas, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        
        applyImageProcessing(pixels, width, height);
        
        // Convert to ASCII
        let ascii = '';
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 765;
                ascii += getAsciiChar(1 - brightness); // Invert brightness for better contrast
            }
            ascii += '\n';
        }
        
        // Update display
        asciiOutput.textContent = ascii;
        updateVideoTime();
        
        // Continue animation if playing
        if (video.currentTime < video.duration) {
            videoAnimationFrame = requestAnimationFrame(processVideoFrame);
        } else {
            isVideoPlaying = false;
            document.getElementById('playPauseIcon').className = 'fas fa-play';
        }
    } catch (error) {
        console.error('Error processing video frame:', error);
        isVideoPlaying = false;
    }
}

function toggleVideoPlayback() {
    const video = document.getElementById('videoPlayer');
    const playPauseIcon = document.getElementById('playPauseIcon');
    
    if (isVideoPlaying) {
        video.pause();
        playPauseIcon.className = 'fas fa-play';
        if (videoAnimationFrame) {
            cancelAnimationFrame(videoAnimationFrame);
            videoAnimationFrame = null;
        }
        isVideoPlaying = false;
    } else {
        video.play().then(() => {
            playPauseIcon.className = 'fas fa-pause';
            isVideoPlaying = true;
            processVideoFrame();
            updateVideoPreview();
        }).catch(error => {
            console.error('Error playing video:', error);
            isVideoPlaying = false;
        });
    }
}

function seekVideo(value) {
    const video = document.getElementById('videoPlayer');
    const time = (value / 100) * video.duration;
    video.currentTime = time;
    updateVideoTime();
}

function updateVideoTime() {
    const video = document.getElementById('videoPlayer');
    const progress = document.getElementById('videoProgress');
    const timeDisplay = document.getElementById('videoTime');
    
    const currentMinutes = Math.floor(video.currentTime / 60);
    const currentSeconds = Math.floor(video.currentTime % 60);
    const totalMinutes = Math.floor(video.duration / 60);
    const totalSeconds = Math.floor(video.duration % 60);
    
    const currentTime = `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`;
    const totalTime = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
    
    timeDisplay.textContent = `${currentTime} / ${totalTime}`;
    progress.value = (video.currentTime / video.duration) * 100;
}

// Add new video control functions
function skipForward() {
    const video = document.getElementById('videoPlayer');
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
    updateVideoTime();
}

function skipBackward() {
    const video = document.getElementById('videoPlayer');
    video.currentTime = Math.max(video.currentTime - 10, 0);
    updateVideoTime();
}

function toggleMute() {
    const video = document.getElementById('videoPlayer');
    const muteIcon = document.getElementById('muteIcon');
    
    video.muted = !video.muted;
    
    if (video.muted) {
        muteIcon.className = 'fas fa-volume-mute';
    } else {
        muteIcon.className = 'fas fa-volume-up';
    }
}

// Update cleanup function
function cleanup() {
    // Stop webcam if active
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
    }
    
    // Stop video if playing
    if (isVideoPlaying || currentState === AppState.VIDEO) {
        const video = document.getElementById('videoPlayer');
        video.pause();
        if (videoAnimationFrame) {
            cancelAnimationFrame(videoAnimationFrame);
            videoAnimationFrame = null;
        }
        if (video.src) {
            URL.revokeObjectURL(video.src);
            video.src = '';
            video.load(); // Force cleanup of video resources
        }
        isVideoPlaying = false;
    }
    
    // Clean up image resources
    if (currentImageFile) {
        if (currentImageFile instanceof File) {
            URL.revokeObjectURL(currentImageFile);
        }
        currentImageFile = null;
    }
    
    // Clean up preview
    const previewImg = document.getElementById('imagePreview');
    if (previewImg.src) {
        URL.revokeObjectURL(previewImg.src);
        previewImg.src = '';
    }
    
    // Reset all controls and state
    document.getElementById('videoControls').style.display = 'none';
    document.getElementById('playPauseIcon').className = 'fas fa-play';
    document.getElementById('asciiControls').style.display = 'none';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('asciiOutput').textContent = '';
    document.getElementById('initialMessage').classList.remove('bottom');
    
    // Reset state
    currentState = AppState.INITIAL;
}

window.addEventListener('beforeunload', cleanup);

// Add a resize observer to handle preview container size changes
const previewContainer = document.getElementById('imagePreviewContainer');
const resizeObserver = new ResizeObserver(entries => {
    if (currentState === AppState.VIDEO && isVideoPlaying) {
        const video = document.getElementById('videoPlayer');
        updateImagePreview(video);
    }
});
resizeObserver.observe(previewContainer);