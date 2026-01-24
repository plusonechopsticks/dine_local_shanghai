# Dine at Local Family Homes - Project TODO

## Features
- [x] Database schema for interest submissions (name, email, interest type)
- [x] Backend API endpoint to store submissions
- [x] Hero section with compelling visuals and messaging
- [x] Email collection form (name, email, interest type: traveler/host)
- [x] Experience benefits section (cultural exchange, hospitality, meals, family)
- [x] Call-to-action sections for travelers and host families
- [x] About section for Shanghai pilot program
- [x] Contact/interest form with database storage
- [x] Responsive design for mobile and desktop
- [x] Elegant and polished visual design throughout
- [x] Owner notification on new submissions

## Updates
- [x] Rename website to "Add a Pair of Chopsticks" / "加一雙筷子" concept
- [x] Update pilot year from 2025 to 2026
- [x] Remove trust indicators section (Airbnb text, countries, families, location)
- [x] Update branding to "+1 Chopsticks"
- [x] Create custom chopsticks logo (replace fork/knife icon)

## Host Registration Form
- [x] Database schema for host listings
- [x] Host registration page with form fields:
  - [x] Name and profile photo
  - [x] Languages spoken
  - [x] Brief bio/story
  - [x] Availability (days + lunch/dinner)
  - [x] Number of guests (default 2)
  - [x] Cuisine style
  - [x] What they'll cook (text + 3 photos minimum)
  - [x] Dietary accommodations
  - [x] Meal duration estimate
  - [x] District location
  - [x] Price per person (default 100 RMB)
  - [x] Kids/family friendly
  - [x] Pets in home
  - [x] WeChat ID or phone
- [x] Image upload functionality (S3 storage)
- [x] Backend API for host registration
- [x] Form validation and submission

## Host Listings Page
- [x] Create listings page at `/hosts` route
- [x] Display approved host profiles in card format
- [x] Filter panel with key filters:
  - [x] District (Shanghai districts)
  - [x] Availability (day of week + lunch/dinner)
  - [x] Max guests
  - [x] Price range
- [x] Host cards showing:
  - [x] Profile photo and name
  - [x] Cuisine style
  - [x] Price per person
  - [x] District location
  - [x] Available days
  - [x] Food photos
- [x] Link to listings page from main navigation
- [x] Responsive design for mobile and desktop
- [x] Extensible filter design for future additions

## Test Data & Navigation
- [x] Create test host entry with approved status
- [x] Verify listings page shows test host
- [x] Improve navigation visibility for Find Hosts link

## Homepage & Typography Improvements
- [x] Move "Browse Hosts" button to hero section
- [x] Remove "Join Waitlist" button from hero
- [x] Improve typography hierarchy on listings page (larger titles, better visual layers)

## Airbnb-Style Listing Redesign
- [x] Change to vertical card grid layout
- [x] Large hero image (60-70% of card height)
- [x] Image carousel with dot indicators
- [x] Heart icon for favorites overlay on image
- [x] Badge overlays for special attributes
- [x] Compact info below image: title, description, price
- [x] Price prominently displayed with underline
- [x] Responsive grid (1 col mobile, 2-3 cols tablet, 3-4 cols desktop)

## Photo Update & Carousel Improvement
- [x] Upload new host group photo to S3
- [x] Update test host's profile photo in database
- [x] Add horizontal scrolling support for image carousel
- [x] Improve mobile swipe experience for images

## Hero Section Update
- [x] Replace "Learn More" button with "Become a Host" button in hero section

## Button Hierarchy Update
- [x] Swap button styles: "Become a Host" as primary (solid), "Browse Hosts" as secondary (outline)

## Host Registration Page Improvements
- [x] Add succinct benefits section at top of page
- [x] Reorder Step 1 to start with name and Shanghai district
- [x] Increase font sizes for better readability
- [x] Make form experience more joyful and engaging
- [x] Ensure benefits section doesn't hide the form
