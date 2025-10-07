# 🧠 AttendEase – AI-Powered Attendance Management System

## 🚀 Overview
**AttendEase** is a modern, **AI-enhanced attendance management system** designed specifically for **educational institutions**.  
It streamlines attendance marking, tracking, and reviewing through **role-based interfaces** for students and faculty — saving valuable time while ensuring accuracy.


## 🏷️ Project Information

### 🧩 App Name
**AttendEase**

### 🎯 Elevator Pitch
AttendEase simplifies attendance workflows for teachers and students with an intuitive, responsive design.  
Using **AI-powered Smart Review**, it helps detect potential marking mistakes, ensuring accurate attendance records.

---

## ✨ Core Features

### 🔐 Authentication & Roles
- **Secure Login/Registration:** Separate flows for `Student` and `Faculty` users.  
- **Role-Based Access Control (RBAC):**  
  - Students can view only their own attendance data.  
  - Faculty can create courses, manage attendance, and access reports.  
- **Session Management:**  
  - Persistent login using `localStorage`.  
  - Managed globally via React Context (`useAuth`).

---

### 👨‍🏫 Faculty Features
- **Dashboard:**  
  Overview of total courses, student count, and assigned classes.

- **Course Management:**  
  - Create, view, and manage courses (Theory/Practical).  
  - Assign classes to specific courses.  
  - View detailed course info.

- **Attendance Marking:**  
  - Select class, course, date, and time slot.  
  - Mark students individually or in bulk ("Mark All Present/Absent").  

- **Student Management:**  
  - ➕ **Add Student Manually** (name + roll number).  
  - 📂 **Import Students** from Excel (.xlsx/.xls) file.  

- **🤖 AI-Powered Smart Review:**  
  - Uses **Genkit AI** to analyze attendance sheets.  
  - Flags unusual patterns (e.g., “student with perfect attendance marked absent”).  

- **📊 Reports:**  
  - View submitted attendance reports.  
  - Click for detailed report insights.

---

### 👨‍🎓 Student Features
- **Dashboard:**  
  Displays overall attendance %, enrolled courses, and date of last absence.

- **Course View:**  
  Lists all available courses for the student’s class.

- **📘 Reporting:**  
  - Subject-wise attendance breakdown.  
  - Expandable accordions showing all lecture dates and attendance status.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|-------|-------------|
| **Framework** | Next.js 15+ (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Library** | ShadCN UI (Custom Components) |
| **State Management** | React Hooks & Context API |
| **Forms** | react-hook-form + zod validation |
| **AI Engine** | Genkit (Smart Review Flow) |
| **Database** | In-memory mock DB (`src/lib/data.ts`) |

> 🧠 Data is simulated for demonstration — not persisted between server restarts.

---

## 📁 Project Structure

src/ ├── app/ │   ├── (auth)/          # Login & Register routes │   ├── (app)/           # Authenticated routes (dashboard, attendance, reports) │   └── layout.tsx       # Root layout with AuthProvider & Toaster │ ├── components/ │   ├── app/             # App-specific composite components │   └── ui/              # Base UI components (Button, Card, Input, etc.) │ ├── hooks/ │   ├── use-auth.tsx     # Authentication logic │   └── use-toast.ts     # Toast notification logic │ ├── lib/ │   ├── data.ts          # In-memory database │   ├── types.ts         # Type definitions │   └── utils.ts         # Utility functions (e.g., cn) │ ├── ai/ │   ├── genkit.ts        # Initializes Genkit │   └── flows/ │       └── smart-review.ts # AI flow for attendance validation │ ├── public/              # Static assets └── styles/ └── globals.css      # Tailwind directives & color variables

---

## 🧰 Configuration Files

- `package.json` – Project dependencies and scripts  
- `tailwind.config.ts` – Tailwind customization  
- `postcss.config.js` – PostCSS setup  
- `next.config.ts` – Next.js configuration  
- `tsconfig.json` – TypeScript settings  

---

## 🎨 Style & Design

| Element | Specification |
|----------|----------------|
| **Primary Color** | Indigo `#4B0082` |
| **Accent Color** | Teal `#008080` |
| **Background** | Light Gray `#F0F0F0` |
| **Font** | PT Sans |
| **Icons** | lucide-react |
| **Layout** | Responsive 2-column with sidebar |
| **Footer** | “© 2025 AttendEase. All rights reserved by Rohan.” |


🧠 AI Smart Review (Genkit)

The Smart Review feature enhances faculty efficiency by automatically reviewing marked attendance and detecting possible mistakes using historical patterns.

🧑‍💻 Author

Rohan Bodkhe
– Department of Electronics and Computer Engineering 
© 2025 AttendEase. All rights reserved.


🏁 Future Enhancements

🔗 Real backend integration (Firebase / Supabase)

📱 Mobile responsive optimization

🗓️ Attendance analytics & graphs

🧾 Export attendance reports to PDF



