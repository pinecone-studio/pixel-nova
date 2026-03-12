import { sendEmail, type SendEmailInput } from "./sendEmail";

const MAX_ATTEMPTS = 3;
export const NOTIFICATION_SLA_MS = 30_000;

export function computeBackoffDelayMs(attempt: number) {
  return 2 ** (attempt - 1) * 1000;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RetryRuntime {
  send?: (input: SendEmailInput) => Promise<void>;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

function createSlaError() {
  return new Error(`Email notification exceeded ${NOTIFICATION_SLA_MS}ms SLA`);
}

export async function sendEmailWithRetry(
  input: SendEmailInput,
  runtime: RetryRuntime = {},
): Promise<void> {
  const send = runtime.send ?? sendEmail;
  const sleep = runtime.sleep ?? delay;
  const now = runtime.now ?? Date.now;
  const deadlineAt = now() + NOTIFICATION_SLA_MS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const remainingMs = deadlineAt - now();
    if (remainingMs <= 0) {
      throw createSlaError();
    }

    try {
      await send({
        ...input,
        timeoutMs: remainingMs,
      });
      return;
    } catch (error) {
      lastError = error;

      if (attempt >= MAX_ATTEMPTS) {
        break;
      }

      const backoffMs = computeBackoffDelayMs(attempt);
      if (deadlineAt - now() <= backoffMs) {
        throw createSlaError();
      }

      await sleep(backoffMs);
    }
  }

  throw lastError;
}
