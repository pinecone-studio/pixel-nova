const OTP_LENGTH = 6;

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashSecret(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return toHex(new Uint8Array(digest));
}

export function generateOtpCode() {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return String(buffer[0] % (10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
}

export function createSessionToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`;
}

export function maskEmail(email: string) {
  const [localPart, domain = ""] = email.split("@", 2);
  if (!domain) {
    return email;
  }

  const visibleLocal = localPart.slice(0, Math.min(2, localPart.length));
  const hiddenLocal = Math.max(localPart.length - visibleLocal.length, 0);
  const [domainName, ...rest] = domain.split(".");
  const visibleDomain = domainName.slice(0, 1);
  const hiddenDomain = Math.max(domainName.length - visibleDomain.length, 0);

  return `${visibleLocal}${"*".repeat(hiddenLocal)}@${visibleDomain}${"*".repeat(hiddenDomain)}${rest.length > 0 ? `.${rest.join(".")}` : ""}`;
}
