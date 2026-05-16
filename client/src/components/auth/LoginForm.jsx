import { useState } from "react";
import AuthField from "./AuthField";
import {
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
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
import { toast } from "sonner";

const INITIAL_LOGIN_FORM = {
  idNumber: "",
  password: "",
};

export default function LoginForm({ styles, viewState, setViewState }) {
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

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

  const handleLoginSubmit = async () => {
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
      console.log(data);

      if (data.success) {
        toast.success(data.message || "Login successful!");
      } else {
        toast.error(
          data.message || "Login failed. Please check your credentials.",
        );
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForgotEmail = () => {
    const newErrors = {};
    if (!forgotEmail.trim()) {
      newErrors.forgotEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      newErrors.forgotEmail = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpCode = () => {
    const newErrors = {};
    if (!otpCode.trim()) {
      newErrors.otpCode = "OTP code is required";
    } else if (!/^\d{6}$/.test(otpCode)) {
      newErrors.otpCode = "OTP code must be exactly 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetPassword = () => {
    const newErrors = {};
    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      newErrors.newPassword =
        "Password must be at least 8 characters with uppercase letter, number, and special character";
    }
    if (!confirmNewPassword.trim()) {
      newErrors.confirmNewPassword = "Please confirm your new password";
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Placeholder: check if email exists in the database and send the OTP code
  const handleSendOTP = async (email) => {
    if (!validateForgotEmail()) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setViewState(VIEW_STATE.VERIFY_OTP);
        setErrors({});
        toast.success("OTP sent! Check the server console.");
      } else {
        toast.error(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
      console.error("Send OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder: validate the OTP code
  const handleVerifyOTP = async (code) => {
    if (!validateOtpCode()) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code }),
      });
      const data = await response.json();
      if (data.success) {
        setViewState(VIEW_STATE.RESET_PASSWORD);
        setErrors({});
      } else {
        toast.error(data.message || "Invalid OTP code. Please try again.");
      }
    } catch (error) {
      toast.error("Invalid OTP code. Please try again.");
      console.error("Verify OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder: submit the new password update
  const handleResetPassword = async (newPwd) => {
    if (!validateResetPassword()) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, newPassword: newPwd }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Password updated successfully!");
        setViewState(VIEW_STATE.LOGIN);
        setErrors({});
      } else {
        toast.error(
          data.message || "Failed to reset password. Please try again.",
        );
      }
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    switch (viewState) {
      case VIEW_STATE.LOGIN:
        handleLoginSubmit();
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
              placeholder="Enter your ID number"
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
          <AuthField
            styles={styles}
            icon={LockIcon}
            error={errors.password}
            endAdornment={
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOffIcon size={18} strokeWidth={1.8} />
                ) : (
                  <EyeIcon size={18} strokeWidth={1.8} />
                )}
              </button>
            }
          >
            <input
              type={showPassword ? "text" : "password"}
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
              endAdornment={
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowNewPassword((v) => !v)}
                  disabled={isLoading}
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOffIcon size={18} strokeWidth={1.8} />
                  ) : (
                    <EyeIcon size={18} strokeWidth={1.8} />
                  )}
                </button>
              }
            >
              <input
                type={showNewPassword ? "text" : "password"}
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
              endAdornment={
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmNewPassword((v) => !v)}
                  disabled={isLoading}
                  aria-label={
                    showConfirmNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmNewPassword ? (
                    <EyeOffIcon size={18} strokeWidth={1.8} />
                  ) : (
                    <EyeIcon size={18} strokeWidth={1.8} />
                  )}
                </button>
              }
            >
              <input
                type={showConfirmNewPassword ? "text" : "password"}
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
