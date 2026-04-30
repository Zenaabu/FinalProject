import React, { useState } from "react";
import styles from "./Auth.module.css";
import logo from "../../assets/bluemarsLogo.png";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggleMode = () => {
    setIsLogin((currentMode) => !currentMode);
  };

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

        {isLogin ? (
          <LoginForm styles={styles} />
        ) : (
          <SignupForm styles={styles} />
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className={styles.forgotPasswordLink}
              onClick={handleToggleMode}
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
