import type { Page, Locator } from '@playwright/test'

export class EditorPage {
  readonly page: Page
  readonly editor: Locator
  readonly toolbar: Locator

  constructor(page: Page) {
    this.page = page
    this.editor = page.locator('.ProseMirror')
    this.toolbar = page.locator('[data-testid="rte-toolbar"]')
  }

  async goto() {
    await this.page.goto('/')
    await this.editor.waitFor({ state: 'visible', timeout: 10000 })
  }

  async typeText(text: string) {
    await this.editor.click()
    await this.page.keyboard.type(text)
  }

  async selectAll() {
    await this.editor.click()
    await this.page.keyboard.press('ControlOrMeta+a')
  }

  async clickToolbarButton(testId: string) {
    await this.toolbar.locator(`[data-testid="${testId}"]`).click()
  }

  async getEditorHTML(): Promise<string> {
    return this.editor.innerHTML()
  }

  async clearEditor() {
    await this.selectAll()
    await this.page.keyboard.press('Backspace')
  }
}

