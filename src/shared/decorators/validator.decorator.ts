/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { registerDecorator } from 'class-validator';
import { get } from 'lodash';
import { REGEX_PASSWORD } from 'src/constants/common.constant';
import Web3 from 'web3';

const web3 = new Web3();

export function IsEqualsTo(property: string[] | string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsEqualsTo',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments): boolean {
          const [comparativePropertyName] = args.constraints;
          const comparativeValue = get(args.object, comparativePropertyName);

          return value === comparativeValue ? true : false;
        },

        defaultMessage(): string {
          return 'ConfirmPassword must same password';
        },
      },
    });
  };
}

export function IsNotEqualsTo(property: string[] | string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsNotEqualsTo',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments): boolean {
          const [comparativePropertyName] = args.constraints;
          const comparativeValue = get(args.object, comparativePropertyName);

          return value !== comparativeValue ? true : false;
        },
      },
    });
  };
}

export function IsValidUrl(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string): void => {
    registerDecorator({
      name: 'url',
      target: object.constructor,
      propertyName,
      constraints: ['property'],
      options: validationOptions,
      validator: {
        validate(value: string): boolean {
          //   const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)(:\d+)?(\.[a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          const protocolRegex = /^https?:\/\//;

          return protocolRegex.test(value);
        },
        defaultMessage(): string {
          return 'Url is not valid';
        },
      },
    });
  };
}

export function IsValidAddr(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string): void => {
    registerDecorator({
      name: 'addr',
      target: object.constructor,
      propertyName,
      constraints: ['property'],
      options: validationOptions,
      validator: {
        validate(value: string): boolean {
          return web3.utils.isAddress(value);
        },
        defaultMessage(): string {
          return 'Wallet address is not valid';
        },
      },
    });
  };
}

export function IsPassword(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'password',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, _validationArguments?: ValidationArguments) {
          let isValidation = true;
          const password = String(value);
          const regex = new RegExp(REGEX_PASSWORD);

          if (!regex.test(password)) {
            isValidation = false;
          }

          if (password.length < 8) {
            isValidation = false;
          }

          return isValidation;
        },
        defaultMessage(): string {
          return 'Password must contain at least 1 uppercase, 1 lowercase, 1 digit, 1 special character and between 8-128 characters';
        },
      },
    });
  };
}
