import ReactDOM from "react-dom"

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

function appendJsxToBody(component: JSX.Element): void {
  const container = document.createElement("div")
  document.body.appendChild(container)
  ReactDOM.render(component, container)
}

export { injectElement, enableEditing, disableEditing, appendJsxToBody }
