export type CataloguePodType = 'single' | 'double' | 'king';
export type CataloguePodLayout = 'horizontal' | 'vertical';

export type PodCatalogueModel = {
  id?: string;
  key: string;
  series: string;
  name: string;
  code: string;
  podType: CataloguePodType;
  layout: CataloguePodLayout;
  occupancy: number;
  dimensions: string;
  material: string;
  basePrice: number;
  setPrice: number;
  isActive?: boolean;
  sortOrder?: number;
};

export const POD_CATALOGUE: PodCatalogueModel[] = [
  { key: 'abs-single', series: 'ABS', name: 'ABS Flagship 2025 — Single Horizontal (ZZK-HC02)', code: 'ZZK-HC02', podType: 'single', layout: 'horizontal', occupancy: 1, dimensions: '2060 x 1140 x 2400 mm', material: 'Premium ABS + high-quality metal frame', basePrice: 80600, setPrice: 161200 },
  { key: 'abs-double', series: 'ABS', name: 'ABS Flagship 2025 — Double Horizontal (ZZK-SR02)', code: 'ZZK-SR02', podType: 'double', layout: 'horizontal', occupancy: 2, dimensions: '2060 x 1580 x 2400 mm', material: 'Premium ABS + high-quality metal frame', basePrice: 101400, setPrice: 202800 },
  { key: 'abs-vertical-single', series: 'ABS', name: 'ABS Flagship 2025 — Single Vertical (ZZK-SC02)', code: 'ZZK-SC02', podType: 'single', layout: 'vertical', occupancy: 1, dimensions: '2060 x 1140 x 2400 mm', material: 'Premium ABS + high-quality metal frame', basePrice: 80600, setPrice: 161200 },
  { key: 'future-single', series: 'BACK TO FUTURE 2047', name: 'BACK TO FUTURE 2047 — Horizontal Single', code: 'BTF-HS', podType: 'single', layout: 'horizontal', occupancy: 1, dimensions: '2060 x 1140 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 80600, setPrice: 161200 },
  { key: 'future-double', series: 'BACK TO FUTURE 2047', name: 'BACK TO FUTURE 2047 — Horizontal Double', code: 'BTF-HD', podType: 'double', layout: 'horizontal', occupancy: 2, dimensions: '2060 x 1580 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 101400, setPrice: 202800 },
  { key: 'future-vertical-single', series: 'BACK TO FUTURE 2047', name: 'BACK TO FUTURE 2047 — Vertical Single', code: 'BTF-VS', podType: 'single', layout: 'vertical', occupancy: 1, dimensions: '2060 x 1140 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 80600, setPrice: 161200 },
  { key: 'galaxy-single', series: 'GALAXY', name: 'GALAXY — Horizontal Single', code: 'GAL-HS', podType: 'single', layout: 'horizontal', occupancy: 1, dimensions: '2060 x 1140 x 2400 mm (L x W x H, ladder 300 mm)', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 80600, setPrice: 161200 },
  { key: 'galaxy-double', series: 'GALAXY', name: 'GALAXY — Horizontal Double', code: 'GAL-HD', podType: 'double', layout: 'horizontal', occupancy: 2, dimensions: '2060 x 1580 x 2400 mm (L x W x H, ladder 300 mm)', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 101400, setPrice: 202800 },
  { key: 'galaxy-king', series: 'GALAXY', name: 'GALAXY — Horizontal Big Bed (King)', code: 'GAL-HK', podType: 'king', layout: 'horizontal', occupancy: 3, dimensions: '2060 x 1950 x 2400 mm (L x W x H, ladder 300 mm)', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 120900, setPrice: 241800 },
  { key: 'cosmos-single', series: 'COSMOS', name: 'COSMOS — Horizontal Single', code: 'COS-HS', podType: 'single', layout: 'horizontal', occupancy: 1, dimensions: '2060 x 1140 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 80600, setPrice: 161200 },
  { key: 'cosmos-double', series: 'COSMOS', name: 'COSMOS — Horizontal Double', code: 'COS-HD', podType: 'double', layout: 'horizontal', occupancy: 2, dimensions: '2060 x 1580 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 101400, setPrice: 202800 },
  { key: 'cosmos-vertical-single', series: 'COSMOS', name: 'COSMOS — Vertical Single', code: 'COS-VS', podType: 'single', layout: 'vertical', occupancy: 1, dimensions: '2060 x 1140 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 80600, setPrice: 161200 },
  { key: 'cosmos-king', series: 'COSMOS', name: 'COSMOS — Horizontal Big Bed (King)', code: 'COS-HK', podType: 'king', layout: 'horizontal', occupancy: 3, dimensions: '2060 x 1950 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 120900, setPrice: 241800 },
  { key: 'esports-single', series: 'E-sports', name: 'E-sports — Horizontal Single', code: 'ESP-HS', podType: 'single', layout: 'horizontal', occupancy: 1, dimensions: '2150 x 1150 x 2400 mm (ladder 180 mm)', material: 'Eco board + Taiwan Chi-Mei V0 ABS + high-quality metal', basePrice: 88700, setPrice: 177400 },
  { key: 'explore-single', series: 'EXPLORE THE WORLD', name: 'EXPLORE THE WORLD — Horizontal Single', code: 'EXW-HS', podType: 'single', layout: 'horizontal', occupancy: 1, dimensions: '2060 x 1140 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 80600, setPrice: 161200 },
  { key: 'explore-double', series: 'EXPLORE THE WORLD', name: 'EXPLORE THE WORLD — Horizontal Double', code: 'EXW-HD', podType: 'double', layout: 'horizontal', occupancy: 2, dimensions: '2060 x 1580 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 101400, setPrice: 202800 },
  { key: 'space-single', series: 'SPACE', name: 'SPACE — Horizontal Single', code: 'SPC-HS', podType: 'single', layout: 'horizontal', occupancy: 1, dimensions: '2060 x 1140 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 80600, setPrice: 161200 },
  { key: 'space-double', series: 'SPACE', name: 'SPACE — Horizontal Double', code: 'SPC-HD', podType: 'double', layout: 'horizontal', occupancy: 2, dimensions: '2060 x 1580 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 101400, setPrice: 202800 },
  { key: 'space-king', series: 'SPACE', name: 'SPACE — Horizontal Big Bed (King)', code: 'SPC-HK', podType: 'king', layout: 'horizontal', occupancy: 3, dimensions: '2060 x 1950 x 2400 mm', material: 'Taiwan Chi-Mei V0 fire-retardant ABS + high-quality metal', basePrice: 120900, setPrice: 241800 },
  { key: 'wooden-single', series: 'WOODEN', name: 'WOODEN — Horizontal Single', code: 'WOD-HS', podType: 'single', layout: 'horizontal', occupancy: 1, dimensions: '2150 x 1100 x 2400 mm (ladder 480 mm)', material: 'Eco multi-layer board + high-quality metal', basePrice: 84600, setPrice: 169200 },
  { key: 'wooden-vertical-single', series: 'WOODEN', name: 'WOODEN — Vertical Single', code: 'WOD-VS', podType: 'single', layout: 'vertical', occupancy: 1, dimensions: '2150 x 1100 x 2400 mm (ladder 480 mm)', material: 'Eco multi-layer board + high-quality metal', basePrice: 84600, setPrice: 169200 },
  { key: 'frp-single', series: 'FRP', name: 'Made-in-India FRP — Horizontal Single', code: 'FRP-HS', podType: 'single', layout: 'horizontal', occupancy: 1, dimensions: 'External 2150 x 1270 x 1270 mm | Internal 2000 x 1000 x 1000 mm', material: 'Standard FRP (fibreglass) with mild-steel structure', basePrice: 80600, setPrice: 161200 },
  { key: 'frp-double', series: 'FRP', name: 'Made-in-India FRP — Horizontal Double', code: 'FRP-HD', podType: 'double', layout: 'horizontal', occupancy: 2, dimensions: 'External 2150 x 1700 x 1270 mm | Internal 2000 x 1430 x 1000 mm', material: 'Standard FRP (fibreglass) with mild-steel structure', basePrice: 101400, setPrice: 202800 },
  { key: 'frp-king', series: 'FRP', name: 'Made-in-India FRP — Horizontal Big Bed (King)', code: 'FRP-HK', podType: 'king', layout: 'horizontal', occupancy: 3, dimensions: 'External 2150 x 2070 x 1270 mm | Internal 2000 x 1800 x 1000 mm', material: 'Standard FRP (fibreglass) with mild-steel structure', basePrice: 120900, setPrice: 241800 },
];