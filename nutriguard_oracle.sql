-- ============================================================
--  NUTRI GUARD - Oracle DDL Script
--  Generated for Oracle Data Modeler
--  Project    : Aplikasi Manajemen Nutrisi "Nutri Guard"
--  Author     : NutriGuard Team
--  Created At : 2026-04-28
-- ============================================================

-- Drop tables in reverse order (child tables first)
DROP TABLE MESSAGES            CASCADE CONSTRAINTS PURGE;
DROP TABLE FAMILY_INVITATIONS  CASCADE CONSTRAINTS PURGE;
DROP TABLE MEAL_PLANS          CASCADE CONSTRAINTS PURGE;
DROP TABLE GROWTH_LOGS         CASCADE CONSTRAINTS PURGE;
DROP TABLE FOOD_LOGS           CASCADE CONSTRAINTS PURGE;
DROP TABLE RECIPES             CASCADE CONSTRAINTS PURGE;
DROP TABLE FAMILY_MEMBERS      CASCADE CONSTRAINTS PURGE;
DROP TABLE USERS               CASCADE CONSTRAINTS PURGE;

-- ============================================================
-- 1. USERS
--    Menyimpan akun pengguna beserta tracking scan AI harian
-- ============================================================
CREATE TABLE USERS (
    id                  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                VARCHAR2(255)   NOT NULL,
    email               VARCHAR2(255)   NOT NULL,
    avatar              VARCHAR2(255)   NULL,
    email_verified_at   TIMESTAMP       NULL,
    password            VARCHAR2(255)   NOT NULL,
    remember_token      VARCHAR2(100)   NULL,
    scan_count_today    NUMBER(3, 0)    DEFAULT 0 NOT NULL,
    scan_date           DATE            NULL,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_users_email UNIQUE (email)
);

COMMENT ON TABLE  USERS                  IS 'Akun pengguna aplikasi NutriGuard';
COMMENT ON COLUMN USERS.scan_count_today IS 'Jumlah scan AI yang sudah digunakan hari ini (max 15-20)';
COMMENT ON COLUMN USERS.scan_date        IS 'Tanggal terakhir scan digunakan, dipakai untuk reset harian';

-- ============================================================
-- 2. FAMILY_MEMBERS
--    Profil setiap anggota keluarga, termasuk data fisik & alergi
-- ============================================================
CREATE TABLE FAMILY_MEMBERS (
    id                  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             NUMBER          NOT NULL,
    linked_user_id      NUMBER          NULL,
    name                VARCHAR2(255)   NOT NULL,
    avatar              VARCHAR2(255)   NULL,
    role                VARCHAR2(20)    DEFAULT 'member' NOT NULL,
    gender              VARCHAR2(10)    NULL,
    birth_date          DATE            NULL,
    weight              NUMBER(5, 2)    NULL,           -- kg
    height              NUMBER(5, 2)    NULL,           -- cm
    activity_level      VARCHAR2(20)    DEFAULT 'sedentary' NOT NULL,
    health_goal         VARCHAR2(20)    DEFAULT 'maintenance' NOT NULL,
    daily_calorie_goal  NUMBER(6, 0)    DEFAULT 2000 NOT NULL,
    allergies           CLOB            NULL,           -- JSON array of allergen strings
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_fm_user_id        FOREIGN KEY (user_id)        REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_fm_linked_user_id FOREIGN KEY (linked_user_id) REFERENCES USERS(id) ON DELETE SET NULL,
    CONSTRAINT chk_fm_role          CHECK (role          IN ('parent', 'child', 'member')),
    CONSTRAINT chk_fm_gender        CHECK (gender        IN ('male', 'female')),
    CONSTRAINT chk_fm_activity      CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    CONSTRAINT chk_fm_health_goal   CHECK (health_goal   IN ('loss', 'maintenance', 'gain', 'growth'))
);

