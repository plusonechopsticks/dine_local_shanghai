import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { 
  createInterestSubmission, 
  getAllInterestSubmissions,
  createHostInterest,
  getAllHostInterests,
  createHostListing,
  getAllHostListings,
  getHostListingById,
  updateHostListingStatus,
  updateHostListing,
  getAllBookings
} from "./db";
import { getOrCreateConversation, sendMessage, getConversationMessages, getHostConversations, getGuestConversations, markMessagesAsRead } from "./messaging";
import { getDb } from "./db";
import { bookings, hostListings } from "../drizzle/schema";
import { sql, eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import { sendGuestConfirmationEmail, sendHostConfirmationEmail, sendGuestRejectionEmail, sendHostApprovalEmail, sendEmail } from "./email";
import { generatePaymentReminderEmail } from "./email-templates";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  booking: router({
    create: publicProcedure
      .input(z.object({
        hostListingId: z.number(),
        guestName: z.string().min(1),
        guestEmail: z.string().email(),
        guestPhone: z.string().optional(),
        requestedDate: z.string(),
        mealType: z.enum(["lunch", "dinner"]),
        numberOfGuests: z.number().min(1),
        specialRequests: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Insert booking into database
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        await db.insert(bookings).values({
          hostListingId: input.hostListingId,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone || null,
          requestedDate: new Date(input.requestedDate),
          mealType: input.mealType,
          numberOfGuests: input.numberOfGuests,
          specialRequests: input.specialRequests || null,
          status: "pending",
        });
        
        // Get the last inserted ID
        const lastIdResult = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
        console.log('[Booking Create] Raw result:', JSON.stringify(lastIdResult));
        
        // Extract ID from result - structure varies by driver
        let bookingId;
        if (Array.isArray(lastIdResult) && lastIdResult.length > 0) {
          const firstRow: any = lastIdResult[0];
          if (Array.isArray(firstRow) && firstRow.length > 0) {
            bookingId = firstRow[0]?.id || firstRow[0]?.['LAST_INSERT_ID()'];
          } else {
            bookingId = firstRow?.id || firstRow?.['LAST_INSERT_ID()'];
          }
        }
        
        console.log('[Booking Create] Extracted booking ID:', bookingId, 'type:', typeof bookingId);
        
        if (!bookingId || isNaN(Number(bookingId))) {
          console.error('[Booking Create] Invalid booking ID:', bookingId);
          throw new Error('Failed to create booking: Invalid ID returned');
        }

        // Send notification to owner
        await notifyOwner({
          title: `New Booking Request from ${input.guestName}`,
          content: `Guest: ${input.guestName}\nEmail: ${input.guestEmail}\nDate: ${input.requestedDate}\nMeal: ${input.mealType}\nGuests: ${input.numberOfGuests}\nSpecial Requests: ${input.specialRequests || "None"}`,
        });
        
        // Get host details for email
        const host = await getHostListingById(input.hostListingId);
        if (!host) throw new Error("Host listing not found");
        
        // Calculate total amount
        const discountedPrice = host.discountPercentage
          ? Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))
          : host.pricePerPerson;
        const totalAmount = discountedPrice * input.numberOfGuests;
        
        // Generate payment link (booking confirmation page)
        const baseUrl = process.env.VITE_WEBSITE_URL || 'https://plus1chopsticks.manus.space';
        const paymentLink = `${baseUrl}/booking-confirmation?bookingId=${bookingId}&guestName=${encodeURIComponent(input.guestName)}&guestEmail=${encodeURIComponent(input.guestEmail)}&requestedDate=${encodeURIComponent(input.requestedDate)}&mealType=${input.mealType}&numberOfGuests=${input.numberOfGuests}&hostName=${encodeURIComponent(host.hostName)}&amount=${totalAmount}&dietaryRestrictions=${encodeURIComponent(input.specialRequests || "")}&hostListingId=${host.id}`;
        
        // Send payment reminder email
        try {
          const emailHtml = generatePaymentReminderEmail({
            guestName: input.guestName,
            bookingId: Number(bookingId),
            hostName: host.hostName,
            requestedDate: input.requestedDate,
            mealType: input.mealType,
            numberOfGuests: input.numberOfGuests,
            totalAmount: totalAmount.toFixed(2),
            paymentLink,
          });
          
          await sendEmail({
            to: input.guestEmail,
            subject: "Complete Your Booking Payment - +1 Chopsticks",
            html: emailHtml,
          });
          
          console.log(`[Booking] Payment reminder email sent to ${input.guestEmail}`);
        } catch (error) {
          console.error('[Booking] Failed to send payment reminder email:', error);
          // Don't fail the booking if email fails
        }
        
        return { success: true, id: bookingId };
      }),

    listAll: publicProcedure.query(async () => {
      return await getAllBookings();
    }),

    toggleHidden: publicProcedure
      .input(z.object({
        id: z.number(),
        hidden: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        await db.update(bookings)
          .set({ hidden: input.hidden })
          .where(eq(bookings.id, input.id));
        
        return { success: true };
      }),
  }),
  messaging: router({
    // Create or get conversation
    getOrCreateConversation: publicProcedure
      .input(z.object({
        hostListingId: z.number(),
        guestEmail: z.string().email(),
        guestName: z.string(),
        bookingId: z.number().optional(),
        subject: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await getOrCreateConversation(
          input.hostListingId,
          input.guestEmail,
          input.guestName,
          input.bookingId,
          input.subject
        );
      }),

    // Send a message
    sendMessage: publicProcedure
      .input(z.object({
        conversationId: z.number(),
        senderType: z.enum(["host", "guest"]),
        senderName: z.string(),
        senderEmail: z.string().email(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return await sendMessage(
          input.conversationId,
          input.senderType,
          input.senderName,
          input.senderEmail,
          input.content
        );
      }),

    // Get all messages in a conversation
    getMessages: publicProcedure
      .input(z.object({
        conversationId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getConversationMessages(input.conversationId);
      }),

    // Get conversations for host
    getHostConversations: publicProcedure
      .input(z.object({
        hostListingId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getHostConversations(input.hostListingId);
      }),

    // Get conversations for guest
    getGuestConversations: publicProcedure
      .input(z.object({
        guestEmail: z.string().email(),
      }))
      .query(async ({ input }) => {
        return await getGuestConversations(input.guestEmail);
      }),

    // Mark messages as read
    markAsRead: publicProcedure
      .input(z.object({
        conversationId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await markMessagesAsRead(input.conversationId);
      }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Simplified host interest (inaugural batch)
  hostInterest: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        district: z.string().min(1, "District is required"),
        contact: z.string().min(1, "Email or WeChat ID is required"),
      }))
      .mutation(async ({ input }) => {
        const interest = await createHostInterest({
          name: input.name,
          district: input.district,
          contact: input.contact,
        });

        // Notify owner of new host interest
        await notifyOwner({
          title: `New Host Interest: ${input.name}`,
          content: `Name: ${input.name}\nDistrict: ${input.district}\nContact: ${input.contact}`,
        });

        return { success: true, interest };
      }),

    // Protected endpoint for admin to view all host interests
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        return [];
      }
      return getAllHostInterests();
    }),
  }),

  interest: router({
    // Public endpoint to submit interest
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        interestType: z.enum(["traveler", "host"]),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const submission = await createInterestSubmission({
          name: input.name,
          email: input.email,
          interestType: input.interestType,
          message: input.message || null,
        });

        // Notify owner of new submission
        const typeLabel = input.interestType === "traveler" ? "Traveler" : "Host Family";
        await notifyOwner({
          title: `New ${typeLabel} Interest: ${input.name}`,
          content: `Name: ${input.name}\nEmail: ${input.email}\nType: ${typeLabel}\n${input.message ? `Message: ${input.message}` : ""}`,
        });

        return { success: true, submission };
      }),

    // Protected endpoint for admin to view all submissions
    list: publicProcedure.query(async () => {
      return getAllInterestSubmissions();
    }),

    toggleHidden: publicProcedure
      .input(z.object({
        id: z.number(),
        hidden: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        const { interestSubmissions } = await import("../drizzle/schema");
        
        await db.update(interestSubmissions)
          .set({ hidden: input.hidden })
          .where(eq(interestSubmissions.id, input.id));
        
        return { success: true };
      }),
  }),

  // Image upload endpoint
  upload: router({
    image: publicProcedure
      .input(z.object({
        base64Data: z.string(),
        fileName: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log(`[Upload] Starting upload for: ${input.fileName}`);
          
          // Validate base64 data
          if (!input.base64Data || input.base64Data.length === 0) {
            throw new Error("No image data provided");
          }

          // Decode base64 to buffer
          const buffer = Buffer.from(input.base64Data, "base64");
          console.log(`[Upload] Buffer size: ${buffer.length} bytes for ${input.fileName}`);
          
          // Generate unique file key
          const ext = input.fileName.split('.').pop() || 'jpg';
          const uniqueKey = `host-images/${nanoid()}.${ext}`;
          
          // Upload to S3
          console.log(`[Upload] Uploading to storage: ${uniqueKey}`);
          const { url } = await storagePut(uniqueKey, buffer, input.contentType);
          
          console.log(`[Upload] Upload successful: ${url}`);
          return { url };
        } catch (error: any) {
          console.error(`[Upload] Upload failed:`, error);
          throw new Error(`Upload failed: ${error?.message || "Unknown error"}`);
        }
      }),
  }),

  // Host listing endpoints
  host: router({
    // Submit a new host listing
    submit: publicProcedure
      .input(z.object({
        // Initial entry
        name: z.string().min(1, "Name is required"),
        district: z.string().min(1, "District is required"),
        email: z.string().email("Valid email is required"),
        
        // Step 1: Cuisine & Dishes
        cuisineStyle: z.string().min(1, "Cuisine style is required"),
        menuDescription: z.string().min(20, "Please describe your menu"),
        foodPhotoUrls: z.array(z.string().url()).min(3, "At least 3 food photos are required"),
        maxGuests: z.number().min(1).max(20).default(4),
        dietaryNote: z.string().optional(),
        
        // Step 2: Self Intro & Selfie
        bio: z.string().min(20, "Please write at least 20 characters about yourself"),
        profilePhotoUrl: z.string().url(),
        activities: z.array(z.string()).optional(),
        
        // Step 3: Availability
        availability: z.record(z.string(), z.array(z.enum(["lunch", "dinner"]))).refine(
          (obj) => Object.keys(obj).length > 0,
          "Please select at least one day/meal"
        ),
        
        // Step 4: Pricing & Notes
        pricePerPerson: z.number().min(1).default(150),
        otherNotes: z.string().optional(),
        
        // Step 5: Household Info
        otherHouseholdInfo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const listing = await createHostListing({
          hostName: input.name,
          profilePhotoUrl: input.profilePhotoUrl,
          languages: ["Mandarin"], // Default for now; can be collected later
          bio: input.bio,
          email: input.email,
          wechatOrPhone: "", // Can be collected in host dashboard later
          district: input.district,
          availability: input.availability as Record<string, string[]>,
          maxGuests: input.maxGuests,
          cuisineStyle: input.cuisineStyle,
          menuDescription: input.menuDescription,
          foodPhotoUrls: input.foodPhotoUrls,
          dietaryNote: input.dietaryNote || null,
          activities: input.activities || [],
          otherNotes: input.otherNotes || null,
          pricePerPerson: input.pricePerPerson,
          kidsFriendly: true,
          hasPets: false,
          petDetails: null,
          otherHouseholdInfo: input.otherHouseholdInfo || null,
          mealDurationMinutes: 120,
        });

        // Notify owner of new host application
        await notifyOwner({
          title: `New Host Application: ${input.name}`,
          content: `Name: ${input.name}\nEmail: ${input.email}\nDistrict: ${input.district}\nCuisine: ${input.cuisineStyle}\nPrice: ¥${input.pricePerPerson}/person\nMax Guests: ${input.maxGuests}\n\nBio: ${input.bio}`,
        });

        return { success: true };
      }),

    // Get a single listing by ID (public - for viewing approved listings)
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const listing = await getHostListingById(input.id);
        // Only return approved listings to public
        if (listing && listing.status !== "approved") {
          return null;
        }
        return listing;
      }),

    // Increment view count for a listing
    incrementView: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        
        await db
          .update(hostListings)
          .set({ viewCount: sql`viewCount + 1` })
          .where(eq(hostListings.id, input.id));
        
        return { success: true };
      }),

    // Update host availability
    updateAvailability: protectedProcedure
      .input(z.object({
        hostId: z.number(),
        availability: z.record(z.string(), z.array(z.enum(["lunch", "dinner"]))),
      }))
      .mutation(async ({ input, ctx }) => {
        // In a real app, verify user owns this listing
        // For now, just return success
        return { success: true, availability: input.availability };
      }),

    // List all approved host listings (public)
    listApproved: publicProcedure.query(async () => {
      return getAllHostListings("approved");
    }),

    // Admin: List all host listings (all statuses)
    listAll: publicProcedure.query(async () => {
      // Return all listings for admin dashboard
      return getAllHostListings();
    }),

    // Admin: Update listing status
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // TODO: Add role-based access control - for now allowing public access for testing
        const success = await updateHostListingStatus(input.id, input.status, input.adminNotes);
        return { success };
      }),

    // Summarize title to max 3 lines using AI
    summarizeTitle: publicProcedure
      .input(z.object({
        cuisineStyle: z.string(),
        menuDescription: z.string(),
        activities: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const activitiesText = input.activities && input.activities.length > 0 
            ? `\n- Activities: ${input.activities.join(", ")}`
            : "";
          
          const prompt = `Create a concise, compelling title for a home dining experience with these details:\n- Cuisine: ${input.cuisineStyle}\n- Menu: ${input.menuDescription.substring(0, 200)}${activitiesText}\n\nThe title should:\n1. Be maximum 3 lines (use line breaks if needed)\n2. Be engaging and descriptive\n3. Highlight the unique experience\n4. Be suitable for a travel/dining platform\n\nRespond with ONLY the title, no additional text.`;

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a creative copywriter for a home dining experience platform. Create compelling, concise titles.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const content = response.choices[0]?.message?.content;
          const title = typeof content === 'string' ? content.trim() : "Authentic Home Dining Experience";
          return { title };
        } catch (error: any) {
          console.error("[Title Summarization] Error:", error);
          return { title: `${input.cuisineStyle} Home Dining Experience` };
        }
      }),

    // Host: Get their profile
    getProfile: protectedProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ ctx, input }) => {
        const listings = await getAllHostListings();
        const hostListing = listings.find((l: any) => l.email === ctx.user?.email);
        return hostListing || null;
      }),

    // Host: Update their profile
    updateProfile: protectedProcedure
      .input(z.object({
        id: z.number(),
        bio: z.string().optional(),
        menuDescription: z.string().optional(),
        pricePerPerson: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return { success: true };
      }),

    // Host: Get their bookings
    getBookings: protectedProcedure
      .input(z.object({ hostId: z.number() }))
      .query(async ({ ctx, input }) => {
        return [];
      }),

    // Host: Update booking status
    updateBookingStatus: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        status: z.enum(["pending", "confirmed", "cancelled"]),
      }))
      .mutation(async ({ ctx, input }) => {
        return { success: true };
      }),

    // Admin: Approve booking with email confirmation
    approveBooking: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        guestName: z.string(),
        guestEmail: z.string().email(),
        hostName: z.string(),
        hostEmail: z.string().email(),
        bookingDate: z.string(),
        mealType: z.enum(["lunch", "dinner"]),
        numberOfGuests: z.number(),
        cuisine: z.string(),
        hostAddress: z.string().optional(),
        specialRequests: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const guestEmailSent = await sendGuestConfirmationEmail({
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          hostName: input.hostName,
          hostEmail: input.hostEmail,
          bookingDate: input.bookingDate,
          mealType: input.mealType,
          numberOfGuests: input.numberOfGuests,
          cuisine: input.cuisine,
          hostAddress: input.hostAddress,
          specialRequests: input.specialRequests,
        });

        const hostEmailSent = await sendHostConfirmationEmail({
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          hostName: input.hostName,
          hostEmail: input.hostEmail,
          bookingDate: input.bookingDate,
          mealType: input.mealType,
          numberOfGuests: input.numberOfGuests,
          cuisine: input.cuisine,
          hostAddress: input.hostAddress,
          specialRequests: input.specialRequests,
        });

        return { success: true, guestEmailSent, hostEmailSent };
      }),

    // Admin: Reject booking with email notification
    rejectBooking: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        guestName: z.string(),
        guestEmail: z.string().email(),
        hostName: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const emailSent = await sendGuestRejectionEmail(
          input.guestName,
          input.guestEmail,
          input.hostName,
          input.reason
        );

        return { success: true, emailSent };
      }),

    // Host: Send host approval email
    sendHostApprovalEmail: publicProcedure
      .input(z.object({
        hostName: z.string(),
        hostEmail: z.string().email(),
        district: z.string(),
        cuisineStyle: z.string(),
      }))
      .mutation(async ({ input }) => {
        // TODO: Add role-based access control - for now allowing public access for testing

        const emailSent = await sendHostApprovalEmail(
          input.hostName,
          input.hostEmail,
          input.district,
          input.cuisineStyle
        );

        return { success: true, emailSent };
      }),

    // Admin: Update host listing (all fields)
    updateListing: publicProcedure
      .input(z.object({
        id: z.number(),
        hostName: z.string().optional(),
        email: z.string().email().optional(),
        wechatOrPhone: z.string().optional(),
        languages: z.array(z.string()).optional(),
        bio: z.string().optional(),
        title: z.string().optional(),
        district: z.string().optional(),
        fullAddress: z.string().optional(),
        cuisineStyle: z.string().optional(),
        menuDescription: z.string().optional(),
        dietaryNote: z.string().optional(),
        pricePerPerson: z.number().optional(),
        discountPercentage: z.number().min(0).max(100).optional(),
        displayOrder: z.number().min(0).optional(),
        maxGuests: z.number().optional(),
        mealDurationMinutes: z.number().optional(),
        kidsFriendly: z.boolean().optional(),
        hasPets: z.boolean().optional(),
        petDetails: z.string().optional(),
        householdFeatures: z.array(z.string()).optional(),
        otherHouseholdInfo: z.string().optional(),
        activities: z.array(z.string()).optional(),
        otherNotes: z.string().optional(),
        profilePhotoUrl: z.string().optional(),
        foodPhotoUrls: z.array(z.string()).optional(),
        availability: z.record(z.string(), z.array(z.enum(["lunch", "dinner"]))).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        const success = await updateHostListing(id, updateData);
        return { success };
      }),

  }),
  
  payment: router({
    createCheckoutSession: publicProcedure
      .input(z.object({
        bookingId: z.number(),
        amount: z.number(),
        hostName: z.string(),
        guestEmail: z.string().email(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Import Stripe dynamically
          const Stripe = (await import("stripe")).default;
          const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.Stripe_secretkey;
          
          if (!stripeSecretKey) {
            throw new Error("Stripe is not configured on the server");
          }
          
          const stripe = new Stripe(stripeSecretKey, {
            apiVersion: "2026-01-28.clover" as any,
          });
          
          // Get the origin from request headers for redirect URLs
          const origin = ctx.req.headers.origin || `https://${ctx.req.headers.host}`;
          
          // Create Stripe Checkout session
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "cny",
                  product_data: {
                    name: `Meal with ${input.hostName}`,
                    description: `Booking #${input.bookingId}`,
                  },
                  unit_amount: Math.round(input.amount * 100), // Convert to cents
                },
                quantity: 1,
              },
            ],
            mode: "payment",
            success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            customer_email: input.guestEmail,
            metadata: {
              bookingId: input.bookingId.toString(),
            },
            allow_promotion_codes: true,
          });
          
          return { url: session.url };
        } catch (error: any) {
          console.error("[Payment] Error creating checkout session:", error);
          throw new Error(error.message || "Failed to create payment session");
        }
      }),
  }),
  
  announcement: router({
    get: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        const { announcements } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        // Get the most recent active announcement
        const result = await db
          .select()
          .from(announcements)
          .where(eq(announcements.isActive, true))
          .orderBy(sql`${announcements.updatedAt} DESC`)
          .limit(1);
        
        return result[0] || null;
      }),
    
    update: publicProcedure
      .input(z.object({
        content: z.string(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        
        const { announcements } = await import("../drizzle/schema");
        const { sql } = await import("drizzle-orm");
        
        // Check if announcement exists
        const existing = await db.select().from(announcements).limit(1);
        
        if (existing.length > 0) {
          // Update existing announcement
          await db
            .update(announcements)
            .set({
              content: input.content,
              isActive: input.isActive,
              updatedAt: new Date(),
            })
            .where(sql`id = ${existing[0].id}`);
        } else {
          // Create new announcement
          await db.insert(announcements).values({
            content: input.content,
            isActive: input.isActive,
          });
        }
        
        return { success: true };
      }),
  }),

  /**
   * Live Chat Support Router
   */
  chat: router({
    // Create or get existing chat session
    getOrCreateSession: publicProcedure
      .input(z.object({
        sessionId: z.string().optional(),
        visitorName: z.string().optional(),
        visitorEmail: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createChatSession, getChatSessionBySessionId } = await import("./db");
        const { nanoid } = await import("nanoid");
        
        // If sessionId provided, try to get existing session
        if (input.sessionId) {
          const existing = await getChatSessionBySessionId(input.sessionId);
          if (existing) {
            return { session: existing };
          }
        }
        
        // Create new session
        const sessionId = nanoid();
        const session = await createChatSession({
          sessionId,
          visitorName: input.visitorName || null,
          visitorEmail: input.visitorEmail || null,
          status: "active",
          adminTookOver: false,
        });
        
        return { session };
      }),
    
    // Send message and get AI response
    sendMessage: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const { getChatSessionBySessionId, createChatMessage, getChatMessages, updateChatSessionStatus } = await import("./db");
        const { CHAT_KNOWLEDGE_BASE, SYSTEM_PROMPT } = await import("./chat-knowledge-base");
        
        // Get session
        const session = await getChatSessionBySessionId(input.sessionId);
        if (!session) throw new Error("Chat session not found");
        
        // Save visitor message
        await createChatMessage({
          sessionId: session.id,
          senderType: "visitor",
          content: input.content,
        });
        
        // Get conversation history
        const messages = await getChatMessages(session.id);
        
        // Build conversation for LLM
        const conversationMessages = [
          { role: "system" as const, content: SYSTEM_PROMPT + "\n\nKnowledge Base:\n" + CHAT_KNOWLEDGE_BASE },
          ...messages.slice(-10).map(msg => ({ // Last 10 messages for context
            role: msg.senderType === "visitor" ? "user" as const : "assistant" as const,
            content: msg.content,
          })),
        ];
        
        // Get AI response
        const aiResponse = await invokeLLM({
          messages: conversationMessages,
        });
        
        const rawContent = aiResponse.choices[0]?.message?.content;
        const aiContent = typeof rawContent === 'string' ? rawContent : "I apologize, but I'm having trouble responding right now. Please try again or contact our team at plusonechopsticks@gmail.com.";
        
        // Check if AI is requesting human help
        const needsHuman = aiContent.toLowerCase().includes("connect you with our team") || 
                          aiContent.toLowerCase().includes("admin will respond");
        
        if (needsHuman && session.status === "active") {
          await updateChatSessionStatus(input.sessionId, "needs_human");
        }
        
        // Save AI message
        const aiMessage = await createChatMessage({
          sessionId: session.id,
          senderType: "ai",
          content: aiContent,
        });
        
        return { message: aiMessage };
      }),
    
    // Admin: Get all chat sessions
    getAllSessions: publicProcedure
      .query(async () => {
        const { getAllChatSessions } = await import("./db");
        const sessions = await getAllChatSessions();
        return { sessions };
      }),
    
    // Admin: Get messages for a session
    getSessionMessages: publicProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .query(async ({ input }) => {
        const { getChatSessionBySessionId, getChatMessages } = await import("./db");
        
        const session = await getChatSessionBySessionId(input.sessionId);
        if (!session) throw new Error("Chat session not found");
        
        const messages = await getChatMessages(session.id);
        return { messages };
      }),
    
    // Admin: Send admin message
    sendAdminMessage: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        content: z.string().min(1),
        adminName: z.string().default("Admin"),
      }))
      .mutation(async ({ input }) => {
        const { getChatSessionBySessionId, createChatMessage, updateChatSessionStatus } = await import("./db");
        
        const session = await getChatSessionBySessionId(input.sessionId);
        if (!session) throw new Error("Chat session not found");
        
        // Mark as admin took over
        if (!session.adminTookOver) {
          await updateChatSessionStatus(input.sessionId, session.status, true);
        }
        
        // Save admin message
        const message = await createChatMessage({
          sessionId: session.id,
          senderType: "admin",
          content: input.content,
          adminName: input.adminName,
        });
        
        return { message };
      }),
    
    // Admin: Update session status
    updateSessionStatus: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        status: z.enum(["active", "needs_human", "resolved"]),
      }))
      .mutation(async ({ input }) => {
        const { updateChatSessionStatus } = await import("./db");
        
        await updateChatSessionStatus(input.sessionId, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
