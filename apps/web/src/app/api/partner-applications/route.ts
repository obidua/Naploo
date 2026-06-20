import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'partner-applications.json');
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'naploo-admin-2026';

export type PartnerApplicationStatus =
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'rejected';

export type PropertyOfferMode = 'percentage' | 'fixed' | 'hybrid';

export interface PropertyOfferDetails {
  // Inputs
  pods: number;
  occupancyHours: number;
  hourlyRate: number;
  investorSharePct: number;   // typically 60
  naplooGrossSharePct: number; // typically 40
  operatingCostPct: number;   // typically 10
  offerMode: PropertyOfferMode;
  propertyPct?: number;       // for 'percentage' mode (% of GROSS revenue)
  fixedRent?: number;         // for 'fixed' mode (₹/month)
  hybridBase?: number;        // for 'hybrid' mode (₹/month base)
  hybridPct?: number;         // for 'hybrid' mode (% of GROSS revenue)
  // Computed snapshot
  monthlyGrossRevenue: number;
  monthlyInvestorPayout: number;
  monthlyNaplooGross: number;
  monthlyOperatingCost: number;
  monthlyPropertyPayout: number;
  monthlyNaplooNet: number;
  naplooMarginPct: number;
  yearlyNaplooNet: number;
  verdict: 'profitable' | 'tight' | 'loss';
  // Meta
  notes?: string;
  savedBy?: string;
  savedAt: string;
}

export interface PartnerApplication {
  id: string;
  applicationNumber: string;
  status: PartnerApplicationStatus;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Contact
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  // Property
  propertyName: string;
  propertyType: string;
  ownershipStatus: string;
  yearEstablished?: string;
  totalRooms?: string;
  starRating?: string;
  // Location
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  googleMapsUrl?: string;
  // Space
  availableSpaceSqft: string;
  spaceLocation: string; // lobby/rooftop/basement/etc
  estimatedPods?: string;
  powerBackup?: string;
  hasWifi?: boolean;
  hasAc?: boolean;
  hasWashroom?: boolean;
  hasParking?: boolean;
  has24x7Access?: boolean;
  hasSecurity?: boolean;
  // Footfall & ops
  monthlyFootfall?: string;
  primaryGuestType?: string;
  peakSeason?: string;
  nearbyTransit?: string;
  // Commercial
  preferredModel?: string; // self-operate | naploo-lease | hybrid
  expectedRevenueShare?: string;
  gstNumber?: string;
  panNumber?: string;
  // Misc
  message?: string;
  howDidYouHear?: string;
  consent: boolean;
  // Meta
  ip?: string;
  userAgent?: string;
  // Internal — admin deal offer (set via PATCH from Deal Calculator)
  offerDetails?: PropertyOfferDetails;
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

async function readAll(): Promise<PartnerApplication[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(list: PartnerApplication[]) {
  await ensureFile();
  const tmp = DATA_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), 'utf8');
  await fs.rename(tmp, DATA_FILE);
}

function isAuthorized(req: NextRequest): boolean {
  const key =
    req.headers.get('x-admin-key') ||
    req.nextUrl.searchParams.get('key') ||
    '';
  return key === ADMIN_KEY;
}

function genApplicationNumber(): string {
  const ts = new Date();
  const yy = String(ts.getFullYear()).slice(-2);
  const mm = String(ts.getMonth() + 1).padStart(2, '0');
  const rnd = randomBytes(2).toString('hex').toUpperCase();
  return `NPL-PR-${yy}${mm}-${rnd}`;
}

function asStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function asBool(v: unknown): boolean {
  return v === true || v === 'true' || v === 'on' || v === 1 || v === '1';
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Required fields
  const required: Array<[string, string]> = [
    ['fullName', 'Full name'],
    ['email', 'Email'],
    ['phone', 'Phone'],
    ['propertyName', 'Property name'],
    ['propertyType', 'Property type'],
    ['ownershipStatus', 'Ownership status'],
    ['addressLine1', 'Address'],
    ['city', 'City'],
    ['state', 'State'],
    ['pincode', 'Pincode'],
    ['availableSpaceSqft', 'Available space'],
    ['spaceLocation', 'Space location'],
  ];
  const missing = required.filter(([k]) => !asStr(body[k])).map(([, label]) => label);
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    );
  }
  if (!asBool(body.consent)) {
    return NextResponse.json(
      { error: 'Please accept the terms before submitting.' },
      { status: 400 }
    );
  }

  // Basic email/phone sanity
  const email = asStr(body.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }
  const phone = asStr(body.phone).replace(/[^\d+]/g, '');
  if (phone.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const application: PartnerApplication = {
    id: randomBytes(8).toString('hex'),
    applicationNumber: genApplicationNumber(),
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
    fullName: asStr(body.fullName),
    email,
    phone,
    whatsapp: asStr(body.whatsapp),
    propertyName: asStr(body.propertyName),
    propertyType: asStr(body.propertyType),
    ownershipStatus: asStr(body.ownershipStatus),
    yearEstablished: asStr(body.yearEstablished),
    totalRooms: asStr(body.totalRooms),
    starRating: asStr(body.starRating),
    addressLine1: asStr(body.addressLine1),
    addressLine2: asStr(body.addressLine2),
    city: asStr(body.city),
    state: asStr(body.state),
    pincode: asStr(body.pincode),
    landmark: asStr(body.landmark),
    googleMapsUrl: asStr(body.googleMapsUrl),
    availableSpaceSqft: asStr(body.availableSpaceSqft),
    spaceLocation: asStr(body.spaceLocation),
    estimatedPods: asStr(body.estimatedPods),
    powerBackup: asStr(body.powerBackup),
    hasWifi: asBool(body.hasWifi),
    hasAc: asBool(body.hasAc),
    hasWashroom: asBool(body.hasWashroom),
    hasParking: asBool(body.hasParking),
    has24x7Access: asBool(body.has24x7Access),
    hasSecurity: asBool(body.hasSecurity),
    monthlyFootfall: asStr(body.monthlyFootfall),
    primaryGuestType: asStr(body.primaryGuestType),
    peakSeason: asStr(body.peakSeason),
    nearbyTransit: asStr(body.nearbyTransit),
    preferredModel: asStr(body.preferredModel),
    expectedRevenueShare: asStr(body.expectedRevenueShare),
    gstNumber: asStr(body.gstNumber),
    panNumber: asStr(body.panNumber),
    message: asStr(body.message),
    howDidYouHear: asStr(body.howDidYouHear),
    consent: true,
    ip:
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  };

  const list = await readAll();
  list.push(application);
  await writeAll(list);

  return NextResponse.json(
    {
      ok: true,
      applicationNumber: application.applicationNumber,
      id: application.id,
    },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const list = await readAll();
  list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ applications: list });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const id = asStr(body.id);
  if (!id) {
    return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  }
  const list = await readAll();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
  }

  const allowedStatus: PartnerApplicationStatus[] = [
    'submitted',
    'under-review',
    'approved',
    'rejected',
  ];
  const updates: Partial<PartnerApplication> = {
    updatedAt: new Date().toISOString(),
  };

  // Optional status change
  const status = asStr(body.status) as PartnerApplicationStatus;
  if (status) {
    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value.' },
        { status: 400 }
      );
    }
    updates.status = status;
  }

  // Optional review notes
  const reviewNotes = asStr(body.reviewNotes);
  if (reviewNotes) updates.reviewNotes = reviewNotes;

  // Optional offer details — full replacement, snapshot from Deal Calculator
  if (body.offerDetails && typeof body.offerDetails === 'object') {
    const o = body.offerDetails as Record<string, unknown>;
    const num = (v: unknown, fallback = 0) => {
      const n = typeof v === 'number' ? v : parseFloat(String(v));
      return Number.isFinite(n) ? n : fallback;
    };
    const mode = asStr(o.offerMode) as PropertyOfferMode;
    const allowedMode: PropertyOfferMode[] = ['percentage', 'fixed', 'hybrid'];
    if (!allowedMode.includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid offerMode.' },
        { status: 400 }
      );
    }
    const verdict = asStr(o.verdict) as 'profitable' | 'tight' | 'loss';
    updates.offerDetails = {
      pods: num(o.pods),
      occupancyHours: num(o.occupancyHours),
      hourlyRate: num(o.hourlyRate),
      investorSharePct: num(o.investorSharePct, 60),
      naplooGrossSharePct: num(o.naplooGrossSharePct, 40),
      operatingCostPct: num(o.operatingCostPct, 10),
      offerMode: mode,
      propertyPct: o.propertyPct != null ? num(o.propertyPct) : undefined,
      fixedRent: o.fixedRent != null ? num(o.fixedRent) : undefined,
      hybridBase: o.hybridBase != null ? num(o.hybridBase) : undefined,
      hybridPct: o.hybridPct != null ? num(o.hybridPct) : undefined,
      monthlyGrossRevenue: num(o.monthlyGrossRevenue),
      monthlyInvestorPayout: num(o.monthlyInvestorPayout),
      monthlyNaplooGross: num(o.monthlyNaplooGross),
      monthlyOperatingCost: num(o.monthlyOperatingCost),
      monthlyPropertyPayout: num(o.monthlyPropertyPayout),
      monthlyNaplooNet: num(o.monthlyNaplooNet),
      naplooMarginPct: num(o.naplooMarginPct),
      yearlyNaplooNet: num(o.yearlyNaplooNet),
      verdict: ['profitable', 'tight', 'loss'].includes(verdict) ? verdict : 'tight',
      notes: asStr(o.notes) || undefined,
      savedBy: asStr(o.savedBy) || undefined,
      savedAt: new Date().toISOString(),
    };
  }

  if (
    updates.status === undefined &&
    updates.reviewNotes === undefined &&
    updates.offerDetails === undefined
  ) {
    return NextResponse.json(
      { error: 'No updatable fields provided (status, reviewNotes, or offerDetails).' },
      { status: 400 }
    );
  }

  list[idx] = { ...list[idx], ...updates };
  await writeAll(list);
  return NextResponse.json({ ok: true, application: list[idx] });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) {
    return NextResponse.json({ error: 'id query param required.' }, { status: 400 });
  }
  const list = await readAll();
  const next = list.filter((a) => a.id !== id);
  if (next.length === list.length) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
  }
  await writeAll(next);
  return NextResponse.json({ ok: true });
}
