import path from 'path';
import { safeClick, safeType, safeSelect, ready, waitClosed, clickToolbarButton, getFieldValue, appendRow } from './utils';
import data from '../Data/data.json';

export class itemCreationWorkflowPage {
  constructor(page) {
    this.page = page;
  }

  async registerPopupHandlers() {
    await this.page.addLocatorHandler(this.page.locator('i.portal-alert-popup-close-box__button'), l => l.click());
    await this.page.addLocatorHandler(this.page.locator('.warning-popup-close-button'), l => l.click()); // TODO: real selector
  }

  async confirmOk() {
    const ok = this.page.locator("//span[normalize-space()='OK']");
    await safeClick(this.page, ok);
    await waitClosed(ok);
  }

  async fillItemcreationWorkFlowDetails() {
    // TODO: replace with the real selector for "Take Latest"
    await safeClick(this.page, "//span[normalize-space()='Take Latest']");

    await safeClick(this.page, "//*[normalize-space()='General Classification']");
    await safeClick(this.page, "//*[normalize-space()='Generate Barcode']/following::input[@type='radio'][2]");
    await safeSelect(this.page.locator('//select[option[@title ="Exclusive"]]'), { label: 'Not Exclusive' });
    await safeSelect(this.page.locator('//select[option[@title ="Standard Item"]]'), { label: 'Standard Item' });

    await safeClick(this.page, "//div[@id='Phase']//i[@title='Add Reference']");
    await safeClick(this.page, "//i[@id='tree_expanded_node_SeasonPhaseRoot']");
    await safeClick(this.page, "//i[@id='tree_expanded_node_Season-16']");
    await safeClick(this.page, "//div[@class='treeItem treeItem-entity treeItem-objecttype-phase']");
    await this.confirmOk();

    await safeClick(this.page, await ready(this.page.locator(
      "div[id='stibo_tab_Hierarchy'] div[class='tabs-panel-tab-inner'] div span[class='gwt-InlineLabel']"
    )));

    await safeClick(this.page, "//div[@id='Initial_Style']//i[@title='Add Reference'][normalize-space()='add_circle']");
    await safeClick(this.page, "//div[@class='gwt-Label'][normalize-space()='Search']");
    await safeType(this.page.locator("//input[@class='gwt-SuggestBox']"), data.initialStyleCode);
    await safeClick(this.page, "//button[@class='stibo-GraphicsButton material SearchButton']//span[@class='text']");
    await this.confirmOk(); // no separate result row here — waits for OK to be enabled

    await safeClick(this.page, await ready(this.page.locator("//span[normalize-space()='Retail Price & VAT']")));
    await safeType(this.page.locator("//input[@class='gwt-TextBox validator-number stibo-Value stibo-Value-Number mandatory']"), data.retailPrice);

    await safeClick(this.page, "//div[@id='stibo_tab_Selling_Details']//div[@class='tabs-panel-tab-inner']");
    await safeSelect(
      this.page.locator('select').filter({ has: this.page.locator(`//option[@title ="${data.distributor}"]`) }),
      { label: data.distributor }
    );
    await safeSelect(
      this.page.locator('select').filter({ has: this.page.locator(`//option[@title ="${data.imageSource}"]`) }),
      { label: data.imageSource }
    );

    await safeClick(this.page, "//span[normalize-space()='Supplier']");
    await safeSelect(this.page.locator("div[data-step-component-id='PrimaryManufacturingCountry'] select"), { index: 1 });
    await safeType(this.page.locator("//input[@class='gwt-TextBox validator-number stibo-Value stibo-Value-Number mandatory-for-approval mandatory']"), data.unitCost);
    await safeType(this.page.locator("//div[@id='Supplier_Pack_Size']//div[@class='widgetAndIconsWrapper']//div//div//input[@type='text']"), data.packSize);

    await safeClick(this.page, "//span[normalize-space()='Selling Attributes']");
    await clickToolbarButton(this.page, 'Allocate StockNumber');

    const washingSelect = this.page.locator("div[data-step-component-id='WashingInstructions'] select");
    await washingSelect.waitFor({ state: 'visible', timeout: 30000 });
    await safeSelect(washingSelect, { index: data.washingInstructionsIndex });
  }

  // Reads Product Description / RIN / Stock Number for logging.
  // Labels below need verifying against the real page.
  async captureSummary() {
    return {
      shortDesc: await getFieldValue(this.page, 'Product Description'),
      rin: await getFieldValue(this.page, 'RIN'),
      stockNumber: await getFieldValue(this.page, 'Stock Number'),
    };
  }

  async submitValidateItemCreationWorkFlow() {
    const summary = await this.captureSummary();

    // Allocate Barcodes right before submit — triggers reloads that would
    // otherwise interfere with earlier tabs (Hierarchy, Initial Style, etc.)
    await clickToolbarButton(this.page, 'Allocate Barcodes');
    await clickToolbarButton(this.page, 'Save.?Submit');

    const excelPath = path.join(__dirname, '..', 'Data', data.excelFileName);
    await appendRow(excelPath, summary);
  }
}
