export class SoundUtilities {
  #audioCtx
  #decidedAudioFilePath = import.meta.env.BASE_URL + 'decided.mp3'
  #decidedAudioBuffer: AudioBuffer | undefined
  #rollingAudioFilePath = import.meta.env.BASE_URL + 'drum_loop.mp3'
  #rollingAudioBuffer: AudioBuffer | undefined
  #stoppinfAudioFilePath = import.meta.env.BASE_URL + 'stopping.m4a'
  #stoppingAudioBuffer: AudioBuffer | undefined

  constructor() {
    this.#audioCtx = new AudioContext()
    this.#createAudioBuffer(this.#decidedAudioFilePath).then((audioBuffer) => {
      this.#decidedAudioBuffer = audioBuffer
    })
    this.#createAudioBuffer(this.#rollingAudioFilePath).then((audioBuffer) => {
      this.#rollingAudioBuffer = audioBuffer
    })
    this.#createAudioBuffer(this.#stoppinfAudioFilePath).then((audioBuffer) => {
      this.#stoppingAudioBuffer = audioBuffer
    })
  }

  async #createAudioBuffer(url: string) {
    const arrayBuffer = await fetch(url).then((response) =>
      response.arrayBuffer()
    )
    const audioBuffer = await this.#audioCtx.decodeAudioData(arrayBuffer)
    return audioBuffer
  }

  playDecided() {
    if (this.#decidedAudioBuffer === undefined) {
      return
    }
    const source = this.#audioCtx.createBufferSource()
    source.buffer = this.#decidedAudioBuffer
    source.connect(this.#audioCtx.destination)
    source.start(0)
  }

  playStopping() {
    if (this.#stoppingAudioBuffer === undefined) {
      return
    }
    const source = this.#audioCtx.createBufferSource()
    source.buffer = this.#stoppingAudioBuffer
    source.connect(this.#audioCtx.destination)
    source.start(0)
  }

  playRolling() {
    if (this.#rollingAudioBuffer === undefined) {
      return undefined
    }
    const source = this.#audioCtx.createBufferSource()
    source.buffer = this.#rollingAudioBuffer
    source.connect(this.#audioCtx.destination)
    source.loop = true
    source.start(0)
    return source
  }

  async stopRolling(source: AudioBufferSourceNode | undefined) {
    if (source === undefined) {
      return
    }
    source.stop()
  }
}
