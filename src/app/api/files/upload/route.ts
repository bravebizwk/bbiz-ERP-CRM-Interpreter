import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { insertProjectFile } from '@/fileservices/fileService';

// Azure Blob 接続クライアントの初期化
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const containerName = process.env.CONTAINER_NAME || 'project-files';

export async function POST(request: Request) {
    console.log('[API /files/upload] POST リクエストを受信しました。');
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const projNo = formData.get('proj_no') as string;
        const uploadUser = formData.get('upload_user') as string || 'system';

        console.log(`[API /files/upload] パラメータ確認 -> 案件番号: ${projNo}, ファイル名: ${file?.name}, サイズ: ${file?.size}, ユーザー: ${uploadUser}`);

        if (!file || !projNo) {
            console.warn('[API /files/upload] バリデーションエラー: ファイルまたは案件番号が不足しています。');
            return NextResponse.json({ error: 'ファイルまたは案件番号（proj_no）が不足しています。' }, { status: 400 });
        }

        // 1. Azure Blob Storage へのアップロード処理
        console.log('[API /files/upload] 1. Azure Blob Storage へのアップロード処理を開始します...');
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // コンテナーが存在しない場合は作成
        await containerClient.createIfNotExists();

        // 一意のファイル名を生成（例: timestamp-filename）
        const blobName = `${Date.now()}-${file.name}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Azure へアップロード
        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: file.type }
        });

        const blobUrl = blockBlobClient.url;
        console.log(`[API /files/upload] Azure Blob アップロード成功. URL: ${blobUrl}`);

        // 2. PostgreSQL（データベース）へファイルメタデータを保存
        console.log('[API /files/upload] 2. PostgreSQL (Neon) へのメタデータ保存を開始します...');
        const savedFileRecord = await insertProjectFile({
            proj_no: projNo,
            file_name: blobName, // 💡 修正: Azure上の実名（タイムスタンプ付き）をデータベースに保存
            blob_url: blobUrl,
            file_size: file.size,
            mime_type: file.type,
            upload_user: uploadUser,
        });

        console.log('[API /files/upload] データベース保存成功:', savedFileRecord);

        return NextResponse.json({
            success: true,
            message: 'ファイルのアップロードとデータベース登録が完了しました。',
            data: savedFileRecord,
        }, { status: 200 });

    } catch (error: any) {
        console.error('[API /files/upload] ❌ アップロード処理エラー:', error);
        return NextResponse.json({ error: 'アップロード処理に失敗しました。', details: error.message }, { status: 500 });
    }
}
