## **GrowthMin** 

## **Langkah 1 – Menentukan Fitur yang Diuji** 

Berdasarkan sistem GrowthMin, pengujian difokuskan pada tiga fitur utama yang krusial untuk alur kerja pengguna: 

1. 1. Otentikasi (Login) - Membedakan hak akses Manajer dan Staff. 

2. 2. Kelola Target - Fitur khusus Manajer untuk mengatur target KPI bulanan. 

3. 3. Input Tracking Harian - Fitur staf untuk mencatat Leads, Closing, Revenue, dan Spend. 

## **Langkah 2 – Membuat Test Case** 

Berikut adalah 15 skenario pengujian yang dijalankan secara manual: 

|No|Fitur|Skenario|Expected Result|Status|
|---|---|---|---|---|
|1|Login|Login  sebagai  Manajer<br>(rizky@company.com,<br>pass126)|Masuk<br>ke<br>Dashboard<br>Manajer, menu<br>'Kelola Target'<br>dan 'Evaluasi'<br>tersedia|Pass|
|2|Login|Login sebagai Staff<br>(radith@company.com,<br>pass125)|Masuk<br>ke<br>Dashboard Staff,<br>menu 'Kelola<br>Target'<br>disembunyikan|Pass|
|3|Login|Login dengan password<br>salah|Muncul pesan<br>error<br>"Kredensial<br>tidak valid"|Pass|
|4|Login|Login<br>dengan<br>mengosongkan kolom<br>password|Validasi field<br>required<br>muncul,  tombol<br>submit disabled|Pass|
|5|Kelola Target|Manajer menambahkan<br>target Revenue staf<br>dengan input angka yang<br>valid|Data  tersimpan,<br>progress<br>bar<br>diperbarui|Pass|



|6|Kelola Target|Manajer  mengosongkan<br>form tanggal mulai (Start<br>Date)|Muncul kotak<br>error<br>merah<br>wajib isi|Pass|
|---|---|---|---|---|
|7|Kelola Target|Staf mencoba mengakses<br>URL<br>/kelola-target<br>secara paksa|Sistem<br>me-<br>redirect kembali<br>ke Dashboard|Pass|
|8|Kelola Target|Menginput huruf (bukan<br>angka) pada kolom<br>Target Revenue|Muncul kotak<br>peringatan error|Fail|
|9|Tracking<br>Harian|Staf mengisi form Leads<br>(10), Closing (2),<br>Revenue (5M)|Muncul pesan<br>sukses,<br>data<br>tersimpan<br>ke<br>database|Pass|
|10|Tracking<br>Harian|Staf<br>mengosongkan<br>Tanggal Tracking|Sistem  menolak<br>submit<br>dan<br>menyorot kolom<br>tanggal|Pass|
|11|Tracking<br>Harian|Menginput nilai negatif<br>pada kolom Jumlah<br>Leads|Validasi<br>menolak input<br>minus|Fail|
|12|Tracking<br>Harian|Mengisi huruf pada<br>kolom Spend|Tidak<br>bisa<br>diketik<br>atau<br>muncul<br>peringatan  error<br>warna merah|Fail|
|13|Tracking<br>Harian|Mengirim  form  dengan<br>nilai 0 pada semua isian<br>capaian|Data tersimpan<br>karena<br>dimungkinkan<br>tidak<br>ada<br>capaian  di  hari<br>tersebut|Pass|
|14|Evaluasi|Manajer  memilih  nama<br>staf dari dropdown dan<br>mengirim catatan|Notifikasi<br>sukses, catatan<br>tersimpan<br>di<br>riwayat evaluasi|Pass|
|15|Laporan|Menggunakan filter ikon<br>kalender  untuk  melihat<br>data bulan lalu|Grafik<br>menyesuaikan<br>rentang waktu|Pass|



## yang dipilih 

|**Langkah 3 – Menghitung Metrik**|**Langkah 3 – Menghitung Metrik**|**Langkah 3 – Menghitung Metrik**|||||
|---|---|---|---|---|---|---|
|**1.**|**Total**||**Test**||**Case:**|15|
|**2.**|||**Pass**|||**Rate:**|
||•|Rumus:|(12|/|15)<br>x|100%|
||||**•**||**Hasil:**|**80%**|
|**3.**|||**Fail**|||**Rate:**|
||•|Rumus:|(3|/|15)<br>x|100%|
||||**•**||**Hasil:**|**20%**|
|**4.**||**Defect**||||**Count:**|
|||Total|bug|yang|ditemukan:|3|
|• Minor: 3 (Kurangnya pembatasan karakter string pada input type number, pesan error saat input||||||• Minor: 3 (Kurangnya pembatasan karakter string pada input type number, pesan error saat input|
|huruf belum spesifik menunjukkan kolom mana yang salah, dan input negatif belum diblokir).|||||huruf belum spesifik menunjukkan kolom mana yang salah, dan input negatif belum diblokir).|huruf belum spesifik menunjukkan kolom mana yang salah, dan input negatif belum diblokir).|
||||•||Major:|0|
||||•||Critical:|0|
|**5.**||**Defect**||||**Density:**|
||•|Rumus:|3|Bug|/<br>3|Fitur|



