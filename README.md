# ⛅ WeatherFinder Upgrade - React Native Expo

Aplikasi pencarian informasi cuaca real-time yang dibangun menggunakan **React Native**, **Expo SDK**, dan integrasi **Open-Meteo API** tanpa menggunakan API Key. Proyek ini mendemonstrasikan implementasi React hooks (`useEffect`, `useState`), optimasi jaringan menggunakan _Debounce technique_, penanganan siklus pembatalan _Asynchronous fetch request_ (`AbortController`), serta UI/UX bernuansa gelap premium (_dark luxury aesthetic_).

---

## 🎯 Daftar Fitur

### 🟢 Level 1 — Fitur Wajib (Core)

- **Controlled TextInput**: Manajemen input pencarian nama kota yang sinkron dengan state aplikasi.
- **Debounce Mechanism (500ms)**: Menunda eksekusi fetch data hingga user berhenti mengetik selama 500ms untuk menghemat kuota request API.
- **2-Step Sequential Fetch**: Melakukan pencarian koordinat lokasi terlebih dahulu melalui _Geocoding API_, dilanjutkan dengan pencarian data cuaca spesifik lewat _Forecast API_.
- **4 Kondisi State UI**: Penanganan tampilan yang adaptif saat kondisi **Kosong (Hint)**, **Loading (Spinner)**, **Error (Pesan Masalah)**, dan **Sukses (Kartu Informasi)**.
- **Cleanup AbortController**: Membatalkan request lama yang masih _pending_ jika pengguna mengetik huruf baru dengan cepat untuk menghindari fenomena _race condition_.
- **WMO Weather Code Mapping**: Translasi kode cuaca numerik bawaan Open-Meteo ke dalam teks deskripsi bahasa Indonesia dan emoji yang relevan.

### 🟡 Level 2 — Fitur Pengembangan (Dipilih)

- [x] **🧭 Arah & Kecepatan Angin**: Menampilkan kecepatan angin aktual dalam satuan `km/h` serta merubah besaran derajat (`°`) menjadi penanda mata angin tekstual (U, TL, T, TG, S, BD, B, BL).
- [x] **🌙 Indikator Siang/Malam**: Memanfaatkan variabel data `is_day` (0 atau 1) untuk memberikan identitas visual kartu cuaca yang presisi sesuai status waktu di lokasi target.
- [x] **🔄 Tombol Refresh**: Tombol "Perbarui Data" yang memungkinkan penarikan data ulang (re-fetch) secara instan tanpa perlu mengetik ulang nama kota.

### 🔴 Level 3 — Tantangan Bonus (Opsional)

- [x] **Smooth Animation**: Menggunakan `Animated.timing` API untuk memberikan efek transisi halus _fade-in_ (opasitas dari `0` ke `1`) sesaat setelah data cuaca sukses dimuat ke layar.

---

## 🛠️ Tech Stack & API

- **Framework**: React Native (Expo Go Framework)
- **Bahasa**: TypeScript / JavaScript
- **Style Engine**: React Native StyleSheet (Premium Dark Palette with Gold Accents)
- **API Engine**:
  - Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
  - Forecast: `https://api.open-meteo.com/v1/forecast`

🔗 **Link Expo Snack**: [Isi dengan Link Snack setelah kamu paste kodenya di snack.expo.dev]

---

## 🚀 Panduan Menjalankan Proyek (Setup Instructions)

1. **Clone Repositori Ini**
   ```bash
   git clone [https://github.com/USERNAME_KAMU/NAMA_REPO_KAMU.git](https://github.com/USERNAME_KAMU/NAMA_REPO_KAMU.git)
   cd NAMA_REPO_KAMU
   ```
