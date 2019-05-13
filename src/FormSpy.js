// @flow
import * as React from 'react'
import renderComponent from './renderComponent'
import type { FormSpyPropsWithForm as Props, FormSpyRenderProps } from './types'
import type { FormApi } from 'final-form'
import isSyntheticEvent from './isSyntheticEvent'
import useFormState from './useFormState'
import ReactFinalFormContext from './context'

const FormSpy = ({ onChange, subscription, ...rest }: Props) => {
  const reactFinalForm: ?FormApi = React.useContext(ReactFinalFormContext)
  // istanbul ignore next
  if (process.env.NODE_ENV !== 'production' && !reactFinalForm) {
    console.error(
      'Warning: FormSpy must be used inside of a ReactFinalForm component'
    )
  }
  const state = useFormState({ onChange, subscription })
  const renderProps: FormSpyRenderProps = {
    form: {
      ...reactFinalForm,
      reset: eventOrValues => {
        if (isSyntheticEvent(eventOrValues)) {
          // it's a React SyntheticEvent, call reset with no arguments
          reactFinalForm && reactFinalForm.reset()
        } else {
          reactFinalForm && reactFinalForm.reset(eventOrValues)
        }
      }
    }
  }
  return onChange
    ? null
    : renderComponent(
        {
          ...rest,
          ...state,
          ...renderProps
        },
        'FormSpy'
      )
}

export default FormSpy
