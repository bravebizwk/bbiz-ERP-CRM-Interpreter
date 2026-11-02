'use client';
import React, { useState } from 'react';
import { showToast } from '../../app/kanban/toast.js';
import { showModal } from '../../app/kanban/modal.js';

const INITIAL_COLUMNS = [
    {
        id: 'todo',
        title: 'To Do',
        color: '#34495E',
        cards: [
            {
                id: 'card-1',
                title: 'ダッシュボードのUI修正',
                desc: 'Gentelellaテーマのカラー調整を行う',
                assignees: ['田中'],
                due: 'May 15',
                priority: 'medium',
            },
        ],
    },
    {
        id: 'Approval',
        title: 'Approval',
        color: '#34495E',
        cards: [
            {
                id: 'card-1',
                title: 'ダッシュボードのUI修正',
                desc: 'Gentelellaテーマのカラー調整を行う',
                assignees: ['田中'],
                due: 'May 15',
                priority: 'medium',
            },
        ],
    },
    {
        id: 'in_progress',
        title: 'In Progress',
        color: '#3498DB',
        cards: [
            {
                id: 'card-2',
                title: 'ログイン画面のデザイン作成',
                desc: 'レスポンシブ対応を含めて構築',
                assignees: ['佐藤', '鈴木'],
                due: 'May 20',
                priority: 'high',
            },
        ],
    },
    {
        id: 'done',
        title: 'Done',
        color: '#1ABB9C',
        cards: [],
    },
];

