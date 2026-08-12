import { ImagePromptEngine } from './src/brain/imagePrompt/imagePromptEngine.js'

const prompt = ImagePromptEngine.generate({
  topic: '日本の人口減少',
  language: 'Japanese',
  audience: 'Japanese adults',
  storyboardScenes: [
    {
      sceneNumber: 1,
      durationSec: 7,
      narration: '日本の人口は減少しています。',
      visualObjective: 'Tokyo skyline at sunrise'
    },
    {
      sceneNumber: 2,
      durationSec: 6,
      narration: '地方では人口流出が続いています。',
      visualObjective: 'Quiet rural Japanese town'
    }
  ]
})

console.log(prompt.substring(0, 1200))