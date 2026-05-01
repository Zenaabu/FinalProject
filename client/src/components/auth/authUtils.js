export const VIEW_STATE = {
  LOGIN: "LOGIN",
  ENTER_EMAIL: "ENTER_EMAIL",
  VERIFY_OTP: "VERIFY_OTP",
  RESET_PASSWORD: "RESET_PASSWORD",
};

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const validID = (id) => {
  if (id.length !== 9) {
    return false;
  }

  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1];
  const digits = id.split("").map(Number);
  let sum = 0;

  for (let index = 0; index < 9; index += 1) {
    let product = digits[index] * weights[index];

    if (product > 9) {
      product = Math.floor(product / 10) + (product % 10);
    }

    sum += product;
  }

  return sum % 10 === 0;
};

export const formatIdNumber = (value) => value.replace(/\D/g, "").slice(0, 9);

export const formatPhoneNumber = (value) =>
  value.replace(/\D/g, "").slice(0, 10);

export const getBirthDateError = (birthDate) => {
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
