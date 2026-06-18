"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Client } from "@/types/app.types";
import { ProfileHeader } from "./profile-header";
import { InfoSidebar }   from "./info-sidebar";
import { TabActivity }   from "./tab-activity";
import { TabProjects }   from "./tab-projects";
import { TabDocuments }  from "./tab-documents";
import { TabInvoices }   from "./tab-invoices";
import { TabNotes }      from "./tab-notes";
import { ClientModal }   from "@/components/dashboard/clients/client-modal";

type Tab = "projects" | "documents" | "invoices" | "activity" | "notes";

interface Props {
  client: Client & { ownerName?: string };
  counts: { projects: number; invoices: number; documents: number };
  canManage: boolean;
}

export function ClientProfileShell({ client, counts, canManage }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [editOpen, setEditOpen] = useState(false);

  const TABS: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: "projects",  label: "Projects",  icon: "ti-layout-kanban", count: counts.projects  },
    { key: "documents", label: "Documents", icon: "ti-file-text",     count: counts.documents },
    { key: "invoices",  label: "Invoices",  icon: "ti-receipt",       count: counts.invoices  },
    { key: "activity",  label: "Activity",  icon: "ti-activity" },
    { key: "notes",     label: "Notes",     icon: "ti-notes" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      <ProfileHeader client={client} onEdit={() => setEditOpen(true)} />

      <div style={{ display: "flex", flex: 1 }}>
        <InfoSidebar client={client} />

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Tab bar */}
          <nav
            aria-label="Client sections"
            style={{ display: "flex", alignItems: "center", gap: 2, padding: "12px 24px 0", background: "#fff", borderBottom: "1px solid var(--pf-line)" }}
          >
            {TABS.map(t => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "9px 14px", border: "none", background: "none",
                    fontSize: 13.5, fontWeight: active ? 600 : 400,
                    color: active ? "var(--pf-text)" : "var(--pf-text-2)",
                    cursor: "pointer", fontFamily: "var(--font-inter)",
                    borderBottom: active ? "2px solid #4f46e5" : "2px solid transparent",
                    marginBottom: -1, transition: "color .15s",
                  }}
                >
                  <i className={`ti ${t.icon}`} aria-hidden="true" style={{ fontSize: 15 }} />
                  {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 99, background: active ? "#4f46e5" : "var(--pf-surface-2)", color: active ? "#fff" : "var(--pf-text-3)" }}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Tab panel */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            role="tabpanel"
            style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}
          >
            {activeTab === "projects"  && <TabProjects  clientId={client.id} />}
            {activeTab === "documents" && <TabDocuments clientId={client.id} />}
            {activeTab === "invoices"  && <TabInvoices  clientId={client.id} />}
            {activeTab === "activity"  && <TabActivity  clientId={client.id} />}
            {activeTab === "notes"     && <TabNotes     clientId={client.id} />}
          </motion.div>
        </div>
      </div>

      {canManage && (
        <ClientModal open={editOpen} onClose={() => setEditOpen(false)} client={client} />
      )}
    </div>
  );
}