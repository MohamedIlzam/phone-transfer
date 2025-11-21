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