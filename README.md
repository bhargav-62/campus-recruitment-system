# 🚀 CREMS — Campus Recruitment & Eligibility Management System

A full-stack web-based platform for managing campus recruitment, student profiles, job opportunities, eligibility checking, applications, and recruitment status tracking.

CREMS provides separate workflows for **students and administrators**, with a Flask REST API backend, React frontend, JWT-based authentication, and a MySQL-compatible cloud database.

---

## 🌐 Live Application

### 🔗 Live Website
https://campus-recruitment-system-hcskgox7z.vercel.app

### 🔗 Backend API
https://campus-recruitment-system-sn3d.onrender.com

### 📚 API Documentation
http://127.0.0.1:5000/apidocs/

> The Swagger URL above is available when running the backend locally.

---

## 📌 Project Overview

CREMS was developed to simplify and centralize the campus recruitment process.

The system allows students to:

- Create and manage their recruitment profile
- Add education details
- Add technical skills
- Add projects
- Add certifications
- Add internship experience
- View available job opportunities
- Check job eligibility
- Apply for eligible jobs
- Track application status
- View application status history

Administrators can:

- Manage student records
- Create and manage job opportunities
- Define job eligibility criteria
- View applications
- Update application statuses
- View recruitment statistics
- Monitor the overall recruitment process

---

# ✨ Key Features

## 👨‍🎓 Student Features

### 🔐 Authentication

- Student registration
- Student login
- JWT-based authentication
- Protected API endpoints
- Role-based access control

### 👤 Student Profile

Students can manage:

- Personal information
- Education
- Skills
- Projects
- Certifications
- Internships

### 💼 Job Opportunities

Students can:

- View available jobs
- View job details
- View eligibility requirements
- Check their eligibility

### 🎯 Smart Eligibility Checking

CREMS evaluates student eligibility based on:

- CGPA
- Backlogs
- Graduation year
- Branch
- Academic percentage
- Required skills

The system also provides missing eligibility information and missing skills when a student is not eligible.

### 📝 Applications

Students can:

- Apply for jobs
- View submitted applications
- View application details
- Track application status
- View application status history

---

# 👨‍💼 Admin Features

Administrators can:

- View all students
- View all jobs
- Create jobs
- Edit jobs
- Delete jobs
- Define eligibility rules
- Update eligibility criteria
- View all applications
- Change application status
- Add remarks to status changes
- View recruitment statistics

### Application Status Workflow

```text
APPLIED
   ↓
SHORTLISTED
   ↓
ASSESSMENT
   ↓
INTERVIEW
   ↓
SELECTED
