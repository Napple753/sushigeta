import { ref, computed, watch } from 'vue'
import type {
  Participant,
  AppState,
  NormalizeName,
  ExchangeValidationResult,
} from '@/types'

// Local storage key
const STORAGE_KEY = 'sushigeta:v1'

// Name normalization function
const normalizeName: NormalizeName = (name: string) => {
  return name.trim().normalize('NFKC').toLowerCase()
}

// Create initial state
const createInitialState = (): AppState => ({
  participants: [],
  groups: [],
  assignments: [],
  currentStep: 1, // Start from group management (was participant input)
  isExchangeReady: false,
  isCheckingExchange: false,
  errorMessage: null,
})

// Global state
const state = ref<AppState>(createInitialState())

// Load from localStorage
const loadFromStorage = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      state.value.participants = parsed.participants || []
      state.value.groups = parsed.groups || []
      // stepは保持する必要なし。再読込時は入力画面から再入力
    }
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
  }
}

// Save to localStorage
const saveToStorage = (): void => {
  try {
    const toSave = {
      participants: state.value.participants,
      groups: state.value.groups,
      // stepは保持する必要なし。再読込時は入力画面から再入力
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

// Debounced save
let saveTimeout: number | null = null
const debouncedSave = (): void => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = window.setTimeout(saveToStorage, 300)
}

export function useSushigetaState() {
  // Initialize state on first use
  if (
    state.value.participants.length === 0 &&
    state.value.groups.length === 0
  ) {
    loadFromStorage()
  }

  // Computed properties
  const participantCount = computed(() => state.value.participants.length)

  const duplicateNames = computed(() => {
    const names = state.value.participants.map((p) => normalizeName(p.name))
    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index
    )
    return [...new Set(duplicates)]
  })

  const hasDuplicates = computed(() => duplicateNames.value.length > 0)

  const canProceedToGrouping = computed(
    () => participantCount.value >= 2 && !hasDuplicates.value
  )

  const groupedParticipants = computed(() => {
    const grouped = new Map<string, Participant[]>()
    state.value.participants.forEach((participant) => {
      const groupId = participant.groupId || participant.id
      if (!grouped.has(groupId)) {
        grouped.set(groupId, [])
      }
      grouped.get(groupId)!.push(participant)
    })
    return grouped
  })

  const maxGroupSize = computed(() => {
    let max = 0
    groupedParticipants.value.forEach((participants) => {
      max = Math.max(max, participants.length)
    })
    return max
  })

  // Actions
  const addParticipant = (name: string): string => {
    if (!name.trim()) return ''

    const id = `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const participant: Participant = {
      id,
      name: name.trim(),
      groupId: id, // Initially each participant is in their own group
    }

    state.value.participants.push(participant)
    debouncedSave()
    return id
  }

  const removeParticipant = (id: string): void => {
    state.value.participants = state.value.participants.filter(
      (p) => p.id !== id
    )
    cleanupEmptyGroups()
    debouncedSave()
  }

  const updateParticipantName = (id: string, name: string): void => {
    const participant = state.value.participants.find((p) => p.id === id)
    if (participant) {
      participant.name = name.trim()
      debouncedSave()
    }
  }

  const moveParticipantToGroup = (
    participantId: string,
    groupId: string
  ): void => {
    const participant = state.value.participants.find(
      (p) => p.id === participantId
    )
    if (participant) {
      ensureGroupExists(groupId)
      participant.groupId = groupId
      cleanupEmptyGroups()
      debouncedSave()
    }
  }

  const ensureGroupExists = (groupId: string): void => {
    if (!state.value.groups.some((g) => g.id === groupId)) {
      const group: import('@/types').Group = {
        id: groupId,
        label: String(state.value.groups.length + 1),
      }
      state.value.groups.push(group)
    }
  }

  const moveParticipantToOwnGroup = (participantId: string): void => {
    const participant = state.value.participants.find(
      (p) => p.id === participantId
    )
    if (!participant) return
    const targetId = participant.id
    ensureGroupExists(targetId)
    participant.groupId = targetId
    cleanupEmptyGroups()
    debouncedSave()
  }

  const createNewGroup = (): string => {
    const newId = `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const group: import('@/types').Group = {
      id: newId,
      label: String(state.value.groups.length + 1),
    }
    state.value.groups.push(group)
    debouncedSave()
    return newId
  }

  const setCurrentStep = (step: number): void => {
    state.value.currentStep = step
    debouncedSave()
  }

  const resetState = (): void => {
    state.value = createInitialState()
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  const initializeGroups = (): void => {
    // Create individual groups for each participant if not already grouped
    const existingGroups = new Set(state.value.groups.map((g) => g.id))

    state.value.participants.forEach((participant) => {
      if (!existingGroups.has(participant.groupId)) {
        const group: import('@/types').Group = {
          id: participant.groupId,
          label: String(state.value.groups.length + 1),
        }
        state.value.groups.push(group)
        existingGroups.add(participant.groupId)
      }
    })

    debouncedSave()
  }

  const getGroupParticipants = (groupId: string): Participant[] => {
    return state.value.participants.filter((p) => p.groupId === groupId)
  }

  const cleanupEmptyGroups = (): void => {
    const usedGroupIds = new Set(state.value.participants.map((p) => p.groupId))
    state.value.groups = state.value.groups.filter((group) =>
      usedGroupIds.has(group.id)
    )
    debouncedSave()
  }

  const resetGroups = (): void => {
    // Reset each participant to their own group
    state.value.participants.forEach((participant) => {
      participant.groupId = participant.id
    })

    // Clear all groups and recreate individual groups
    state.value.groups = []
    initializeGroups()
  }

  // Exchange validation (placeholder)
  const validateExchange = (): ExchangeValidationResult => {
    if (participantCount.value < 2) {
      return { isValid: false, message: 'group.validation.atLeast2' }
    }

    if (groupedParticipants.value.size === 1) {
      return { isValid: false, message: 'group.validation.sameGroup' }
    }

    // Quick check: if largest group > n/2, likely impossible
    if (maxGroupSize.value > Math.floor(participantCount.value / 2)) {
      return {
        isValid: false,
        message: 'group.validation.largestGroupTooBig',
      }
    }

    // Try generating once (up to N tries) just to assert possibility
    const res = tryGenerateAssignments(1000)
    if (!res) return { isValid: false, message: 'exchange.impossible' }
    return { isValid: true, message: 'exchange.ready' }
  }

  // Fisher–Yates shuffle
  const shuffleInPlace = <T>(arr: T[]): void => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  }

  // Attempt to generate valid assignments respecting constraints
  const tryGenerateAssignments = (
    maxTries = 1000
  ): import('@/types').Assignment[] | null => {
    const participants = [...state.value.participants]
    const n = participants.length
    if (n < 2) return null

    for (let attempt = 0; attempt < maxTries; attempt++) {
      // Create a permutation of receivers
      const receivers = [...participants]
      shuffleInPlace(receivers)

      let valid = true
      for (let i = 0; i < n; i++) {
        const giver = participants[i]
        const receiver = receivers[i]
        if (
          giver.id === receiver.id ||
          (giver.groupId &&
            receiver.groupId &&
            giver.groupId === receiver.groupId)
        ) {
          valid = false
          break
        }
      }

      if (!valid) continue

      return participants.map((giver, i) => ({
        giverId: giver.id,
        receiverId: receivers[i].id,
      }))
    }

    return null
  }

  const performExchange = (): boolean => {
    const result = tryGenerateAssignments(1000)
    if (!result) {
      state.value.assignments = []
      state.value.errorMessage = 'exchange.impossible'
      state.value.isExchangeReady = false
      return false
    }
    state.value.assignments = result
    state.value.errorMessage = null
    state.value.isExchangeReady = true
    return true
  }

  // Watch for changes to trigger auto-save
  watch(
    () => [
      state.value.participants,
      state.value.groups,
      state.value.currentStep,
    ],
    debouncedSave,
    { deep: true }
  )

  return {
    // State
    state,

    // Computed
    participantCount,
    duplicateNames,
    hasDuplicates,
    canProceedToGrouping,
    groupedParticipants,
    maxGroupSize,

    // Actions
    addParticipant,
    removeParticipant,
    updateParticipantName,
    moveParticipantToGroup,
    setCurrentStep,
    resetState,
    initializeGroups,
    getGroupParticipants,
    cleanupEmptyGroups,
    resetGroups,
    validateExchange,
    ensureGroupExists,
    moveParticipantToOwnGroup,
    createNewGroup,
    performExchange,
    tryGenerateAssignments,

    // Utilities
    normalizeName,
  }
}
