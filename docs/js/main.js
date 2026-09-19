/* ============================================
   How to Code Link Space - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCopyButtons();
  initSidebar();
  initProgress();
  initSmoothScroll();
});

/* ---- Copy Code Buttons ---- */
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeBlock = btn.closest('.code-block');
      const code = codeBlock.querySelector('code').textContent;
      try {
        await navigator.clipboard.writeText(code);
        btn.classList.add('copied');
        btn.innerHTML = '&#10003; Copied';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '&#128203; Copy';
        }, 2000);
      } catch {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.classList.add('copied');
        btn.innerHTML = '&#10003; Copied';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '&#128203; Copy';
        }, 2000);
      }
    });
  });
}

/* ---- Mobile Sidebar ---- */
function initSidebar() {
  const toggle = document.querySelector('.mobile-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  // Close sidebar on link click (mobile)
  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  });
}

/* ---- Progress Tracking ---- */
function initProgress() {
  const chapters = document.querySelectorAll('.sidebar-nav a');
  const total = chapters.length;

  // Load progress from localStorage
  let completed = JSON.parse(localStorage.getItem('linkspice-progress') || '[]');

  // Mark current chapter
  const currentPath = window.location.pathname.split('/').pop();
  chapters.forEach(ch => {
    const href = ch.getAttribute('href').split('/').pop();
    const num = ch.dataset.chapter;

    if (completed.includes(num)) {
      ch.classList.add('completed');
    }
    if (href === currentPath) {
      ch.classList.add('active');
    }
  });

  // Update progress bar
  const fill = document.querySelector('.progress-fill');
  if (fill) {
    const currentNum = document.querySelector('.sidebar-nav a.active')?.dataset?.chapter;
    const pct = currentNum ? (parseInt(currentNum) / total) * 100 : 0;
    fill.style.width = pct + '%';
  }

  // Mark complete button
  const completeBtn = document.getElementById('mark-complete');
  if (completeBtn) {
    const num = completeBtn.dataset.chapter;
    if (completed.includes(num)) {
      completeBtn.textContent = '✓ Completed';
      completeBtn.classList.add('completed');
    }
    completeBtn.addEventListener('click', () => {
      if (!completed.includes(num)) {
        completed.push(num);
        localStorage.setItem('linkspice-progress', JSON.stringify(completed));
        completeBtn.textContent = '✓ Completed';
        completeBtn.classList.add('completed');

        // Update sidebar
        const sidebarLink = document.querySelector(`.sidebar-nav a[data-chapter="${num}"]`);
        if (sidebarLink) sidebarLink.classList.add('completed');
      }
    });
  }
}

/* ---- Smooth Scroll for anchors ---- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
