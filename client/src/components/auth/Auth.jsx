import React, { useState } from "react";
import styles from "./Auth.module.css";
import logo from "../../assets/bluemarsLogo.png";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const iconStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStroke}>
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStroke}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStroke}>
    <path d="M22 16.9v2.5a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 1h2.5a2 2 0 0 1 2 1.7c.1.8.3 1.5.5 2.2a2 2 0 0 1-.5 2.1L7.5 8.1a16 16 0 0 0 8.4 8.4l1.1-1.1a2 2 0 0 1 2.1-.5c.7.2 1.4.4 2.2.5a2 2 0 0 1 1.7 1.5Z" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStroke}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStroke}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({
    idNumber: "",
    password: "",
  });
  const [signUpForm, setSignUpForm] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    birth_date: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  const getBirthDateError = (birthDate) => {
    if (!birthDate) {
      return "";
    }

    const selectedDate = new Date(`${birthDate}T00:00:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      return "Please select a valid birth date";
    }

    const today = new Date();
    let age = today.getFullYear() - selectedDate.getFullYear();
    const monthDifference = today.getMonth() - selectedDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < selectedDate.getDate())
    ) {
      age -= 1;
    }

    if (age < 18) {
      return "You must be at least 18 years old to sign up";
    }

    return "";
  };

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

  const validateSignUpForm = () => {
    const newErrors = {};
    const cleanedId = signUpForm.user_id.replace(/\D/g, "");
    const birthDateError = getBirthDateError(signUpForm.birth_date);

    if (!cleanedId) {
      newErrors.user_id = "ID Number is required";
    } else if (!validID(cleanedId)) {
      newErrors.user_id = "Please enter a valid Israeli ID number";
    }

    if (!signUpForm.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!signUpForm.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!signUpForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!signUpForm.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{9,10}$/.test(signUpForm.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!signUpForm.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!signUpForm.birth_date) {
      newErrors.birth_date = "Birth date is required";
    } else if (birthDateError) {
      newErrors.birth_date = birthDateError;
    }

    if (!signUpForm.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!PASSWORD_REGEX.test(signUpForm.password)) {
      newErrors.password =
        "Password must be at least 8 characters with uppercase letter, number, and special character";
    }

    if (!signUpForm.confirm_password.trim()) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (signUpForm.confirm_password !== signUpForm.password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

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

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    if (!validateSignUpForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { confirm_password, ...signUpPayload } = signUpForm;

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...signUpPayload,
          user_id: signUpPayload.user_id.replace(/\D/g, ""),
          phone: signUpPayload.phone.replace(/\D/g, ""),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Sign up successful:", data);
      } else {
        setErrors({
          submit: data.message || "Sign up failed. Please try again.",
        });
      }
    } catch (error) {
      setErrors({ submit: "An error occurred. Please try again." });
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatIdNumber = (value) => {
    return value.replace(/\D/g, "").slice(0, 9);
  };

  const formatPhoneNumber = (value) => value.replace(/\D/g, "").slice(0, 10);

  const handleToggleMode = () => {
    setIsLogin((currentMode) => !currentMode);
    setErrors({});
  };

  const signUpBirthDateError = getBirthDateError(signUpForm.birth_date);
  const isSignUpDisabled = isLoading || Boolean(signUpBirthDateError);

  const renderInputField = ({
    icon: Icon,
    error,
    fullWidth = false,
    fieldClassName = "",
    children,
  }) => (
    <div
      className={`${styles.formGroup} ${fullWidth ? styles.fullWidthField : ""} ${fieldClassName}`}
    >
      <div
        className={`${styles.fieldShell} ${error ? styles.fieldShellError : ""}`}
      >
        <span className={styles.inputIcon} aria-hidden="true">
          <Icon />
        </span>
        {children}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );

  return (
    <div className={styles.loginContainer}>
      <div
        className={`${styles.loginCard} ${!isLogin ? styles.signUpCard : ""}`}
      >
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <img src={logo} alt="BlueMars" className={styles.logoImage} />
          </div>
          <h1 className={styles.title}>{isLogin ? "Login" : "Sign Up"}</h1>
          <p className={styles.subtitle}>
            {isLogin
              ? "Access your BlueMars account"
              : "Create your BlueMars account"}
          </p>
        </div>

        {errors.submit && (
          <div className={styles.errorAlert}>{errors.submit}</div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className={styles.form}>
            {renderInputField({
              icon: UserIcon,
              error: errors.idNumber,
              children: (
                <input
                  type="text"
                  id="idNumber"
                  className={`${styles.input} ${errors.idNumber ? styles.inputError : ""}`}
                  placeholder="123456789"
                  value={loginForm.idNumber}
                  onChange={(e) => {
                    const formatted = formatIdNumber(e.target.value);
                    setLoginForm((currentForm) => ({
                      ...currentForm,
                      idNumber: formatted,
                    }));
                    if (errors.idNumber) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        idNumber: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                  maxLength="9"
                  inputMode="numeric"
                />
              ),
            })}

            {renderInputField({
              icon: LockIcon,
              error: errors.password,
              children: (
                <input
                  type="password"
                  id="password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => {
                    setLoginForm((currentForm) => ({
                      ...currentForm,
                      password: e.target.value,
                    }));
                    if (errors.password) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        password: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                />
              ),
            })}

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
        ) : (
          <form
            onSubmit={handleSignUpSubmit}
            className={`${styles.form} ${styles.signUpForm}`}
          >
            {renderInputField({
              icon: UserIcon,
              error: errors.user_id,
              children: (
                <input
                  type="text"
                  id="signup-user-id"
                  className={`${styles.input} ${errors.user_id ? styles.inputError : ""}`}
                  placeholder="123456789"
                  value={signUpForm.user_id}
                  onChange={(e) => {
                    const formatted = formatIdNumber(e.target.value);
                    setSignUpForm((currentForm) => ({
                      ...currentForm,
                      user_id: formatted,
                    }));
                    if (errors.user_id) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        user_id: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                  maxLength="9"
                  inputMode="numeric"
                />
              ),
            })}

            {renderInputField({
              icon: MailIcon,
              error: errors.email,
              children: (
                <input
                  type="email"
                  id="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="Enter your email"
                  value={signUpForm.email}
                  onChange={(e) => {
                    setSignUpForm((currentForm) => ({
                      ...currentForm,
                      email: e.target.value,
                    }));
                    if (errors.email) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        email: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                />
              ),
            })}

            {renderInputField({
              icon: UserIcon,
              error: errors.first_name,
              children: (
                <input
                  type="text"
                  id="first-name"
                  className={`${styles.input} ${errors.first_name ? styles.inputError : ""}`}
                  placeholder="Enter your first name"
                  value={signUpForm.first_name}
                  onChange={(e) => {
                    setSignUpForm((currentForm) => ({
                      ...currentForm,
                      first_name: e.target.value,
                    }));
                    if (errors.first_name) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        first_name: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                />
              ),
            })}

            {renderInputField({
              icon: UserIcon,
              error: errors.last_name,
              children: (
                <input
                  type="text"
                  id="last-name"
                  className={`${styles.input} ${errors.last_name ? styles.inputError : ""}`}
                  placeholder="Enter your last name"
                  value={signUpForm.last_name}
                  onChange={(e) => {
                    setSignUpForm((currentForm) => ({
                      ...currentForm,
                      last_name: e.target.value,
                    }));
                    if (errors.last_name) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        last_name: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                />
              ),
            })}

            {renderInputField({
              icon: PhoneIcon,
              error: errors.phone,
              children: (
                <input
                  type="tel"
                  id="phone"
                  className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                  placeholder="Enter your phone number"
                  value={signUpForm.phone}
                  onChange={(e) => {
                    const formattedPhone = formatPhoneNumber(e.target.value);
                    setSignUpForm((currentForm) => ({
                      ...currentForm,
                      phone: formattedPhone,
                    }));
                    if (errors.phone) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        phone: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                  maxLength="10"
                />
              ),
            })}

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="gender">
                Gender
              </label>
              <div
                className={styles.genderPills}
                id="gender"
                role="radiogroup"
                aria-label="Gender"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={signUpForm.gender === "Male"}
                  className={`${styles.genderPill} ${signUpForm.gender === "Male" ? styles.genderPillActive : ""}`}
                  onClick={() => {
                    setSignUpForm((currentForm) => ({
                      ...currentForm,
                      gender: "Male",
                    }));
                    if (errors.gender) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        gender: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                >
                  Male
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={signUpForm.gender === "Female"}
                  className={`${styles.genderPill} ${signUpForm.gender === "Female" ? styles.genderPillActive : ""}`}
                  onClick={() => {
                    setSignUpForm((currentForm) => ({
                      ...currentForm,
                      gender: "Female",
                    }));
                    if (errors.gender) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        gender: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                >
                  Female
                </button>
              </div>
              {errors.gender && (
                <span className={styles.errorMessage}>{errors.gender}</span>
              )}
            </div>

            {renderInputField({
              icon: CalendarIcon,
              error: errors.birth_date || signUpBirthDateError,
              fieldClassName: styles.birthDateField,
              children: (
                <input
                  type="date"
                  id="birth-date"
                  className={`${styles.input} ${errors.birth_date || signUpBirthDateError ? styles.inputError : ""}`}
                  value={signUpForm.birth_date}
                  onChange={(e) => {
                    setSignUpForm((currentForm) => ({
                      ...currentForm,
                      birth_date: e.target.value,
                    }));
                    if (errors.birth_date) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        birth_date: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                  max={new Date().toISOString().split("T")[0]}
                />
              ),
            })}

            {renderInputField({
              icon: LockIcon,
              error: errors.password,
              children: (
                <input
                  type="password"
                  id="signup-password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                  placeholder="Create your password"
                  value={signUpForm.password}
                  onChange={(e) => {
                    setSignUpForm((currentForm) => ({
                      ...currentForm,
                      password: e.target.value,
                    }));
                    if (errors.password || errors.confirm_password) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        password: "",
                        confirm_password: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                />
              ),
            })}

            {renderInputField({
              icon: LockIcon,
              error: errors.confirm_password,
              children: (
                <input
                  type="password"
                  id="signup-confirm-password"
                  className={`${styles.input} ${errors.confirm_password ? styles.inputError : ""}`}
                  placeholder="Confirm your password"
                  value={signUpForm.confirm_password}
                  onChange={(e) => {
                    setSignUpForm((currentForm) => ({
                      ...currentForm,
                      confirm_password: e.target.value,
                    }));
                    if (errors.confirm_password) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        confirm_password: "",
                      }));
                    }
                  }}
                  disabled={isLoading}
                />
              ),
            })}

            <button
              type="submit"
              className={`${styles.loginButton} ${styles.fullWidthButton}`}
              disabled={isSignUpDisabled}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className={styles.forgotPasswordLink}
              onClick={handleToggleMode}
              disabled={isLoading}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
