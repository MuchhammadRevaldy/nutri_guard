====================================
NUTRI GUARD - INSTALLATION GUIDE
====================================

This file lists all the commands and libraries required to set up and run the application.

------------------------------------
1. PREREQUISITES
------------------------------------
Ensure you have the following installed on your system:
- PHP >= 8.1
- Composer
- Node.js & NPM
- Python 3.x & Pip

------------------------------------
2. BACKEND SETUP (LARAVEL)
------------------------------------
Navigate to the project root directory and run:

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure your database settings in .env file (DB_DATABASE, DB_USERNAME, etc.)

# Generate Application Key
php artisan key:generate

# Run Database Migrations
php artisan migrate

# Link Storage (for profile pictures and other uploads)
php artisan storage:link

# Start the Laravel Development Server
php artisan serve

------------------------------------
3. FRONTEND SETUP (REACT/INERTIA)
------------------------------------
Open a new terminal tab and run:

# Install Node dependencies (Recommended)
# Running this single command will install ALL libraries listed in package.json (the "requirements file" for Node.js)
npm install

# Alternatively, if you need to install these specific libraries manually in one go:
npm install groq-sdk @google/generative-ai chart.js react-chartjs-2 lucide-react jspdf markdown-to-jsx react-markdown

# Start the Vite Development Server
npm run dev

------------------------------------
4. PYTHON SERVICES SETUP (AI FEATURES)
------------------------------------
If you are using the NutriScan or FitChef features that rely on Python:

# Navigate to the python services directory
cd services/python

# Install Python dependencies
pip install -r requirements.txt

# Or install manually:
pip install torch torchvision Pillow numpy

------------------------------------
5. API KEYS
------------------------------------
To use the AI features (Chat, Scanning), make sure to add your API keys to the .env file:
- OPENAI_API_KEY=...
- GOOGLE_API_KEY=...
- GROQ_API_KEY=...

====================================
RUNNING THE APP
====================================
1. Terminal 1: php artisan serve
2. Terminal 2: npm run dev
3. Access http://localhost:8000 in your browser.