COMMENT ON TABLE  FAMILY_MEMBERS             IS 'Profil anggota keluarga yang dikelola oleh seorang pengguna';
COMMENT ON COLUMN FAMILY_MEMBERS.allergies   IS 'JSON array berisi daftar alergen, contoh: ["gluten","dairy","nuts"]';
COMMENT ON COLUMN FAMILY_MEMBERS.weight      IS 'Berat badan dalam kilogram';
COMMENT ON COLUMN FAMILY_MEMBERS.height      IS 'Tinggi badan dalam sentimeter';
COMMENT ON COLUMN FAMILY_MEMBERS.health_goal IS '"growth" dikhususkan untuk anak-anak';

-- ============================================================
-- 3. FOOD_LOGS
--    Jurnal makan harian hasil NutriScan (scan foto AI)
-- ============================================================
CREATE TABLE FOOD_LOGS (
    id                  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    family_member_id    NUMBER          NOT NULL,
    name                VARCHAR2(255)   NOT NULL,
    calories            NUMBER(6, 0)    NOT NULL,
    protein             NUMBER(6, 2)    DEFAULT 0 NOT NULL,    -- gram
    carbs               NUMBER(6, 2)    DEFAULT 0 NOT NULL,    -- gram
    fat                 NUMBER(6, 2)    DEFAULT 0 NOT NULL,    -- gram
    fiber               NUMBER(6, 2)    NULL,                  -- gram
    sodium              NUMBER(8, 2)    NULL,                  -- mg
    sugar               NUMBER(6, 2)    NULL,                  -- gram
    image_path          VARCHAR2(500)   NULL,
    eaten_at            TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    meal_type           VARCHAR2(15)    DEFAULT 'lunch' NOT NULL,
    tags                CLOB            NULL,                  -- JSON array
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_fl_family_member  FOREIGN KEY (family_member_id) REFERENCES FAMILY_MEMBERS(id) ON DELETE CASCADE,
    CONSTRAINT chk_fl_meal_type     CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'))
);

COMMENT ON TABLE  FOOD_LOGS            IS 'Jurnal asupan makanan harian per anggota keluarga (hasil NutriScan)';
COMMENT ON COLUMN FOOD_LOGS.image_path IS 'Path foto makanan — bersifat sementara, tidak disimpan permanen sesuai kebijakan privasi';
COMMENT ON COLUMN FOOD_LOGS.tags       IS 'JSON array tag tambahan, contoh: ["high-protein", "low-carb"]';

-- ============================================================
-- 4. GROWTH_LOGS
--    Riwayat pertumbuhan (berat & tinggi badan) anggota keluarga
-- ============================================================
CREATE TABLE GROWTH_LOGS (
    id                  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    family_member_id    NUMBER          NOT NULL,
    height              NUMBER(5, 2)    NOT NULL,   -- cm
    weight              NUMBER(5, 2)    NOT NULL,   -- kg
    recorded_at         DATE            NOT NULL,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_gl_family_member FOREIGN KEY (family_member_id) REFERENCES FAMILY_MEMBERS(id) ON DELETE CASCADE
);

COMMENT ON TABLE  GROWTH_LOGS IS 'Log historis tinggi dan berat badan anggota keluarga untuk pemantauan pertumbuhan';

