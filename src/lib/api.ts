import { supabase, isSupabaseConfigured } from './supabase';
import { compressProductImage } from './compression';
import {
  Category,
  Product,
  Offer,
  Bundle,
  BundleItem,
  StoreSettings,
  TargetAudienceType,
} from '@/types/database';
import {
  mockStoreSettings,
  mockCategories,
  mockProducts,
  mockOffers,
  mockBundles,
} from './mockData';

// مخزن مؤقت محلي عند العمل بدون Supabase
let localSettings = { ...mockStoreSettings };
let localCategories = [...mockCategories];
let localProducts = [...mockProducts];
let localOffers = [...mockOffers];
let localBundles = [...mockBundles];

// ----------------------------------------------------------------------
// 1. إعدادات المتجر (Store Settings)
// ----------------------------------------------------------------------
export async function getStoreSettings(): Promise<StoreSettings> {
  if (!isSupabaseConfigured()) {
    return localSettings;
  }

  try {
    const { data, error } = await supabase.from('store_settings').select('*').limit(1).single();
    if (error || !data) {
      return localSettings;
    }
    return data as StoreSettings;
  } catch (err) {
    console.warn('استخدام إعدادات المتجر الافتراضية:', err);
    return localSettings;
  }
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  if (!isSupabaseConfigured()) {
    localSettings = { ...localSettings, ...settings, updated_at: new Date().toISOString() };
    return localSettings;
  }

  const { data, error } = await supabase
    .from('store_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', settings.id || localSettings.id)
    .select()
    .single();

  if (error) throw error;
  return data as StoreSettings;
}

