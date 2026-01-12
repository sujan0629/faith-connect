import { api } from './axios'

export type UploadResponse = {
  url: string
  publicId: string
  width?: number
  height?: number
  format?: string
  resourceType?: string
  duration?: number
}

// Note: This is for file uploads from React Native
// We'll use a FormData approach for binary file uploads
export const uploadsApi = {
  // Upload image or video file
  uploadFile: async (uri: string, fileName: string, mimeType: string, folder = 'faithconnect'): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as any)
    formData.append('folder', folder)

    const res = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds timeout for file uploads
    })
    return res.data
  },
}
