// Single source of truth for company / brand contact information.
// Update values here — Footer, Contact page, Safety, Careers, etc. all read from this file.

export const COMPANY = {
  brand: 'Naploo',
  legalName: 'BIDUA Industries Pvt Ltd',
  tagline: 'A BIDUA Industries Product',
  gstin: '09AANCB0882D1ZM',
} as const;

export const EMAILS = {
  primary: 'biduaindustries@gmail.com',
  support: 'support@biduapods.com',
  careers: 'support@biduapods.com',
  partner: 'support@biduapods.com',
  investor: 'biduaindustries@gmail.com',
} as const;

export const PHONES = {
  primary: '+91 95129 21903',
  primaryRaw: '+919512921903',
  support: '+91 95129 21903',
  supportRaw: '+919512921903',
} as const;

export const ADDRESS = {
  line1: 'Suite 209, C-104, Sector 65',
  line2: 'Noida, Uttar Pradesh 201301, India',
  city: 'Noida',
  state: 'Uttar Pradesh',
  pincode: '201301',
  country: 'India',
  full: 'Suite 209, C-104, Sector 65, Noida, Uttar Pradesh 201301, India',
} as const;

export const OFFICES = [
  {
    name: 'Naploo HQ — Noida',
    address: 'Suite 209, C-104, Sector 65, Noida, Uttar Pradesh 201301',
    phone: PHONES.primary,
    phoneRaw: PHONES.primaryRaw,
    email: EMAILS.support,
  },
] as const;

export const SOCIAL = {
  // Add real handles here when ready.
} as const;
