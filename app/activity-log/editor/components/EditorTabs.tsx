import React from "react";
import { PageTabBtn, InputField, S, PagePath } from "./SharedUI";

export function ContentTab({ activePage, setActivePage, liveData, handleUpdateContent }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>サイト文言の編集</h2>
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
        {(["home", "about", "guidelines", "privacy", "en"] as PagePath[]).map(p => (
          <PageTabBtn key={p} active={activePage === p} onClick={() => setActivePage(p)}>
            {p.toUpperCase()}
          </PageTabBtn>
        ))}
      </div>

      <div style={S.formStack}>
        {/* --- HOME ページ --- */}
        {activePage === "home" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>メイン（HERO）エリア</h3>
              <InputField label="メインキャッチコピー" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} placeholder="つながる、生み出す、Nexus" />
              <InputField label="紹介サブテキスト" value={liveData.hero_copy || ""} onChange={(v: string) => handleUpdateContent("hero_copy", v)} textarea placeholder="意欲ある学生のためのコミュニティ..." />
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ABOUT（Nexusについて）エリア</h3>
              <InputField label="セクション見出し" value={liveData.about_title || ""} onChange={(v: string) => handleUpdateContent("about_title", v)} />
              <InputField label="本文段落 1" value={liveData.about_body_1 || ""} onChange={(v: string) => handleUpdateContent("about_body_1", v)} textarea />
              <InputField label="本文段落 2" value={liveData.about_body_2 || ""} onChange={(v: string) => handleUpdateContent("about_body_2", v)} textarea />
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ACTIVITY（活動内容）エリア</h3>
              <InputField label="セクション見出し" value={liveData.activity_title || ""} onChange={(v: string) => handleUpdateContent("activity_title", v)} />
              <InputField label="概要説明テキスト" value={liveData.activity_copy || ""} onChange={(v: string) => handleUpdateContent("activity_copy", v)} textarea />
            </div>
          </>
        )}

        {/* --- ABOUT ページ --- */}
        {activePage === "about" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ヘッダー</h3>
              <InputField label="ヘッダータイトル" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} />
            </div>

            {[1, 2, 3].map(i => (
              <div key={i} style={S.editorCard}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ブロック {i}</h3>
                <InputField label="ブロックタイトル" value={liveData[`block_${i}_title`] || ""} onChange={(v: string) => handleUpdateContent(`block_${i}_title`, v)} />
                <InputField label="ブロック本文" value={liveData[`block_${i}_body`] || ""} onChange={(v: string) => handleUpdateContent(`block_${i}_body`, v)} textarea />
              </div>
            ))}
          </>
        )}

        {/* --- GUIDELINES ページ --- */}
        {activePage === "guidelines" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ヘッダー・導入設定</h3>
              <InputField label="大見出しタイトル" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} />
              <InputField label="ガイドライン前文（導入テキスト）" value={liveData.intro_text || ""} onChange={(v: string) => handleUpdateContent("intro_text", v)} textarea />
            </div>

            {[1, 2, 3].map(num => (
              <div key={num} style={S.editorCard}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ガイドラインルール 0{num}</h3>
                <InputField label="ルールの見出し" value={liveData[`rule_${num}_title`] || ""} onChange={(v: string) => handleUpdateContent(`rule_${num}_title`, v)} />
                <InputField label="ルールの詳細本文" value={liveData[`rule_${num}_body`] || ""} onChange={(v: string) => handleUpdateContent(`rule_${num}_body`, v)} textarea />
              </div>
            ))}
          </>
        )}

        {/* --- PRIVACY ページ --- */}
        {activePage === "privacy" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ヘッダー設定</h3>
              <InputField label="タイトル" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} />
              <InputField label="最終更新日 (例: 最終更新日：2026年5月)" value={liveData.last_updated || ""} onChange={(v: string) => handleUpdateContent("last_updated", v)} />
            </div>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
              <div key={num} style={S.editorCard}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>セクション {num}</h3>
                <InputField label="条項のタイトル" value={liveData[`section_${num}_title`] || ""} onChange={(v: string) => handleUpdateContent(`section_${num}_title`, v)} />
                <InputField label="条項の本文" value={liveData[`section_${num}_body`] || ""} onChange={(v: string) => handleUpdateContent(`section_${num}_body`, v)} textarea />
              </div>
            ))}
          </>
        )}

        {/* --- ENGLISH ページ --- */}
        {activePage === "en" && (
          <div style={S.editorCard}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ENGLISH HERO</h3>
            <InputField label="Hero Title" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} />
            <InputField label="Hero Copy Text" value={liveData.hero_copy || ""} onChange={(v: string) => handleUpdateContent("hero_copy", v)} textarea />
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityTab({ state, setters, handlers, activities }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>活動記録の管理</h2>

      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
          {state.editingActivityId ? "📝 活動記録の編集" : "活動記録の作成"}
        </h3>
        
        <div style={S.formStack}>
          <InputField label="タイトル *" value={state.title} onChange={setters.setTitle} placeholder="第1回アイデア会議を開催しました" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <InputField label="日付 *" value={state.date} onChange={setters.setDate} />
            <div style={S.group}>
              <label style={S.fieldLabel}>カテゴリ *</label>
              <select style={S.select} value={state.category} onChange={(e) => setters.setCategory(e.target.value)}>
                <option value="NEWS">NEWS</option>
                <option value="PROJECT">PROJECT</option>
                <option value="DIALOGUE">DIALOGUE</option>
              </select>
            </div>
          </div>
          <InputField label="要約 (一覧に表示されます) *" value={state.summary} onChange={setters.setSummary} textarea placeholder="**太字** や [リンク](URL) などのマークダウン記法が使えます" />
          
          <div style={S.group}>
            <label style={S.fieldLabel}>サムネイル画像</label>
            <input type="file" accept="image/*" onChange={(e) => handlers.handleUpload(e, setters.setImageUrl)} style={{ fontSize: "0.85rem" }} />
            {state.uploading && <span style={{ fontSize: "0.75rem", color: "#888" }}>アップロード中...</span>}
            {state.imageUrl && (
              <div style={{ marginTop: "12px" }}>
                <img src={state.imageUrl} style={{ width: "120px", height: "67px", objectFit: "cover", borderRadius: "6px" }} />
              </div>
            )}
          </div>
          
          <InputField label="詳細内容 (本文) ※任意" value={state.content} onChange={setters.setContent} textarea large placeholder="## 大見出し&#13;### 中見出し&#13;- 箇条書き&#13;**太字** などが使用できます。" />
          <InputField label="URLスラッグ (例: project-kickoff) ※任意" value={state.slug} onChange={setters.setSlug} />
          
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button 
              onClick={() => handlers.handleSaveActivity(false)} 
              style={{...S.primaryBtn, background: "white", color: "#111", border: "2px solid #111"}} 
              disabled={state.publishing || !state.title}
            >
              下書き保存する
            </button>
            <button 
              onClick={() => handlers.handleSaveActivity(true)} 
              style={S.primaryBtn} 
              disabled={state.publishing || !state.title}
            >
              {state.editingActivityId ? "更新して公開" : "今すぐ公開する"}
            </button>
            {state.editingActivityId && (
              <button 
                onClick={handlers.cancelEditActivity} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white" }}
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "16px" }}>投稿済みの活動記録一覧</h3>
      <div style={S.listContainer}>
        {!activities || activities.length === 0 ? <div style={S.emptyState}>投稿された活動記録はありません。</div> : 
          activities.map((act: any) => (
            <div key={act.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ display: "flex", width: "100%", gap: "16px" }}>
                {act.image_url ? (
                  <img src={act.image_url} style={{ width: "90px", height: "50px", objectFit: "cover", borderRadius: "6px" }} />
                ) : (
                  <div style={{ width: "90px", height: "50px", background: "#eee", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#999" }}>No Image</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 800, background: "#eee", padding: "2px 6px", borderRadius: "4px" }}>{act.category}</span>
                    <span style={{ fontSize: "0.75rem", color: "#888" }}>{act.date}</span>
                    <span style={{ background: act.is_published ? "#e6ffe6" : "#f0f0f0", color: act.is_published ? "#006600" : "#666", padding: "2px 6px", borderRadius: "8px", fontSize: "0.6rem", fontWeight: 800 }}>
                      {act.is_published ? "公開中" : "下書き"}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{act.title}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => handlers.startEditActivity(act)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px" }}
                >
                  📝 編集
                </button>
                <button 
                  onClick={() => handlers.handleTogglePublish('activities', act.id, !act.is_published)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px" }}
                >
                  {act.is_published ? "非公開にする" : "公開する"}
                </button>
                <button onClick={() => handlers.handleDelete('activities', act.id)} style={S.dangerBtn}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export function MembersTab({ state, setters, handlers }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>メンバー管理</h2>
      
      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
          {state.editingMemberId ? "📝 メンバー情報の編集" : "メンバーの追加"}
        </h3>
        <div style={S.formStack}>
          <div style={S.group}>
            <label style={S.fieldLabel}>顔写真</label>
            <input type="file" accept="image/*" onChange={(e) => handlers.handleUpload(e, setters.setMPhotoUrl)} />
            {state.mPhotoUrl && (
              <div style={{ marginTop: "12px" }}>
                <img src={state.mPhotoUrl} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
              </div>
            )}
          </div>
          <InputField label="氏名 *" value={state.mName} onChange={setters.setMName} />
          <InputField label="役割 (例: Founder)" value={state.mRole} onChange={setters.setMRole} />
          <InputField label="所属 (例: 〇〇大学)" value={state.mAffiliation} onChange={setters.setMAffiliation} />
          <InputField label="メッセージ" value={state.mMessage} onChange={setters.setMMessage} textarea />
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              onClick={handlers.handleSaveMember} 
              style={S.primaryBtn} 
              disabled={!state.mName}
            >
              {state.editingMemberId ? "更新して保存" : "追加する"}
            </button>
            {state.editingMemberId && (
              <button 
                onClick={handlers.cancelEditMember} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white" }}
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={S.listContainer}>
        {state.members.length === 0 ? <div style={S.emptyState}>登録メンバーがいません</div> : 
          state.members.map((m: any, index: number) => (
            <div key={m.id} style={S.listItem}>
              <img src={m.photo_url || "/nexus-icon.png"} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{m.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "4px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <span>{m.role}</span>
                  <span style={{ background: m.is_published ? "#e6ffe6" : "#f0f0f0", color: m.is_published ? "#006600" : "#666", padding: "2px 6px", borderRadius: "8px", fontSize: "0.6rem", fontWeight: 800 }}>
                    {m.is_published ? "公開中" : "非公開"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button 
                    onClick={() => handlers.handleMoveMember(index, 'up')} 
                    disabled={index === 0} 
                    style={{ background: index === 0 ? "#f0f0f0" : "white", border: "1px solid #ddd", cursor: index === 0 ? "not-allowed" : "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem" }}
                  >
                    ⬆️
                  </button>
                  <button 
                    onClick={() => handlers.handleMoveMember(index, 'down')} 
                    disabled={index === state.members.length - 1} 
                    style={{ background: index === state.members.length - 1 ? "#f0f0f0" : "white", border: "1px solid #ddd", cursor: index === state.members.length - 1 ? "not-allowed" : "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem" }}
                  >
                    ⬇️
                  </button>

                  <button 
                    onClick={() => handlers.startEditMember(m)} 
                    style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px" }}
                  >
                    📝 編集
                  </button>
                  <button 
                    onClick={() => handlers.handleTogglePublish('members', m.id, !m.is_published)} 
                    style={{...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px"}}>
                    {m.is_published ? "非公開" : "公開"}
                  </button>
                </div>
                <button onClick={() => handlers.handleDelete('members', m.id)} style={S.dangerBtn}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export function FaqTab({ state, setters, handlers }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>FAQ管理</h2>

      {state.faqs.length === 0 && (
        <div style={{ background: "#fdfbf8", border: "1px dashed var(--accent)", padding: "20px", borderRadius: "12px", marginBottom: "32px", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: "16px" }}>
            💡 現在、FAQデータが1件もありません。初期の標準テンプレートを自動投入しますか？
          </p>
          <button 
            onClick={handlers.handleInsertDefaultFaqs} 
            style={{ ...S.primaryBtn, display: "inline-flex", width: "auto", padding: "10px 24px" }}
          >
            初期データ（3件）を投入する
          </button>
        </div>
      )}

      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
          {state.editingFaqId ? "📝 FAQの編集" : "FAQの追加"}
        </h3>
        <div style={S.formStack}>
          <InputField label="質問 *" value={state.fQuestion} onChange={setters.setFQuestion} textarea />
          <InputField label="回答 *" value={state.fAnswer} onChange={setters.setFAnswer} textarea />
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              onClick={handlers.handleSaveFaq} 
              style={S.primaryBtn} 
              disabled={!state.fQuestion || !state.fAnswer}
            >
              {state.editingFaqId ? "更新して保存" : "追加する"}
            </button>
            {state.editingFaqId && (
              <button 
                onClick={handlers.cancelEditFaq} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white" }}
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={S.listContainer}>
        {state.faqs.length === 0 ? <div style={S.emptyState}>登録FAQがありません</div> : 
          state.faqs.map((f: any) => (
            <div key={f.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Q: {f.question}</div>
                <span style={{ background: f.is_published ? "#e6ffe6" : "#f0f0f0", color: f.is_published ? "#006600" : "#666", padding: "2px 6px", borderRadius: "8px", fontSize: "0.6rem", fontWeight: 800 }}>
                  {f.is_published ? "公開中" : "非公開"}
                </span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.5, marginTop: "8px" }}>A: {f.answer}</div>
              
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", width: "100%", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => handlers.startEditFaq(f)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px" }}
                >
                  📝 編集
                </button>
                <button 
                  onClick={() => handlers.handleTogglePublish('faqs', f.id, !f.is_published)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px" }}
                >
                  {f.is_published ? "非公開にする" : "公開する"}
                </button>
                <button onClick={() => handlers.handleDelete('faqs', f.id)} style={S.dangerBtn}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export function InquiriesTab({ inquiries, handleUpdateStatus }: { inquiries: any[], handleUpdateStatus: (id: string, status: string) => void }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <span style={{ background: "#e6f0ff", color: "#0066cc", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800 }}>🔵 対応中</span>;
      case "completed":
        return <span style={{ background: "#e6ffe6", color: "#006600", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800 }}>🟢 対応完了</span>;
      default:
        return <span style={{ background: "#fff0f0", color: "#cc0000", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800 }}>🟡 未対応</span>;
    }
  };

  return (
    <div>
      <h2 style={S.sectionTitle}>お問い合わせ履歴</h2>
      {inquiries.length === 0 ? (
        <div style={S.emptyState}>メッセージはありません。</div>
      ) : inquiries.map((i: any) => {
        const subject = encodeURIComponent(`【Nexus】お問い合わせへのご返信（件名: ${i.category}）`);
        const body = encodeURIComponent(`${i.name} 様\n\nお問い合わせいただきありがとうございます。\nNexus運営チームです。\n\n---\n\n`);
        const mailtoLink = `mailto:${i.email}?subject=${subject}&body=${body}`;

        return (
          <div key={i.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start", marginBottom: "24px", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#eee", padding: "4px 8px", borderRadius: "6px" }}>{i.category}</span>
                {getStatusBadge(i.status)}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(i.created_at).toLocaleString('ja-JP')}</span>
            </div>
            
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{i.name} 様</div>
            {i.organization && <div style={{ fontSize: "0.85rem", color: "#666" }}>{i.organization}</div>}
            
            <div style={{ fontSize: "0.9rem", color: "#333", lineHeight: 1.6, background: "#f8f7f4", padding: "16px", borderRadius: "8px", width: "100%", boxSizing: "border-box", whiteSpace: "pre-wrap" }}>
              {i.content}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "8px", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#666" }}>ステータス変更:</label>
                <select 
                  value={i.status || "unprocessed"} 
                  onChange={(e) => handleUpdateStatus(i.id, e.target.value)} 
                  style={{ ...S.select, width: "auto", padding: "4px 10px", fontSize: "0.8rem", height: "auto" }}
                >
                  <option value="unprocessed">🟡 未対応</option>
                  <option value="processing">🔵 対応中</option>
                  <option value="completed">🟢 対応完了</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>✉️ {i.email}</div>
                <a 
                  href={mailtoLink} 
                  style={{ 
                    background: "#111", color: "white", padding: "8px 16px", 
                    borderRadius: "8px", fontSize: "0.85rem", fontWeight: 800, 
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" 
                  }}
                >
                  ✉️ メールで返信する
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

