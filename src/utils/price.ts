export function formatVndCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const m = (amount / 1_000_000).toFixed(1).replace('.0', '');
    return `${m}tr đ`;
  }
  if (amount >= 1_000) {
    const k = Math.round(amount / 1_000);
    return `${k}k đ`;
  }
  return `${amount}đ`;
}

export function formatVndFull(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

export function formatRestaurantPrice(
  minPrice?: number | null,
  maxPrice?: number | null,
  fallbackPriceRange?: string | null
): string {
  if (minPrice && maxPrice) {
    if (minPrice === maxPrice) {
      return formatVndCurrency(minPrice);
    }
    return `${formatVndCurrency(minPrice)} - ${formatVndCurrency(maxPrice)}`;
  }

  if (minPrice && !maxPrice) {
    return `Từ ${formatVndCurrency(minPrice)}`;
  }

  if (!minPrice && maxPrice) {
    return `Tới ${formatVndCurrency(maxPrice)}`;
  }

  // Fallback if only price_range is present
  if (fallbackPriceRange === '$') return '25k - 60k đ';
  if (fallbackPriceRange === '$$') return '60k - 150k đ';
  if (fallbackPriceRange === '$$$') return '150k - 450k đ';
  if (fallbackPriceRange === '$$$$') return '450k - 1.5tr đ';

  return '30k - 100k đ';
}
