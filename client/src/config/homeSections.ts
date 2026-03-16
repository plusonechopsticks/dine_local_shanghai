/**
 * Homepage Section Configuration
 * 
 * This file defines the order and visibility of sections on the homepage.
 * To reorder sections, simply change the order in the SECTIONS array below.
 * To hide a section, set enabled: false
 * 
 * REORDERING EXAMPLE:
 * If you want Featured Hosts before Brand Story, change:
 * 
 * FROM:
 * export const SECTIONS = [
 *   { id: 'hero', enabled: true },
 *   { id: 'brand-story', enabled: true },
 *   { id: 'featured-hosts', enabled: true },
 *   ...
 * ];
 * 
 * TO:
 * export const SECTIONS = [
 *   { id: 'hero', enabled: true },
 *   { id: 'featured-hosts', enabled: true },  // Moved up
 *   { id: 'brand-story', enabled: true },     // Moved down
 *   ...
 * ];
 */

export const SECTIONS = [
  { id: 'hero', enabled: true },
  { id: 'brand-story', enabled: true },
  { id: 'featured-hosts', enabled: true },
  { id: 'how-it-works', enabled: true },
  { id: 'faq', enabled: true },
  { id: 'become-host', enabled: true },
  { id: 'about-us', enabled: true },
  { id: 'newsletter', enabled: true },
] as const;

export type SectionId = typeof SECTIONS[number]['id'];

/**
 * Section Metadata
 * Provides additional info about each section for documentation
 */
export const SECTION_METADATA: Record<SectionId, { name: string; description: string }> = {
  'hero': {
    name: 'Hero Carousel',
    description: 'Full-screen hero with image carousel and CTA'
  },
  'brand-story': {
    name: 'Brand Identity & Story',
    description: 'Brand intro text + feature cards (🍲🏠💬)'
  },
  'featured-hosts': {
    name: 'Featured Hosts',
    description: 'Featured hosts 3-column grid + "Browse All" CTA'
  },
  'how-it-works': {
    name: 'How It Works',
    description: '4-step process visualization'
  },
  'faq': {
    name: 'FAQ Accordions',
    description: 'Collapsible Q&A organized by category'
  },
  'become-host': {
    name: 'Become a Host',
    description: 'Red CTA section with host benefits'
  },
  'about-us': {
    name: 'About Us',
    description: "Steven's bio with gallery images"
  },
  'newsletter': {
    name: 'Newsletter',
    description: 'Email signup section'
  },
};
