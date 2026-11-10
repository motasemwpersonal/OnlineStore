// تعريفات الأنواع وقاعدة البيانات لمتجر العروض الشامل

export interface StoreSettings {
  id: string;
  store_name: string;
  whatsapp_number: string;
  currency: string;
  description?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon_or_image?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  // خصائص مساعدة للعرض الهرمي
  subcategories?: Category[];
}

export interface ProductVariant {
  name: string; // مثل: اللون، المقاس، الجهد، السعة
  options: string[]; // مثل: ["أبيض", "أسود"] أو ["500ml", "1000ml"]
}

export type TargetAudienceType = 'نساء' | 'رجال' | 'أطفال' | 'عام';

export interface Product {
  id: string;
  category_id: string;
  target_audience: TargetAudienceType[];
  name: string;
  description?: string;
  base_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  images: string[];
  variants: ProductVariant[];
  is_visible: boolean;
  views_count: number;
  created_at?: string;
  // علاقات ملحقة
  category?: Category;
  active_offer?: Offer | null;
}

export interface Offer {
  id: string;
  product_id: string;
  discount_price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  clicks_count: number;
  created_at?: string;
  product?: Product;
}

export interface BundleItem {
  id?: string;
  bundle_id?: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Bundle {
  id: string;
  title: string;
  description?: string;
  bundle_price: number;
  original_total_price: number;
  image_url?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  clicks_count: number;
  created_at?: string;
  items?: BundleItem[];
}

// عنصر في سلة المشتريات
export interface CartItem {
  cartItemId: string; // معرف فريد مركب (مثلاً product.id + خيارات)
  type: 'product' | 'bundle';
  product?: Product;
  bundle?: Bundle;
  quantity: number;
  selectedVariants?: Record<string, string>; // مثل {"اللون": "أبيض", "المقاس": "L"}
  unitPrice: number; // السعر الفعلي بعد الخصم
  originalPrice: number; // السعر الأصلي قبل الخصم
}
