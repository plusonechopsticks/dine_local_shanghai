import { relations } from "drizzle-orm/relations";
import { hostListings, blockedDates, bookings, chatSessions, chatMessages, guestTestimonials, hostAccounts, hostAvailabilityBlocks, payments } from "./schema";

export const blockedDatesRelations = relations(blockedDates, ({one}) => ({
	hostListing: one(hostListings, {
		fields: [blockedDates.hostListingId],
		references: [hostListings.id]
	}),
}));

export const hostListingsRelations = relations(hostListings, ({many}) => ({
	blockedDates: many(blockedDates),
	bookings: many(bookings),
	guestTestimonials: many(guestTestimonials),
	hostAccounts: many(hostAccounts),
	hostAvailabilityBlocks: many(hostAvailabilityBlocks),
	payments: many(payments),
}));

export const bookingsRelations = relations(bookings, ({one, many}) => ({
	hostListing: one(hostListings, {
		fields: [bookings.hostListingId],
		references: [hostListings.id]
	}),
	payments: many(payments),
}));

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	chatSession: one(chatSessions, {
		fields: [chatMessages.sessionId],
		references: [chatSessions.id]
	}),
}));

export const chatSessionsRelations = relations(chatSessions, ({many}) => ({
	chatMessages: many(chatMessages),
}));

export const guestTestimonialsRelations = relations(guestTestimonials, ({one}) => ({
	hostListing: one(hostListings, {
		fields: [guestTestimonials.hostListingId],
		references: [hostListings.id]
	}),
}));

export const hostAccountsRelations = relations(hostAccounts, ({one}) => ({
	hostListing: one(hostListings, {
		fields: [hostAccounts.hostListingId],
		references: [hostListings.id]
	}),
}));

export const hostAvailabilityBlocksRelations = relations(hostAvailabilityBlocks, ({one}) => ({
	hostListing: one(hostListings, {
		fields: [hostAvailabilityBlocks.hostListingId],
		references: [hostListings.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	booking: one(bookings, {
		fields: [payments.bookingId],
		references: [bookings.id]
	}),
	hostListing: one(hostListings, {
		fields: [payments.hostListingId],
		references: [hostListings.id]
	}),
}));