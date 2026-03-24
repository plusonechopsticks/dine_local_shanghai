# Home.tsx Section Mapping Guide

This document provides a complete map of all sections in `client/src/pages/Home.tsx`, including their line numbers, code boundaries, and content descriptions. Use this guide for safe reorganization and future updates.

---

## Section Overview (Updated: About Us moved after Newsletter)

| Section # | Name | Purpose |
|-----------|------|----------|
| 1 | Hero Carousel | Full-screen hero with image carousel and CTA |
| 2 | Featured Hosts Gallery | **MOVED UP** - Featured hosts 3-column grid + "Browse All" CTA |
| 3 | Brand Identity & Story | **MOVED DOWN** - Brand intro text + feature cards (🍲🏠💬) |
| 4 | How It Works | 4-step process visualization |
| 5 | FAQ Accordions | Collapsible Q&A organized by category |
| 6 | Become a Host | Red CTA section with host benefits |
| 7 | Newsletter | Email subscription form |
| 8 | About Us | **MOVED DOWN** - Steven's bio with gallery images |
| 9 | Footer | Navigation links + copyright |

---

## How to Reorder Sections in the Future

### Quick Reference for Safe Reorganization

When you want to move sections around:

1. **Identify the section** you want to move using the table above
2. **Copy the entire section** including:
   - The comment line: `{/* Section X: Name */}`
   - All code from opening `<section>` to closing `</section>`
   - The empty line after `</section>`
3. **Paste in new location** maintaining the empty line spacing
4. **Update this mapping document** to reflect the new order
5. **Test in browser** to verify all links and functionality work

### Example: Moving Featured Hosts before Brand Story (COMPLETED ✅)

**What was changed:**
- Section 2 (Brand Story) → moved to Section 3
- Section 3 (Featured Hosts) → moved to Section 2

**Result:**
- Featured Hosts now displays immediately after Hero
- Brand Story now displays after Featured Hosts
- All links, buttons, and functionality preserved

---

## Detailed Section Breakdown

### Section 1: Hero Carousel (Lines 172-224)

**Purpose:** Full-screen hero banner with auto-rotating image carousel

**Key Elements:**
- Hero slides array (defined in component state, lines 45-62)
- Image carousel with fade transitions
- Dark gradient scrim overlay
- Centered headline: "The best restaurant in Shanghai isn't a restaurant."
- Subheading: "Experience authentic, home-cooked meals hosted by locals."
- CTA button: "Explore Local Hosts" → `/hosts`
- Slide indicators (dots) at bottom

**Code Structure:**
```jsx
<section id="hero" className="relative h-[500px] md:h-[600px] lg:h-[700px]...">
  {/* Carousel container */}
  <div className="relative h-full">
    {heroSlides.map(...)}  // Image rotation
    <div className="absolute inset-0 hero-scrim" />  // Dark overlay
  </div>
  
  {/* Overlay Text */}
  <div className="absolute inset-0 flex flex-col...">
    <h1>The best restaurant...</h1>
    <h2>Experience authentic...</h2>
    <Button>Explore Local Hosts</Button>
  </div>
  
  {/* Slide Indicators */}
  <div className="absolute bottom-4...">
    {heroSlides.map(...)}  // Dots
  </div>
</section>
```

**Dependencies:**
- `heroSlides` array (lines 45-62)
- `currentSlide` state (line 28)
- `setCurrentSlide` function
- Auto-rotate effect (lines 139-144)
- `nextSlide()` / `prevSlide()` functions (lines 154-160)

**Spacing:** Empty line after closing `</section>` (line 225)

---

### Section 2: Featured Hosts Gallery (Lines 226-284) - MOVED UP ⬆️

**Purpose:** Display featured hosts in a 3-column grid with call-to-action

**Key Elements:**
- Section headline: "Meet your new friends in Shanghai - Authentic Home Dining Experiences"
- 3-column grid of featured host cards
  - Each card shows: profile photo, host name, cuisine style, bio snippet, "View Details" button
  - Verified badge (green checkmark)
  - Hover effects: shadow increase, card lift, image scale
- "Browse All Hosts" button at bottom

**Code Structure:**
```jsx
<section id="featured-hosts" className="py-16 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center...">
      Meet your new friends in Shanghai...
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {featuredHosts.map(host => (
        <div key={host.id} className="bg-white rounded-lg...">
          {/* Image */}
          <div className="relative h-64 bg-gray-200...">
            <img src={host.profilePhotoUrl} ... />
            <div className="absolute top-3 right-3 bg-green-500...">
              ✓ Verified
            </div>
          </div>
          
          {/* Card Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold...">{host.hostName}</h3>
            <p className="text-gray-600 mb-4">{host.cuisineStyle}</p>
            <p className="text-sm text-gray-700 mb-4 line-clamp-3">
              {truncateSummary(host.bio, 120)}
            </p>
            <Button onClick={() => setLocation(`/hosts/${host.id}`)}>
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>
    
    <div className="text-center mt-12">
      <Button variant="outline" onClick={() => setLocation("/hosts")}>
        Browse All Hosts
      </Button>
    </div>
  </div>
</section>
```

**Dependencies:**
- `allHosts` data (line 38, from tRPC query)
- `featuredHosts` array (lines 41-43, filtered from `allHosts`)
- `FEATURED_HOST_NAMES` constant (line 24)
- `truncateSummary()` function (lines 162-165)
- `setLocation` function (for navigation)

**Spacing:** Empty line after closing `</section>` (line 285)

---

### Section 3: Brand Identity & Story (Lines 286-379) - MOVED DOWN ⬇️

**Purpose:** Introduce +1 Chopsticks brand and showcase value propositions with feature cards

