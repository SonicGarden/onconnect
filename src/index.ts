type OnConnect = (element: HTMLElement) => void | OnDisconnect
type OnDisconnect = () => void

type Behavior = {
  selector: string
  onConnect: OnConnect
}

let observed = false
const behaviors: Behavior[] = []
const disposables = new WeakMap<HTMLElement, OnDisconnect>()

const domReady = () => {
  if (document.readyState !== 'loading') {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    document.addEventListener('DOMContentLoaded', () => {
      resolve()
    })
  })
}

export const onConnect = async (selector: string, callback: OnConnect) => {
  await domReady()

  const behavior = { selector, onConnect: callback }
  behaviors.push(behavior)

  if (!observed) {
    observe()
  }

  // NOTE: trigger everything before going
  initBehavior(document, behavior)
}

const eachElements = (element: Node, selector: string, callback: (e: HTMLElement) => void) => {
  if (!(element instanceof HTMLElement || element instanceof Document)) return

  if (element instanceof HTMLElement && element.matches(selector)) {
    callback(element)
  }
  for (const el of element.querySelectorAll<HTMLElement>(selector)) {
    callback(el)
  }
}

const initBehavior = (parent: Node, behavior: Behavior) => {
  eachElements(parent, behavior.selector, (e) => {
    const onDisconnect = behavior.onConnect(e)
    if (onDisconnect) {
      disposables.set(e, onDisconnect)
    }
  })
}

const observe = () => {
  const observer = new MutationObserver((mutations) => {
    for (const behavior of behaviors) {
      for (const mutation of mutations) {
        for (const el of mutation.addedNodes) {
          initBehavior(el, behavior)
        }

        for (const el of mutation.removedNodes) {
          eachElements(el, behavior.selector, (e) => {
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
  observed = true
}
