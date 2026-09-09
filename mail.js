const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "webdev.furqan@gmail.com",
    pass: process.env.MAIL_PASSWORD
  }
});

async function sendComplaintEmail(complaint) {
  await transporter.sendMail({
    from: '"FUZA Complaint Management System" <webdev.furqan@gmail.com>',
    to: [process.env.ADMIN_EMAIL, complaint.userEmail],
    subject: "Complaint Received: " + complaint.subject,
    text:
      "A new complaint has been submitted.\n\n" +
      "Name: " + complaint.userName + "\n" +
      "Email: " + complaint.userEmail + "\n" +
      "Subject: " + complaint.subject + "\n" +
      "Description: " + complaint.description
  });

  console.log("Complaint email sent to admin and user.");
}

async function sendWelcomeEmail(user) {
  await transporter.sendMail({
    from: '"FUZA Complaint Management System" <webdev.furqan@gmail.com>',
    to: user.email,
    subject: "Welcome to FUZA Complaint Management System",
    text:
      "Hi " + user.name + ",\n\n" +
      "Your account has been created successfully.\n" +
      "You can now log in and submit complaints anytime."
  });

  console.log("Welcome email sent to user.");
}

module.exports = { sendComplaintEmail, sendWelcomeEmail };