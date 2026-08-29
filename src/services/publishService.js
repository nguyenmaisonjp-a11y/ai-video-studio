function normalizeTags(tags) {
  const values = Array.isArray(tags)
    ? tags
    : String(tags || '').split(',')

  return [
    ...new Set(
      values
        .map(tag => String(tag).trim())
        .filter(Boolean)
    )
  ]
}

function createDownload(
  content,
  fileName,
  mimeType
) {
  const blob = new Blob(
    [content],
    {
      type: mimeType
    }
  )

  const url = URL.createObjectURL(blob)
  const anchor =
    document.createElement('a')

  anchor.href = url
  anchor.download = fileName

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

export const PublishService = {
  createDraft(project = {}) {
    const existing =
      project.publish || {}

    const defaultTags = [
      project.market,
      project.language,
      project.dna?.channelName
    ].filter(Boolean)

    return {
      version: 1,

      title:
        existing.title ||
        project.topic ||
        '',

      description:
        existing.description ||
        '',

      tags: normalizeTags(
        existing.tags?.length
          ? existing.tags
          : defaultTags
      ),

      category:
        existing.category ||
        'News & Politics',

      privacyStatus:
        existing.privacyStatus ||
        'private',

      videoFileName:
        existing.videoFileName ||
        '',

      thumbnailFileName:
        existing.thumbnailFileName ||
        '',

      checklist: {
        factsReviewed:
          Boolean(
            existing.checklist
              ?.factsReviewed
          ),

        rightsConfirmed:
          Boolean(
            existing.checklist
              ?.rightsConfirmed
          ),

        audioReviewed:
          Boolean(
            existing.checklist
              ?.audioReviewed
          ),

        visualsReviewed:
          Boolean(
            existing.checklist
              ?.visualsReviewed
          ),

        metadataReviewed:
          Boolean(
            existing.checklist
              ?.metadataReviewed
          )
      },

      savedAt:
        existing.savedAt || null,

      completedAt:
        existing.completedAt || null
    }
  },

  normalizeDraft(draft = {}) {
    return {
      ...draft,

      title:
        String(
          draft.title || ''
        ).trim(),

      description:
        String(
          draft.description || ''
        ).trim(),

      tags: normalizeTags(
        draft.tags
      ),

      category:
        String(
          draft.category ||
            'News & Politics'
        ).trim(),

      privacyStatus:
        String(
          draft.privacyStatus ||
            'private'
        ).trim(),

      videoFileName:
        String(
          draft.videoFileName || ''
        ).trim(),

      thumbnailFileName:
        String(
          draft.thumbnailFileName || ''
        ).trim(),

      checklist: {
        factsReviewed:
          Boolean(
            draft.checklist
              ?.factsReviewed
          ),

        rightsConfirmed:
          Boolean(
            draft.checklist
              ?.rightsConfirmed
          ),

        audioReviewed:
          Boolean(
            draft.checklist
              ?.audioReviewed
          ),

        visualsReviewed:
          Boolean(
            draft.checklist
              ?.visualsReviewed
          ),

        metadataReviewed:
          Boolean(
            draft.checklist
              ?.metadataReviewed
          )
      }
    }
  },

  validateDraft(draft = {}) {
    const normalized =
      this.normalizeDraft(draft)

    const errors = []

    if (!normalized.title) {
      errors.push(
        'Chưa có tiêu đề video.'
      )
    }

    if (
      normalized.title.length > 100
    ) {
      errors.push(
        'Tiêu đề vượt quá 100 ký tự.'
      )
    }

    if (!normalized.description) {
      errors.push(
        'Chưa có mô tả video.'
      )
    }

    if (
      normalized.description.length >
      5000
    ) {
      errors.push(
        'Mô tả vượt quá 5000 ký tự.'
      )
    }

    if (!normalized.videoFileName) {
      errors.push(
        'Chưa có tên file video cuối.'
      )
    }

    if (
      !normalized.thumbnailFileName
    ) {
      errors.push(
        'Chưa có tên file thumbnail.'
      )
    }

    const checklistLabels = {
      factsReviewed:
        'Chưa xác nhận kiểm tra dữ kiện.',

      rightsConfirmed:
        'Chưa xác nhận quyền sử dụng nội dung.',

      audioReviewed:
        'Chưa xác nhận kiểm tra âm thanh.',

      visualsReviewed:
        'Chưa xác nhận kiểm tra hình ảnh.',

      metadataReviewed:
        'Chưa xác nhận kiểm tra metadata.'
    }

    Object.entries(
      checklistLabels
    ).forEach(([key, label]) => {
      if (
        !normalized.checklist[key]
      ) {
        errors.push(label)
      }
    })

    return errors
  },

  createMetadata(project, draft) {
    const normalized =
      this.normalizeDraft(draft)

    return {
      schemaVersion: 1,
      projectId:
        project?.id || '',
      projectTopic:
        project?.topic || '',
      generatedAt: Date.now(),

      youtube: {
        title:
          normalized.title,

        description:
          normalized.description,

        tags:
          normalized.tags,

        category:
          normalized.category,

        privacyStatus:
          normalized.privacyStatus,

        videoFileName:
          normalized.videoFileName,

        thumbnailFileName:
          normalized.thumbnailFileName
      },

      checklist:
        normalized.checklist
    }
  },

  downloadMetadata(
    project,
    draft
  ) {
    const metadata =
      this.createMetadata(
        project,
        draft
      )

    createDownload(
      JSON.stringify(
        metadata,
        null,
        2
      ),
      'youtube-publish-metadata.json',
      'application/json'
    )
  }
}