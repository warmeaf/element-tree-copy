import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'Hello Vitest'
    const wrapper = mount(HelloWorld, {
      propsData: { msg }
    })
    expect(wrapper.text()).toContain(msg)
  })

  it('increments count when button is clicked', async () => {
    const wrapper = mount(HelloWorld, {
      propsData: { msg: 'Test' }
    })
    
    const button = wrapper.find('button')
    expect(button.text()).toContain('count is 0')
    
    await button.trigger('click')
    expect(button.text()).toContain('count is 1')
    
    await button.trigger('click')
    expect(button.text()).toContain('count is 2')
  })

  it('has the correct component name', () => {
    const wrapper = mount(HelloWorld, {
      propsData: { msg: 'Test' }
    })
    expect(wrapper.vm.$options.name).toBe('HelloWorld')
  })
})

