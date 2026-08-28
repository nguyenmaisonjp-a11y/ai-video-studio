const DATABASE_NAME = 'ai-video-studio-assets'
const DATABASE_VERSION = 1
const ASSET_STORE_NAME = 'assets'

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(
        new Error(
          'Trình duyệt này không hỗ trợ lưu file ảnh.'
        )
      )
      return
    }

    const request = window.indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION
    )

    request.onupgradeneeded = event => {
      const database = event.target.result

      if (
        !database.objectStoreNames.contains(
          ASSET_STORE_NAME
        )
      ) {
        const store = database.createObjectStore(
          ASSET_STORE_NAME,
          {
            keyPath: 'assetId'
          }
        )

        store.createIndex(
          'projectId',
          'projectId',
          {
            unique: false
          }
        )

        store.createIndex(
          'projectScene',
          ['projectId', 'sceneId'],
          {
            unique: false
          }
        )
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(
        request.error ||
          new Error(
            'Không thể mở kho lưu ảnh.'
          )
      )
    }
  })
}

function completeTransaction(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()

    transaction.onerror = () => {
      reject(
        transaction.error ||
          new Error(
            'Không thể cập nhật kho ảnh.'
          )
      )
    }

    transaction.onabort = () => {
      reject(
        transaction.error ||
          new Error(
            'Thao tác lưu ảnh đã bị hủy.'
          )
      )
    }
  })
}

function readRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(
        request.error ||
          new Error(
            'Không thể đọc dữ liệu ảnh.'
          )
      )
    }
  })
}

function createImageAssetId(projectId, sceneId) {
  return `image:${projectId}:${sceneId}`
}

export const ImageLibraryStorage = {
  async saveImage({
    projectId,
    sceneId,
    file
  }) {
    if (!projectId) {
      throw new Error(
        'Thiếu projectId khi lưu ảnh.'
      )
    }

    if (!sceneId) {
      throw new Error(
        'Thiếu sceneId khi lưu ảnh.'
      )
    }

    if (!(file instanceof File)) {
      throw new Error(
        'Bạn chưa chọn file ảnh.'
      )
    }

    if (!file.type.startsWith('image/')) {
      throw new Error(
        'File đã chọn không phải là ảnh.'
      )
    }

    const database = await openDatabase()
    const transaction = database.transaction(
      ASSET_STORE_NAME,
      'readwrite'
    )

    const store = transaction.objectStore(
      ASSET_STORE_NAME
    )

    const asset = {
      assetId: createImageAssetId(
        projectId,
        sceneId
      ),
      projectId,
      sceneId,
      kind: 'image',
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      blob: file,
      importedAt: Date.now()
    }

    store.put(asset)

    await completeTransaction(transaction)
    database.close()

    return {
      assetId: asset.assetId,
      projectId: asset.projectId,
      sceneId: asset.sceneId,
      kind: asset.kind,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      importedAt: asset.importedAt
    }
  },

  async getAsset(assetId) {
    if (!assetId) return null

    const database = await openDatabase()
    const transaction = database.transaction(
      ASSET_STORE_NAME,
      'readonly'
    )

    const store = transaction.objectStore(
      ASSET_STORE_NAME
    )

    const asset = await readRequest(
      store.get(assetId)
    )

    database.close()

    return asset || null
  },

  async getProjectAssets(projectId) {
    if (!projectId) return []

    const database = await openDatabase()
    const transaction = database.transaction(
      ASSET_STORE_NAME,
      'readonly'
    )

    const store = transaction.objectStore(
      ASSET_STORE_NAME
    )

    const index = store.index('projectId')

    const assets = await readRequest(
      index.getAll(projectId)
    )

    database.close()

    return Array.isArray(assets)
      ? assets
      : []
  },

  async deleteAsset(assetId) {
    if (!assetId) return

    const database = await openDatabase()
    const transaction = database.transaction(
      ASSET_STORE_NAME,
      'readwrite'
    )

    transaction
      .objectStore(ASSET_STORE_NAME)
      .delete(assetId)

    await completeTransaction(transaction)
    database.close()
  }
}