# onconnect

Run something when a DOM element appears and when it exits.

## Installation

```
npm install @sonicgarden/onconnect
yarn add @sonicgarden/onconnect
pnpm install @sonicgarden/onconnect
```

## Usage

```javascript
import { onConnect } from '@sonicgarden/onconnect'

onConnect('[data-popover]', (el) => {
  const popover = new Popover(el)

  // optional
  return () => {
    popover.destroy()
  }
})
```

Inspired by [onmount](https://www.npmjs.com/package/onmount).
