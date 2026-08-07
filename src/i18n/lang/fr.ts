import type { Locale } from './locale-type';

const fr: Locale = {
  content: {
    home: {
      'title-tournament': 'Tournois',
      'no-tournament': 'Aucun tournoi n\'est en cours ou à venir pour le moment, revenez plus tard !',
      'see-all-tournament': 'Voir tous les tournois',
    },
    Navigation: {
      home: 'Accueil',
      association: 'Association',
      tournament: 'Tournois',
      info: 'Informations pratiques',
      eat: 'Restauration',
      schedule: 'Planning',
      login: 'S\'identifier',
      staff: 'Staff\u00A0:',
      'admin-panel': 'Panel admin',
      'ticket-scan': 'Scan billets',
      'eating-team': 'Team Bouffe\u00A0:',
      'eating-export-list': 'Liste des exports',
      'eating-pizza-list': 'Liste des pizzas',
      'eating-pizza': 'Menu pizza',
      me: 'Mon compte',
      logout: 'Se déconnecter',
      'label-locale-selector': 'Changer de langue',
    },
    Footer: {
      socials: 'Réseaux',
      credits: 'Code & design\u00A0: équipe Sysrez - Dev',
    },
    NameConfirmationModal: {
      title: 'Confirmez votre nom',
      description: "Nous avons besoin de votre nom pour vérifier votre identité à l'entrée",
      firstname: 'Prénom',
      lastname: 'Nom',
      confirm: 'Confirmer',
    },
    Login: {
      login: 'Se connecter',
      'no-account': "Je n'ai pas de compte",
      username: "Nom d'utilisateur·rice",
      password: 'Mot de passe',
      submit: 'Se connecter',
      'forgotPassword?': 'Mot de passe oublié ?',
      forgotPassword: 'Mot de passe oublié',
      email: 'Email',
      cancel: 'Annuler',
      validate: 'Valider',
      signin: 'S\'enregistrer',
      alreadyExists: 'J\'ai déjà un compte',
      passwordConfirm: 'Répéter mot de passe',
      cgu: 'Conditions générales d\'utilisation',
      acceptCgu: 'J\'accepte les {0} de l\'InsaLan',
    },
    ValidationErrors: {
      invalidEmail: 'Doit être une adresse email valide',
      missingField: 'Champ requis',
      noCGU: 'Veuillez accepter les CGU de l\'InsaLan',
      noRules: 'Veuillez accepter le règlement du tournoi',
      shortPassword: 'La longueur doit être supérieure à {min}',
      longPassword: 'La longueur doit être inférieure à {max}',
      valueBetween: 'La valeur doit être entre {min} et {max}',
      valueSuperior: 'La valeur doit être supérieure à {min}',
      valueLower: 'La valeur doit être inférieure à {max}',
      notInteger: 'La valeur doit être un entier relatif',
    },
    Schedule: {
      unavailable: 'Le planning n\'est pas encore disponible, revenez plus tard !',
      previousDay: 'Jour précédent',
      nextDay: 'Jour suivant',
    },
    Error: {
      title404: 'Page Invalide',
      description404: 'La page que vous cherchez n\'existe pas ou a été supprimée. Si vous pensez que ce message est une erreur, n\'hésitez pas à nous contacter',
      backToHome: 'Page d\'accueil',
    },
    Archive: {
      title: 'Archives',
      noArchives: "Aucune archive n'est disponible pour le moment, revenez plus tard !",
    },
    Association: {
      title: "l'association InsaLan",
    },
  },
};

export default fr;
