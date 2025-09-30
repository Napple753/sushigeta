<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { Participant } from '@/types'

const props = withDefaults(
  defineProps<{
    /** 候補者 */
    candidate: Participant
    /** 横幅[rem] */
    lotterySize?: number
  }>(),
  {
    lotterySize: 30,
  }
)

const main_info: Ref<HTMLElement | null> = ref(null)
const mainScale = ref(1)
const info_wrapper: Ref<HTMLElement | null> = ref(null)

onMounted(() => {
  if (main_info.value == null || info_wrapper.value == null) {
    return
  }

  const baseW = info_wrapper.value.clientWidth

  const mainW = main_info.value.clientWidth
  if (mainW > baseW) {
    mainScale.value = baseW / mainW
  }
})

const LotteryHeight = computed(() => `${props.lotterySize / 3}rem`)
const mainFontSize = computed(() => `${(props.lotterySize / 30) * 2}rem`)
</script>

<template>
  <div class="candidate_wrapper">
    <div ref="info_wrapper" class="candidate">
      <p ref="main_info" class="main_info">
        {{ candidate.name }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.candidate_wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: v-bind(LotteryHeight);
  width: 100%;
  min-width: 0; /* allow flex child to shrink without becoming zero width container */
  box-sizing: border-box;
  border: 1px solid grey;
  overflow: hidden;
}
.candidate {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}
.candidate p {
  margin: 0;
  user-select: all;
  white-space: nowrap;
  transform-origin: center;
  transform: scaleX(var(--scale));
}
.main_info {
  font-size: v-bind(mainFontSize);
  font-weight: 800;
  --scale: v-bind(mainScale);
}
</style>
