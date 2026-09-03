import { Config } from '@/constants/Config';
import { Restaurant } from '@/types/restaurant';

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'hn-1',
    name: 'Phở Thìn Lò Đúc',
    address: '13 Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội',
    latitude: 21.018318,
    longitude: 105.856621,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    review_count: 1420,
    time_estimate: '15-20 phút',
    badge: 'Michelin Selected',
    specialty_dish: 'Phở Bò Tái Lăn ngập hành lá',
    opening_hours: {
      monday: { open: '06:00', close: '20:30' },
      tuesday: { open: '06:00', close: '20:30' },
      wednesday: { open: '06:00', close: '20:30' },
      thursday: { open: '06:00', close: '20:30' },
      friday: { open: '06:00', close: '20:30' },
      saturday: { open: '06:00', close: '20:30' },
      sunday: { open: '06:00', close: '20:30' },
    },
    facilities: ['AC', 'Parking'],
    categories: [
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-2',
    name: 'Bún Chả Hương Liên',
    address: '24 Lê Văn Hưu, Phan Chu Trinh, Hai Bà Trưng, Hà Nội',
    latitude: 21.01889,
    longitude: 105.85412,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    review_count: 2350,
    time_estimate: '15-25 phút',
    badge: 'Bún Chả Obama',
    specialty_dish: 'Bún Chả Nem Hải Sản giòn rụm',
    opening_hours: {
      monday: { open: '08:00', close: '20:30' },
      tuesday: { open: '08:00', close: '20:30' },
      wednesday: { open: '08:00', close: '20:30' },
      thursday: { open: '08:00', close: '20:30' },
      friday: { open: '08:00', close: '20:30' },
      saturday: { open: '08:00', close: '20:30' },
      sunday: { open: '08:00', close: '20:30' },
    },
    facilities: ['AC', 'Wifi', 'Parking'],
    categories: [
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-3',
    name: 'Cafe Giảng',
    address: '39 Nguyễn Hữu Huân, Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    latitude: 21.0331,
    longitude: 105.8539,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    review_count: 3100,
    time_estimate: '10-15 phút',
    badge: 'Khai sinh Cà Phê Trứng',
    specialty_dish: 'Cà Phê Trứng nóng thơm béo',
    opening_hours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '07:00', close: '22:00' },
      sunday: { open: '07:00', close: '22:00' },
    },
    facilities: ['Wifi'],
    categories: [
      { id: 'cat-2', name: 'Cà Phê', slug: 'coffee', icon: '☕' },
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-4',
    name: 'Bánh Mì 25',
    address: '25 Hàng Cá, Hàng Đào, Hoàn Kiếm, Hà Nội',
    latitude: 21.03608,
    longitude: 105.84962,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    review_count: 2890,
    time_estimate: '10-15 phút',
    badge: 'Top Phố Cổ',
    specialty_dish: 'Bánh Mì Kẹp Thịt Nướng & Pate',
    opening_hours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '21:00' },
      saturday: { open: '07:00', close: '21:00' },
      sunday: { open: '07:00', close: '21:00' },
    },
    facilities: ['Wifi', 'Credit Card'],
    categories: [
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-5',
    name: "Pizza 4P's Tràng Tiền",
    address: '43 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    latitude: 21.0258,
    longitude: 105.8554,
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    review_count: 4200,
    time_estimate: '20-30 phút',
    badge: 'Nổi bật nhất',
    specialty_dish: 'Pizza Phô Mai Burrata Tươi',
    opening_hours: {
      monday: { open: '11:00', close: '22:30' },
      tuesday: { open: '11:00', close: '22:30' },
      wednesday: { open: '11:00', close: '22:30' },
      thursday: { open: '11:00', close: '22:30' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '11:00', close: '23:00' },
      sunday: { open: '11:00', close: '22:30' },
    },
    facilities: ['AC', 'Wifi', 'Credit Card', 'Parking'],
    categories: [
      { id: 'cat-4', name: 'Đồ Tây', slug: 'western', icon: '🍕' },
    ],
  },
  {
    id: 'hn-6',
    name: 'Chả Cá Lã Vọng',
    address: '14 Chả Cá, Hàng Đào, Hoàn Kiếm, Hà Nội',
    latitude: 21.03651,
    longitude: 105.84883,
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    review_count: 1800,
    time_estimate: '20-25 phút',
    badge: 'Hơn 100 năm truyền thống',
    specialty_dish: 'Chả Cá Lăng xào thì là nóng hổi',
    opening_hours: {
      monday: { open: '11:00', close: '21:00' },
      tuesday: { open: '11:00', close: '21:00' },
      wednesday: { open: '11:00', close: '21:00' },
      thursday: { open: '11:00', close: '21:00' },
      friday: { open: '11:00', close: '21:00' },
      saturday: { open: '11:00', close: '21:00' },
      sunday: { open: '11:00', close: '21:00' },
    },
    facilities: ['AC', 'Private Room'],
    categories: [
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-7',
    name: 'Sushi Bar Hà Nội',
    address: '107 Kim Mã, Ba Đình, Hà Nội',
    latitude: 21.0315,
    longitude: 105.8164,
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    review_count: 950,
    time_estimate: '25-35 phút',
    badge: 'Chuẩn vị Nhật Bản',
    specialty_dish: 'Sashimi Cá Hồi & Cơm Cuộn Rồng',
    opening_hours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '22:00' },
      saturday: { open: '11:00', close: '22:00' },
      sunday: { open: '11:00', close: '22:00' },
    },
    facilities: ['AC', 'Wifi', 'Credit Card', 'Private Room'],
    categories: [
      { id: 'cat-3', name: 'Đồ Nhật', slug: 'japanese', icon: '🍣' },
    ],
  },
  {
    id: 'hn-8',
    name: 'Kem Tràng Tiền',
    address: '35 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    latitude: 21.0245,
    longitude: 105.8542,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    review_count: 5200,
    time_estimate: '5-10 phút',
    badge: 'Biểu tượng Hà Nội',
    specialty_dish: 'Kem Ốc Quế Cốm & Đậu Xanh',
    opening_hours: {
      monday: { open: '08:00', close: '23:00' },
      tuesday: { open: '08:00', close: '23:00' },
      wednesday: { open: '08:00', close: '23:00' },
      thursday: { open: '08:00', close: '23:00' },
      friday: { open: '08:00', close: '23:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '08:00', close: '23:00' },
    },
    facilities: ['Parking'],
    categories: [
      { id: 'cat-5', name: 'Tráng Miệng', slug: 'dessert', icon: '🍨' },
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-9',
    name: 'The Note Coffee',
    address: '64 Lương Văn Can, Hàng Trống, Hoàn Kiếm, Hà Nội',
    latitude: 21.03165,
    longitude: 105.85194,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    review_count: 2100,
    time_estimate: '10-15 phút',
    badge: 'View Hồ Gươm',
    specialty_dish: 'Cà Phê Dừa & Bánh Ngọt',
    opening_hours: {
      monday: { open: '08:00', close: '22:30' },
      tuesday: { open: '08:00', close: '22:30' },
      wednesday: { open: '08:00', close: '22:30' },
      thursday: { open: '08:00', close: '22:30' },
      friday: { open: '08:00', close: '22:30' },
      saturday: { open: '08:00', close: '22:30' },
      sunday: { open: '08:00', close: '22:30' },
    },
    facilities: ['AC', 'Wifi', 'Credit Card'],
    categories: [
      { id: 'cat-2', name: 'Cà Phê', slug: 'coffee', icon: '☕' },
      { id: 'cat-5', name: 'Tráng Miệng', slug: 'dessert', icon: '🍨' },
    ],
  },
  {
    id: 'hn-10',
    name: 'Quán Ăn Ngon Phan Bội Châu',
    address: '18 Phan Bội Châu, Cửa Nam, Hoàn Kiếm, Hà Nội',
    latitude: 21.02511,
    longitude: 105.84532,
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    review_count: 3400,
    time_estimate: '20-30 phút',
    badge: 'Ẩm thực 3 miền',
    specialty_dish: 'Bánh Xèo Giòn Rụm & Gỏi Cuốn',
    opening_hours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '07:00', close: '22:00' },
      sunday: { open: '07:00', close: '22:00' },
    },
    facilities: ['AC', 'Wifi', 'Parking', 'Credit Card'],
    categories: [
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-11',
    name: 'Phở Gia Truyền Bát Đàn',
    address: '49 Bát Đàn, Cửa Đông, Hoàn Kiếm, Hà Nội',
    latitude: 21.0346,
    longitude: 105.8475,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    review_count: 2450,
    time_estimate: '15-20 phút',
    badge: 'Hà Nội Xưa',
    specialty_dish: 'Phở Bò Tái Nạm nước dùng trong vắt',
    opening_hours: {
      monday: { open: '06:00', close: '20:30' },
      tuesday: { open: '06:00', close: '20:30' },
      wednesday: { open: '06:00', close: '20:30' },
      thursday: { open: '06:00', close: '20:30' },
      friday: { open: '06:00', close: '20:30' },
      saturday: { open: '06:00', close: '20:30' },
      sunday: { open: '06:00', close: '20:30' },
    },
    facilities: ['Parking'],
    categories: [
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-12',
    name: 'Cafe Đinh',
    address: '13 Đinh Tiên Hoàng, Hàng Bạc, Hoàn Kiếm, Hà Nội',
    latitude: 21.0312,
    longitude: 105.8533,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    review_count: 1870,
    time_estimate: '10-15 phút',
    badge: 'Ban Công Phố Cổ',
    specialty_dish: 'Cà phê trứng & Cacao trứng',
    opening_hours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '07:00', close: '22:00' },
      sunday: { open: '07:00', close: '22:00' },
    },
    facilities: ['Wifi'],
    categories: [
      { id: 'cat-2', name: 'Cà Phê', slug: 'coffee', icon: '☕' },
    ],
  },
  {
    id: 'hn-13',
    name: 'Bún Đậu Cây Đa Thụy Khuê',
    address: '235B Thụy Khuê, Thụy Khuê, Tây Hồ, Hà Nội',
    latitude: 21.0435,
    longitude: 105.8202,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    review_count: 1560,
    time_estimate: '15-20 phút',
    badge: 'Mẹt Bún Đậu Đầy Đặn',
    specialty_dish: 'Bún đậu chả cốm & dồi sụn rán',
    opening_hours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '21:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '09:00', close: '21:00' },
    },
    facilities: ['AC', 'Parking'],
    categories: [
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-14',
    name: 'Nét Huế Hàng Bông',
    address: '198 Hàng Bông, Hoàn Kiếm, Hà Nội',
    latitude: 21.0298,
    longitude: 105.8436,
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    review_count: 1320,
    time_estimate: '20-25 phút',
    badge: 'Cố Đô Thu Nhỏ',
    specialty_dish: 'Bún Bò Huế & Bánh Bột Lọc',
    opening_hours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '22:00' },
    },
    facilities: ['AC', 'Wifi', 'Credit Card'],
    categories: [
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-15',
    name: 'Dim Sum Corner Hào Nam',
    address: '182 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội',
    latitude: 21.0243,
    longitude: 105.8247,
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    review_count: 1670,
    time_estimate: '20-30 phút',
    badge: 'Dimsum Hồng Kông',
    specialty_dish: 'Há Cảo Tôm Tươi & Bánh Bao Kim Sa',
    opening_hours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    facilities: ['AC', 'Wifi', 'Credit Card', 'Parking'],
    categories: [
      { id: 'cat-4', name: 'Đồ Tây', slug: 'western', icon: '🍕' },
    ],
  },
  {
    id: 'hn-16',
    name: 'Tokyo Deli Sushi Hoàng Đạo Thúy',
    address: 'N04 Hoàng Đạo Thúy, Trung Hòa, Cầu Giấy, Hà Nội',
    latitude: 21.0092,
    longitude: 105.8015,
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    review_count: 1100,
    time_estimate: '25-35 phút',
    badge: 'Set Sushi Cao Cấp',
    specialty_dish: 'Sushi Tổng Hợp & Lẩu Miso Hải Sản',
    opening_hours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '22:00' },
      saturday: { open: '11:00', close: '22:00' },
      sunday: { open: '11:00', close: '22:00' },
    },
    facilities: ['AC', 'Wifi', 'Credit Card', 'Private Room'],
    categories: [
      { id: 'cat-3', name: 'Đồ Nhật', slug: 'japanese', icon: '🍣' },
    ],
  },
  {
    id: 'hn-17',
    name: 'Cư Xá Cà Phê Tôn Thất Tùng',
    address: 'Tầng 2, A11 Tôn Thất Tùng, Đống Đa, Hà Nội',
    latitude: 21.0068,
    longitude: 105.8315,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    review_count: 1950,
    time_estimate: '10-15 phút',
    badge: 'Ký ức bao cấp',
    specialty_dish: 'Cà phê bạc xỉu & Mì tôm chanh bò khô',
    opening_hours: {
      monday: { open: '08:00', close: '22:30' },
      tuesday: { open: '08:00', close: '22:30' },
      wednesday: { open: '08:00', close: '22:30' },
      thursday: { open: '08:00', close: '22:30' },
      friday: { open: '08:00', close: '22:30' },
      saturday: { open: '08:00', close: '22:30' },
      sunday: { open: '08:00', close: '22:30' },
    },
    facilities: ['Wifi'],
    categories: [
      { id: 'cat-2', name: 'Cà Phê', slug: 'coffee', icon: '☕' },
      { id: 'cat-5', name: 'Tráng Miệng', slug: 'dessert', icon: '🍨' },
    ],
  },
  {
    id: 'hn-18',
    name: 'Bò Tơ Quán Mộc Thái Thịnh',
    address: '102 Thái Thịnh, Đống Đa, Hà Nội',
    latitude: 21.0118,
    longitude: 105.8182,
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    review_count: 2200,
    time_estimate: '20-30 phút',
    badge: 'Bò Tơ Tươi Ngon',
    specialty_dish: 'Bò tơ cuốn bánh tráng & Lẩu riêu cua',
    opening_hours: {
      monday: { open: '10:00', close: '22:30' },
      tuesday: { open: '10:00', close: '22:30' },
      wednesday: { open: '10:00', close: '22:30' },
      thursday: { open: '10:00', close: '22:30' },
      friday: { open: '10:00', close: '22:30' },
      saturday: { open: '10:00', close: '22:30' },
      sunday: { open: '10:00', close: '22:30' },
    },
    facilities: ['AC', 'Wifi', 'Parking', 'Private Room'],
    categories: [
      { id: 'cat-1', name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
    ],
  },
  {
    id: 'hn-19',
    name: 'Chè Bốn Mùa Hàng Cân',
    address: '4 Hàng Cân, Hàng Đào, Hoàn Kiếm, Hà Nội',
    latitude: 21.0342,
    longitude: 105.8499,
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    review_count: 3600,
    time_estimate: '5-10 phút',
    badge: 'Chè Cổ Truyền',
    specialty_dish: 'Chè Sen Long Nhãn & Chè Khúc Bạch',
    opening_hours: {
      monday: { open: '09:00', close: '23:00' },
      tuesday: { open: '09:00', close: '23:00' },
      wednesday: { open: '09:00', close: '23:00' },
      thursday: { open: '09:00', close: '23:00' },
      friday: { open: '09:00', close: '23:00' },
      saturday: { open: '09:00', close: '23:00' },
      sunday: { open: '09:00', close: '23:00' },
    },
    facilities: ['Wifi'],
    categories: [
      { id: 'cat-5', name: 'Tráng Miệng', slug: 'dessert', icon: '🍨' },
    ],
  },
  {
    id: 'hn-20',
    name: 'El Gaucho Steakhouse Tràng Tiền',
    address: '11 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    latitude: 21.0253,
    longitude: 105.8569,
    price_range: '$$$$',
    image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    review_count: 1400,
    time_estimate: '30-45 phút',
    badge: 'Steakhouse Thượng Hạng',
    specialty_dish: 'Bò Wagyu Ribeye nướng than hoa',
    opening_hours: {
      monday: { open: '11:00', close: '23:00' },
      tuesday: { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '11:00', close: '23:00' },
      sunday: { open: '11:00', close: '23:00' },
    },
    facilities: ['AC', 'Wifi', 'Credit Card', 'Parking', 'Private Room'],
    categories: [
      { id: 'cat-4', name: 'Đồ Tây', slug: 'western', icon: '🍕' },
    ],
  },
];

