document.addEventListener("DOMContentLoaded", () => {
  const activeTab = sessionStorage.getItem('activeTab') || 'send';
  const initialTab = document.getElementById(`tab-${activeTab}`);
  const initialSection = document.getElementById(`section-${activeTab}`);

  if (initialTab && initialSection) {
    initialTab.classList.add('active');
    initialSection.classList.add('visible');
  }

  sessionStorage.removeItem('activeTab');
  if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const tabs = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll(".view-section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.section;
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      sections.forEach((sec) => {
        sec.classList.toggle("visible", sec.dataset.section === target);
      });
    });
  });

  const fileInput = document.getElementById("file-input");
  const fileBtn = document.getElementById("file-btn");
  const fileText = document.getElementById("file-text");
  const uploadBtn = document.getElementById("upload-btn");
  const progressContainer = document.getElementById("progress-container");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");

  if (fileInput && fileBtn && fileText) {
    fileBtn.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files.length > 0) {
        fileText.textContent = fileInput.files[0].name;
      } else {
        fileText.textContent = "No file chosen";
      }
    });
  }

  const uploadForm = document.querySelector('.upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please choose a file first.");
        return;
      }

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);

      // Reset and show progress bar
      progressContainer.style.display = 'block';
      progressFill.style.width = '0%';
      progressText.innerText = '0%';
      uploadBtn.disabled = true;
      uploadBtn.innerText = 'Uploading...';

      // Generate unique ID for this transfer
      const transferId = Math.random().toString(36).substring(7);
      let lastReportTime = 0;

      const xhr = new XMLHttpRequest();

      // Progress listener
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          progressFill.style.width = percentComplete + '%';
          progressText.innerText = percentComplete + '%';

          // Report progress to server (throttled)
          const now = Date.now();
          if (now - lastReportTime > 1000 || percentComplete === 100) {
            fetch('/api/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transferId: transferId,
                filename: file.name,
                progress: percentComplete
              })
            }).catch(() => { }); // Ignore errors in reporting
            lastReportTime = now;
          }
        }
      });

      // Completion listener
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Success - wait a brief moment to show 100% then redirect
          setTimeout(() => {
            window.location.href = "/?tab=available";
          }, 500);
        } else {
          alert("Upload failed. Please try again.");
          resetUploadUI();
        }
      });

      // Error listener
      xhr.addEventListener('error', () => {
        alert("An error occurred during payment.");
        resetUploadUI();
      });

      xhr.open('POST', '/upload');
      xhr.send(formData);
    });
  }

  function resetUploadUI() {
    progressContainer.style.display = 'none';
    progressFill.style.width = '0%';
    progressText.innerText = '0%';
    uploadBtn.disabled = false;
    uploadBtn.innerText = 'Upload';
  }

  // Poll for incoming transfers
  setInterval(async () => {
    try {
      const response = await fetch('/api/status');
      const transfers = await response.json();
      updateIncomingTransfersUI(transfers);
    } catch (e) {
      console.error("Error polling status:", e);
    }
  }, 2000);

  function updateIncomingTransfersUI(transfers) {
    let container = document.getElementById('incoming-transfers-container');

    // Create container if it doesn't exist (append to body or specific section)
    if (!container && transfers.length > 0) {
      const shell = document.querySelector('.app-shell .app-card');
      if (shell) {
        container = document.createElement('div');
        container.id = 'incoming-transfers-container';
        container.className = 'incoming-transfers-container';
        shell.insertBefore(container, shell.firstChild);
      }
    }

    if (!container) return;

    if (transfers.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';

    // Simple render: recreate list
    container.innerHTML = `
        <div class="incoming-title">⬇️ Receiving Files...</div>
        ${transfers.map(t => `
            <div class="incoming-item">
                <div class="incoming-info">
                    <span class="incoming-name">${t.filename}</span>
                    <span class="incoming-ip">from ${t.ip}</span>
                </div>
                <div class="incoming-progress-bar">
                    <div class="incoming-progress-fill" style="width: ${t.progress}%"></div>
                </div>
            </div>
        `).join('')}
      `;
  }

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const filename = e.target.getAttribute('data-filename');
      if (filename) deleteFile(filename);
    }

    if (e.target.classList.contains('details-btn')) {
      const filename = e.target.getAttribute('data-filename');
      if (filename) showDetails(filename);
    }
  });
});

function openPreview(imageSrc, imageName) {
  const modal = document.getElementById("preview-modal");
  const modalImg = document.getElementById("modal-image");
  const caption = document.getElementById("modal-caption");
  modal.style.display = "flex";
  modalImg.src = imageSrc;
  caption.textContent = imageName;
}

function closePreview() {
  document.getElementById("preview-modal").style.display = "none";
}

async function deleteFile(filename) {
  if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/delete/${encodeURIComponent(filename)}`, {
      method: 'POST'
    });

    const result = await response.json();

    if (result.success) {
      alert(`✓ ${result.message}`);
      location.reload(true);
    } else {
      alert(`✗ Error: ${result.message}`);
    }
  } catch (error) {
    alert(`✗ Error deleting file: ${error.message}`);
  }
}

async function showDetails(filename) {
  try {
    const response = await fetch(`/details/${encodeURIComponent(filename)}`);
    const details = await response.json();

    if (details.error) {
      alert(`Error: ${details.error}`);
      return;
    }

    const detailsHTML = `
      <div class="detail-row">
        <span class="detail-label">📄 File Name:</span>
        <span class="detail-value">${details.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📏 Size:</span>
        <span class="detail-value">${details.size}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📅 Modified:</span>
        <span class="detail-value">${details.modified}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">🏷️ Type:</span>
        <span class="detail-value">${details.type}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">🔗 Download URL:</span>
        <span class="detail-value"><a href="/files/${encodeURIComponent(details.name)}" target="_blank">/files/${details.name}</a></span>
      </div>
    `;

    document.getElementById('details-content').innerHTML = detailsHTML;
    document.getElementById('details-modal').style.display = 'flex';
  } catch (error) {
    alert(`Error loading details: ${error.message}`);
  }
}

function closeDetails() {
  document.getElementById('details-modal').style.display = 'none';
}