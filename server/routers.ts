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
import { sendGuestConfirmationEmail, sendHostConfirmationEmail, sendGuestRejectionEmail, sendHostApprovalEmail } from "./email";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import { ENV } from "./_core/env";
const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2026-01-28.clover" as any,
});

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

        // Send notification to owner
        await notifyOwner({
          title: `New Booking Request from ${input.guestName}`,
          content: `Guest: ${input.guestName}\nEmail: ${input.guestEmail}\nDate: ${input.requestedDate}\nMeal: ${input.mealType}\nGuests: ${input.numberOfGuests}\nSpecial Requests: ${input.specialRequests || "None"}`,
        });
        return { success: true };
      }),

    listAll: publicProcedure.query(async () => {
      return await getAllBookings();
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
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        return [];
      }
      return getAllInterestSubmissions();
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
    // Create payment intent for booking
    createPaymentIntent: publicProcedure
      .input(z.object({
        bookingId: z.number(),
        hostListingId: z.number(),
        guestEmail: z.string().email(),
        amountInCents: z.number().min(1), // Amount in cents
      }))
      .mutation(async ({ input }) => {
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: input.amountInCents,
            currency: "cny",
            metadata: {
              bookingId: input.bookingId.toString(),
              hostListingId: input.hostListingId.toString(),
              guestEmail: input.guestEmail,
            },
          });

          // Store payment record in database
          const db = await getDb();
          if (!db) throw new Error("Database connection failed");

          const { payments } = await import("../drizzle/schema");
          await db.insert(payments).values({
            bookingId: input.bookingId,
            stripePaymentIntentId: paymentIntent.id,
            stripeClientSecret: paymentIntent.client_secret || "",
            amountInCents: input.amountInCents,
            currency: "cny",
            status: "pending",
            hostListingId: input.hostListingId,
            guestEmail: input.guestEmail,
          });

          return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          };
        } catch (error: any) {
          console.error("[Stripe] Payment intent creation failed:", error);
          throw new Error("Failed to create payment intent");
        }
      }),

    // Confirm payment status
    confirmPayment: publicProcedure
      .input(z.object({
        paymentIntentId: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);
          return {
            status: paymentIntent.status,
            succeeded: paymentIntent.status === "succeeded",
          };
        } catch (error: any) {
          console.error("[Stripe] Payment confirmation failed:", error);
          throw new Error("Failed to confirm payment");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
