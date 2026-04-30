import { useState } from "react";
import AuthField from "./AuthField";
import {
  Calendar as CalendarIcon,
  Lock as LockIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  User as UserIcon,
} from "lucide-react";
import {
  formatIdNumber,
  formatPhoneNumber,
  getBirthDateError,
  PASSWORD_REGEX,
  validID,
} from "./authUtils";

const INITIAL_SIGN_UP_FORM = {
  user_id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gender: "",
  birth_date: "",
  password: "",
  confirm_password: "",
};

export default function SignupForm({ styles }) {
  const [signUpForm, setSignUpForm] = useState(INITIAL_SIGN_UP_FORM);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const signUpBirthDateError = getBirthDateError(signUpForm.birth_date);
  const isSignUpDisabled = isLoading || Boolean(signUpBirthDateError);

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

  const handleSignUpSubmit = async (event) => {
    event.preventDefault();

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
        setErrors({});
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

  return (
    <>
      {errors.submit && (
        <div className={styles.errorAlert}>{errors.submit}</div>
      )}

      <form
        onSubmit={handleSignUpSubmit}
        className={`${styles.form} ${styles.signUpForm}`}
      >
        <AuthField styles={styles} icon={UserIcon} error={errors.user_id}>
          <input
            type="text"
            id="signup-user-id"
            className={`${styles.input} ${errors.user_id ? styles.inputError : ""}`}
            placeholder="123456789"
            value={signUpForm.user_id}
            onChange={(event) => {
              const formatted = formatIdNumber(event.target.value);

              setSignUpForm((currentForm) => ({
                ...currentForm,
                user_id: formatted,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                user_id: "",
                submit: "",
              }));
            }}
            disabled={isLoading}
            maxLength="9"
            inputMode="numeric"
          />
        </AuthField>

        <AuthField styles={styles} icon={MailIcon} error={errors.email}>
          <input
            type="email"
            id="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            placeholder="Enter your email"
            value={signUpForm.email}
            onChange={(event) => {
              setSignUpForm((currentForm) => ({
                ...currentForm,
                email: event.target.value,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                email: "",
                submit: "",
              }));
            }}
            disabled={isLoading}
          />
        </AuthField>

        <AuthField styles={styles} icon={UserIcon} error={errors.first_name}>
          <input
            type="text"
            id="first-name"
            className={`${styles.input} ${errors.first_name ? styles.inputError : ""}`}
            placeholder="Enter your first name"
            value={signUpForm.first_name}
            onChange={(event) => {
              setSignUpForm((currentForm) => ({
                ...currentForm,
                first_name: event.target.value,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                first_name: "",
                submit: "",
              }));
            }}
            disabled={isLoading}
          />
        </AuthField>

        <AuthField styles={styles} icon={UserIcon} error={errors.last_name}>
          <input
            type="text"
            id="last-name"
            className={`${styles.input} ${errors.last_name ? styles.inputError : ""}`}
            placeholder="Enter your last name"
            value={signUpForm.last_name}
            onChange={(event) => {
              setSignUpForm((currentForm) => ({
                ...currentForm,
                last_name: event.target.value,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                last_name: "",
                submit: "",
              }));
            }}
            disabled={isLoading}
          />
        </AuthField>

        <AuthField styles={styles} icon={PhoneIcon} error={errors.phone}>
          <input
            type="tel"
            id="phone"
            className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
            placeholder="Enter your phone number"
            value={signUpForm.phone}
            onChange={(event) => {
              const formattedPhone = formatPhoneNumber(event.target.value);

              setSignUpForm((currentForm) => ({
                ...currentForm,
                phone: formattedPhone,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                phone: "",
                submit: "",
              }));
            }}
            disabled={isLoading}
            maxLength="10"
          />
        </AuthField>

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
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  gender: "",
                  submit: "",
                }));
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
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  gender: "",
                  submit: "",
                }));
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

        <AuthField
          styles={styles}
          icon={CalendarIcon}
          error={errors.birth_date || signUpBirthDateError}
          fieldClassName={styles.birthDateField}
        >
          <input
            type="date"
            id="birth-date"
            className={`${styles.input} ${errors.birth_date || signUpBirthDateError ? styles.inputError : ""}`}
            value={signUpForm.birth_date}
            onChange={(event) => {
              setSignUpForm((currentForm) => ({
                ...currentForm,
                birth_date: event.target.value,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                birth_date: "",
                submit: "",
              }));
            }}
            disabled={isLoading}
            max={new Date().toISOString().split("T")[0]}
          />
        </AuthField>

        <AuthField styles={styles} icon={LockIcon} error={errors.password}>
          <input
            type="password"
            id="signup-password"
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            placeholder="Create your password"
            value={signUpForm.password}
            onChange={(event) => {
              setSignUpForm((currentForm) => ({
                ...currentForm,
                password: event.target.value,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                password: "",
                confirm_password: "",
                submit: "",
              }));
            }}
            disabled={isLoading}
          />
        </AuthField>

        <AuthField
          styles={styles}
          icon={LockIcon}
          error={errors.confirm_password}
        >
          <input
            type="password"
            id="signup-confirm-password"
            className={`${styles.input} ${errors.confirm_password ? styles.inputError : ""}`}
            placeholder="Confirm your password"
            value={signUpForm.confirm_password}
            onChange={(event) => {
              setSignUpForm((currentForm) => ({
                ...currentForm,
                confirm_password: event.target.value,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                confirm_password: "",
                submit: "",
              }));
            }}
            disabled={isLoading}
          />
        </AuthField>

        <button
          type="submit"
          className={`${styles.loginButton} ${styles.fullWidthButton}`}
          disabled={isSignUpDisabled}
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </>
  );
}
