// Modal functionality
const modal = document.getElementById('gradingModal');
const closeBtn = document.querySelector('.close-modal');
let currentSubmissionId = null;

// Close modal when clicking the X
closeBtn.onclick = function () {
    closeModal();
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

// Function to close modal
function closeModal() {
    modal.style.display = "none";
    // Clear file preview
    document.getElementById('filePreview').innerHTML = '';
}

// Function to load file preview
async function loadFilePreview(submissionId) {
    const filePreview = document.getElementById('filePreview');
    try {
        const response = await fetch(`/lecturer/submission/${submissionId}/preview`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const fileContent = data.fileContent;
                const fileType = data.fileType;
                const fileName = data.fileName;

                if (fileType === 'pdf') {
                    // For PDF files, create a blob URL
                    const blob = base64ToBlob(fileContent, 'application/pdf');
                    const url = URL.createObjectURL(blob);
                    filePreview.innerHTML = `<iframe src="${url}" type="application/pdf"></iframe>`;
                } else if (fileType === 'docx') {
                    // For DOCX files, create a download link
                    const blob = base64ToBlob(fileContent, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    const url = URL.createObjectURL(blob);
                    filePreview.innerHTML = `
                        <div class="text-preview">
                            <p>This is a DOCX file. Please download to view:</p>
                            <a href="${url}" class="btn btn-primary" download="${fileName}">Download File</a>
                        </div>`;
                } else if (fileType === 'txt') {
                    // For text files, decode and display content
                    const text = atob(fileContent);
                    filePreview.innerHTML = `<div class="text-preview">${text}</div>`;
                } else {
                    // For other file types, provide download link
                    const blob = base64ToBlob(fileContent, getMimeType(fileType));
                    const url = URL.createObjectURL(blob);
                    filePreview.innerHTML = `
                        <div class="text-preview">
                            <p>Preview not available for this file type. Please download to view:</p>
                            <a href="${url}" class="btn btn-primary" download="${fileName}">Download File</a>
                        </div>`;
                }
            } else {
                filePreview.innerHTML = '<div class="text-preview">Error loading file preview</div>';
            }
        } else {
            filePreview.innerHTML = '<div class="text-preview">Error loading file preview</div>';
        }
    } catch (error) {
        console.error('Error loading file preview:', error);
        filePreview.innerHTML = '<div class="text-preview">Error loading file preview</div>';
    }
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
}

// Helper function to get MIME type from file extension
function getMimeType(fileType) {
    const mimeTypes = {
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'txt': 'text/plain',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png'
    };
    return mimeTypes[fileType.toLowerCase()] || 'application/octet-stream';
}

// Function to open modal with submission data
async function openGradingModal(submissionId, studentName, assignmentTitle, submissionDate) {
    currentSubmissionId = submissionId;
    document.getElementById('studentName').value = studentName;
    document.getElementById('assignmentTitle').value = assignmentTitle;
    document.getElementById('submissionDate').value = new Date(submissionDate).toLocaleDateString();
    document.getElementById('grade').value = '';
    document.getElementById('feedback').value = '';

    // Load file preview
    await loadFilePreview(submissionId);

    modal.style.display = "block";
}

// Function to submit grade
async function submitGrade() {
    const grade = document.getElementById('grade').value;
    const feedback = document.getElementById('feedback').value;

    if (!grade || !feedback) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch('/lecturer/submission/grade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                submissionId: currentSubmissionId,
                grade: grade,
                feedback: feedback
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showToast('Grade submitted successfully!', 'success');
            closeModal();
            // Reload the submissions section
            location.reload();
        } else {
            showToast(data.message || 'Error submitting grade', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error submitting grade', 'error');
    }
}

// Function to show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
} 