
# **Project Prompt: AttendEase Web Application**

## **1. App Name**
AttendEase

## **2. Elevator Pitch**
AttendEase is a modern, AI-enhanced attendance management system designed for educational institutions. It provides separate, intuitive interfaces for faculty and students to streamline the process of marking, tracking, and reviewing attendance, ensuring accuracy and saving valuable time.

## **3. Core Features**

### **a. Authentication & Roles**
-   **Secure Login/Registration**: Separate registration and login flows for "Student" and "Faculty" roles.
-   **Role-Based Access Control (RBAC)**: The UI and available actions are tailored to the logged-in user's role. Students can only view their own data, while faculty have management capabilities.
-   **Session Management**: User session is persisted on the client-side using `localStorage` and managed via a React Context (`useAuth`).

### **b. Faculty-Specific Features**
-   **Dashboard**: An overview of total courses taught, total number of students across all classes, and a grid of assigned courses.
-   **Course Management**:
    -   Create new courses (Theory or Practical).
    -   View all created courses.
    -   View course details, including assigned classes and description.
    -   Manage which classes (e.g., "SE CSE A") are assigned to a course.
-   **Attendance Marking**:
    -   A dedicated page to select a class, course, lecture date, and time slot.
    -   Displays a list of students for the selected class.
    -   Functionality to mark students as present or absent individually or in bulk ("Mark All Present/Absent").
    -   **Student Management**: On the attendance marking page, faculty can:
        -   **Add Student Manually**: A dialog to add a single student with a name and roll number.
        -   **Import Students**: A dialog to upload an Excel file (`.xlsx`, `.xls`) with `rollNumber` and `name` columns to bulk-add students to a class.
-   **AI-Powered Smart Review**:
    -   After marking attendance but before submitting, faculty can use the "Smart Review" feature.
    -   A Genkit AI flow analyzes the current attendance sheet against historical records for that course.
    -   It returns suggestions for potential mistakes (e.g., a student with perfect attendance is marked absent) with a reason.
-   **Reporting**: View a list of all previously submitted attendance reports, with the ability to click through to a detailed view for each report.

### **c. Student-Specific Features**
-   **Dashboard**: An overview of overall attendance percentage, total enrolled courses, and the date of the last absence.
-   **Course View**: View a list of all courses available for their class.
-_   **Reporting**:
    -   View a detailed, subject-wise breakdown of their own attendance.
    -   Each course is displayed in an accordion, revealing a table of all lecture dates and their status (Present/Absent).

## **4. Tech Stack & Architecture**

-   **Framework**: Next.js 15+ with the App Router.
-   **Language**: TypeScript.
-   **Styling**: Tailwind CSS.
-   **UI Components**: A custom component library built with ShadCN UI. Components are composable and located in `src/components/ui`. App-specific components are in `src/components/app`.
-   **State Management**: Primarily React Hooks (`useState`, `useEffect`) and React Context API for global state like authentication (`src/hooks/use-auth.tsx`).
-   **Data Handling**: An in-memory database is simulated in `src/lib/data.ts`. This file exports functions to get and save data (users, courses, attendance), mimicking a real backend API. Data is not persisted between server restarts.
-   **Forms**: `react-hook-form` is used for handling all forms (login, registration, course creation) with schema validation from `zod`.
-   **Generative AI**: `Genkit` is used for the "Smart Review" feature. The flow is defined in `src/ai/flows/smart-review.ts`.

## **5. Project File Structure**

-   `src/app/`: Contains all routes (pages and layouts) following the Next.js App Router convention.
    -   `(auth)` routes like `/login` and `/register`.
    -   `(app)` routes for authenticated users like `/dashboard`, `/courses`, `/attendance`, `/reports`.
    -   `layout.tsx`: The root layout, which includes the `AuthProvider` and `Toaster`.
    -   `globals.css`: Contains the Tailwind directives and the CSS variables for the color theme.
-   `src/components/`:
    -   `app/`: Contains application-specific composite components (e.g., `main-layout`, `sidebar-nav`, `smart-review-dialog`).
    -   `ui/`: Contains the base ShadCN UI components (e.g., `Button`, `Card`, `Input`).
-   `src/hooks/`: Contains custom React hooks.
    -   `use-auth.tsx`: Manages user authentication state, login, logout, and registration logic.
    -   `use-toast.ts`: Manages the display of toast notifications.
-   `src/lib/`:
    -   `data.ts`: The in-memory database for the application. It initializes with mock data.
    -   `types.ts`: Contains all TypeScript type definitions used throughout the app.
    -   `utils.ts`: Contains utility functions, primarily `cn` for merging Tailwind classes.
-   `src/ai/`:
    -   `genkit.ts`: Initializes the global Genkit instance.
    -   `flows/smart-review.ts`: Defines the input/output schemas and the Genkit prompt and flow for the AI attendance review feature.
-   `public/`: Static assets (currently none).
-   `package.json`: Lists all project dependencies (`next`, `react`, `tailwindcss`, `lucide-react`, `genkit`, `zod`, etc.) and scripts.
-   `tailwind.config.ts` & `postcss.config.js`: Configuration for Tailwind CSS.
-   `next.config.ts`: Configuration for Next.js.
-   `tsconfig.json`: TypeScript configuration.

## **6. Style & Design Guidelines**

-   **Primary Color**: Indigo (`#4B0082`) - Used for primary buttons, links, and highlights.
-   **Background Color**: Light Gray (`#F0F0F0`) - Used for the main content area background to provide a clean look.
-   **Accent Color**: Teal (`#008080`) - Used for secondary highlights and visual contrast.
-   **Fonts**: `PT Sans` is used for both body and headline text.
-   **Icons**: `lucide-react` is the designated icon library for a clean, modern aesthetic.
-   **Layout**: The main application interface uses a two-column layout with a persistent sidebar for navigation and a main content area. The layout is responsive.
-   **Footer**: A footer with the text "© 2024 MIT CSN Attendance. All rights reserved by Rohan." is present on all authenticated pages.
