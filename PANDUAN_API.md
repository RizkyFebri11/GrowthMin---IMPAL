# Panduan Penggunaan API GrowthMin

Dokumen ini berisi panduan cara menggunakan API GrowthMin melalui Postman dan penjelasan untuk masing-masing *endpoint* yang tersedia.

## Alur Pengujian API yang Disarankan

Untuk memastikan seluruh API berjalan sesuai fungsinya dan tidak ada *error* terkait *relational data* (data yang saling bergantung di database), ikuti urutan berikut:

1. **Buat Anggota** (POST `/api/anggota`)
2. **Buat Target** bulanan untuk anggota tersebut (POST `/api/target`)
3. **Isi Log Harian / Tracking** (POST `/api/tracking`) — Anda bisa memasukkan beberapa log dengan tanggal yang berbeda-beda dalam satu bulan.
4. **Kalkulasi KPI** (POST `/api/kpi/calculate`) — Jalankan setelah data target dan beberapa log harian terisi.
5. **Cek Laporan / Leaderboard** (GET `/api/laporan` atau `/api/leaderboard`) — Untuk melihat hasil dari kalkulasi KPI.
6. **Beri Evaluasi** (POST `/api/evaluasi`) — Manager dapat memberikan catatan dari KPI yang sudah dikalkulasi.

---

## Daftar Endpoint

Berikut adalah rincian masing-masing *endpoint* yang sudah tersedia di dalam collection Postman.

### 1. Anggota
- **Fungsi:** Mendaftarkan staf/manajer baru ke dalam sistem.
- **Method:** `POST`
- **Endpoint:** `/api/anggota`
- **Contoh Request Body (JSON):**
  ```json
  {
    "nama": "Febri",
    "email": "febri@example.com",
    "password": "password123",
    "role": "manager",
    "tim": "Marketing"
  }
  ```

### 2. Target
- **Fungsi:** Mengatur target bulanan (leads, closing, revenue) untuk seorang user (staf).
- **Method:** `POST`
- **Endpoint:** `/api/target`
- **Contoh Request Body (JSON):**
  ```json
  {
    "id_user": 1,
    "bulan": 5,
    "tahun": 2026,
    "tim": "Marketing",
    "target_leads": 100,
    "target_closing": 20,
    "target_revenue": 50000000
  }
  ```

### 3. Tracking (Log Harian)
- **Fungsi:** Mengirim laporan progres per hari.
- **Method:** `POST`
- **Endpoint:** `/api/tracking`
- **Contoh Request Body (JSON):**
  ```json
  {
    "id_user": 1,
    "tim": "Marketing",
    "tanggal": "2026-05-01",
    "jml_leads": 10,
    "jml_closing": 2,
    "nominal_revenue": 5000000,
    "nominal_spend": 1000000
  }
  ```

### 4. Kalkulasi KPI
- **Fungsi:** Menghitung skor akhir KPI pengguna pada bulan tertentu berdasarkan akumulasi *Log Harian* dan *Target*. Hasilnya akan otomatis disimpan ke dalam database KPI.
- **Method:** `POST`
- **Endpoint:** `/api/kpi/calculate`
- **Contoh Request Body (JSON):**
  ```json
  {
    "bulan": 5,
    "tahun": 2026,
    "id_user": 1
  }
  ```

### 5. Laporan
- **Fungsi:** Menampilkan laporan performa KPI beserta evaluasinya (jika ada).
- **Method:** `GET`
- **Endpoint:** `/api/laporan`
- **Query Parameters (Opsional):**
  - `bulan`: (contoh: 5)
  - `tahun`: (contoh: 2026)

### 6. Leaderboard
- **Fungsi:** Menampilkan peringkat skor performa (KPI) dari yang paling tinggi ke yang paling rendah.
- **Method:** `GET`
- **Endpoint:** `/api/leaderboard`
- **Query Parameters (Opsional):**
  - `bulan`: (contoh: 5)
  - `tahun`: (contoh: 2026)

### 7. Evaluasi
- **Fungsi:** Mengirim feedback/catatan kinerja dari manager kepada staf terkait satu hasil KPI.
- **Method:** `POST`
- **Endpoint:** `/api/evaluasi`
- **Contoh Request Body (JSON):**
  ```json
  {
    "id_kpi": 1,
    "id_manajer": 1,
    "catatan": "Performa sangat baik bulan ini, terus tingkatkan closing.",
    "tanggal": "2026-05-04"
  }
  ```
