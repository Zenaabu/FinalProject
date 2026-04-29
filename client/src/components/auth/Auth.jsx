import React, { useState } from "react";
import styles from "./Auth.module.css";
import logo from "../../assets/bluemarsLogo.png";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...signUpForm,
          user_id: signUpForm.user_id.replace(/\D/g, ""),
          phone: signUpForm.phone.replace(/\D/g, ""),
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
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
  };

  const formatPhoneNumber = (value) => value.replace(/\D/g, "").slice(0, 10);

  const handleToggleMode = () => {
    setIsLogin((currentMode) => !currentMode);
    setErrors({});
  };

  const signUpBirthDateError = getBirthDateError(signUpForm.birth_date);
  const isSignUpDisabled = isLoading || Boolean(signUpBirthDateError);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.oceanWave} />

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
            <div className={styles.formGroup}>
              <label htmlFor="idNumber" className={styles.label}>
                ID Number (ת"ז)
              </label>
              <input
                type="text"
                id="idNumber"
                className={`${styles.input} ${errors.idNumber ? styles.inputError : ""}`}
                placeholder="123-456-789"
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
                maxLength="11"
              />
              {errors.idNumber && (
                <span className={styles.errorMessage}>{errors.idNumber}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
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
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

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
            <div className={`${styles.formGroup} ${styles.fullWidthField}`}>
              <label htmlFor="signup-user-id" className={styles.label}>
                ID Number (ת"ז)
              </label>
              <input
                type="text"
                id="signup-user-id"
                className={`${styles.input} ${errors.user_id ? styles.inputError : ""}`}
                placeholder="123-456-789"
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
                maxLength="11"
              />
              {errors.user_id && (
                <span className={styles.errorMessage}>{errors.user_id}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="first-name" className={styles.label}>
                First Name
              </label>
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
              {errors.first_name && (
                <span className={styles.errorMessage}>{errors.first_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="last-name" className={styles.label}>
                Last Name
              </label>
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
              {errors.last_name && (
                <span className={styles.errorMessage}>{errors.last_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
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
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Phone
              </label>
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
              {errors.phone && (
                <span className={styles.errorMessage}>{errors.phone}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="gender" className={styles.label}>
                Gender
              </label>
              <select
                id="gender"
                className={`${styles.input} ${errors.gender ? styles.inputError : ""}`}
                value={signUpForm.gender}
                onChange={(e) => {
                  setSignUpForm((currentForm) => ({
                    ...currentForm,
                    gender: e.target.value,
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
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && (
                <span className={styles.errorMessage}>{errors.gender}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="birth-date" className={styles.label}>
                Birth Date
              </label>
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
              {(errors.birth_date || signUpBirthDateError) && (
                <span className={styles.errorMessage}>
                  {errors.birth_date || signUpBirthDateError}
                </span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidthField}`}>
              <label htmlFor="signup-password" className={styles.label}>
                Password
              </label>
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
                  if (errors.password) {
                    setErrors((currentErrors) => ({
                      ...currentErrors,
                      password: "",
                    }));
                  }
                }}
                disabled={isLoading}
              />
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

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

      <div className={styles.wavesBottom} />
    </div>
  );
};

export default Auth;