## **• Hasil: 1 bug per fitur** 

## **Langkah 4 – Dokumentasi Bukti** 

1. [Screenshot 1: Halaman Login GrowthMin] : 

**==> picture [432 x 11] intentionally omitted <==**

**----- Start of picture text -----**<br>
2. [Screenshot 2: Dashboard Manajer & Kelola Target] :<br>**----- End of picture text -----**<br>


**==> picture [432 x 11] intentionally omitted <==**

**----- Start of picture text -----**<br>
3. [Screenshot 3: Form Tracking Harian] :<br>**----- End of picture text -----**<br>


4. [Screenshot 4: Bug Input Negatif] : 

5. [Screenshot 5: Bug Peringatan Merah] : 

## **Langkah 5 – Analisis** 

Berdasarkan rangkaian pengujian manual yang dilakukan terhadap aplikasi GrowthMin, fitur yang paling banyak mengalami kegagalan (Fail) adalah fitur Input Tracking Harian dan kelola input angka pada Kelola Target. 

Penyebab utama kegagalan tersebut bermuara pada kurang ketatnya validasi input pada sisi front-end maupun back-end. Dari kacamata User Experience (UX), sistem saat ini masih mengizinkan pengguna untuk mengetikkan karakter non-numerik (seperti huruf) pada kolom yang 

seharusnya  mutlak  berisi  angka  (seperti  Revenue  atau  Spend).  Walaupun  sistem  akhirnya memunculkan kotak peringatan berwarna merah sesuai prosedur, pesan yang ditampilkan terlalu general (umum) dan tidak menunjuk langsung ke field mana yang salah. Selain itu, ketiadaan batasan untuk nilai minus (negatif) berisiko merusak kalkulasi otomatis skor KPI di menu Leaderboard. 

Cara memperbaiki permasalahan ini adalah dengan mengimplementasikan atribut HTML type="number" secara ketat, menambahkan batasan min="0", serta memperkuat validasi Regex (Regular Expression) di level controller agar data ditolak sebelum masuk ke database. Dari sisi Antarmuka Pengguna (UI), error state harus dirancang lebih ramah; daripada sekadar kotak merah di atas layar, pesan peringatan sebaiknya diletakkan tepat di bawah kolom input yang bermasalah agar pengguna tidak bingung. 

Prioritas perbaikan ini adalah Medium-High (Menengah ke Tinggi). Karena aplikasi GrowthMin bertumpu pada akurasi data harian staf untuk menghasilkan grafik dan laporan kinerja (Leaderboard dan Laporan Performa), anomali data (seperti huruf yang terhitung atau angka minus) dapat membuat keseluruhan analitik dasbor menjadi cacat. 

Secara fungsionalitas inti (otentikasi, input data, dan pembacaan grafik), aplikasi ini layak dan siap digunakan (MVP tercapai). Namun, jika ingin diluncurkan untuk end-user (Staf nonteknis) yang rentan melakukan kesalahan pengisian, perbaikan validasi form (bug minor) tersebut idealnya diselesaikan terlebih dahulu dalam sisa waktu minggu ini demi menjaga integritas data perusahaan. 

## **Nilai Tambahan – Tools Test** 

Berdasarkan hasil pengujian di atas, seluruh test suite berhasil dilewati dengan status PASS dalam waktu 0.289 detik. Terdapat dua skenario utama yang diuji pada Class Controller API ini: 

1.  Skenario  Valid:  Sistem  berhasil  menyimulasikan  perhitungan  ROAS  dengan  benar  dan mengembalikan status kode sukses (HTTP 201). 

2. Skenario Gagal (Error Handling): Sistem berhasil merespons dengan tepat dengan memberikan status error (HTTP 500) ketika dikirimkan format request yang salah. Hasil ini membuktikan bahwa fungsi logika kalkulasi KPI berjalan dengan akurat dan memiliki penanganan error (error handling) yang stabil. 

