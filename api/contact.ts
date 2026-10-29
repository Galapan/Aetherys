// Vercel Function: receives the contact form and forwards it to the Aetherys inbox through
// Resend's REST API. The key lives only in the RESEND_API_KEY environment variable.

// Kept in sync with menuContact.email (src/content/navigation.ts); the function cannot use
// the app's '@/' path alias, so the address is repeated here as the default.
const DEFAULT_TO = 'aetherys.dev@gmail.com'
const SITE_URL = 'https://aetherys.vercel.app'
// Without a verified domain Resend only delivers from this sender to the account owner.
const DEFAULT_FROM = 'Aetherys <onboarding@resend.dev>'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9 ()-]{8,20}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_ATTEMPTS = 3

const LIMITS = { name: 200, email: 200, phone: 20, type: 100, message: 5000 } as const

type Field = keyof typeof LIMITS
type Fields = Record<Field, string>

const reply = (status: number, ok: boolean) => Response.json({ ok }, { status })

// Brand tokens, plus their mixes precomputed as hex: email clients lack color-mix().
const COLOR = {
  graphite: '#101014',
  darkGray: '#1B1B23',
  burgundy: '#800020',
  warmWhite: '#F4F1F6',
  canvas: '#E6E3E8', // warm white with 10% graphite
  card: '#EDEAEF', // warm white with 4% graphite
  muted: '#6E6C72', // graphite at 62% on warm white
  bannerMuted: '#B8B5BA', // warm white at 72% on graphite
  rule: '#D3D0D5', // graphite at 14% on warm white
}
const FONT = "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
  }).format(date)

const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`

const rule = (width: number, height: number) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="${width}" height="${height}" bgcolor="${COLOR.burgundy}" style="width:${width}px;height:${height}px;background-color:${COLOR.burgundy};font-size:0;line-height:0">&nbsp;</td></tr></table>`

const label = (text: string) =>
  `<p style="margin:0 0 4px 0;font-size:11px;line-height:1.4;letter-spacing:2px;text-transform:uppercase;color:${COLOR.muted}">${text}</p>`

