'use client'
import { useState, useRef } from 'react'
import { UploadIcon, XIcon, ImageIcon, LoaderIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    
    if (files.length === 0) return

    // Check if adding these files would exceed maxImages
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images autorisées`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Échec du téléchargement')
        }

        const result = await response.json()
        return result.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newImages = [...images, ...uploadedUrls]
      onImagesChange(newImages)
      
      toast.success(`${uploadedUrls.length} image(s) téléchargée(s) avec succès !`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Échec du téléchargement des images')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove)
    onImagesChange(newImages)
    toast.success('Image supprimée')
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Images du produit
      </label>
      
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={openFileDialog}
          disabled={uploading || images.length >= maxImages}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <LoaderIcon className="w-4 h-4 animate-spin" />
          ) : (
            <UploadIcon className="w-4 h-4" />
          )}
          {uploading ? 'Téléchargement...' : 'Télécharger des images'}
        </button>
        
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Image du produit ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Formats supportés : JPEG, PNG, WebP</p>
        <p>• Taille maximale de fichier : 5MB par image</p>
        <p>• Maximum {maxImages} images par produit</p>
      </div>
    </div>
  )
}

export default ImageUpload
