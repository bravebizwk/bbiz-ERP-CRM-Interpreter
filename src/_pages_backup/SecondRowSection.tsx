
export default function DownloadDocumentsCard() {
    // 5つの資料定義（Dropboxの共有リンクを設定）
    // ※ 共有リンク末尾の ?dl=0 を ?dl=1 に変更することで直接ダウンロードになります
    const documents = [
        { id: "cr", name: "CR", description: "CR 関連資料", dropboxUrl: "https://www.dropbox.com/scl/fi/29parxir6y2g7f6ja63he/CR.jpg?rlkey=yz7ll3pi6yzdph2qvkb9ch3w7&st=lwvssfiw&dl=0" },
        { id: "br", name: "BR", description: "BR 関連資料", dropboxUrl: "https://www.dropbox.com/scl/fi/7w4nft2fong97nxjg9cxe/BR.jpg?rlkey=43ekuwac6i1y5ol10ibrjdpn7&st=sc7hvor2&dl=0" },
        { id: "nd2b", name: "ND2A", description: "ND2B 関連資料", dropboxUrl: "https://www.dropbox.com/scl/fi/9x0sp9kcn90u5p4gsc66g/ND2A.jpg?rlkey=izpcm01n96lxrl8ajugoxz3i8&st=20wasjax&dl=0" },
    ];

    const agreementdocuments = [
        { id: "cr", name: "CR", description: "CR 関連資料", dropboxUrl: "https://www.dropbox.com/scl/fi/29parxir6y2g7f6ja63he/CR.jpg?rlkey=yz7ll3pi6yzdph2qvkb9ch3w7&st=lwvssfiw&dl=0" },
        { id: "br", name: "BR", description: "BR 関連資料", dropboxUrl: "https://www.dropbox.com/scl/fi/7w4nft2fong97nxjg9cxe/BR.jpg?rlkey=43ekuwac6i1y5ol10ibrjdpn7&st=sc7hvor2&dl=0" },
        { id: "nd2b", name: "ND2A", description: "ND2B 関連資料", dropboxUrl: "https://www.dropbox.com/scl/fi/9x0sp9kcn90u5p4gsc66g/ND2A.jpg?rlkey=izpcm01n96lxrl8ajugoxz3i8&st=20wasjax&dl=0" },
    ];

    // カードクリック時のダウンロード処理
    const handleDownload = (doc) => {
        if (!doc.dropboxUrl || doc.dropboxUrl.includes("xxxx")) {
            alert(`${doc.name} のDropboxリンクがまだ設定されていません。`);
            return;
        }

        const directDownloadUrl = doc.dropboxUrl.replace("dl=0", "dl=1");

        const link = document.createElement("a");
        link.href = directDownloadUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card-vertical">
                {/* 既存の stats-card クラスで外枠・背景色・パディングを統一 */}
                <div className="card">
                    <h3>登記関係:</h3>

                    {/* 既存の orders-select-filter-bar-vertual クラスで横並び配置 */}
                    <div
                    className="card-click">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="stats-card"
                                onClick={() => handleDownload(doc)}>
                                <h2>Download</h2>
                                <div className="mt-1">
                                    <span className="badge bg-primary fs-6 px-3 py-1">
                                        {doc.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>



            {/* 既存の stats-card クラスで外枠・背景色・パディングを統一 */}
            <div className="card">
                <h3>Agreement:</h3>

                {/* 既存の orders-select-filter-bar-vertual クラスで横並び配置 */}
                <div
                    className="card-click">
                    {agreementdocuments.map((doc) => (
                        <div
                            key={doc.id}
                            className="stats-card"
                            onClick={() => handleDownload(doc)}>
                            <h2>Download</h2>
                            <div className="mt-1">
                                <span className="badge bg-primary fs-6 px-3 py-1">
                                    {doc.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
