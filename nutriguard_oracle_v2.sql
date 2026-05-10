-- ============================================================
--  NUTRI GUARD - Oracle DDL Script v2 (Rancangan Ulang)
--  Engine     : Oracle Database 19c+
--  Project    : Aplikasi Manajemen Nutrisi "Nutri Guard"
--  Version    : 2.0
--  Updated At : 2026-05-10
-- ============================================================
--
--  PERUBAHAN DARI v1:
--  [+] SCAN_QUOTAS      - Normalisasi scan harian dari USERS (baru)
--  [+] NOTIFICATIONS    - Notifikasi in-app terpusat (baru)
--  [~] USERS            - Hapus avatar; tambah AVATAR_URL, AVATAR_SOURCE, AVATAR_PROVIDER;
--                         hapus scan_count_today, scan_date (ke SCAN_QUOTAS)
--  [~] FAMILY_MEMBERS   - Hapus weight, height; tambah AVATAR_URL/SOURCE/PROVIDER;
--                         ALLERGIES dikembalikan sbg JSON; tambah DELETED_AT
--  [~] GROWTH_LOGS      - Tambah BMI, NOTES
--  [~] FOOD_LOGS        - Tambah SOURCE; hapus IMAGE_PATH
--  [~] MEAL_PLANS       - Tambah FK RECIPE_ID, IS_COMPLETED, COMPLETED_AT
--  [~] RECIPES          - Tambah CARBS, FAT, FIBER, PREP_TIME, COOK_TIME,
--                         SERVINGS, DIFFICULTY, SOURCE; ganti TIME (VARCHAR)
--  [~] FAMILY_INVIT.    - Tambah EXPIRES_AT, RESPONDED_AT; STATUS jadi CHECK
--  [~] MESSAGES         - Tambah MESSAGE_TYPE, ATTACHMENT_URL, READ_AT, DELETED_AT
-- ============================================================

-- Drop tabels (child tables first)
BEGIN
    FOR t IN (
        SELECT table_name FROM user_tables
        WHERE table_name IN (
            'NOTIFICATIONS','SCAN_QUOTAS','MESSAGES',
            'FAMILY_INVITATIONS','MEAL_PLANS','GROWTH_LOGS',
            'FOOD_LOGS','RECIPES','FAMILY_MEMBERS','USERS'
        )
    ) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
    END LOOP;
END;
/

-- Drop sequences
BEGIN
    FOR s IN (
        SELECT sequence_name FROM user_sequences
        WHERE sequence_name IN (
            'SEQ_USERS','SEQ_SCAN_QUOTAS',
            'SEQ_FAMILY_MEMBERS','SEQ_GROWTH_LOGS','SEQ_FOOD_LOGS',
            'SEQ_RECIPES','SEQ_MEAL_PLANS','SEQ_FAMILY_INVITATIONS',
            'SEQ_MESSAGES','SEQ_NOTIFICATIONS'
        )
    ) LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.sequence_name;
    END LOOP;
END;
/


-- ============================================================
-- 1. USERS
--    Hanya data autentikasi. Avatar -> PROFILE_IMAGES.
--    Scan tracking -> SCAN_QUOTAS.
-- ============================================================
CREATE SEQUENCE SEQ_USERS START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE TABLE USERS (
    ID                  NUMBER          DEFAULT SEQ_USERS.NEXTVAL   NOT NULL,
    NAME                VARCHAR2(255)                               NOT NULL,
    EMAIL               VARCHAR2(255)                               NOT NULL,
    EMAIL_VERIFIED_AT   TIMESTAMP                                   NULL,
    PASSWORD            VARCHAR2(255)                               NOT NULL,
    REMEMBER_TOKEN      VARCHAR2(100)                               NULL,
    AVATAR_URL          VARCHAR2(2048)                              NULL,        -- URL foto profil: lokal, API eksternal, atau Gravatar
    AVATAR_SOURCE       VARCHAR2(20)                                NULL,        -- 'local' | 'url' | 'gravatar'
    AVATAR_PROVIDER     VARCHAR2(100)                               NULL,        -- 'cloudinary' | 'imgur' | 'custom' | dll
    CREATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP        NOT NULL,
    UPDATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP        NOT NULL,
    DELETED_AT          TIMESTAMP                                   NULL,        -- Soft delete

    CONSTRAINT PK_USERS             PRIMARY KEY (ID),
    CONSTRAINT UQ_USERS_EMAIL       UNIQUE (EMAIL),
    CONSTRAINT CHK_USERS_AVT_SRC    CHECK (AVATAR_SOURCE IS NULL OR AVATAR_SOURCE IN ('local','url','gravatar'))
);

