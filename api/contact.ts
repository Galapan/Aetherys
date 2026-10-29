// Vercel Function: receives the contact form and forwards it to the Aetherys inbox through
// Resend's REST API. The key lives only in the RESEND_API_KEY environment variable.

// Kept in sync with menuContact.email (src/content/navigation.ts); the function cannot use
// the app's '@/' path alias, so the address is repeated here as the default.
const DEFAULT_TO = 'aetherys.dev@gmail.com'
// Without a verified domain Resend only delivers from this sender to the account owner.
const DEFAULT_FROM = 'Aetherys Web <onboarding@resend.dev>'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9 ()-]{8,20}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_ATTEMPTS = 3

const LIMITS = { name: 200, email: 200, phone: 20, type: 100, message: 5000 } as const

type Field = keyof typeof LIMITS

const reply = (status: number, ok: boolean) => Response.json({ ok }, { status })

export async function POST(request: Request): Promise<Response> {
  let parsed: unknown
  try {
    parsed = await request.json()
  } catch {
    return reply(400, false)
  }
  if (!parsed || typeof parsed !== 'object') return reply(400, false)
  const body = parsed as Record<string, unknown>

  // Honeypot: bots fill every input; pretend success so they do not retry.
  if (typeof body.website === 'string' && body.website.trim()) return reply(200, true)

  const read = (key: Field) => (typeof body[key] === 'string' ? (body[key] as string).trim() : '')
  const fields = {
    name: read('name'),
    email: read('email'),
    phone: read('phone'),
    type: read('type'),
    message: read('message'),
  }
  const tooLong = (Object.keys(LIMITS) as Field[]).some((key) => fields[key].length > LIMITS[key])
  if (
    tooLong ||
    !fields.name ||
    !fields.message ||
    !EMAIL_PATTERN.test(fields.email) ||
    !PHONE_PATTERN.test(fields.phone)
  ) {
    return reply(400, false)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('contact: RESEND_API_KEY is not set')
    return reply(500, false)
  }

  const text = [
    `Nombre: ${fields.name}`,
    `Correo: ${fields.email}`,
    `Teléfono: ${fields.phone}`,
    `Tipo de proyecto: ${fields.type || '—'}`,
    '',
    fields.message,
  ].join('\n')

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
  // One key per form fill (sent by the page), so a double submit or a retry sends one email.
  if (typeof body.requestId === 'string' && UUID_PATTERN.test(body.requestId)) {
    headers['Idempotency-Key'] = `contact/${body.requestId}`
  }
  const payload = JSON.stringify({
    from: process.env.CONTACT_FROM || DEFAULT_FROM,
    to: [process.env.CONTACT_TO || DEFAULT_TO],
    reply_to: fields.email,
    subject: ['Nuevo proyecto', fields.type, fields.name].filter(Boolean).join(' — '),
    text,
  })

  // Retry rate limits, server errors and network failures with a short backoff.
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)))
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: payload,
      })
      if (response.ok) return reply(200, true)
      console.error(`contact: Resend responded ${response.status}`)
      if (response.status !== 429 && response.status < 500) break
    } catch (error) {
      console.error('contact: Resend request failed', error)
    }
  }
  return reply(502, false)
}
