# Multi-Speciality Medical Centre Management System

A full-stack Clinic Management System developed using React and Django REST Framework. The application organizes clinic operations through separate modules for administration, reception, doctors, pharmacy, and laboratory services.

## Features

### Admin Module

- Staff management
- Department management
- Medicine master management
- Laboratory test master management

### Receptionist Module

- Patient registration and management
- Appointment scheduling
- Patient record access
- Billing functionality

### Doctor Module

- View today's and upcoming appointments
- Access patient files and medical history
- Record consultation details
- Prescribe medicines
- Request laboratory tests
- View consultation history
- Print prescriptions

### Pharmacist Module

- Medicine inventory management
- Prescription fulfilment
- Medicine issuance
- Pharmacy billing
- Stock and sales information

### Lab Technician Module

- View requested laboratory tests
- Manage laboratory test workflows
- Enter test results
- Manage laboratory reports
- Handle laboratory billing

### Authentication

- Login interface
- JWT-based authentication configuration
- Separate frontend modules for different clinic roles

## Technologies Used

### Frontend

- React
- JavaScript
- React Router
- Axios
- Bootstrap 5
- Bootstrap Icons
- Vite

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- django-cors-headers

### Database

- SQLite

## Project Structure

```text
clinic-management-system/
├── cms-frontend/
│   └── cmsfrontendapp/
├── cms-backend/
│   ├── admin_backend/
│   ├── receptionist_backend/
│   ├── doctor_backend/
│   ├── pharmacist_backend/
│   ├── lab_technician/
│   ├── cmsproj/
│   ├── manage.py
│   └── requirements.txt
├── screenshots/
│   └── README.md
├── .gitignore
└── README.md
```

## How It Works

1. A user logs in through the React frontend.
2. The frontend communicates with Django REST Framework APIs.
3. The backend processes requests and interacts with the database.
4. Each module provides functionality for a specific clinic role.
5. Patient, appointment, consultation, pharmacy, and laboratory information is managed through the corresponding application modules.

## Getting Started

### Prerequisites

Install the following:

- Python
- Node.js and npm
- Git

### 1. Set up the backend

Open a terminal in the `cms-backend` directory.

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows Command Prompt:

```bat
.venv\Scripts\activate
```

Install the backend dependencies:

```bash
python -m pip install -r requirements.txt
```

Configure the Django secret key through a local environment variable before starting the application.

Apply the database migrations:

```bash
python manage.py migrate
```

Create a local administrator account if required:

```bash
python manage.py createsuperuser
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend development server is available at:

`http://127.0.0.1:8000/`

### 2. Set up the frontend

Open another terminal in:

`cms-frontend/cmsfrontendapp/`

Install the frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173/`

### 3. Connect the frontend and backend

Ensure that the frontend API configuration points to the correct Django server address.

Keep the backend running while using the frontend.

The frontend may require additional configuration depending on the local API URLs and authentication flow used in the source code.

## Database Setup

The project uses SQLite through Django's database configuration.

The existing local database is intentionally excluded from the repository. Run the Django migrations to create the database schema.

Create local users and sample records for demonstration purposes.

Do not use real patient records or personal medical information in a public demonstration.

## Security Notes

- Do not commit secret keys, passwords, or authentication tokens.
- Keep local database files out of the public repository.
- Configure allowed hosts and CORS origins appropriately.
- Use suitable authentication and authorization for protected endpoints.
- Avoid using real patient data in screenshots or sample records.
- Configure production security settings before deployment.

## Future Improvements

- Add automated tests for all modules.
- Improve API error handling and validation.
- Add pagination and search to large data tables.
- Improve accessibility and responsive layouts.
- Add environment-based frontend API configuration.
- Strengthen role-based permissions and audit logging.
- Prepare a production deployment configuration.

## Author

Developed as a full-stack web development project to practise React, Django REST Framework, REST API integration, JWT authentication, and relational data management.
