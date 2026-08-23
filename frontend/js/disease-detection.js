/**
 * Smart Agriculture Assistant
 * Disease Detection - Image Upload & Processing
 */

// ============================================
// State
// ============================================

let uploadedImage = null;
let isProcessing = false;

// ============================================
// Initialize
// ============================================

function initDiseaseDetection() {
    setupFileUpload();
    setupDragDrop();
    setupCameraCapture();
}

// ============================================
// File Upload Setup
// ============================================

function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    const removeBtn = document.getElementById('removeImage');
    if (removeBtn) {
        removeBtn.addEventListener('click', removeImage);
    }

    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeImage);
    }

    const newScanBtn = document.getElementById('newScanBtn');
    if (newScanBtn) {
        newScanBtn.addEventListener('click', resetScan);
    }
}

// ============================================
// Drag and Drop
// ============================================

function setupDragDrop() {
    const uploadZone = document.getElementById('uploadZone');
    if (!uploadZone) return;

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    uploadZone.addEventListener('click', () => {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.click();
    });
}

// ============================================
// Camera Capture
// ============================================

function setupCameraCapture() {
    const cameraBtn = document.getElementById('cameraBtn');
    if (cameraBtn) {
        cameraBtn.addEventListener('click', () => {
            // Create a file input that opens camera on mobile
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                }
            });
            input.click();
        });
    }
}

// ============================================
// Handle File Selection
// ============================================

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// ============================================
// Handle File
// ============================================

function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        window.showToast('Please select an image file', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        window.showToast('Image size should be less than 5MB', 'error');
        return;
    }

    uploadedImage = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImage = document.getElementById('previewImage');
        if (previewImage) {
            previewImage.src = e.target.result;
        }

        document.getElementById('uploadZone').classList.add('hidden');
        document.getElementById('imagePreview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// ============================================
// Remove Image
// ============================================

function removeImage() {
    uploadedImage = null;
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

    document.getElementById('uploadZone').classList.remove('hidden');
    document.getElementById('imagePreview').classList.add('hidden');
}

// ============================================
// Analyze Image
// ============================================

async function analyzeImage() {
    if (!uploadedImage || isProcessing) return;

    isProcessing = true;

    // Show processing section
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('processingSection').classList.remove('hidden');

    // Animate progress bar
    const progressBar = document.getElementById('progressBar');
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        if (progressBar) progressBar.style.width = `${progress}%`;
    }, 200);

    try {
        // In production: send to backend API for ML processing
        // const formData = new FormData();
        // formData.append('image', uploadedImage);
        // const response = await fetch('/api/disease-detect', { method: 'POST', body: formData });
        // const result = await response.json();

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        clearInterval(progressInterval);
        if (progressBar) progressBar.style.width = '100%';

        // Show results
        setTimeout(() => {
            showResults();
        }, 500);

    } catch (error) {
        console.error('Analysis error:', error);
        window.showToast('Error analyzing image. Please try again.', 'error');
        resetScan();
    } finally {
        isProcessing = false;
    }
}

// ============================================
// Show Results
// ============================================

function showResults() {
    // Set result image
    const resultImage = document.getElementById('resultImage');
    if (resultImage && uploadedImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
            resultImage.src = e.target.result;
        };
        reader.readAsDataURL(uploadedImage);
    }

    // Hide processing, show results
    document.getElementById('processingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');
}

// ============================================
// Reset Scan
// ============================================

function resetScan() {
    uploadedImage = null;
    isProcessing = false;

    // Reset progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) progressBar.style.width = '0%';

    // Show upload section
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('processingSection').classList.add('hidden');
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('uploadZone').classList.remove('hidden');
}

// ============================================
// Download Report
// ============================================

function downloadDiseaseReport() {
    window.showToast('Report downloaded successfully!', 'success');
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('uploadZone')) {
        initDiseaseDetection();
    }

    const downloadBtn = document.getElementById('downloadReport');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadDiseaseReport);
    }
});
