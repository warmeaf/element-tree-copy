import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import App from '../../App.vue'
import HelloWorld from '../HelloWorld.vue'

describe('App.vue', () => {
  it('renders HelloWorld component', () => {
    const wrapper = mount(App)
    expect(wrapper.findComponent(HelloWorld).exists()).toBe(true)
  })

  it('passes correct props to HelloWorld', () => {
    const wrapper = mount(App)
    const helloWorld = wrapper.findComponent(HelloWorld)
    expect(helloWorld.props('msg')).toBe('Vite + Vue 2')
  })

  it('renders logo images', () => {
    const wrapper = mount(App)
    const images = wrapper.findAll('img')
    expect(images.length).toBe(2)
    expect(images.at(0).attributes('alt')).toBe('Vite logo')
    expect(images.at(1).attributes('alt')).toBe('Vue logo')
  })
})