-- ============================================================
-- 5. RECIPES
--    Bank resep yang direkomendasikan oleh FitChef
-- ============================================================
CREATE TABLE RECIPES (
    id                  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title               VARCHAR2(255)   NOT NULL,
    calories            NUMBER(6, 0)    NOT NULL,
    protein             NUMBER(6, 2)    DEFAULT 0 NOT NULL,    -- gram
    cook_time           VARCHAR2(50)    NOT NULL,
    image               VARCHAR2(500)   NULL,
    ingredients         CLOB            NULL,   -- JSON array of ingredient objects
    steps               CLOB            NULL,   -- JSON array of step strings
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE  RECIPES             IS 'Bank resep makanan untuk fitur rekomendasi FitChef';
COMMENT ON COLUMN RECIPES.ingredients IS 'JSON array bahan-bahan resep, contoh: [{"name":"ayam","qty":"200g"}]';
COMMENT ON COLUMN RECIPES.steps       IS 'JSON array langkah memasak, contoh: ["Cuci bahan...","Tumis bawang..."]';
COMMENT ON COLUMN RECIPES.cook_time   IS 'Estimasi waktu memasak, contoh: "30 menit"';

-- ============================================================
-- 6. MEAL_PLANS
--    Rencana makan ke depan per anggota keluarga
-- ============================================================
CREATE TABLE MEAL_PLANS (
    id                  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    family_member_id    NUMBER          NOT NULL,
    planned_date        DATE            NOT NULL,
    meal_type           VARCHAR2(15)    NOT NULL,
    name                VARCHAR2(255)   NOT NULL,
    calories            NUMBER(6, 0)    NULL,
    protein             NUMBER(6, 2)    NULL,   -- gram
    carbs               NUMBER(6, 2)    NULL,   -- gram
    fat                 NUMBER(6, 2)    NULL,   -- gram
    notes               CLOB            NULL,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_mp_family_member  FOREIGN KEY (family_member_id) REFERENCES FAMILY_MEMBERS(id) ON DELETE CASCADE,
    CONSTRAINT chk_mp_meal_type     CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'))
);

COMMENT ON TABLE MEAL_PLANS IS 'Rencana makan yang dijadwalkan ke depan untuk setiap anggota keluarga';

-- ============================================================
-- 7. FAMILY_INVITATIONS
--    Sistem undangan untuk bergabung dalam satu keluarga
-- ============================================================
CREATE TABLE FAMILY_INVITATIONS (
    id                  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id           NUMBER          NOT NULL,
    recipient_email     VARCHAR2(255)   NOT NULL,
    status              VARCHAR2(15)    DEFAULT 'pending' NOT NULL,
    token               VARCHAR2(255)   NOT NULL,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_fi_sender     FOREIGN KEY (sender_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT uq_fi_token      UNIQUE (token),
    CONSTRAINT chk_fi_status    CHECK (status IN ('pending', 'accepted', 'rejected'))
);

COMMENT ON TABLE  FAMILY_INVITATIONS       IS 'Undangan yang dikirim pengguna untuk mengajak anggota baru bergabung ke keluarganya';
COMMENT ON COLUMN FAMILY_INVITATIONS.token IS 'Token unik untuk validasi tautan undangan via email';

-- ============================================================
-- 8. MESSAGES
--    Pesan langsung antar pengguna aplikasi
-- ============================================================
CREATE TABLE MESSAGES (
    id                  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id           NUMBER          NOT NULL,
    recipient_id        NUMBER          NOT NULL,
    message             CLOB            NOT NULL,
    is_read             NUMBER(1, 0)    DEFAULT 0 NOT NULL,    -- 0=false, 1=true
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_msg_sender    FOREIGN KEY (sender_id)    REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_recipient FOREIGN KEY (recipient_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT chk_msg_is_read  CHECK (is_read IN (0, 1))
);

COMMENT ON TABLE  MESSAGES         IS 'Pesan langsung (direct message) antar pengguna aplikasi NutriGuard';
COMMENT ON COLUMN MESSAGES.is_read IS '0 = belum dibaca, 1 = sudah dibaca';

-- ============================================================
-- INDEXES
--    Untuk mempercepat query yang sering diakses
-- ============================================================
CREATE INDEX idx_fm_user_id           ON FAMILY_MEMBERS(user_id);
CREATE INDEX idx_fl_family_member_id  ON FOOD_LOGS(family_member_id);
CREATE INDEX idx_fl_eaten_at          ON FOOD_LOGS(eaten_at);
CREATE INDEX idx_gl_family_member_id  ON GROWTH_LOGS(family_member_id);
CREATE INDEX idx_mp_family_member_id  ON MEAL_PLANS(family_member_id);
CREATE INDEX idx_mp_planned_date      ON MEAL_PLANS(planned_date);
CREATE INDEX idx_fi_sender_id         ON FAMILY_INVITATIONS(sender_id);
CREATE INDEX idx_msg_sender_id        ON MESSAGES(sender_id);
CREATE INDEX idx_msg_recipient_id     ON MESSAGES(recipient_id);

-- ============================================================
-- END OF SCRIPT
-- ============================================================
