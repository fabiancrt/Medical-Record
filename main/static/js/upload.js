(function() {
    const originalWarn = console.warn;
    console.warn = function(message, ...optionalParams) {
        if (typeof message === 'string' && message.includes("D: No MultiFormat Readers were able to detect the code.")) {
            return;
        }
        originalWarn.apply(console, [message, ...optionalParams]);
    };
})();

let currentCameraId = null; 

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");

    const scannerContainer = document.getElementById('scanner-container');
    const captureButton = document.getElementById('captureButton');
    const cancelButton = document.getElementById('cancelButton');
    const fileInputDiv = document.getElementById('fileInputDiv');
    const scanButton = document.getElementById('scanButton');
    const darkModeButton = document.getElementById('darkModeButton');
    const retakeButton = document.getElementById('retakeButton');
    const qrOutput = document.getElementById('qr-output');
    const cameraSelect = document.getElementById('cameraSelect'); 

    
    console.log('scannerContainer:', scannerContainer);
    console.log('captureButton:', captureButton);
    console.log('cancelButton:', cancelButton);
    console.log('fileInputDiv:', fileInputDiv);
    console.log('scanButton:', scanButton);
    console.log('darkModeButton:', darkModeButton);
    console.log('retakeButton:', retakeButton);
    console.log('qrOutput:', qrOutput);
    console.log('cameraSelect:', cameraSelect); 

    if (!scannerContainer) console.error('scannerContainer not found');
    if (!captureButton) console.error('captureButton not found');
    if (!cancelButton) console.error('cancelButton not found');
    if (!fileInputDiv) console.error('fileInputDiv not found');
    if (!scanButton) console.error('scanButton not found');
    if (!retakeButton) console.error('retakeButton not found');
    if (!qrOutput) console.error('qrOutput not found');
    if (!cameraSelect) console.error('cameraSelect not found'); 

    if (!scannerContainer || !captureButton || !cancelButton || !fileInputDiv || !scanButton || !retakeButton || !qrOutput || !cameraSelect) {
        console.error('One or more required elements not found');
        return;
    }

    scanButton.addEventListener('click', function() {
        console.log("Scan button clicked");
        startScanner();
    });

    cancelButton.addEventListener('click', function() {
        console.log("Cancel button clicked");
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(ignore => {
                console.log("Scanner stopped successfully");
                scannerContainer.style.display = 'none';
                captureButton.style.display = 'none';
                cancelButton.style.display = 'none';
                fileInputDiv.style.display = 'block';
                cameraSelect.style.display = 'none'; 
            }).catch(err => {
                console.error('Failed to stop scanning.', err);
            });
        } else {
            console.log("Scanner is not running");
        }
    });

    captureButton.addEventListener('click', function() {
        console.log("Capture button clicked");
        capturePhoto();
    });

    if (darkModeButton) {
        darkModeButton.addEventListener('click', function() {
            console.log("Dark mode button clicked");
            document.body.classList.toggle('dark-mode');
        });
    }

    retakeButton.addEventListener('click', function() {
        console.log("Retake button clicked");
        retakePhoto();
    });

    
    cameraSelect.addEventListener('change', function(event) {
        const selectedCameraId = event.target.value;
        if (selectedCameraId) {
            currentCameraId = selectedCameraId;
            console.log(`Camera switched to: ${currentCameraId}`);
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(ignore => {
                    startScanner(); 
                }).catch(err => {
                    console.error('Failed to stop scanning.', err);
                });
            }
        }
    });

    
    populateCameraSelect();
});

