<script setup lang="ts">
import { inject, ref, onMounted, computed } from 'vue'
import type { Ref } from 'vue'
import type { Participant } from '@/types'
import { wait } from '@/logic/wait'
import { getDummyList } from '@/logic/getDummyList'
import { SoundUtilities } from '@/logic/SoundUtilities'

import CandidateViewer from './CandidateViewer.vue'
const emit = defineEmits<{
  (e: 'finishDraw'): void
  (e: 'redraw', winner: Participant): void
}>()

const props = withDefaults(
  defineProps<{
    /** 当選者 */
    winner: Participant
    /** ダミー当選者作成用の候補者 */
    candidates: Participant[]
    /** ロールの省略 */
    isSimple?: boolean
    /** 読み込みと同時にロール開始 */
    immediate?: boolean
    /** ドラムロール音を再生 */
    playDrumRoll?: boolean
    /** 横幅[rem] */
    lotterySize?: number
  }>(),
  {
    lotterySize: 30,
  }
)

const bottom_pos: Ref<number> = ref(0)
const transition_duration: Ref<number> = ref(0)
const isDeciding: Ref<boolean> = ref(false)

const displayWinner: Ref<Participant | null> = ref(null)
const displayCandidates: Ref<Participant[]> = ref([])

const soundUtilities = inject<SoundUtilities>('soundUtilities')

const uniqueID = ref(Date.now())

onMounted(() => {
  if (props.immediate) {
    draw(5 * 1000, Math.floor(Math.random() * 2))
  }
})

async function moveTo(pos: number, time: number = 0) {
  transition_duration.value = time
  bottom_pos.value = pos
  await wait(Math.max(time, 10))
  transition_duration.value = 0
}

async function draw(
  drawingTime = 10 * 1000,
  teasing: number | undefined = undefined
) {
  // Debug: visual drumroll start
  try {
    // winner may be undefined temporarily; guard access
    // eslint-disable-next-line no-console
    console.log('[NameLotteryCore] draw start', {
      drawingTime,
      teasing,
      winner: props.winner?.name ?? props.winner?.id,
      candidates: props.candidates.length,
      playDrumRoll: props.playDrumRoll,
    })
  } catch {
    /* noop for debug log */
  }
  //const targetTS = Date.now() + drawingTime;
  const unitTime = 500 //一人あたりの表示時間
  const simpleDrawingTime = 6000

  isDeciding.value = false
  const winner = props.winner
  if (props.candidates.length <= 0 || winner == null) {
    return
  }

  const isSimple = props.isSimple && drawingTime > simpleDrawingTime

  const waitingTime = isSimple ? simpleDrawingTime : drawingTime

  const displayCandidateCount = Math.ceil((waitingTime / unitTime) * 2)
  await moveTo(-displayCandidateCount * 100, 0) //表示時間をもとにくじに出す人数を決定
  if (isSimple) {
    await wait(drawingTime - simpleDrawingTime)
  }

  displayCandidates.value = getDummyList(
    props.candidates,
    displayCandidateCount,
    winner
  )
  displayWinner.value = winner
  if (teasing === undefined) {
    teasing = Math.ceil((Math.random() * 2) ** 2) - 1 //一旦停止する人数
  }

  //playDrumRollがtrueだったらドラムロール音を再生
  if (props.playDrumRoll) {
    // eslint-disable-next-line no-console
    console.log('[NameLotteryCore] drumroll audio start')
  }
  const drumroll = props.playDrumRoll && soundUtilities?.playRolling()

  await moveTo(-teasing * 95, waitingTime - unitTime * teasing)
  for (let i = teasing - 1; i >= 0; i--) {
    await moveTo(-i * 95, unitTime - 50)
    await wait(50)
  }

  soundUtilities?.playDecided()
  await wait(50)
  isDeciding.value = true

  emit('finishDraw')
  // eslint-disable-next-line no-console
  console.log('[NameLotteryCore] draw finished')
  if (drumroll) {
    soundUtilities?.stopRolling(drumroll)
  }
}

defineExpose({ draw })

const LotteryWidth = computed(() => `${props.lotterySize}rem`)
const LotteryHeight = computed(() => `${props.lotterySize / 3}rem`)
</script>

<template>
  <div class="lottery" :class="{ isDeciding: isDeciding }">
    <div
      class="inner"
      :style="{
        bottom: bottom_pos + '%',
        transitionDuration: transition_duration + 'ms',
      }"
    >
      <div
        v-for="candidate in displayCandidates"
        :key="uniqueID + candidate.id"
        class="dummyCandidates"
      >
        <CandidateViewer
          :key="uniqueID + candidate.id"
          :candidate="candidate"
          :lottery-size="lotterySize"
        ></CandidateViewer>
      </div>
      <div v-if="displayWinner" class="winner">
        <CandidateViewer
          :key="uniqueID + displayWinner.id"
          :candidate="displayWinner"
          :lottery-size="lotterySize"
        ></CandidateViewer>
      </div>
    </div>
    <div v-show="displayCandidates.length === 0" class="loader"></div>
  </div>
</template>

<style scoped>
.lottery {
  height: v-bind(LotteryHeight);
  width: 100%;
  max-width: v-bind(LotteryWidth);
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0.2rem 0.2rem 1rem rgba(0, 0, 0, 0.5);
  border: 1px grey solid;
}
.inner {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  transition-property: bottom;
  /*transition-timing-function: ease-out;*/
}
.isDeciding .winner {
  background-color: yellow;
  color: red;
  box-shadow: none;
}
.isDeciding .inner {
  transform: scale(1.25);
  transform-origin: center center;
  transition: transform 0.5s;
}

/* HTML: <div class="loader"></div> */
.loader {
  width: 60px;
  height: 100%;
  aspect-ratio: 4;
  background: radial-gradient(circle closest-side, #888 90%, #8880) 0 /
    calc(100% / 3) 100% space;
  clip-path: inset(0 100% 0 0);
  animation: l1 1s steps(4) infinite;
  margin: auto;
  vertical-align: middle;
}
@keyframes l1 {
  to {
    clip-path: inset(0 -34% 0 0);
  }
}
</style>
