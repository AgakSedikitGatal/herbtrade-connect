

## Tiga Fitur Baru: Buyer Request Form, AI Review-Based Recommendations, dan Seasonal System

### 1. Fitur Permintaan Buyer (Buyer Product Request)

Membuat halaman baru di mana buyer bisa mengajukan permintaan produk herbal yang mereka butuhkan ke supplier.

**Buat `src/pages/buyer/ProductRequest.tsx`**
- Form berisi: nama produk, jumlah yang dibutuhkan, unit, budget range, deskripsi kebutuhan, preferred location/category
- Data disimpan ke localStorage via context baru
- Daftar permintaan yang sudah diajukan ditampilkan di bawah form dengan status (open/matched/closed)

**Buat `src/contexts/BuyerRequestContext.tsx`**
- Interface: `BuyerRequest { id, productName, quantity, unit, budgetMin, budgetMax, description, category, status, createdAt, matchedSuppliers[] }`
- CRUD operations dengan localStorage persistence

**Update routing & dashboard:**
- Tambah route `/buyer/product-request` di `App.tsx`
- Tambah card "Product Request" di Quick Actions buyer dashboard

### 2. AI Recommendations Berdasarkan Review/Testimoni

**Update `src/lib/products.ts`**
- Tambah field `reviews` ke Product interface:
  ```
  reviews: { user: string, rating: number, comment: string, date: string }[]
  ```
- Tambah mock review data ke setiap produk (3-5 review per produk)

**Update `src/pages/buyer/AIAssistant.tsx`**
- Tambah handler untuk keyword "review"/"testimoni"/"ulasan"
- AI akan merekomendasikan supplier berdasarkan rata-rata review rating, jumlah review positif, dan kutipan review terbaik
- Quick action baru: "Top Reviewed Suppliers"

**Update `src/pages/seller/AIAssistant.tsx`**
- Tambah handler untuk keyword "review"/"feedback"
- AI memberikan insight tentang review produk seller dan saran improvement

### 3. Fitur Musim (Seasonal System)

**Buat `src/lib/seasons.ts`**
- Definisi musim Indonesia: Musim Hujan (Oct-Mar), Musim Kemarau (Apr-Sep)
- Data seasonal per produk: kapan musim tanam, musim panen, ketersediaan optimal
- Fungsi `getCurrentSeason()` berdasarkan bulan sekarang (Date)
- Fungsi `getSeasonalProducts()` yang return produk yang sedang musim panen/tersedia
- Data contoh:
  - Turmeric: panen Musim Kemarau (Jun-Sep)
  - Cinnamon: panen sepanjang tahun
  - Black Pepper: panen Musim Hujan (Dec-Feb)
  - dll.

**Update `src/pages/buyer/AIAssistant.tsx` & `src/pages/seller/AIAssistant.tsx`**
- Tambah handler keyword "musim"/"season"/"seasonal"
- AI menampilkan produk yang sedang musim saat ini, produk yang akan segera musim, dan saran stok berdasarkan musim
- Quick action baru: "Current Season" / "Musim Saat Ini"

**Update `src/pages/Shop.tsx`**
- Tambah banner/section "Currently In Season 🌿" di atas product grid
- Tampilkan badge "In Season" pada product card yang sedang musim

**Update `src/pages/Index.tsx` (homepage)**
- Tambah section seasonal highlight di landing page

### File yang dibuat/diubah

| File | Aksi |
|------|------|
| `src/lib/seasons.ts` | Baru — seasonal data & helpers |
| `src/contexts/BuyerRequestContext.tsx` | Baru — buyer request state management |
| `src/pages/buyer/ProductRequest.tsx` | Baru — form & list permintaan buyer |
| `src/lib/products.ts` | Ubah — tambah reviews field |
| `src/pages/buyer/AIAssistant.tsx` | Ubah — tambah review & season handlers |
| `src/pages/seller/AIAssistant.tsx` | Ubah — tambah review & season handlers |
| `src/pages/Shop.tsx` | Ubah — seasonal banner & badge |
| `src/pages/buyer/Dashboard.tsx` | Ubah — tambah Product Request card |
| `src/App.tsx` | Ubah — tambah route & context provider |

