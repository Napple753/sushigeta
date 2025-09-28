import '@testing-library/jest-dom'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import i18n from '@/plugins/i18n'

// Polyfill ResizeObserver for Vuetify layout in jsdom
class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}

declare global {
  // Holder for global plugins used by @testing-library/vue render calls
  // eslint-disable-next-line no-var
  var __VUE_TESTING_GLOBAL_PLUGINS__: unknown[]
}

type ResizeObserverCtor = new (...args: unknown[]) => unknown
const g: { ResizeObserver?: ResizeObserverCtor } = globalThis as never
if (!g.ResizeObserver) {
  g.ResizeObserver = ResizeObserverPolyfill as unknown as ResizeObserverCtor
}

// Create a Vuetify instance for tests. This uses the project's vuetify defaults
// (icons/locale/theme) from the plugin if needed, but we create a minimal instance here.
const vuetifyTestInstance = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})

// Expose common plugins for tests to consume. Use this inside render: { global: { plugins: __VUE_TESTING_GLOBAL_PLUGINS__ } }
globalThis.__VUE_TESTING_GLOBAL_PLUGINS__ = [vuetifyTestInstance, i18n]
