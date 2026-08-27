// ─── ReportsKpiRow.jsx ────────────────────────────────────────────────────────
// Four KPI cards for the Reports & Analytics page, backed by
// GET /api/admin/reports/summary. Every number is scoped to the selected
// date range (default: this month), same convention as FinancialsKpiRow.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Users, UserCheck, CheckCircle2, Repeat } from "lucide-react";
import StatCard from "../../dashboard/stats/StatCard";
import styles from "./ReportsKpiRow.module.css";

function formatPct(value) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value * 10) / 10}%`;
}

function buildCards(summary) {
  return [
    {
      id: "total-registrations",
      label: "Total Registrations",
      value: summary ? summary.total_registrations.toLocaleString("en-US") : "—",
      sub: "In selected period",
      subColor: "#64748b",
      iconBg: "rgba(56, 189, 248, 0.12)",
      iconColor: "var(--color-ocean-text)",
      icon: <Users size={20} />,
    },
    {
      id: "active-customers",
      label: "Active Customers",
      value: summary ? summary.active_customers.toLocaleString("en-US") : "—",
      sub: "Distinct students who registered",
      subColor: "#64748b",
      iconBg: "rgba(124, 58, 237, 0.12)",
      iconColor: "#7c3aed",
      icon: <UserCheck size={20} />,
    },
    {
      id: "attendance-rate",
      label: "Attendance Rate",
      value: summary ? formatPct(summary.attendance_rate_pct) : "—",
      sub: "Of marked lessons, in period",
      subColor: "#64748b",
      iconBg: "rgba(34, 197, 94, 0.12)",
      iconColor: "#15803d",
      icon: <CheckCircle2 size={20} />,
    },
    {
      id: "repeat-bookings",
      label: "Repeat Instructor Bookings",
      value: summary ? summary.repeat_instructor_bookings.toLocaleString("en-US") : "—",
      sub: "2nd+ booking with same instructor",
      subColor: "#64748b",
      iconBg: "rgba(245, 158, 11, 0.12)",
      iconColor: "#b45309",
      icon: <Repeat size={20} />,
    },
  ];
}

function ReportsKpiRow({ startDate, endDate }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    setSummary(null);
    fetch(`/api/admin/reports/summary?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSummary(data.summary);
      })
      .catch(() => {
        // non-blocking: cards just keep showing placeholders
      });
  }, [startDate, endDate]);

  return (
    <div className={styles.row}>
      {buildCards(summary).map((c) => (
        <StatCard key={c.id} {...c} />
      ))}
    </div>
  );
}

export default ReportsKpiRow;
