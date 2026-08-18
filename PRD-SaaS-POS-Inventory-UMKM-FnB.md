# Product Requirements Document (PRD)
# SaaS POS + Inventory untuk UMKM F&B

| | |
|---|---|
| **Nama Produk** | (Working Title) — *NusaKasir* / *KasirKu POS* *(ganti sesuai nama brand)* |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 4 Juli 2026 |
| **Fokus Bisnis** | F&B (Restoran, Cafe, Warung, Kedai Kopi, Cloud Kitchen) |
| **Model Tenant** | Single-outlet per bisnis (SaaS multi-tenant, 1 tenant = 1 outlet) |
| **Platform** | Web App (Backoffice/Dashboard) + Mobile App Android (POS Kasir) |
| **Status** | Draft untuk pengembangan |

---

## 1. Latar Belakang & Ringkasan Eksekutif

### 1.1 Latar Belakang
UMKM F&B di Indonesia (warung makan, cafe, kedai kopi, restoran kecil) sebagian besar masih mencatat transaksi secara manual atau menggunakan aplikasi kasir sederhana yang tidak terhubung dengan manajemen stok bahan baku. Akibatnya:

- Pemilik tidak tahu **stok bahan baku real-time**, sering kehabisan stok mendadak atau over-stock yang basi.
- **Selisih kas** akibat pencatatan manual, sulit dilacak siapa kasir yang bertugas saat terjadi selisih.
- Tidak ada data untuk mengambil keputusan bisnis (produk terlaris, jam ramai, margin per menu).
- Sulit menghitung **HPP (Harga Pokok Penjualan)** per menu karena resep/bahan baku tidak tercatat sistematis.

### 1.2 Solusi
Sebuah aplikasi **SaaS POS + Inventory** berbasis langganan (subscription) yang terintegrasi penuh antara transaksi kasir dan pengelolaan stok bahan baku, dengan resep (recipe/BOM) yang otomatis memotong stok bahan baku setiap transaksi terjadi. Tersedia dalam bentuk:
- **Aplikasi Android (POS Kasir)** — digunakan di kasir/tablet, mendukung mode offline.
- **Web Dashboard (Backoffice)** — digunakan pemilik untuk mengelola menu, stok, laporan, dan pengaturan dari mana saja.

### 1.3 Model Bisnis
- SaaS berbasis langganan bulanan/tahunan per outlet (per tenant).
- Setiap tenant = 1 bisnis dengan 1 outlet (tidak ada multi-cabang di versi ini — dicatat sebagai batasan scope, lihat bagian 5).

---

## 2. Tujuan Produk (Goals & Objectives)

### 2.1 Business Goals
1. Membantu UMKM F&B mendigitalisasi operasional kasir dan stok dalam satu platform terpadu.
2. Meningkatkan efisiensi operasional pemilik usaha (mengurangi waktu rekap manual >70%).
3. Membangun basis pelanggan berlangganan (recurring revenue) dari segmen UMKM.

### 2.2 Product Goals
1. Transaksi kasir cepat (<10 detik per transaksi normal) dan bisa tetap berjalan saat internet terputus (offline mode).
2. Setiap transaksi otomatis memotong stok bahan baku sesuai resep menu.
3. Pemilik mendapat insight bisnis (laporan penjualan, laba kotor, stok menipis) secara real-time dari web dashboard.
4. Sistem role-based access agar kasir hanya bisa mengakses fitur operasional, sementara pemilik memiliki kontrol penuh.

### 2.3 Success Metrics (KPI)
| Metrik | Target |
|---|---|
| Waktu transaksi rata-rata per order | < 10 detik (input) |
| Akurasi stok setelah stok opname | Selisih < 3% |
| Adoption rate fitur inventory (tenant aktif menggunakan) | > 60% dalam 30 hari pertama |
| Retensi tenant bulanan (churn) | < 5% per bulan |
| Uptime sistem (server pusat) | ≥ 99.5% |
| Waktu sinkronisasi ulang setelah offline | < 30 detik untuk 100 transaksi tertunda |

---

## 3. Target Pengguna & Persona

### 3.1 Segmen Target
- Warung makan, rumah makan padang/tegal, kedai kopi, cafe kecil-menengah, cloud kitchen, gerai franchise kecil independen.
- Skala: 1 outlet, 1–15 karyawan, omzet harian Rp500rb – Rp15 juta.

