// Function to show submission info
function showSubmissionInfo(submissionId) {
    if (!submissionId) {
        showToast('This assignment has not been submitted yet', 'error');
        return;
    }

    // Show loading state
    const filePreview = document.getElementById('filePreview');
    filePreview.innerHTML = '<div class="text-center p-4"><div class="spinner-border" role="status"></div></div>';

    // Fetch submission details
    fetch(`/student/submission/${submissionId}/preview`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update modal fields
                document.getElementById('assignmentTitle').value = data.assignment_title;
                document.getElementById('submissionDate').value = new Date(data.submission_date).toLocaleString();
                document.getElementById('status').value = data.status;
                // Set status badge
                const statusBadge = document.getElementById('statusBadge');
                let statusClass = '';
                let statusText = (data.status || '').toUpperCase();
                if (statusText === 'MARKED') {
                    statusClass = 'status-badge-marked';
                } else if (statusText === 'PENDING') {
                    statusClass = 'status-badge-pending';
                } else {
                    statusClass = 'status-badge-not-submitted';
                    statusText = statusText || 'NOT SUBMITTED';
                }
                statusBadge.className = `status-badge ${statusClass}`;
                statusBadge.textContent = statusText;
                document.getElementById('studentComment').value = data.student_comment || 'No comments provided';

                // Show/hide grade and feedback sections
                const gradeSection = document.getElementById('gradeSection');
                const feedbackSection = document.getElementById('feedbackSection');

                if (data.grade) {
                    gradeSection.style.display = 'block';
                    document.getElementById('grade').value = data.grade;
                } else {
                    gradeSection.style.display = 'none';
                }

                if (data.feedback) {
                    feedbackSection.style.display = 'block';
                    document.getElementById('feedback').value = data.feedback;
                } else {
                    feedbackSection.style.display = 'none';
                }

                // Handle file preview based on file type
                if (data.file_content) {
                    const base64Content = data.file_content;
                    const fileType = data.file_type.toLowerCase();

                    if (fileType === 'application/pdf') {
                        // For PDF files
                        filePreview.innerHTML = `<iframe src="data:application/pdf;base64,${base64Content}" type="application/pdf"></iframe>`;
                    } else if (fileType.includes('word') || fileType.includes('docx')) {
                        // For Word documents
                        filePreview.innerHTML = `
                            <div class="text-center p-4">
                                <p>Word documents cannot be previewed directly.</p>
                                <a href="data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64Content}" 
                                   download="${data.file_name}"
                                   class="btn btn-primary">
                                    Download Document
                                </a>
                            </div>`;
                    } else if (fileType === 'text/plain') {
                        // For text files
                        const textContent = atob(base64Content);
                        filePreview.innerHTML = `<pre class="p-3">${textContent}</pre>`;
                    } else {
                        // For other file types
                        filePreview.innerHTML = `
                            <div class="text-center p-4">
                                <p>Preview not available for this file type.</p>
                                <a href="data:${fileType};base64,${base64Content}" 
                                   download="${data.file_name}"
                                   class="btn btn-primary">
                                    Download File
                                </a>
                            </div>`;
                    }
                } else {
                    filePreview.innerHTML = '<div class="text-center p-4">No file content available</div>';
                }

                // Show the modal
                const modal = new bootstrap.Modal(document.getElementById('submissionInfoModal'));
                modal.show();
            } else {
                showToast(data.message || 'Error loading submission details', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading submission details', 'error');
        });
}

// Function to show submit assignment page
function showSubmitAssignment() {
    window.location.href = '/student/submit-assignment';
}

// Function to show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function showAssignmentInfoModal(assignmentJson) {
    let assignment;
    try {
        assignment = typeof assignmentJson === 'string' ? JSON.parse(assignmentJson) : assignmentJson;
    } catch (e) {
        showToast('Error loading assignment info', 'error');
        return;
    }
    document.getElementById('infoAssignmentTitle').value = assignment.title || '';
    document.getElementById('infoAssignmentDescription').value = assignment.description || '';
    document.getElementById('infoAssignmentDeadline').value = assignment.deadline ? new Date(assignment.deadline).toLocaleString() : '';
    const modal = new bootstrap.Modal(document.getElementById('assignmentInfoModal'));
    modal.show();
}

function showAssignmentInfoModalFromCard(card) {
    const assignmentJson = card.getAttribute('data-assignment');
    showAssignmentInfoModal(assignmentJson);
} 