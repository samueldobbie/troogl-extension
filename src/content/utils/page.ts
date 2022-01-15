function injectElement(tagName: string, id: string) {
  const element = document.createElement(tagName)
  element.id = id
  document.body.appendChild(element)
}

function enableEditing(): void {
  window.getSelection()?.collapse(document.body, 0)
  document.designMode = "on"

}

function disableEditing(): void {
  window.scrollTo(0, 0)
  window.getSelection()?.collapse(document.body, 0)
  document.designMode = "off"
}

export { injectElement, enableEditing, disableEditing }
