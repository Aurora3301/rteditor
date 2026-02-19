import { test, expect } from '@playwright/test'
import { EditorPage } from './fixtures/editor-page'

test.describe('Phase 2 Features', () => {
  let editorPage: EditorPage

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page)
    await editorPage.goto()
  })

  test('emoji picker opens when emoji button clicked', async () => {
    await editorPage.clickToolbarButton('rte-toolbar-emoji')
    const emojiPicker = editorPage.page.locator('.rte-emoji-picker')
    await expect(emojiPicker).toBeVisible()
  })

  test('emoji picker inserts emoji into editor', async () => {
    await editorPage.clearEditor()
    await editorPage.clickToolbarButton('rte-toolbar-emoji')
    const emojiPicker = editorPage.page.locator('.rte-emoji-picker')
    await expect(emojiPicker).toBeVisible()
    // Click the first emoji button in the grid
    const firstEmoji = emojiPicker.locator('.rte-emoji-picker__emoji').first()
    const emojiText = await firstEmoji.textContent()
    await firstEmoji.click()
    const html = await editorPage.getEditorHTML()
    // Editor should now contain the emoji character
    expect(html).toContain(emojiText!)
  })

  test('color picker opens when text color button clicked', async () => {
    await editorPage.clickToolbarButton('rte-toolbar-textColor')
    const colorPicker = editorPage.page.locator('.rte-color-picker')
    await expect(colorPicker).toBeVisible()
  })

  test('link dialog opens when link button clicked', async () => {
    await editorPage.clearEditor()
    await editorPage.typeText('link text')
    await editorPage.selectAll()
    await editorPage.clickToolbarButton('rte-toolbar-link')
    const linkDialog = editorPage.page.locator('.rte-link-dialog')
    await expect(linkDialog).toBeVisible()
  })

  test('table insertion creates a table in the editor', async () => {
    await editorPage.clearEditor()
    await editorPage.clickToolbarButton('rte-toolbar-table')
    const html = await editorPage.getEditorHTML()
    // Table is wrapped in a tableWrapper div; check for the table element with attributes
    expect(html).toContain('tableWrapper')
    expect(html).toContain('<table')
    expect(html).toContain('<th')
    expect(html).toContain('<td')
  })

  test('code block button inserts a code block', async () => {
    await editorPage.clearEditor()
    await editorPage.clickToolbarButton('rte-toolbar-codeBlock')
    const html = await editorPage.getEditorHTML()
    // Code block uses a custom node view with rte-code-block class
    expect(html).toContain('rte-code-block')
    expect(html).toContain('<pre')
  })
})

