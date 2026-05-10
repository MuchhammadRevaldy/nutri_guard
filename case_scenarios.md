A. Judul Project
Aplikasi Manajemen Nutrisi Pintar "Nutri Guard"

B. Case Scenario
Gaya hidup modern yang serba cepat seringkali membuat masyarakat kesulitan melacak asupan kalori dan gizi makanan yang mereka konsumsi sehari-hari. Pencatatan jurnal makan secara manual memakan waktu dan cenderung tidak akurat karena pengguna awam kesulitan memperkirakan porsi dan nilai gizi secara tepat tanpa bantuan alat. Selain itu, pengguna seringkali kebingungan saat ingin mengolah sisa-sisa bahan masakan yang ada di dapur menjadi hidangan yang lezat, namun di sisi lain harus tetap mematuhi batasan diet harian dan menaati pantangan atau alergi makanan yang dimiliki oleh mereka maupun anggota keluarga.

Untuk mengatasi serangkaian masalah ini, dibutuhkan sebuah aplikasi bernama "Nutri Guard" yang mengintegrasikan kecerdasan buatan (*AI*) untuk menyederhanakan manajemen nutrisi sehari-hari. Sistem ini menyediakan fitur NutriScan untuk memindai foto makanan dan mengestimasi kalorinya secara mulus agar pengisian jurnal nutrisi menjadi seketika, akurat, dan sangat praktis. Di samping itu, fitur FitChef hadir untuk menganalisis bahan sisa dapur lalu memberikan rekomendasi panduan resep masakan personal, yang secara cerdas diyakinkan aman dari daftar alergi serta selaras agar tidak melampaui sisa kuota kalori harian. Melalui sistem cerdas ini, pencapaian target nutrisi individu maupun seluruh anggota keluarga sekunder yang dihubungkan tak lagi rumit untuk diawasi dan dikelola melalui satu akun antarmuka real-time.

C. Business Rules
1. Setiap hasil pemindaian foto makanan wajib dicatatkan kalori dan makronutrisinya ke dalam jurnal asupan harian pengguna.
2. Rekomendasi resep kuliner yang dihasilkan oleh asisten cerdas *FitChef* mutlak dilarang melampaui sisa jatah kalori maksimal harian pengguna saat itu.
3. Sistem secara mutlak wajib menolak dan memfilter panduan resep apa pun yang memuat bahan di daftar alergen profil pengguna, serta menyarankan bahan substitusinya.
4. Fitur pendaftaran profil anggota keluarga dibatasi untuk maksimal 3 entri profil tambahan (akun biasa) dan 10 profil ekstra (akun Premium).
5. Seluruh log hitungan metrik gizi di dalam jurnal dan target air minum harian wajib secara otomatis disetel ulang ke poin nol (0) pada pukul 00:00 mendasarkan zona waktu lokal.
6. Peringatan *health risk warning* akan diterbitkan kepada antarmuka pengguna apabila asupan kalori terekam di bawah BMR atau menembus batas ekstrem keselamatan berturut-turut.

D. Constraint
1. Penggunaan *prompt* dan antarmuka *scanner* (AI Vision) dibatasi maksimal 15-20 kali saja per hari bagi pemilik langganan tahap gratis (Free Tier).
2. Fail foto/gambar yang diunggah tidak dikenankan melebihi kuota ukuran sekuensial maksimal sebesar 5 MB berformat citra standard (seperti `.JPG`, `.JPEG`, atau `.PNG`).
3. Seluruh fail gambar foto unggahan pengguna untuk kepentingan analisis nutrisi, pantang dan haram untuk ditahan/disimpan sistem server secara permanen demi keamanan regulasi privasi konsumen (PDPA/GDPR).
4. Karena bersistem Cloud Inference komputasi awan, modul AI wajib bekerja memanfaatkan ketersediaan lalu-lintas dua arah (*Real-time Online Data*), fungsionalitas tanpa internet amatlah terbatas dalam membaca input manual biasa.
5. Pemakaian sistem sebagai asisten perencana kebugaran dipertimbangkan oleh pengguna sebagai klausul "estimasi pendekataan kecerdasan mesin", tidak presisi dan diagunkan seratus persen mumpuni memitigasi vonis diagnosis uji ranah medis murni.

E. Assumption
1. Seluruh target pengguna dan pendaftar diasumsikan menguasai pengoperasian fitur gawai ponsel pintar layar sentuh terbaru berserta kapabilitas fungsional pengambilan kameranya.
2. Jaringan komunikasi seluler/WiFi yang dipancarkan senantiasa mumpuni bagi proses translasi model prediksi ke dan dari *back-end* AI di luar dari durasi perbaikan server (*Downtime*).
3. Pengguna bertindak proaktif di muka awal *setup* terkait kerajinannya melengkapi semua faktor sensitif seperti tinggi, rasio lemak, kondisi cacat medis spesifik serta *log* rekam pantangan khusus alergi milih spesifik sendiri agar sistem bekerja seirama.
4. Makanan yang ditangkap melalui lensa kamera terposisikan di bawah tingkat redup dan tingkat sudut pandang potret normal tak buram. 

F. Problem
Pola pengawasan dan pencatatan jejak kesehatan diet secara independen dan manual kerap melabuhkan kerumitan dalam eksekusi operasional keseharian. Tahap kalkulasi kalori penganan mayoritas menuai hasil meleset lantaran pemahaman konversi berat serta asupan makro sangatlah minim dirasakan kelas pemula (*blind guess*). Ketidakpastian pengukur gizi berimplikasi secara langsung menyelewengkan tujuan *body-goal* individu. Pada tahap lain, proses perumusan ide menanak atau memadupadankan porsi makanan sisa di kulkas menjadi bumerang kepusingan sendiri bagi kaum keluarga padat aktivitas, acapkali dikarenakan tersangkut pantangan bahan alergi dan rumitnya menanggulangi batas target defisit kalori tanpa perencaaan teknis ahli gizi murni. Kesulitan menghimpun metrik jejak minum harian, rekam laporan mingguan anggota rumah tangga dalam tumpukan selembar kertas/notes ponsel tradisional pun menaikkan rasa pesimis (*stress*). Semua kelemahan berjenjang inilah yang terus-menerus memupuk rasa malas sehingga efektivitas pelestarian disiplin *diet* selalu putus di tengah jalan.