### 3.2 Persona

**Persona 1 — Pak Budi (Pemilik/Owner)**
- Usia 35–50 tahun, pemilik warung/cafe.
- Tidak terlalu melek teknologi, butuh UI simpel.
- Ingin tahu omzet harian, stok bahan baku, dan mana menu yang laku tanpa harus di lokasi.
- Mengakses lewat **HP/laptop dari rumah** (Web Dashboard).

**Persona 2 — Mbak Sari (Kasir)**
- Usia 20–30 tahun, karyawan shift.
- Butuh input order super cepat, terutama saat jam ramai (rush hour).
- Menggunakan **tablet/Android POS** di meja kasir.
- Tidak butuh akses laporan atau pengaturan.

**Persona 3 — Mas Andi (Staff Dapur/Kitchen, opsional)**
- Melihat antrian pesanan yang masuk dari kasir (Kitchen Display System / KDS sederhana) atau struk dapur (kitchen order ticket).

**Persona 4 — Tim Internal SaaS (Super Admin)**
- Tim provider aplikasi yang mengelola tenant, billing, dan support.

---

## 4. Peran Pengguna & Hak Akses (User Roles & Permissions)

Sistem menggunakan **Role-Based Access Control (RBAC)**. Berikut daftar role:

| Role | Level | Platform Akses | Deskripsi |
|---|---|---|---|
| **Super Admin** | Platform (internal) | Web (Admin Panel terpisah) | Mengelola seluruh tenant SaaS: aktivasi, billing/langganan, monitoring, suspend akun |
| **Owner** | Tenant | Web Dashboard + Mobile (opsional) | Pemilik bisnis. Akses penuh ke semua modul dalam tenant-nya |
| **Manager** *(opsional, role tambahan)* | Tenant | Web Dashboard + Mobile | Didelegasikan Owner. Akses operasional & laporan, tanpa akses billing/pengaturan langganan |
| **Kasir** | Tenant | Mobile (POS) | Input transaksi, buka/tutup shift, cetak struk. Tidak bisa lihat laporan laba atau ubah master data |
| **Staff Dapur** *(opsional)* | Tenant | Mobile/Tablet (KDS mode) | Hanya melihat & update status pesanan (diterima → diproses → siap) |

### 4.1 Matriks Hak Akses (RBAC Detail)

| Modul / Fitur | Super Admin | Owner | Manager | Kasir | Staff Dapur |
|---|:---:|:---:|:---:|:---:|:---:|
| Kelola tenant lain, billing platform | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pengaturan langganan tenant sendiri | ❌ | ✅ | ❌ | ❌ | ❌ |
| Kelola user & role dalam tenant | ❌ | ✅ | 🔶 (kecuali Owner) | ❌ | ❌ |
| Kelola menu, kategori, harga, resep | ❌ | ✅ | ✅ | ❌ | ❌ |
| Kelola bahan baku & supplier | ❌ | ✅ | ✅ | ❌ | ❌ |
| Input transaksi POS | ❌ | ✅ | ✅ | ✅ | ❌ |
| Buka/tutup shift & rekonsiliasi kas | ❌ | ✅ | ✅ | ✅ (shift sendiri) | ❌ |
| Lihat laporan penjualan & laba | ❌ | ✅ | ✅ | ❌ | ❌ |
| Stok opname (adjust stok manual) | ❌ | ✅ | ✅ | ❌ | ❌ |
| Approve void/refund/discount manual | ❌ | ✅ | ✅ | 🔶 (request only) | ❌ |
| Lihat & update status pesanan dapur | ❌ | ✅ | ✅ | ✅ | ✅ |
| Pengaturan printer, pajak, meja | ❌ | ✅ | 🔶 | ❌ | ❌ |

Legenda: ✅ Full akses · 🔶 Akses terbatas/butuh approval · ❌ Tidak ada akses

---

## 5. Ruang Lingkup (Scope)