**Key Elements:**
- **Left side:** Three text blocks
  - Block 1: "Ni Hao! We are +1 chopsticks" + mission statement
  - Block 2: "Wait, home dining in China? I never heard of that" + explanation
  - Block 3: "Sounds fun! Who are the hosts?" + host diversity info
  - "Find your Table" CTA button
- **Right side:** Three feature cards (colored backgrounds)
  - 🍲 Home-cooked menus
  - 🏠 Hosted by local families
  - 💬 Small groups, real conversations

**Code Structure:**
```jsx
<section id="brand-story" className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12...">
      {/* Left: Text Blocks */}
      <div className="space-y-8">
        <div className="border-l-4 border-red-600 pl-6">
          <h2>Ni Hao! We are +1 chopsticks</h2>
          <p>In Chinese culture...</p>
          <p>That's our mission...</p>
        </div>
        
        <div className="border-l-4 border-red-600 pl-6">
          <h3>Wait, home dining in China?...</h3>
          <p>Yup. Because it didn't exist...</p>
        </div>
        
        <div className="border-l-4 border-red-600 pl-6">
          <h3>Sounds fun! Who are the hosts?...</h3>
          <p>Our diverse community...</p>
        </div>
        
        <div className="pt-4">
          <Button>Find your Table</Button>
        </div>
      </div>
      
      {/* Right: Feature Cards */}
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-6...">
          <div className="text-4xl">🍲</div>
          <h4>Home-cooked menus</h4>
          <p>Regional dishes...</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-6...">
          <div className="text-4xl">🏠</div>
          <h4>Hosted by local families</h4>
          <p>Meet your hosts...</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6...">
          <div className="text-4xl">💬</div>
          <h4>Small groups, real conversations</h4>
          <p>1–6 guests per table...</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

**Dependencies:**
- `setLocation` function (for navigation)
- No data dependencies (static content)

**Spacing:** Empty line after closing `</section>` (line 380)

---

### Section 4: How It Works (Lines 381-429)

**Purpose:** Show 4-step process for booking and dining

**Key Elements:**
- Section headline: "🥢 How +1 Chopsticks Works"
- 4 steps with emojis and descriptions:
  1. 👀 Browse - "Explore our curated selection..."
  2. 📅 Book - "Select your preferred date..."
  3. 🧑‍🍳 Prepare - "Confirm any dietary needs..."
  4. 🍽️ Eat - "Enjoy delicious home-cooked food..."
- Numbered circles (1-4) in red
- Responsive grid layout

**Dependencies:** None (self-contained static content)

**Spacing:** Empty line after closing `</section>`

---

### Section 5: About Us (Lines 430-533)

**Purpose:** Tell Steven's personal story and build credibility

**Key Elements:**
- Left side: Image gallery with main photo + 3 gallery images
- Right side: 4 text blocks about Steven's background and philosophy

**Dependencies:**
- `IMAGES` object (lines 16-22)
- `galleryImages` array (lines 64-77)
- `hoveredGalleryImage` state (line 30)

**Spacing:** Empty line after closing `</section>`

---

### Section 6: FAQ Accordions (Lines 534-582)

**Purpose:** Answer common questions organized by category

**Key Elements:**
- 3 accordion categories: Booking & Logistics, Concerns & Safety, For Hosts & Partners
- Expandable Q&A items using shadcn/ui Accordion component

**Dependencies:**
- `faqItems` array (lines 80-136)
- Accordion component from shadcn/ui

**Spacing:** Empty line after closing `</section>`

---

### Section 7: Become a Host (Lines 583-641)

**Purpose:** Call-to-action section encouraging hosts to join

**Key Elements:**
- Red background section
- Headline: "Love cooking and meeting new people?"
- 3 benefit cards with emojis
- "Become a Host" CTA button

**Dependencies:**
- `setLocation` function (for navigation)

**Spacing:** Empty line after closing `</section>`

---

### Section 8: Newsletter (Lines 642-691)

**Purpose:** Email subscription form

**Key Elements:**
- Headline: "Coming to China this year?"
- Email input field
- "Subscribe" button

**Dependencies:**
- `newsletterEmail` state (line 31)
- `isSubmittingNewsletter` state (line 32)
- `submitInterestMutation` (line 35)

**Spacing:** Empty line after closing `</section>`

---

### Section 9: Footer (Lines 692-778)

**Purpose:** Navigation links and copyright

**Key Elements:**
- Logo and brand name
- Navigation links (Browse Hosts, How It Works, FAQ, Blog, Become a Host)
- Email link
- Copyright notice

**Dependencies:** `setLocation` function (for navigation)

---

## Common Dependencies Reference

| Dependency | Type | Usage | Lines |
|------------|------|-------|-------|
| `setLocation` | Function | Navigation to routes | Multiple |
| `allHosts` | State/Query | Featured hosts data | 38 |
| `featuredHosts` | Computed | Filtered featured hosts | 41-43 |
| `currentSlide` | State | Hero carousel position | 28 |
| `heroSlides` | Const Array | Hero carousel images | 45-62 |
| `faqItems` | Const Array | FAQ content | 80-136 |
| `galleryImages` | Const Array | About Us gallery | 64-77 |
| `IMAGES` | Const Object | S3 image URLs | 16-22 |
| `truncateSummary()` | Function | Text truncation | 162-165 |

---

## Tips for Future Reorganizations

✅ **Do:**
- Copy entire sections including the section comment
- Include the empty line after `</section>`
- Test all links after moving sections
- Update this mapping document

❌ **Don't:**
- Break up sections or move partial code
- Remove the section ID attributes
- Delete dependencies or state that sections need
- Forget to test navigation buttons

---

## Configuration File

For a more flexible approach to section ordering, see `/client/src/config/homeSections.ts` which defines section order and metadata.
