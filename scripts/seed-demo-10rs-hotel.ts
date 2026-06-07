/**
 * Seed a single public demo property with a ₹10 pod so anyone can test
 * a real end-to-end Cashfree payment without spending real money.
 *
 * Idempotent: if the demo partner already exists (matched by businessName +
 * city), the script updates the hourly rate to ₹10 instead of creating
 * duplicates.
 *
 * Run with:
 *   cd /home/awsclint/Naploo
 *   DATABASE_URL="postgresql://naploo:Naploo@2026Secure@127.0.0.1:5432/naploo_db" \
 *     bun run scripts/seed-demo-10rs-hotel.ts
 */
import { and, eq } from 'drizzle-orm';
import { db } from '../packages/db/src/client';
import { users } from '../packages/db/src/schema/users';
import { partners } from '../packages/db/src/schema/partners';
import { podSets, pods } from '../packages/db/src/schema/pods';

const DEMO_BUSINESS = 'Naploo Demo Pod (₹10 Test)';
const DEMO_CITY = 'Bangalore';
const DEMO_USER_EMAIL = 'demo-pod@naploo.com';
const DEMO_USER_PHONE = '+919000000010';

async function main() {
  console.log('🌱 Seeding ₹10 demo pod hotel...');

  // 1. owner user (partner role) — find or create
  let [owner] = await db.select().from(users).where(eq(users.email, DEMO_USER_EMAIL));
  if (!owner) {
    [owner] = await db
      .insert(users)
      .values({
        phone: DEMO_USER_PHONE,
        email: DEMO_USER_EMAIL,
        firstName: 'Naploo',
        lastName: 'Demo',
        role: 'partner',
        status: 'active',
      })
      .returning();
    console.log('✅ Created demo owner user', owner.id);
  } else {
    console.log('ℹ️  Reusing demo owner user', owner.id);
  }

  // 2. partner / hotel
  let [partner] = await db
    .select()
    .from(partners)
    .where(and(eq(partners.businessName, DEMO_BUSINESS), eq(partners.city, DEMO_CITY)));
  if (!partner) {
    [partner] = await db
      .insert(partners)
      .values({
        userId: owner.id,
        businessName: DEMO_BUSINESS,
        businessType: 'hotel',
        partnershipModel: 'without_investment',
        address: '1 Demo Street, MG Road',
        city: DEMO_CITY,
        state: 'Karnataka',
        pincode: '560001',
        contactPerson: 'Naploo Demo',
        contactPhone: DEMO_USER_PHONE,
        contactEmail: DEMO_USER_EMAIL,
        status: 'active',
        description:
          'Public ₹10 test property. Book the pod to run an end-to-end real Cashfree payment.',
        rating: '5.0',
        totalReviews: 1,
      })
      .returning();
    console.log('✅ Created demo partner', partner.id);
  } else {
    console.log('ℹ️  Reusing demo partner', partner.id);
  }

  // 3. one pod set @ ₹10/hour with two pods (upper + lower)
  let [set] = await db.select().from(podSets).where(eq(podSets.partnerId, partner.id));
  if (!set) {
    [set] = await db
      .insert(podSets)
      .values({
        partnerId: partner.id,
        floor: 1,
        section: 'A',
        setNumber: 'DEMO-1',
        hourlyRate: '10',
        ownership: 'naploo',
        isActive: true,
      })
      .returning();
    console.log('✅ Created demo pod set', set.id);

    await db.insert(pods).values([
      {
        podSetId: set.id,
        podNumber: 'DEMO-1U',
        position: 'upper',
        podType: 'single',
        status: 'available',
      },
      {
        podSetId: set.id,
        podNumber: 'DEMO-1L',
        position: 'lower',
        podType: 'single',
        status: 'available',
      },
    ]);
    console.log('✅ Created 2 pods inside set');
  } else {
    await db
      .update(podSets)
      .set({ hourlyRate: '10', isActive: true })
      .where(eq(podSets.id, set.id));
    console.log('ℹ️  Reusing demo pod set — forced hourlyRate=₹10');
  }

  console.log('\n🎉 Done. Customers will see this in the property list under', DEMO_CITY);
  console.log('   Partner ID:', partner.id);
  console.log('   Hourly rate: ₹10');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