// Card with the burgundy edge used for both the details and the message.
const card = (content: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${COLOR.card}" style="background-color:${COLOR.card};border-left:4px solid ${COLOR.burgundy};border-radius:6px;padding:20px 24px">${content}</td></tr></table>`

const detailRow = (name: string, value: string, last = false) =>
  `<tr><td style="padding:12px 0;${last ? '' : `border-bottom:1px solid ${COLOR.rule};`}">${label(name)}<p style="margin:0;font-size:15px;line-height:1.5;color:${COLOR.darkGray}">${value}</p></td></tr>`

// "Bulletproof" button: padding and background live on the cell so Outlook keeps them.
const button = (href: string, text: string, primary: boolean) =>
  primary
    ? `<td bgcolor="${COLOR.burgundy}" style="background-color:${COLOR.burgundy};border-radius:4px;padding:13px 24px"><a href="${href}" style="color:${COLOR.warmWhite};font-size:14px;font-weight:600;letter-spacing:0.5px;text-decoration:none">${text}</a></td>`
    : `<td style="border:1px solid ${COLOR.graphite};border-radius:4px;padding:12px 23px"><a href="${href}" style="color:${COLOR.graphite};font-size:14px;font-weight:600;letter-spacing:0.5px;text-decoration:none">${text}</a></td>`

/** Branded HTML for the request notification; every visitor value is escaped. */
export function renderEmail(fields: Fields, receivedAt: Date): string {
  const name = escapeHtml(fields.name)
  const email = escapeHtml(fields.email)
  const phone = escapeHtml(fields.phone)
  const type = escapeHtml(fields.type || 'Sin tipo especificado')
  const message = escapeHtml(fields.message).replace(/\r?\n/g, '<br>')
  const firstName = escapeHtml(fields.name.split(/\s+/)[0])
  const replyHref = escapeHtml(
    `mailto:${fields.email}?subject=${encodeURIComponent(
      ['Re: Nuevo proyecto', fields.type].filter(Boolean).join(' — '),
    )}`,
  )
  const link = (href: string, text: string, color: string = COLOR.burgundy) =>
    `<a href="${href}" style="color:${color};text-decoration:none">${text}</a>`

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Nueva solicitud de ${name}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR.canvas}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${name} · ${type} · ${phone}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.canvas}" style="background-color:${COLOR.canvas}">
<tr><td align="center" style="padding:24px 12px;font-family:${FONT}">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${COLOR.warmWhite};border-radius:8px;overflow:hidden">
  <tr>
    <td bgcolor="${COLOR.graphite}" style="background-color:${COLOR.graphite};padding:32px 40px">
      <p style="margin:0;font-size:28px;line-height:1.1;font-weight:600;letter-spacing:-0.5px">${link(SITE_URL, 'Aetherys', COLOR.warmWhite)}<span style="color:${COLOR.burgundy}">.</span></p>
      <p style="margin:8px 0 16px 0;font-size:11px;line-height:1.4;letter-spacing:2px;color:${COLOR.bannerMuted}">NUEVA SOLICITUD DE CONTACTO</p>
      ${rule(48, 3)}
      <p style="margin:16px 0 0 0;font-size:13px;line-height:1.5;color:${COLOR.bannerMuted}">${formatDate(receivedAt)}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:36px 40px 24px 40px">
      <h1 style="margin:0;font-size:24px;line-height:1.2;font-weight:500;letter-spacing:-0.3px;color:${COLOR.graphite}">${name}</h1>
      <p style="margin:8px 0 0 0;font-size:11px;line-height:1.4;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${COLOR.burgundy}">${type}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 40px">
      ${card(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${detailRow('Correo', link(`mailto:${email}`, email))}
        ${detailRow('Teléfono', link(telHref(fields.phone), phone))}
        ${detailRow('Tipo de proyecto', type, true)}
      </table>`)}
    </td>
  </tr>
  <tr><td height="16" style="height:16px;font-size:0;line-height:0">&nbsp;</td></tr>
  <tr>
    <td style="padding:0 40px">
      ${card(`${label('Mensaje')}<p style="margin:8px 0 0 0;font-size:15px;line-height:1.65;color:${COLOR.darkGray}">${message}</p>`)}
    </td>
  </tr>
  <tr>
    <td style="padding:32px 40px 40px 40px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        ${button(replyHref, `Responder a ${firstName}`, true)}
        <td width="12" style="width:12px;font-size:0;line-height:0">&nbsp;</td>
        ${button(telHref(fields.phone), 'Llamar', false)}
      </tr></table>
    </td>
  </tr>
  <tr>
    <td bgcolor="${COLOR.graphite}" style="background-color:${COLOR.graphite};padding:28px 40px">
      <p style="margin:0;font-size:18px;line-height:1.2;font-weight:600;color:${COLOR.warmWhite}">Aetherys</p>
      <p style="margin:4px 0 14px 0;font-size:13px;line-height:1.5;color:${COLOR.bannerMuted}">Tecnología a la medida de lo que imaginas.</p>
      ${rule(36, 2)}
      <p style="margin:14px 0 0 0;font-size:13px;line-height:1.8;color:${COLOR.warmWhite}">
        ${link(`mailto:${DEFAULT_TO}`, DEFAULT_TO, COLOR.warmWhite)}<br>
        <a href="${SITE_URL}" style="color:${COLOR.warmWhite};text-decoration:underline">aetherys.vercel.app</a>
      </p>
      <p style="margin:16px 0 0 0;font-size:12px;line-height:1.5;color:${COLOR.bannerMuted}">Recibido desde el formulario de contacto del sitio web. Responde a este correo para contestar directamente al cliente.</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

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
  const fields: Fields = {
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

  const receivedAt = new Date()
  const text = [
    `Nueva solicitud de contacto — ${formatDate(receivedAt)}`,
    '',
    `Nombre: ${fields.name}`,
    `Correo: ${fields.email}`,
    `Teléfono: ${fields.phone}`,
    `Tipo de proyecto: ${fields.type || '—'}`,
    '',
    fields.message,
    '',
    '—',
    `Aetherys · ${DEFAULT_TO} · ${SITE_URL}`,
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
    subject: ['Nueva solicitud', fields.type, fields.name].filter(Boolean).join(' — '),
    html: renderEmail(fields, receivedAt),
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
