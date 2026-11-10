import { CartItem, StoreSettings } from '@/types/database';

export interface CustomerOrderInfo {
  customerName: string;
  phone?: string;
  city?: string;
  address?: string;
  notes?: string;
}

/**
 * دالة توليد رسالة واتساب منسقة واحترافية للطلب المباشر
 */
export function generateWhatsAppOrderUrl(
  items: CartItem[],
  settings: StoreSettings,
  customerInfo?: CustomerOrderInfo
): string {
  if (items.length === 0) return '';

  const currency = settings.currency || 'ر.ي';
  const cleanPhone = settings.whatsapp_number.replace(/[^0-9]/g, '');

  let totalPrice = 0;
  let totalOriginalPrice = 0;

  // رأس الرسالة
  let message = `*طلب جديد من المتجر (${settings.store_name})* ✨\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // بيانات العميل إن وجدت
  if (customerInfo && (customerInfo.customerName || customerInfo.city || customerInfo.address)) {
    message += `👤 *بيانات العميل:* \n`;
    if (customerInfo.customerName) message += `• الاسم: ${customerInfo.customerName}\n`;
    if (customerInfo.phone) message += `• الهاتف: ${customerInfo.phone}\n`;
    if (customerInfo.city) message += `• المدينة: ${customerInfo.city}\n`;
    if (customerInfo.address) message += `• العنوان: ${customerInfo.address}\n`;
    if (customerInfo.notes) message += `• ملاحظات: ${customerInfo.notes}\n`;
    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  }

  message += `🛍️ *قائمة المشتريات:* \n\n`;

  items.forEach((item, index) => {
    const itemSubtotal = item.unitPrice * item.quantity;
    const itemOriginalSubtotal = item.originalPrice * item.quantity;
    totalPrice += itemSubtotal;
    totalOriginalPrice += itemOriginalSubtotal;

    const num = index + 1;

    if (item.type === 'bundle' && item.bundle) {
      message += `${num}. *باقة:* ${item.bundle.title}\n`;
      message += `   • الكمية: ${item.quantity}\n`;
      message += `   • سعر الباقة: ${item.unitPrice.toLocaleString('ar-EG')} ${currency}\n`;
      if (item.originalPrice > item.unitPrice) {
        message += `   • السعر الأصلي: ~${item.originalPrice.toLocaleString('ar-EG')} ${currency}~\n`;
      }
      message += `   • الإجمالي: ${itemSubtotal.toLocaleString('ar-EG')} ${currency}\n\n`;
    } else if (item.product) {
      message += `${num}. *المنتج:* ${item.product.name}\n`;
      if (item.product.category?.name) {
        message += `   • القسم: ${item.product.category.name}\n`;
      }
      
      // تفاصيل الخيارات المحددة (Variants)
      if (item.selectedVariants && Object.keys(item.selectedVariants).length > 0) {
        const variantsStr = Object.entries(item.selectedVariants)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ');
        message += `   • الخيارات: [ ${variantsStr} ]\n`;
      }

      message += `   • الكمية: ${item.quantity}\n`;
      message += `   • سعر الحبة: ${item.unitPrice.toLocaleString('ar-EG')} ${currency}\n`;
      if (item.originalPrice > item.unitPrice) {
        message += `   • السعر السابق: ~${item.originalPrice.toLocaleString('ar-EG')} ${currency}~\n`;
      }
      message += `   • الإجمالي: ${itemSubtotal.toLocaleString('ar-EG')} ${currency}\n\n`;
    }
  });

  const totalDiscount = Math.max(0, totalOriginalPrice - totalPrice);

  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (totalDiscount > 0) {
    message += `💰 *المجموع قبل الخصم:* ~${totalOriginalPrice.toLocaleString('ar-EG')} ${currency}~\n`;
    message += `🎉 *إجمالي التوفير في العروض:* ${totalDiscount.toLocaleString('ar-EG')} ${currency}\n`;
  }
  message += `💵 *المبلغ الإجمالي المطلوب:* *${totalPrice.toLocaleString('ar-EG')} ${currency}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `أرجو تأكيد الطلب وتزويدي بتفاصيل التوصيل. شكراً لكم! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
