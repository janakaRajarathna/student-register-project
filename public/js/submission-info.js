// Function to show submission info
function showSubmissionInfo(submissionId) {
    if (!submissionId) {
        showToast('This assignment has not been submitted yet', 'error');
        return;
    }

    // Show loading state
    const modal = document.getElementById('submissionInfoModal');
    const previewContainer = document.getElementById('filePreview');
    previewContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    // Fetch submission details
    fetch(`/student/submission/${submissionId}/preview`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Display file preview based on type
                if (data.fileType === 'application/pdf') {
                    // For PDF files
                    const pdfUrl = `data:application/pdf;base64,${data.content}`;
                    previewContainer.innerHTML = `
                        <iframe src="${pdfUrl}" 
                                style="width: 100%; height: 500px; border: none;"
                                title="PDF Preview">
                        </iframe>`;
                } else if (data.fileType.includes('word')) {
                    // For Word documents
                    previewContainer.innerHTML = `
                        <div class="alert alert-info">
                            <i class="fas fa-file-word me-2"></i>
                            Word documents cannot be previewed directly.
                            <a href="data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${data.content}" 
                               download="${data.fileName}"
                               class="btn btn-primary btn-sm ms-2">
                                <i class="fas fa-download me-1"></i> Download
                            </a>
                        </div>`;
                } else {
                    // For text files
                    const textContent = atob(data.content);
                    previewContainer.innerHTML = `
                        <pre class="bg-light p-3 rounded" style="max-height: 500px; overflow-y: auto;">
                            ${textContent}
                        </pre>`;
                }
            } else {
                previewContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        ${data.message}
                    </div>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            previewContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Error loading file preview
                </div>`;
        });

    // Show the modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Function to show submit assignment page
function showSubmitAssignment() {
    window.location.href = '/student/submit-assignment';
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