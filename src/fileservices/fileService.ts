// src/fileservices/fileService.ts
import { query } from '../../lib/db';
// または、tsconfig.json でパスエイリアスがルートの lib を向いている場合はそのまま

export interface ProjectFileParams {
    proj_no: string;
    file_name: string;
    blob_url: string;
    file_size?: number;
    mime_type?: string;
    upload_user?: string;
}

// ファイル情報の登録（アップロード時）
export async function insertProjectFile(params: ProjectFileParams) {
    // 既存の同名ファイルがある場合はバージョンをインクリメントして登録するなどのロジックもここに記述可能
    const sql = `
    INSERT INTO project_files (proj_no, file_name, blob_url, file_size, mime_type, upload_user)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
    const values = [
        params.proj_no,
        params.file_name,
        params.blob_url,
        params.file_size || null,
        params.mime_type || null,
        params.upload_user || null,
    ];

    const result = await query(sql, values);
    return result.rows[0];
}

// 案件ごとの有効なファイル一覧取得（論理削除済みを除外）
export async function getFilesByProject(proj_no: string) {
    const sql = `
    SELECT * FROM project_files 
    WHERE proj_no = $1 AND is_deleted = FALSE 
    ORDER BY upload_date DESC;
  `;
    const result = await query(sql, [proj_no]);
    return result.rows;
}

// ファイルの論理削除（非表示化）
export async function softDeleteFile(fileId: number, deletedBy: string) {
    const sql = `
    UPDATE project_files 
    SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = $2
    WHERE id = $1
    RETURNING *;
  `;
    const result = await query(sql, [fileId, deletedBy]);
    return result.rows[0];
}
