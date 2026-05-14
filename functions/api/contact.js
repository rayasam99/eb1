import { Resend } from 'resend';

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { firstName, lastName, email, phone, message } = body;

  if (!firstName || !lastName || !email || !message) {
    return json({ error: 'Missing required fields' }, 422);
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const fromEmail = env.From ?? 'noreply@eb1agreencardcoach.com';
  const toEmail   = env.To   ?? 'contact@eb1agreencardcoach.com';

  const { error } = await resend.emails.send({
    from: `EB-1A Green Card Coach <${fromEmail}>`,
    to: toEmail,
    replyTo: email,
    subject: `New contact form submission from ${firstName} ${lastName}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td><strong>Name</strong></td><td>${firstName} ${lastName}</td></tr>
        <tr><td><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td><strong>Phone</strong></td><td>${phone || '—'}</td></tr>
        <tr><td valign="top"><strong>Message</strong></td><td>${message.replace(/\n/g, '<br>')}</td></tr>
      </table>
    `,
  });

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ success: true }, 200);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
