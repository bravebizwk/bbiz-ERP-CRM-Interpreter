'use client';

import { useState } from 'react';

interface OrderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess: () => void;
}

interface OrderFormData {
    id: string;
    customer: string;
    product: string;
    category: string;
    amount: string;
    status: string;
    date: string;
}

const createInitialFormData = (): OrderFormData => ({
    id: '',
    customer: '',
    product: '',
    category: '',
    amount: '',
    status: '保留',
    date: new Date().toLocaleDateString('sv-SE'),
});

export default function OrderFormModal({ isOpen, onClose, onSubmitSuccess }: OrderFormModalProps) {
    const [formData, setFormData] = useState<OrderFormData>(createInitialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const handleClose = () => {
        setFormData(createInitialFormData());
        setErrorMessage(null);
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, amount: Number(formData.amount) }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error ?? `登録に失敗しました (${response.status})`);
            }

            onSubmitSuccess();
            handleClose();
        } catch (error) {
            console.error('Order registration error:', error);
            setErrorMessage(error instanceof Error ? error.message : '注文情報を登録できませんでした。');
        } finally {
            setSubmitting(false);
        }
    };

    const fieldStyle: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px 12px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        background: '#fff',
        color: '#1e293b',
    };
    const labelStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        color: '#334155',
        fontSize: '14px',
        fontWeight: 600,
    };

    return (
        <div
            role="presentation"
            onClick={handleClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                background: 'rgba(15, 23, 42, 0.65)',
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-form-title"
                onClick={(event) => event.stopPropagation()}
                style={{
                    width: 'min(100%, 560px)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    borderRadius: '10px',
                    background: '#fff',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
                }}
            >
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px 22px',
                    background: '#111827',
                    color: '#f8fafc',
                }}>
                    <h2 id="order-form-title" style={{ margin: 0, fontSize: '20px' }}>注文情報の新規登録</h2>
                    <button type="button" onClick={handleClose} aria-label="閉じる" style={{
                        border: 0,
                        background: 'transparent',
                        color: 'inherit',
                        fontSize: '26px',
                        cursor: 'pointer',
                    }}>
                        &times;
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                        gap: '16px',
                        padding: '22px',
                    }}>
                        {errorMessage && (
                            <p role="alert" style={{ gridColumn: '1 / -1', margin: 0, color: '#b91c1c' }}>
                                {errorMessage}
                            </p>
                        )}
                        <label style={labelStyle}>
                            注文ID *
                            <input name="id" value={formData.id} onChange={handleChange} style={fieldStyle} required />
                        </label>
                        <label style={labelStyle}>
                            顧客名 *
                            <input name="customer" value={formData.customer} onChange={handleChange} style={fieldStyle} required />
                        </label>
                        <label style={labelStyle}>
                            商品名 *
                            <input name="product" value={formData.product} onChange={handleChange} style={fieldStyle} required />
                        </label>
                        <label style={labelStyle}>
                            カテゴリ *
                            <input name="category" value={formData.category} onChange={handleChange} style={fieldStyle} required />
                        </label>
                        <label style={labelStyle}>
                            金額 *
                            <input name="amount" type="number" min="0" step="1" value={formData.amount} onChange={handleChange} style={fieldStyle} required />
                        </label>
                        <label style={labelStyle}>
                            ステータス *
                            <select name="status" value={formData.status} onChange={handleChange} style={fieldStyle} required>
                                <option value="完了">完了</option>
                                <option value="保留">保留</option>
                                <option value="キャンセル">キャンセル</option>
                            </select>
                        </label>
                        <label style={labelStyle}>
                            日付 *
                            <input name="date" type="date" value={formData.date} onChange={handleChange} style={fieldStyle} required />
                        </label>
                    </div>

                    <footer style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                        padding: '0 22px 22px',
                    }}>
                        <button type="button" onClick={handleClose} disabled={submitting} style={{
                            padding: '10px 18px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            background: '#fff',
                            color: '#334155',
                            cursor: 'pointer',
                        }}>
                            キャンセル
                        </button>
                        <button type="submit" disabled={submitting} style={{
                            padding: '10px 18px',
                            border: 0,
                            borderRadius: '6px',
                            background: '#21559d',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: submitting ? 'wait' : 'pointer',
                        }}>
                            {submitting ? '登録中...' : '登録'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