CREATE INDEX IDX_USERS_DELETED_AT ON USERS (DELETED_AT);

COMMENT ON TABLE  USERS                     IS 'Akun pengguna. Foto profil disimpan langsung via AVATAR_URL/SOURCE/PROVIDER.';
COMMENT ON COLUMN USERS.AVATAR_URL          IS 'URL foto profil: path lokal, URL dari API eksternal, atau Gravatar URL';
COMMENT ON COLUMN USERS.AVATAR_SOURCE       IS 'Asal foto: local=upload, url=API eksternal, gravatar=otomatis dari email';
COMMENT ON COLUMN USERS.AVATAR_PROVIDER     IS 'Penyedia API jika AVATAR_SOURCE=url: cloudinary, imgur, custom, dll';
COMMENT ON COLUMN USERS.DELETED_AT          IS 'Soft delete: tidak NULL berarti akun sudah dihapus';


-- ============================================================
-- 2. SCAN_QUOTAS  [DIPINDAHKAN DARI USERS]
--    Tracking penggunaan NutriScan per user per hari.
-- ============================================================
CREATE SEQUENCE SEQ_SCAN_QUOTAS START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE TABLE SCAN_QUOTAS (
    ID          NUMBER      DEFAULT SEQ_SCAN_QUOTAS.NEXTVAL NOT NULL,
    USER_ID     NUMBER                                      NOT NULL,
    SCAN_DATE   DATE                                        NOT NULL,
    SCAN_COUNT  NUMBER(5)   DEFAULT 0                       NOT NULL,
    CREATED_AT  TIMESTAMP   DEFAULT SYSTIMESTAMP            NOT NULL,
    UPDATED_AT  TIMESTAMP   DEFAULT SYSTIMESTAMP            NOT NULL,

    CONSTRAINT PK_SCAN_QUOTAS          PRIMARY KEY (ID),
    CONSTRAINT UQ_SQ_USER_DATE         UNIQUE (USER_ID, SCAN_DATE),
    CONSTRAINT CHK_SQ_SCAN_COUNT       CHECK (SCAN_COUNT >= 0 AND SCAN_COUNT <= 20),
    CONSTRAINT FK_SQ_USER_ID           FOREIGN KEY (USER_ID) REFERENCES USERS (ID) ON DELETE CASCADE
);

COMMENT ON TABLE  SCAN_QUOTAS           IS 'Kuota NutriScan harian per pengguna (maks 20 scan/hari). Dipindah dari kolom users.';
COMMENT ON COLUMN SCAN_QUOTAS.SCAN_DATE IS 'Tanggal penggunaan (satu baris per user per hari)';


