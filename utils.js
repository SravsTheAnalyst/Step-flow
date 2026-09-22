import { expect } from '@playwright/test';
import fs from 'fs';
import ExcelJS from 'exceljs';

// ---------- Wait / action helpers ----------

export async function ready(locator, timeout = 15000) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

export async function safeClick(page, target, { timeout = 15000, retries = 3 } = {}) {
  const locator = typeof target === 'string' ? page.locator(target) : target;
  for (let i = 1; i <= retries; i++) {
    try {
      await ready(locator, timeout);
      await expect(locator).toBeEnabled({ timeout });
      await locator.click({ timeout });
      return;
    } catch (err) {
      if (i === retries) throw err;
      await page.waitForTimeout(500);
    }
  }
}

export async function safeType(target, text) {
  const locator = await ready(target);
  await locator.type(text);
}

export async function safeFill(target, text) {
  const locator = await ready(target);
  await locator.fill(text);
}

export async function safeSelect(target, option) {
  const locator = await ready(target);
  await locator.selectOption(option);
}

export async function waitClosed(locator, timeout = 15000) {
  await locator.waitFor({ state: 'detached', timeout }).catch(() => {});
}

// Toolbar buttons (Allocate StockNumber, Allocate Barcodes, Save&Submit) are
// real <button> elements — role-based lookup survives markup changes better
// than a text/tag XPath. Longer default timeout: these trigger page reloads
// that can take a while to settle.
export async function clickToolbarButton(page, name, timeout = 60000) {
  const btn = page.getByRole('button', { name: new RegExp(name) });
  await btn.waitFor({ state: 'visible', timeout });
  await expect(btn).toBeEnabled({ timeout });
  await btn.click({ timeout });
}

// Generic "find the value next to this label" lookup, based on the page
// pattern where a label sits in a <table> and its value is the very next
// sibling element. VERIFY against the real page before relying on it.
export async function getFieldValue(page, labelText, timeout = 15000) {
  const value = page.locator(
    `xpath=//td[normalize-space()="${labelText}"]/ancestor::table[1]/following-sibling::*[1]`
  );
  await value.waitFor({ state: 'visible', timeout });
  return (await value.innerText()).trim();
}

// ---------- Excel logging ----------

const SHEET_NAME = 'Items';
const HEADERS = ['Timestamp', 'Short Description', 'RIN', 'Stock Number'];

export async function appendRow(filePath, { shortDesc, rin, stockNumber }) {
  const workbook = new ExcelJS.Workbook();
  let sheet;

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
    sheet = workbook.getWorksheet(SHEET_NAME) || workbook.addWorksheet(SHEET_NAME);
    if (sheet.rowCount === 0) sheet.addRow(HEADERS);
  } else {
    sheet = workbook.addWorksheet(SHEET_NAME);
    sheet.addRow(HEADERS);
  }

  sheet.addRow([new Date().toISOString(), shortDesc, rin, stockNumber]);
  await workbook.xlsx.writeFile(filePath);
}
