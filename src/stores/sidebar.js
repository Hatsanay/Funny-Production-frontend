import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const unfoldable = ref(localStorage.getItem('sidebarUnfoldable') === 'true')
  const visible = ref(undefined)

  const toggleVisible = (value) => {
    visible.value = value !== undefined ? value : !visible.value
  }

  const toggleUnfoldable = () => {
    unfoldable.value = !unfoldable.value
    localStorage.setItem('sidebarUnfoldable', unfoldable.value)
  }

  return { visible, unfoldable, toggleVisible, toggleUnfoldable }
})