-- ============================================================
-- 3. FAMILY_MEMBERS
--    Anggota keluarga yang dikelola satu user.
-- ============================================================
CREATE SEQUENCE SEQ_FAMILY_MEMBERS START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE TABLE FAMILY_MEMBERS (
    ID                  NUMBER          DEFAULT SEQ_FAMILY_MEMBERS.NEXTVAL  NOT NULL,
    USER_ID             NUMBER                                              NOT NULL,
    LINKED_USER_ID      NUMBER                                              NULL,
    NAME                VARCHAR2(255)                                       NOT NULL,
    ROLE                VARCHAR2(20)    DEFAULT 'member'                    NOT NULL,
    GENDER              VARCHAR2(10)                                        NULL,
    BIRTH_DATE          DATE                                                NULL,
    ACTIVITY_LEVEL      VARCHAR2(20)    DEFAULT 'sedentary'                 NOT NULL,
    HEALTH_GOAL         VARCHAR2(20)    DEFAULT 'maintenance'               NOT NULL,
    DAILY_CALORIE_GOAL  NUMBER(5)                                           NULL,     -- NULL = hitung otomatis dari BMR/TDEE
    ALLERGIES           CLOB                                                NULL,     -- JSON array: ["Gluten","Seafood"]
    AVATAR_URL          VARCHAR2(2048)                                      NULL,     -- URL foto profil anggota keluarga
    AVATAR_SOURCE       VARCHAR2(20)                                        NULL,     -- 'local' | 'url' | 'gravatar'
    AVATAR_PROVIDER     VARCHAR2(100)                                       NULL,     -- penyedia API jika source=url
    CREATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP                NOT NULL,
    UPDATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP                NOT NULL,
    DELETED_AT          TIMESTAMP                                           NULL,

    CONSTRAINT PK_FAMILY_MEMBERS            PRIMARY KEY (ID),
    CONSTRAINT CHK_FM_ROLE                  CHECK (ROLE IN ('parent','child','member')),
    CONSTRAINT CHK_FM_GENDER                CHECK (GENDER IS NULL OR GENDER IN ('male','female')),
    CONSTRAINT CHK_FM_ACTIVITY_LEVEL        CHECK (ACTIVITY_LEVEL IN ('sedentary','light','moderate','active','very_active')),
    CONSTRAINT CHK_FM_HEALTH_GOAL           CHECK (HEALTH_GOAL IN ('loss','maintenance','gain','growth')),
    CONSTRAINT FK_FM_USER_ID                FOREIGN KEY (USER_ID)        REFERENCES USERS (ID) ON DELETE CASCADE,
    CONSTRAINT FK_FM_LINKED_USER_ID         FOREIGN KEY (LINKED_USER_ID) REFERENCES USERS (ID) ON DELETE SET NULL,
    CONSTRAINT CHK_FM_AVT_SRC               CHECK (AVATAR_SOURCE IS NULL OR AVATAR_SOURCE IN ('local','url','gravatar'))
);

CREATE INDEX IDX_FM_USER_ID         ON FAMILY_MEMBERS (USER_ID);
CREATE INDEX IDX_FM_LINKED_USER_ID  ON FAMILY_MEMBERS (LINKED_USER_ID);
CREATE INDEX IDX_FM_DELETED_AT      ON FAMILY_MEMBERS (DELETED_AT);

COMMENT ON TABLE  FAMILY_MEMBERS                    IS 'Anggota keluarga. Berat/tinggi di GROWTH_LOGS; foto profil via AVATAR_URL.';
COMMENT ON COLUMN FAMILY_MEMBERS.LINKED_USER_ID     IS 'Akun user yang terhubung ke anggota ini (jika anggota punya akun sendiri)';
COMMENT ON COLUMN FAMILY_MEMBERS.DAILY_CALORIE_GOAL IS 'NULL = dihitung otomatis dari Mifflin-St Jeor BMR × aktivitas ± goal';
COMMENT ON COLUMN FAMILY_MEMBERS.ALLERGIES          IS 'JSON array nama alergen: ["Gluten","Seafood","Telur"]';
COMMENT ON COLUMN FAMILY_MEMBERS.AVATAR_URL         IS 'URL foto profil anggota keluarga';
COMMENT ON COLUMN FAMILY_MEMBERS.AVATAR_SOURCE      IS 'Asal foto: local=upload, url=API eksternal, gravatar=dari email';
COMMENT ON COLUMN FAMILY_MEMBERS.AVATAR_PROVIDER    IS 'Penyedia API jika AVATAR_SOURCE=url';


-- ============================================================
-- 4. GROWTH_LOGS
-- ============================================================
CREATE SEQUENCE SEQ_GROWTH_LOGS START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE TABLE GROWTH_LOGS (
    ID                  NUMBER          DEFAULT SEQ_GROWTH_LOGS.NEXTVAL NOT NULL,
    FAMILY_MEMBER_ID    NUMBER                                          NOT NULL,
    HEIGHT              NUMBER(5,2)                                     NULL,   -- cm
    WEIGHT              NUMBER(5,2)                                     NULL,   -- kg
    BMI                 NUMBER(4,2)                                     NULL,   -- weight / (height/100)^2
    RECORDED_AT         DATE                                            NOT NULL,
    NOTES               CLOB                                            NULL,
    CREATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP            NOT NULL,
    UPDATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP            NOT NULL,

    CONSTRAINT PK_GROWTH_LOGS           PRIMARY KEY (ID),
    CONSTRAINT FK_GL_FAMILY_MEMBER_ID   FOREIGN KEY (FAMILY_MEMBER_ID) REFERENCES FAMILY_MEMBERS (ID) ON DELETE CASCADE
);