// ----------------------------------------------------------------------
// 2. الأقسام (Categories)
// ----------------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return localCategories;
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  if (!isSupabaseConfigured()) {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    localCategories.push(newCat);
    return newCat;
  }

  const { data, error } = await supabase.from('categories').insert(category).select().single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  if (!isSupabaseConfigured()) {
    localCategories = localCategories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    const found = localCategories.find((c) => c.id === id);
    if (!found) throw new Error('Category not found');
    return found;
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localCategories = localCategories.filter((c) => c.id !== id && c.parent_id !== id);
    return;
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------
// 3. المنتجات (Products)
// ----------------------------------------------------------------------
export interface ProductFilters {
  audience?: string;
  categoryId?: string;
  search?: string;
  includeHidden?: boolean;
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    let prods = [...localProducts];

    if (!filters?.includeHidden) {
      prods = prods.filter((p) => p.is_visible);
    }

    if (filters?.audience && filters.audience !== 'الكل') {
      prods = prods.filter((p) =>
        p.target_audience.includes(filters.audience as TargetAudienceType) ||
        p.target_audience.includes('عام')
      );
    }

    if (filters?.categoryId && filters.categoryId !== 'all') {
      // التحقق من المنتجات بالقسم أو أقسامه الفرعية
      const subCategoryIds = localCategories
        .filter((c) => c.parent_id === filters.categoryId)
        .map((c) => c.id);
      const allowedCatIds = [filters.categoryId, ...subCategoryIds];
      prods = prods.filter((p) => allowedCatIds.includes(p.category_id));
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // إلحاق الأقسام والعروض
    return prods.map((p) => {
      const cat = localCategories.find((c) => c.id === p.category_id);
      const now = new Date();
      const activeOffer = localOffers.find(
        (o) =>
          o.product_id === p.id &&
          o.is_active &&
          new Date(o.start_date) <= now &&
          new Date(o.end_date) >= now
      );
      return {
        ...p,
        category: cat,
        active_offer: activeOffer || null,
      };
    });
  }

  let query = supabase.from('products').select(`
    *,
    category:categories(*),
    active_offer:offers(*)
  `);

  if (!filters?.includeHidden) {
    query = query.eq('is_visible', true);
  }

  if (filters?.categoryId && filters.categoryId !== 'all') {
    // جلب الأقسام الفرعية التابعة إن وجدت
    const { data: subCats } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', filters.categoryId);

    const catIds = [filters.categoryId, ...(subCats?.map((c) => c.id) || [])];
    query = query.in('category_id', catIds);
  }

  if (filters?.audience && filters.audience !== 'الكل') {
    query = query.contains('target_audience', [filters.audience]);
  }

  if (filters?.search && filters.search.trim()) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  // تنقية العرض النشط الحالي فقط
  const now = new Date();
  return (data || []).map((p: any) => {
    let activeOffer: Offer | null = null;
    if (Array.isArray(p.active_offer)) {
      activeOffer =
        p.active_offer.find(
          (o: any) =>
            o.is_active && new Date(o.start_date) <= now && new Date(o.end_date) >= now
        ) || null;
    } else if (p.active_offer && p.active_offer.is_active) {
      const o = p.active_offer;
      if (new Date(o.start_date) <= now && new Date(o.end_date) >= now) {
        activeOffer = o;
      }
    }
    return {
      ...p,
      active_offer: activeOffer,
    };
  }) as Product[];
}

export async function createProduct(product: Omit<Product, 'id' | 'views_count' | 'created_at'>): Promise<Product> {
  if (!isSupabaseConfigured()) {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      views_count: 0,
      created_at: new Date().toISOString(),
    };
    localProducts.unshift(newProd);
    return newProd;
  }

  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  if (!isSupabaseConfigured()) {
    localProducts = localProducts.map((p) => (p.id === id ? { ...p, ...updates } : p));
    const found = localProducts.find((p) => p.id === id);
    if (!found) throw new Error('Product not found');
    return found;
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localProducts = localProducts.filter((p) => p.id !== id);
    localOffers = localOffers.filter((o) => o.product_id !== id);
    return;
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleProductVisibility(id: string, is_visible: boolean): Promise<void> {
  if (!isSupabaseConfigured()) {
    localProducts = localProducts.map((p) => (p.id === id ? { ...p, is_visible } : p));
    return;
  }

  const { error } = await supabase.from('products').update({ is_visible }).eq('id', id);
  if (error) throw error;
}

export async function incrementProductViews(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localProducts = localProducts.map((p) => (p.id === id ? { ...p, views_count: p.views_count + 1 } : p));
    return;
  }

  try {
    await supabase.rpc('increment_product_views', { row_id: id });
  } catch (err) {
    console.warn('خطأ أثناء زيادة المشاهدات:', err);
  }
}

// ----------------------------------------------------------------------
// 4. العروض (Offers)
// ----------------------------------------------------------------------
export async function getOffers(): Promise<Offer[]> {
  if (!isSupabaseConfigured()) {
    return localOffers.map((o) => ({
      ...o,
      product: localProducts.find((p) => p.id === o.product_id),
    }));
  }

  const { data, error } = await supabase
    .from('offers')
    .select(`*, product:products(*)`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Offer[];
}

export async function createOffer(offer: Omit<Offer, 'id' | 'clicks_count' | 'created_at'>): Promise<Offer> {
  if (!isSupabaseConfigured()) {
    const newOffer: Offer = {
      ...offer,
      id: `offer-${Date.now()}`,
      clicks_count: 0,
      created_at: new Date().toISOString(),
    };
    localOffers.push(newOffer);
    return newOffer;
  }

  const { data, error } = await supabase.from('offers').insert(offer).select().single();
  if (error) throw error;
  return data as Offer;
}

export async function updateOffer(id: string, updates: Partial<Offer>): Promise<Offer> {
  if (!isSupabaseConfigured()) {
    localOffers = localOffers.map((o) => (o.id === id ? { ...o, ...updates } : o));
    const found = localOffers.find((o) => o.id === id);
    if (!found) throw new Error('Offer not found');
    return found;
  }

  const { data, error } = await supabase.from('offers').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Offer;
}

export async function deleteOffer(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localOffers = localOffers.filter((o) => o.id !== id);
    return;
  }

  const { error } = await supabase.from('offers').delete().eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------
// 5. عروض الباقات (Bundles)
// ----------------------------------------------------------------------
export async function getBundles(activeOnly = true): Promise<Bundle[]> {
  if (!isSupabaseConfigured()) {
    const now = new Date();
    if (activeOnly) {
      return localBundles.filter(
        (b) => b.is_active && new Date(b.start_date) <= now && new Date(b.end_date) >= now
      );
    }
    return localBundles;
  }

  let query = supabase.from('bundles').select(`
    *,
    items:bundle_items(
      *,
      product:products(*)
    )
  `);

  if (activeOnly) {
    const now = new Date().toISOString();
    query = query
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data as Bundle[];
}

export async function createBundle(
  bundleData: Omit<Bundle, 'id' | 'clicks_count' | 'created_at' | 'items'>,
  items: { product_id: string; quantity: number }[]
): Promise<Bundle> {
  if (!isSupabaseConfigured()) {
    const bundleId = `bundle-${Date.now()}`;
    const newBundle: Bundle = {
      ...bundleData,
      id: bundleId,
      clicks_count: 0,
      created_at: new Date().toISOString(),
      items: items.map((it) => ({
        ...it,
        id: `bi-${Date.now()}-${Math.random()}`,
        bundle_id: bundleId,
        product: localProducts.find((p) => p.id === it.product_id),
      })),
    };
    localBundles.push(newBundle);
    return newBundle;
  }

  const { data: newBundle, error: bError } = await supabase
    .from('bundles')
    .insert(bundleData)
    .select()
    .single();

  if (bError) throw bError;

  if (items.length > 0) {
    const bundleItemsToInsert = items.map((it) => ({
      bundle_id: newBundle.id,
      product_id: it.product_id,
      quantity: it.quantity,
    }));

    const { error: itemsError } = await supabase.from('bundle_items').insert(bundleItemsToInsert);
    if (itemsError) throw itemsError;
  }

  return newBundle as Bundle;
}

export async function updateBundle(
  id: string,
  bundleData: Partial<Bundle>,
  items?: { product_id: string; quantity: number }[]
): Promise<Bundle> {
  if (!isSupabaseConfigured()) {
    localBundles = localBundles.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          ...bundleData,
          items: items
            ? items.map((it) => ({
                ...it,
                product: localProducts.find((p) => p.id === it.product_id),
              }))
            : b.items,
        };
      }
      return b;
    });
    const found = localBundles.find((b) => b.id === id);
    if (!found) throw new Error('Bundle not found');
    return found;
  }

  const { data: updated, error } = await supabase
    .from('bundles')
    .update(bundleData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (items) {
    await supabase.from('bundle_items').delete().eq('bundle_id', id);
    if (items.length > 0) {
      const itemsToInsert = items.map((it) => ({
        bundle_id: id,
        product_id: it.product_id,
        quantity: it.quantity,
      }));
      await supabase.from('bundle_items').insert(itemsToInsert);
    }
  }

  return updated as Bundle;
}

