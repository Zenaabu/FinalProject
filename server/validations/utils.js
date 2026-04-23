function validID(id) {
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
