// ─── FinancialsKpiRow.jsx ─────────────────────────────────────────────────────
// Four KPI cards for the Financials page, backed by GET /api/admin/financials/summary.
// Reuses the same StatCard used on the dashboard home so the two pages read as
// one system.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Receipt, Wallet } from "lucide-react";
import StatCard from "../../dashboard/stats/StatCard";
import styles from "./FinancialsKpiRow.module.css";

function formatCurrency(value) {
  return `₪${Math.round(Number(value)).toLocaleString("en-US")}`;
}

function formatPct(value) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function buildCards(summary) {
  const changePct = summary?.month_change_pct;
  const hasChange = changePct !== null && changePct !== undefined;
  const isUp = hasChange && changePct >= 0;

  return [
    {
      id: "total-revenue",
      label: "Total Revenue",
      value: summary ? formatCurrency(summary.total_revenue) : "—",
      sub: summary ? `${summary.total_transactions} transactions, all time` : "",
      subColor: "#64748b",
      iconBg: "rgba(34, 197, 94, 0.12)",
      iconColor: "#15803d",
      icon: <DollarSign size={20} />,
    },
    {
      id: "month-revenue",
      label: "This Month",
      value: summary ? formatCurrency(summary.month_revenue) : "—",
      sub: hasChange ? `${formatPct(changePct)} vs last month` : "No data last month",
      subColor: hasChange ? (isUp ? "#15803d" : "#dc2626") : "#64748b",
      iconBg: "rgba(56, 189, 248, 0.12)",
      iconColor: "var(--color-ocean-text)",
      icon: hasChange && !isUp ? <TrendingDown size={20} /> : <TrendingUp size={20} />,
    },
    {
      id: "vat-collected",
      label: "VAT Collected",
      value: summary ? formatCurrency(summary.vat_collected_month) : "—",
      sub: "This month",
      subColor: "#64748b",
      iconBg: "rgba(139, 92, 246, 0.12)",
      iconColor: "#7c3aed",
      icon: <Receipt size={20} />,
    },
    {
      id: "avg-order",
      label: "Avg. Order Value",
      value: summary ? formatCurrency(summary.avg_order_value) : "—",
      sub: "Per registration, all time",
      subColor: "#64748b",
      iconBg: "rgba(245, 158, 11, 0.12)",
      iconColor: "#b45309",
      icon: <Wallet size={20} />,
    },
  ];
}

function FinancialsKpiRow() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch("/api/admin/financials/summary")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSummary(data.summary);
      })
      .catch(() => {
        // non-blocking: cards just keep showing placeholders
      });
  }, []);

  return (
    <div className={styles.row}>
      {buildCards(summary).map((c) => (
        <StatCard key={c.id} {...c} />
      ))}
    </div>
  );
}

export default FinancialsKpiRow;
