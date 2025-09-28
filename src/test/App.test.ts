/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import App from '../App.vue'
import i18n from '../plugins/i18n'

describe('App.vue', () => {
  it('renders SUSHIGETA heading', () => {
    // set locale to Japanese for test assertions
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    i18n.global.locale.value = 'ja'
    const plugins = (globalThis as any).__VUE_TESTING_GLOBAL_PLUGINS__ || [i18n]
    render(App, { global: { plugins } })
    expect(screen.getByText('SUSHIGETA')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    // set locale to Japanese for test assertions
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    i18n.global.locale.value = 'ja'
    const plugins2 = (globalThis as any).__VUE_TESTING_GLOBAL_PLUGINS__ || [
      i18n,
    ]
    render(App, { global: { plugins: plugins2 } })
    expect(screen.getByText('プレゼント交換アプリ')).toBeInTheDocument()
  })
})
