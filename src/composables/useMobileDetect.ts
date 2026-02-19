import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useMobileDetect() {
  const isMobile = ref(false)
  const isTouch = ref(false)
  const isKeyboardOpen = ref(false)

  function update() {
    isMobile.value = window.innerWidth < 768
    isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  function handleResize() {
    // Detect keyboard via visualViewport
    if (window.visualViewport) {
      isKeyboardOpen.value = window.visualViewport.height < window.innerHeight * 0.75
    }
    update()
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    window.visualViewport?.removeEventListener('resize', handleResize)
  })

  return { isMobile, isTouch, isKeyboardOpen }
}

