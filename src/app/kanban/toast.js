'use client';

function ensureToastStyles() {
  if (typeof window === 'undefined') return;
  if (document.getElementById('kanban-toast-styles')) return;

  const style = document.createElement('style');
  style.id = 'kanban-toast-styles';
  style.innerHTML = `
      .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .toast-item {
        background-color: #2A3F54;
        color: #FFFFFF;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: "Helvetica Neue", Roboto, sans-serif;
        font-size: 14px;
        border-left: 4px solid #1ABB9C;
        animation: fadeIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }
    `;
  document.head.appendChild(style);
}

let container = null;

export function showToast(message) {
  ensureToastStyles();

  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    if (container.children.length === 0) {
      container.remove();
      container = null;
    }
  }, 3000);
}
