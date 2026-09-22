import { test } from '@playwright/test';
import { skeletonPage } from '../../Pages/skeleton';
import { itemCreationWorkflowPage } from '../../Pages/itemCreationWorkflow';

test('TC_33_BasicItem_Creation_and_Workflow_with_Excel_Log', async ({ page }) => {

    const skeleton = new skeletonPage(page);
    const itemCreationWorkflow = new itemCreationWorkflowPage(page);

    await itemCreationWorkflow.registerPopupHandlers();

    await skeleton.stepApplicationAsAdmin();
    await skeleton.portalJLUserWebUI();
    await skeleton.createBasicItem();
    await skeleton.provideSkeletonData();

    await itemCreationWorkflow.fillItemcreationWorkFlowDetails();
    await itemCreationWorkflow.submitValidateItemCreationWorkFlow();

    console.log("\n TC_33_BasicItem_Creation_and_Workflow_with_Excel_Log *** PASSED ***");
})
