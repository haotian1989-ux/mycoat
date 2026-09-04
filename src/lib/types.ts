export type ProductCategory = "men" | "women" | "unisex";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subcategory?: string;
  price: number;
  description: string;
  details: string[];
  materials: string;
  dimensions: string;
  colors: string[];
  sizes: string[];
  images: string[];
  video?: string; // Cloudinary 产品视频（竖版 9:16 更佳）
  inStock: boolean;
  featured: boolean;
  newArrival: boolean;
  createdAt?: string;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  category: ProductCategory;
  sortOrder?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
}

// 支付配置（PayPal + USDT）
export interface PaymentConfig {
  paypalUsername: string; // paypal.me 用户名
  paypalEmail: string;    // 收款邮箱（展示用）
  usdtAddress: string;    // TRC-20 收款地址
  usdtNetwork: string;    // 网络说明，如 TRC-20 (Tron)
}
