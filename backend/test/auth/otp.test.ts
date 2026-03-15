import { expect, test } from "@jest/globals";

import { generateOtpCode, maskEmail } from "../../src/auth/otp.js";

test("generateOtpCode returns 6 digit code", () => {
  const code = generateOtpCode();
  expect(code).toMatch(/^\d{6}$/);
});

test("maskEmail hides most of the email", () => {
  expect(maskEmail("employee@example.com")).toBe("em******@e******.com");
});
