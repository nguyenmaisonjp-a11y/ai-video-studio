import { parseImagePromptResult } from './src/brain/imagePrompt/imagePromptParser.js'
import { validateImagePromptResult } from './src/lib/imagePromptValidator.js'

const storyboardScenes = [
  {
    sceneId: 'scene-001',
    sceneNumber: 1,
    narration: '日本の人口は減少しています。',
    visualObjective: 'Tokyo skyline at sunrise'
  },
  {
    sceneId: 'scene-002',
    sceneNumber: 2,
    narration: '地方では人口流出が続いています。',
    visualObjective: 'Quiet rural Japanese town'
  }
]

const validRaw = JSON.stringify({
  schemaVersion: 1,
  scenes: [
    {
      sceneId: 'scene-001',
      sceneNumber: 1,
      imagePrompt: 'Realistic Tokyo skyline at sunrise, documentary photography, wide establishing shot',
      negativePrompt: 'watermark, unreadable text, distorted buildings',
      aspectRatio: '16:9',
      visualStyle: 'documentary photography',
      camera: 'wide establishing shot',
      lighting: 'soft sunrise light',
      composition: 'Tokyo skyline across lower two thirds',
      subjectConsistency: '',
      textPolicy: 'avoid-generated-text'
    },
    {
      sceneId: 'scene-002',
      sceneNumber: 2,
      imagePrompt: 'Quiet rural Japanese town, realistic documentary photography, empty street',
      negativePrompt: 'watermark, random text, fantasy architecture',
      aspectRatio: '16:9',
      visualStyle: 'documentary photography',
      camera: 'eye-level wide shot',
      lighting: 'natural morning light',
      composition: 'traditional town street receding into distance',
      subjectConsistency: '',
      textPolicy: 'avoid-generated-text'
    }
  ]
})

const markdownRaw = `Here is the JSON:

\`\`\`json
${validRaw}
\`\`\`

Done.`

const invalidRaw = JSON.stringify({
  schemaVersion: 1,
  scenes: [
    {
      sceneId: 'scene-999',
      sceneNumber: 1,
      imagePrompt: '',
      aspectRatio: ''
    }
  ]
})

function runTest(name, raw) {
  console.log(`\n===== ${name} =====`)

  try {
    const parsed = parseImagePromptResult(raw)
    const errors = validateImagePromptResult(parsed, storyboardScenes)

    if (errors.length === 0) {
      console.log('PASS')
      console.log(`Scenes: ${parsed.scenes.length}`)
    } else {
      console.log('VALIDATION ERRORS:')
      errors.forEach(error => console.log(`- ${error}`))
    }
  } catch (error) {
    console.log('PARSER ERROR:')
    console.log(error.message)
  }
}

runTest('VALID JSON', validRaw)
runTest('MARKDOWN WRAPPED JSON', markdownRaw)
runTest('INVALID JSON DATA', invalidRaw)