function populateCameraSelect() {
    const cameraSelect = document.getElementById('cameraSelect');
    if (!cameraSelect) {
        console.error('cameraSelect element not found');
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.error('MediaDevices API not supported.');
        alert('MediaDevices API not supported. Please use a modern browser and ensure the page is served over HTTPS.');
        return;
    }

    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            if (videoDevices.length === 0) {
                console.warn('No video input devices found');
                return;
            }
            cameraSelect.innerHTML = ''; 
            videoDevices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${cameraSelect.length + 1}`;
                cameraSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Error enumerating devices:', err);
        });
}
    let html5QrCode;
    let errorLogged = false;

    document.getElementById('capturedImage').addEventListener('load', function() {
        const container = document.getElementById('capturedImageContainer');
        container.style.width = this.width + 'px';
        container.style.height = this.height + 'px';
    });

    document.getElementById('capturePhotoButton').addEventListener('click', capturePhotoOnly);

    function capturePhotoOnly() {
        console.log("capturePhotoOnly function called");
    
        const videoElement = document.querySelector("#scanner-container video");
        const captureCanvas = document.getElementById('captureCanvas');
        const capturedImage = document.getElementById('capturedImage');
        const capturedImageContainer = document.getElementById('capturedImageContainer');
        const retakeButton = document.getElementById('retakeButton');
        const scannerContainer = document.getElementById('scanner-container');
        const captureButton = document.getElementById('captureButton');
        const fileInputDiv = document.getElementById('fileInputDiv');
        const cameraSelect = document.getElementById('cameraSelect');
        const capturePhotoButton = document.getElementById('capturePhotoButton');
    
        if (!videoElement || !captureCanvas || !capturedImage || !capturedImageContainer || !retakeButton || !scannerContainer || !captureButton || !fileInputDiv || !cameraSelect || !capturePhotoButton) {
            console.error('One or more required elements not found');
            return;
        }
    
        const context = captureCanvas.getContext('2d');
        captureCanvas.width = videoElement.videoWidth;
        captureCanvas.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, captureCanvas.width, captureCanvas.height);
        const imageDataUrl = captureCanvas.toDataURL('image/png');
        console.log(`Captured photo: ${imageDataUrl}`);
        capturedImage.src = imageDataUrl;
        capturedImage.style.display = 'block';
        capturedImageContainer.style.display = 'flex';
        capturedImageContainer.style.justifyContent = 'center';
        capturedImageContainer.style.alignItems = 'center';
    
        
        capturedImage.onload = function() {
            capturedImageContainer.style.width = capturedImage.naturalWidth + 'px';
            capturedImageContainer.style.height = capturedImage.naturalHeight + 'px';
            capturedImageContainer.style.margin = 'auto'; 
        };
    
        retakeButton.style.display = 'inline-block';
    
        scannerContainer.style.display = 'none';
        captureButton.style.display = 'none';
        fileInputDiv.style.display = 'none';
        cameraSelect.style.display = 'none';
        capturePhotoButton.style.visibility = 'hidden';
    }
    
    document.getElementById('retakeButton').addEventListener('click', function() {
        const capturedImage = document.getElementById('capturedImage');
        const capturedImageContainer = document.getElementById('capturedImageContainer');
        const retakeButton = document.getElementById('retakeButton');
        const scannerContainer = document.getElementById('scanner-container');
        const captureButton = document.getElementById('captureButton');
        const fileInputDiv = document.getElementById('fileInputDiv');
        const cameraSelect = document.getElementById('cameraSelect');
        const capturePhotoButton = document.getElementById('capturePhotoButton');
    
        capturedImage.style.display = 'none';
        capturedImageContainer.style.display = 'none';
        retakeButton.style.display = 'none';
    
        scannerContainer.style.display = 'block';
        captureButton.style.display = 'block';
        fileInputDiv.style.display = 'block';
        cameraSelect.style.display = 'block';
        capturePhotoButton.style.visibility = 'visible';
    });
    
    document.getElementById('capturePhotoButton').addEventListener('click', function() {
        const scannerContainer = document.getElementById('scanner-container');
        const captureButton = document.getElementById('captureButton');
        const fileInputDiv = document.getElementById('fileInputDiv');
        const cameraSelect = document.getElementById('cameraSelect');
        const capturePhotoButton = document.getElementById('capturePhotoButton');
    
        scannerContainer.style.display = 'block';
        captureButton.style.display = 'none';
        fileInputDiv.style.display = 'none';
        cameraSelect.style.display = 'block';
        capturePhotoButton.style.visibility = 'hidden';
    
        capturePhotoOnly();
    });
    
    document.getElementById('captureButton').addEventListener('click', function() {
        const scannerContainer = document.getElementById('scanner-container');
        const captureButton = document.getElementById('captureButton');
        const fileInputDiv = document.getElementById('fileInputDiv');
        const cameraSelect = document.getElementById('cameraSelect');
        const capturePhotoButton = document.getElementById('capturePhotoButton');
    
        scannerContainer.style.display = 'block';
        captureButton.style.display = 'none';
        fileInputDiv.style.display = 'none';
        cameraSelect.style.display = 'block';
        capturePhotoButton.style.visibility = 'hidden';
    
        capturePhotoOnly();
    });
    
    document.getElementById('cancelButton').addEventListener('click', function() {
        const scannerContainer = document.getElementById('scanner-container');
        const captureButton = document.getElementById('captureButton');
        const fileInputDiv = document.getElementById('fileInputDiv');
        const cameraSelect = document.getElementById('cameraSelect');
        const capturePhotoButton = document.getElementById('capturePhotoButton');
    
        scannerContainer.style.display = 'none';
        captureButton.style.display = 'none';
        fileInputDiv.style.display = 'none';
        cameraSelect.style.display = 'none';
        capturePhotoButton.style.visibility = 'visible';
    });

    function startScanner() {
        console.log("startScanner function called");
        const scannerContainer = document.getElementById('scanner-container');
        const captureButton = document.getElementById('captureButton');
        const cancelButton = document.getElementById('cancelButton');
        const fileInputDiv = document.getElementById('fileInputDiv');
        const cameraSelect = document.getElementById('cameraSelect');
        const cameraSelectLabel = document.querySelector('label[for="cameraSelect"]');
        const errorMessage = document.getElementById('errorMessage');
        const scanButton = document.getElementById('scanButton'); 
        const capturePhotoButton = document.getElementById('capturePhotoButton'); 
    
        if (!scannerContainer || !captureButton || !cancelButton || !fileInputDiv || !cameraSelect || !cameraSelectLabel || !errorMessage || !scanButton || !capturePhotoButton) {
            console.error('One or more required elements not found');
            return;
        }
    
        scannerContainer.style.display = 'block';
        captureButton.style.display = 'inline-block';
        cancelButton.style.display = 'inline-block';
        fileInputDiv.style.display = 'none';
        cameraSelect.style.display = 'block';
        cameraSelectLabel.style.display = 'block';
        scanButton.style.display = 'none'; 
        capturePhotoButton.style.display = 'inline-block'; 
    
        const qrOutput = document.getElementById('qr-output');
        qrOutput.innerHTML = '';
        qrOutput.style.display = 'none';
        errorMessage.style.display = 'none'; 
    
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.error('MediaDevices API not supported.');
            alert('MediaDevices API not supported. Please use a modern browser and ensure the page is served over HTTPS.');
            return;
        }
    
        html5QrCode = new Html5Qrcode("scanner-container");
        window.errorLogged = false;
    
        const constraints = currentCameraId ? { deviceId: { exact: currentCameraId } } : { facingMode: "environment" };
    
        html5QrCode.start(
            constraints,
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            qrCodeMessage => {
                console.log(`QR Code detected: ${qrCodeMessage}`);
                qrOutput.innerHTML = `QR code detected: <a href="${qrCodeMessage}" target="_blank" style="color: black;">${qrCodeMessage}</a>`;
                qrOutput.style.display = 'block';
    
                if (html5QrCode.isScanning) {
                    html5QrCode.stop().then(ignore => {
                        scannerContainer.style.display = 'none';
                        captureButton.style.display = 'none';
                        cancelButton.style.display = 'none';
                        fileInputDiv.style.display = 'block';
                        cameraSelect.style.display = 'none';
                        cameraSelectLabel.style.display = 'none';
                        capturePhotoButton.style.display = 'inline-block'; 
                    }).catch(err => {
                        console.error('Failed to stop scanning.', err);
                    });
                }
            },
            error => {
                const specificErrorMessage = "D: No MultiFormat Readers were able to detect the code.";
                if (error !== specificErrorMessage && !window.errorLogged) {
                    console.warn(`Code scan error = ${error}`);
                    window.errorLogged = true;
                    setTimeout(() => { window.errorLogged = false; }, 5000);
                }
            }
        ).catch(err => {
            if (!window.errorLogged) {
                console.error('Failed to start scanning.', err);
                window.errorLogged = true;
                setTimeout(() => { window.errorLogged = false; }, 5000);
                switchToNextCamera(); 
            }
        });
    }

    
    function capturePhoto() {
        console.log("capturePhoto function called");
        const videoElement = document.querySelector("#scanner-container video");
        const captureCanvas = document.getElementById('captureCanvas');
        const capturedImage = document.getElementById('capturedImage');
        const capturedImageContainer = document.getElementById('capturedImageContainer');
        const retakeButton = document.getElementById('retakeButton');
        const scannerContainer = document.getElementById('scanner-container');
        const captureButton = document.getElementById('captureButton');
        const fileInputDiv = document.getElementById('fileInputDiv');
        const cameraSelect = document.getElementById('cameraSelect'); 
    
        if (!videoElement) {
            console.error('Video element not found');
            return;
        }
        if (!captureCanvas) {
            console.error('Capture canvas not found');
            return;
        }
        if (!capturedImage) {
            console.error('Captured image element not found');
            return;
        }
        if (!capturedImageContainer) {
            console.error('Captured image container not found');
            return;
        }
        if (!retakeButton) {
            console.error('Retake button not found');
            return;
        }
        if (!scannerContainer) {
            console.error('Scanner container not found');
            return;
        }
        if (!captureButton) {
            console.error('Capture button not found');
            return;
        }
        if (!fileInputDiv) {
            console.error('File input div not found');
            return;
        }
        if (!cameraSelect) {
            console.error('Camera select element not found');
            return;
        }
    
        const context = captureCanvas.getContext('2d');
        captureCanvas.width = videoElement.videoWidth;
        captureCanvas.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, captureCanvas.width, captureCanvas.height);
        const imageDataUrl = captureCanvas.toDataURL('image/png');
        console.log(`Captured photo: ${imageDataUrl}`);
        capturedImage.src = imageDataUrl;
        capturedImage.style.display = 'block';
        capturedImageContainer.style.display = 'block';
        retakeButton.style.display = 'inline-block';
    
        scannerContainer.style.display = 'none';
        captureButton.style.display = 'none';
        fileInputDiv.style.display = 'none';
        cameraSelect.style.display = 'none'; 
    
        
        processDocumentImage(captureCanvas, capturedImage, capturedImageContainer);
    }
    
    
    function switchToNextCamera() {
        const cameraSelect = document.getElementById('cameraSelect');
        const currentIndex = cameraSelect.selectedIndex;
        const nextIndex = (currentIndex + 1) % cameraSelect.options.length;
        cameraSelect.selectedIndex = nextIndex;
        currentCameraId = cameraSelect.options[nextIndex].value;
        console.log(`Switching to next camera: ${currentCameraId}`);
    
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
                startScanner(); 
            }).catch(err => {
                console.error('Failed to stop scanning.', err);
            });
        } else {
            startScanner(); 
        }
    }
    
    
    document.getElementById('cameraSelect').addEventListener('change', function(event) {
        const selectedCameraId = event.target.value;
        if (selectedCameraId) {
            currentCameraId = selectedCameraId;
            console.log(`Camera switched to: ${currentCameraId}`);
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(ignore => {
                    startScanner(); 
                }).catch(err => {
                    console.error('Failed to stop scanning.', err);
                });
            }
        }
    });
    
    function processDocumentImage(captureCanvas, capturedImage, capturedImageContainer) {
        console.log("Processing document image");
    
        
        const src = cv.imread(captureCanvas);
        const dst = new cv.Mat();
    
        
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    
        
        cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    
        
        cv.Canny(gray, dst, 50, 100, 3, false);
    
        
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    
        
        let maxArea = 0;
        let maxContour = null;
        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
            if (area > maxArea) {
                maxArea = area;
                maxContour = contour;
            }
        }
    
        
        if (maxContour && maxArea > 1000) { 
            const rect = cv.boundingRect(maxContour);
            console.log("Bounding Rect:", rect); 
            const aspectRatio = rect.width / rect.height;
            if (aspectRatio > 0.5 && aspectRatio < 2.0) { 
                console.log("Found valid contour");
                const cropped = src.roi(rect);
                console.log("Cropped Image Dimensions:", cropped.size()); 
    
                
                const croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = cropped.cols;
                croppedCanvas.height = cropped.rows;
                cv.imshow(croppedCanvas, cropped);
                const croppedImageDataUrl = croppedCanvas.toDataURL('image/png');
    
                
                capturedImage.src = croppedImageDataUrl;
                capturedImage.style.display = 'block';
                capturedImageContainer.style.display = 'flex';
                capturedImageContainer.style.justifyContent = 'center';
                capturedImageContainer.style.alignItems = 'center';
    
                
                capturedImage.onload = function() {
                    capturedImageContainer.style.width = capturedImage.naturalWidth + 'px';
                    capturedImageContainer.style.height = capturedImage.naturalHeight + 'px';
                    capturedImageContainer.style.margin = 'auto'; 
                };
    
                cropped.delete();
            } else {
                console.log("Invalid contour aspect ratio");
                displayOriginalImage(capturedImage, capturedImageContainer, captureCanvas);
            }
        } else {
            console.log("No valid contour found");
            displayOriginalImage(capturedImage, capturedImageContainer, captureCanvas);
        }
    
        
        src.delete();
        dst.delete();
        gray.delete();
        contours.delete();
        hierarchy.delete();
    }
    
    function displayOriginalImage(capturedImage, capturedImageContainer, captureCanvas) {
        
        const originalImageDataUrl = captureCanvas.toDataURL('image/png');
    
        
        capturedImage.src = originalImageDataUrl;
        capturedImage.style.display = 'block';
    
        
        capturedImageContainer.style.display = 'flex';
        capturedImageContainer.style.justifyContent = 'center';
        capturedImageContainer.style.alignItems = 'center';
    
        
        capturedImage.onload = function() {
            capturedImageContainer.style.width = capturedImage.naturalWidth + 'px';
            capturedImageContainer.style.height = capturedImage.naturalHeight + 'px';
            capturedImageContainer.style.margin = 'auto'; 
        };
    }
    
    
    document.getElementById('cameraSelect').addEventListener('change', function(event) {
        const selectedCameraId = event.target.value;
        if (selectedCameraId) {
            currentCameraId = selectedCameraId;
            console.log(`Camera switched to: ${currentCameraId}`);
        }
    });
    
    function retakePhoto() {
        console.log("retakePhoto function called");
        const scannerContainer = document.getElementById('scanner-container');
        const captureButton = document.getElementById('captureButton');
        const capturedImage = document.getElementById('capturedImage');
        const retakeButton = document.getElementById('retakeButton');
        const fileInputDiv = document.getElementById('fileInputDiv');
        const capturedImageContainer = document.getElementById('capturedImageContainer');
        const cameraSelect = document.getElementById('cameraSelect'); 
    
        if (!scannerContainer || !captureButton || !capturedImage || !retakeButton || !fileInputDiv || !capturedImageContainer || !cameraSelect) {
            console.error('One or more required elements not found');
            return;
        }
    
        
        capturedImage.src = '';
        capturedImage.style.display = 'none';
        capturedImageContainer.style.display = 'none';
        capturedImageContainer.style.width = 'auto';
        capturedImageContainer.style.height = 'auto';
    
        
        scannerContainer.style.display = 'block';
        captureButton.style.display = 'inline-block';
        retakeButton.style.display = 'none';
        fileInputDiv.style.display = 'block';
        cameraSelect.style.display = 'block'; 
    
        errorLogged = false;
    
        const constraints = currentCameraId ? { deviceId: { exact: currentCameraId } } : { facingMode: "environment" };
    
        html5QrCode.start(
            constraints,
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            qrCodeMessage => {
                console.log(`QR Code detected: ${qrCodeMessage}`);
                if (html5QrCode.isScanning) {
                    html5QrCode.stop().then(ignore => {
                        scannerContainer.style.display = 'none';
                        captureButton.style.display = 'none';
                    }).catch(err => {
                        console.error('Failed to stop scanning.', err);
                    });
                } else {
                    console.log("QR Code scanner is not running.");
                }
            }
        ).catch(err => {
            if (!errorLogged) {
                console.error('Failed to start scanning.', err);
                errorLogged = true;
            }
        });
    }

    function cancelScan() {
        console.log("Scan cancelled");
    
        const videoElement = document.querySelector('video');
        if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoElement.srcObject = null;
        }
    
        const capturedImage = document.getElementById('capturedImage');
        if (capturedImage) {
            capturedImage.src = '';
        }
    
        const scannerContainer = document.getElementById('scanner-container');
        const cancelButton = document.getElementById('cancelButton');
        const captureButton = document.getElementById('captureButton');
        const retakeButton = document.getElementById('retakeButton');
        const scanButton = document.getElementById('scanButton');
        const fileInputDiv = document.getElementById('fileInputDiv');
        const capturedImageContainer = document.getElementById('capturedImageContainer');
        const qrOutput = document.getElementById('qr-output');
        const cameraSelect = document.getElementById('cameraSelect');
        const cameraSelectLabel = document.querySelector('label[for="cameraSelect"]');
        const capturePhotoButton = document.getElementById('capturePhotoButton'); 
    
        if (scannerContainer) scannerContainer.style.display = 'none';
        if (cancelButton) cancelButton.style.display = 'none';
        if (captureButton) captureButton.style.display = 'none';
        if (retakeButton) retakeButton.style.display = 'none';
        if (scanButton) scanButton.style.display = 'inline-block'; 
        if (fileInputDiv) fileInputDiv.style.display = 'block';
        if (capturedImageContainer) capturedImageContainer.style.display = 'none';
        if (qrOutput) {
            qrOutput.innerHTML = '';
            qrOutput.style.display = 'none';
        }
        if (cameraSelect) cameraSelect.style.display = 'none'; 
        if (cameraSelectLabel) cameraSelectLabel.style.display = 'none'; 
        if (capturePhotoButton) capturePhotoButton.style.display = 'none'; 
    
        if (typeof html5QrCode !== 'undefined' && html5QrCode.isScanning) {
            html5QrCode.stop().then(ignore => {
                console.log("QR Code scanning stopped.");
            }).catch(err => {
                console.error('Failed to stop QR Code scanning.', err);
            });
        } else {
            console.log("QR Code scanner is not running.");
        }
    }
    
    document.getElementById('cancelButton').addEventListener('click', cancelScan);

    function validateAndUpload() {
        console.log("validateAndUpload function called");
        const capturedImage = document.getElementById('capturedImage');
        const errorMessage = document.getElementById('errorMessage');
        const yearInput = document.getElementById('id_year');
        const monthInput = document.getElementById('id_month');
        const dayInput = document.getElementById('id_day');
        const fileInput = document.querySelector('input[type="file"]'); 
    
        if (!capturedImage) {
            console.error('Captured image element not found');
        }
        if (!errorMessage) {
            console.error('Error message element not found');
        }
        if (!yearInput) {
            console.error('Year input element not found');
        }
        if (!monthInput) {
            console.error('Month input element not found');
        }
        if (!dayInput) {
            console.error('Day input element not found');
        }
        if (!fileInput) {
            console.error('File input element not found');
        }
    
        if (!capturedImage || !errorMessage || !yearInput || !monthInput || !dayInput || !fileInput) {
            console.error('One or more required elements not found');
            return;
        }
    
        const imageSrc = capturedImage.src;
        const year = yearInput.value;
        const month = monthInput.value;
        const day = dayInput.value;
        const file = fileInput.files[0];
    
        console.log('Image source:', imageSrc);
        console.log('Year:', year);
        console.log('Month:', month);
        console.log('Day:', day);
        console.log('File:', file);
    
        if (!imageSrc && !file) {
            errorMessage.textContent = 'Image or file is required.';
            errorMessage.style.display = 'block';
            return;
        }
    
        if (!year || !month || !day) {
            errorMessage.textContent = 'Date is required.';
            errorMessage.style.display = 'block';
            return;
        }
    
        errorMessage.style.display = 'none';
    
        const formData = new FormData();
        if (imageSrc) {
            try {
                const blob = dataURLtoBlob(imageSrc);
                console.log('Blob created:', blob);
                const uniqueIdentifier = generateUniqueIdentifier();
                const fileName = `image_${uniqueIdentifier}.png`;
                formData.append('file', blob, fileName); 
            } catch (error) {
                console.error('Error converting dataURL to Blob:', error);
                errorMessage.textContent = 'Failed to process image. Please try again.';
                errorMessage.style.display = 'block';
                return;
            }
        } else if (file) {
            formData.append('file', file);
        }
    
        formData.append('year', year);
        formData.append('month', month);
        formData.append('day', day);
    
        console.log('FormData entries:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
    
        const csrftoken = getCookie('csrftoken');
        console.log('CSRF Token:', csrftoken);
    
        fetch('/upload/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrftoken
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json().catch(() => {
                throw new Error('Invalid JSON response');
            });
        })
        .then(data => {
            if (data.success) {
                console.log('Upload successful');
                errorMessage.style.display = 'none';
                window.location.href = '/'; 
            } else {
                console.error('Upload failed');
                errorMessage.textContent = data.message || 'Upload failed. Please try again.';
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
    }
    
    function dataURLtoBlob(dataURL) {
        try {
            const byteString = atob(dataURL.split(',')[1]);
            const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type: mimeString });
        } catch (error) {
            console.error('Error in dataURLtoBlob:', error);
            throw error;
        }
    }
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    function generateUniqueIdentifier() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    
    window.validateAndUpload = validateAndUpload;


function onScanSuccess(decodedText, decodedResult) {
    
    console.log(`QR Code detected: ${decodedText}`, decodedResult);
    
    const qrOutput = document.getElementById('qr-output');
    qrOutput.textContent = `QR Code detected: ${decodedText}`;
    qrOutput.style.display = 'block';
}

function onScanFailure(error) {
    
    console.warn(`Code scan error = ${error}`);
}

let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 });

document.addEventListener("DOMContentLoaded", function() {

});