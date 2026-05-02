import { useState } from "react";
import AuthField from "./AuthField";
import { Lock as LockIcon, User as UserIcon } from "lucide-react";
import { formatIdNumber, PASSWORD_REGEX, validID } from "./authUtils";

const INITIAL_LOGIN_FORM = {
  idNumber: "",
  password: "",
};

export default function LoginForm({ styles }) {
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateLoginForm = () => {
    const newErrors = {};
    const cleanedId = loginForm.idNumber.replace(/\D/g, "");

    if (!cleanedId) {
      newErrors.idNumber = "ID Number is required";
    } else if (!validID(cleanedId)) {
      newErrors.idNumber = "Please enter a valid Israeli ID number";
    }

    if (!loginForm.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!PASSWORD_REGEX.test(loginForm.password)) {
      newErrors.password =
        "Password must be at least 8 characters with uppercase letter, number, and special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: loginForm.idNumber.replace(/\D/g, ""),
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        setErrors({});
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

  return (
    <>
      {errors.submit && (
        <div className={styles.errorAlert}>{errors.submit}</div>
      )}

      <form onSubmit={handleLoginSubmit} className={styles.form}>
        <AuthField styles={styles} icon={UserIcon} error={errors.idNumber}>
          <input
            type="text"
            id="idNumber"
            className={`${styles.input} ${errors.idNumber ? styles.inputError : ""}`}
            placeholder="123456789"
            value={loginForm.idNumber}
            onChange={(event) => {
              const formatted = formatIdNumber(event.target.value);

              setLoginForm((currentForm) => ({
                ...currentForm,
                idNumber: formatted,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                idNumber: "",
                submit: "",
              }));
            }}
            disabled={isLoading}
            maxLength="9"
            inputMode="numeric"
          />
        </AuthField>

        <AuthField styles={styles} icon={LockIcon} error={errors.password}>
          <input
            type="password"
            id="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            placeholder="Enter your password"
            value={loginForm.password}
            onChange={(event) => {
              setLoginForm((currentForm) => ({
                ...currentForm,
                password: event.target.value,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                password: "",
                submit: "",
              }));
            }}
            disabled={isLoading}
          />
        </AuthField>

        <div className={styles.forgotPasswordContainer}>
          <button type="button" className={styles.forgotPasswordLink}>
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </>
  );
}
