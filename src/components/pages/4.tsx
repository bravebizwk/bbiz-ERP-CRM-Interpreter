
interface DownloadDocument {
    name: string;
    dropboxUrl: string;
}

export default function DownloadDocumentsCard() {


    // 2. IDを unique に修正 (agree-XX)
    const agreementdocuments = [
        {
            id: "agree-cr",
            name: "労働条件に関する契約",
            description: "CRに関する規定や手順をまとめた公式資料です。申請手続きや利用規約の変更点について事前に必ず内容をご確認ください。",
            dropboxUrl: "https://www.dropbox.com/scl/fi/29parxir6y2g7f6ja63he/CR.jpg?rlkey=yz7ll3pi6yzdph2qvkb9ch3w7&st=lwvssfiw&dl=0"
        },
        {
            id: "agree-br",
            name: "海外取引に関する注意条鋼",
            description: "BR関連のガイドラインおよび詳細仕様書です。運用上の重要な注意事項が記載されているため、ダウンロードして手元で保管してください。",
            dropboxUrl: "https://www.dropbox.com/scl/fi/7w4nft2fong97nxjg9cxe/BR.jpg?rlkey=43ekuwac6i1y5ol10ibrjdpn7&st=sc7hvor2&dl=0"
        },
        {
            id: "agree-nd2b",
            name: "顧客に対する法令",
            description: "ND2A/ND2Bシステムの同意文書および補足資料です。契約内容やセキュリティ規定の遵守事項について詳細が記載されています。",
            dropboxUrl: "https://www.dropbox.com/scl/fi/9x0sp9kcn90u5p4gsc66g/ND2A.jpg?rlkey=izpcm01n96lxrl8ajugoxz3i8&st=20wasjax&dl=0"
        },
    ];

    const handleDownload = (doc: DownloadDocument) => {
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


            {/* 2つ目のセクション */}
            <div className="card">
                <h3>Agreement:</h3>
                <div className="card-click">
                    {agreementdocuments.map((doc) => (
                        <div
                            key={doc.id}
                            className="stats-card"
                            onClick={() => handleDownload(doc)}
                        >
                            <h2>Download</h2>
                            <span className="badge bg-primary fs-6 px-3 py-1">
                                {doc.name}
                            </span>
                            <p className="card-description">
                                Summary:<br /> {doc.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
