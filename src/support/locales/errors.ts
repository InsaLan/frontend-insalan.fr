import {
  between as vbetween,
  email as vemail,
  helpers,
  integer as vinteger,
  maxLength as vmaxLength,
  maxValue as vmaxValue,
  minLength as vminLength,
  minValue as vminValue,
  required as vrequired,
  sameAs as vsameAs,
} from '@vuelidate/validators';
import type { Ref } from 'vue';
import i18n from '@/i18n';

const { t } = i18n.global;

export const email = helpers.withMessage(t('validationErrors.invalidEmail'), vemail);
export const required = helpers.withMessage(t('validationErrors.missingField'), vrequired);
export const acceptGCU = helpers.withMessage(t('validationErrors.nocgu'), (value) => value === true);
export const acceptRules = helpers.withMessage(t('validationErrors.noRules'), (value) => value === true);
export const sameAs = <E = unknown>(equalTo: E | Ref<E>, otherName: string = 'champs') => helpers.withMessage(`Les ${otherName} doivent être identiques`, vsameAs(equalTo, otherName));
export const minLength = (min: number | Ref<number>) => helpers.withMessage(
  ({
    $params,
  }) => t('validationErrors.shortPassword', { min: $params.min }),
  vminLength(min),
);
export const maxLength = (max: number | Ref<number>) => helpers.withMessage(
  ({
    $params,
  }) => t('validationErrors.longPassword', { max: $params.max }),
  vmaxLength(max),
);
export const between = (min: number | Ref<number>, max: number | Ref<number>) => helpers.withMessage(
  ({
    $params,
  }) => t('validationErrors.valueBetween', { min: $params.min, max: $params.max }),
  vbetween(min, max),
);
export const minValue = (min: number | Ref<number> | string | Ref<string>) => helpers.withMessage(
  ({
    $params,
  }) => t('validationErrors.valueSuperior', { min: $params.min }),
  vminValue(min),
);
export const maxValue = (max: number | Ref<number> | string | Ref<string>) => helpers.withMessage(
  ({
    $params,
  }) => t('validationErrors.valueLower', { max: $params.max }),
  vmaxValue(max),
);
export const integer = helpers.withMessage(t('validationErrors.notInteger'), vinteger);
