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
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export function buildEmailTemplate(input: EmailTemplateInput): EmailTemplate {
  const subject = `[HR System] New documents generated — ${input.employeeName} — ${input.action}`;

  const docListText = input.documents
    .map((doc, i) => `  ${i + 1}. ${doc.name}\n     ${doc.url}`)
    .join("\n\n");

  const text = [
    `Subject: ${subject}`,
    ``,
    `Dear HR Team,`,
    ``,
    `The following documents have been automatically generated for the ${input.action} of`,
    `${input.employeeName} (${input.employeeCode}):`,
    ``,
    docListText,
    ``,
    `Links expire in 7 days.`,
    ``,
    `Please print, sign, and file in the employee folder.`,
    ``,
    `EPAS HR System | ${input.generatedAt}`,
  ].join("\n");

  const docListHtml = input.documents
    .map(
      (doc, i) =>
        `<tr style="${i > 0 ? "border-top:1px solid #cccccc;" : ""}">
          <td style="padding:12px 16px;font-size:13px;color:#111111;font-family:Arial,sans-serif;border-right:1px solid #cccccc;width:36px;text-align:center;color:#888888;">${i + 1}</td>
          <td style="padding:12px 16px;font-size:14px;color:#111111;">${doc.name}</td>
          <td style="padding:12px 16px;text-align:right;border-left:1px solid #cccccc;white-space:nowrap;">
            <a href="${doc.url}" style="font-size:13px;color:#111111;font-family:Arial,sans-serif;text-decoration:underline;">Татаж авах</a>
          </td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="border:2px solid #111111;">

          <!-- Top border line -->
          <tr><td style="background:#111111;height:4px;"></td></tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 48px 24px;border-bottom:1px solid #cccccc;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#555555;font-family:Arial,sans-serif;">EPAS · HR System</p>
              <h1 style="margin:12px 0 0;font-size:18px;font-weight:bold;color:#111111;letter-spacing:0.5px;">МЭДЭГДЭЛ</h1>
              <p style="margin:6px 0 0;font-size:12px;color:#555555;font-family:Arial,sans-serif;">Автомат системийн мэдэгдэл</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 48px;">

              <p style="margin:0 0 24px;font-size:14px;color:#111111;line-height:1.8;">Хүндэт HR баг,</p>

              <p style="margin:0 0 24px;font-size:14px;color:#333333;line-height:1.8;">
                Доорх ажилтны <strong>${input.action}</strong> үйл явцтай холбогдох баримт бичгүүд
                системээс автоматаар үүсгэгдлээ.
              </p>

              <!-- Employee Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #cccccc;margin-bottom:28px;">
                <tr style="background:#f5f5f5;">
                  <td style="padding:8px 16px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#555555;font-family:Arial,sans-serif;border-bottom:1px solid #cccccc;" colspan="2">Ажилтны мэдээлэл</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#555555;font-family:Arial,sans-serif;border-right:1px solid #cccccc;width:40%;">Овог нэр</td>
                  <td style="padding:12px 16px;font-size:14px;color:#111111;font-weight:bold;">${input.employeeName}</td>
                </tr>
                <tr style="border-top:1px solid #cccccc;">
                  <td style="padding:12px 16px;font-size:13px;color:#555555;font-family:Arial,sans-serif;border-right:1px solid #cccccc;border-top:1px solid #cccccc;">Ажилтны код</td>
                  <td style="padding:12px 16px;font-size:14px;color:#111111;font-weight:bold;border-top:1px solid #cccccc;">${input.employeeCode}</td>
                </tr>
              </table>

              <!-- Document List -->
              <p style="margin:0 0 10px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#555555;font-family:Arial,sans-serif;">Үүсгэгдсэн баримт бичгүүд</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #cccccc;">
                ${docListHtml}
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#555555;font-family:Arial,sans-serif;line-height:1.7;">
                Татаж авах холбоосууд үүссэн өдрөөс хойш <strong style="color:#111111;">7 хоног</strong>-ийн дараа хүчингүй болно.
              </p>

              <p style="margin:16px 0 0;font-size:14px;color:#111111;line-height:1.8;">
                Баримт бичгүүдийг хэвлэж, гарын үсэг зурсны дараа ажилтны хавтсанд хадгална уу.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 48px;border-top:1px solid #cccccc;background:#f5f5f5;">
              <p style="margin:0;font-size:11px;color:#888888;font-family:Arial,sans-serif;letter-spacing:0.5px;">
                EPAS HR System &nbsp;|&nbsp; Автомат мэдэгдэл &nbsp;|&nbsp; ${input.generatedAt}
              </p>
            </td>
          </tr>

          <!-- Bottom border line -->
          <tr><td style="background:#111111;height:4px;"></td></tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
