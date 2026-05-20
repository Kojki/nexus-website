"use client";

import React, { useEffect, useState } from "react";
import { S } from "./SharedUI";
import { PERMISSION_LABELS, ROLE_DEFAULT_PERMISSIONS, ROLE_LABELS as ROLE_DISPLAY_NAMES } from "../hooks/useEditorData";

const ROLES = ["owner", "editor", "project_manager", "public_relations", "proposer", "visitor"] as const;

type RoleId = (typeof ROLES)[number];

type Props = {
  rolePermissions: Record<string, string[]>;
  onSaveRolePermissions: (roleId: string, permissions: string[]) => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

export function RoleSettingsTab({ rolePermissions, onSaveRolePermissions, hasPermission }: Props) {
  const [localRolePermissions, setLocalRolePermissions] = useState<Record<string, string[]>>(rolePermissions);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  useEffect(() => {
    setLocalRolePermissions(rolePermissions);
  }, [rolePermissions]);

  const handleToggle = (roleId: RoleId, permission: string) => {
    setLocalRolePermissions((prev) => {
      const current = prev[roleId] || [];
      const next = current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission];
      return { ...prev, [roleId]: next };
    });
  };

  const handleSave = async (roleId: RoleId) => {
    setSavingRole(roleId);
    await onSaveRolePermissions(roleId, localRolePermissions[roleId] || []);
    setSavingRole(null);
  };

  const sortedPermissions = Object.keys(PERMISSION_LABELS) as Array<keyof typeof PERMISSION_LABELS>;

  return (
    <div>
      <h2 style={S.sectionTitle}>👑 役職設定</h2>
      <div style={{ ...S.editorCard, padding: "28px" }}>
        <p style={{ color: "#555", fontSize: "0.96rem", lineHeight: 1.7, marginBottom: "24px" }}>
          各役職のデフォルト権限をオーナーが管理します。ここで変更した内容は、役職変更時に自動的に割り当てられるデフォルト権限に反映されます。
        </p>

        <div style={{ display: "grid", gap: "24px" }}>
          {ROLES.map((roleId) => (
            <div key={roleId} style={{ border: "1px solid var(--border)", borderRadius: "20px", padding: "20px", background: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 900, marginBottom: "6px" }}>{ROLE_DISPLAY_NAMES[roleId] || roleId}（{roleId}）</div>
                  <div style={{ color: "#777", fontSize: "0.85rem" }}>
                    {roleId === "owner" ? "システムの最高権限です。すべての権限を管理できます。" : roleId === "editor" ? "編集者はコンテンツ編集・公開、および問い合わせ対応ができます。" : roleId === "project_manager" ? "PJマネージャーはプロジェクト管理と記事公開を調整できます。" : roleId === "public_relations" ? "広報担当は問い合わせ対応と情報発信の管理を行います。" : roleId === "proposer" ? "提案者は編集提案を送信できます。" : roleId === "visitor" ? "訪問者は提案者と同じ画面を見られますが、編集や保存の操作はできません。" : ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSave(roleId)}
                  disabled={savingRole !== null || !hasPermission("manage_roles_unlimited")}
                  style={{
                    ...S.primaryBtn,
                    background: hasPermission("manage_roles_unlimited") ? "#111" : "#ddd",
                    cursor: hasPermission("manage_roles_unlimited") ? "pointer" : "not-allowed",
                    padding: "10px 20px",
                    fontSize: "0.9rem"
                  }}
                >
                  {savingRole === roleId ? "保存中…" : "この役職を保存"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                {sortedPermissions.map((permKey) => {
                  const info = PERMISSION_LABELS[permKey];
                  const currentPerms = localRolePermissions[roleId] || ROLE_DEFAULT_PERMISSIONS[roleId] || [];
                  const isChecked = currentPerms.includes(permKey);

                  return (
                    <label key={`${roleId}-${permKey}`} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px", borderRadius: "14px", border: "1px solid #eee", cursor: "pointer", background: isChecked ? "#f8f9ff" : "white" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(roleId, permKey)}
                        style={{ marginTop: "4px", width: "16px", height: "16px" }}
                      />
                      <div style={{ fontSize: "0.85rem", color: "#333" }}>
                        <div style={{ fontWeight: 800 }}>{info.label}</div>
                        <div style={{ color: "#666", fontSize: "0.78rem", lineHeight: 1.5 }}>{info.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
