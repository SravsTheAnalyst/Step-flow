const { safeClick, safeType, safeFill, ready, waitClosed } = require('./utils');
const data = require('../data/data.json');

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
    const subBrandResult = this.page.getByText(new RegExp(data.subBrand, 'i')).first();
    await subBrandResult.waitFor({ state: 'visible', timeout: 15000 });
    await subBrandResult.click();
    await this.confirmOk();

    // Supplier Site
    await safeClick(this.page, "//div[@id='Primary_Supplier_Site']//i[@title='Add Reference']");
    await this.searchAndType(data.supplierSite);
    await this.confirmOk();

    // Future date
    const dateField = await ready(this.page.getByPlaceholder('M/d/yyyy'));
    await dateField.fill(this.getFutureDate(data.futureDateDays));

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
