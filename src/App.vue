<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav class="navbar">
      <router-link to="/">
        <div class="brand-title">
          <img src="@/assets/logo.svg">
            <h1>Echonnect</h1>
        </div>
      </router-link>

      <div class="navbar-links">
        <ul>
          <li> <router-link to="/search"> Search </router-link> </li>
          <li> <router-link to="/profile"> Profile </router-link> </li>
          <li> <router-link to="/upload"> Upload </router-link> </li>
          <li> <router-link to="/settings"> Settings </router-link> </li>
        </ul>
      </div>
    </nav>

  </header>

  <RouterView />
</template>

<!-- Non-scoped styles, global to the app -->
<style>
:root {
  --header-height: 80px; /* Adjust according to the header height */
}
</style>

<!-- Scoped styles for the component -->
<style scoped>
header {
  background-color: black;
  padding: 0px 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: var(--header-height);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* max-width: 1200px; */ /* Adjust according to the header width */
  height: 100%;
}

.brand-title {
  padding-left: 10px;
  display: flex;
  align-items: center;
}

.brand-title img {
  height: 40px;
  margin-right: 10px;
}

.brand-title h1 {
  color: white;
  font-size: 2.5rem;
}

.navbar-links ul {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  height: var(--header-height);
  align-items: center;
}

.navbar-links li {
  height: 100%;
}

.navbar-links a {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 50px; /* Adjust padding to control the clickable area */
  color: white;
  text-decoration: none;
  font-size: 18px;
  height: 100%;
}

/* TODO: change colors */
.navbar-links a:hover {
  color: black;
  background-color: gray;
}


/* Margin to the top of the page content to avoid overlapping */
body {
  margin-top: var(--header-height);
}

</style>
