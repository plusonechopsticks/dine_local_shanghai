import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { sendEmail } from "../email";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  sendTestEmail: publicProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string().min(1),
        html: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await sendEmail({
          to: input.to,
          subject: input.subject,
          html: input.html,
        });
        return { success: result };
      } catch (error) {
        console.error("[Test Email] Error:", error);
        return { success: false, error: String(error) };
      }
    }),
});
