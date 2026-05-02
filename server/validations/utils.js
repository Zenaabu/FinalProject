const nodemailer = require("nodemailer"); // importing the library that will send a mail to the user

// a function that gets an id
// it returns true if it's a valid Israeli id and false if not
function validateId(id) {
  if (!id) return false;
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
}

// a function that gets a password
// it checks and returns true if the password is valid if at least it has:
// 1. 8 chars
// 2. 1 upper letter
// 3. 1 number
// 4. one special char (!~@#$%^&*)
// also the letters in the password is in english only
// else - it returns false
function validatePassword(password) {
  if (!password) return false;

  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[\x20-\x7E]{8,}$/;

  return regex.test(String(password));

  return hasLetter && hasNumber;
}

// a function that gets an email and return true if it's valid and false if not
function validateEmail(email) {
  if (!email) return false;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(String(email));
}

// create an email sender (transporter) that will help us send emails to the user
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// a function that gets the email and a code
// it sends the reset code to the email we've got
async function sendResetCode(email, code) {
  // await transporter.sendMail({
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: "Password Reset Code",
  //   text: `Your reset code is: ${code}. It is valid for 5 minutes.`,
  // });

  console.log("#to change: add the email sender here.");
  console.log("RESET CODE:", code);
}

// a function that gets a phone number and returns true if it's valid and false if not
// a valid phone number have 10 digits only, starting with 05
function validatePhone(phone) {
  if (!phone) return false;

  const phoneRegex = /^05\d{8}$/;

  return phoneRegex.test(String(phone));
}

// a function that gets a gender and returns true if it's valid and false if not
function validateGender(gender) {
  if (!gender) return false;

  const validGenders = ["male", "female"];

  return validGenders.includes(String(gender).toLowerCase());
}

// a function that gets a birthdate and returns true if it's valid and false if not
// the functions calculate the accurate age (not only the year)
// if the age is below 18 - returns false
function validateBirthDate(birth_date) {
  if (!birth_date) return false;

  const birth = new Date(birth_date);

  // invalid date
  if (isNaN(birth.getTime())) return false;

  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  // check if birthday already happened this year
  const hasHadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!hasHadBirthday) {
    age--;
  }

  return age >= 18;
}

// a function that gets a name and returns true if it's valid and false if not
// the name should contain only english letters
function validateName(name) {
  if (!name) return false;

  const nameRegex = /^[A-Za-z]+$/;

  return nameRegex.test(String(name));
}

module.exports = {
  validateId,
  validatePassword,
  validateEmail,
  sendResetCode,
  validatePhone,
  validateGender,
  validateBirthDate,
  validateName,
};
