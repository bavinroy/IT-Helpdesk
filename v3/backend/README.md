# IT Helpdesk Backend (Phase 2)

## Tech Stack
- Django 5.x
- Django REST Framework (DRF)
- SimpleJWT (Authentication)
- PostgreSQL (Database)

## Setup Instructions

1. **Prerequisites**
   - Python 3.10+ installed.
   - PostgreSQL installed and running.

2. **Database Setup**
   - Open pgAdmin or terminal.
   - Create a database named `it_helpdesk`.
   ```sql
   CREATE DATABASE it_helpdesk;
   ```

3. **Install Dependencies**
   ```bash
   cd backend
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

4. **Configuration**
   - Edit `.env` in the `backend/` folder with your Database credentials.
   ```
   DB_NAME=it_helpdesk
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

5. **Migrations**
   Apply the database schema:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Run Server**
   ```bash
   python manage.py runserver
   ```

## Usage
- **Admin**: Create a superuser first (`python manage.py createsuperuser`).
- **API**: Access `http://localhost:8000/api/`
