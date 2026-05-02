import React, { useState } from "react";
import styles from "./Auth.module.css";
import logo from "../../assets/bluemarsLogo.png";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { VIEW_STATE } from "./authUtils";

const VIEW_LABELS = {
  [VIEW_STATE.LOGIN]: {
    title: "Login",
    subtitle: "Access your BlueMars account",
  },
  [VIEW_STATE.ENTER_EMAIL]: {
    title: "Forgot Password?",
    subtitle:
      "Don't worry! Enter your email and we'll send you a recovery code.",
  },
  [VIEW_STATE.VERIFY_OTP]: {
    title: "Check Your Inbox",
    subtitle: "Enter the verification code we just sent to your email.",
  },
  [VIEW_STATE.RESET_PASSWORD]: {
    title: "Set New Password",
    subtitle: "Almost there! Create a new password to get back on the board.",
  },
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [viewState, setViewState] = useState(VIEW_STATE.LOGIN);

  const handleToggleMode = () => {
    setIsLogin((currentMode) => !currentMode);
    setViewState(VIEW_STATE.LOGIN);
  };

  const currentLabels = isLogin
    ? VIEW_LABELS[viewState]
    : { title: "Sign Up", subtitle: "Create your BlueMars account" };

  return (
    <div className={styles.loginContainer}>
      <div
        className={`${styles.loginCard} ${!isLogin ? styles.signUpCard : ""}`}
      >
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <img src={logo} alt="BlueMars" className={styles.logoImage} />
          </div>
          <h1 className={styles.title}>{currentLabels.title}</h1>
          <p className={styles.subtitle}>{currentLabels.subtitle}</p>
        </div>

        {isLogin ? (
          <LoginForm
            styles={styles}
            viewState={viewState}
            setViewState={setViewState}
          />
        ) : (
          <SignupForm styles={styles} />
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {isLogin && viewState !== VIEW_STATE.LOGIN ? (
              <>
                {"Remember your password? "}
                <button
                  type="button"
                  className={styles.forgotPasswordLink}
                  onClick={() => setViewState(VIEW_STATE.LOGIN)}
                >
                  Back to Login
                </button>
              </>
            ) : (
              <>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  className={styles.forgotPasswordLink}
                  onClick={handleToggleMode}
                >
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
