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

// a function that gets a string and escapes the characters that are unsafe
// to drop straight into HTML (the email template below uses this for every
// value that came from user input, e.g. a student's name)
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// a function that gets the reschedule details for one recipient and returns
// the HTML body of the notification email. table-based layout with inline
// styles only, since email clients don't support external/linked CSS.
// audience: "student" (default) or "instructor" — only changes the wording,
// not the branding/layout, so both emails read as the same family.
function buildRescheduleEmailHtml({
  firstName,
  courseLevel,
  lessonNumber,
  oldWhen,
  newWhen,
  audience = "student",
}) {
  const name = escapeHtml(firstName);
  const level = escapeHtml(courseLevel);

  const introText =
    audience === "instructor"
      ? `Lesson <strong style="color:#0284c7;">${lessonNumber}</strong> of the
         <strong style="color:#0284c7;">${level}</strong> surf course you're teaching has a new schedule.`
      : `Lesson <strong style="color:#0284c7;">${lessonNumber}</strong> of your
         <strong style="color:#0284c7;">${level}</strong> surf course has a new schedule.`;

  const closingText =
    audience === "instructor"
      ? "Please update your calendar accordingly. If this new time creates a conflict on your end, reach out to the admin team as soon as possible."
      : "This is usually due to weather conditions or instructor availability. We're sorry for the inconvenience and can't wait to see you back on the water! 🏄";

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9ff;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(2,132,199,0.12);">
        <tr>
          <td style="background-color:#0284c7;background-image:linear-gradient(135deg,#0284c7,#38bdf8);padding:28px 24px;text-align:center;">
            <div style="font-size:30px;line-height:1;margin-bottom:6px;">🌊</div>
            <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">BlueMars Surf Club</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 28px 8px;">
            <p style="margin:0 0 16px;font-size:16px;color:#0f172a;">Hi ${name},</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">
              ${introText}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:14px 16px;background-color:#fef2f2;border-radius:8px 8px 0 0;border:1px solid #fecaca;border-bottom:none;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#b91c1c;margin-bottom:4px;">Previous Time</div>
                  <div style="font-size:15px;color:#7f1d1d;text-decoration:line-through;">${oldWhen}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;background-color:#f0fdf4;border-radius:0 0 8px 8px;border:1px solid #bbf7d0;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#15803d;margin-bottom:4px;">New Time</div>
                  <div style="font-size:16px;font-weight:700;color:#166534;">${newWhen}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px 28px;">
            <p style="margin:0;font-size:13.5px;line-height:1.6;color:#64748b;">
              ${closingText}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">BlueMars Surf Club</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// a function that gets an array of registered students ({ email, first_name })
// and the before/after schedule of a lesson, and emails every student that
// the lesson moved (e.g. bad weather or an instructor becoming unavailable).
// best-effort: one student's send failing must not stop the others or the
// reschedule that already happened in the DB.
async function sendLessonRescheduleEmail(students, lessonInfo) {
  const {
    courseLevel,
    lessonNumber,
    oldDate,
    oldStart,
    oldEnd,
    newDate,
    newStart,
    newEnd,
  } = lessonInfo;

  const subject = `BlueMars Surf Club - Lesson ${lessonNumber} Rescheduled`;
  const oldWhen = `${formatDateOnly(oldDate)} ${formatTimeOnly(oldStart)}-${formatTimeOnly(oldEnd)}`;
  const newWhen = `${formatDateOnly(newDate)} ${formatTimeOnly(newStart)}-${formatTimeOnly(newEnd)}`;

  const results = await Promise.all(
    students.map((student) =>
      transporter
        .sendMail({
          from: `"BlueMars Surf Club" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject,
          text:
            `Hi ${student.first_name},\n\n` +
            `Lesson ${lessonNumber} of your ${courseLevel} surf course has been rescheduled.\n\n` +
            `Previous time: ${oldWhen}\n` +
            `New time: ${newWhen}\n\n` +
            `This is usually due to weather conditions or instructor availability. We're sorry for the inconvenience and look forward to seeing you on the water.\n\n` +
            `- BlueMars Surf Club`,
          html: buildRescheduleEmailHtml({
            firstName: student.first_name,
            courseLevel,
            lessonNumber,
            oldWhen,
            newWhen,
          }),
        })
        .then(() => ({ email: student.email, ok: true }))
        .catch((err) => {
          console.error(
            `Failed to send reschedule email to ${student.email}:`,
            err.message,
          );
          return { email: student.email, ok: false };
        }),
    ),
  );

  return {
    total: students.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).map((r) => r.email),
  };
}

