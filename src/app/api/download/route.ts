import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileName = searchParams.get('file'); // 例: ?file=1794067618946-土地家屋調査士参考文例_261108_0006.txt

        if (!fileName) {
            return NextResponse.json({ error: 'ファイル名が指定されていません。' }, { status: 400 });
        }

        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error('Azureの接続文字列が設定されていません。');
        }

        // 💡 実際のコンテナ名（または環境変数）を指定
        const containerName = process.env.CONTAINER_NAME || 'bbiz-erp-storage-container';

        // Azure Blob Storageへ接続
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(fileName);

        // ファイルが存在するか確認
        if (!(await blobClient.exists())) {
            console.error(`[API /download] ファイルが見つかりません: コンテナ=${containerName}, ファイル=${fileName}`);
            return NextResponse.json({ error: 'ファイルが見つかりません。' }, { status: 404 });
        }

        // Azureからファイルデータをダウンロード
        const downloadResponse = await blobClient.download();
        const downloadedContent = downloadResponse.readableStreamBody;

        if (!downloadedContent) {
            throw new Error('ファイルの読み込みに失敗しました。');
        }

        // データをブラウザへそのまま転送（ダウンロードさせる）
        return new NextResponse(downloadedContent as any, {
            headers: {
                'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
                'Content-Type': downloadResponse.contentType || 'application/octet-stream',
            },
        });

    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Download API Error:', errMessage);
        return NextResponse.json({ error: errMessage }, { status: 500 });
    }
}
