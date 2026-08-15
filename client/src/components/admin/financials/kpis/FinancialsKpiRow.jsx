// ─── FinancialsKpiRow.jsx ─────────────────────────────────────────────────────
// Four KPI cards for the Financials page, backed by GET /api/admin/financials/summary.
// Every number is scoped to the selected date range (default: this month) —
// no all-time figures, since the admin's whole point in picking a range is
// to see that period and nothing else.
// Reuses the same StatCard used on the dashboard home so the two pages read as
// one system.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { DollarSign, TrendingUp, TrendingDown, Receipt, Wallet, Pencil } from "lucide-react";
import StatCard from "../../dashboard/stats/StatCard";
import VatEditModal from "../vatSettings/VatEditModal";
import styles from "./FinancialsKpiRow.module.css";

function formatCurrency(value) {
  return `₪${Math.round(Number(value)).toLocaleString("en-US")}`;
}

function formatPct(value) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function buildCards(summary, onVatClick) {
  const changePct = summary?.change_pct;
  const hasChange = changePct !== null && changePct !== undefined;
  const isUp = hasChange && changePct >= 0;

  return [
    {
      id: "period-revenue",
      label: "Revenue",
      value: summary ? formatCurrency(summary.period_revenue) : "—",
      sub: hasChange ? `${formatPct(changePct)} vs previous period` : "No data for previous period",
      subColor: hasChange ? (isUp ? "#15803d" : "#dc2626") : "#64748b",
      iconBg: "rgba(34, 197, 94, 0.12)",
      iconColor: "#15803d",
      icon: hasChange && !isUp ? <TrendingDown size={20} /> : <TrendingUp size={20} />,
    },
    {
      id: "period-transactions",
      label: "Transactions",
      value: summary ? summary.period_transactions.toLocaleString("en-US") : "—",
      sub: "In selected period",
      subColor: "#64748b",
      iconBg: "rgba(56, 189, 248, 0.12)",
      iconColor: "var(--color-ocean-text)",
      icon: <DollarSign size={20} />,
    },
    {
      id: "vat-collected",
      label: "VAT Collected",
      value: summary ? formatCurrency(summary.period_vat) : "—",
      sub: (
        <span className={styles.vatHint}>
          <Pencil size={12} strokeWidth={2.75} />
          Click here to change the VAT
        </span>
      ),
      subColor: "#7c3aed",
      iconBg: "rgba(139, 92, 246, 0.12)",
      iconColor: "#7c3aed",
      icon: <Receipt size={20} />,
      onClick: onVatClick,
    },
    {
      id: "avg-order",
      label: "Avg. Order Value",
      value: summary ? formatCurrency(summary.avg_order_value) : "—",
      sub: "Per registration, in period",
      subColor: "#64748b",
      iconBg: "rgba(245, 158, 11, 0.12)",
      iconColor: "#b45309",
      icon: <Wallet size={20} />,
    },
  ];
}

function FinancialsKpiRow({ startDate, endDate }) {
  const [summary, setSummary] = useState(null);
  const [isVatModalOpen, setIsVatModalOpen] = useState(false);

  const fetchSummary = useCallback(() => {
    fetch(
      `/api/admin/financials/summary?startDate=${startDate}&endDate=${endDate}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSummary(data.summary);
      })
      .catch(() => {
        // non-blocking: cards just keep showing placeholders
      });
  }, [startDate, endDate]);

  useEffect(() => {
    setSummary(null);
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className={styles.row}>
      {buildCards(summary, () => setIsVatModalOpen(true)).map((c) => (
        <StatCard key={c.id} {...c} />
      ))}

      {isVatModalOpen && (
        <VatEditModal
          onClose={() => setIsVatModalOpen(false)}
          onSaved={() => {
            setIsVatModalOpen(false);
            // the new rate changes every course's stored VAT, so the
            // period figures (revenue excl. VAT, VAT collected) shift too
            fetchSummary();
          }}
        />
      )}
    </div>
  );
}

export default FinancialsKpiRow;
