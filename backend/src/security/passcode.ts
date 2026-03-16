function toBase64(data: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(data).toString("base64");
  }
  let binary = "";
  data.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(input: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(input, "base64"));
  }
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function concatBytes(a: Uint8Array, b: Uint8Array) {
  const combined = new Uint8Array(a.length + b.length);
  combined.set(a, 0);
  combined.set(b, a.length);
  return combined;
}

export async function hashPasscode(passcode: string, saltBase64?: string) {
  const salt = saltBase64
    ? fromBase64(saltBase64)
    : crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const payload = concatBytes(salt, encoder.encode(passcode));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", payload));

  return {
    salt: toBase64(salt),
    hash: toBase64(digest),
  };
}

export async function verifyPasscode(
  passcode: string,
  saltBase64: string,
  hashBase64: string,
) {
  const { hash } = await hashPasscode(passcode, saltBase64);
  return hash === hashBase64;
}