CREATE INDEX IDX_GL_FAMILY_MEMBER_ID    ON GROWTH_LOGS (FAMILY_MEMBER_ID);
CREATE INDEX IDX_GL_RECORDED_AT         ON GROWTH_LOGS (RECORDED_AT);

COMMENT ON TABLE  GROWTH_LOGS       IS 'Riwayat berat & tinggi badan. Sumber data aktual berat/tinggi (bukan FAMILY_MEMBERS).';
COMMENT ON COLUMN GROWTH_LOGS.BMI   IS 'BMI yang sudah dihitung saat simpan agar tidak perlu rekalkukasi';
COMMENT ON COLUMN GROWTH_LOGS.NOTES IS 'Catatan pengukuran: kondisi saat diukur, catatan dokter, dll';


-- ============================================================
-- 5. FOOD_LOGS
-- ============================================================
CREATE SEQUENCE SEQ_FOOD_LOGS START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE TABLE FOOD_LOGS (
    ID                  NUMBER          DEFAULT SEQ_FOOD_LOGS.NEXTVAL   NOT NULL,
    FAMILY_MEMBER_ID    NUMBER                                          NOT NULL,
    NAME                VARCHAR2(255)                                   NOT NULL,
    MEAL_TYPE           VARCHAR2(15)                                    NOT NULL,
    SOURCE              VARCHAR2(15)    DEFAULT 'manual'                NOT NULL,   -- manual | nutriscan | meal_plan
    CALORIES            NUMBER(5)                                       NOT NULL,
    PROTEIN             NUMBER(6,2)     DEFAULT 0                       NOT NULL,
    CARBS               NUMBER(6,2)     DEFAULT 0                       NOT NULL,
    FAT                 NUMBER(6,2)     DEFAULT 0                       NOT NULL,
    FIBER               NUMBER(6,2)                                     NULL,
    SODIUM              NUMBER(8,2)                                     NULL,
    SUGAR               NUMBER(6,2)                                     NULL,
    EATEN_AT            TIMESTAMP       DEFAULT SYSTIMESTAMP            NOT NULL,
    TAGS                CLOB                                            NULL,       -- JSON array
    CREATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP            NOT NULL,
    UPDATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP            NOT NULL,

    CONSTRAINT PK_FOOD_LOGS             PRIMARY KEY (ID),
    CONSTRAINT CHK_FL_MEAL_TYPE         CHECK (MEAL_TYPE IN ('breakfast','lunch','dinner','snack')),
    CONSTRAINT CHK_FL_SOURCE            CHECK (SOURCE IN ('manual','nutriscan','meal_plan')),
    CONSTRAINT CHK_FL_CALORIES          CHECK (CALORIES >= 0),
    CONSTRAINT FK_FL_FAMILY_MEMBER_ID   FOREIGN KEY (FAMILY_MEMBER_ID) REFERENCES FAMILY_MEMBERS (ID) ON DELETE CASCADE
);

CREATE INDEX IDX_FL_FAMILY_MEMBER_ID    ON FOOD_LOGS (FAMILY_MEMBER_ID);
CREATE INDEX IDX_FL_EATEN_AT            ON FOOD_LOGS (EATEN_AT);
CREATE INDEX IDX_FL_MEAL_TYPE           ON FOOD_LOGS (MEAL_TYPE);
CREATE INDEX IDX_FL_SOURCE              ON FOOD_LOGS (SOURCE);
CREATE INDEX IDX_FL_MEMBER_DATE         ON FOOD_LOGS (FAMILY_MEMBER_ID, EATEN_AT);

COMMENT ON TABLE  FOOD_LOGS         IS 'Log makanan harian per anggota keluarga.';
COMMENT ON COLUMN FOOD_LOGS.SOURCE  IS 'Asal data: manual=diketik, nutriscan=AI scan, meal_plan=dari rencana makan';


