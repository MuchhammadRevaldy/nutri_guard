# Nutri Guard

Selamat datang di repositori aplikasi Nutri Guard! Repositori ini berisi source code untuk aplikasi yang dibangun menggunakan **Laravel** (Backend), **React.js / Inertia.js** (Frontend), dan **Python** (untuk fitur kecerdasan buatan / AI).

## 📌 Prasyarat Sistem
Pastikan komputer / laptop Anda sudah terinstal perangkat lunak berikut:
- PHP >= 8.1
- Composer
- Node.js & NPM
- Python 3.x & Pip
- Laragon atau XAMPP (untuk database MySQL/MariaDB)

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Kloning Repositori
Silakan buka terminal (Command Prompt / PowerShell) atau terminal bawaan VS Code, lalu arahkan ke tempat Anda akan menyimpan file dan jalankan:
```bash
git clone <URL_REPOSITORY>
cd nutri_guard
```

### 2. Setup Backend (Laravel)
Jalankan perintah berikut pada terminal yang sedang berada di folder `nutri_guard`:
```bash
# Instal dependensi PHP (Laravel)
composer install

# Buat salinan file konfigurasi
copy .env.example .env
```
Buka file `.env` dan atur informasi koneksi database Anda (biasanya otomatis jika namanya `nutri_guard`). Contohnya:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutri_guard
DB_USERNAME=root
DB_PASSWORD=
```

Kemudian, generate application key (Kunci Rahasia Aplikasi):
```bash
php artisan key:generate
```

### 3. Setup Konfigurasi Database & Migrasi (Laragon & XAMPP)

Sebelum menjalankan perintah migrasi untuk membuat tabel-tabel di database, Anda wajib membuat nama databasenya terlebih dahulu.

#### A. Jika Menggunakan Laragon (Sangat Disarankan)
1. Buka aplikasi **Laragon** lalu klik **Start All**.
2. Klik tombol **Database** di Laragon (biasanya akan otomatis membuka HeidiSQL atau aplikasi manajemen DB bawaan).
3. Login ke local server (Host: `127.0.0.1`, User: `root`, Password dikosongkan).
4. Klik kanan pada panel root, pilih **Create new** -> **Database**.
5. Beri nama `nutri_guard`, lalu klik OK.

#### B. Jika Menggunakan XAMPP
1. Buka **XAMPP Control Panel**.
2. Klik tombol **Start** pada modul **Apache** dan **MySQL**.
3. Klik tombol **Admin** pada modul MySQL, ini akan membuka browser ke halaman **phpMyAdmin** (`http://localhost/phpmyadmin/`).
4. Pada menu di sebelah kiri atas, klik **New** atau **Baru**.
5. Masukkan nama basis data `nutri_guard`, lalu klik tombol **Create / Buat**.

#### Menjalankan Migrasi
Setelah database `nutri_guard` terbentuk di Laragon atau XAMPP, silakan kembali ke terminal/VS Code Anda, lalu jalankan:
```bash
# Membuat tabel-tabel di dalam database
php artisan migrate

# Jika Anda juga ingin mengisi tabel dengan dummy data (Opsional)
php artisan db:seed

# Membuat link untuk folder penyimpanan (seperti gambar profil, dll)
php artisan storage:link
```

### 4. Setup Frontend (React / Inertia)
Gunakan terminal untuk menginstal seluruh package JavaScript yang dibutuhkan ke dalam folder `node_modules`.
```bash
npm install
```

### 5. Setup Layanan Python (Untuk Fitur AI)
Fitur scanning atau AI chatbot pada aplikasi ini dikendalikan oleh service Python dan Machine Learning.
Silakan buka terminal **baru**, lalu jalankan instalasi *library* berikut:
```bash
# Masuk ke folder service Python
cd services/python

# Instal library yang dibutuhkan via pip
pip install -r requirements.txt
```
*(Catatan: Ukuran library PyTorch bisa hingga 2GB lebih. Jika Anda tidak butuh komputasi GPU / Nvidia, disarankan paksa install versi CPU agar ukurannya lebih kecil menggunakan perintah:)*  
`pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu`

### 6. Menjalankan Aplikasi
Kini semuanya telah siap. Anda perlu menjalankan Backend (PHP) dan Frontend (Vite) secara bersamaan di 2 terminal (tab) yang berbeda:

**Terminal 1 (Backend - Laravel):**
```bash
php artisan serve
```

**Terminal 2 (Frontend - Vite / React):**
```bash
npm run dev
```

Aplikasi sekarang sudah berjalan! Silakan buka browser Anda dan ketikkan alamat: **http://localhost:8000**

---

## 🔑 Konfigurasi API Keys (Wajib Diisi!)
Beberapa fitur spesifik (Chat AI, Scanning Gizi, dll) memerlukan kunci API dari pihak ketiga. Silakan buka file `.env` di folder root dan lengkapi baris ini apabila Anda memilikinya:
```env
OPENAI_API_KEY=masukkan_api_key_disini
GOOGLE_API_KEY=masukkan_api_key_disini
GROQ_API_KEY=masukkan_api_key_disini
```

---
**⚠️ Catatan untuk Deployment Server:**
Aplikasi ini memanfaatkan program Python serta memori yang di-*consume* oleh library Machine Learning. Disarankan untuk **TIDAK** menggunakan *Shared Hosting (seperti cPanel)*, melainkan silakan sediakan **VPS (Virtual Private Server)** dari layanan seperti AWS, DigitalOcean, Linode, atau sejenisnya, sebab Anda memerlukan akses *root* SSH untuk menyetel *environment* secara utuh dan terhindar dari *Out-of-Memory*.
