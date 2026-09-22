const { safeClick, safeType, safeFill, ready, waitClosed } = require('./utils');
const data = require('../data/data.json');

// Some search-result matches can include hidden/off-screen elements before
// the real visible one, so .first() alone isn't safe. This checks every
// match in turn and clicks whichever one is actually visible.
async function clickVisibleTextMatch(page, regex, timeout = 15000) {
  const locator = page.getByText(regex);
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const count = await locator.count();
    for (let i = 0; i < count; i++) {
      const el = locator.nth(i);
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        return;
      }
    }
    await page.waitForTimeout(300);
  }
  throw new Error(`No visible element matched ${regex} within ${timeout}ms`);
}

class skeletonPage {
  constructor(page) {
    this.page = page;
  }

  async stepApplicationAsAdmin() {
    await this.page.goto(data.url);
    await this.page.locator('#username').fill(data.username);
    await this.page.fill("input[id='password']", data.password);
    await safeClick(this.page, '//*[@id="signOnButton"]');
  }

  async portalJLUserWebUI() {
    await safeClick(this.page, '//*[@id="JLUserPortal-link"]/span');
  }

  async createBasicItem() {
    await safeClick(this.page, "div[class='inner-panel double-width with-threeTaskModes'] button[type='button'] div span[class='text']");
    await safeClick(this.page, "//*[normalize-space()='Create Basic Item']");
  }

  async searchAndType(value) {
    await safeClick(this.page, "//div[text()='Search']");
    await safeType(this.page.locator("//*[@class='gwt-SuggestBox']"), value);
    await safeClick(this.page, "//*[@class='stibo-GraphicsButton material SearchButton']");
  }

  async confirmOk() {
    const ok = this.page.locator("//*[text() = 'OK']");
    await safeClick(this.page, ok);
    await waitClosed(ok);
  }

  async provideSkeletonData() {
    // Product Type
    await safeClick(this.page, "//*[@id='Product_Type']/div/div[1]/i");
    await this.searchAndType(data.productType);
    await this.confirmOk();

    // Category
    await safeClick(this.page, "//div[@id='Category']//i[@title='Add Reference']");
    await this.searchAndType(data.categoryNumber);
    await this.confirmOk();

    // Descriptions
    await safeFill(this.page.locator("//*[@class='gwt-TextBox stibo-Value validator-text stibo-Value-Text mandatory' and @maxlength='29']"), data.shortDesc);
    await safeFill(this.page.locator("//textarea[@class='gwt-TextArea stibo-Value validator-text stibo-Value-Text mandatory']"), data.productDesc);
    await safeFill(this.page.locator("//*[@class='gwt-TextBox stibo-Value validator-text stibo-Value-Text mandatory' and @maxlength='21']"), data.vpn);

    // Sub Brand — FIX applied here: waits for the actual search result to
    // render before clicking it, instead of clicking .nth(0) immediately
    // after Search fires (this was the cause of the "stopped after adidas" stall).
    await safeClick(this.page, this.page.locator("//i[@title='Add Link']"));
    await this.searchAndType(data.subBrand);
    await clickVisibleTextMatch(this.page, new RegExp(data.subBrand, 'i'));
    await this.confirmOk();

    // Supplier Site
    await safeClick(this.page, "//div[@id='Primary_Supplier_Site']//i[@title='Add Reference']");
    await this.searchAndType(data.supplierSite);
    await this.confirmOk();

    // Future date
    const dateField = await ready(this.page.getByPlaceholder('M/d/yyyy'));
    await dateField.click();
    await dateField.fill(this.getFutureDate(data.futureDateDays));
    // close the calendar popup that opens on focus, so it doesn't sit on
    // top of the Save button and intercept the next click
    await this.page.keyboard.press('Escape');

    // Save
    await safeClick(this.page, "//span[normalize-space()='Save']");
  }

  getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }
}

module.exports = { skeletonPage };
