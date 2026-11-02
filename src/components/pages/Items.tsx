import { useEffect, useState } from "react";

interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
  status: string;
  created_at: string;
}

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/items")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`アイテムの読み込みに失敗しました (${response.status})`);
        }
        return response.json() as Promise<Item[]>;
      })
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((requestError: unknown) => {
        console.error("Items API Fetch Error:", requestError);
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "アイテムを読み込めませんでした。");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card items-page">
      <h1>Items</h1>
      <p>アイテム一覧</p>
      {loading ? (
        <p role="status">読み込み中...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : items.length === 0 ? (
        <p>登録されているアイテムはありません。</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>名前</th>
                <th>カテゴリー</th>
                <th>価格</th>
                <th>ステータス</th>
                <th>登録日</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.price.toLocaleString()}</td>
                  <td>{item.status}</td>
                  <td>{item.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
