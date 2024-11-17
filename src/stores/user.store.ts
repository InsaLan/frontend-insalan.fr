import axios, { type AxiosError, isAxiosError } from 'axios';
import { defineStore } from 'pinia';
import { computed, type Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { CartElement } from '@/models/cart';
import type { OngoingMatch, ScorePatch } from '@/models/match';
import { PaymentStatus, type PlayerRegistrationDeref, type RegistrationDeref } from '@/models/registration';
import type { User, UserPatch, UserPatchError } from '@/models/user';

import { useNotificationStore } from './notification.store';

export const useUserStore = defineStore('user', () => {
  const user = ref<User>({} as User);
  const isConnected = ref(false);
  const csrf = ref('');
  const connectionTimestamp = ref(0);
  const router = useRouter();
  const NotificationStore = useNotificationStore();
  const ongoing_match = ref<OngoingMatch>({} as OngoingMatch);
  const inscriptions = ref<{
    ongoing: Ref<[string, PlayerRegistrationDeref | RegistrationDeref][]>;
    past: Ref<[string, PlayerRegistrationDeref | RegistrationDeref][]>;
    unpaid: Ref<Record<string, boolean>>;
  }>({
    ongoing: ref([]),
    past: ref([]),
    unpaid: ref({}),
  });
  const MailVerified = ref(false);
  const cart = ref<CartElement[]>([]);
  const { addNotification } = NotificationStore;

  /*
  * Get a new csrf token from the server
  */
  async function get_csrf() {
    await axios.get('/user/get-csrf/');
    let cookie = '';
    document.cookie.split(';').forEach((cookie_value) => {
      if (cookie_value.split('=')[0].trim() === 'csrftoken') {
        cookie = cookie_value.split('=')[1].trim();
      }
    });
    csrf.value = cookie;
  }

  /* API Call to verify an email address (an email with a URL made with the name
   * and the token is sent, we take from it these information and verify them)
   * If both value are correct, the back set the mail on verified, and return a
   * response(), function continue and MailVerified is set on true
   * If one (or both) values are incorrect, an error is returned and catch by the
   * classic error catcher, stopping the function : MailVerified stays on false */
  async function verifMail(props: { idname: string; idtoken: string }) {
    // I set
    MailVerified.value = false;
    await axios.get(`/user/confirm/${props.idname}/${props.idtoken}`);
    // Active only if the API Call doesn't return an error
    MailVerified.value = true;
  }

  async function signin(
    email: string,
    username: string,
    password: string,
    password_validation: string,
    decoy?: string,
  ) {
    await get_csrf();
    const data = {
      username,
      email,
      password,
      password_validation,
      decoy,
    };
    await axios.post('/user/register/', data, {
      headers: {
        'X-CSRFToken': csrf.value,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    addNotification(`Un email de confirmation vous a été envoyé a ${email} pour confirmer votre compte`, 'info');
  }

  async function login(username: string, password: string) {
    await get_csrf();

    try {
      await axios.post('/user/login/', { username, password }, {
        headers: {
          'X-CSRFToken': csrf.value,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      const user_data = await axios.get<User>('/user/me/', { withCredentials: true });
      user.value = user_data.data;
      isConnected.value = true;
      addNotification(`Bienvenue ${username}`, 'info');
      connectionTimestamp.value = Date.now();
      await router.push('/me');
    } catch (err) {
      /* empty */
    }
  }

  async function ask_reset_password(email: string) {
    await get_csrf();
    await axios.post('/user/password-reset/ask/', { email }, {
      headers: {
        'X-CSRFToken': csrf.value,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    addNotification(`Un email de confirmation vous a été envoyé a ${email} pour réinitialiser votre compte`, 'info');
  }

  async function reset_password(username: string, token: string, password: string, password_confirm: string) {
    await get_csrf();
    await axios.post(
      '/user/password-reset/submit/',
      {
        user: username,
        token,
        password,
        password_confirm,
      },
      {
        headers: {
          'X-CSRFToken': csrf.value,
          'Content-Type': 'application/json',
        },
      },
    );
    addNotification('Votre mot de passe a été réinitialisé', 'info');
    await router.push('/register');
  }

  async function logout() {
    await axios.post('/user/logout/', {}, {
      headers: {
        'X-CSRFToken': csrf.value,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    isConnected.value = false;
    user.value = {} as User;
  }

  /*
    * Fetch all the inscription of a user
    * TODO: ADD manager handling
    * @param user_id: the id of the user
  */
  async function fetch_user_inscription_full() {
    try {
      // ref object to store the data
      const ongoing: [string, PlayerRegistrationDeref | RegistrationDeref][] = [];
      const past: [string, PlayerRegistrationDeref | RegistrationDeref][] = [];
      const unpaid: { [key: number]: boolean } = {};
      // Get all the inscription of the user
      const registrations = await axios.get<{ 'player': PlayerRegistrationDeref[]; 'manager': RegistrationDeref[]; 'substitute': PlayerRegistrationDeref[]; 'ongoing_match': OngoingMatch }>('/tournament/me');
      // Set the value of the ref object
      registrations.data.player.forEach((registration) => {
        if (registration.team.tournament.event.ongoing) {
          ongoing.push(['player', registration]);
        } else {
          past.push(['player', registration]);
        }
        // If the registration is not paid, add the tournament to the unpaid object
        if (registration.payment_status === PaymentStatus.NOT_PAID) {
          unpaid[registration.id] = true;
        }
      });
      registrations.data.manager.forEach((registration) => {
        if (registration.team.tournament.event.ongoing) {
          ongoing.push(['manager', registration]);
        } else {
          past.push(['manager', registration]);
        }
        // If the registration is not paid, add the tournament to the unpaid object
        if (registration.payment_status === PaymentStatus.NOT_PAID) {
          unpaid[registration.id] = true;
        }
      });
      registrations.data.substitute.forEach((registration) => {
        if (registration.team.tournament.event.ongoing) {
          ongoing.push(['substitute', registration]);
        } else {
          past.push(['substitute', registration]);
        }
        // If the registration is not paid, add the tournament to the unpaid object
        if (registration.payment_status === PaymentStatus.NOT_PAID) {
          unpaid[registration.id] = true;
        }
      });
      ongoing_match.value = registrations.data.ongoing_match || {} as OngoingMatch;
      inscriptions.value = {
        ongoing,
        past,
        unpaid,
      };
    } catch (err) {
      addNotification('Impossible de récupérer vos inscriptions, veuillez réessayer plus tard ou contacter un administrateur', 'error');
    }
  }

  async function patch_user(data: UserPatch) {
    await get_csrf();
    try {
      const res = await axios.patch('/user/me/', data, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrf.value,
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 200) {
        if (data.current_password) {
          addNotification('Vos informations ont été modifiées, vous devez vous reconnecter', 'info');
          await logout();
        } else {
          user.value = { ...user.value, ...data };
          addNotification('Vos informations ont été modifiées', 'info');
        }
      }
    } catch (err: unknown) {
      const error = err as Error | AxiosError;
      if (isAxiosError(error)) {
        const request = error.request as XMLHttpRequest;
        if (request.status === 403) {
          addNotification('Le mot de passe actuel est différent de celui que vous avez entré', 'error');
        } else if (request.status === 400) {
          const response = JSON.parse(request.responseText) as UserPatchError;
          if (response.user) {
            addNotification(response.user, 'error');
          } else if (response.password) {
            addNotification(response.password, 'error');
          } else {
            addNotification('Une erreur est survenue', 'error');
          }
        }
      }
    }
  }

  async function handle_session_cookie_expiration() {
    const now = Date.now();
    if (
      isConnected.value
      && now - connectionTimestamp.value
      > import.meta.env.VITE_SESSION_COOKIE_AGE * 1000
    ) {
      await logout();
      await router.push('/register');
      addNotification('Votre session a expiré, veuillez vous reconnecter', 'error');
    }
  }

  async function send_score(match: OngoingMatch, data: ScorePatch) {
    await get_csrf();
    const { type } = ongoing_match.value.match_type;
    const { id } = ongoing_match.value.match_type;
    try {
      const res = await axios.patch(`/tournament/${type}/${id}/match/${match.id}`, data, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrf.value,
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 200) {
        addNotification('Le score a bien été mis à jour', 'info');
      }
    } catch (err: unknown) {
      const error = err as Error | AxiosError;
      if (isAxiosError(error)) {
        addNotification(error.response?.data as (string | string[] | { [key: string]: string }), 'error');
      }
    }
    ongoing_match.value = {} as OngoingMatch;
  }

  const role = computed(() => {
    if (user.value.is_superuser) return 'dev';
    if (user.value.is_staff) return 'staff';
    return 'joueur';
  });

  function add_product_to_cart(element: CartElement) {
    cart.value.push(element);
  }

  async function pay_cart() {
    const data = {
      products: cart.value.map((element) => element.product),
    } as Record<string, unknown>;

    const response = await axios.post<{
      redirect_url: string;
    }>('payment/pay/', data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });

    const { redirect_url } = response.data;

    window.location.href = redirect_url;
  }

  function clear_cart() {
    cart.value = [];
  }

  return {
    user,
    signin,
    login,
    logout,
    fetch_user_inscription_full,
    patch_user,
    verifMail,
    ask_reset_password,
    reset_password,
    get_csrf,
    send_score,
    handle_session_cookie_expiration,
    add_product_to_cart,
    pay_cart,
    clear_cart,
    role,
    isConnected,
    inscriptions,
    ongoing_match,
    MailVerified,
    csrf,
    connectionTimestamp,
    cart,
  };
}, { persist: true });
