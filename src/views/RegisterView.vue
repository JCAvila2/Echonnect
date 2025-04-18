<template>
  <div class="login_form">
    <h1>{{ t('register') }}</h1>
    <p v-if="errorMessage" style="color: orange; text-align: center" v-html="errorMessage"></p>
    <form @submit.prevent="register">
      <div class="input_area">
        <div class="txt_field">
          <input v-model="username" required />
          <label> {{ t('username') }} </label>
        </div>
        <div class="txt_field">
          <input v-model="email" required @keyup="validateEmail" />
          <label> {{ t('email') }} </label>
        </div>
        <div class="txt_field">
          <input v-model="password" type="password" required @keyup="validatePassword" />
          <label> {{ t('password') }} </label>
        </div>
        <button 
          type="submit" 
          class="login_button" 
          :class="{ 'disabled-button': !username || !email || !password || errorMessage }" 
          :disabled="!username || !email || !password || errorMessage != ''"
        > 
          {{ t('register') }} 
        </button>
      </div>
    </form>
    <div class="register">
      {{ t('alreadyHaveAccount') }} <router-link to="/login"> {{ t('login') }} </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { useThemeStore } from '@/stores/theme';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const { t, locale } = useI18n();
    const themeStore = useThemeStore();
    document.title = t('register');
    return {
      t,
      locale,
      themeStore,
    };
  },
  watch: {
    locale() {
      document.title = this.t('register');
    }
  },      
  data() {
    return {
      username: '',
      email: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    validateEmail() {
      const regex = /\S+@\S+\.\S+/;
      const isValid = regex.test(this.email);
      if (!isValid) {
        this.errorMessage = this.t('invalidEmail');
      } else {
        this.errorMessage = '';
      }
    },
    validatePassword() {
      if (this.password.length === 0) {
        this.errorMessage = '';
        return false;
      }

      const minLength = 8;
      const hasLowercase = /[a-z]/.test(this.password);
      const hasUppercase = /[A-Z]/.test(this.password);
      const hasDigit = /\d/.test(this.password);
      const isLongEnough = this.password.length >= minLength;

      let errorMessages = [];

      if (!isLongEnough) {
        errorMessages.push(this.t('passwordLength', { minLength }));
      }
      if (!hasLowercase) {
        errorMessages.push(this.t('passwordLowercase'));
      }
      if (!hasUppercase) {
        errorMessages.push(this.t('passwordUppercase'));
      }
      if (!hasDigit) {
        errorMessages.push(this.t('passwordNumber'));
      }

      if (errorMessages.length > 0) {
        this.errorMessage = this.t('weakPassword') + `<br>` + errorMessages.join('<br>');
        return false;
      } else {
        this.errorMessage = '';
        return true;
      }
    },
    register() {
      if (!this.validatePassword()) {
        return;
      }
      const auth = getAuth();
      const db = getFirestore();

      createUserWithEmailAndPassword(auth, this.email, this.password)
        .then(async (userCredential) => {
          const user = userCredential.user;

          await setDoc(doc(db, "users", user.uid), {
            email: this.email,
            username: this.username,
            biography: '',
            profilePicture: null,
            createdAt: serverTimestamp(),
            theme: this.themeStore.theme ?? 'dark',
            language: this.locale ?? 'en',
          });

          this.$router.push('/profile');
        })
        .catch(error => {
          console.log(error.code);
          switch (error.code) {
            case 'auth/email-already-in-use':
              this.errorMessage = this.t('emailInUse');
              break;
            case 'auth/weak-password':
              this.errorMessage = this.t('weakPassword');
              break;
            default:
              this.errorMessage = this.t('invalidEmailOrPassword');
              break;
          }
        });
    },
  }
};
</script>

<style scoped>
.login_form {
  top: 10px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  background-color: var(--color-background);
  border-radius: 10px;
  border: 1px solid black;
  padding-bottom: 20px;
}

.login_form h1 {
  text-align: center;
  padding: 20px 0;
  color: var(--color-text);
  border-bottom: 1px solid silver;
}

.input_area {
  padding: 0 40px;
  box-sizing: border-box;
}

.txt_field {
  position: relative;
  border-bottom: 2px solid #adadad;
  margin: 30px 0;
}

.txt_field input {
  width: 100%;
  padding: 0 5px;
  height: 40px;
  font-size: 16px;
  border: none;
  background: none;
  outline: none;
  color: var(--color-text);
}

.txt_field label {
  position: absolute;
  top: 50%;
  left: 5px;
  color: var(--color-text);
  transform: translateY(-50%);
  font-size: 16px;
  pointer-events: none;
  transition: .5s;
}

.txt_field span::before {
  content: '';
  position: absolute;
  top: 40px;
  left: 0;
  width: 0%;
  height: 2px;
  background: #2691d9;
  transition: .5s;
}

.txt_field input:focus~label,
.txt_field input:valid~label {
  top: -5px;
  color: #2691d9;
}

.txt_field input:focus~span::before,
.txt_field input:valid~span::before {
  width: 100%;
}

ul {
  list-style-position: inside;
  text-align: left;
  padding-left: 20%;
}

.login_button {
  width: 100%;
  height: 50px;
  border: 0px;
  background-color: #2691d9;
  border-radius: 25px;
  font-size: 18px;
  color: #e9f4fb;
  font-weight: 700;
  cursor: pointer;
  outline: none;
}

.login_button:hover {
  background-color: #0056b3;
  transition: .5s;
}

.disabled-button {
  background-color: #adadad;
  cursor: not-allowed;
}

.disabled-button:hover {
  background-color: #adadad;
}

.register {
  margin: 10px 0;
  text-align: center;
  font-size: 16px;
  color: var(--color-text);
}

.register a {
  color: #2691d9;
  text-decoration: none;
}

.register a:hover {
  text-decoration: underline;
}

.options_field {
  color: white;
  text-align: left;
  font-size: 16px;
  padding: 0px 5px;
  margin: 0;
  padding: 0;
  margin-top: 20px;
}

.options_field label {
  margin-left: 5px;
}

select {
  border: 2px solid #2691d9;
  border-radius: 10px;
  margin-top: 10px;
  padding: 2px 5px;
  width: 100%;
}

@media (max-width: 1000px) {
  .login_form {
    width: 95vw;
  }
}
</style>
