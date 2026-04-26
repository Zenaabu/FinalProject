import React, { useState } from "react";
import styles from "./Login.module.css";
import logo from "../../assets/bluemarsLogo.png";

const Login = () => {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Israeli ID validation function
  const validID = (id) => {
    if (id.length !== 9) return false;
    const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1];
    const digits = id.split("").map(Number);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let product = digits[i] * weights[i];
      if (product > 9) {
        product = Math.floor(product / 10) + (product % 10);
      }
      sum += product;
    }
    return sum % 10 === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    const cleanedId = idNumber.replace(/\D/g, "");
    if (!cleanedId) {
      newErrors.idNumber = "ID Number is required";
    } else if (!validID(cleanedId)) {
      newErrors.idNumber = "Please enter a valid Israeli ID number";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters with uppercase letter, number, and special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: idNumber.replace(/\D/g, ""),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login
        console.log("Login successful:", data);
        // Redirect or update app state here
      } else {
        setErrors({
          submit: data.message || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      setErrors({ submit: "An error occurred. Please try again." });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    console.log("Redirect to forgot password");
    // window.location.href = '/forgot-password';
  };

  const formatIdNumber = (value) => {
    // Format ID number as the user types (XXX-XXX-XXX)
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.oceanWave} />

      <div className={styles.loginCard}>
        {/* Header with logo */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <img src={logo} alt="BlueMars" className={styles.logoImage} />
          </div>
        </div>

        {/* Error message */}
        {errors.submit && (
          <div className={styles.errorAlert}>{errors.submit}</div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* ID Number Field */}
          <div className={styles.formGroup}>
            <label htmlFor="idNumber" className={styles.label}>
              ID Number (ת"ז)
            </label>
            <input
              type="text"
              id="idNumber"
              className={`${styles.input} ${errors.idNumber ? styles.inputError : ""}`}
              placeholder="123-456-789"
              value={idNumber}
              onChange={(e) => {
                const formatted = formatIdNumber(e.target.value);
                setIdNumber(formatted);
                if (errors.idNumber) {
                  setErrors({ ...errors, idNumber: "" });
                }
              }}
              disabled={isLoading}
              maxLength="11"
            />
            {errors.idNumber && (
              <span className={styles.errorMessage}>{errors.idNumber}</span>
            )}
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              disabled={isLoading}
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className={styles.forgotPasswordContainer}>
            <button
              type="button"
              onClick={handleForgotPassword}
              className={styles.forgotPasswordLink}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Not a member?{" "}
            <a href="/register" className={styles.link}>
              Create an account
            </a>
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className={styles.wavesBottom} />
    </div>
  );
};

export default Login;