export interface SearchLocationParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // In km (e.g., 1, 3, 5, 10) or meters
  price_range?: string; // '$', '$$', '$$$', '$$$$'
  open_now?: boolean;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function isRestaurantOpenNow(restaurant: Restaurant, date: Date = new Date()): boolean {
  if (restaurant.is_open_now !== undefined) {
    return restaurant.is_open_now;
  }
  if (!restaurant.opening_hours) {
    return true;
  }
  const dayKey = DAY_KEYS[date.getDay()];
  const todayHours = restaurant.opening_hours[dayKey as keyof typeof restaurant.opening_hours];
  if (!todayHours || !todayHours.open || !todayHours.close) {
    return true;
  }
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  const openMinutes = (openH || 0) * 60 + (openM || 0);
  let closeMinutes = (closeH || 0) * 60 + (closeM || 0);
  if (closeMinutes < openMinutes) {
    closeMinutes += 24 * 60;
    if (currentMinutes < openMinutes) {
      return currentMinutes + 24 * 60 <= closeMinutes;
    }
  }
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

export async function searchRestaurants(
  query: string = '',
  location?: SearchLocationParams
): Promise<Restaurant[]> {
  const trimmedQuery = query.trim();

  // If mock data is explicitly enabled in config
  if (Config.MOCK_DATA) {
    // Simulate brief network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 150));

    let results = MOCK_RESTAURANTS;
    if (trimmedQuery) {
      const lower = trimmedQuery.toLowerCase();
      results = MOCK_RESTAURANTS.filter((restaurant) => {
        const matchName = restaurant.name.toLowerCase().includes(lower);
        const matchAddress = restaurant.address?.toLowerCase().includes(lower);
        const matchSpecialty = restaurant.specialty_dish?.toLowerCase().includes(lower);
        const matchCategory = restaurant.categories?.some(
          (cat) =>
            cat.name.toLowerCase().includes(lower) ||
            cat.slug.toLowerCase().includes(lower)
        );
        return matchName || matchAddress || matchSpecialty || matchCategory;
      });
    }

    // Filter by price range
    if (location?.price_range) {
      results = results.filter((r) => r.price_range === location.price_range);
    }

    // Filter by open now
    if (location?.open_now) {
      results = results.filter((r) => isRestaurantOpenNow(r));
    }

    if (location?.latitude && location?.longitude) {
      const userLat = location.latitude;
      const userLng = location.longitude;
      const radiusKm = location.radius ? (location.radius > 50 ? location.radius / 1000 : location.radius) : undefined;

      // Filter by radius if provided
      if (radiusKm) {
        results = results.filter((r) => {
          const lat = typeof r.latitude === 'string' ? parseFloat(r.latitude) : r.latitude;
          const lng = typeof r.longitude === 'string' ? parseFloat(r.longitude) : r.longitude;
          if (!lat || !lng) return false;
          const dist = calculateDistanceKm(userLat, userLng, lat, lng);
          return dist <= radiusKm;
        });
      }

      // Sort by distance
      return [...results].sort((a, b) => {
        const latA = typeof a.latitude === 'string' ? parseFloat(a.latitude) : a.latitude;
        const lngA = typeof a.longitude === 'string' ? parseFloat(a.longitude) : a.longitude;
        const latB = typeof b.latitude === 'string' ? parseFloat(b.latitude) : b.latitude;
        const lngB = typeof b.longitude === 'string' ? parseFloat(b.longitude) : b.longitude;
        const distA = calculateDistanceKm(userLat, userLng, latA, lngA);
        const distB = calculateDistanceKm(userLat, userLng, latB, lngB);
        return distA - distB;
      });
    }

    return results;
  }

  // Real NestJS API call
  try {
    const baseUrl = Config.API_URL.replace(/\/+$/, '');
    const endpoint = baseUrl.endsWith('/api')
      ? `${baseUrl}/restaurants/search`
      : `${baseUrl}/api/restaurants/search`;

    const searchParams = new URLSearchParams();
    if (trimmedQuery) searchParams.append('query', trimmedQuery);
    if (location?.latitude) searchParams.append('latitude', location.latitude.toString());
    if (location?.longitude) searchParams.append('longitude', location.longitude.toString());
    if (location?.radius) {
      const radiusMeters = location.radius > 50 ? location.radius : location.radius * 1000;
      searchParams.append('radius', radiusMeters.toString());
    }
    if (location?.price_range) {
      searchParams.append('price_range', location.price_range);
    }
    if (location?.open_now) {
      searchParams.append('open_now', 'true');
    }

    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(Config.API_KEY ? { 'x-api-key': Config.API_KEY } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const data: Restaurant[] = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch from NestJS API, falling back to mock data:', error);
    // Fallback search over mock data if API is unreachable
    let results = MOCK_RESTAURANTS;
    if (trimmedQuery) {
      const lower = trimmedQuery.toLowerCase();
      results = MOCK_RESTAURANTS.filter((restaurant) => {
        const matchName = restaurant.name.toLowerCase().includes(lower);
        const matchAddress = restaurant.address?.toLowerCase().includes(lower);
        const matchSpecialty = restaurant.specialty_dish?.toLowerCase().includes(lower);
        const matchCategory = restaurant.categories?.some(
          (cat) =>
            cat.name.toLowerCase().includes(lower) ||
            cat.slug.toLowerCase().includes(lower)
        );
        return matchName || matchAddress || matchSpecialty || matchCategory;
      });
    }

    if (location?.price_range) {
      results = results.filter((r) => r.price_range === location.price_range);
    }

    if (location?.open_now) {
      results = results.filter((r) => isRestaurantOpenNow(r));
    }

    if (location?.latitude && location?.longitude && location?.radius) {
      const userLat = location.latitude;
      const userLng = location.longitude;
      const radiusKm = location.radius > 50 ? location.radius / 1000 : location.radius;
      results = results.filter((r) => {
        const lat = typeof r.latitude === 'string' ? parseFloat(r.latitude) : r.latitude;
        const lng = typeof r.longitude === 'string' ? parseFloat(r.longitude) : r.longitude;
        if (!lat || !lng) return false;
        return calculateDistanceKm(userLat, userLng, lat, lng) <= radiusKm;
      });
    }

    return results;
  }
}