### 5.1 In-Scope (MVP)
- Single outlet per tenant (bukan multi-cabang).
- POS Android untuk kasir dengan mode offline-first + sinkronisasi otomatis.
- Web Dashboard untuk owner/manager (menu, stok, laporan, pengaturan).
- Manajemen resep (Bill of Materials) — 1 menu terdiri dari beberapa bahan baku dengan takaran tertentu.
- Manajemen stok bahan baku (stok masuk, stok keluar otomatis dari transaksi, stok opname).
- Manajemen shift kasir & rekonsiliasi kas.
- Laporan penjualan, laba kotor, produk terlaris, laporan stok.
- Cetak struk (Bluetooth thermal printer) & kitchen order ticket.
- Metode pembayaran: tunai, QRIS (integrasi payment gateway), kartu debit/EDC manual-input.
- Manajemen meja sederhana (opsional untuk resto dine-in) & split bill.
- Diskon & promo sederhana (persentase/nominal, per item/per transaksi).
- Notifikasi stok menipis (low-stock alert).

### 5.2 Out-of-Scope (Fase Berikutnya / Non-Goals di V1)
- Multi-outlet/cabang dalam satu akun (akan menjadi Fase 2 — arsitektur data tetap dirancang agar siap diperluas ke multi-outlet).
- Modul HRM/payroll karyawan lengkap.
- Integrasi marketplace online (GoFood, GrabFood, ShopeeFood) — dicatat sebagai kandidat fase 2.
- Modul akuntansi penuh (jurnal umum, neraca).
- Aplikasi iOS (fase 2 jika demand ada).
- Program loyalitas pelanggan tingkat lanjut (poin, membership tier).
- White-label / reseller program.

---

## 6. Functional Requirements (Kebutuhan Fungsional)

### 6.1 Modul: Autentikasi & Manajemen User
| ID | Requirement |
|---|---|
| FR-AUTH-01 | Sistem harus mendukung registrasi tenant baru (sign up Owner) dengan verifikasi email/No. HP |
| FR-AUTH-02 | Owner dapat membuat akun untuk Manager, Kasir, Staff Dapur dengan role tertentu |
| FR-AUTH-03 | Login menggunakan email/username + password; Kasir dapat login cepat menggunakan PIN 4-6 digit di perangkat POS |
| FR-AUTH-04 | Sistem mendukung "Ganti Kasir" (switch user) tanpa logout penuh saat pergantian shift di 1 perangkat |
| FR-AUTH-05 | Password reset via email/OTP |
| FR-AUTH-06 | Sesi login harus expire otomatis sesuai kebijakan (mis. 12 jam untuk POS) |

