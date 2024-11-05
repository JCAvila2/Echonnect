<template>
  <div class="login_form">
    <h1>{{ t('loginLabel') }}</h1>
    <p v-if="errorMessage" style="color: red; text-align: center;">{{ errorMessage }}</p>
    <form @submit.prevent="login">
      <div class="input_area">
        <div class="txt_field">
          <input v-model="email" required />
          <label> {{ t('email') }} </label>
        </div>
        <div class="txt_field">
          <input v-model="password" type="password" required />
          <label> {{ t('password') }} </label>
        </div>
        <button type="submit" class="login_button"> {{ t('login') }} </button>
      </div>
    </form>
    <div class="register">
      {{ t('forgotPassword') }} <div @click="changePassword" class="changePassword"> {{ t('changePassword') }} </div>
    </div>
    <div class="register">
      {{ t('dontHaveAccount') }} <router-link to="/register"> {{ t('register') }} </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const { t, locale } = useI18n();
    document.title = t('login');
    return {
      t,
      locale,
    };
  },
  watch: {
    locale() {
      document.title = this.t('login');
    }
  },  
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    login() {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, this.email, this.password)
        .then(() => {
          this.$router.push('/profile');
        })
        .catch(error => {
          console.log(error.code);
          switch (error.code) {
            case 'auth/user-not-found':
              this.errorMessage = this.t('incorrectEmail');
              break;
            case 'auth/wrong-password':
              this.errorMessage = this.t('incorrectPassword');
              break;
            default:
              this.errorMessage = this.t('incorrectCredentials');
              break;
          }
        });
    },
    changePassword() {
      const label = 'Enter your email';
      const response = 'An email has been sent to change your password, change it and try again';

      const emailInput = prompt(label);
      if (emailInput) {
        const auth = getAuth();
        sendPasswordResetEmail(auth, emailInput)
          .then(() => {
            alert(response);
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
  }
};
</script>

<style>
.login_form {
  top: 10px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  background: #19282D;
  border-radius: 10px;
  border: 1px solid black;
  padding-bottom: 20px;
}

.login_form h1 {
  text-align: center;
  padding: 20px 0;
  color: white;
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
  color: white;
}

.txt_field label {
  position: absolute;
  top: 50%;
  left: 5px;
  color: white;
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
  border: 1px solid;
  background: #2691d9;
  border-radius: 25px;
  font-size: 18px;
  color: #e9f4fb;
  font-weight: 700;
  cursor: pointer;
  outline: none;
}

.login_button:hover {
  border-color: #2691d9;
  transition: .5s;
}


.register {
  margin: 10px 0;
  text-align: center;
  font-size: 16px;
  color: white;
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


.changePassword {
  color: #2691d9;
  display: inline-block;
}

.changePassword:hover {
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 1000px) {
  .login_form {
    width: 95vw;
  }
}
</style>
