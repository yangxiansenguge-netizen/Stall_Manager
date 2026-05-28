<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BusinessScreen from '../screens/BusinessScreen.vue'

const route = useRoute()
const view = ref<'main' | 'products' | 'manualOrder'>(
  (route.query.view as 'main' | 'products' | 'manualOrder') || 'main'
)

watch(() => route.query.view, (v) => {
  if (v) view.value = v as 'main' | 'products' | 'manualOrder'
})
</script>

<template>
  <BusinessScreen :initial-view="view" @view-change="(v: any) => view = v" />
</template>
