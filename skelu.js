import { safeClick, safeType, safeFill, ready, waitClosed } from './utils';
import data from '../data/data.json';

export class skeletonPage {
  constructor(page) {
    this.page = page;
  }

  async stepApplicationAsAdmin() {
    await this.page.goto(data.url);
    await this.page.locator('#username').fill(data.username);
    await this.page.locator('#password').fill(data.password);
    await safeClick(this.page, "#signOnButton");
  }

  async portalJLUserWebUI() {
    await safeClick(this.page, "#JLUserPortal-link span");
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

  async createBasicItem() {
    await safeClick(this.page, "div[class='inner-panel double-width with-threeTaskModes'] button[type='button'] div span[class='text']");
    await safeClick(this.page, "//*[normalize-space()='Create Basic Item']");
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

    // Sub Brand — scoped to the Sub Brand field; adjust container id/class if different on the real page
    await safeClick(this.page, this.page.locator("div[id='Sub_Brand'] i[title='Add Link']"));
    await this.searchAndType(data.subBrand);
    const subBrandResult = this.page.getByText(new RegExp(data.subBrand, 'i')).first();
    await subBrandResult.waitFor({ state: 'visible' });
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
