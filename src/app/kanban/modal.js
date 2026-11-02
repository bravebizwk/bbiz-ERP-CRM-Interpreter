'use client';

// スタイルを動的に追加する関数
function ensureModalStyles() {
  if (typeof window === 'undefined') return;
  if (document.getElementById('kanban-modal-styles')) return;

  const style = document.createElement('style');
  style.id = 'kanban-modal-styles';
  style.innerHTML = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .modal-box {
        background: #FFFFFF;
        border-radius: 4px;
        width: 500px;
        max-width: 90%;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        font-family: "Helvetica Neue", Roboto, sans-serif;
        overflow: hidden;
      }
      .modal-header {
        background-color: #F7F7F7;
        padding: 15px 20px;
        border-bottom: 1px solid #E6E9ED;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-header h3 {
        margin: 0;
        color: #2A3F54;
        font-size: 16px;
      }
      .modal-body {
        padding: 20px;
        color: #73879C;
      }
      .modal-form-row {
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
.modal-form-row input,
      .modal-form-row textarea,
      .modal-form-row select {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #CCCCCC;
        border-radius: 3px;
        font-size: 13px;
        box-sizing: border-box;
      }
      .modal-footer {
        padding: 12px 20px;
        background-color: #FAFAFA;
        border-top: 1px solid #E6E9ED;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 13px;
        font-weight: bold;
      }
      .modal-btn-secondary { background: #E6E9ED; color: #333; }
      .modal-btn-primary { background: #1ABB9C; color: #FFF; }
      .modal-btn-danger { background: #E74C3C; color: #FFF; }
    `;
  document.head.appendChild(style);
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function showModal({ title, card, columns, currentColId, onSave, onDelete }) {
  // 呼び出されたタイミングでスタイルを確実に挿入
  ensureModalStyles();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const body = `
    <form class="modal-form" id="kanban-card-form" novalidate>
      <div class="modal-form-row">
        <label for="kc-title">Title *</label>
        <input type="text" id="kc-title" name="title" value="${escapeHtml(card.title)}" placeholder="Task title" autocomplete="off" required>
      </div>
      <div class="modal-form-row">
        <label for="kc-desc">Description</label>
        <textarea id="kc-desc" name="desc" rows="3" placeholder="Optional notes…">${escapeHtml(card.desc)}</textarea>
      </div>
      <div class="modal-form-row">
        <label for="kc-assignees">Assignees (カンマ区切り)</label>
        <input type="text" id="kc-assignees" name="assignees" value="${escapeHtml((card.assignees || []).join(', '))}" placeholder="田中, 佐藤">
      </div>
      <div class="modal-form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <label for="kc-due">Due date</label>
          <input type="text" id="kc-due" name="due" value="${escapeHtml(card.due)}" placeholder="May 15">
        </div>
        <div>
          <label for="kc-priority">Priority</label>
          <select id="kc-priority" name="priority">
            <option value="low" ${card.priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${card.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${card.priority === 'high' ? 'selected' : ''}>High</option>
          </select>
        </div>
      </div>
      <div class="modal-form-row">
        <label for="kc-col">Column</label>
        <select id="kc-col" name="col">
          ${columns.map((c) => `<option value="${c.id}" ${c.id === currentColId ? 'selected' : ''}>${c.title}</option>`).join('')}
        </select>
      </div>
    </form>
  `;

  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>${title}</h3>
      </div>
      <div class="modal-body">
        ${body}
      </div>
      <div class="modal-footer">
        <div>
          ${onDelete ? '<button type="button" class="modal-btn modal-btn-danger" id="modal-delete">削除</button>' : ''}
        </div>
        <div style="display:flex;gap:10px;">
          <button type="button" class="modal-btn modal-btn-secondary" id="modal-cancel">キャンセル</button>
          <button type="button" class="modal-btn modal-btn-primary" id="modal-save">保存</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeModal = () => overlay.remove();

  overlay.querySelector('#modal-cancel').onclick = closeModal;

  if (onDelete) {
    overlay.querySelector('#modal-delete').onclick = () => {
      onDelete();
      closeModal();
    };
  }

  overlay.querySelector('#modal-save').onclick = () => {
    const titleVal = overlay.querySelector('#kc-title').value.trim();
    if (!titleVal) {
      alert('Titleを入力してください。');
      return;
    }

    const assigneesRaw = overlay.querySelector('#kc-assignees').value;
    const assignees = assigneesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const formData = {
      title: titleVal,
      desc: overlay.querySelector('#kc-desc').value,
      assignees,
      due: overlay.querySelector('#kc-due').value,
      priority: overlay.querySelector('#kc-priority').value,
      col: overlay.querySelector('#kc-col').value,
    };

    onSave(formData);
    closeModal();
  };
}
