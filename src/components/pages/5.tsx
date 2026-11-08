import React, { useState } from "react";

type TemplateKey = "minutes" | "report" | "handover" | "issue";
type Quadrant = 1 | 2 | 3 | 4;

interface TemplateField {
    label: string;
    type: "input" | "textarea";
    placeholder: string;
}

interface TemplateDefinition {
    title: string;
    fields: TemplateField[];
}

export default function Routinejob() {
    // --- タブ切り替え ---
    const [activeTab, setActiveTab] = useState("checklist");

    // --- 1. チェックリストの状態 ---
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const checklistGroups = [
        {
            groupLabel: "🌅 朝のルーティン（始業時）",
            items: [
                { id: "c1", text: "メール・チャットの確認と緊急対応", tip: "返信不要なものはアーカイブ。今日対応するものにだけフラグを立てる" },
                { id: "c2", text: "タスクリストの更新・優先度の確認", tip: "前日の残タスクを確認し、今日の「最重要3件」を決める" },
                { id: "c3", text: "カレンダー・会議の事前確認", tip: "会議資料・アジェンダを事前に開いておく" },
            ],
        },
        {
            groupLabel: "📋 書類・レポート管理",
            items: [
                { id: "c4", text: "提出期限のある書類の確認", tip: "締切3日前アラートを設定しておくと安心" },
                { id: "c5", text: "ファイルの命名規則統一（日付_内容_バージョン）", tip: "例：20260312_月次報告_v2.xlsx — 検索性が劇的に上がる" },
                { id: "c6", text: "完了書類のフォルダ整理・アーカイブ", tip: "「完了」「進行中」「要確認」の3フォルダ体制が最もシンプル" },
            ],
        },
        {
            groupLabel: "📂 情報整理・ナレッジ",
            items: [
                { id: "c7", text: "会議・打ち合わせのメモをドキュメント化", tip: "「決定事項・担当者・期限」の3点セットで記録する" },
                { id: "c8", text: "FAQ・手順書の更新（変更があった場合）", tip: "「あの手順どこだっけ？」をゼロにする仕組み" },
                { id: "c9", text: "共有ドライブの不要ファイル整理（週1回）", tip: "毎週金曜10分だけ行う「デジタル断捨離」の習慣化" },
            ],
        },
        {
            groupLabel: "🌆 夕方のルーティン（終業時）",
            items: [
                { id: "c10", text: "未完了タスクの翌日への引き継ぎメモ作成", tip: "明日の自分へのメモ1〜3行。翌朝の立ち上がりが速くなる" },
                { id: "c11", text: "作業ファイルの保存・バックアップ確認", tip: "クラウド同期の完了を確認してから退席する" },
                { id: "c12", text: "デスクトップ・ダウンロードフォルダの整理", tip: "「とりあえず置き」をゼロにする習慣。5分で完了" },
            ],
        },
    ];

    const totalItems = checklistGroups.reduce((acc, g) => acc + g.items.length, 0);
    const doneItems = Object.values(checkedItems).filter(Boolean).length;
    const progressPercent = Math.round((doneItems / totalItems) * 100);

    const toggleCheck = (id: string) => {
        setCheckedItems((prev) => {
            const next = { ...prev, [id]: !prev[id] };
            const newDoneCount = Object.values(next).filter(Boolean).length;
            if (newDoneCount === totalItems) {
                showToast("🎉 本日のチェックリスト完了！お疲れ様でした");
            }
            return next;
        });
    };

    const resetChecklist = () => {
        setCheckedItems({});
    };

    // --- 2. テンプレートの状態 ---
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | null>(null);

    const templates: Record<TemplateKey, TemplateDefinition> = {
        minutes: {
            title: "📝 議事録",
            fields: [
                { label: "会議名", type: "input", placeholder: "例：月次定例会議" },
                { label: "日時", type: "input", placeholder: "例：2026年3月12日 14:00〜15:00" },
                { label: "参加者", type: "input", placeholder: "例：田中、佐藤、山田（計3名）" },
                { label: "議題・アジェンダ", type: "textarea", placeholder: "1.\n2.\n3." },
                { label: "決定事項", type: "textarea", placeholder: "・\n・" },
                { label: "アクションアイテム（担当者 / 期限）", type: "textarea", placeholder: "・〇〇の確認 → 田中 / 3/15まで\n・〇〇の作成 → 佐藤 / 3/20まで" },
                { label: "次回会議", type: "input", placeholder: "例：3月26日（水）14:00〜" },
            ],
        },
        report: {
            title: "📊 月次レポート",
            fields: [
                { label: "対象月", type: "input", placeholder: "例：2026年2月" },
                { label: "作成者", type: "input", placeholder: "" },
                { label: "主な実績・成果", type: "textarea", placeholder: "・\n・\n・" },
                { label: "課題・問題点", type: "textarea", placeholder: "・\n・" },
                { label: "来月の重点計画", type: "textarea", placeholder: "・\n・\n・" },
                { label: "特記事項・連絡事項", type: "textarea", placeholder: "" },
            ],
        },
        handover: {
            title: "🔄 業務引き継ぎ書",
            fields: [
                { label: "業務名", type: "input", placeholder: "例：請求書処理業務" },
                { label: "引き継ぎ元 → 先", type: "input", placeholder: "例：田中 → 佐藤" },
                { label: "引き継ぎ期間", type: "input", placeholder: "例：2026年3月12日〜3月31日" },
                { label: "業務の概要と目的", type: "textarea", placeholder: "何を、なぜ、どのくらいの頻度で行うか" },
                { label: "手順・進め方", type: "textarea", placeholder: "1. \n2. \n3. " },
                { label: "関連ファイル・ツール", type: "textarea", placeholder: "場所・アクセス方法など" },
                { label: "注意事項・よくあるミス", type: "textarea", placeholder: "・\n・" },
            ],
        },
        issue: {
            title: "⚠️ 課題管理票",
            fields: [
                { label: "課題タイトル", type: "input", placeholder: "" },
                { label: "発生日", type: "input", placeholder: "例：2026年3月12日" },
                { label: "担当者", type: "input", placeholder: "" },
                { label: "課題の詳細", type: "textarea", placeholder: "いつ・どこで・何が起きたか" },
                { label: "原因分析", type: "textarea", placeholder: "暫定原因：\n根本原因：" },
                { label: "対応策・解決策", type: "textarea", placeholder: "短期対応：\n恒久対応：" },
                { label: "ステータス", type: "input", placeholder: "例：対応中 ／ 解決済み" },
            ],
        },
    };

    // --- 3. ナレッジ管理の状態 ---
    const kbData = [
        { id: 1, cat: "procedure", tag: "手順書", tagClass: "", title: "請求書処理の手順", preview: "毎月末締め。システムへの入力手順と、承認フローの詳細。担当者変更時の注意点を含む。", date: "2026/03/01 更新" },
        { id: 2, cat: "faq", tag: "FAQ", tagClass: "blue", title: "社内システムのパスワードリセット方法", preview: "情報システム部への連絡なしに自分でリセット可能。手順はポータルの「セキュリティ」から。", date: "2026/02/15 更新" },
        { id: 3, cat: "procedure", tag: "手順書", tagClass: "", title: "新入社員の備品申請フロー", preview: "PCや文房具の申請先、承認者、納期の目安を記載。緊急時の連絡先も掲載。", date: "2026/01/20 更新" },
        { id: 4, cat: "faq", tag: "FAQ", tagClass: "blue", title: "交通費精算のよくある質問", preview: "IC カード払いと現金払いで処理が異なる。週次まとめ申請が基本ルール。", date: "2025/12/01 更新" },
        { id: 5, cat: "template", tag: "テンプレ", tagClass: "green", title: "社外向けメールのひな型集", preview: "初回連絡・お礼・お詫び・依頼など、シーン別のひな型テンプレート集。", date: "2026/02/28 更新" },
        { id: 6, cat: "rule", tag: "ルール", tagClass: "", title: "ファイル命名規則（全社共通）", preview: "日付_部署名_内容_v番号.拡張子 の形式。検索性向上のため全員遵守必須。", date: "2026/01/05 更新" },
    ];

    const [currentCat, setCurrentCat] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredKnowledge = kbData.filter((d) => {
        const catMatch = currentCat === "all" || d.cat === currentCat;
        const searchMatch = !searchQuery || d.title.includes(searchQuery) || d.preview.includes(searchQuery);
        return catMatch && searchMatch;
    });

    // --- 4. 優先度マトリクスの状態 ---
    const [tasks, setTasks] = useState<Record<Quadrant, string[]>>({ 1: [], 2: [], 3: [], 4: [] });
    const [taskInputs, setTaskInputs] = useState<Record<Quadrant, string>>({ 1: "", 2: "", 3: "", 4: "" });

    const handleAddTask = (e: React.KeyboardEvent<HTMLInputElement>, q: Quadrant) => {
        if (e.key !== "Enter") return;
        const val = e.currentTarget.value.trim();
        if (!val) return;
        setTasks((prev) => ({
            ...prev,
            [q]: [...prev[q], val],
        }));
        setTaskInputs((prev) => ({ ...prev, [q]: "" }));
    };

    const removeTask = (q: Quadrant, i: number) => {
        setTasks((prev) => ({
            ...prev,
            [q]: prev[q].filter((_, index) => index !== i),
        }));
    };

    const totalTaskCount = Object.values(tasks).reduce((acc, arr) => acc + arr.length, 0);
    const urgentCount = tasks[1].length;

    // --- トースト通知の状態 ---
    const [toastMessage, setToastMessage] = useState("");
    const [isToastShow, setIsToastShow] = useState(false);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setIsToastShow(true);
        setTimeout(() => setIsToastShow(false), 2800);
    };

    // --- タブ定義 ---
    const tabs = [
        { id: "checklist", name: "✅ 日次チェックリスト", desc: "クリックでチェック ／ 進捗バーで達成率を確認" },
        { id: "template", name: "📄 書類テンプレート", desc: "よく使う書類の雛形を選んで、すぐに記入できます" },
        { id: "knowledge", name: "📚 ナレッジ管理", desc: "社内の手順・ノウハウを整理していつでも参照" },
        { id: "time", name: "⏱ 優先度マトリクス", desc: "アイゼンハワー・マトリクスでタスクを4象限に分類" },
    ];

    return (
        <>
            <div className="accent-bar">
            <div>
                <h2>業務効率化ツールキット</h2>
                {/*<p>バックオフィス向け ／ 情報整理 & 書類作成</p>*/}
                </div></div>

            {/* タブナビゲーション（カード型） */}
            <nav>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={activeTab === tab.id ? "active" : ""}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.name}
                    </button>
                ))}
            </nav>

            <div className="container" style={{ marginTop: "20px" }}>

                {/* TAB 1: チェックリスト */}
                {activeTab === "checklist" && (
                    <div id="tab-checklist" className="tab active">
                        <div className="section-title">日次業務チェックリスト</div>
                        <div className="section-sub">クリックでチェック ／ 進捗バーで達成率を確認</div>

                        <div className="progress-wrap">
                            <div className="progress-label">
                                <span>本日の進捗</span>
                                <span id="progress-text">{doneItems} / {totalItems} 完了</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    id="progress-fill"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        </div>

                        {checklistGroups.map((group, gIndex) => (
                            <div className="checklist-group" key={gIndex}>
                                <div className="group-label">{group.groupLabel}</div>
                                {group.items.map((item) => {
                                    const isDone = !!checkedItems[item.id];
                                    return (
                                        <div
                                            key={item.id}
                                            className={`check-item ${isDone ? "done" : ""}`}
                                            onClick={() => toggleCheck(item.id)}
                                        >
                                            <div className="ci-box">
                                                <span className="ci-check">✓</span>
                                            </div>
                                            <div className="ci-content">
                                                <div className="ci-text">{item.text}</div>
                                                <div className="ci-tip">{item.tip}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        <button className="btn btn-ghost" onClick={resetChecklist} style={{ marginTop: "8px" }}>
                            🔄 リセット
                        </button>
                    </div>
                )}

                {/* TAB 2: 書類テンプレート */}
                {activeTab === "template" && (
                    <div id="tab-template" className="tab active">
                        <div className="section-title">書類テンプレート</div>
                        <div className="section-sub">よく使う書類の雛形を選んで、すぐに記入できます</div>

                        <div className="template-grid">
                            {(Object.keys(templates) as TemplateKey[]).map((key) => {
                                const t = templates[key];
                                return (
                                    <div
                                        key={key}
                                        className={`tmpl-card ${selectedTemplate === key ? "selected" : ""}`}
                                        onClick={() => {
                                            setSelectedTemplate(key);
                                            showToast(`「${t.title}」を選択しました`);
                                        }}
                                    >   
                                        <div className="tmpl-top">
                                        <div className="tmpl-icon">{t.title.split(" ")[0]}</div>
                                        <div className="tmpl-name">{t.title.split(" ")[1]}</div>
                                        </div>
                                        <div className="tmpl-desc">会議の決定事項や項目を素早く入力・記録</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div id="template-output" className={`template-output ${selectedTemplate ? "show" : ""}`}>
                            {selectedTemplate && (
                                <div>
                                    <div className="tmpl-out-title">{templates[selectedTemplate].title}</div>
                                    {templates[selectedTemplate].fields.map((f, i) => (
                                        <div className="tmpl-field" key={i}>
                                            <label>{f.label}</label>
                                            {f.type === "input" ? (
                                                <input type="text" placeholder={f.placeholder} />
                                            ) : (
                                                <textarea rows={4} placeholder={f.placeholder}></textarea>
                                            )}
                                        </div>
                                    ))}
                                    <div className="btn-row">
                                        <button className="btn" onClick={() => showToast("📋 内容をコピーしました（仮）")}>📋 コピー</button>
                                        <button className="btn btn-ghost" onClick={() => showToast("💾 保存機能は準備中です")}>💾 保存</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: ナレッジ管理 */}
                {activeTab === "knowledge" && (
                    <div id="tab-knowledge" className="tab active">
                        <div className="section-title">ナレッジ管理</div>
                        <div className="section-sub">社内の手順・ノウハウを整理して、いつでも参照できる状態に</div>

                        <div className="knowledge-layout">
                            <div className="kb-sidebar">
                                <div className="kb-cat-title">カテゴリ</div>
                                {[
                                    { id: "all", label: "すべて", icon: "📋", count: kbData.length },
                                    { id: "procedure", label: "手順書", icon: "⚙️", count: kbData.filter(d => d.cat === "procedure").length },
                                    { id: "faq", label: "FAQ", icon: "❓", count: kbData.filter(d => d.cat === "faq").length },
                                    { id: "template", label: "テンプレ", icon: "📄", count: kbData.filter(d => d.cat === "template").length },
                                    { id: "rule", label: "ルール", icon: "📌", count: kbData.filter(d => d.cat === "rule").length },
                                ].map((cat) => (
                                    <div
                                        key={cat.id}
                                        className={`kb-cat ${currentCat === cat.id ? "active" : ""}`}
                                        onClick={() => setCurrentCat(cat.id)}
                                    >
                                        <span className="kb-cat-icon">{cat.icon}</span> {cat.label} ({cat.count})
                                    </div>
                                ))}
                            </div>

                            <div className="kb-main">
                                <div className="kb-search-wrap">
                                    <span className="kb-search-icon">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="キーワードで検索..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="kb-cards" id="kb-cards">
                                    {filteredKnowledge.length > 0 ? (
                                        filteredKnowledge.map((d) => (
                                            <div key={d.id} className="kb-card" onClick={() => showToast(`「${d.title}」を開きます（仮）`)}>
                                                <div className="kb-card-header">
                                                    <span className={`kb-card-tag ${d.tagClass}`}>{d.tag}</span>
                                                    <span className="kb-card-title">{d.title}</span>
                                                </div>
                                                <div className="kb-card-preview">{d.preview}</div>
                                                <div className="kb-card-meta">🕐 {d.date}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="kb-empty-notice">該当するナレッジが見つかりません</div>
                                    )}
                                </div>
                                <button className="btn btn-ghost kb-add-btn" onClick={() => showToast("新規ナレッジの追加機能は準備中です")}>
                                    ＋ 新しいナレッジを追加
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: 優先度マトリクス */}
                {activeTab === "time" && (
                    <div id="tab-time" className="tab active">
                        <div className="section-title">優先度マトリクス</div>
                        <div className="section-sub">アイゼンハワー・マトリクスでタスクを4象限に分類する</div>
                        
                        <div className="time-mtx">
                            <div className="time-grid">
                                <div className="time-card">
                                    <div className="tc-label">本日のタスク数</div>
                                    <div className="tc-value" id="task-count">{totalTaskCount}</div>
                                    <div className="tc-sub">マトリクスに入力したタスク</div>
                                </div>
                                <div className="time-card">
                                    <div className="tc-label">今すぐやるべきこと</div>
                                    <div className="tc-value is-accent" id="urgent-count">{urgentCount}</div>
                                    <div className="tc-sub">重要 × 緊急のタスク数</div>
                                </div>
                            </div>
                        

                        <div className="eisenhower" id="matrix">
                            {([
                                { q: 1, title: "重要 × 緊急", badge: "今すぐ" },
                                { q: 2, title: "重要 × 非緊急", badge: "計画的に" },
                                { q: 3, title: "非重要 × 緊急", badge: "委任" },
                                { q: 4, title: "非重要 × 非緊急", badge: "削除" },
                            ] as { q: Quadrant; title: string; badge: string }[]).map((cell) => (
                                <div className="ei-cell" key={cell.q}>
                                    <div className="ei-title">
                                        {cell.title} <span className="ei-badge">{cell.badge}</span>
                                    </div>
                                    <div id={`q${cell.q}-tasks`}>
                                        {tasks[cell.q].map((t, i) => (
                                            <div key={i} className="ei-task" onClick={() => removeTask(cell.q, i)}>
                                                ✕ {t}
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        className="ei-input"
                                        placeholder="タスクを入力してEnter"
                                        value={taskInputs[cell.q]}
                                        onChange={(e) => setTaskInputs({ ...taskInputs, [cell.q]: e.target.value })}
                                        onKeyDown={(e) => handleAddTask(e, cell.q)}
                                    />
                                </div>
                            ))}
                        </div>
                        </div>
                        <p className="matrix-footer-note">各セルの入力欄にタスクを記入してEnterキーで追加できます</p>
                    </div>
                )}

                {/* 簡易トースト表示エリア */}
                <div id="toast" className={`toast ${isToastShow ? "show" : ""}`}>
                    {toastMessage}
                </div>
            </div>
            </>
            )}
