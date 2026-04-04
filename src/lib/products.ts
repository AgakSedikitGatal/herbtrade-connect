export interface ProductReview {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  scientificName: string;
  price: number;
  image: string;
  category: string;
  location: string;
  inStock: boolean;
  onSale: boolean;
  description: string;
  minOrder: {
    quantity: number;
    unit: string;
  };
  specifications: {
    essentialOil?: string;
    curcumin?: string;
    packing: string;
    effectiveIngredients: string;
    certificate: string;
    model: string;
    casNo: string;
  };
  cultivationArea: string;
  supplier: {
    id: string;
    name: string;
    location: string;
    rating: number;
    totalSales: number;
    stock: number;
    verified: boolean;
  };
  reviews: ProductReview[];
}

export const products: Product[] = [
  {
    id: 'CL001',
    name: 'Turmeric',
    scientificName: 'Curcuma longa',
    price: 9.99,
    image: '/turmeric.jpg',
    category: 'East Java',
    location: 'Malang, East Java',
    inStock: true,
    onSale: true,
    description: 'Premium quality turmeric simplisia from East Java. Known for its high curcumin content and medicinal properties.',
    minOrder: {
      quantity: 100,
      unit: 'Kilogram'
    },
    specifications: {
      essentialOil: 'not less than 1.85% v/b',
      curcumin: 'not less than 3.82%',
      packing: '25kg/fiber drum',
      effectiveIngredients: 'Curcumin',
      certificate: 'ISO9001, GMP',
      model: 'HK120095',
      casNo: '458-37-7'
    },
    cultivationArea: 'East Java - Malang',
    supplier: {
      id: 'SUP001',
      name: 'Java Herbs Co.',
      location: 'Malang, East Java',
      rating: 4.8,
      totalSales: 1250,
      stock: 5000,
      verified: true
    }
  },
  {
    id: 'AP001',
    name: 'Andrographis',
    scientificName: 'Andrographis paniculata',
    price: 12.50,
    image: '/andrographis.jpg',
    category: 'West Java',
    location: 'Bogor, West Java',
    inStock: true,
    onSale: false,
    description: 'High-quality Andrographis paniculata, known for its immune-boosting properties.',
    minOrder: {
      quantity: 50,
      unit: 'Kilogram'
    },
    specifications: {
      packing: '20kg/carton',
      effectiveIngredients: 'Andrographolide',
      certificate: 'ISO9001, GMP, BPOM',
      model: 'HK120096',
      casNo: '5508-58-7'
    },
    cultivationArea: 'West Java - Bogor',
    supplier: {
      id: 'SUP002',
      name: 'West Java Botanics',
      location: 'Bogor, West Java',
      rating: 4.7,
      totalSales: 890,
      stock: 3200,
      verified: true
    }
  },
  {
    id: 'CV001',
    name: 'Ceylon Cinnamon',
    scientificName: 'Cinnamomum verum',
    price: 15.99,
    image: '/cinnamon.jpg',
    category: 'Middle Java',
    location: 'Semarang, Middle Java',
    inStock: true,
    onSale: true,
    description: 'Premium Ceylon cinnamon bark, known for its sweet flavor and medicinal properties.',
    minOrder: {
      quantity: 200,
      unit: 'Kilogram'
    },
    specifications: {
      packing: '15kg/box',
      effectiveIngredients: 'Cinnamaldehyde',
      certificate: 'ISO9001, Organic, Halal',
      model: 'HK120097',
      casNo: '8015-91-6'
    },
    cultivationArea: 'Middle Java - Semarang',
    supplier: {
      id: 'SUP003',
      name: 'Central Java Herbs',
      location: 'Semarang, Middle Java',
      rating: 4.9,
      totalSales: 1100,
      stock: 4500,
      verified: true
    }
  },
  {
    id: 'PN001',
    name: 'Black Pepper',
    scientificName: 'Piper nigrum',
    price: 18.75,
    image: '/blackpaper.jpg',
    category: 'North Sumatra',
    location: 'Medan, North Sumatra',
    inStock: true,
    onSale: false,
    description: 'Premium quality black pepper with strong aroma and high piperine content.',
    minOrder: {
      quantity: 500,
      unit: 'Kilogram'
    },
    specifications: {
      packing: '25kg/bag',
      effectiveIngredients: 'Piperine',
      certificate: 'ISO9001, GMP, Phytosanitary',
      model: 'HK120098',
      casNo: '84929-31-7'
    },
    cultivationArea: 'North Sumatra - Medan',
    supplier: {
      id: 'SUP004',
      name: 'Sumatra Spices',
      location: 'Medan, North Sumatra',
      rating: 4.6,
      totalSales: 780,
      stock: 2800,
      verified: true
    }
  },
  {
    id: 'MF001',
    name: 'Nutmeg',
    scientificName: 'Myristica fragrans',
    price: 22.50,
    image: '/Nutmeg.jpg',
    category: 'South Kalimantan',
    location: 'Banjarmasin, South Kalimantan',
    inStock: true,
    onSale: true,
    description: 'High-quality nutmeg with rich aroma and flavor, perfect for culinary and medicinal use.',
    minOrder: {
      quantity: 100,
      unit: 'Box'
    },
    specifications: {
      packing: '20kg/carton',
      effectiveIngredients: 'Myristicin',
      certificate: 'ISO9001, GMP, Halal',
      model: 'HK120099',
      casNo: '8008-45-5'
    },
    cultivationArea: 'South Kalimantan - Banjarmasin',
    supplier: {
      id: 'SUP005',
      name: 'Kalimantan Natural',
      location: 'Banjarmasin, South Kalimantan',
      rating: 4.5,
      totalSales: 650,
      stock: 2100,
      verified: false
    }
  }
];

export const categories = [
  'East Java',
  'West Java',
  'Middle Java',
  'North Sumatra',
  'South Kalimantan'
];
