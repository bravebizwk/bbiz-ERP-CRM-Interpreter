import db from '@/lib/db'; // 既存のデータベース接続用ユーティリティ

// アイテムの型定義（必要に応じてカラムを追加・調整してください）
interface Item {
    id: number | string;
    name?: string;
    title?: string;
    description?: string;
}

// 必要に応じて非同期コンポーネントとしてデータを取得
export default async function ItemsPage() {
    // 💡 型を明示的に指定してエラーを防ぐ
    let items: Item[] = [];
    try {
        items = db.prepare('SELECT * FROM items').all() as Item[];
    } catch (error) {
        console.error('データベースからのデータ取得に失敗しました:', error);
    }

    return (
        <div className="main-content p-6">
            <h1 className="text-2xl font-bold mb-6">アイテム一覧</h1>

            {items.length === 0 ? (
                <p className="text-gray-500">登録されているアイテムはありません。</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">ID</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">名前 / タイトル</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">詳細</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-600">{item.id}</td>
                                    <td className="py-3 px-4 font-medium text-gray-800">{item.name || item.title}</td>
                                    <td className="py-3 px-4 text-gray-600">{item.description || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}