-- ============================================================
--  NUTRI GUARD - MySQL Schema v2 (Rancangan Ulang)
--  Engine     : MySQL 8.0+ / MariaDB 10.5+
--  Project    : Aplikasi Manajemen Nutrisi "Nutri Guard"
--  Version    : 2.0
--  Updated At : 2026-05-10
-- ============================================================
--
--  PERUBAHAN UTAMA DARI v1:
--  [+] Tabel baru: scan_quotas      - Normalisasi tracking scan harian dari tabel users
--  [+] Tabel baru: notifications    - Notifikasi in-app terpusat
--  [~] users          - Hapus avatar; tambah avatar_url, avatar_source, avatar_provider;
--                       hapus scan_count_today, scan_date (dipindah ke scan_quotas)
--  [~] family_members - Hapus weight, height (sudah ada di growth_logs); tambah soft delete;
--                       tambah avatar_url, avatar_source, avatar_provider;
--                       kolom allergies dikembalikan sebagai JSON
--  [~] growth_logs    - Tambah kolom bmi (computed), notes
--  [~] food_logs      - Tambah kolom source (manual/nutriscan/meal_plan), perbaiki presisi desimal
--  [~] meal_plans     - Tambah FK ke recipes, tambah is_completed & completed_at
--  [~] recipes        - Tambah carbs, fat, fiber; pisah time menjadi preparation_time +
--                       cooking_time (integer menit); tambah servings, difficulty, source
--  [~] family_invit.  - Tambah expires_at, responded_at; ubah status menjadi ENUM
--  [~] messages       - Tambah message_type, attachment_url, read_at, soft delete
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS scan_quotas;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS family_invitations;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS growth_logs;
DROP TABLE IF EXISTS food_logs;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS family_members;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. USERS
--    Hanya menyimpan data autentikasi inti.
--    Data profil visual (avatar/foto) dipindah ke profile_images.
--    Data scan harian dipindah ke scan_quotas.
-- ============================================================
CREATE TABLE users (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    name                VARCHAR(255)        NOT NULL,
    email               VARCHAR(255)        NOT NULL,
    email_verified_at   TIMESTAMP           NULL        DEFAULT NULL,
    password            VARCHAR(255)        NOT NULL,
    remember_token      VARCHAR(100)        NULL        DEFAULT NULL,
    avatar_url          VARCHAR(2048)       NULL        DEFAULT NULL    COMMENT 'URL foto profil: path lokal, URL API eksternal, atau Gravatar',
    avatar_source       ENUM(
                            'local',
                            'url',
                            'gravatar'
                        )                   NULL        DEFAULT 'gravatar' COMMENT 'Asal foto: file lokal, URL dari API eksternal, atau Gravatar',
    avatar_provider     VARCHAR(100)        NULL        DEFAULT NULL    COMMENT 'Penyedia API jika source=url: cloudinary, imgur, custom, dll',
    created_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP           NULL        DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE  KEY uq_users_email (email),
    INDEX   idx_users_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Akun pengguna. Foto profil disimpan langsung via avatar_url/avatar_source/avatar_provider.';


-- ============================================================
-- 2. SCAN_QUOTAS  [DIPINDAHKAN DARI USERS]
--    Melacak penggunaan NutriScan per user per hari.
--    Sebelumnya: scan_count_today + scan_date di tabel users
--    (tidak normal karena data transaksional bercampur dengan data profil).
-- ============================================================
CREATE TABLE scan_quotas (
    id          BIGINT UNSIGNED         NOT NULL AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED         NOT NULL,
    scan_date   DATE                    NOT NULL                        COMMENT 'Tanggal penggunaan scan',
    scan_count  SMALLINT UNSIGNED       NOT NULL    DEFAULT 0           COMMENT 'Jumlah scan terpakai pada hari tersebut (maks 20)',
    created_at  TIMESTAMP               NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP               NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE  KEY uq_sq_user_date     (user_id, scan_date),
    CONSTRAINT fk_sq_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Kuota NutriScan harian per pengguna (maks 20 scan/hari)';


-- ============================================================
-- 3. FAMILY_MEMBERS
--    Anggota keluarga yang dikelola oleh satu user.
--    PERUBAHAN: hapus weight & height (cukup di growth_logs);
--    tambah avatar_url/source/provider langsung; tambah soft delete.
-- ============================================================
CREATE TABLE family_members (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id             BIGINT UNSIGNED     NOT NULL                    COMMENT 'User pemilik anggota ini',
    linked_user_id      BIGINT UNSIGNED     NULL        DEFAULT NULL    COMMENT 'Akun user yang di-link (jika anggota punya akun sendiri)',
    name                VARCHAR(255)        NOT NULL,
    role                ENUM(
                            'parent',
                            'child',
                            'member'
                        )                   NOT NULL    DEFAULT 'member' COMMENT 'Peran dalam keluarga',
    gender              ENUM('male','female') NULL      DEFAULT NULL,
    birth_date          DATE                NULL        DEFAULT NULL,
    activity_level      ENUM(
                            'sedentary',
                            'light',
                            'moderate',
                            'active',
                            'very_active'
                        )                   NOT NULL    DEFAULT 'sedentary',
    health_goal         ENUM(
                            'loss',
                            'maintenance',
                            'gain',
                            'growth'
                        )                   NOT NULL    DEFAULT 'maintenance',
    daily_calorie_goal  SMALLINT UNSIGNED   NULL        DEFAULT NULL    COMMENT 'NULL = dihitung otomatis dari BMR/TDEE',
    allergies           JSON                NULL        DEFAULT NULL    COMMENT 'Array string nama alergen: ["Gluten","Seafood"]',
    avatar_url          VARCHAR(2048)       NULL        DEFAULT NULL    COMMENT 'URL foto profil anggota keluarga',
    avatar_source       ENUM(
                            'local',
                            'url',
                            'gravatar'
                        )                   NULL        DEFAULT NULL    COMMENT 'Asal foto: file lokal, URL dari API eksternal, atau Gravatar',
    avatar_provider     VARCHAR(100)        NULL        DEFAULT NULL    COMMENT 'Penyedia API jika source=url: cloudinary, imgur, custom, dll',
    created_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP           NULL        DEFAULT NULL,

    PRIMARY KEY (id),
    INDEX   idx_fm_user_id          (user_id),
    INDEX   idx_fm_linked_user_id   (linked_user_id),
    INDEX   idx_fm_deleted_at       (deleted_at),
    CONSTRAINT fk_fm_user_id
        FOREIGN KEY (user_id)        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_fm_linked_user_id
        FOREIGN KEY (linked_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Anggota keluarga yang dikelola pengguna. Berat/tinggi di growth_logs; foto profil via avatar_url.';


-- ============================================================
-- 4. GROWTH_LOGS
--    Riwayat perkembangan berat & tinggi badan.
--    PERUBAHAN: tambah kolom bmi (untuk display langsung tanpa hitung ulang),
--    tambah notes untuk catatan dokter.
-- ============================================================
CREATE TABLE growth_logs (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    family_member_id    BIGINT UNSIGNED     NOT NULL,
    height              DECIMAL(5,2)        NULL        DEFAULT NULL    COMMENT 'Tinggi badan dalam cm',
    weight              DECIMAL(5,2)        NULL        DEFAULT NULL    COMMENT 'Berat badan dalam kg',
    bmi                 DECIMAL(4,2)        NULL        DEFAULT NULL    COMMENT 'BMI = weight / (height/100)^2, disimpan agar tidak perlu hitung ulang',
    recorded_at         DATE                NOT NULL                    COMMENT 'Tanggal pengukuran',
    notes               TEXT                NULL        DEFAULT NULL    COMMENT 'Catatan pengukuran (e.g., setelah sakit, pertumbuhan cepat)',
    created_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX   idx_gl_family_member_id     (family_member_id),
    INDEX   idx_gl_recorded_at          (recorded_at),
    CONSTRAINT fk_gl_family_member_id
        FOREIGN KEY (family_member_id) REFERENCES family_members (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Riwayat berat & tinggi badan per anggota keluarga. Sumber data utama berat/tinggi (bukan family_members).';


-- ============================================================
-- 5. FOOD_LOGS
--    Log makanan harian per anggota keluarga.
--    PERUBAHAN: tambah kolom source (asal log), perbaiki presisi desimal,
--    hapus image_path (foto dihapus setelah diproses = tidak perlu disimpan).
-- ============================================================
CREATE TABLE food_logs (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    family_member_id    BIGINT UNSIGNED     NOT NULL,
    name                VARCHAR(255)        NOT NULL                    COMMENT 'Nama makanan/minuman',
    meal_type           ENUM(
                            'breakfast',
                            'lunch',
                            'dinner',
                            'snack'
                        )                   NOT NULL    DEFAULT 'lunch',
    source              ENUM(
                            'manual',
                            'nutriscan',
                            'meal_plan'
                        )                   NOT NULL    DEFAULT 'manual' COMMENT 'Cara makanan dicatat: diketik, dipindai NutriScan, atau dari rencana makan',
    calories            SMALLINT UNSIGNED   NOT NULL                    COMMENT 'Kalori dalam kkal',
    protein             DECIMAL(6,2)        NOT NULL    DEFAULT 0.00    COMMENT 'Protein dalam gram',
    carbs               DECIMAL(6,2)        NOT NULL    DEFAULT 0.00    COMMENT 'Karbohidrat dalam gram',
    fat                 DECIMAL(6,2)        NOT NULL    DEFAULT 0.00    COMMENT 'Lemak dalam gram',
    fiber               DECIMAL(6,2)        NULL        DEFAULT NULL    COMMENT 'Serat dalam gram',
    sodium              DECIMAL(8,2)        NULL        DEFAULT NULL    COMMENT 'Natrium dalam mg',
    sugar               DECIMAL(6,2)        NULL        DEFAULT NULL    COMMENT 'Gula dalam gram',
    eaten_at            TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu makan aktual',
    tags                JSON                NULL        DEFAULT NULL    COMMENT 'Tag nutrisi seperti ["high-protein","low-carb"]',
    created_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX   idx_fl_family_member_id     (family_member_id),
    INDEX   idx_fl_eaten_at             (eaten_at),
    INDEX   idx_fl_meal_type            (meal_type),
    INDEX   idx_fl_source               (source),
    INDEX   idx_fl_member_date          (family_member_id, eaten_at), -- Query paling sering: log anggota per hari
    CONSTRAINT fk_fl_family_member_id
        FOREIGN KEY (family_member_id) REFERENCES family_members (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Log makanan harian. Kolom source menunjukkan asal data (manual/NutriScan/meal plan).';


-- ============================================================
-- 6. RECIPES
--    Bank resep makanan sehat.
--    PERUBAHAN: tambah kolom carbs, fat, fiber; ganti kolom time (string)
--    menjadi preparation_time + cooking_time (integer menit - lebih terstruktur);
--    tambah servings, difficulty, source.
-- ============================================================
CREATE TABLE recipes (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    title               VARCHAR(255)        NOT NULL,
    description         TEXT                NULL        DEFAULT NULL    COMMENT 'Deskripsi singkat resep',
    calories            SMALLINT UNSIGNED   NOT NULL                    COMMENT 'Total kalori per sajian (kkal)',
    protein             DECIMAL(6,2)        NOT NULL    DEFAULT 0.00    COMMENT 'Protein per sajian (gram)',
    carbs               DECIMAL(6,2)        NOT NULL    DEFAULT 0.00    COMMENT 'Karbohidrat per sajian (gram)',
    fat                 DECIMAL(6,2)        NOT NULL    DEFAULT 0.00    COMMENT 'Lemak per sajian (gram)',
    fiber               DECIMAL(6,2)        NULL        DEFAULT NULL    COMMENT 'Serat per sajian (gram)',
    preparation_time    SMALLINT UNSIGNED   NULL        DEFAULT NULL    COMMENT 'Waktu persiapan dalam menit',
    cooking_time        SMALLINT UNSIGNED   NULL        DEFAULT NULL    COMMENT 'Waktu memasak dalam menit',
    servings            TINYINT UNSIGNED    NOT NULL    DEFAULT 1       COMMENT 'Jumlah sajian yang dihasilkan',
    difficulty          ENUM(
                            'easy',
                            'medium',
                            'hard'
                        )                   NOT NULL    DEFAULT 'easy',
    source              ENUM(
                            'ai_generated',
                            'manual',
                            'imported'
                        )                   NOT NULL    DEFAULT 'ai_generated' COMMENT 'Asal resep: dibuat AI (FitChef), input manual, atau impor',
    image               VARCHAR(500)        NULL        DEFAULT NULL,
    ingredients         JSON                NOT NULL                    COMMENT 'Array bahan-bahan: [{"name":"...", "amount":"..."}]',
    steps               JSON                NOT NULL                    COMMENT 'Array langkah memasak: ["Langkah 1...","Langkah 2..."]',
    created_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX   idx_rc_difficulty   (difficulty),
    INDEX   idx_rc_source       (source),
    INDEX   idx_rc_calories     (calories)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Bank resep makanan sehat. Termasuk resep yang dibuat oleh FitChef AI.';


-- ============================================================
-- 7. MEAL_PLANS
--     Rencana makan mingguan per anggota keluarga.
--     PERUBAHAN: tambah FK opsional ke recipes, tambah is_completed + completed_at
--     sehingga bisa dilacak apakah rencana benar-benar dijalankan.
-- ============================================================
CREATE TABLE meal_plans (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    family_member_id    BIGINT UNSIGNED     NOT NULL,
    recipe_id           BIGINT UNSIGNED     NULL        DEFAULT NULL    COMMENT 'Link ke resep jika rencana makan diambil dari bank resep',
    planned_date        DATE                NOT NULL,
    meal_type           ENUM(
                            'breakfast',
                            'lunch',
                            'dinner',
                            'snack'
                        )                   NOT NULL,
    name                VARCHAR(255)        NOT NULL                    COMMENT 'Nama makanan yang direncanakan',
    calories            SMALLINT UNSIGNED   NULL        DEFAULT NULL    COMMENT 'Estimasi kalori (kkal)',
    protein             DECIMAL(6,2)        NULL        DEFAULT NULL    COMMENT 'Estimasi protein (gram)',
    carbs               DECIMAL(6,2)        NULL        DEFAULT NULL    COMMENT 'Estimasi karbohidrat (gram)',
    fat                 DECIMAL(6,2)        NULL        DEFAULT NULL    COMMENT 'Estimasi lemak (gram)',
    notes               TEXT                NULL        DEFAULT NULL,
    is_completed        TINYINT(1)          NOT NULL    DEFAULT 0       COMMENT '1 = rencana sudah terlaksana (food_log sudah dibuat)',
    completed_at        TIMESTAMP           NULL        DEFAULT NULL    COMMENT 'Waktu rencana ditandai selesai',
    created_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX   idx_mp_family_member_id     (family_member_id),
    INDEX   idx_mp_planned_date         (planned_date),
    INDEX   idx_mp_recipe_id            (recipe_id),
    INDEX   idx_mp_member_date          (family_member_id, planned_date), -- Query paling sering: rencana minggu ini
    CONSTRAINT fk_mp_family_member_id
        FOREIGN KEY (family_member_id) REFERENCES family_members (id) ON DELETE CASCADE,
    CONSTRAINT fk_mp_recipe_id
        FOREIGN KEY (recipe_id)        REFERENCES recipes         (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Rencana makan mingguan. is_completed melacak apakah rencana benar-benar dijalankan.';


-- ============================================================
-- 8. FAMILY_INVITATIONS
--     Undangan bergabung ke grup keluarga.
--     PERUBAHAN: tambah expires_at (token harus punya masa berlaku),
--     tambah responded_at, ubah status menjadi ENUM.
-- ============================================================
CREATE TABLE family_invitations (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    sender_id       BIGINT UNSIGNED     NOT NULL                        COMMENT 'User yang mengirim undangan',
    recipient_email VARCHAR(255)        NOT NULL                        COMMENT 'Email yang diundang',
    status          ENUM(
                        'pending',
                        'accepted',
                        'rejected',
                        'expired'
                    )                   NOT NULL    DEFAULT 'pending',
    token           VARCHAR(255)        NOT NULL                        COMMENT 'Token unik untuk link undangan',
    expires_at      TIMESTAMP           NOT NULL                        COMMENT 'Batas waktu token berlaku (default: 7 hari)',
    responded_at    TIMESTAMP           NULL        DEFAULT NULL        COMMENT 'Waktu penerima merespons (accept/reject)',
    created_at      TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE  KEY uq_fi_token         (token),
    INDEX   idx_fi_sender_id        (sender_id),
    INDEX   idx_fi_recipient_email  (recipient_email),
    INDEX   idx_fi_status           (status),
    CONSTRAINT fk_fi_sender_id
        FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Undangan bergabung ke keluarga. Token berlaku 7 hari; status expired diset oleh scheduled job.';


-- ============================================================
-- 9. MESSAGES
--     Pesan langsung antar pengguna (family chat).
--     PERUBAHAN: tambah message_type, attachment_url, read_at, soft delete.
-- ============================================================
CREATE TABLE messages (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    sender_id       BIGINT UNSIGNED     NOT NULL,
    recipient_id    BIGINT UNSIGNED     NOT NULL,
    message         TEXT                NULL        DEFAULT NULL        COMMENT 'Isi pesan teks (nullable jika tipe non-text)',
    message_type    ENUM(
                        'text',
                        'image',
                        'file'
                    )                   NOT NULL    DEFAULT 'text',
    attachment_url  VARCHAR(2048)       NULL        DEFAULT NULL        COMMENT 'URL lampiran untuk tipe image atau file',
    is_read         TINYINT(1)          NOT NULL    DEFAULT 0,
    read_at         TIMESTAMP           NULL        DEFAULT NULL        COMMENT 'Waktu pesan pertama dibaca',
    created_at      TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP           NULL        DEFAULT NULL,       -- Soft delete (pesan dihapus dari sisi pengirim/penerima)

    PRIMARY KEY (id),
    INDEX   idx_msg_sender_id       (sender_id),
    INDEX   idx_msg_recipient_id    (recipient_id),
    INDEX   idx_msg_is_read         (recipient_id, is_read),           -- Query utama: pesan belum dibaca
    INDEX   idx_msg_conversation    (sender_id, recipient_id, created_at), -- Riwayat percakapan
    CONSTRAINT fk_msg_sender_id
        FOREIGN KEY (sender_id)    REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_recipient_id
        FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Pesan antar pengguna dalam satu grup keluarga. Mendukung teks, gambar, dan file.';


-- ============================================================
-- 10. NOTIFICATIONS  [FITUR BARU]
--     Notifikasi in-app terpusat untuk semua jenis peringatan:
--     kesehatan, undangan, pesan, dan sistem.
--     Menggantikan logika notifikasi yang tersebar di berbagai controller.
-- ============================================================
CREATE TABLE notifications (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED     NOT NULL,
    type        ENUM(
                    'health_warning',   -- Peringatan kalori berlebih/kurang
                    'invitation',       -- Undangan bergabung keluarga
                    'message',          -- Pesan baru dari anggota keluarga
                    'system'            -- Pengumuman atau info dari sistem
                )                   NOT NULL,
    title       VARCHAR(255)        NOT NULL,
    body        TEXT                NOT NULL,
    data        JSON                NULL        DEFAULT NULL            COMMENT 'Data tambahan (e.g., {"member_id":5, "calories":2500})',
    is_read     TINYINT(1)          NOT NULL    DEFAULT 0,
    read_at     TIMESTAMP           NULL        DEFAULT NULL,
    created_at  TIMESTAMP           NOT NULL    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX   idx_notif_user_id       (user_id),
    INDEX   idx_notif_unread        (user_id, is_read),                -- Query utama: jumlah notif belum dibaca
    INDEX   idx_notif_type          (type),
    CONSTRAINT fk_notif_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Notifikasi in-app terpusat. Mencakup peringatan kesehatan, undangan, pesan baru, dan info sistem.';


-- ============================================================
-- TABEL FRAMEWORK LARAVEL (tidak diubah)
-- ============================================================

CREATE TABLE password_reset_tokens (
    email       VARCHAR(255)    NOT NULL,
    token       VARCHAR(255)    NOT NULL,
    created_at  TIMESTAMP       NULL DEFAULT NULL,
    PRIMARY KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
    id              VARCHAR(255)    NOT NULL,
    user_id         BIGINT UNSIGNED NULL DEFAULT NULL,
    ip_address      VARCHAR(45)     NULL DEFAULT NULL,
    user_agent      TEXT            NULL DEFAULT NULL,
    payload         LONGTEXT        NOT NULL,
    last_activity   INT             NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_sessions_user_id      (user_id),
    INDEX idx_sessions_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE personal_access_tokens (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tokenable_type  VARCHAR(255)    NOT NULL,
    tokenable_id    BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    token           VARCHAR(64)     NOT NULL,
    abilities       TEXT            NULL DEFAULT NULL,
    last_used_at    TIMESTAMP       NULL DEFAULT NULL,
    expires_at      TIMESTAMP       NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pat_token (token),
    INDEX idx_pat_tokenable (tokenable_type, tokenable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