-- ============================================================
-- 6. RECIPES
-- ============================================================
CREATE SEQUENCE SEQ_RECIPES START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE TABLE RECIPES (
    ID                  NUMBER          DEFAULT SEQ_RECIPES.NEXTVAL NOT NULL,
    TITLE               VARCHAR2(255)                               NOT NULL,
    DESCRIPTION         CLOB                                        NULL,
    CALORIES            NUMBER(5)                                   NOT NULL,
    PROTEIN             NUMBER(6,2)     DEFAULT 0                   NOT NULL,
    CARBS               NUMBER(6,2)     DEFAULT 0                   NOT NULL,
    FAT                 NUMBER(6,2)     DEFAULT 0                   NOT NULL,
    FIBER               NUMBER(6,2)                                 NULL,
    PREPARATION_TIME    NUMBER(5)                                   NULL,         -- menit
    COOKING_TIME        NUMBER(5)                                   NULL,         -- menit
    SERVINGS            NUMBER(3)       DEFAULT 1                   NOT NULL,
    DIFFICULTY          VARCHAR2(10)    DEFAULT 'easy'              NOT NULL,
    SOURCE              VARCHAR2(15)    DEFAULT 'ai_generated'      NOT NULL,
    IMAGE               VARCHAR2(500)                               NULL,
    INGREDIENTS         CLOB                                        NOT NULL,     -- JSON array
    STEPS               CLOB                                        NOT NULL,     -- JSON array
    CREATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP        NOT NULL,
    UPDATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP        NOT NULL,

    CONSTRAINT PK_RECIPES               PRIMARY KEY (ID),
    CONSTRAINT CHK_RC_DIFFICULTY        CHECK (DIFFICULTY IN ('easy','medium','hard')),
    CONSTRAINT CHK_RC_SOURCE            CHECK (SOURCE IN ('ai_generated','manual','imported')),
    CONSTRAINT CHK_RC_CALORIES          CHECK (CALORIES >= 0),
    CONSTRAINT CHK_RC_SERVINGS          CHECK (SERVINGS >= 1)
);

CREATE INDEX IDX_RC_DIFFICULTY  ON RECIPES (DIFFICULTY);
CREATE INDEX IDX_RC_SOURCE      ON RECIPES (SOURCE);
CREATE INDEX IDX_RC_CALORIES    ON RECIPES (CALORIES);

COMMENT ON TABLE  RECIPES                   IS 'Bank resep makanan sehat, termasuk resep AI dari FitChef.';
COMMENT ON COLUMN RECIPES.PREPARATION_TIME  IS 'Waktu persiapan bahan dalam menit';
COMMENT ON COLUMN RECIPES.COOKING_TIME      IS 'Waktu memasak aktual dalam menit';
COMMENT ON COLUMN RECIPES.SOURCE            IS 'ai_generated=dari FitChef, manual=input pengguna, imported=dari sumber luar';


-- ============================================================
-- 7. MEAL_PLANS
-- ============================================================
CREATE SEQUENCE SEQ_MEAL_PLANS START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE TABLE MEAL_PLANS (
    ID                  NUMBER          DEFAULT SEQ_MEAL_PLANS.NEXTVAL  NOT NULL,
    FAMILY_MEMBER_ID    NUMBER                                          NOT NULL,
    RECIPE_ID           NUMBER                                          NULL,
    PLANNED_DATE        DATE                                            NOT NULL,
    MEAL_TYPE           VARCHAR2(15)                                    NOT NULL,
    NAME                VARCHAR2(255)                                   NOT NULL,
    CALORIES            NUMBER(5)                                       NULL,
    PROTEIN             NUMBER(6,2)                                     NULL,
    CARBS               NUMBER(6,2)                                     NULL,
    FAT                 NUMBER(6,2)                                     NULL,
    NOTES               CLOB                                            NULL,
    IS_COMPLETED        NUMBER(1)       DEFAULT 0                       NOT NULL,
    COMPLETED_AT        TIMESTAMP                                       NULL,
    CREATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP            NOT NULL,
    UPDATED_AT          TIMESTAMP       DEFAULT SYSTIMESTAMP            NOT NULL,

    CONSTRAINT PK_MEAL_PLANS                PRIMARY KEY (ID),
    CONSTRAINT CHK_MP_MEAL_TYPE             CHECK (MEAL_TYPE IN ('breakfast','lunch','dinner','snack')),
    CONSTRAINT CHK_MP_IS_COMPLETED          CHECK (IS_COMPLETED IN (0,1)),
    CONSTRAINT FK_MP_FAMILY_MEMBER_ID       FOREIGN KEY (FAMILY_MEMBER_ID) REFERENCES FAMILY_MEMBERS (ID) ON DELETE CASCADE,
    CONSTRAINT FK_MP_RECIPE_ID              FOREIGN KEY (RECIPE_ID)        REFERENCES RECIPES         (ID) ON DELETE SET NULL
);

