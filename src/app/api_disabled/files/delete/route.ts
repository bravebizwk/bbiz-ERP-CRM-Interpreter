import { NextResponse } from 'next/server';
import { softDeleteFile } from '@/fileservices/fileService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fileId, deletedUser } = body;

        if (!fileId) {
            return NextResponse.json({ error: 'ファイルIDが指定されていません。' }, { status: 400 });
        }

        const deletedRecord = await softDeleteFile(fileId, deletedUser || 'system');

        return NextResponse.json({
            success: true,
            message: 'ファイルを論理削除しました。',
            data: deletedRecord,
        }, { status: 200 });
    } catch (error: any) {
        console.error('Delete file error:', error);
        return NextResponse.json({ error: 'ファイルの削除に失敗しました。', details: error.message }, { status: 500 });
    }
}