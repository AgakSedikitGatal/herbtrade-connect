export interface SeasonInfo {
  name: string;
  nameId: string;
  months: number[];
  description: string;
}

export interface ProductSeason {
  productId: string;
  plantingSeason: string;
  harvestMonths: number[];
  peakMonths: number[];
  availability: 'year-round' | 'seasonal';
  notes: string;
}

export const seasons: SeasonInfo[] = [
  {
    name: 'Rainy Season',
    nameId: 'Musim Hujan',
    months: [10, 11, 12, 1, 2, 3],
    description: 'Oktober - Maret: Curah hujan tinggi, cocok untuk tanaman yang membutuhkan banyak air'
  },
  {
    name: 'Dry Season',
    nameId: 'Musim Kemarau',
    months: [4, 5, 6, 7, 8, 9],
    description: 'April - September: Cuaca kering, cocok untuk panen dan pengeringan simplisia'
  }
];

export const productSeasons: ProductSeason[] = [
  {
    productId: 'CL001',
    plantingSeason: 'Musim Hujan',
    harvestMonths: [6, 7, 8, 9],
    peakMonths: [7, 8],
    availability: 'seasonal',
    notes: 'Turmeric ditanam saat musim hujan, dipanen saat musim kemarau. Kualitas curcumin terbaik saat panen Juli-Agustus.'
  },
  {
    productId: 'AP001',
    plantingSeason: 'Musim Hujan',
    harvestMonths: [3, 4, 5, 6, 7],
    peakMonths: [4, 5],
    availability: 'seasonal',
    notes: 'Andrographis tumbuh subur di musim hujan, dipanen saat peralihan ke musim kemarau.'
  },
  {
    productId: 'CV001',
    plantingSeason: 'Sepanjang Tahun',
    harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    peakMonths: [5, 6, 7],
    availability: 'year-round',
    notes: 'Cinnamon dapat dipanen sepanjang tahun, namun kualitas terbaik saat musim kemarau awal.'
  },
  {
    productId: 'PN001',
    plantingSeason: 'Musim Hujan',
    harvestMonths: [12, 1, 2, 3],
    peakMonths: [1, 2],
    availability: 'seasonal',
    notes: 'Black Pepper dipanen saat musim hujan. Butir lada terbaik dipanen Januari-Februari.'
  },
  {
    productId: 'MF001',
    plantingSeason: 'Musim Hujan',
    harvestMonths: [6, 7, 8, 9, 10],
    peakMonths: [7, 8, 9],
    availability: 'seasonal',
    notes: 'Nutmeg dipanen saat musim kemarau. Buah pala matang optimal Juli-September.'
  }
];

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentSeason(): SeasonInfo {
  const month = getCurrentMonth();
  return seasons.find(s => s.months.includes(month)) || seasons[0];
}

export function getMonthName(month: number): string {
  return monthNames[month - 1] || '';
}

export function isProductInSeason(productId: string): boolean {
  const month = getCurrentMonth();
  const ps = productSeasons.find(p => p.productId === productId);
  if (!ps) return false;
  return ps.harvestMonths.includes(month);
}

export function isProductInPeakSeason(productId: string): boolean {
  const month = getCurrentMonth();
  const ps = productSeasons.find(p => p.productId === productId);
  if (!ps) return false;
  return ps.peakMonths.includes(month);
}

export function getSeasonalProductIds(): string[] {
  const month = getCurrentMonth();
  return productSeasons
    .filter(ps => ps.harvestMonths.includes(month))
    .map(ps => ps.productId);
}

export function getUpcomingHarvestProducts(): { productId: string; nextMonth: string }[] {
  const month = getCurrentMonth();
  const nextMonth = month === 12 ? 1 : month + 1;
  const next2Month = nextMonth === 12 ? 1 : nextMonth + 1;
  
  return productSeasons
    .filter(ps => !ps.harvestMonths.includes(month) && (ps.harvestMonths.includes(nextMonth) || ps.harvestMonths.includes(next2Month)))
    .map(ps => ({
      productId: ps.productId,
      nextMonth: getMonthName(ps.harvestMonths.find(m => m === nextMonth || m === next2Month) || nextMonth)
    }));
}

export function getProductSeasonInfo(productId: string): ProductSeason | undefined {
  return productSeasons.find(ps => ps.productId === productId);
}
