import { NextResponse } from 'next/server';
import { getFilesByProject } from '@/fileservices/fileService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projNo = searchParams.get('proj_no');

        if (!projNo) {
            return NextResponse.json({ error: '案件番号（proj_no）が指定されていません。' }, { status: 400 });
        }

        const files = await getFilesByProject(projNo);

        return NextResponse.json({ success: true, files }, { status: 200 });
    } catch (error: any) {
        console.error('List files error:', error);
        return NextResponse.json({ error: 'ファイル一覧の取得に失敗しました。', details: error.message }, { status: 500 });
    }
}