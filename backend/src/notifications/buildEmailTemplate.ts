export interface EmailTemplateDocument {
  name: string;
  url: string;
}

export interface EmailTemplateInput {
  employeeName: string;
  employeeCode: string;
  action: string;
  documents: EmailTemplateDocument[];
  generatedAt: string;
  kind?: "hr" | "employee";
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

function buildEmployeeSigningTemplate(
  input: EmailTemplateInput,
): EmailTemplate {
  const subject = `[EPAS] Баримтууд бэлэн боллоо - гарын үсэг зурна уу - ${input.employeeName}`;

  const linksText = input.documents
    .map((doc, index) => `${index + 1}. ${doc.name}\n${doc.url}`)
    .join("\n\n");

  const text = [
    `Сайн байна уу, ${input.employeeName}.`,
    "",
    "Таны баримтууд бэлэн боллоо. Доорх холбоосоор нэвтэрч гарын үсэг зурна уу.",
    "Баримтуудыг гарын үсэглэх боломжтой.",
    `Ажилтны код: ${input.employeeCode}`,
    "",
    linksText,
    "",
    "Холбоосууд 7 хоногийн дараа хүчингүй болно.",
    "",
    `EPAS | ${input.generatedAt}`,
  ].join("\n");

  const linksHtml = input.documents
    .map(
      (doc, index) => `
        <tr>
          <td style="padding:12px 16px;border-top:1px solid #e5e7eb;font-size:14px;color:#111827;">${index + 1}</td>
          <td style="padding:12px 16px;border-top:1px solid #e5e7eb;font-size:14px;color:#111827;">${doc.name}</td>
          <td style="padding:12px 16px;border-top:1px solid #e5e7eb;text-align:right;">
            <a href="${doc.url}" style="color:#0f766e;text-decoration:none;font-weight:600;">Нээх</a>
          </td>
        </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="mn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:#0f172a;color:#ffffff;">
                <p style="margin:0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.8;">EPAS</p>
                <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;">Баримтууд бэлэн боллоо</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">Сайн байна уу, ${input.employeeName}.</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Таны баримтууд бэлэн боллоо. Доорх холбоосоор нэвтэрч гарын үсэг зурна уу.</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#475569;">Баримтуудыг гарын үсэглэх боломжтой.</p>
                <div style="margin:0 0 22px;padding:14px 16px;background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;">
                  <div style="font-size:12px;color:#155e75;text-transform:uppercase;letter-spacing:1px;">Ажилтны код</div>
                  <div style="margin-top:6px;font-size:24px;font-weight:700;color:#0f172a;">${input.employeeCode}</div>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;border-collapse:collapse;">
                  <tr style="background:#f8fafc;">
                    <th align="left" style="padding:12px 16px;font-size:12px;text-transform:uppercase;color:#475569;">#</th>
                    <th align="left" style="padding:12px 16px;font-size:12px;text-transform:uppercase;color:#475569;">Баримт</th>
                    <th align="right" style="padding:12px 16px;font-size:12px;text-transform:uppercase;color:#475569;">Холбоос</th>
                  </tr>
                  ${linksHtml}
                </table>
                <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#475569;">Холбоосууд 7 хоногийн дараа хүчингүй болно.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;font-size:12px;color:#64748b;">
                EPAS | ${input.generatedAt}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

function buildHrNotificationTemplate(input: EmailTemplateInput): EmailTemplate {
  const subject = `[EPAS] ${input.employeeName} - ${input.action} баримтууд бэлэн боллоо`;

  const linksText = input.documents
    .map((doc, index) => `${index + 1}. ${doc.name}\n${doc.url}`)
    .join("\n\n");

  const text = [
    "Сайн байна уу, HR баг.",
    "",
    `${input.employeeName} (${input.employeeCode})-ийн ${input.action} үйлдлийн баримтууд бэлэн боллоо.`,
    "",
    linksText,
    "",
    "Холбоосууд 7 хоногийн дараа хүчингүй болно.",
    "",
    `EPAS | ${input.generatedAt}`,
  ].join("\n");

  const linksHtml = input.documents
    .map(
      (doc, index) => `
        <tr>
          <td style="padding:12px 16px;border-top:1px solid #e5e7eb;font-size:14px;color:#111827;">${index + 1}</td>
          <td style="padding:12px 16px;border-top:1px solid #e5e7eb;font-size:14px;color:#111827;">${doc.name}</td>
          <td style="padding:12px 16px;border-top:1px solid #e5e7eb;text-align:right;">
            <a href="${doc.url}" style="color:#0f766e;text-decoration:none;font-weight:600;">Нээх</a>
          </td>
        </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="mn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:#0f172a;color:#ffffff;">
                <p style="margin:0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.8;">EPAS</p>
                <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;">Баримтууд бэлэн боллоо</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">Сайн байна уу, HR баг.</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">${input.employeeName} (${input.employeeCode})-ийн ${input.action} үйлдлийн баримтууд бэлэн боллоо.</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;border-collapse:collapse;">
                  <tr style="background:#f8fafc;">
                    <th align="left" style="padding:12px 16px;font-size:12px;text-transform:uppercase;color:#475569;">#</th>
                    <th align="left" style="padding:12px 16px;font-size:12px;text-transform:uppercase;color:#475569;">Баримт</th>
                    <th align="right" style="padding:12px 16px;font-size:12px;text-transform:uppercase;color:#475569;">Холбоос</th>
                  </tr>
                  ${linksHtml}
                </table>
                <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#475569;">Холбоосууд 7 хоногийн дараа хүчингүй болно.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;font-size:12px;color:#64748b;">
                EPAS | ${input.generatedAt}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

export function buildEmailTemplate(input: EmailTemplateInput): EmailTemplate {
  return input.kind === "hr"
    ? buildHrNotificationTemplate(input)
    : buildEmployeeSigningTemplate(input);
}
