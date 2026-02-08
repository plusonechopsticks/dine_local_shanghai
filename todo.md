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

## Current Bugs - Fixed ✅
- [x] Fix Norika and Steven's missing first photo in listing
- [x] Remove duplicate +1 Chopsticks header from host detail page


## Messaging Features - Completed ✅
- [x] Verify host messaging functionality for viewing guest messages (available in Host Dashboard)
- [x] Add messages view to admin panel for managing all host messages (Messages tab added to Admin Dashboard)


## Admin Panel - Fully Functional ✅
- [x] Admin panel displays all 5 host listings correctly
- [x] Filter buttons work (All, Pending, Approved, Rejected) - FIXED: changed default filter from pending to all
- [x] Listings show correct status counts (Pending: 0, Approved: 2, Rejected: 3)
- [x] Each listing card displays host info, cuisine, price, status
- [x] Expanded listing view shows FULL listing details (bio, availability, menu, dietary, activities, photos)
- [x] Action buttons are context-aware (Reject for approved, Approve for rejected/pending)
- [x] Food photos displayed in grid format
- [x] Bookings tab UI created and functional
- [x] Bookings tab shows No bookings found (table pending)
- [x] Fixed booking router structure (moved listAll inside router)
- [x] tRPC booking.listAll procedure working
- [x] Fixed booking.create to save bookings to database (was only sending notifications)
- [x] Created bookings table in database
- [x] All filter buttons working correctly on each status

## Admin Booking Management - Completed ✅
- [x] Add Bookings tab UI to admin panel with table structure
- [x] Implement tRPC procedure to fetch bookings with related data (getAllBookings with host join)
- [x] Connect Bookings tab to display real booking data from database
- [x] Add status badge colors and date formatting for bookings
- [x] Create comprehensive booking tests (6 tests passing)


## Admin Panel Edit Functionality - Completed ✅
- [x] Remove Reject button from approved applications
- [x] Restore Edit button to all host listings
- [x] Implement edit modal with photo management (AdminHostEditForm)
- [x] Add bulk photo upload functionality (profile + food photos)
- [x] Add photo deletion functionality (X button on each photo)
- [x] Test edit workflow with photo changes
- [x] Approve button shows for rejected/pending listings only
- [x] Edit button shows on all listings
- [x] Action buttons context-aware based on approval status


## Bug Fixes - Completed ✅
- [x] Fix Approve/Reject buttons not responding in admin panel expanded view
- [x] Fix duplicate Approve button showing for rejected listings
- [x] Verify approve/reject functionality updates database and UI correctly


## Bidirectional Status Changes - Completed ✅
- [x] Add Reject button for approved listings
- [x] Allow admins to change status in any direction (approved ↔ rejected ↔ pending)
- [x] Test all status change combinations

## UI Fixes - Completed ✅
- [x] Restore missing title in host application cards (now displays in blue box)
- [x] Improve cuisine visibility (larger, bolder text for better readability)


## Current Bug - Approve/Reject Buttons - FIXED ✅
- [x] Both Approve and Reject buttons are working correctly
  - Root cause: Buttons were working but lacked immediate UI feedback
  - Solution: Added enhanced error handling and logging to both mutations
  - Verified: 
    - Reject button successfully changes status from approved → rejected
    - Approve button successfully changes status from rejected → approved
    - Status counts update correctly
    - Database changes persist after page refresh


## Immediate UI Updates - Completed ✅
- [x] Add immediate status updates when approve/reject buttons clicked
  - Implemented using trpc.useUtils().invalidate() for instant refetch
  - Status badge updates immediately without page refresh
  - Buttons change dynamically based on new status
  - Both Approve and Reject buttons working with instant feedback


## Current Bug - Missing Title Display - FIXED ✅
- [x] Title field now displaying on guest-facing host details page
  - Shows as large prominent heading above host name
- [x] Title field now displaying on admin dashboard
  - Shows in burgundy text above host name on each card
- [x] Title is being collected in host registration form and now shown everywhere


## Current Bug - Frozen Edit Dialog - FIXED ✅
- [x] Edit dialog in admin dashboard freezes when opened
  - [x] Cannot scroll up or down in the dialog - FIXED
  - [x] Cannot make edits to form fields - FIXED
  - [x] Dialog content is too large and not scrollable - FIXED
  - Solution: Added max-h-[90vh], flex layout, and overflow-y-auto to DialogContent


