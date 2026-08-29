function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function findTopicHint(text) {
  const match = text.match(/(?:về|on|about|the topic of|topic is)\s+([^.\n]+)/i)
  return match ? match[1].trim() : ''
}

function firstSentence(text) {
  const sentence = text.split(/[\n.?!]+/).find(s => s.trim().length > 20)
  return sentence ? sentence.trim() : ''
}

function collectHighlights(text) {
  const highlights = []
  
  if (/[0-9]{4}/.test(text)) {
    highlights.push('Các con số và mốc thời gian quan trọng')
  }
  if (/(\d+[.,]?\d*\s*(%|percent|phần trăm))/i.test(text)) {
    highlights.push('Số liệu thống kê cụ thể')
  }
  if (/government|chính phủ|policy|chính sách|minister|ministerial/i.test(text)) {
    highlights.push('Dữ liệu và chính sách của chính phủ')
  }
  if (/example|ví dụ|for instance|such as|như|ví dụ như/i.test(text)) {
    highlights.push('Ví dụ thực tế minh họa')
  }
  if (/conflict|xung đột|dispute|tranh chấp/i.test(text)) {
    highlights.push('Xung đột và mâu thuẫn quan trọng')
  }
  if (/future|tương lai|implication|hậu quả|sẽ|sẽ dẫn đến/i.test(text)) {
    highlights.push('Hệ quả và triển vọng tương lai')
  }
  return Array.from(new Set(highlights))
}

function inferObjective(text) {
  const hint = findTopicHint(text) || firstSentence(text)
  if (!hint) {
    return 'Người xem nên hiểu rõ bối cảnh chính và những hệ quả thiết thực của vấn đề được trình bày.'
  }
  return `Người xem nên hiểu rõ ${hint} và nắm được những yếu tố chính đang định hình tình huống này, cũng như lý do vì sao vấn đề đó lại quan trọng.`
}

function inferCoreArgument(text) {
  const hint = findTopicHint(text) || firstSentence(text)
  if (!hint) {
    return 'Video này lập luận rằng khán giả cần nhìn nhận vấn đề theo một cách cân bằng, dựa trên dữ liệu và bối cảnh thực tế.'
  }
  return `Luận điểm trung tâm là ${hint} đang được định hình bởi các yếu tố kinh tế, chính sách và xã hội quan trọng, và điều đó ảnh hưởng trực tiếp đến hướng đi tương lai của sự việc.`
}

function inferMustInclude(text) {
  const highlights = collectHighlights(text)
  const bullets = [
    'Các con số và số liệu thống kê nổi bật từ nghiên cứu.',
    'Dữ liệu chính phủ hoặc chính sách liên quan đến vấn đề.',
    'Ví dụ thực tế minh họa tình huống hoặc xu hướng.',
    'Xung đột hoặc mâu thuẫn quan trọng giữa các bên.',
    'Hệ quả và triển vọng tương lai.'
  ]

  if (highlights.length) {
  return bullets
    .map(bullet => `- ${bullet}`)
    .join('\n')
}

  return bullets.map(b => `- ${b}`).join('\n')
}

function inferAvoid() {
  return [
    '- Định hướng một chiều hoặc thiên vị.',
    '- Dùng cảm xúc để thao túng người xem.',
    '- Những khẳng định không được hỗ trợ bởi bằng chứng.',
    '- Lặp lại cùng một thông tin nhiều lần.'
  ].join('\n')
}

export function generateOutlineBrief(researchText) {
  const text = cleanText(researchText)
  if (!text) {
    return {
      videoObjective: '',
      coreArgument: '',
      mustInclude: '',
      avoid: ''
    }
  }

  return {
    videoObjective: inferObjective(text),
    coreArgument: inferCoreArgument(text),
    mustInclude: inferMustInclude(text),
    avoid: inferAvoid()
  }
}
