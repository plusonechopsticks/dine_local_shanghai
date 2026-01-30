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

## Simplified Host Registration
- [x] Replace complex 5-step form with simple 3-question form
- [x] Ask only: name, district, email/WeChat ID
- [x] Add "We are looking for an inaugural batch of hosts!" messaging
- [x] Update database schema to support simplified host interest submissions
- [x] Update backend API for simplified submission


## Two-Step Host Registration Flow
- [x] Redesign registration flow: quick 3-question form → optional full registration
- [x] Add "Continue to Full Registration" button after email submission
- [x] Create progress bar component showing completion percentage
- [x] Bring back full multi-step form with progress tracking
- [x] Add step indicators (e.g., "Step 2 of 5: Profile Details")
- [x] Preserve host interest data when transitioning to full form
- [x] Test complete registration flow from interest to submission

## Submit Button After Email Step
- [x] Add submit button after email/WeChat ID field in quick interest form
- [x] Allow hosts to submit interest without completing full registration
- [x] Provide option to continue to full form after submission
- [x] Make submit button more prominent (burgundy, larger)
- [x] Improve visibility of Next button in full registration form
- [x] Fix progress box text overflow with truncate and smaller padding
- [x] Improve Previous button visibility with gray background

## Bug Fixes
- [x] Fix host registration form submission error - raw JSON displayed instead of success page
  - Fixed backend response to return only { success: true } instead of { success: true, listing }
  - Fixed router syntax error (missing closing brace for booking router)
  - Updated test expectations to match new response format
  - All 18 tests passing
- [x] Add persistent navigation bar with logo to all pages
  - Logo links back to home page
  - Navigation links for guests and hosts
  - Responsive mobile menu with hamburger icon

## Current Issues
- [x] Fix host registration form submission - raw JSON displaying instead of success page
  - Root cause: Form was missing onSubmit handler, causing traditional HTML form submission
  - Fixed by adding onSubmit={(e) => { e.preventDefault(); }} to form element
  - Changed submit button from type="button" to type="submit"
  - Now properly handles tRPC mutation response and displays success page

## Urgent Bug - Form Submission Still Broken
- [x] Fix host registration form - still showing raw JSON instead of thank you page
  - Root cause: HTML form element was causing traditional form submission even with onSubmit handler
  - Solution: Replaced <form> with <div> to completely eliminate HTML form behavior
  - Button now uses type="button" with onClick handler that calls e.preventDefault() and e.stopPropagation()
  - All 18 tests passing

## Complete Rebuild - Host Registration Form
- [x] Completely rebuild HostRegister.tsx from scratch
  - Created new 550-line component from scratch
  - No HTML form elements - only React state and button onClick handlers
  - Clean 3-phase structure: initial -> form -> success
  - 5-step multi-step form with progress indicator
  - Auto-save to localStorage for form recovery
  - Proper tRPC mutation handling with success page display


## Admin Dashboard - Fixed ✅
- [x] Remove authentication requirement from admin dashboard for testing
  - Changed host.listAll from protectedProcedure to publicProcedure
  - Changed host.updateStatus from protectedProcedure to publicProcedure  
  - Changed sendHostApprovalEmail from protectedProcedure to publicProcedure
  - Admin dashboard now accessible at /admin without login
  - TODO: Add role-based access control before production deployment


## Admin Features - In Progress
- [x] Add ability to edit/change host approval status after initial decision
  - Added "Edit Status" button to approved and rejected host cards
  - Dialog shows different status change options based on current status:
    - Approved: can change to Rejected or Pending
    - Rejected: can change to Approved or Pending
  - Admin can add notes when changing status
  - Status updates immediately in the UI after confirmation


## Design Improvements - Completed ✅
- [x] Redesign Find Hosts page with food photo overlays
  - Large food photos as hero images (not small cards)
  - Dark overlay gradient with semi-transparent background
  - Host avatar (circular) with name and district in bottom left
  - Price prominently displayed in bottom right
  - Cuisine style badge at top left
  - Improved hover effects with zoom and shadow transitions
  - Better visual hierarchy matching "eat with" experience pattern


## Host Detail Page Redesign - Completed ✅
- [x] Add experience/host toggle tabs
  - Two-button toggle with smooth transitions
  - Active tab highlighted with primary color
- [x] Design experience view with icon details
  - Show key details with icons (utensils, users, clock, wine)
  - Display experience description with Read more button
  - 4-column grid layout for key details
- [x] Design host view
  - Show host avatar (circular) with name and district
  - Display host bio with Read more button
  - Clean card-based layout
- [x] Improve booking section
  - Show price, meal type, guest count in sticky card
  - Prominent Book Now button with Share option
  - Right sidebar sticky positioning


## Menu & Title Improvements - Completed ✅
- [x] Restructure host detail page to show menu first in experience section
  - Menu now appears as the first element when viewing experience
  - Removed duration and beverages from key details display
  - Kept only cuisine style and max guests in key details
- [x] Implement AI-powered title summarization
  - Added host.summarizeTitle tRPC procedure using LLM
  - Generates compelling titles up to 3 lines maximum
  - Uses cuisine style, menu description, and activities as context
  - Fallback to simple title if LLM fails
- [x] Create MenuFormatter component for structured menu input
  - Allows hosts to organize menu into sections (Appetizers, Main Courses, etc.)
  - Add/edit/delete menu sections and individual dishes
  - Live preview showing formatted menu output
  - Toggle between text editor and structured builder
- [x] Integrate MenuFormatter into host registration Step 1
  - Added "Use Structured Menu Builder" button to toggle between text and structured input
  - MenuFormatter converts sections to formatted text automatically
  - Hosts can switch back to text editor anytime
- [x] Add AI Title Generator UI to registration form
  - Generate Title button with Sparkles icon
  - Shows generated title in highlighted box with "Use This Title" button
  - Disabled until cuisine style and menu description are filled
  - Toast notifications for success/error states


## Layout Restructuring - Completed ✅
- [x] Move cuisine and guest count icons to appear before menu section
- [x] Remove host bio section from experience tab view
- [x] Reorder experience tab to show: key details (icons) → menu → availability
- [x] Add title field to hostListings database schema
- [x] Update HostDetail page to display title if it exists
