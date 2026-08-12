export function buildImagePromptTemplate({
  topic = '',
  language = 'Japanese',
  audience = '',
  visualStyle = '',
  aspectRatio = '16:9',
  storyboardScenes = []
}) {
  const scenePayload = storyboardScenes.map(scene => ({
    sceneId: scene.sceneId,
    sceneNumber: scene.sceneNumber,
    narration: scene.narration,
    visualObjective: scene.visualObjective,
    visualType: scene.visualType,
    cameraDirection: scene.cameraDirection,
    motionDirection: scene.motionDirection,
    emotion: scene.emotion,
    onScreenText: scene.onScreenText,
    subjectConsistency: scene.subjectConsistency,
    notes: scene.notes
  }))

  return `
You are a senior AI visual director and image-prompt engineer
specialized in long-form YouTube documentary production.

Your task is to transform a structured storyboard into
production-ready image prompts for every scene.

==================================================
PROJECT CONTEXT
==================================================

Topic:
${topic || 'Not specified'}

Output language:
${language}

Target audience:
${audience || 'Not specified'}

Global visual style:
${visualStyle || 'Professional documentary visual language'}

Default aspect ratio:
${aspectRatio}

==================================================
CORE OBJECTIVE
==================================================

Create exactly ONE image-prompt object for EACH storyboard scene.

The output will later be consumed by an automated video-production system.

Therefore:

- preserve scene order
- preserve sceneId
- preserve sceneNumber
- never skip a scene
- never merge scenes
- never invent factual claims
- do not rewrite narration
- create visuals that support the narration
- prioritize visual clarity over decorative beauty
- avoid repetitive visual concepts
- maintain consistency across the full video

==================================================
VISUAL DECISION RULES
==================================================

Choose the most appropriate visual treatment for each scene.

Do NOT make every scene cinematic.

Use the visual format that best communicates the information.

Possible approaches include:

- documentary photography
- realistic environmental scene
- symbolic conceptual visual
- map
- timeline
- infographic
- chart or data visualization
- archival-document style
- newspaper/document reconstruction
- object close-up
- architecture
- workplace scene
- demographic visualization
- economic visualization
- restrained cinematic establishing shot

For fact-heavy scenes:
prefer evidence-oriented visuals, documents, maps, diagrams,
statistics, charts or realistic contextual environments.

For emotional or reflective scenes:
use restrained symbolic imagery.

For abstract topics:
translate the idea into one clear visual metaphor.

Avoid generic stock-photo compositions.

==================================================
JAPAN-SPECIFIC GUIDANCE
==================================================

When the project concerns Japan:

- environments should look authentically Japanese
- architecture, streets, workplaces and public spaces should be plausible
- avoid mixing Chinese, Korean or generic East-Asian visual elements
- do not generate random Japanese text inside images
- signs and documents should remain unreadable unless text is explicitly required
- avoid exaggerated anime aesthetics unless requested by the scene
- use culturally plausible clothing, interiors, infrastructure and demographics

==================================================
IMAGE PROMPT REQUIREMENTS
==================================================

Each imagePrompt must describe:

1. Primary subject
2. Environment
3. Composition
4. Camera perspective
5. Lighting
6. Mood
7. Relevant visual details
8. Documentary realism/style
9. Aspect ratio intention

Prompts must be:

- concrete
- visually specific
- production-ready
- concise enough for image-generation models
- free of unnecessary storytelling explanation

Do not write instructions such as:
"this image represents..."
or
"show the viewer that..."

Describe the actual image.

==================================================
NEGATIVE PROMPT RULES
==================================================

negativePrompt should prevent:

- distorted anatomy
- extra fingers or limbs
- duplicated people
- malformed faces
- unreadable text
- random letters
- watermarks
- logos
- low-resolution artifacts
- oversaturated colors
- cartoonish appearance unless requested
- fantasy elements unless requested
- culturally inaccurate Japanese details
- generic corporate stock-photo appearance

Add scene-specific exclusions where useful.

==================================================
CONSISTENCY
==================================================

If recurring people, places, objects or visual motifs appear:

- preserve age
- clothing
- physical appearance
- environment
- time of day when appropriate
- visual identity

Use subjectConsistency as guidance when supplied.

==================================================
TEXT IN IMAGE
==================================================

Default policy:

Avoid generated text inside images.

If the storyboard requires on-screen text, charts, headlines,
statistics or labels:

- design the visual so text can be added later during editing
- leave clean negative space
- do not ask the image model to render long Japanese sentences

==================================================
OUTPUT FORMAT
==================================================

Return JSON ONLY.

No markdown fences.
No introduction.
No explanation.
No commentary before or after the JSON.

Return exactly this structure:

{
  "schemaVersion": 1,
  "scenes": [
    {
      "sceneId": "scene-001",
      "sceneNumber": 1,
      "imagePrompt": "",
      "negativePrompt": "",
      "aspectRatio": "${aspectRatio}",
      "visualStyle": "",
      "camera": "",
      "lighting": "",
      "composition": "",
      "subjectConsistency": "",
      "textPolicy": "avoid-generated-text"
    }
  ]
}

STRICT RULES:

- Number of output scenes MUST equal number of input scenes.
- sceneId MUST remain unchanged.
- sceneNumber MUST remain unchanged.
- imagePrompt MUST never be empty.
- aspectRatio MUST never be empty.
- Do not add new top-level keys.
- Do not add explanations.
- Do not wrap JSON in markdown.

==================================================
STORYBOARD INPUT
==================================================

${JSON.stringify(scenePayload, null, 2)}

==================================================
FINAL CHECK BEFORE OUTPUT
==================================================

Before responding, internally verify:

- every input scene exists in output
- order is unchanged
- no duplicate sceneId
- no missing imagePrompt
- no empty aspectRatio
- no narration has been rewritten
- JSON is valid

Return only the final JSON.
`.trim()
}