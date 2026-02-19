import { test, expect } from '@playwright/test'
import { EditorPage } from './fixtures/editor-page'

test.describe('Toolbar Functionality', () => {
  let editorPage: EditorPage

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page)
    await editorPage.goto()
  })

  test('bold button applies bold formatting', async () => {
    await editorPage.clearEditor()
    await editorPage.typeText('Bold text')
    await editorPage.selectAll()
    await editorPage.clickToolbarButton('rte-toolbar-bold')
    const html = await editorPage.getEditorHTML()
    expect(html).toContain('<strong>')
    expect(html).toContain('Bold text')
  })

  test('italic button applies italic formatting', async () => {
    await editorPage.clearEditor()
    await editorPage.typeText('Italic text')
    await editorPage.selectAll()
    await editorPage.clickToolbarButton('rte-toolbar-italic')
    const html = await editorPage.getEditorHTML()
    expect(html).toContain('<em>')
    expect(html).toContain('Italic text')
  })

  test('underline button applies underline formatting', async () => {
    await editorPage.clearEditor()
    await editorPage.typeText('Underline text')
    await editorPage.selectAll()
    await editorPage.clickToolbarButton('rte-toolbar-underline')
    const html = await editorPage.getEditorHTML()
    expect(html).toContain('<u>')
    expect(html).toContain('Underline text')
  })

  test('heading dropdown changes text to heading', async () => {
    await editorPage.clearEditor()
    await editorPage.typeText('My Heading')
    await editorPage.selectAll()
    // Open heading dropdown
    await editorPage.clickToolbarButton('rte-heading-dropdown')
    // Select Heading 1 from dropdown
    const dropdownMenu = editorPage.page.locator('.rte-toolbar__dropdown-menu')
    await expect(dropdownMenu).toBeVisible()
    // Click "Heading 1" option (index 1, after "Paragraph" at index 0)
    await dropdownMenu.locator('.rte-toolbar__dropdown-item').nth(1).click()
    const html = await editorPage.getEditorHTML()
    expect(html).toContain('<h1>')
    expect(html).toContain('My Heading')
  })

  test('undo and redo work correctly', async () => {
    await editorPage.clearEditor()
    await editorPage.typeText('Hello World')
    // Undo
    await editorPage.page.keyboard.press('ControlOrMeta+z')
    const htmlAfterUndo = await editorPage.getEditorHTML()
    expect(htmlAfterUndo).not.toContain('Hello World')
    // Redo
    await editorPage.page.keyboard.press('ControlOrMeta+Shift+z')
    const htmlAfterRedo = await editorPage.getEditorHTML()
    expect(htmlAfterRedo).toContain('Hello World')
  })

  test('bullet list button creates a list', async () => {
    await editorPage.clearEditor()
    await editorPage.typeText('List item')
    await editorPage.clickToolbarButton('rte-toolbar-bulletList')
    const html = await editorPage.getEditorHTML()
    expect(html).toContain('<li>')
  })
})

