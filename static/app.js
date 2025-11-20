document.addEventListener("DOMContentLoaded", () => {
    // Tabs: switch sections
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
  
    // Custom file input: pretty button + filename text
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
  });
  