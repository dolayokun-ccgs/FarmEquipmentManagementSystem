# Design Reference Guide

## Inspiration: Herts Tools (https://hertstools.co.uk/)

### Key Design Elements to Adapt for Nigerian Market

## 1. Homepage Design

### From Herts Tools (Adapt):
- **Clean, grid-based equipment catalog**
- **Clear product categories**
- **High-quality product images**
- **Simple search and filter options**
- **Prominent call-to-action buttons**

### For Nigerian Market (Customize):
- **Vibrant color scheme** - Use greens (agriculture), oranges, and warm colors
- **Data-efficient images** - Optimize for 3G/4G networks
- **Local language options** - English with Yoruba, Hausa, Igbo support (future)
- **NGN currency** prominently displayed
- **Mobile-first design** - Larger touch targets, simplified navigation
- **WhatsApp integration** - Add "Contact via WhatsApp" buttons
- **Trust indicators** - Display verified badges, local testimonials

## 2. Equipment Categories (Nigeria-Specific)

### Popular Equipment Types:
1. **Tractors & Plows**
   - Small tractors (common in Nigeria)
   - Hand tractors
   - Disc plows
   - Harrows

2. **Planting Equipment**
   - Seeders
   - Planters
   - Transplanters

3. **Irrigation Equipment**
   - Water pumps
   - Irrigation systems
   - Sprinklers

4. **Harvesting Equipment**
   - Combine harvesters
   - Threshers
   - Maize shellers
   - Rice mills

5. **Processing Equipment**
   - Grinders
   - Palm oil processors
   - Cassava processors

## 3. Color Palette

### Primary Colors (Nigeria-Themed):
- **Primary Green**: `#2D7A3E` (Agriculture, growth)
- **Accent Orange**: `#F47920` (Energy, warmth - from Nigerian flag)
- **White**: `#FFFFFF` (Clean, modern)
- **Dark Gray**: `#2C2C2C` (Text)

### Secondary Colors:
- **Light Green**: `#7FBF7F` (Hover states, backgrounds)
- **Light Orange**: `#FFB366` (Highlights)
- **Gray**: `#F5F5F5` (Backgrounds)
- **Success Green**: `#4CAF50`
- **Error Red**: `#F44336`

## 4. Typography

### Font Choices:
- **Headings**: Inter, Poppins (modern, readable)
- **Body**: System fonts for fast loading (Arial, -apple-system, BlinkMacSystemFont)
- **Minimum sizes for mobile**: 16px (body), 24px (headings)

## 5. Layout Structure

### Homepage:
```
┌─────────────────────────────────────┐
│ Header (Logo, Search, Login)        │
├─────────────────────────────────────┤
│ Hero Section                         │
│ - Search bar                         │
│ - "Find equipment near you"          │
│ - Popular categories                 │
├─────────────────────────────────────┤
│ Featured Equipment (Grid)            │
│ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │Image │ │Image │ │Image │          │
│ │Name  │ │Name  │ │Name  │          │
│ │₦5000 │ │₦3000 │ │₦8000 │          │
│ └──────┘ └──────┘ └──────┘          │
├─────────────────────────────────────┤
│ How It Works (3 Steps)               │
│ 1. Browse  2. Book  3. Use          │
├─────────────────────────────────────┤
│ Categories Section                   │
├─────────────────────────────────────┤
│ Testimonials (Local farmers)         │
├─────────────────────────────────────┤
│ Footer (Contact, Social, Links)      │
└─────────────────────────────────────┘
```

## 6. Mobile Optimization

### Key Features:
- **Bottom navigation** (easier thumb access)
- **Hamburger menu** for secondary items
- **Sticky search bar** on equipment pages
- **Floating WhatsApp button** (bottom right)
- **Pull-to-refresh** functionality
- **Infinite scroll** for equipment lists
- **Touch-friendly cards** (minimum 48x48px)

## 7. Equipment Card Design

```
┌─────────────────────────┐
│   [Equipment Image]      │
│   [Badge: Available]     │
├─────────────────────────┤
│ Tractor - John Deere     │
│ ⭐ 4.5 (23 reviews)      │
│ 📍 Lagos, Nigeria        │
│ ₦5,000/day              │
│ [Book Now Button]        │
└─────────────────────────┘
```

## 8. Nigeria-Specific Features

### Must-Have:
1. **Location-based search** (State-by-state)
   - Lagos, Kano, Rivers, Ogun, etc.
2. **Phone number verification** (SMS OTP)
3. **WhatsApp integration** for quick communication
4. **Offline mode** for browsing cached equipment
5. **Low-data mode** toggle
6. **Naira (₦) currency** throughout
7. **Local payment methods**:
   - Bank transfer
   - USSD
   - Paystack (card payments)
   - Pay on delivery option

### Trust & Safety:
- **Equipment owner verification** badges
- **Insurance information** displayed
- **Equipment condition** ratings
- **Local pickup/delivery** options
- **Emergency contact** numbers

## 9. UI Components Priority

### Phase 1 (Essential):
1. Equipment grid/list view
2. Search and filter
3. Equipment detail page
4. Booking form
5. User registration/login
6. Mobile navigation

### Phase 2 (Important):
1. User dashboard
2. Booking management
3. Reviews and ratings
4. Image upload
5. Payment integration

### Phase 3 (Enhancement):
1. Chat/messaging
2. Push notifications
3. GPS tracking
4. Advanced analytics

## 10. Performance Targets

### Mobile (3G Network):
- **First Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 4s
- **Initial page size**: < 500KB
- **Image optimization**: < 100KB per image

## 11. Accessibility

### Requirements:
- **Color contrast**: Minimum 4.5:1
- **Touch targets**: Minimum 44x44px
- **Alt text**: All images
- **Keyboard navigation**: Full support
- **Screen reader**: ARIA labels

## 12. Responsive Breakpoints

```css
/* Mobile First */
- Mobile: 320px - 767px (default)
- Tablet: 768px - 1023px
- Desktop: 1024px+
- Large Desktop: 1440px+
```

## 13. Animation & Interaction

### Keep it Subtle:
- **Loading spinners** for async operations
- **Skeleton screens** for content loading
- **Smooth transitions** (200-300ms)
- **Haptic feedback** on mobile (button presses)
- **Pull-to-refresh** animation

### Avoid:
- Heavy animations (battery drain)
- Auto-playing videos (data usage)
- Parallax effects (performance)

## 14. Comparison: Herts Tools vs FMS Nigeria

| Feature | Herts Tools (UK) | FMS Nigeria |
|---------|------------------|-------------|
| **Primary Device** | Desktop | Mobile (Android) |
| **Network** | 4G/5G | 3G/4G |
| **Payment** | Card | Mobile money, USSD, Bank transfer |
| **Communication** | Email/Phone | WhatsApp/SMS/Phone |
| **Delivery** | UK-wide delivery | Local pickup + delivery |
| **Language** | English | English + local languages |
| **Currency** | GBP (£) | NGN (₦) |
| **Design** | Minimal, clean | Vibrant, trustworthy |

## 15. Next Steps

1. Create wireframes based on this design guide
2. Build component library with Tailwind CSS
3. Implement mobile-first responsive design
4. Test on low-end Android devices
5. Optimize images for data efficiency
6. Add Nigeria-specific features (WhatsApp, local payments)

---

**References:**
- Herts Tools: https://hertstools.co.uk/
- Material Design (Google): Mobile-first principles
- Nigerian mobile usage patterns
- Local e-commerce best practices (Jumia, Konga)