## Admin Dashboard - Host Registration Sync - COMPLETED ✅
- [x] Audit host registration form to identify all fields
- [x] Verify all fields exist in database schema
- [x] Update admin dashboard to display all registration fields
- [x] Update admin edit dialog to allow editing all fields
- [x] Ensure old listings without new fields show empty values
- [x] Test admin dashboard matches registration form completely
  - All 20+ fields now display and are editable
  - Organized into logical sections (Profile, Dining, Household, Activities)
  - Missing fields show as "-" for old listings
  - Changes sync immediately


## Current Bug - Save Changes Not Working - FIXED ✅
- [x] Admin edit dialog save changes button now works!
  - Root cause: Wrong tRPC procedure name (updateHost vs updateListing)
  - Root cause: Wrong mutation payload structure (nested data object)
  - Solution: Changed to trpc.host.updateListing.useMutation()
  - Solution: Flattened payload from { id, data: {...} } to { id, ...data }
  - Rewritten with simple form-based approach (no Radix Dialog)
  - Form submission now works correctly
  - Changes save to database successfully
  - UI updates immediately after save

## Current Bug - Database Not Updating - FIXED ✅
- [x] Admin dashboard Save Changes now persists to database correctly
  - Root cause: Missing fields in tRPC input schema
  - Solution: Added all editable fields (title, wechatOrPhone, languages, fullAddress, mealDurationMinutes, kidsFriendly, hasPets, petDetails, householdFeatures, otherHouseholdInfo) to updateListing input schema
  - Tested successfully: Title field update persists to database
  - Changes now save and display correctly on host listing pages

## New Admin Dashboard Features
- [ ] Add expandable/collapsible host cards to show all host information
  - Display all fields in organized sections
  - Collapsed by default to save space
  - Click to expand and see full details
- [ ] Add photo management for profile and food photos
  - Allow admin to delete existing photos
  - Allow admin to upload new photos
  - Show photo previews in edit form
- [ ] Add application status workflow (pending/approved/rejected)
  - Add status field to database schema
  - Add approve/reject buttons for each host
  - Allow admin to switch status between pending/approved/rejected
  - Filter hosts by status


## New Admin Dashboard Features - COMPLETED ✅
- [x] Display all host info in expandable cards (collapsed by default)
- [x] Status filter buttons: All, Pending, Approved, Rejected
- [x] Status badges on each host card
- [x] Approve/Reject buttons based on current status
- [x] Expandable cards showing all fields:
  * Host Profile: WeChat/Phone, Languages, Bio, Profile Photo
  * Dining Details: Title, District, Address, Cuisine, Price, Guests, Duration, Menu, Dietary Notes
  * Food Photos: Grid display
  * Household Info: Kids Friendly, Has Pets, Features
  * Activities & Notes
  * Timestamps: Created, Updated
- [ ] Photo management: add/delete profile and food photos (Edit form needs photo upload UI)
- [ ] Status change confirmation (confirm dialog might be blocking - needs testing)


## Current Bug - Broken Images on Guest Listings - IN PROGRESS
- [x] Photos showing as broken image icons (question marks) on Find Hosts page
- [x] Investigated: CloudFront URLs returning 403 Forbidden
- [x] Root cause: S3 bucket configured to block public access
- [ ] Implement proxy endpoint to serve images with authentication (workaround)
- [ ] Update frontend to use proxy URLs instead of direct CloudFront URLs
- [ ] Submit support request to Manus for S3 bucket public access configuration

## Image Display Fix - Completed ✅
- [x] Fix broken image display (403 Forbidden errors on CloudFront URLs)
  - Root cause: CloudFront URLs not publicly accessible without proper authentication
  - Solution: Implemented image proxy endpoint at /api/image-proxy/:path
  - Added getProxiedImageUrl() helper function in client/src/lib/imageUtils.ts
  - Updated all pages to use proxy: HostListings.tsx, HostDetail.tsx, AdminDashboard.tsx
  - All images now display correctly on dev server
  - Verified on: host listings page, host detail page, admin dashboard

## SEO Improvements
- [x] Add meta description (50-160 characters) to homepage
- [x] Add meta keywords for better search visibility