CREATE INDEX IDX_MP_FAMILY_MEMBER_ID    ON MEAL_PLANS (FAMILY_MEMBER_ID);
CREATE INDEX IDX_MP_PLANNED_DATE        ON MEAL_PLANS (PLANNED_DATE);
CREATE INDEX IDX_MP_RECIPE_ID           ON MEAL_PLANS (RECIPE_ID);
CREATE INDEX IDX_MP_MEMBER_DATE         ON MEAL_PLANS (FAMILY_MEMBER_ID, PLANNED_DATE);

COMMENT ON TABLE  MEAL_PLANS                IS 'Rencana makan mingguan per anggota keluarga.';
COMMENT ON COLUMN MEAL_PLANS.RECIPE_ID      IS 'Link opsional ke resep bank (RECIPES). NULL jika diisi manual.';
COMMENT ON COLUMN MEAL_PLANS.IS_COMPLETED   IS '1 = rencana sudah terlaksana dan food_log sudah dibuat';


-- ============================================================
-- 8. FAMILY_INVITATIONS
-- ============================================================
CREATE SEQUENCE SEQ_FAMILY_INVITATIONS START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE TABLE FAMILY_INVITATIONS (
    ID              NUMBER          DEFAULT SEQ_FAMILY_INVITATIONS.NEXTVAL   NOT NULL,
    SENDER_ID       NUMBER                                                    NOT NULL,
    RECIPIENT_EMAIL VARCHAR2(255)                                             NOT NULL,
    STATUS          VARCHAR2(10)    DEFAULT 'pending'                         NOT NULL,
    TOKEN           VARCHAR2(255)                                             NOT NULL,
    EXPIRES_AT      TIMESTAMP                                                 NOT NULL,
    RESPONDED_AT    TIMESTAMP                                                 NULL,
    CREATED_AT      TIMESTAMP       DEFAULT SYSTIMESTAMP                      NOT NULL,
    UPDATED_AT      TIMESTAMP       DEFAULT SYSTIMESTAMP                      NOT NULL,

    CONSTRAINT PK_FAMILY_INVITATIONS    PRIMARY KEY (ID),
    CONSTRAINT UQ_FI_TOKEN              UNIQUE (TOKEN),
    CONSTRAINT CHK_FI_STATUS            CHECK (STATUS IN ('pending','accepted','rejected','expired')),
    CONSTRAINT FK_FI_SENDER_ID          FOREIGN KEY (SENDER_ID) REFERENCES USERS (ID) ON DELETE CASCADE
);

CREATE INDEX IDX_FI_SENDER_ID       ON FAMILY_INVITATIONS (SENDER_ID);
CREATE INDEX IDX_FI_RECIPIENT_EMAIL ON FAMILY_INVITATIONS (RECIPIENT_EMAIL);
CREATE INDEX IDX_FI_STATUS          ON FAMILY_INVITATIONS (STATUS);

COMMENT ON TABLE  FAMILY_INVITATIONS            IS 'Undangan bergabung ke grup keluarga. Token berlaku sesuai EXPIRES_AT (default 7 hari).';
COMMENT ON COLUMN FAMILY_INVITATIONS.EXPIRES_AT IS 'Scheduled job harus mengubah STATUS ke "expired" jika melewati tanggal ini';
COMMENT ON COLUMN FAMILY_INVITATIONS.RESPONDED_AT IS 'Waktu penerima merespons undangan (accept atau reject)';


