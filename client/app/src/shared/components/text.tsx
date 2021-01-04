import React, { ReactElement, useState, useRef, KeyboardEvent } from 'react';
import { FieldAction, TextConfig, InputConfig } from './component-model';
import { getThemeClassName, debounce, validate, updateValidatorConfig } from '../utils';
import { FieldValidatorType } from '../shared-model';

interface TextState {
  className: string;
}

export const Text = (props: TextConfig): ReactElement => {
  const componentName = 'field';

  // init
  const {
    themes,
    name,
    type,
    value = '',
    label,
    placeholder = label || name,
    readOnly,
    disabled,
    targetValue,
    validators = [],
    debounceTime = 0,
    onAction,
  } = props;

  const inputEl = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<TextState>({
    className: getThemeClassName(componentName, themes),
  });

  const getInputConfig = () => {
    const _onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
      if (inputEl.current) {
        const { value } = inputEl.current;
        // const { key } = e;
        const validatorConfigs = updateValidatorConfig(validators, {
          field: name,
          label,
          value,
          targetValue,
        });
        const validatorsResult = validate(validatorConfigs);
        const { valid } = validatorsResult;
        if (!valid) {
          setState({ className: getThemeClassName(componentName, themes, ['invalid']) });
        }
        if (onAction) {
          onAction({ event, action: FieldAction.change, name, value, valid, validatorsResult });
        }
      }
    };
    const onKeyUp = debounce(_onKeyUp, debounceTime);
    const inputConfig: InputConfig = {
      name,
      type,
      placeholder,
      readOnly,
      disabled,
      onKeyUp: (e) => onKeyUp(e),
    };
    validators.forEach((validator) => {
      switch (validator.type) {
        case FieldValidatorType.max:
          inputConfig.max = Number(validator.targetValue);
          break;
        case FieldValidatorType.min:
          inputConfig.min = Number(validator.targetValue);
          break;
        case FieldValidatorType.minLength:
          inputConfig.minlength = Number(validator.targetValue);
          break;
        case FieldValidatorType.maxLength:
          inputConfig.maxlength = Number(validator.targetValue);
          break;
        case FieldValidatorType.pattern:
          inputConfig.pattern = validator.targetValue + '';
          break;
        case FieldValidatorType.required:
          inputConfig.required = true;
          break;
      }
    });
    return inputConfig;
  };

  return <input ref={inputEl} {...getInputConfig()} className={state.className}></input>;
};