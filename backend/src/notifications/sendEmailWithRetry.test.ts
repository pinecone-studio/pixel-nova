import { expect, jest, test } from "@jest/globals";

import {
  computeBackoffDelayMs,
  NOTIFICATION_SLA_MS,
  sendEmailWithRetry,
} from "./sendEmailWithRetry.js";
import type { SendEmailInput } from "./sendEmail.js";

test("computeBackoffDelayMs uses exponential backoff", () => {
  expect(computeBackoffDelayMs(1)).toBe(1000);
  expect(computeBackoffDelayMs(2)).toBe(2000);
  expect(computeBackoffDelayMs(3)).toBe(4000);
});

test("sendEmailWithRetry retries with exponential backoff and shrinking timeout budget", async () => {
  let currentTime = 0;
  const sendInputs: SendEmailInput[] = [];
  const send = jest
    .fn(async (payload: SendEmailInput) => {
      sendInputs.push(payload);
      currentTime += 100;
      if (sendInputs.length < 3) {
        throw new Error(`failure ${sendInputs.length}`);
      }
    });
  const sleepCalls: number[] = [];

  await sendEmailWithRetry(
    {
      to: ["demo@example.com"],
      subject: "Test",
      text: "Body",
      apiKey: "re_test",
    },
    {
      send,
      sleep: async (ms) => {
        sleepCalls.push(ms);
        currentTime += ms;
      },
      now: () => currentTime,
    },
  );

  expect(send).toHaveBeenCalledTimes(3);
  expect(sleepCalls).toEqual([1000, 2000]);
  expect(sendInputs[0]?.timeoutMs).toBe(NOTIFICATION_SLA_MS);
  expect(sendInputs[1]?.timeoutMs).toBe(NOTIFICATION_SLA_MS - 1100);
  expect(sendInputs[2]?.timeoutMs).toBe(NOTIFICATION_SLA_MS - 3200);
});

test("sendEmailWithRetry stops when SLA budget is exhausted", async () => {
  let currentTime = 0;
  const send = jest.fn(async () => {
    currentTime += 29_500;
    throw new Error("temporary failure");
  });

  await expect(
    sendEmailWithRetry(
      {
        to: ["demo@example.com"],
        subject: "Test",
        text: "Body",
        apiKey: "re_test",
      },
      {
        send,
        sleep: async () => {
          throw new Error("sleep should not happen");
        },
        now: () => currentTime,
      },
    ),
  ).rejects.toThrow(`Email notification exceeded ${NOTIFICATION_SLA_MS}ms SLA`);

  expect(send).toHaveBeenCalledTimes(1);
});