// a function that gets the instructor actually teaching a lesson
// ({ email, first_name } — the substitute if one is covering it, otherwise
// the course's regular instructor) and the before/after schedule, and
// emails them that the lesson moved. same branding as the student email,
// worded for someone teaching it rather than attending it.
async function sendInstructorRescheduleEmail(instructor, lessonInfo) {
  const {
    courseLevel,
    lessonNumber,
    oldDate,
    oldStart,
    oldEnd,
    newDate,
    newStart,
    newEnd,
  } = lessonInfo;

  const subject = `BlueMars Surf Club - Lesson ${lessonNumber} Rescheduled`;
  const oldWhen = `${formatDateOnly(oldDate)} ${formatTimeOnly(oldStart)}-${formatTimeOnly(oldEnd)}`;
  const newWhen = `${formatDateOnly(newDate)} ${formatTimeOnly(newStart)}-${formatTimeOnly(newEnd)}`;

  try {
    await transporter.sendMail({
      from: `"BlueMars Surf Club" <${process.env.EMAIL_USER}>`,
      to: instructor.email,
      subject,
      text:
        `Hi ${instructor.first_name},\n\n` +
        `Lesson ${lessonNumber} of the ${courseLevel} surf course you're teaching has been rescheduled.\n\n` +
        `Previous time: ${oldWhen}\n` +
        `New time: ${newWhen}\n\n` +
        `Please update your calendar accordingly. If this new time creates a conflict on your end, reach out to the admin team as soon as possible.\n\n` +
        `- BlueMars Surf Club`,
      html: buildRescheduleEmailHtml({
        firstName: instructor.first_name,
        courseLevel,
        lessonNumber,
        oldWhen,
        newWhen,
        audience: "instructor",
      }),
    });

    return { email: instructor.email, ok: true };
  } catch (err) {
    console.error(
      `Failed to send reschedule email to instructor ${instructor.email}:`,
      err.message,
    );
    return { email: instructor.email, ok: false };
  }
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

// a function that gets an array of a course's existing lessons and an array
// of new/incoming lessons for that same course. it returns true if any
// incoming lesson falls on a calendar date another lesson of the course is
// already using — a course meets at most once per day, so two of its own
// lessons can never share a date, regardless of what time each is at.
function hasSameCourseDateConflict(existingLessons, newLessons) {
  for (const existing of existingLessons) {
    for (const lesson of newLessons) {
      if (formatDateOnly(existing.lesson_date) === formatDateOnly(lesson.lesson_date)) {
        return true;
      }
    }
  }

  return false;
}

// a function that gets an array of lessons (e.g. the ones submitted together
// when creating a course or adding to one) and returns true if two of them
// share a calendar date
function hasDuplicateLessonDates(lessons) {
  const dates = lessons.map((lesson) => formatDateOnly(lesson.lesson_date));

  return new Set(dates).size !== dates.length;
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

// a function that gets the fields of the course fields and return true
// if they are valid and false if not
function areValidCourseUpdateFields(fields) {
  const allowedFields = [
    "description",
    "level",
    "price",
    "capacity",
    "total_lessons",
    "start_date",
    "end_date",
    "user_id",
    "status",
  ];

  return fields.every((field) => allowedFields.includes(field));
}

// a function that gets the old course data and new data
// it returns an updated course object with the updated details.
// the returned keys are the DB column names, so the object can be handed
// straight to courseQueries.updateCourse
function buildUpdatedCourse(oldCourse, newData) {
  return {
    description: newData.description ?? oldCourse.description,
    level: newData.level ?? oldCourse.level,
    price: newData.price ?? oldCourse.price,
    capacity: newData.capacity ?? oldCourse.capacity,
    total_lessons: newData.total_lessons ?? oldCourse.total_lessons,
    vat_percent: newData.vat_percent ?? oldCourse.vat_percent,
    start_date: formatDateOnly(newData.start_date ?? oldCourse.start_date),
    end_date: formatDateOnly(newData.end_date ?? oldCourse.end_date),
    user_id: newData.user_id ?? oldCourse.user_id,
    // the client sends a human readable "Active" / "Inactive" status,
    // the DB column is the is_active flag
    is_active:
      newData.status !== undefined
        ? newData.status === "Active"
          ? 1
          : 0
        : oldCourse.is_active,
  };
}

// a function that gets a start date and end date of a course that is being
// updated. unlike validateCourseDates (used when creating) it does not force
// the start date into the future, because an already running course keeps its
// original start date. it only refuses ranges that make no sense.
function validateCourseUpdateDates(start_date, end_date) {
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  // invalid dates
  if (isNaN(startDate) || isNaN(endDate)) return false;

  // end before start
  if (endDate <= startDate) return false;

  return true;
}

// a function that gets lessonDate, startTime and courseEndDate
// it returns true if the instructor can take attendance and false if not
// the instructor can take attendance if the lesson already started and
// the course has not ended yet
function canTakeAttendance(lessonDate, startTime, courseEndDate) {
  const now = new Date();

  const lessonStart = new Date(
    `${formatDateOnly(lessonDate)}T${formatTimeOnly(startTime)}:00`,
  );
  const courseEnd = new Date(courseEndDate);
  courseEnd.setHours(23, 59, 59, 999);

  return now >= lessonStart && now <= courseEnd;
}

// a function that gets the fields of the instructor constraint and returns true
// if they are correct and false if not
function areValidConstraintFields(fields) {
  const allowedFields = ["start_time", "end_time", "notes"];

  return fields.every((field) => allowedFields.includes(field));
}

// a function that gets the fields of the user details
// it returns true if they are valid and false if not
function areValidUserUpdateFields(fields) {
  const allowedFields = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "gender",
    "birth_date",
    "password",
  ];

  return fields.every((field) => allowedFields.includes(field));
}

// a function that gets the old data of the user and the new data
// it rebuilt the updated user according to the changed data
function buildUpdatedUser(oldUser, newData) {
  return {
    first_name: newData.first_name ?? oldUser.first_name,
    last_name: newData.last_name ?? oldUser.last_name,
    email: newData.email ?? oldUser.email,
    phone: newData.phone ?? oldUser.phone,
    gender: newData.gender ?? oldUser.gender,
    birth_date: newData.birth_date ?? oldUser.birth_date,
  };
}

module.exports = {
  validateId,
  validatePassword,
  validateEmail,
  sendResetCode,
  sendLessonRescheduleEmail,
  sendInstructorRescheduleEmail,
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
  hasSameCourseDateConflict,
  hasDuplicateLessonDates,
  areValidLessonUpdateFields,
  buildUpdatedLesson,
  validateLessonNumber,
  isValidLessonDateOrder,
  isFutureLessonDate,
  areValidCourseUpdateFields,
  buildUpdatedCourse,
  validateCourseUpdateDates,
  canTakeAttendance,
  formatDateOnly,
  formatTimeOnly,
  areValidConstraintFields,
  areValidUserUpdateFields,
  buildUpdatedUser,
};
