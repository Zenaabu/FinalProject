// ─── EnrollReturn.jsx ─────────────────────────────────────────────────────────
// /user/courses/:course_id/paypal/return
// PayPal redirects the browser here after the user approves payment on their
// site, appending ?token=<order_id>&PayerID=<payer_id>. This page takes that
// token and completes the registration server-side.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import styles from "./EnrollReturn.module.css";

function EnrollReturn() {
  const { course_id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("capturing"); // capturing | success | error
  const [message, setMessage] = useState("");
  // captureOrder is not idempotent server-side (it registers the user once),
  // so StrictMode's double-invoke in dev must not fire it twice
  const captured = useRef(false);

  useEffect(() => {
    if (captured.current) return;
    captured.current = true;

    if (!token) {
      setStatus("error");
      setMessage(
        "Missing payment confirmation. Please try enrolling again from the catalog.",
      );
      return;
    }

    fetch(`/api/courses/${course_id}/paypal/capture-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: token }),
    })
      .then(async (res) => ({ ok: res.ok, data: await res.json() }))
      .then(({ ok, data }) => {
        if (!ok || !data.success) {
          throw new Error(data.message || "Payment could not be completed");
        }
        setStatus("success");
        setMessage(data.message || "You are registered for this course.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [course_id, token]);

  return (
    <div className={styles.page}>
      {status === "capturing" && (
        <div className={styles.card}>
          <p className={styles.status}>Finalizing your enrollment…</p>
        </div>
      )}

      {status === "success" && (
        <div className={`${styles.card} ${styles.cardSuccess}`}>
          <h1 className={styles.heading}>You're enrolled! 🎉</h1>
          <p className={styles.message}>{message}</p>
          <Link to="/user/courses" className={styles.link}>
            Back to Course Catalog
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className={`${styles.card} ${styles.cardError}`}>
          <h1 className={styles.heading}>Something went wrong</h1>
          <p className={styles.message}>{message}</p>
          <Link to="/user/courses" className={styles.link}>
            Back to Course Catalog
          </Link>
        </div>
      )}
    </div>
  );
}

export default EnrollReturn;
