

## AI Chat Assistant untuk Buyer dan Seller

### Tujuan
Menambahkan fitur AI Chat yang memberikan rekomendasi kepada:
- **Buyer**: rekomendasi stok herbal dari supplier tertentu, perbandingan harga, saran supplier terbaik
- **Seller**: rekomendasi penetapan harga berdasarkan data pasar, saran stok optimal, tren permintaan

### Pendekatan
Karena proyek ini tidak menggunakan Supabase/backend dan semua data bersifat mock (localStorage), AI chat akan menggunakan **smart auto-response system** yang menganalisis data produk dan supplier dari `src/lib/products.ts` untuk menghasilkan rekomendasi kontekstual. Ini konsisten dengan pola yang sudah ada di `SupplierChat.tsx`.

### File yang akan dibuat/diubah

**1. Buat `src/components/AIChatAssistant.tsx` (baru)**
- Floating chat button (mirip SupplierChat) dengan ikon AI/Bot
- Chat UI dengan header yang menampilkan role (Buyer/Seller)
- Sistem auto-response cerdas berdasarkan role:
  - **Buyer mode**: 
    - Ketik "recommend" / "rekomendasi" -> saran produk + supplier berdasarkan rating, harga, stok
    - Ketik "price" / "harga" -> perbandingan harga antar supplier
    - Ketik "supplier" -> ranking supplier terbaik berdasarkan rating & sales
    - Ketik nama produk (turmeric, cinnamon, dll) -> info detail + supplier tersedia
  - **Seller mode**:
    - Ketik "pricing" / "harga" -> rekomendasi penetapan harga berdasarkan kompetitor
    - Ketik "stock" / "stok" -> saran stok optimal berdasarkan tren penjualan
    - Ketik "trend" / "tren" -> analisis tren permintaan produk
    - Ketik nama produk -> insight pasar untuk produk tersebut
- Predefined quick-action buttons (chips) di bawah chat:
  - Buyer: "Best suppliers?", "Price comparison", "Stock recommendations"
  - Seller: "Pricing strategy", "Stock optimization", "Market trends"
- Typing indicator saat "AI sedang berpikir"
- Scroll otomatis ke pesan terbaru

**2. Ubah `src/pages/buyer/Dashboard.tsx`**
- Import dan tambahkan `<AIChatAssistant role="buyer" />` di akhir halaman

**3. Ubah `src/pages/seller/Dashboard.tsx`**
- Import dan tambahkan `<AIChatAssistant role="seller" />` di akhir halaman

### Detail teknis

Response AI akan dibuat dari data real di `products.ts`:
- Mengurutkan produk berdasarkan harga, rating supplier, stok
- Menghitung rata-rata harga pasar untuk rekomendasi pricing
- Menganalisis stok tersedia per supplier
- Format respons dengan bullet points dan angka konkret

Contoh respons buyer:
> "Based on current market data, here are top 3 recommended suppliers for Turmeric:
> 1. Java Herbs Co. - $9.99/kg, Rating 4.8, 5000kg in stock
> 2. ..."

Contoh respons seller:
> "Pricing recommendation for Turmeric:
> - Market average: $9.99/kg
> - Suggested range: $9.50 - $11.00/kg
> - Current demand: High (1250 units sold)"

### UI/UX
- Posisi: fixed bottom-right (z-50), tidak bentrok dengan SupplierChat (yang hanya muncul di Product page)
- Warna aksen berbeda dari SupplierChat: gradient hijau/biru untuk AI branding
- Badge "AI" pada avatar chat
- Animasi smooth open/close

