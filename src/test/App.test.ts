import { render, screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import App from '../App.vue'

describe('App.vue', () => {
  it('renders SUSHIGETA heading', () => {
    render(App)
    expect(screen.getByText('SUSHIGETA')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(App)
    expect(screen.getByText('プレゼント交換アプリ')).toBeInTheDocument()
  })
})
