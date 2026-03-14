import { expect, test } from "@jest/globals";

import { buildEmailTemplate } from "../../src/notifications/buildEmailTemplate.js";

const singleDoc = {
  employeeName: "Бат-Эрдэнэ Дорж",
  employeeCode: "EMP-0042",
  action: "add_employee",
  generatedAt: "2024-02-24T10:00:00.000Z",
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

// ── subject ───────────────────────────────────────────────────────────────────

test("subject contains employee name", () => {
  const { subject } = buildEmailTemplate(singleDoc);
  expect(subject).toContain("Бат-Эрдэнэ Дорж");
});

test("subject contains action", () => {
  const { subject } = buildEmailTemplate(singleDoc);
  expect(subject).toContain("add_employee");
});

test("subject starts with [HR System]", () => {
  const { subject } = buildEmailTemplate(singleDoc);
  expect(subject.startsWith("[HR System]")).toBe(true);
});

// ── text ──────────────────────────────────────────────────────────────────────

test("text contains employee name", () => {
  const { text } = buildEmailTemplate(singleDoc);
  expect(text).toContain("Бат-Эрдэнэ Дорж");
});

test("text contains employee code", () => {
  const { text } = buildEmailTemplate(singleDoc);
  expect(text).toContain("EMP-0042");
});

test("text contains document url", () => {
  const { text } = buildEmailTemplate(singleDoc);
  expect(text).toContain("https://cdn.example.com/doc-1.pdf");
});

test("text contains document name", () => {
  const { text } = buildEmailTemplate(singleDoc);
  expect(text).toContain("Хөдөлмөрийн гэрээ");
});

test("text contains generatedAt timestamp", () => {
  const { text } = buildEmailTemplate(singleDoc);
  expect(text).toContain("2024-02-24T10:00:00.000Z");
});

test("text lists all documents when multiple", () => {
  const { text } = buildEmailTemplate(multiDoc);
  expect(text).toContain("Хөдөлмөрийн гэрээ");
  expect(text).toContain("NDA");
  expect(text).toContain("Дүрэм журам");
});

// ── html ──────────────────────────────────────────────────────────────────────

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

test("html contains Татаж авах link text", () => {
  const { html } = buildEmailTemplate(singleDoc);
  expect(html).toContain("Татаж авах");
});

test("html contains generatedAt in footer", () => {
  const { html } = buildEmailTemplate(singleDoc);
  expect(html).toContain("2024-02-24T10:00:00.000Z");
});

test("html contains action text in body", () => {
  const { html } = buildEmailTemplate(singleDoc);
  expect(html).toContain("add_employee");
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
