---
title: NutriGuard
emoji: 🥗
colorFrom: green
colorTo: emerald
sdk: docker
pinned: false
---

# NutriGuard — Panduan Instalasi

Platform manajemen nutrisi keluarga berbasis AI: NutriScan, FitChef, Meal Planner, Family Dashboard.

Stack: **Laravel 10** · **React + Inertia.js** · **MySQL** · **Python (PyTorch)**

---

## Prasyarat

Pastikan software berikut sudah terinstall:

| Software | Versi Minimum | Download |
|---|---|---|
| **PHP** | 8.1+ | https://www.php.net/downloads |
| **Composer** | 2.x | https://getcomposer.org |
| **Node.js** | 18+ | https://nodejs.org |
| **MySQL** | 8.0+ | https://dev.mysql.com/downloads |
| **Python** | 3.9–3.14 | https://www.python.org/downloads |
| **Git** | any | https://git-scm.com |

---

## 1. Clone Repository

```bash
git clone https://github.com/MuchhammadRevaldy/nutri_guard.git
cd nutri_guard
```

---

## 2. Setup Laravel (Backend)

```bash
# Install dependencies PHP
composer install

# Buat file konfigurasi
cp .env.example .env
php artisan key:generate
```

### Edit `.env` — sesuaikan dengan konfigurasi lokal

```env
APP_NAME=NutriGuard
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutri_guard
DB_USERNAME=root
DB_PASSWORD=

# Wajib diisi — lihat langkah 4
NUTRISCAN_PYTHON=C:\Users\NamaKamu\nutri_guard\.venv\Scripts\python.exe

# Opsional — untuk FitChef AI & Chatbot (daftar gratis di console.groq.com)
GROQ_API_KEY=
```

### Buat database & jalankan migrasi

```bash
# Buat database di MySQL terlebih dahulu:
# CREATE DATABASE nutri_guard;

php artisan migrate
php artisan storage:link
```

---

## 3. Setup Frontend (Node.js)

```bash
npm install
```

---

## 4. Setup Python — NutriScan AI ⭐

> Bagian ini **wajib** agar fitur scan makanan bisa berjalan.

### Langkah 4.1 — Buat Virtual Environment

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**Linux / Mac:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Langkah 4.2 — Install library Python

```bash
pip install torch torchvision Pillow numpy
```

> ⏳ Proses ini membutuhkan waktu beberapa menit karena PyTorch ~2 GB.

### Langkah 4.3 — Verifikasi instalasi

```bash
python -c "import torch, torchvision; from PIL import Image; print('OK — torch', torch.__version__)"
```

Output yang diharapkan: `OK — torch 2.x.x+cpu`

### Langkah 4.4 — Temukan path Python yang benar

**Windows:**
```bash
.venv\Scripts\python.exe --version
# Contoh path: C:\Users\Sandy\nutri_guard\.venv\Scripts\python.exe
```

**Linux / Mac:**
```bash
.venv/bin/python --version
# Contoh path: /home/user/nutri_guard/.venv/bin/python
```

### Langkah 4.5 — Update `.env`

Isi `NUTRISCAN_PYTHON` dengan path yang didapat di langkah 4.4:

**Windows:**
```env
NUTRISCAN_PYTHON=C:\Users\NamaKamu\nutri_guard\.venv\Scripts\python.exe
```

**Linux / Mac:**
```env
NUTRISCAN_PYTHON=/home/user/nutri_guard/.venv/bin/python
```

### Langkah 4.6 — Salin file model AI

> ⚠️ File `food101_model.pth` **tidak ikut di-push ke GitHub** karena ukurannya besar (~90 MB).
> Minta file ini dari pemilik proyek, lalu letakkan di:

```
nutri_guard/services/python/food101_model.pth
```

### Langkah 4.7 — Test NutriScan (opsional)

```bash
# Pastikan venv aktif, lalu:
python services/python/predict_cli.py path/ke/foto_makanan.jpg

# Output yang diharapkan (JSON):
# {"food_name": "Nasi Goreng", "confidence": 85.2, "nutrition": {...}}
```

---

## 5. Clear Config & Jalankan

```bash
# Bersihkan cache Laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

Buka **2 terminal** secara bersamaan:

**Terminal 1 — Laravel server:**
```bash
php artisan serve
```

**Terminal 2 — Vite (frontend dev):**
```bash
npm run dev
```

Akses aplikasi di: **http://localhost:8000**

---

## Troubleshooting

### ❌ `ModuleNotFoundError: No module named 'torch'`
Python yang dipanggil bukan dari virtual environment.
```env
# Benar ✓  — path ke dalam .venv
NUTRISCAN_PYTHON=C:\Users\...\nutri_guard\.venv\Scripts\python.exe

# Salah ✗  — Python sistem global
NUTRISCAN_PYTHON=python
```

### ❌ `OSError: No username set in the environment` (Windows + Python 3.14)
Sudah ditangani otomatis oleh controller. Jika masih muncul, jalankan:
```bash
set USERNAME=NamaKamu
php artisan serve
```

### ❌ `The system cannot find the path specified`
Path di `NUTRISCAN_PYTHON` salah. Ikuti ulang **Langkah 4.4**.

### ❌ Error migrasi / tabel tidak ditemukan
```bash
php artisan migrate:status   # Cek status migrasi
php artisan migrate          # Jalankan migrasi yang belum berjalan
```

### ❌ Halaman putih / 500 error
```bash
php artisan config:clear && php artisan cache:clear && php artisan route:clear
```

### ❌ `SQLSTATE: Access denied` (database)
Pastikan `DB_USERNAME` dan `DB_PASSWORD` di `.env` sesuai dengan MySQL lokal kamu.

---

## Struktur Penting

```
nutri_guard/
├── app/Http/Controllers/       # Laravel controllers
├── app/Models/                 # Eloquent models
├── database/migrations/        # Skema database
├── resources/js/
│   ├── Pages/                  # Halaman React (Inertia)
│   └── Components/             # Komponen React
├── services/python/
│   ├── predict_cli.py          # Script AI NutriScan ← entry point
│   ├── food101_model.pth       # ⚠️  Model AI — MINTA DARI PEMILIK PROYEK
│   └── requirements.txt        # Library Python
├── .env                        # Konfigurasi lokal (tidak di-push ke git)
├── .env.example                # Template .env ← salin ini
└── .venv/                      # Virtual environment Python (tidak di-push)
```

---

## API Keys (Opsional)

Tanpa API key, aplikasi tetap berjalan dengan data demo.

| Fitur | Variable | Cara Dapat |
|---|---|---|
| FitChef AI | `GROQ_API_KEY` | Daftar gratis di https://console.groq.com |
| Chatbot | `GROQ_API_KEY` | Key yang sama |
| NutriScan (estimasi kalori) | `GROQ_API_KEY` | Key yang sama |

---

## Ringkasan Cepat

```bash
git clone https://github.com/MuchhammadRevaldy/nutri_guard.git && cd nutri_guard

# Laravel
composer install
cp .env.example .env
php artisan key:generate
# Edit .env: isi DB_ dan NUTRISCAN_PYTHON
php artisan migrate
php artisan storage:link

# Frontend
npm install

# Python (wajib untuk NutriScan)
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install torch torchvision Pillow numpy
# Salin food101_model.pth ke services/python/
# Update NUTRISCAN_PYTHON di .env dengan path ke .venv\Scripts\python.exe

# Jalankan
php artisan config:clear
php artisan serve               # Terminal 1
npm run dev                     # Terminal 2
```
