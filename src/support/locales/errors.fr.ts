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

export const email = helpers.withMessage('Doit être une adresse email valide', vemail);
export const required = helpers.withMessage('Champ requis', vrequired);
export const acceptGCU = helpers.withMessage('Veuillez accepter les CGU de l\'InsaLan', (value) => value === true);
export const acceptRules = helpers.withMessage('Veuillez accepter le règlement du tournoi', (value) => value === true);
export const sameAs = <E = unknown>(equalTo: E | Ref<E>, otherName: string = 'champs') => helpers.withMessage(`Les ${otherName} doivent être identiques`, vsameAs(equalTo, otherName));
export const minLength = (min: number | Ref<number>) => helpers.withMessage(
  ({
    $params,
  }) => `La longueur doit être supérieur à ${$params.min}`,
  vminLength(min),
);
export const maxLength = (max: number | Ref<number>) => helpers.withMessage(
  ({
    $params,
  }) => `La longueur doit être inférieur à ${$params.max}`,
  vmaxLength(max),
);
export const between = (min: number | Ref<number>, max: number | Ref<number>) => helpers.withMessage(
  ({
    $params,
  }) => `La valeur doit être comprise entre ${$params.min} et ${$params.max}`,
  vbetween(min, max),
);
export const minValue = (min: number | Ref<number> | string | Ref<string>) => helpers.withMessage(
  ({
    $params,
  }) => `La valeur doit être supérieur à ${$params.min}`,
  vminValue(min),
);
export const maxValue = (max: number | Ref<number> | string | Ref<string>) => helpers.withMessage(
  ({
    $params,
  }) => `La valeur doit être inférieur à ${$params.max}`,
  vmaxValue(max),
);
export const integer = helpers.withMessage('Doit être un entier relatif', vinteger);
