export type Locale = {
  content: {
    home: {
      'title-tournament': string;
      'no-tournament': string;
      'see-all-tournament': string;
    };
    Navigation: {
      'home': string;
      'association': string;
      'tournament': string;
      'info': string;
      'eat': string;
      'schedule': string;
      'login': string;
      'staff': string;
      'admin-panel': string;
      'ticket-scan': string;
      'eating-team': string;
      'eating-export-list': string;
      'eating-pizza-list': string;
      'eating-pizza': string;
      'me': string;
      'logout': string;
      'label-locale-selector': string;
    };
    Footer: {
      'socials': string;
      'credits': string;
    };
    NameConfirmationModal: {
      title: string;
      description: string;
      firstname: string;
      lastname: string;
      confirm: string;
    };
    Login: { // contains Login.vue + Register.vue field as they are very similar
      signin: string;
      alreadyExists: string;
      passwordConfirm: string;
      cgu: string;
      acceptCgu: string;
      login: string;
      'no-account': string;
      username: string;
      password: string;
      submit: string;
      'forgotPassword?': string;
      forgotPassword: string;
      email: string;
      cancel: string;
      validate: string;
    };
    ValidationErrors: {
      invalidEmail: string;
      missingField: string;
      noCGU: string;
      noRules: string;
      shortPassword: string;
      longPassword: string;
      valueBetween: string;
      valueSuperior: string;
      valueLower: string;
      notInteger: string;
    };
  };
};
