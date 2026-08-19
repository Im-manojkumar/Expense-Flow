# ExpenseFlow 💸

**ExpenseFlow** is a modern, full-stack personal finance and expense tracking application. It is built to help users seamlessly track incomes, manage expenses, set budgets, and visualize their financial health through a beautiful web dashboard and a native mobile application.

![ExpenseFlow Architecture](https://img.shields.io/badge/Architecture-Monorepo-blue)
![Django](https://img.shields.io/badge/Backend-Django_REST-092E20?logo=django)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=black)
![React Native](https://img.shields.io/badge/Mobile-React_Native_(Expo)-000020?logo=react)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)

---

## ✨ Features

- **🔐 Secure Authentication:** JWT-based stateless authentication.
- **📊 Comprehensive Dashboard:** Real-time metrics, income vs. expense visualizer, and 5-month trend charts using `recharts`.
- **💱 Live Currency Conversion:** Automatic multi-currency conversion leveraging a live Exchange Rate API (with intelligent 12-hour server-side caching).
- **💸 Dedicated Tracking Ledgers:** Independent, isolated screens for Incomes and Expenses.
- **🎯 Budget Management:** Set limits per category and track your utilization rate.
- **📱 Cross-Platform Mobile App:** Companion native app built with React Native (Expo) allowing users to check balances and recent transactions on the go.

---

## 🏗️ Project Structure

This repository is structured as a monorepo containing three distinct environments:

```text
ExpenseFlow/
├── Backend/      # Django REST Framework API (Powered by MySQL)
├── Frontend/     # React.js Web Application (Vite + Tailwind CSS)
└── Mobile/       # React Native Mobile App (Expo + React Navigation)
```

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Backend (Django + MySQL)

**Prerequisites:** Python 3.10+, MySQL 8.0+

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```
2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Database Configuration:**
   - Create a MySQL database locally named `expense_tracker`.
   - Create a `.env` file in the `Backend` directory and define your credentials:
     ```env
     DB_NAME=expense_tracker
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_HOST=127.0.0.1
     DB_PORT=3306
     ```
5. **Run Migrations & Start Server:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```
   *The API will be available at `http://localhost:8000/`*

### 2. Frontend (React.js Web App)

**Prerequisites:** Node.js (v18+)

1. **Navigate to the Frontend directory:**
   ```bash
   cd Frontend
   ```
2. **Install packages:**
   ```bash
   npm install
   ```
3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   *The Web app will be available at `http://localhost:5173/`*

### 3. Mobile (React Native / Expo)

**Prerequisites:** Node.js (v18+), Expo Go app (on your smartphone) or an Android/iOS Emulator.

1. **Navigate to the Mobile directory:**
   ```bash
   cd Mobile
   ```
2. **Install packages:**
   ```bash
   npm install
   ```
3. **Start the Expo server:**
   ```bash
   npm start
   ```
4. **Run the app:**
   - Press `a` in the terminal to launch the Android emulator.
   - Press `i` for the iOS simulator.
   - Alternatively, scan the QR code using the **Expo Go** app on your physical mobile device.

*(Note: The mobile app automatically points to `10.0.2.2:8000` to correctly reach the Django localhost server from an Android emulator. Update `Mobile/src/api/axios.js` if you are testing on a physical device over Wi-Fi).*

---

## 🧪 Testing

The backend is fully equipped with an automated test suite (70+ passing tests).

To run the backend test suite:
```bash
cd Backend
pytest
```

---

## 📜 License

This project is licensed under the MIT License.
