import { expect, test } from "@jest/globals";

import { buildEmailTemplate } from "../../src/notifications/buildEmailTemplate.js";

const singleDoc = {
  employeeName: "Бат-Эрдэнэ Дорж",
  employeeCode: "EMP-0042",
  action: "add_employee",
  generatedAt: "2024-02-24T10:00:00.000Z",
  kind: "employee" as const,
  documents: [
    { name: "Хөдөлмөрийн гэрээ", url: "https://cdn.example.com/doc-1.pdf" },
  ],
};

const multiDoc = {
  ...singleDoc,
  documents: [
    { name: "Хөдөлмөрийн гэрээ", url: "https://cdn.example.com/doc-1.pdf" },
    { name: "NDA", url: "https://cdn.example.com/doc-2.pdf" },
    { name: "Дүрэм журам", url: "https://cdn.example.com/doc-3.pdf" },
  ],
};

test("subject contains employee name", () => {
  const { subject } = buildEmailTemplate(singleDoc);
  expect(subject).toContain("Бат-Эрдэнэ Дорж");
});

test("subject starts with [EPAS]", () => {
  const { subject } = buildEmailTemplate(singleDoc);
  expect(subject.startsWith("[EPAS]")).toBe(true);
});

test("subject says documents are ready", () => {
  const { subject } = buildEmailTemplate(singleDoc);
  expect(subject).toContain("гары");
});

test("text contains employee name", () => {
  const { text } = buildEmailTemplate(singleDoc);
  expect(text).toContain("Бат-Эрдэнэ Дорж");
});

test("text contains employee code", () => {
  const { text } = buildEmailTemplate(singleDoc);
  expect(text).toContain("EMP-0042");
});

test("text contains signing instruction", () => {
  const { text } = buildEmailTemplate(singleDoc);
  expect(text).toContain("гарын үсэглэх боломжтой");
});

test("text contains document url", () => {
  const { text } = buildEmailTemplate(singleDoc);
  expect(text).toContain("https://cdn.example.com/doc-1.pdf");
});

test("text lists all documents when multiple", () => {
  const { text } = buildEmailTemplate(multiDoc);
  expect(text).toContain("Хөдөлмөрийн гэрээ");
  expect(text).toContain("NDA");
  expect(text).toContain("Дүрэм журам");
});

test("html contains employee name", () => {
  const { html } = buildEmailTemplate(singleDoc);
  expect(html).toContain("Бат-Эрдэнэ Дорж");
});

test("html contains employee code", () => {
  const { html } = buildEmailTemplate(singleDoc);
  expect(html).toContain("EMP-0042");
});

test("html contains document url as href", () => {
  const { html } = buildEmailTemplate(singleDoc);
  expect(html).toContain('href="https://cdn.example.com/doc-1.pdf"');
});

test("html contains open link text", () => {
  const { html } = buildEmailTemplate(singleDoc);
  expect(html).toContain("Нээх");
});

test("html contains generatedAt in footer", () => {
  const { html } = buildEmailTemplate(singleDoc);
  expect(html).toContain("2024-02-24T10:00:00.000Z");
});

test("html prompts the employee to sign", () => {
  const { html } = buildEmailTemplate(singleDoc);
  expect(html).toContain("гарын үсэглэх боломжтой");
});

test("html lists all document urls when multiple", () => {
  const { html } = buildEmailTemplate(multiDoc);
  expect(html).toContain("https://cdn.example.com/doc-1.pdf");
  expect(html).toContain("https://cdn.example.com/doc-2.pdf");
  expect(html).toContain("https://cdn.example.com/doc-3.pdf");
});

test("html numbers documents starting from 1", () => {
  const { html } = buildEmailTemplate(multiDoc);
  expect(html).toContain(">1<");
  expect(html).toContain(">2<");
  expect(html).toContain(">3<");
});

test("html is valid doctype html", () => {
  const { html } = buildEmailTemplate(singleDoc);
  expect(html.trim().toLowerCase().startsWith("<!doctype html>")).toBe(true);
});
