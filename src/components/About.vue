<template>
    <div class="about">
        <h1>About</h1>
        <p>{{ msg }}</p>
    </div>
</template>


<script lang="ts" >
    export default {
        setup() {
            console.log('setup');
        },
        props: {
            msg: String
        }
    }
</script>