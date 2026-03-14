import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";

import type { SendEmailInput } from "../../src/notifications/sendEmail.js";
import { sendEmailWithRetry } from "../../src/notifications/sendEmailWithRetry.js";

const input = {
  to: ["hr@example.com"],
  subject: "Test",
  text: "Test body",
  apiKey: "test-key",
};

let send: jest.MockedFunction<(input: SendEmailInput) => Promise<void>>;

beforeEach(() => {
  jest.useFakeTimers();
  send = jest.fn();
});

afterEach(() => {
  jest.useRealTimers();
});

test("succeeds on the first attempt without retrying", async () => {
  send.mockResolvedValueOnce(undefined);

  await sendEmailWithRetry(input, { send });

  expect(send).toHaveBeenCalledTimes(1);
});

test("retries and succeeds on the second attempt", async () => {
  send
    .mockRejectedValueOnce(new Error("network error"))
    .mockResolvedValueOnce(undefined);

  const promise = sendEmailWithRetry(input, { send });
  await jest.runAllTimersAsync();
  await promise;

  expect(send).toHaveBeenCalledTimes(2);
});

test("retries and succeeds on the third attempt", async () => {
  send
    .mockRejectedValueOnce(new Error("fail 1"))
    .mockRejectedValueOnce(new Error("fail 2"))
    .mockResolvedValueOnce(undefined);

  const promise = sendEmailWithRetry(input, { send });
  await jest.runAllTimersAsync();
  await promise;

  expect(send).toHaveBeenCalledTimes(3);
});

test("throws the last error after 3 failed attempts", async () => {
  const lastError = new Error("permanent failure");
  send
    .mockRejectedValueOnce(new Error("fail 1"))
    .mockRejectedValueOnce(new Error("fail 2"))
    .mockRejectedValueOnce(lastError);

  const promise = sendEmailWithRetry(input, { send });
  const assertion = expect(promise).rejects.toThrow("permanent failure");
  await jest.runAllTimersAsync();
  await assertion;

  expect(send).toHaveBeenCalledTimes(3);
});

test("does not make more than 3 attempts total", async () => {
  send.mockRejectedValue(new Error("always fails"));

  const promise = sendEmailWithRetry(input, { send });
  const caught = promise.catch(() => {});
  await jest.runAllTimersAsync();
  await caught;

  expect(send).toHaveBeenCalledTimes(3);
});
