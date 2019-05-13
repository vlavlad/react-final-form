import React from 'react'
import { render, fireEvent, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'
import Form from './ReactFinalForm'
import Field from './Field'
import useField from './useField'

const onSubmitMock = values => {}

describe('useField', () => {
  afterEach(cleanup)

  // Most of the functionality of useField is tested in Field.test.js
  // This file is only for testing its use as a hook in other components

  it('should warn if not used inside a form', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const MyFieldComponent = () => {
      useField('name')
      return <div />
    }
    render(<MyFieldComponent />)
    expect(errorSpy).toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: useField must be used inside of a ReactFinalForm component'
    )
    errorSpy.mockRestore()
  })

  it('should track field state', () => {
    const spy = jest.fn()
    const MyFieldListener = () => {
      spy(useField('name').input.value)
      return null
    }
    const { getByTestId } = render(
      <Form onSubmit={onSubmitMock}>
        {() => (
          <form>
            <Field name="name" component="input" data-testid="name" />
            <MyFieldListener />
          </form>
        )}
      </Form>
    )
    expect(getByTestId('name').value).toBe('')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toBeUndefined()
    fireEvent.change(getByTestId('name'), { target: { value: 'erikras' } })
    expect(getByTestId('name').value).toBe('erikras')
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy.mock.calls[1][0]).toBe('erikras')
  })

  it('should allow for creation of render-controlled components', () => {
    const spy = jest.fn()
    const MemoizedDirtyDisplay = React.memo(({ dirty }) => {
      spy(dirty)
      return <div data-testid="dirty">{dirty ? 'Dirty' : 'Pristine'}</div>
    })
    const MyFieldListener = () => {
      const field = useField('name', { subscription: { dirty: true } })
      return <MemoizedDirtyDisplay dirty={field.meta.dirty} />
    }
    const { getByTestId } = render(
      <Form onSubmit={onSubmitMock}>
        {() => (
          <form>
            <Field name="name" component="input" data-testid="name" />
            <MyFieldListener />
          </form>
        )}
      </Form>
    )
    expect(getByTestId('name').value).toBe('')
    expect(getByTestId('dirty')).toHaveTextContent('Pristine')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toBe(false)
    // simulate typing
    fireEvent.change(getByTestId('name'), { target: { value: 'e' } })
    expect(getByTestId('dirty')).toHaveTextContent('Dirty')
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy.mock.calls[1][0]).toBe(true)
    fireEvent.change(getByTestId('name'), { target: { value: 'er' } })
    fireEvent.change(getByTestId('name'), { target: { value: 'eri' } })
    fireEvent.change(getByTestId('name'), { target: { value: 'erik' } })
    fireEvent.change(getByTestId('name'), { target: { value: 'erikr' } })
    fireEvent.change(getByTestId('name'), { target: { value: 'erikra' } })
    fireEvent.change(getByTestId('name'), { target: { value: 'erikras' } })
    // dirty flag hasn't changed since the first character
    expect(spy).toHaveBeenCalledTimes(2)
    // make pristine again
    fireEvent.change(getByTestId('name'), { target: { value: '' } })
    expect(getByTestId('dirty')).toHaveTextContent('Pristine')
    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy.mock.calls[2][0]).toBe(false)
  })
})