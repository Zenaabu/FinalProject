import { useState } from "react";
import AuthField from "./AuthField";
import {
  Key as KeyIcon,
  Lock as LockIcon,
  Mail as MailIcon,
  User as UserIcon,
} from "lucide-react";
import {
  formatIdNumber,
  PASSWORD_REGEX,
  validID,
  VIEW_STATE,
} from "./authUtils";

const INITIAL_LOGIN_FORM = {
  idNumber: "",
  password: "",
};

export default function LoginForm({ styles, viewState, setViewState }) {
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

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

  // Placeholder: check if email exists in the database and send the OTP code
  const handleSendOTP = async (email) => {
    setIsLoading(true);
    try {
      // TODO: implement API call to verify email and send OTP
      setViewState(VIEW_STATE.VERIFY_OTP);
      setErrors({});
    } catch (error) {
      setErrors({ submit: "Failed to send OTP. Please try again." });
      console.error("Send OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder: validate the OTP code
  const handleVerifyOTP = async (code) => {
    setIsLoading(true);
    try {
      // TODO: implement OTP verification API call
      setViewState(VIEW_STATE.RESET_PASSWORD);
      setErrors({});
    } catch (error) {
      setErrors({ submit: "Invalid OTP code. Please try again." });
      console.error("Verify OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder: submit the new password update
  const handleResetPassword = async (newPwd) => {
    setIsLoading(true);
    try {
      // TODO: implement password reset API call
      setViewState(VIEW_STATE.LOGIN);
      setErrors({});
    } catch (error) {
      setErrors({ submit: "Failed to reset password. Please try again." });
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    switch (viewState) {
      case VIEW_STATE.LOGIN:
        handleLoginSubmit(event);
        break;
      case VIEW_STATE.ENTER_EMAIL:
        handleSendOTP(forgotEmail);
        break;
      case VIEW_STATE.VERIFY_OTP:
        handleVerifyOTP(otpCode);
        break;
      case VIEW_STATE.RESET_PASSWORD:
        handleResetPassword(newPassword);
        break;
      default:
        break;
    }
  };

  const submitButtonLabel = (() => {
    if (isLoading) {
      switch (viewState) {
        case VIEW_STATE.ENTER_EMAIL:
          return "Sending OTP...";
        case VIEW_STATE.VERIFY_OTP:
          return "Verifying...";
        case VIEW_STATE.RESET_PASSWORD:
          return "Saving...";
        default:
          return "Logging in...";
      }
    }
    switch (viewState) {
      case VIEW_STATE.ENTER_EMAIL:
        return "Send OTP";
      case VIEW_STATE.VERIFY_OTP:
        return "Verify Code";
      case VIEW_STATE.RESET_PASSWORD:
        return "Save New Password";
      default:
        return "Login";
    }
  })();

  return (
    <>
      {errors.submit && (
        <div className={styles.errorAlert}>{errors.submit}</div>
      )}

      <form onSubmit={handleFormSubmit} className={styles.form}>
        {viewState === VIEW_STATE.LOGIN && (
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
        )}

        {viewState === VIEW_STATE.ENTER_EMAIL && (
          <AuthField styles={styles} icon={MailIcon} error={errors.forgotEmail}>
            <input
              type="email"
              id="forgotEmail"
              className={`${styles.input} ${errors.forgotEmail ? styles.inputError : ""}`}
              placeholder="Enter your email address"
              value={forgotEmail}
              onChange={(event) => {
                setForgotEmail(event.target.value);
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  forgotEmail: "",
                  submit: "",
                }));
              }}
              disabled={isLoading}
            />
          </AuthField>
        )}

        {viewState === VIEW_STATE.LOGIN && (
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
        )}

        {viewState === VIEW_STATE.VERIFY_OTP && (
          <AuthField styles={styles} icon={KeyIcon} error={errors.otpCode}>
            <input
              type="text"
              id="otpCode"
              className={`${styles.input} ${errors.otpCode ? styles.inputError : ""}`}
              placeholder="Enter OTP code"
              value={otpCode}
              onChange={(event) => {
                setOtpCode(event.target.value);
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  otpCode: "",
                  submit: "",
                }));
              }}
              disabled={isLoading}
              maxLength="6"
              inputMode="numeric"
            />
          </AuthField>
        )}

        {viewState === VIEW_STATE.RESET_PASSWORD && (
          <>
            <AuthField
              styles={styles}
              icon={LockIcon}
              error={errors.newPassword}
            >
              <input
                type="password"
                id="newPassword"
                className={`${styles.input} ${errors.newPassword ? styles.inputError : ""}`}
                placeholder="New password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setErrors((currentErrors) => ({
                    ...currentErrors,
                    newPassword: "",
                    submit: "",
                  }));
                }}
                disabled={isLoading}
              />
            </AuthField>

            <AuthField
              styles={styles}
              icon={LockIcon}
              error={errors.confirmNewPassword}
            >
              <input
                type="password"
                id="confirmNewPassword"
                className={`${styles.input} ${errors.confirmNewPassword ? styles.inputError : ""}`}
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(event) => {
                  setConfirmNewPassword(event.target.value);
                  setErrors((currentErrors) => ({
                    ...currentErrors,
                    confirmNewPassword: "",
                    submit: "",
                  }));
                }}
                disabled={isLoading}
              />
            </AuthField>
          </>
        )}

        {viewState === VIEW_STATE.LOGIN && (
          <div className={styles.forgotPasswordContainer}>
            <button
              type="button"
              className={styles.forgotPasswordLink}
              onClick={() => {
                setViewState(VIEW_STATE.ENTER_EMAIL);
                setErrors({});
              }}
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className={styles.loginButton}
          disabled={isLoading}
        >
          {submitButtonLabel}
        </button>
      </form>
    </>
  );
}
