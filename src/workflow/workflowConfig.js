export const WORKFLOW_STAGES = [
  {
    id: 'idea',
    number: 1,
    label: 'Idea',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['topic'],
    producedOutputs: ['projectCreated'],
    previousStage: null,
    nextStage: 'research'
  },
  {
    id: 'research',
    number: 2,
    label: 'Research',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['topic', 'market', 'language'],
    producedOutputs: ['research.resultSaved'],
    previousStage: 'idea',
    nextStage: 'outline'
  },
  {
    id: 'outline',
    number: 3,
    label: 'Outline',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['research.resultSaved'],
    producedOutputs: ['outline.prompt'],
    previousStage: 'research',
    nextStage: 'script'
  },
  {
    id: 'script',
    number: 4,
    label: 'Script',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['outline.prompt'],
    producedOutputs: ['script.completed'],
    previousStage: 'outline',
    nextStage: 'humanize'
  },
  {
    id: 'humanize',
    number: 5,
    label: 'Humanize',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['script.completed'],
    producedOutputs: ['humanize.completed'],
    previousStage: 'script',
    nextStage: 'voiceScript'
  },
  {
    id: 'storyboard',
    number: 7,
    label: 'Storyboard',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['voiceScript.completed'],
    producedOutputs: ['storyboard.completed'],
    previousStage: 'voiceScript',
    nextStage: 'imagePrompt'
  },
  {
    id: 'voiceScript',
    number: 6,
    label: 'Voice Script',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['humanize.completed'],
    producedOutputs: ['voiceScript.completed'],
    previousStage: 'humanize',
    nextStage: 'storyboard'
  },
  {
  id: 'imagePrompt',
  number: 8,
  label: 'Image Prompt',
  statusLabel: {
    locked: 'Chưa mở khóa',
    available: 'Sẵn sàng',
    active: 'Đang thực hiện',
    completed: 'Hoàn thành'
  },
  requiredInputs: ['storyboard.completed'],
  producedOutputs: ['imagePrompt.completed'],
  previousStage: 'storyboard',
  nextStage: 'geminiFlow'
},
  {
    id: 'geminiFlow',
    number: 9,
    label: 'Gemini Flow',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['imagePrompt.completed'],
    producedOutputs: ['geminiFlow.completed'],
    previousStage: 'imagePrompt',
    nextStage: 'imageLibrary'
  },
  {
    id: 'imageLibrary',
    number: 10,
    label: 'Image Library',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['geminiFlow.completed'],
    producedOutputs: ['imageLibrary.completed'],
    previousStage: 'geminiFlow',
    nextStage: 'capcutPackage'
  },
  {
    id: 'capcutPackage',
    number: 11,
    label: 'CapCut Package',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['imageLibrary.completed'],
    producedOutputs: ['capcutPackage.completed'],
    previousStage: 'imageLibrary',
    nextStage: 'publish'
  },
  {
    id: 'publish',
    number: 12,
    label: 'Publish',
    statusLabel: {
      locked: 'Chưa mở khóa',
      available: 'Sẵn sàng',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành'
    },
    requiredInputs: ['capcutPackage.completed'],
    producedOutputs: ['publish.completed'],
    previousStage: 'capcutPackage',
    nextStage: null
  }
]