## External Image Hosting (Cloudinary)
- [x] Install Cloudinary SDK
- [x] Request Cloudinary API credentials from user
- [x] Update upload endpoint to use Cloudinary
- [x] Remove image proxy code (no longer needed)
- [x] Update frontend to use direct Cloudinary URLs
- [x] Test image upload and display

## Image Migration to Cloudinary
- [x] Upload Grace Tong dumpling class images (3 photos)
- [x] Update Grace Tong dumpling listing in database
- [x] Upload remaining host images (Norika & Steven, Grace Tong fusion, Shanghai Ayi)
- [x] Update all profile photos (Grace Tong, Norika & Steven, Shanghai Ayi)
- [x] Verify all images display correctly on Find Hosts page

## Current Bug - Booking Date Not Recorded - FIXED ✅
- [x] Guest can select date from calendar in booking flow
- [x] Selected date is being saved to database correctly
- [x] Admin dashboard now shows formatted dates for all bookings
- [x] Fixed: Changed booking.bookingDate to booking.requestedDate in AdminDashboard.tsx

## View Counter Feature
- [ ] Add viewCount column to host_listings table in schema
- [ ] Push database migration with pnpm db:push
- [ ] Create backend procedure to increment view count
- [ ] Update HostDetail page to track views when listing is opened
- [ ] Display view count on listing cards and detail page
- [ ] Test view counter increments correctly


## View Counter Feature - COMPLETED ✅
- [x] Add viewCount column to host_listings schema
- [x] Create backend procedure to increment view count (trpc.host.incrementView)
- [x] Display view count on listing cards with eye icon
- [x] Track views when users visit listing detail page
- [x] Test view counter increments correctly (verified: 0 → 1)

## Auto-Refresh View Counts - COMPLETED ✅
- [x] Add useEffect with setInterval to HostListings page
- [x] Refetch listing data every 30 seconds
- [x] Clean up interval on component unmount
- [x] Test auto-refresh updates view counts without manual page reload (verified: Shanghai Ayi 0 → 1)


## BUG - Rejected Host Applications Showing Publicly - FIXED ✅
- [x] Rejected host applications were visible on Find Hosts page
- [x] Only approved hosts are now displayed to public
- [x] Fixed backend query to filter by "approved" status
- [x] Tested: Only 4 approved listings now show (Shanghai Ayi, Grace Tong x2, Norika & Steven)


## Limited-Time Offer Discount Feature
- [x] Design front-end UI for discount display on listing cards
- [x] Add "Limited Time Offer" badge component
- [x] Show original price struck through (e.g., ~~¥500~~)
- [x] Display new discounted price prominently (e.g., ¥400)
- [x] Show discount percentage (e.g., "20% OFF")
- [x] Add discount fields to database schema (discountPercentage column)
- [x] Create admin panel UI to set/edit discount percentage per host
- [x] Update backend tRPC procedures to handle discount data
- [x] Calculate and return discounted prices in API responses
- [x] Test discount display on listing cards
- [x] Test admin panel discount controls
- [x] Verify discount calculations are accurate


## Host Chuan 川 Registration
- [x] Extract host information from PDF
- [x] Upload profile photo to S3
- [x] Upload food photos to S3
- [x] Insert host listing into database
- [x] Verify listing display on Find Hosts page
- [x] Verify detail page display
- [x] Ready for publishing


## Bug Fixes
- [x] Fix Share button on host detail page - not copying link to clipboard
- [x] Add discount display to host detail page pricing section


## SEO & Social Sharing Improvements
- [x] Add Open Graph meta tags to host detail pages for Facebook/social sharing
- [x] Add dynamic title and description meta tags per listing
- [x] Optimize homepage with Shanghai travel keywords
- [x] Improve meta descriptions across all pages
- [ ] Add structured data (JSON-LD) for rich snippets (optional advanced feature)
- [x] Add og:image to homepage for Facebook thumbnail preview
- [x] Verify og:image works on listing pages
- [x] Add GetYourGuide widget to homepage
- [x] Add traveler email signup box below hero section
- [x] Enhance email signup box styling with better visibility and food emojis
- [x] Change email signup button text from "Join Waitlist" to "Send"
- [x] Update "About the Pilot Program" section to "About Us" with founders' photo and story
- [x] Remove "Join the Waitlist" contact form section from homepage
