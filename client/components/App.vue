<template>
  <div id="app" class="section">
    <router-view></router-view>
  </div>
</template>


<style lang="scss">

  @import "../styles/index.scss";

  body {
    margin: 0;
    font-size: 2rem;
    font-family: -apple-system, BlinkMacSystemFont,
                 'avenir next', avenir,
                 helvetica, 'helvetica neue',
                 Ubuntu,
                 'segoe ui', arial,
                 sans-serif;
  }
  .page {
    text-align: center;
    /* nesting for the need to test postcss */
    code {
      background-color: #f0f0f0;
      padding: 3px 5px;
      border-radius: 2px;
    }
  }
</style>

<script>

export default {

}

</script>