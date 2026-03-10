import { sendEmail, type SendEmailInput } from "./sendEmail";

const MAX_ATTEMPTS = 3;

export async function sendEmailWithRetry(input: SendEmailInput): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await sendEmail(input);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  throw lastError;
}
