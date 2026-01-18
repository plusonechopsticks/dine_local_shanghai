import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createInterestSubmission, getAllInterestSubmissions } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
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
});

export type AppRouter = typeof appRouter;
