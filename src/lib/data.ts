import { Product } from "./types";

// MYCOAT 种子产品 —— 8 款羽绒服（对标高端羽绒服品牌，200 美元价位）
// 图片存放于 public/products/，可直接替换同名文件换图
export const products: Product[] = [
  {
    id: "mw-001",
    name: "Black Diamond-Quilt Puffer",
    slug: "black-diamond-quilt-puffer",
    category: "men", subcategory: "men_short",
    price: 199,
    description:
      "Our signature short puffer with a classic diamond-quilt pattern. Filled with 90/10 European grey goose down for exceptional warmth without the weight. The matte shell is water-repellent and windproof, finished with a tonal zip and ribbed cuffs.",
    details: [
      "90/10 European grey goose down, 700+ fill power",
      "Matte water-repellent shell (DWR coated)",
      "Classic diamond quilting, tonal hardware",
      "Two zip hand pockets + interior pocket",
      "Ribbed cuffs and hem for heat retention",
    ],
    materials: "Nylon shell, 90/10 goose down, YKK zippers",
    dimensions: "Short length · Regular fit · Model wears M",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/products/mens-black-puffer.jpg"],
    inStock: true,
    featured: true,
    newArrival: true,
  },
  {
    id: "mw-002",
    name: "Navy Long Down Coat",
    slug: "navy-long-down-coat",
    category: "men", subcategory: "men_long",
    price: 259,
    description:
      "A refined long down coat in deep navy. Horizontal baffles keep the insulation evenly distributed, while the high collar shields against the wind. Cut to a clean, architectural silhouette that works from city streets to alpine resorts.",
    details: [
      "90/10 European grey goose down, 700+ fill power",
      "High stand collar with concealed hood",
      "Horizontal baffle quilting",
      "Water-repellent micro-peached shell",
      "Two-way YKK zipper",
    ],
    materials: "Micro-peached nylon, 90/10 goose down, YKK zippers",
    dimensions: "Long length (mid-thigh) · Regular fit",
    colors: ["Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/products/mens-navy-long.jpg"],
    inStock: true,
    featured: true,
    newArrival: false,
  },
  {
    id: "mw-003",
    name: "Black Down Vest",
    slug: "black-down-vest",
    category: "men", subcategory: "men_vest",
    price: 149,
    description:
      "A lightweight quilted down vest, built for layering. High-loft insulation keeps your core warm while leaving arms free. Packs into its own pocket — the perfect travel companion.",
    details: [
      "90/10 goose down insulation",
      "Lightweight shell, packs into its own pocket",
      "Stand collar, snap + zip closure",
      "Two hand pockets",
      "Layered under a jacket or worn alone",
    ],
    materials: "Nylon shell, 90/10 goose down",
    dimensions: "Hip length · Regular fit",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/products/mens-black-vest.jpg"],
    inStock: true,
    featured: false,
    newArrival: true,
  },
  {
    id: "mw-004",
    name: "Cream Oversized Short Puffer",
    slug: "cream-oversized-short-puffer",
    category: "women", subcategory: "women_short",
    price: 189,
    description:
      "An oversized short puffer in warm cream. Boxy, easy silhouette with soft, cloud-like loft. The clean stand collar and tonal trims give it a minimalist edge that pairs with everything.",
    details: [
      "90/10 European grey goose down, 700+ fill power",
      "Oversized boxy fit",
      "Matte water-repellent shell",
      "Tonal snap buttons + zip",
      "Drop-in hand pockets",
    ],
    materials: "Matte nylon shell, 90/10 goose down",
    dimensions: "Oversized fit · Model wears S",
    colors: ["Cream", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: ["/products/womens-cream-short.jpg"],
    inStock: true,
    featured: true,
    newArrival: true,
  },
  {
    id: "mw-005",
    name: "Camel Long Parka with Fur Trim",
    slug: "camel-long-parka-fur-trim",
    category: "women", subcategory: "women_long",
    price: 289,
    description:
      "Our iconic long parka in rich camel. A removable faux-fur trim frames the hood, while baffle quilting and a storm placket keep the elements out. Designed for deep winter at $289.",
    details: [
      "90/10 European grey goose down, 700+ fill power",
      "Removable faux-fur hood trim",
      "Storm placket with hidden zip",
      "Snap + zip hand pockets",
      "Adjustable drawcord waist",
    ],
    materials: "Cotton-blend shell, 90/10 goose down, faux fur",
    dimensions: "Knee length · Relaxed fit",
    colors: ["Camel"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: ["/products/womens-camel-parka.jpg"],
    inStock: true,
    featured: true,
    newArrival: false,
  },
  {
    id: "mw-006",
    name: "Red Hooded Puffer",
    slug: "red-hooded-puffer",
    category: "women", subcategory: "women_short",
    price: 179,
    description:
      "A statement red hooded puffer with a matte finish. The fixed hood, zip chest pockets and short boxy cut give it a sporty, alpine energy — our boldest color of the season.",
    details: [
      "90/10 goose down insulation",
      "Fixed hood with elastic binding",
      "Zip chest pocket",
      "Matte water-repellent shell",
      "Ribbed cuffs",
    ],
    materials: "Matte nylon shell, 90/10 goose down",
    dimensions: "Short length · Regular fit",
    colors: ["Red", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: ["/products/womens-red-hooded.jpg"],
    inStock: true,
    featured: false,
    newArrival: true,
  },
  {
    id: "mw-007",
    name: "Ultra-Light Packable Puffer",
    slug: "ultra-light-packable-puffer",
    category: "men", subcategory: "men_short",
    price: 169,
    description:
      "Featherweight insulation in a fine diamond-quilt shell. Compresses into a small pouch for travel, then bounces back with full loft. The everyday layering piece at an honest price.",
    details: [
      "90/10 goose down, 800+ fill power",
      "Compresses into included storage pouch",
      "Fine diamond quilting",
      "Ultra-light ripstop shell",
      "Full zip with chin guard",
    ],
    materials: "Ripstop nylon, 90/10 goose down",
    dimensions: "Hip length · Slim fit",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/products/mens-black-packable.jpg"],
    inStock: true,
    featured: false,
    newArrival: false,
  },
  {
    id: "mw-008",
    name: "Silver Metallic Puffer",
    slug: "silver-metallic-puffer",
    category: "women", subcategory: "women_short",
    price: 209,
    description:
      "Our most eye-catching piece — a mirror-finish metallic shell that catches every light. Short, sharp and unmistakably modern, with the same 90/10 down warmth inside.",
    details: [
      "Metallic coated shell with mirror finish",
      "90/10 goose down insulation",
      "Stand collar, full zip",
      "Quilted baffle pattern",
      "Wipe-clean surface",
    ],
    materials: "Metallic coated nylon, 90/10 goose down",
    dimensions: "Short length · Regular fit",
    colors: ["Silver"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: ["/products/womens-silver-matte.jpg"],
    inStock: true,
    featured: true,
    newArrival: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(cat: Product["category"]): Product[] {
  return products.filter((p) => p.category === cat);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getNewArrivals(): Product[] {
  return products.filter((p) => p.newArrival);
}

// 默认子分类（男装 / 女装）
export const defaultSubcategories = [
  { id: "men_short", name: "Short Down", category: "men", sortOrder: 0 },
  { id: "men_long", name: "Long Down", category: "men", sortOrder: 1 },
  { id: "men_vest", name: "Vests", category: "men", sortOrder: 2 },
  { id: "women_short", name: "Short Down", category: "women", sortOrder: 0 },
  { id: "women_long", name: "Long Down", category: "women", sortOrder: 1 },
  { id: "women_parka", name: "Parkas", category: "women", sortOrder: 2 },
] as const;

