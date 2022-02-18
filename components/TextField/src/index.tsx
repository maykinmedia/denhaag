import React, { ForwardedRef, forwardRef, InputHTMLAttributes } from 'react';
import './index.scss';
import clsx from 'clsx';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Whether the input field is in a error state.
   */
  error?: boolean;
  /**
   * placeholder text for the input (also used as aria-label).
   */
  placeholder?: string;
}

export const TextField: React.FC<TextFieldProps> = forwardRef(function DenHaagTextField(
  props: TextFieldProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const inputClasses = clsx('denhaag-textfield__input', {
    'denhaag-textfield__input--invalid': props.error,
    'denhaag-textfield__input--disabled': props.disabled,
  });

  return (
    <div className={'denhaag-textfield'}>
      <input className={inputClasses} ref={ref} {...props} />
    </div>
  );
});

export default TextField;
