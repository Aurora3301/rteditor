import { test, expect } from '@playwright/test'
import { EditorPage } from './fixtures/editor-page'

test.describe('Core Editor', () => {
  let editorPage: EditorPage

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page)
    await editorPage.goto()
  })

  test('editor loads and is visible', async () => {
    await expect(editorPage.editor).toBeVisible()
    await expect(editorPage.page.locator('[data-testid="rte-editor"]')).toBeVisible()
  })

  test('toolbar is visible', async () => {
    await expect(editorPage.toolbar).toBeVisible()
    await expect(editorPage.toolbar).toHaveAttribute('role', 'toolbar')
  })

  test('can type text in the editor', async () => {
    await editorPage.clearEditor()
    await editorPage.typeText('Hello RTEditor')
    const html = await editorPage.getEditorHTML()
    expect(html).toContain('Hello RTEditor')
  })

  test('typed text appears in HTML output', async ({ page }) => {
    await editorPage.clearEditor()
    await editorPage.typeText('Testing output')
    // The demo app shows HTML output in a <pre> element
    const htmlOutput = page.locator('.demo-output-pre').first()
    await expect(htmlOutput).toContainText('Testing output')
  })

  test('editor has contenteditable attribute', async () => {
    await expect(editorPage.editor).toHaveAttribute('contenteditable', 'true')
  })

  test('editor receives focus on click', async () => {
    await editorPage.editor.click()
    await expect(editorPage.editor).toBeFocused()
  })
})

