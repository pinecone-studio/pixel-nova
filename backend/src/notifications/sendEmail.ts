export interface SendEmailInput {
  to: string[];
  subject: string;
  text: string;
  html?: string;
  apiKey: string;
  fromEmail?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (input.to.length === 0) return;

  const from = input.fromEmail ?? "EPAS HR System <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Email send failed: ${response.status} ${errorBody}`);
  }
}