export default function Kanban() {
    const [columns, setColumns] = useState(INITIAL_COLUMNS);
    const [draggedCard, setDraggedCard] = useState(null);
    const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);

    // --- カードのドラッグ＆ドロップ ---
    const handleCardDragStart = (e, card, sourceColId) => {
        e.stopPropagation();
        setDraggedCard({ card, sourceColId });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.id); // ドラッグを有効にするためのデータ設定
    };

    const handleCardDrop = (e, targetColId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedCard) return;
        const { card, sourceColId } = draggedCard;

        if (sourceColId === targetColId) {
            setDraggedCard(null);
            return;
        }

        setColumns((prev) =>
            prev.map((col) => {
                if (col.id === sourceColId) {
                    return { ...col, cards: col.cards.filter((c) => c.id !== card.id) };
                }
                if (col.id === targetColId) {
                    return { ...col, cards: [...col.cards, card] };
                }
                return col;
            })
        );

        const targetCol = columns.find((c) => c.id === targetColId);
        showToast(`「${card.title}」を ${targetCol?.title} に移動しました`);
        setDraggedCard(null);
    };

    // --- カラムの並べ替え ---
    const handleColumnDragStart = (e, index) => {
        setDraggedColumnIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleColumnDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedColumnIndex === null || draggedColumnIndex === targetIndex) return;

        const updatedCols = [...columns];
        const [movedCol] = updatedCols.splice(draggedColumnIndex, 1);
        updatedCols.splice(targetIndex, 0, movedCol);

        setColumns(updatedCols);
        setDraggedColumnIndex(null);
        showToast(`カラム順序を更新しました`);
    };

    // --- モーダル表示 (新規作成 / 編集) ---
    const openCardModal = (card = null, defaultColId = 'todo') => {
        const isNew = !card;
        const initialData = card || {
            id: `card-${Date.now()}`,
            title: '',
            desc: '',
            assignees: [],
            due: '',
            priority: 'medium',
            colId: defaultColId,
        };

        showModal({
            title: isNew ? 'New card' : 'Edit card',
            card: initialData,
            columns,
            currentColId: card ? columns.find((c) => c.cards.some((item) => item.id === card.id))?.id : defaultColId,
            onSave: (formData) => {
                const targetColId = formData.col;
                const newCard = {
                    id: initialData.id,
                    title: formData.title,
                    desc: formData.desc,
                    assignees: formData.assignees,
                    due: formData.due,
                    priority: formData.priority,
                };

                setColumns((prev) =>
                    prev.map((col) => {
                        // 編集前のカラムから除外
                        const filteredCards = col.cards.filter((c) => c.id !== newCard.id);

                        // 対象カラムへ追加
                        if (col.id === targetColId) {
                            return { ...col, cards: [...filteredCards, newCard] };
                        }
                        return { ...col, cards: filteredCards };
                    })
                );

                showToast(isNew ? `「${newCard.title}」を作成しました` : `「${newCard.title}」を更新しました`);
            },
            onDelete: !isNew
                ? () => {
                    setColumns((prev) =>
                        prev.map((col) => ({
                            ...col,
                            cards: col.cards.filter((c) => c.id !== card.id),
                        }))
                    );
                    showToast(`「${card.title}」を削除しました`);
                }
                : null,
        });
    };

    return (
        <div style={styles.container}>
            {/* ヘッダーエリア */}
            <div style={styles.topHeader}>
                <h2 style={styles.headerTitle}>プロジェクト カンバンボード</h2>
                <button
                    className="btn btn-primary"
                    id="kanban-add-btn"
                    style={styles.addBtn}
                    onClick={() => openCardModal(null, 'todo')}
                >
                    + New card
                </button>
            </div>

            {/* カンバンボード */}
            <div style={styles.board}>
                {columns.map((col, colIndex) => (
                    <div
                        key={col.id}
                        draggable
                        onDragStart={(e) => handleColumnDragStart(e, colIndex)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            if (draggedCard) {
                                handleCardDrop(e, col.id);
                            } else {
                                handleColumnDrop(e, colIndex);
                            }
                        }}
                        style={styles.column}
                    >
                        {/* カラムヘッダー */}
                        <div style={{ ...styles.columnHeader, borderTopColor: col.color }}>
                            <span style={styles.columnTitle}>{col.title}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ ...styles.badge, backgroundColor: col.color }}>
                                    {col.cards.length}
                                </span>
                                <button
                                    className="kanban-add"
                                    data-add-col={col.id}
                                    style={styles.inlineAddBtn}
                                    onClick={() => openCardModal(null, col.id)}
                                    title="カードを追加"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* カードリスト */}
                        <div
                            style={styles.cardList}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.stopPropagation();
                                if (draggedCard) {
                                    handleCardDrop(e, col.id);
                                }
                            }}
                        >
                            {col.cards.map((card) => (
                                <div
                                    key={card.id}
                                    draggable
                                    onDragStart={(e) => handleCardDragStart(e, card, col.id)}
                                    onClick={() => openCardModal(card, col.id)}
                                    style={styles.card}
                                >
                                    <h4 style={styles.cardTitle}>{card.title}</h4>
                                    {card.desc && <p style={styles.cardDesc}>{card.desc}</p>}

                                    {/* カードフッター情報 */}
                                    <div style={styles.cardMeta}>
                                        {card.due && <span style={styles.dueBadge}>📅 {card.due}</span>}
                                        {card.assignees && card.assignees.length > 0 && (
                                            <span style={styles.assigneeBadge}>
                                                👤 {card.assignees.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Gentelella風スタイル ---
const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#0f2054',
        fontFamily: '"Helvetica Neue", Roboto, "Segoe UI", Arial, sans-serif',
        minHeight: '100vh',
        color: '#73879C',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
    },

    topHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        width: '100%',
    },

    headerTitle: {
        margin: 0,
        color: '#f8fafc',
        fontSize: '22px',
        fontWeight: '600',
        textAlign: 'left',
    },

    addBtn: {
        backgroundColor: '#1ABB9C',
        color: '#f8fafc',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '3px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '14px',
    },

    board: {
        display: 'flex',
        gap: '20px',
        overflowX: 'auto',
        paddingBottom: '10px',
        width: '100%',
    },

    column: {
        flex: '1',
        minWidth: '280px',
        maxWidth: '350px',
        backgroundColor: '#73879C',
        borderRadius: '3px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        border: '1px solid #E6E9ED',
        display: 'flex',
        flexDirection: 'column',
    },
    columnHeader: {
        padding: '12px 15px',
        borderBottom: '1px solid #bdc5cf',
        borderTop: '3px solid #34495E',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#e8eaf0',
    },
    columnTitle: {
        fontWeight: 'bold',
        color: '#2A3F54',
        fontSize: '14px',
    },
    badge: {
        color: '#FFF',
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: '10px',
        fontWeight: 'bold',
    },
    inlineAddBtn: {
        background: 'none',
        border: 'none',
        color: '#73879C',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        padding: '0 4px',
    },
    cardList: {
        padding: '12px',
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    card: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E6E9ED',
        borderLeft: '4px solid #0fc8ed',
        borderRadius: '2px',
        padding: '12px',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    cardTitle: {
        margin: '0 0 6px 0',
        fontSize: '14px',
        color: '#2A3F54',
    },
    cardDesc: {
        margin: '0 0 8px 0',
        fontSize: '12px',
        color: '#73879C',
        lineHeight: '1.4',
    },
    cardMeta: {
        display: 'flex',
        gap: '10px',
        fontSize: '11px',
        color: '#9B9B9B',
    },
    dueBadge: {
        backgroundColor: '#EDF2F7',
        padding: '2px 6px',
        borderRadius: '3px',
    },
    assigneeBadge: {
        backgroundColor: '#EBF8FF',
        color: '#2B6CB0',
        padding: '2px 6px',
        borderRadius: '3px',
    },
};