import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// プロジェクトルートにある dashboard.sqlite に接続
const dbPath = path.join(process.cwd(), 'dashboard.sqlite');
const db = new Database(dbPath);

// テーブルの初期化（初回実行時に自動作成）
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
  );
`);

// 初期ルームが存在しない場合はデフォルトルームを作成
const roomCount = db.prepare('SELECT COUNT(*) as count FROM chat_rooms').get().count;
if (roomCount === 0) {
    const defaultRoomId = 'room-general';
    db.prepare('INSERT INTO chat_rooms (id, name) VALUES (?, ?)').run(defaultRoomId, '一般チャット');
    db.prepare('INSERT INTO chat_messages (id, room_id, sender, content) VALUES (?, ?, ?, ?)').run(
        'msg-1',
        defaultRoomId,
        'システム',
        'チャットへようこそ！'
    );
}

// GET: ルーム一覧とアクティブなルームのメッセージを取得
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomIdParam = searchParams.get('roomId');

        // すべてのルームを取得し、最新のメッセージを添える
        const roomRows = db.prepare('SELECT * FROM chat_rooms ORDER BY created_at ASC').all();
        const rooms = roomRows.map((room) => {
            const lastMsg = db.prepare(
                'SELECT content FROM chat_messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 1'
            ).get(room.id);
            return {
                id: room.id,
                name: room.name,
                lastMessage: lastMsg ? lastMsg.content : '',
            };
        });

        const activeRoomId = roomIdParam || (rooms.length > 0 ? rooms[0].id : '');

        // アクティブなルームのメッセージ一覧を取得
        let messages = [];
        if (activeRoomId) {
            messages = db.prepare(
                'SELECT id, room_id, sender, content, created_at FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC'
            ).all(activeRoomId);
        }

        return NextResponse.json({
            rooms,
            messages,
            activeRoomId,
        });
    } catch (error) {
        console.error('GET /api/chat error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: メッセージの送信 または ルームの新規作成
export async function POST(request) {
    try {
        const body = await request.json();
        const { action } = body;

        // ルーム作成処理
        if (action === 'create-room') {
            const { name } = body;
            if (!name) {
                return NextResponse.json({ error: 'ルーム名は必須です。' }, { status: 400 });
            }

            const roomId = 'room-' + Date.now();
            db.prepare('INSERT INTO chat_rooms (id, name) VALUES (?, ?)').run(roomId, name);

            const newRoom = {
                id: roomId,
                name,
                lastMessage: '',
            };

            return NextResponse.json({ room: newRoom });
        }

        // メッセージ送信処理
        if (action === 'message') {
            const { roomId, sender, content } = body;
            if (!roomId || !sender || !content) {
                return NextResponse.json({ error: '必要なパラメータが不足しています。' }, { status: 400 });
            }

            const messageId = 'msg-' + Date.now();
            db.prepare(
                'INSERT INTO chat_messages (id, room_id, sender, content) VALUES (?, ?, ?, ?)'
            ).run(messageId, roomId, sender, content);

            const newMessage = db.prepare(
                'SELECT id, room_id, sender, content, created_at FROM chat_messages WHERE id = ?'
            ).get(messageId);

            return NextResponse.json({ message: newMessage });
        }

        return NextResponse.json({ error: '無効なアクションです。' }, { status: 400 });
    } catch (error) {
        console.error('POST /api/chat error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}