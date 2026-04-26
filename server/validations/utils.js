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
// else - it returns false
function validatePassword(password) {
  if (!password) return false;

  const p = String(password);
  if (p.length < 8) return false;

  let hasLetter = false;
  let hasNumber = false;

  for (let i = 0; i < p.length; i++) {
    const ch = p[i];

    if (ch >= "A" && ch <= "Z") {
      hasLetter = true;
    }

    if (ch >= "0" && ch <= "9") {
      hasNumber = true;
    }

    //if([^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$])
  }

  return hasLetter && hasNumber;
}

module.exports = {
  validateId,
  validatePassword,
};
