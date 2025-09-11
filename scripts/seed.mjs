import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { 'X-Client-Info': 'seed-script' } },
})

function iso(date) {
  return new Date(date).toISOString()
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

async function insertOne(table, payload, returning = 'id') {
  const { data, error } = await supabase.from(table).insert(payload).select(returning).single()
  if (error) throw new Error(`${table} insert failed: ${error.message}`)
  return data
}

async function seed(userId) {
  const now = new Date()
  const year = now.getFullYear()

  // Make invoice numbers unique by starting after current count
  let invoiceCounter = 1
  try {
    const { count } = await supabase
      .from('funeral_final_invoices')
      .select('id', { count: 'exact', head: true })
      .like('invoice_number', `INV-${year}-%`)
    if (typeof count === 'number' && count > 0) invoiceCounter = count + 1
  } catch (_) {}

  const dataset = [
    {
      deceased: {
        first_names: 'Johannes', preferred_name: 'Jan', last_name: 'de Vries', gender: 'male',
        date_of_birth: '1952-03-11', date_of_death: iso(addDays(now, -12)), street: 'Kerkstraat', house_number: '12', postal_code: '1011 AB', city: 'Amsterdam',
      },
      client: { preferred_name: 'Anja', last_name: 'de Vries', gender: 'female', phone_number: '0612345678', street: 'Kerkstraat', house_number: '12', postal_code: '1011 AB', city: 'Amsterdam' },
      contacts: [
        { preferred_name: 'Karel', last_name: 'de Vries', relation: 'Zoon' },
      ],
      funeral: { location: 'Uitvaartcentrum Amstel', signing_date: iso(addDays(now, -10)), funeral_director: 'P. Janssen' },
      completed: true,
    },
    {
      deceased: {
        first_names: 'Maria', preferred_name: 'Mia', last_name: 'Jansen', gender: 'female',
        date_of_birth: '1948-07-22', date_of_death: iso(addDays(now, -25)), street: 'Lindelaan', house_number: '8', postal_code: '3021 CD', city: 'Rotterdam',
      },
      client: { preferred_name: 'Kees', last_name: 'Jansen', gender: 'male', phone_number: '0611223344', street: 'Lindelaan', house_number: '8', postal_code: '3021 CD', city: 'Rotterdam' },
      contacts: [
        { preferred_name: 'Sanne', last_name: 'Jansen', relation: 'Dochter' },
      ],
      funeral: { location: 'Crematorium Hofwijk', signing_date: iso(addDays(now, -23)), funeral_director: 'L. Bakker' },
      completed: true,
    },
    {
      deceased: {
        first_names: 'Pieter', preferred_name: 'Piet', last_name: 'van den Berg', gender: 'male',
        date_of_birth: '1960-01-05', date_of_death: iso(addDays(now, -5)), street: 'Dorpsstraat', house_number: '99', postal_code: '5611 EF', city: 'Eindhoven',
      },
      client: { preferred_name: 'Els', last_name: 'van den Berg', gender: 'female', phone_number: '0687654321', street: 'Dorpsstraat', house_number: '99', postal_code: '5611 EF', city: 'Eindhoven' },
      contacts: [
        { preferred_name: 'Marieke', last_name: 'van den Berg', relation: 'Dochter' },
      ],
      funeral: { location: 'Crematorium Rijtackers', signing_date: iso(addDays(now, -3)), funeral_director: 'S. de Wit' },
      completed: true,
    },
  ]

  for (const entry of dataset) {
    const deceased = await insertOne('deceased', { entrepreneur_id: userId, ...entry.deceased })

    const primaryClient = await insertOne('clients', { entrepreneur_id: userId, ...entry.client })

    const funeral = await insertOne('funerals', {
      entrepreneur_id: userId,
      deceased_id: deceased.id,
      client_id: primaryClient.id,
      ...entry.funeral,
    }, 'id')

    // Link primary client as contact
    await insertOne('funeral_contacts', {
      entrepreneur_id: userId,
      funeral_id: funeral.id,
      client_id: primaryClient.id,
      relation: 'Partner',
      is_primary: true,
    }, 'id')

    // Optional extra contacts
    for (const c of (entry.contacts ?? [])) {
      const extraClient = await insertOne('clients', {
        entrepreneur_id: userId,
        preferred_name: c.preferred_name,
        last_name: c.last_name,
        gender: null, phone_number: null, street: null, house_number: null, postal_code: null, city: null,
      })
      await insertOne('funeral_contacts', {
        entrepreneur_id: userId,
        funeral_id: funeral.id,
        client_id: extraClient.id,
        relation: c.relation ?? null,
        is_primary: false,
      }, 'id')
    }

    if (entry.completed) {
      const invoiceNumber = `INV-${year}-${String(invoiceCounter++).padStart(5, '0')}`
      const invoice = await insertOne('funeral_final_invoices', {
        entrepreneur_id: userId,
        funeral_id: funeral.id,
        invoice_number: invoiceNumber,
        issue_date: iso(addDays(now, -1)),
        due_date: iso(addDays(now, 13)),
        total_amount: 0,
      }, 'id')

      const items = [
        { product_name: 'Kist eikenhout', unit_price: 95000, quantity: 1 },
        { product_name: 'Rouwkaarten (50 st.)', unit_price: 12000, quantity: 1 },
        { product_name: 'Bloemstuk', unit_price: 8500, quantity: 1 },
        { product_name: 'Crematoriumkosten', unit_price: 65000, quantity: 1 },
      ]
      let total = 0
      for (const it of items) {
        const lineTotal = (it.unit_price * (it.quantity ?? 1))
        total += lineTotal
        await insertOne('funeral_invoice_items', {
          invoice_id: invoice.id,
          product_name: it.product_name,
          unit_price: it.unit_price,
          quantity: it.quantity,
        })
      }
      await supabase
        .from('funeral_final_invoices')
        .update({ total_amount: total, updated_at: iso(new Date()) })
        .eq('id', invoice.id)
    }
  }

  console.log('Seed complete: funerals with contacts created')
}

const userId = process.argv[2]
if (!userId) {
  console.error('Usage: node scripts/seed.mjs <user-id>')
  process.exit(1)
}

seed(userId)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })


