import { jest, expect, test, beforeEach, afterEach } from "@jest/globals";

jest.mock("./sendEmail.js");

import { sendEmail } from "./sendEmail.js";
import { sendEmailWithRetry } from "./sendEmailWithRetry.js";

const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

const input = {
  to: ["hr@example.com"],
  subject: "Test",
  text: "Test body",
  apiKey: "test-key",
};

beforeEach(() => {
  jest.useFakeTimers();
  mockSendEmail.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

test("succeeds on the first attempt without retrying", async () => {
  mockSendEmail.mockResolvedValueOnce(undefined);

  await sendEmailWithRetry(input);

  expect(mockSendEmail).toHaveBeenCalledTimes(1);
});

test("retries and succeeds on the second attempt", async () => {
  mockSendEmail
    .mockRejectedValueOnce(new Error("network error"))
    .mockResolvedValueOnce(undefined);

  const promise = sendEmailWithRetry(input);
  await jest.runAllTimersAsync();
  await promise;

  expect(mockSendEmail).toHaveBeenCalledTimes(2);
});

test("retries and succeeds on the third attempt", async () => {
  mockSendEmail
    .mockRejectedValueOnce(new Error("fail 1"))
    .mockRejectedValueOnce(new Error("fail 2"))
    .mockResolvedValueOnce(undefined);

  const promise = sendEmailWithRetry(input);
  await jest.runAllTimersAsync();
  await promise;

  expect(mockSendEmail).toHaveBeenCalledTimes(3);
});

test("throws the last error after 3 failed attempts", async () => {
  const lastError = new Error("permanent failure");
  mockSendEmail
    .mockRejectedValueOnce(new Error("fail 1"))
    .mockRejectedValueOnce(new Error("fail 2"))
    .mockRejectedValueOnce(lastError);

  const promise = sendEmailWithRetry(input);
  const assertion = expect(promise).rejects.toThrow("permanent failure");
  await jest.runAllTimersAsync();
  await assertion;

  expect(mockSendEmail).toHaveBeenCalledTimes(3);
});

test("does not make more than 3 attempts total", async () => {
  mockSendEmail.mockRejectedValue(new Error("always fails"));

  const promise = sendEmailWithRetry(input);
  const caught = promise.catch(() => {});
  await jest.runAllTimersAsync();
  await caught;

  expect(mockSendEmail).toHaveBeenCalledTimes(3);
});
