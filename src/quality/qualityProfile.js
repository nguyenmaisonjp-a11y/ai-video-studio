export const QUALITY_PROFILE_VERSION = 1

export const DEFAULT_QUALITY_DIMENSIONS = [
  {
    id: 'accuracy',
    label: 'Factual accuracy',
    weight: 30,
    minimumScore: 85
  },
  {
    id: 'audienceFit',
    label: 'Audience and market fit',
    weight: 20,
    minimumScore: 75
  },
  {
    id: 'retention',
    label: 'Viewer retention',
    weight: 20,
    minimumScore: 75
  },
  {
    id: 'clarity',
    label: 'Clarity and structure',
    weight: 15,
    minimumScore: 75
  },
  {
    id: 'productionReadiness',
    label: 'Production readiness',
    weight: 15,
    minimumScore: 80
  }
]

export const DEFAULT_HARD_RULES = [
  {
    id: 'no-fabricated-facts',
    label: 'Không bịa đặt dữ kiện, nguồn hoặc số liệu.',
    severity: 'blocker'
  },
  {
    id: 'source-traceability',
    label: 'Các khẳng định quan trọng phải truy ngược được nguồn.',
    severity: 'blocker'
  },
  {
    id: 'no-missing-scenes',
    label: 'Không bỏ sót, gộp sai hoặc đảo thứ tự scene.',
    severity: 'blocker'
  },
  {
    id: 'language-consistency',
    label: 'Ngôn ngữ đầu ra phải nhất quán với thị trường mục tiêu.',
    severity: 'blocker'
  },
  {
    id: 'rights-confirmed',
    label: 'Quyền sử dụng media phải được xác nhận trước Publish.',
    severity: 'blocker'
  }
]

export const QUALITY_CHECKPOINTS = [
  'research',
  'script',
  'storyboard',
  'imagePrompt',
  'publish'
]

function cloneDimensions(dimensions) {
  return dimensions.map(dimension => ({ ...dimension }))
}

function cloneRules(rules) {
  return rules.map(rule => ({ ...rule }))
}

export function createQualityProfile(project = {}) {
  return {
    version: QUALITY_PROFILE_VERSION,
    market: project.market || project.dna?.targetMarket || '',
    language: project.language || project.dna?.language || '',
    audience: project.audience || project.dna?.audience || '',
    primaryPlatform: 'youtube',
    objective: 'Tạo video đáng tin cậy, phù hợp khán giả và sẵn sàng sản xuất.',
    overallMinimumScore: 80,
    dimensions: cloneDimensions(DEFAULT_QUALITY_DIMENSIONS),
    hardRules: cloneRules(DEFAULT_HARD_RULES),
    checkpoints: [...QUALITY_CHECKPOINTS],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

export function normalizeQualityProfile(profile, project = {}) {
  const defaults = createQualityProfile(project)
  const source = profile && typeof profile === 'object' ? profile : {}

  return {
    ...defaults,
    ...source,
    version: QUALITY_PROFILE_VERSION,
    market: source.market || defaults.market,
    language: source.language || defaults.language,
    audience: source.audience || defaults.audience,
    dimensions: Array.isArray(source.dimensions) && source.dimensions.length > 0
      ? cloneDimensions(source.dimensions)
      : defaults.dimensions,
    hardRules: Array.isArray(source.hardRules) && source.hardRules.length > 0
      ? cloneRules(source.hardRules)
      : defaults.hardRules,
    checkpoints: Array.isArray(source.checkpoints) && source.checkpoints.length > 0
      ? [...source.checkpoints]
      : defaults.checkpoints,
    updatedAt: source.updatedAt || defaults.updatedAt
  }
}