export async function deleteBundle(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localBundles = localBundles.filter((b) => b.id !== id);
    return;
  }

  const { error } = await supabase.from('bundles').delete().eq('id', id);
  if (error) throw error;
}

export async function incrementOfferClicks(id: string, isBundle: boolean): Promise<void> {
  if (!isSupabaseConfigured()) {
    if (isBundle) {
      localBundles = localBundles.map((b) => (b.id === id ? { ...b, clicks_count: b.clicks_count + 1 } : b));
    } else {
      localOffers = localOffers.map((o) => (o.id === id ? { ...o, clicks_count: o.clicks_count + 1 } : o));
    }
    return;
  }

  try {
    await supabase.rpc('increment_offer_clicks', { row_id: id, is_bundle: isBundle });
  } catch (err) {
    console.warn('خطأ زيادة نقرات العرض:', err);
  }
}

// ----------------------------------------------------------------------
// 6. رفع الصور المضغوطة (Storage)
// ----------------------------------------------------------------------
export async function uploadProductImage(file: File): Promise<string> {
  // ضغط الصورة وتحويلها إلى WebP أولاً
  const compressedFile = await compressProductImage(file);

  if (!isSupabaseConfigured()) {
    // وضع المعاينة المحلية: إنشاء رابط مؤقت
    return URL.createObjectURL(compressedFile);
  }

  const fileExt = 'webp';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, compressedFile, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
  return data.publicUrl;
}
