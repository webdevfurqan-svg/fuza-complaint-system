# 📋 FUZA Complaint Management System

A full-stack, serverless-ready complaint tracking platform designed to streamline issue reporting and administrative management. Built with Node.js, Express, EJS, and MongoDB, this project features robust authentication, session persistence, and automated email notifications.

---

## ✨ Features

* **User Authentication:** Secure registration and login flow powered by `bcryptjs` password hashing and `express-session`.
* **Complaint Submission:** Authenticated users can log detailed complaints with instant status tracking.
* **Admin Dashboard:** Role-restricted portal for administrators to review, monitor, and manage submitted complaints.
* **Automated Email Notifications:** Integrates `Nodemailer` to deliver welcome emails and instant complaint confirmation alerts.
* **Persistent Sessions:** Configured with `connect-mongo` for serverless-optimized session store persistence.
* **Serverless Deployment Ready:** Built with a cached MongoDB connection pattern tailored for Vercel deployment.

---

## 🛠️ Tech Stack

* **Frontend:** EJS Templating, HTML5, CSS3, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose ODM
* **Session & Security:** `express-session`, `connect-mongo`, `bcryptjs`
* **Mailing:** Nodemailer
* **Deployment Platform:** Vercel

---

## 🚀 Live Demo & Repository

* **Live App:** [https://fuza-complaints.vercel.app](https://fuza-complaints.vercel.app) *(Update with your live URL)*
* **GitHub Repository:** [https://github.com/webdevfurqan-svg/fuza-complaint-system](https://github.com/webdevfurqan-svg/fuza-complaint-system)

---

## ⚙️ Environment Variables

To run this project locally or deploy it on Vercel, set up a `.env` file with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret_key
ADMIN_PASSWORD=your_admin_portal_password
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
PORT=3000