-- ============================================================
-- 9. MESSAGES
-- ============================================================
CREATE SEQUENCE SEQ_MESSAGES START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE TABLE MESSAGES (
    ID              NUMBER          DEFAULT SEQ_MESSAGES.NEXTVAL    NOT NULL,
    SENDER_ID       NUMBER                                          NOT NULL,
    RECIPIENT_ID    NUMBER                                          NOT NULL,
    MESSAGE         CLOB                                            NULL,
    MESSAGE_TYPE    VARCHAR2(10)    DEFAULT 'text'                  NOT NULL,
    ATTACHMENT_URL  VARCHAR2(2048)                                  NULL,
    IS_READ         NUMBER(1)       DEFAULT 0                       NOT NULL,
    READ_AT         TIMESTAMP                                       NULL,
    CREATED_AT      TIMESTAMP       DEFAULT SYSTIMESTAMP            NOT NULL,
    UPDATED_AT      TIMESTAMP       DEFAULT SYSTIMESTAMP            NOT NULL,
    DELETED_AT      TIMESTAMP                                       NULL,

    CONSTRAINT PK_MESSAGES              PRIMARY KEY (ID),
    CONSTRAINT CHK_MSG_MESSAGE_TYPE     CHECK (MESSAGE_TYPE IN ('text','image','file')),
    CONSTRAINT CHK_MSG_IS_READ          CHECK (IS_READ IN (0,1)),
    CONSTRAINT FK_MSG_SENDER_ID         FOREIGN KEY (SENDER_ID)    REFERENCES USERS (ID) ON DELETE CASCADE,
    CONSTRAINT FK_MSG_RECIPIENT_ID      FOREIGN KEY (RECIPIENT_ID) REFERENCES USERS (ID) ON DELETE CASCADE
);

CREATE INDEX IDX_MSG_SENDER_ID      ON MESSAGES (SENDER_ID);
CREATE INDEX IDX_MSG_RECIPIENT_ID   ON MESSAGES (RECIPIENT_ID);
CREATE INDEX IDX_MSG_UNREAD         ON MESSAGES (RECIPIENT_ID, IS_READ);
CREATE INDEX IDX_MSG_CONVERSATION   ON MESSAGES (SENDER_ID, RECIPIENT_ID, CREATED_AT);

COMMENT ON TABLE  MESSAGES                  IS 'Pesan langsung antar pengguna dalam grup keluarga.';
COMMENT ON COLUMN MESSAGES.ATTACHMENT_URL   IS 'URL lampiran untuk pesan tipe image atau file';
COMMENT ON COLUMN MESSAGES.READ_AT          IS 'Waktu pertama kali pesan dibaca oleh penerima';
COMMENT ON COLUMN MESSAGES.DELETED_AT       IS 'Soft delete: pesan dihapus tetapi masih tersimpan';


-- ============================================================
-- 10. NOTIFICATIONS  [FITUR BARU]
-- ============================================================
CREATE SEQUENCE SEQ_NOTIFICATIONS START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE TABLE NOTIFICATIONS (
    ID          NUMBER          DEFAULT SEQ_NOTIFICATIONS.NEXTVAL   NOT NULL,
    USER_ID     NUMBER                                              NOT NULL,
    TYPE        VARCHAR2(20)                                        NOT NULL,
    TITLE       VARCHAR2(255)                                       NOT NULL,
    BODY        CLOB                                                NOT NULL,
    DATA        CLOB                                                NULL,       -- JSON
    IS_READ     NUMBER(1)       DEFAULT 0                           NOT NULL,
    READ_AT     TIMESTAMP                                           NULL,
    CREATED_AT  TIMESTAMP       DEFAULT SYSTIMESTAMP                NOT NULL,

    CONSTRAINT PK_NOTIFICATIONS        PRIMARY KEY (ID),
    CONSTRAINT CHK_NOTIF_TYPE          CHECK (TYPE IN ('health_warning','invitation','message','system')),
    CONSTRAINT CHK_NOTIF_IS_READ       CHECK (IS_READ IN (0,1)),
    CONSTRAINT FK_NOTIF_USER_ID        FOREIGN KEY (USER_ID) REFERENCES USERS (ID) ON DELETE CASCADE
);

CREATE INDEX IDX_NOTIF_USER_ID  ON NOTIFICATIONS (USER_ID);
CREATE INDEX IDX_NOTIF_UNREAD   ON NOTIFICATIONS (USER_ID, IS_READ);
CREATE INDEX IDX_NOTIF_TYPE     ON NOTIFICATIONS (TYPE);

COMMENT ON TABLE  NOTIFICATIONS         IS 'Notifikasi in-app terpusat. Mencakup: peringatan kesehatan, undangan, pesan baru, info sistem.';
COMMENT ON COLUMN NOTIFICATIONS.DATA    IS 'JSON berisi konteks tambahan, misal: {"member_id":5,"calories":2500,"limit":2000}';


COMMIT;
