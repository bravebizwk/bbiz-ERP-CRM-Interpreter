'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from 'react';
import { MessageCircle, Plus, Send, Users } from 'lucide-react';

// 型定義
interface Room {
    id: string;
    name: string;
    lastMessage?: string;
}

interface Message {
    id: string;
    sender: string;
    created_at: string;
    content: string;
}

const requestError = async (response: Response): Promise<Error> => {
    const body = await response.json().catch(() => ({}));
    return new Error((body as { error?: string }).error || 'チャットの処理に失敗しました。');
};

const formatDate = (value: string): string => {
    if (!value) return '';
    const date = new Date(`${value.replace(' ', 'T')}Z`);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export default function Page() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeRoomId, setActiveRoomId] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [sender, setSender] = useState<string>('ゲスト');
    const [messageText, setMessageText] = useState<string>('');
    const [roomName, setRoomName] = useState<string>('');
    const [roomSearch, setRoomSearch] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const activeRoom = rooms.find((room) => room.id === activeRoomId);
    const visibleRooms = useMemo(() => {
        const query = roomSearch.trim().toLocaleLowerCase();
        if (!query) return rooms;
        return rooms.filter((room) => room.name.toLocaleLowerCase().includes(query));
    }, [rooms, roomSearch]);

    const refreshChat = useCallback(async (signal?: AbortSignal) => {
        const query = activeRoomId ? `?roomId=${encodeURIComponent(activeRoomId)}` : '';
        const response = await fetch(`/api/chat${query}`, { cache: 'no-store', signal });
        if (!response.ok) throw await requestError(response);

        const data = await response.json();
        setRooms(data.rooms);
        setMessages(data.messages);
        if (!activeRoomId && data.activeRoomId) setActiveRoomId(data.activeRoomId);
        setError('');
        setIsLoading(false);
    }, [activeRoomId]);

    useEffect(() => {
        let disposed = false;
        const controller = new AbortController();

        const load = async () => {
            try {
                await refreshChat(controller.signal);
            } catch (loadError: unknown) {
                const err = loadError as Error;
                if (!disposed && err.name !== 'AbortError') {
                    setError(err.message || 'チャットを読み込めませんでした。');
                    setIsLoading(false);
                }
            }
        };

        void load();
        const intervalId = window.setInterval(load, 5000);

        return () => {
            disposed = true;
            controller.abort();
            window.clearInterval(intervalId);
        };
    }, [refreshChat]);

    const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const content = messageText.trim();
        const senderName = sender.trim();
        if (!content || !senderName || !activeRoomId || isSending) return;

        setIsSending(true);
        setError('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'message',
                    roomId: activeRoomId,
                    sender: senderName,
                    content,
                }),
            });
            if (!response.ok) throw await requestError(response);

            const data = await response.json();
            setMessages((currentMessages) => [...currentMessages, data.message]);
            setMessageText('');
            void refreshChat().catch((refreshError: unknown) => {
                const err = refreshError as Error;
                setError(err.message || 'チャットを更新できませんでした。');
            });
        } catch (sendError: unknown) {
            const err = sendError as Error;
            setError(err.message || 'メッセージを送信できませんでした。');
        } finally {
            setIsSending(false);
        }
    };

    const createRoom = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const name = roomName.trim();
        if (!name || isCreatingRoom) return;

        setIsCreatingRoom(true);
        setError('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create-room', name }),
            });
            if (!response.ok) throw await requestError(response);

            const data = await response.json();
            setRooms((currentRooms) => [...currentRooms, data.room]);
            setActiveRoomId(data.room.id);
            setIsLoading(true);
            setRoomName('');
        } catch (createError: unknown) {
            const err = createError as Error;
            setError(err.message || 'ルームを作成できませんでした。');
        } finally {
            setIsCreatingRoom(false);
        }
    };

    return (
        <section className="chat-page">
            <header className="chat-page__heading">
                <div>
                    <p className="chat-page__eyebrow">COMMUNICATION</p>
                    <h1>チャット</h1>
                    <p>チームのメンバーとメッセージを共有できます。</p>
                </div>
                <span className="chat-page__heading-icon" aria-hidden="true">
                    <MessageCircle size={23} />
                </span>
            </header>

            {error && (
                <div className="chat-page__error" role="alert">
                    {error}
                </div>
            )}

            <div className="chat-workspace">
                <aside className="chat-rooms" aria-label="チャットルーム">
                    <div className="chat-rooms__heading">
                        <div>
                            <h2>ルーム</h2>
                            <span>{rooms.length} 件</span>
                        </div>
                        <Users size={18} aria-hidden="true" />
                    </div>

                    <label className="chat-rooms__search">
                        <span className="sr-only">ルームを検索</span>
                        <input
                            type="search"
                            value={roomSearch}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setRoomSearch(event.target.value)}
                            placeholder="ルームを検索"
                        />
                    </label>

                    <nav className="chat-rooms__list" aria-label="ルーム一覧">
                        {visibleRooms.map((room) => (
                            <button
                                className={`chat-room${room.id === activeRoomId ? ' is-active' : ''}`}
                                key={room.id}
                                type="button"
                                onClick={() => {
                                    setActiveRoomId(room.id);
                                    setIsLoading(true);
                                }}
                                aria-current={room.id === activeRoomId ? 'page' : undefined}
                            >
                                <span className="chat-room__avatar">#</span>
                                <span className="chat-room__details">
                                    <strong>{room.name}</strong>
                                    <small>{room.lastMessage || 'メッセージはまだありません'}</small>
                                </span>
                            </button>
                        ))}
                        {!isLoading && visibleRooms.length === 0 && (
                            <p className="chat-rooms__empty">ルームが見つかりません。</p>
                        )}
                    </nav>

                    <form className="chat-room-create" onSubmit={createRoom}>
                        <label htmlFor="chat-room-name">新しいルーム</label>
                        <div>
                            <input
                                id="chat-room-name"
                                maxLength={60}
                                value={roomName}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => setRoomName(event.target.value)}
                                placeholder="ルーム名"
                            />
                            <button
                                type="submit"
                                aria-label="ルームを作成"
                                disabled={!roomName.trim() || isCreatingRoom}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </form>
                </aside>

                <section className="chat-conversation" aria-label="メッセージ">
                    <header className="chat-conversation__heading">
                        <div className="chat-room__avatar">#</div>
                        <div>
                            <h2>{activeRoom?.name || (isLoading ? '読み込み中...' : 'ルームを選択')}</h2>
                            <p>メッセージは自動で更新されます</p>
                        </div>
                    </header>

                    <div className="chat-messages" aria-live="polite">
                        {isLoading && <p className="chat-messages__notice">メッセージを読み込んでいます...</p>}
                        {!isLoading && activeRoomId && messages.length === 0 && (
                            <div className="chat-messages__empty">
                                <MessageCircle size={30} aria-hidden="true" />
                                <p>このルームの最初のメッセージを送信しましょう。</p>
                            </div>
                        )}
                        {messages.map((message) => (
                            <article
                                className={`chat-message${message.sender === sender.trim() ? ' is-mine' : ''}`}
                                key={message.id}
                            >
                                <div className="chat-message__meta">
                                    <strong>{message.sender}</strong>
                                    <time>{formatDate(message.created_at)}</time>
                                </div>
                                <p>{message.content}</p>
                            </article>
                        ))}
                    </div>

                    <form className="chat-composer" onSubmit={sendMessage}>
                        <label className="chat-composer__sender">
                            <span>表示名</span>
                            <input
                                maxLength={40}
                                value={sender}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => setSender(event.target.value)}
                                placeholder="表示名"
                                required
                            />
                        </label>
                        <div className="chat-composer__input">
                            <label className="sr-only" htmlFor="chat-message">メッセージ</label>
                            <textarea
                                id="chat-message"
                                maxLength={4000}
                                rows={2}
                                value={messageText}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setMessageText(event.target.value)}
                                placeholder={activeRoomId ? 'メッセージを入力...' : 'ルームを選択してください'}
                                disabled={!activeRoomId}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        event.currentTarget.form?.requestSubmit();
                                    }
                                }}
                            />
                            <button type="submit" disabled={!messageText.trim() || !activeRoomId || isSending}>
                                <Send size={17} aria-hidden="true" />
                                <span>{isSending ? '送信中...' : '送信'}</span>
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </section>
    );
}
