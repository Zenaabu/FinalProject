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

// TODO: to change: add the email sender here.
// a function that gets the email and a code
// it sends the reset code to the email we've got
async function sendResetCode(email, code) {
  // await transporter.sendMail({
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: "Password Reset Code",
  //   text: `Your reset code is: ${code}. It is valid for 5 minutes.`,
  // });

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

// a function that gets a role and returns true if it's valid
// and false if it's not
function validateRole(role) {
  const allowedRoles = ["user", "instructor", "admin"];

  return allowedRoles.includes(role);
}

// a function that gets is_blocked value
// it returns true if it's valid and false if not
function validateBlockedStatusValue(is_blocked) {
  const validValues = [0, 1, true, false];

  return validValues.includes(is_blocked);
}

// a function that gets a start date and end date
// it returns true if the dates are valid and false if not
function validateCourseDates(start_date, end_date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  // invalid dates
  if (isNaN(startDate) || isNaN(endDate)) return false;

  // start date in the past
  if (startDate <= today) return false;

  // end date in the past
  if (endDate <= today) return false;

  // end before start
  if (endDate <= startDate) return false;

  return true;
}

// a function that gets the existing max lessons in the current course
// and an array of the lessons sequence numbers
// it returns true if the numbers is correct and false if not
function isValidLessonSequence(existingMaxLesson, lessons) {
  const lessonNumbers = lessons.map((lesson) => Number(lesson.lesson_number));

  lessonNumbers.sort((a, b) => a - b);

  for (let i = 0; i < lessonNumbers.length; i++) {
    if (lessonNumbers[i] !== existingMaxLesson + i + 1) {
      return false;
    }
  }

  return true;
}

// a function that gets a lesson date, course start and end date
// it returns true if the dates are valid and false if not
function validateLessonDate(lesson_date, course_start_date, course_end_date) {
  const lessonDate = new Date(lesson_date);

  const startDate = new Date(course_start_date);

  const endDate = new Date(course_end_date);

  // invalid dates
  if (isNaN(lessonDate) || isNaN(startDate) || isNaN(endDate)) {
    return false;
  }

  // lesson must be inside course dates
  return lessonDate >= startDate && lessonDate <= endDate;
}

// a function that returns true if lesson start time is before end time
// and false if not
function validateLessonTime(start_time, end_time) {
  if (!start_time || !end_time) {
    return false;
  }

  return start_time < end_time;
}

// a function that gets a date and returns it with format yyyy:mm:dd
function formatDateOnly(date) {
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(date).slice(0, 10);
}

// a function that gets a time and returns it as a string with only first 5 chars
// 10:00:00 -> 10:00
function formatTimeOnly(time) {
  return String(time).slice(0, 5);
}

// a function that gets an array of existing lessons and new lessons of an instructor
// it return true if at least one lesson from the new lessons exists in the existing
// ines (has conflict) and false if not
function hasLessonConflict(existingLessons, newLessons) {
  for (const existing of existingLessons) {
    for (const lesson of newLessons) {
      const sameDate =
        formatDateOnly(existing.lesson_date) ===
        formatDateOnly(lesson.lesson_date);

      const existingStart = formatTimeOnly(existing.start_time);
      const existingEnd = formatTimeOnly(existing.end_time);
      const newStart = formatTimeOnly(lesson.start_time);
      const newEnd = formatTimeOnly(lesson.end_time);

      if (sameDate && existingStart < newEnd && existingEnd > newStart) {
        return true;
      }
    }
  }

  return false;
}

// a function that gets a field of a lesson and returns true if they are
// allowed fields and false if not
function areValidLessonUpdateFields(fields) {
  const allowedFields = ["lesson_date", "start_time", "end_time"];

  return fields.every((field) => allowedFields.includes(field));
}

// a function that gets the old lesson data and the new lesson data
// it returns the object of the new updated lesson
function buildUpdatedLesson(oldLesson, newData) {
  return {
    lesson_number: oldLesson.lesson_number,
    lesson_date: newData.lesson_date ?? oldLesson.lesson_date,
    start_time: newData.start_time ?? oldLesson.start_time,
    end_time: newData.end_time ?? oldLesson.end_time,
  };
}

// a function that gets the lesson number and total lessons
// it returns true if the lesson number is valid and false if not
function validateLessonNumber(lessonNumber, totalLessons) {
  const num = Number(lessonNumber);

  if (!Number.isInteger(num) || num <= 0) {
    return false;
  }

  return num <= Number(totalLessons);
}

// a function that gets a lessons array and returns true
// if it's date order is valid and false if not
function isValidLessonDateOrder(lessons) {
  const sortedLessons = [...lessons].sort(
    (a, b) => Number(a.lesson_number) - Number(b.lesson_number),
  );

  for (let i = 0; i < sortedLessons.length - 1; i++) {
    const currentDate = new Date(sortedLessons[i].lesson_date);
    const nextDate = new Date(sortedLessons[i + 1].lesson_date);

    if (currentDate > nextDate) {
      return false;
    }
  }

  return true;
}

// a function that gets a date and returns true if it's a future date
// and false if not
function isFutureLessonDate(date) {
  const lessonDate = new Date(date);

  lessonDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return lessonDate >= today;
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
  validateRole,
  validateBlockedStatusValue,
  validateCourseDates,
  isValidLessonSequence,
  validateLessonDate,
  validateLessonTime,
  hasLessonConflict,
  areValidLessonUpdateFields,
  buildUpdatedLesson,
  validateLessonNumber,
  isValidLessonDateOrder,
  isFutureLessonDate,
};
