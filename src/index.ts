type OnConnect = (element: HTMLElement) => undefined | OnDisconnect
type OnDisconnect = () => void

type Behavior = {
  selector: string
  onConnect: OnConnect
}

const behaviors: Behavior[] = []
const disposables = new WeakMap<HTMLElement, OnDisconnect>()

export const onConnect = (selector: string, onConnect: OnConnect) => {
  behaviors.push({ selector, onConnect })
}

const findElement = (element: Node, selector: string, callback: (e: HTMLElement) => void) => {
  if (!(element instanceof HTMLElement || element instanceof Document)) return

  for (const el of element.querySelectorAll<HTMLElement>(selector)) {
    callback(el)
  }
}

const onLoad = () => {
  for (const behavior of behaviors) {
    findElement(document, behavior.selector, behavior.onConnect)
  }
}

const observe = () => {
  const observer = new MutationObserver((mutations) => {
    for (const behavior of behaviors) {
      for (const mutation of mutations) {
        for (const el of mutation.addedNodes) {
          findElement(el, behavior.selector, (e) => {
            const onDisconnect = behavior.onConnect(e)
            if (onDisconnect) {
              disposables.set(e, onDisconnect)
            }
          })
        }

        for (const el of mutation.removedNodes) {
          findElement(el, behavior.selector, (e) => {
            const onDisconnect = disposables.get(e)
            if (onDisconnect) {
              onDisconnect()
              disposables.delete(e)
            }
          })
        }
      }
    }
  })

  observer.observe(document, { subtree: true, childList: true })
  // NOTE: trigger everything before going
  onLoad()
}

document.addEventListener('DOMContentLoaded', () => {
  observe()
})
