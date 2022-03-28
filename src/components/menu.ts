import { computed, getCurrentInstance, onUnmounted, reactive } from 'vue'

type MenuStatus = 'opened' | 'closed'

const refMap = new WeakMap()
function createState() {
  return reactive({
    status: 'closed' as MenuStatus,
    style: '',
  })
}

export function useMenu() {
  const inst = getCurrentInstance()
  if (!inst) {
    throw Error('Cannot use useMenu outside of component setup context.')
  }

  if (!refMap.has(inst)) {
    refMap.set(inst, createState())
  }
  const menu = refMap.get(inst)

  function open() {
    window.event?.stopImmediatePropagation()
    const target = window.event?.currentTarget as HTMLElement
    if (!target) return

    const rect = target.getBoundingClientRect()

    menu.style = `top:${rect.bottom}px;right:${
      document.body.clientWidth - rect.right
    }px;`
    menu.status = 'opened'
    window.addEventListener('click', close)
  }

  function close() {
    menu.style = ''
    menu.status = 'closed'
    window.removeEventListener('click', close)
  }

  function toggle() {
    if (menu.status === 'opened') {
      close()
    } else {
      open()
    }
  }

  onUnmounted(() => {
    close()
  })

  return reactive({
    open,
    close,
    toggle,
    status: computed(() => menu.status),
    style: computed(() => menu.style),
  })
}
