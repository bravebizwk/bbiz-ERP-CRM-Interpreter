'use client';
import React, { useState } from 'react';
import { showModal } from './modal';
import { showToast } from './toast';

type CardPriority = 'high' | 'medium' | 'low';

interface KanbanCard {
    id: string;
    title: string;
    desc: string;
    assignees: string[];
    due: string;
    priority: CardPriority;
    col?: string;
}

interface KanbanColumn {
    id: string;
    title: string;
    color: string;
    cards: KanbanCard[];
}

interface CardFormData {
    title: string;
    desc: string;
    assignees: string[];
    due: string;
    priority: CardPriority;
    col: string;
}

const INITIAL_COLUMNS: KanbanColumn[] = [
    {
        id: 'todo',
        title: 'To Do',
        color: '#34495E',
        cards: [
            { id: '1', title: 'プロジェクトの初期設定', desc: 'Next.js App Routerの構築', assignees: ['田中'], due: 'May 10', priority: 'high' },
            { id: '2', title: 'データベース設計', desc: 'SQLiteのスキーマ定義', assignees: ['佐藤'], due: 'May 12', priority: 'medium' }
        ],
    },
    {
        id: 'in_progress',
        title: 'In Progress',
        color: '#3498DB',
        cards: [
            { id: '3', title: 'サイドバーのアイコン調整', desc: 'Lucideアイコンの紐付け', assignees: ['西村'], due: 'May 15', priority: 'high' }
        ],
    },
    {
        id: 'done',
        title: 'Done',
        color: '#1ABB9C',
        cards: [
            { id: '4', title: 'プロジェクト要件定義', desc: '仕様書の作成完了', assignees: ['田中', '佐藤'], due: 'May 01', priority: 'low' }
        ],
    },
];

export default function KanbanPage() {
    const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
    const [draggedCard, setDraggedCard] = useState<{ card: KanbanCard; sourceColId: string } | null>(null);

    // --- カードのドラッグ＆ドロップ ---
    const handleCardDragStart = (e: React.DragEvent<HTMLElement>, card: KanbanCard, sourceColId: string) => {
        e.stopPropagation();
        setDraggedCard({ card, sourceColId });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.id);
    };

    const handleCardDrop = (e: React.DragEvent<HTMLElement>, targetColId: string) => {
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

    // --- カード追加モーダルを開く ---
    const handleAddCard = (colId: string) => {
        showModal({
            title: '新規カード追加',
            card: { title: '', desc: '', assignees: [], due: '', priority: 'medium' },
            columns: columns,
            currentColId: colId,
            onSave: (formData: CardFormData) => {
                const newCard = {
                    id: Date.now().toString(),
                    ...formData
                };
                setColumns(columns.map(col => {
                    if (col.id === formData.col) {
                        return { ...col, cards: [...col.cards, newCard] };
                    }
                    return col;
                }));
                showToast('カードを追加しました');
            }
        });
    };

    // --- カード編集モーダルを開く ---
    const handleEditCard = (card: KanbanCard, currentColId: string) => {
        showModal({
            title: 'カードの編集',
            card: card,
            columns: columns,
            currentColId: currentColId,
            onSave: (formData: CardFormData) => {
                setColumns(columns.map(col => {
                    const filteredCards = col.cards.filter(c => c.id !== card.id);
                    if (col.id === formData.col) {
                        return { ...col, cards: [...filteredCards, { ...card, ...formData }] };
                    }
                    return { ...col, cards: filteredCards };
                }));
                showToast('カードを更新しました');
            },
            onDelete: () => {
                setColumns(columns.map(col => ({
                    ...col,
                    cards: col.cards.filter(c => c.id !== card.id)
                })));
                showToast('カードを削除しました');
            }
        });
    };

    return (
        <div className="card" style={{ padding: '20px', background: '#0f2054', minHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', margin: 0, color: '#f8fafc' }}>Kanban Board</h1>
            </div>

            {/* カンバンボードのレイアウト */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {columns.map(col => (
                    <div
                        key={col.id}
                        style={{ background: '#73879C', borderRadius: '6px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleCardDrop(e, col.id)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: '#2A3F54', background: '#e8eaf0', padding: '8px 12px', borderRadius: '4px' }}>
                            <span>{col.title} ({col.cards.length})</span>
                            <button
                                onClick={() => handleAddCard(col.id)}
                                style={{ background: '#1ABB9C', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
                            >
                                ＋ 追加
                            </button>
                        </div>

                        {/* カード一覧 */}
                        <div
                            style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '150px' }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.stopPropagation();
                                handleCardDrop(e, col.id);
                            }}
                        >
                            {col.cards.map(card => (
                                <div
                                    key={card.id}
                                    draggable
                                    onDragStart={(e) => handleCardDragStart(e, card, col.id)}
                                    onClick={() => handleEditCard(card, col.id)}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '4px',
                                        padding: '12px',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                        cursor: 'grab',
                                        borderLeft: `4px solid ${card.priority === 'high' ? '#E74C3C' : card.priority === 'medium' ? '#F39C12' : '#3498DB'}`
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#2A3F54', marginBottom: '6px' }}>{card.title}</div>
                                    {card.desc && <div style={{ fontSize: '12px', color: '#73879C', marginBottom: '8px' }}>{card.desc}</div>}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#95A5A6' }}>
                                        <span>Due: {card.due || 'なし'}</span>
                                        <span>{card.assignees?.join(', ')}</span>
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