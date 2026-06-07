import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description: string
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function showToast(
  type: Toast['type'],
  title: string,
  description?: string
) {
  const id = nextId++
  const toast: Toast = {
    id,
    type,
    title,
    description: description || ''
  }
  toasts.value.push(toast)

  setTimeout(() => {
    removeToast(id)
  }, type === 'error' ? 5000 : 3000)
}

export function removeToast(id: number) {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx === -1) return
  const el = document.querySelector(`[data-toast-id="${id}"]`)
  if (el) {
    el.classList.remove('show')
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 300)
  } else {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }
}

export function useToast() {
  return { toasts, showToast, removeToast }
}
