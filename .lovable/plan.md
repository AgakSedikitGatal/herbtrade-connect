

## Buat Halaman AI Assistant untuk Dashboard Buyer & Seller

### Ringkasan
Membuat halaman full-page dedicated untuk AI Chat Assistant yang dapat diakses dari Quick Actions di dashboard buyer dan seller. Halaman ini akan memiliki layout yang lebih luas dibanding floating chat widget, dengan sidebar untuk quick actions dan area chat yang lebih besar.

### File yang akan dibuat/diubah

**1. Buat `src/pages/buyer/AIAssistant.tsx` (baru)**
- Full-page AI chat untuk buyer dengan layout: header, sidebar quick actions, dan area chat utama
- Reuse logic dari `AIChatAssistant.tsx` (generateBuyerResponse)
- Sidebar berisi: quick action buttons, product categories, dan tips
- Chat area lebih besar dengan scroll, input, dan message rendering
- Wrapped dengan Web3Header, Web3Footer, Web3Background

**2. Buat `src/pages/seller/AIAssistant.tsx` (baru)**
- Sama seperti buyer tapi dengan generateSellerResponse
- Sidebar quick actions: Pricing strategy, Stock optimization, Market trends
- Tambahan section di sidebar: market summary stats (avg price, total products, dll)

**3. Ubah `src/pages/buyer/Dashboard.tsx`**
- Tambah card "AI Assistant" di Quick Actions grid (link ke `/buyer/ai-assistant`)
- Ganti icon dengan Bot/Sparkles

**4. Ubah `src/pages/seller/Dashboard.tsx`**
- Tambah card "AI Assistant" di Quick Actions grid (link ke `/seller/ai-assistant`)

**5. Ubah `src/App.tsx`**
- Import dan tambah route `/buyer/ai-assistant` dan `/seller/ai-assistant`

### Layout halaman AI

```text
┌─────────────────────────────────────────┐
│  Web3Header                             │
├────────────┬────────────────────────────┤
│  Sidebar   │  Chat Area                 │
│            │                            │
│ Quick      │  Messages (scrollable)     │
│ Actions    │                            │
│            │                            │
│ Categories │                            │
│            │                            │
│ Tips       │  ────────────────────────  │
│            │  [Input] [Send]            │
├────────────┴────────────────────────────┤
│  Web3Footer                             │
└─────────────────────────────────────────┘
```

Floating chat widget (`AIChatAssistant`) tetap ada di dashboard sebagai shortcut.