### 6.2 Modul: Master Data — Menu & Kategori
| ID | Requirement |
|---|---|
| FR-MENU-01 | Owner/Manager dapat CRUD kategori menu (mis. Makanan, Minuman, Snack) |
| FR-MENU-02 | Owner/Manager dapat CRUD item menu: nama, harga jual, kategori, foto, deskripsi, status aktif/nonaktif |
| FR-MENU-03 | Mendukung **varian/modifier** menu (mis. ukuran: Reguler/Besar; topping: +Keju, +Telur) dengan harga tambahan opsional |
| FR-MENU-04 | Mendukung status menu "habis" (86'd) yang bisa di-toggle cepat dari POS saat bahan baku habis |
| FR-MENU-05 | Setiap item menu dapat dikaitkan dengan **resep (BOM)** — lihat 6.3 |
| FR-MENU-06 | Import/export data menu via file Excel/CSV |

### 6.3 Modul: Resep / Bill of Materials (BOM)
| ID | Requirement |
|---|---|
| FR-BOM-01 | Owner/Manager dapat mendefinisikan resep per menu: daftar bahan baku + jumlah takaran (mis. Nasi Goreng = 200gr Beras + 50gr Ayam + 10ml Minyak) |
| FR-BOM-02 | Sistem otomatis menghitung **estimasi HPP (Harga Pokok Produksi)** per menu berdasarkan harga bahan baku terbaru |
| FR-BOM-03 | Setiap transaksi penjualan menu, sistem otomatis memotong stok bahan baku sesuai resep dan jumlah terjual |
| FR-BOM-04 | Sistem memberi peringatan jika stok bahan baku tidak cukup untuk memproses 1 porsi menu (opsional: tetap izinkan jual dengan konfirmasi, mode "izinkan stok minus") |
| FR-BOM-05 | Mendukung modifier yang mengubah komposisi resep (mis. tambah topping = tambah potongan stok topping tsb) |

### 6.4 Modul: Manajemen Bahan Baku & Supplier
| ID | Requirement |
|---|---|
| FR-INV-01 | CRUD bahan baku: nama, satuan (gr/kg/ml/l/pcs), harga beli terakhir, stok minimum (reorder point) |
| FR-INV-02 | CRUD data supplier: nama, kontak, bahan baku yang disuplai |
| FR-INV-03 | Pencatatan **stok masuk** (purchase/pembelian) dengan referensi supplier, tanggal, jumlah, harga beli |
| FR-INV-04 | Pencatatan **stok keluar manual** (selain dari penjualan) — mis. rusak, terbuang, dipakai internal |
| FR-INV-05 | **Stok Opname**: pencatatan stok fisik aktual vs stok sistem, otomatis hitung selisih dan buat jurnal penyesuaian |
| FR-INV-06 | **Kartu stok (stock card)**: histori pergerakan stok per bahan baku (masuk/keluar/opname) dengan tanggal & referensi transaksi |
| FR-INV-07 | Notifikasi **stok menipis** (di bawah reorder point) ke Owner via dashboard & push notification |
| FR-INV-08 | Laporan nilai persediaan (inventory valuation) menggunakan metode **rata-rata bergerak (moving average)** |
| FR-INV-09 | Konversi satuan otomatis (mis. beli 1 karung = 25kg, dipakai dalam gram) |

### 6.5 Modul: POS / Kasir
| ID | Requirement |
|---|---|
| FR-POS-01 | Tampilan menu grid dengan kategori & search cepat, dioptimalkan untuk layar tablet 8-10" |
| FR-POS-02 | Tambah item ke order, pilih varian/modifier, tambah catatan khusus (mis. "less sugar", "pedas") |
| FR-POS-03 | Mendukung **mode dine-in** (pilih nomor meja), **take away**, dan **delivery internal** |
| FR-POS-04 | Split bill (bagi tagihan per orang / per item) dan gabung meja (merge table) |
| FR-POS-05 | Hitung otomatis pajak (PPN/PB1) dan service charge sesuai pengaturan tenant |
| FR-POS-06 | Terapkan diskon per item atau per transaksi (persentase/nominal), dengan approval untuk diskon di atas batas tertentu |
| FR-POS-07 | Pembayaran multi-metode: Tunai (dengan hitung kembalian), QRIS, kartu (input manual referensi EDC), split payment (bayar sebagian tunai sebagian QRIS) |
| FR-POS-08 | Cetak struk pelanggan via printer thermal Bluetooth/USB, dan cetak **kitchen order ticket** ke printer dapur atau tampil di KDS |
| FR-POS-09 | Void item / batalkan transaksi dengan alasan wajib diisi & log audit trail |
| FR-POS-10 | **Mode Offline**: POS tetap bisa menerima transaksi tanpa koneksi internet, transaksi disimpan lokal dan disinkronkan otomatis saat online kembali |
| FR-POS-11 | Riwayat transaksi hari berjalan dapat dilihat & di-void ulang oleh kasir dengan permission sesuai |
| FR-POS-12 | Cetak ulang struk (reprint) |

### 6.6 Modul: Manajemen Shift & Kas
| ID | Requirement |
|---|---|
| FR-SHIFT-01 | Kasir wajib "Buka Shift" dengan input modal kas awal sebelum bisa transaksi |
| FR-SHIFT-02 | Kasir "Tutup Shift" dengan input kas fisik akhir; sistem menampilkan kas seharusnya (sistem) vs kas fisik & selisih |
| FR-SHIFT-03 | Laporan ringkasan shift: total transaksi, total per metode pembayaran, total diskon, total void |
| FR-SHIFT-04 | Owner/Manager dapat melihat histori semua shift & rekonsiliasi kas per kasir |
| FR-SHIFT-05 | Pencatatan kas keluar/masuk di luar transaksi (mis. petty cash, pengeluaran operasional harian) |

### 6.7 Modul: Manajemen Pelanggan (Customer, Basic)
| ID | Requirement |
|---|---|
| FR-CUST-01 | CRUD data pelanggan sederhana (nama, No. HP) untuk keperluan struk/riwayat |
| FR-CUST-02 | Riwayat transaksi per pelanggan (opsional, jika nomor HP diinput) |
| FR-CUST-03 | *(Fase 2)* Program poin/loyalitas |

### 6.8 Modul: Promosi & Diskon
| ID | Requirement |
|---|---|
| FR-PROMO-01 | Buat promo diskon (persentase/nominal) dengan periode aktif & syarat minimum pembelian |
| FR-PROMO-02 | Buat promo bundling (mis. beli 2 gratis 1) — dasar sederhana |
| FR-PROMO-03 | Kode voucher/kupon manual input di kasir |

### 6.9 Modul: Laporan & Analitik (Reporting)
| ID | Requirement |
|---|---|
| FR-RPT-01 | Dashboard ringkasan harian: total omzet, jumlah transaksi, rata-rata nilai transaksi |
| FR-RPT-02 | Laporan penjualan per periode (harian/mingguan/bulanan/custom range), per kategori, per menu |
| FR-RPT-03 | Laporan **laba kotor** (omzet dikurangi HPP berdasarkan resep) per menu & per periode |
| FR-RPT-04 | Laporan produk terlaris & tidak laku (slow-moving items) |
| FR-RPT-05 | Laporan stok: nilai persediaan, bahan baku menipis, histori pergerakan stok |
| FR-RPT-06 | Laporan shift & kas per kasir |
| FR-RPT-07 | Laporan pajak (rekap pajak terkumpul per periode untuk pelaporan) |
| FR-RPT-08 | Export laporan ke Excel/PDF |
| FR-RPT-09 | Grafik tren penjualan (line chart) & perbandingan periode (mis. minggu ini vs minggu lalu) |

### 6.10 Modul: Pengaturan (Settings)
| ID | Requirement |
|---|---|
| FR-SET-01 | Pengaturan profil bisnis: nama, alamat, logo, No. HP (tampil di struk) |
| FR-SET-02 | Pengaturan pajak (PPN/PB1 %) dan service charge (%) |
| FR-SET-03 | Pengaturan meja (jumlah meja, nama/nomor meja, area/zona) |
| FR-SET-04 | Pengaturan printer (jenis, koneksi Bluetooth/USB/LAN, printer struk vs printer dapur) |
| FR-SET-05 | Pengaturan metode pembayaran yang diaktifkan & integrasi payment gateway (API key QRIS) |
| FR-SET-06 | Pengaturan langganan (paket, tanggal jatuh tempo, riwayat pembayaran, upgrade/downgrade paket) |
| FR-SET-07 | Pengaturan notifikasi (email/push untuk stok menipis, laporan harian otomatis) |

### 6.11 Modul: Kitchen Display / Dapur (Opsional MVP+)
| ID | Requirement |
|---|---|
| FR-KDS-01 | Tampilan antrian pesanan masuk untuk staff dapur berbasis status: Baru → Diproses → Siap → Diambil |
| FR-KDS-02 | Update status pesanan dari tablet dapur, notifikasi ke kasir saat pesanan siap |

### 6.12 Modul: Super Admin (Platform Internal)
| ID | Requirement |
|---|---|
| FR-ADM-01 | Super Admin dapat melihat daftar seluruh tenant, status langganan, dan aktivitas |
| FR-ADM-02 | Super Admin dapat suspend/aktivasi tenant, reset password Owner |
| FR-ADM-03 | Super Admin dapat mengelola paket harga langganan (pricing plan) |
| FR-ADM-04 | Dashboard monitoring kesehatan sistem & penggunaan (jumlah transaksi total, tenant aktif) |

---

## 7. User Flows Utama

### 7.1 Flow: Transaksi Penjualan (Dine-in)
1. Kasir login/pilih profil di POS → pastikan shift sudah dibuka.
2. Pilih mode "Dine-in" → pilih nomor meja.
3. Tambah item menu, pilih varian/modifier, tambah catatan.
4. Kirim pesanan ke dapur (cetak kitchen ticket / tampil di KDS) — status meja jadi "Terisi".
5. Pelanggan selesai makan → kasir buka kembali order meja tsb → klik "Bayar".
6. Sistem hitung subtotal + pajak + service charge - diskon.
7. Pilih metode pembayaran → input jumlah bayar (jika tunai, sistem hitung kembalian).
8. Sistem simpan transaksi, cetak struk, potong stok bahan baku sesuai resep tiap item terjual, set status meja jadi "Kosong".
9. Jika offline: transaksi disimpan di local storage device, ditandai "pending sync", otomatis dikirim ke server saat koneksi kembali tersedia.

### 7.2 Flow: Tutup Shift
1. Kasir klik "Tutup Shift" di akhir jam kerja.
2. Sistem menampilkan ringkasan: total transaksi per metode bayar, total diskon, total void, estimasi kas di laci (modal awal + tunai masuk - kas keluar).
3. Kasir input jumlah kas fisik hasil hitung manual.
4. Sistem hitung selisih (jika ada) → kasir wajib isi catatan jika selisih > 0.
5. Laporan shift tersimpan, dapat dilihat Owner/Manager di dashboard.

### 7.3 Flow: Stok Opname
1. Owner/Manager pilih menu "Stok Opname" di web dashboard.
2. Sistem tampilkan daftar bahan baku dengan stok sistem saat ini.
3. Input stok fisik hasil hitung manual di gudang/dapur untuk tiap bahan baku.
4. Sistem hitung selisih otomatis (stok sistem vs stok fisik).
5. Konfirmasi → sistem membuat jurnal penyesuaian stok dan update stok sistem menjadi sama dengan stok fisik.

### 7.4 Flow: Onboarding Tenant Baru
1. Calon pengguna sign up (isi nama bisnis, email, No. HP, pilih paket langganan/trial).
2. Verifikasi email/OTP.
3. Wizard setup awal: isi profil bisnis → buat kategori & menu (atau import template) → set pajak/service charge → tambah bahan baku dasar → buat akun kasir.
4. Owner dapat mengundang Manager/Kasir dengan mengirim link/kode invite.
5. Download & login aplikasi POS Android menggunakan akun kasir.

---

## 8. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Requirement |
|---|---|
| **Performance** | Waktu respon API < 500ms untuk 95% request (kondisi normal); load menu POS < 2 detik |
| **Offline Capability** | Aplikasi POS Android harus tetap berfungsi penuh untuk transaksi dasar (jual, bayar, cetak struk) tanpa internet minimal selama beberapa jam, dengan antrian sinkronisasi otomatis |
| **Scalability** | Arsitektur multi-tenant harus siap discale horizontal, serta dirancang agar mudah diperluas ke multi-outlet di fase berikutnya tanpa migrasi skema besar |
| **Security** | Data setiap tenant terisolasi (tenant isolation); password di-hash (bcrypt/argon2); komunikasi API via HTTPS/TLS; role-based access control di setiap endpoint |
| **Data Privacy** | Kepatuhan terhadap UU PDP (Perlindungan Data Pribadi) untuk data pelanggan & transaksi |
| **Availability** | Target uptime server pusat ≥ 99.5%; backup database harian otomatis |
| **Compatibility** | Web dashboard mendukung browser modern (Chrome, Edge, Safari); Android POS mendukung Android 8.0 ke atas |
| **Usability** | UI POS harus bisa dipelajari kasir baru dalam < 15 menit tanpa training formal |
| **Auditability** | Semua aksi sensitif (void, diskon manual, edit stok, hapus data) tercatat dalam audit log dengan user & timestamp |
| **Printer Compatibility** | Mendukung printer thermal 58mm/80mm via Bluetooth/USB, kompatibel dengan protokol ESC/POS umum |
| **Localization** | Bahasa Indonesia sebagai default, format mata uang Rupiah, format tanggal Indonesia |

---

## 9. Model Data / Entitas Utama (High-Level Data Model)

> Catatan: Ini adalah gambaran entitas tingkat tinggi untuk memandu perancangan database (ERD detail dibuat saat fase technical design).

**Entitas Inti:**
- `Tenant` (bisnis/outlet) — id, nama_bisnis, alamat, status_langganan, paket_id
- `User` — id, tenant_id, nama, email, no_hp, role, pin_kasir, status
- `Role` — id, nama_role, permissions (JSON)
- `Category` — id, tenant_id, nama_kategori
- `MenuItem` — id, tenant_id, category_id, nama, harga_jual, foto, status
- `MenuVariant` / `Modifier` — id, menu_item_id, nama, harga_tambahan
- `Ingredient` (Bahan Baku) — id, tenant_id, nama, satuan, stok_saat_ini, stok_minimum, harga_beli_terakhir
- `Recipe` (BOM) — id, menu_item_id, ingredient_id, jumlah_takaran, satuan
- `Supplier` — id, tenant_id, nama, kontak
- `PurchaseOrder` / `StockIn` — id, tenant_id, supplier_id, tanggal, items[]
- `StockMovement` (Kartu Stok) — id, ingredient_id, tipe (in/out/opname/sale), jumlah, referensi_id, tanggal
- `Table` (Meja) — id, tenant_id, nomor_meja, status, area
- `Order` — id, tenant_id, table_id, tipe (dine-in/takeaway/delivery), status, kasir_id, waktu
- `OrderItem` — id, order_id, menu_item_id, variant_id, qty, harga, catatan
- `Payment` — id, order_id, metode, jumlah, referensi
- `Shift` — id, tenant_id, kasir_id, waktu_buka, waktu_tutup, modal_awal, kas_sistem, kas_fisik, selisih
- `Discount` / `Promo` — id, tenant_id, tipe, nilai, periode_aktif, syarat
- `Customer` — id, tenant_id, nama, no_hp
- `AuditLog` — id, tenant_id, user_id, aksi, detail, timestamp
- `Subscription` — id, tenant_id, paket, tanggal_mulai, tanggal_berakhir, status_bayar

**Relasi Kunci:**
- 1 `Tenant` → banyak `User`, `MenuItem`, `Ingredient`, `Order`.
- 1 `MenuItem` → banyak `Recipe` (many-to-many dengan `Ingredient` melalui tabel Recipe).
- 1 `Order` → banyak `OrderItem` → tiap `OrderItem` memicu pengurangan stok sesuai `Recipe` dari `MenuItem`-nya.
- 1 `Shift` → banyak `Order` (transaksi yang terjadi dalam rentang shift tsb).

---

## 10. Pertimbangan Teknis (Technical Considerations)

> Bagian ini bersifat rekomendasi awal untuk memudahkan tahap development, bukan keputusan final arsitektur.

- **Arsitektur:** Multi-tenant SaaS dengan strategi *shared database, shared schema* + `tenant_id` di setiap tabel (paling efisien untuk skala UMKM single-outlet; migrasi ke *schema-per-tenant* bisa dipertimbangkan jika tenant besar/enterprise di masa depan).
- **Backend:** REST API atau GraphQL, dengan autentikasi JWT + refresh token, middleware RBAC per endpoint.
- **Database:** PostgreSQL/MySQL (relasional, cocok untuk data transaksi & stok yang butuh konsistensi/ACID).
- **Mobile POS (Android):** Local database (SQLite/Room) untuk offline-first, dengan queue sinkronisasi (background sync/WorkManager) ke server saat online. Perlu strategi resolusi konflik data (conflict resolution) untuk stok saat sinkronisasi dari device offline.
- **Web Dashboard:** SPA (React/Vue) dengan real-time update (WebSocket/Socket.io) untuk notifikasi stok menipis & status pesanan dapur.
- **Printer Integration:** SDK ESC/POS untuk cetak thermal via Bluetooth (Android) & LAN/USB.
- **Payment Gateway:** Integrasi QRIS via provider lokal (mis. Midtrans, Xendit, atau bank sesuai kebutuhan) untuk pembayaran non-tunai.
- **Notifikasi:** Push notification (Firebase Cloud Messaging) untuk mobile, email (SMTP/Sendgrid) untuk laporan & alert.
- **Hosting/Infra:** Cloud (AWS/GCP/Alibaba Cloud/lokal cloud Indonesia untuk kepatuhan data), dengan backup otomatis & monitoring (mis. Sentry, Grafana).
- **Kesiapan Multi-Outlet (masa depan):** Meskipun MVP single-outlet, skema `tenant_id` sebaiknya dirancang agar mudah ditambahkan `outlet_id` di bawah `tenant_id` tanpa migrasi besar.

---

## 11. Roadmap / Rencana Rilis

| Fase | Fitur Utama | Estimasi |
|---|---|---|
| **Fase 0 — Setup & Onboarding** | Auth, manajemen user/role, setup wizard tenant | 2-3 minggu |
| **Fase 1 — MVP Inti** | Master menu & kategori, resep/BOM, manajemen bahan baku dasar, POS transaksi (online), shift & kas, cetak struk | 6-8 minggu |
| **Fase 2 — Inventory Lanjutan & Offline** | Stok opname, kartu stok, mode offline POS + sinkronisasi, notifikasi stok menipis | 4-6 minggu |
| **Fase 3 — Laporan & Analitik** | Dashboard laporan penjualan/laba, export laporan, grafik tren | 3-4 minggu |
| **Fase 4 — Fitur Tambahan** | Promo/diskon lanjutan, split bill, manajemen meja, KDS dapur, integrasi QRIS | 4-6 minggu |
| **Fase 5 — Skalabilitas (Post-MVP)** | Multi-outlet, integrasi marketplace online (GoFood dll), loyalitas pelanggan, aplikasi iOS | TBD |

---

## 12. Risiko & Asumsi

### 12.1 Risiko
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Konflik data saat sinkronisasi offline (2 kasir transaksi bersamaan lalu online) | Data stok tidak akurat | Terapkan strategi resolusi konflik (last-write-wins dengan log, atau server-side stock validation ulang) |
| UMKM enggan berlangganan karena biaya | Adopsi rendah | Sediakan free trial & paket harga terjangkau/harga per fitur |
| Kasir kurang familiar teknologi | Kesalahan input tinggi | UI sederhana, training onboarding singkat, mode simulasi/demo |
| Ketergantungan pada koneksi internet untuk sinkronisasi laporan | Laporan tidak real-time saat outlet offline lama | Cache lokal + notifikasi status sinkronisasi jelas ke pengguna |

### 12.2 Asumsi
- Setiap tenant hanya memiliki 1 outlet fisik pada versi awal ini.
- Pengguna memiliki perangkat Android minimal versi 8.0 dan printer thermal yang kompatibel ESC/POS.
- Koneksi internet tersedia setidaknya secara berkala (untuk sinkronisasi), meski tidak harus selalu online.

---

## 13. Glosarium

| Istilah | Definisi |
|---|---|
| **BOM (Bill of Materials)** | Daftar bahan baku & takaran yang dibutuhkan untuk membuat 1 porsi menu |
| **HPP** | Harga Pokok Produksi/Penjualan — biaya bahan baku untuk memproduksi 1 unit menu |
| **KDS** | Kitchen Display System — layar digital untuk menampilkan antrian pesanan di dapur |
| **Reorder Point** | Batas stok minimum yang memicu peringatan untuk restock |
| **Stok Opname** | Proses pencocokan stok fisik dengan stok sistem |
| **Shift** | Periode kerja seorang kasir, dimulai saat buka shift dan berakhir saat tutup shift |
| **QRIS** | Quick Response Code Indonesian Standard — standar QR pembayaran nasional |
| **Tenant** | Satu akun bisnis pelanggan SaaS (dalam konteks ini = 1 outlet) |

---

## 14. Lampiran — Prioritas Fitur untuk MVP (Ringkasan Cepat)

**Must Have (P0):**
- Auth & role (Owner, Kasir)
- CRUD menu, kategori, resep/BOM
- CRUD bahan baku & pemotongan stok otomatis
- Transaksi POS dasar (dine-in/takeaway, tunai & QRIS)
- Buka/tutup shift
- Cetak struk
- Laporan penjualan dasar

**Should Have (P1):**
- Mode offline & sinkronisasi
- Stok opname & kartu stok
- Notifikasi stok menipis
- Laporan laba/HPP
- Split bill & manajemen meja

**Nice to Have (P2):**
- KDS dapur
- Promo/diskon lanjutan
- Manajemen pelanggan
- Export laporan

**Future (P3 - Fase 2+):**
- Multi-outlet
- Integrasi marketplace online
- Program loyalitas
- Aplikasi iOS

---

*Dokumen ini adalah living document — dapat diperbarui seiring hasil diskusi teknis dan feedback pengguna selama proses development.*
