'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User, Mail, MapPin, Phone, Edit3, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [formData, setFormData] = useState({
    // User information
    userName: '',
    userEmail: '',
    // Address information
    addressName: '',
    addressEmail: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  })

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        userName: session.user.name || '',
        userEmail: session.user.email || ''
      }))
      fetchAddresses()
    }
  }, [session])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
        // Set the first address as default if available
        if (data.length > 0) {
          const address = data[0]
          setSelectedAddressId(address.id)
          setFormData(prev => ({
            ...prev,
            addressName: address.name || '',
            addressEmail: address.email || '',
            phone: address.phone || '',
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            zip: address.zip || '',
            country: address.country || ''
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      console.log('Saving profile with selectedAddressId:', selectedAddressId)
      console.log('Form data:', formData)
      
      let success = true
      let errorMessage = ''

      // Update address if we have a selected address
      if (selectedAddressId) {
        console.log('Updating address:', selectedAddressId)
        const addressResponse = await fetch(`/api/addresses/${selectedAddressId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.addressName,
            email: formData.addressEmail,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country
          }),
        })

        if (!addressResponse.ok) {
          const errorData = await addressResponse.json()
          console.error('Failed to update address:', errorData)
          errorMessage = errorData.error || 'Failed to update address'
          success = false
        }
      } else {
        // Create new address if none exists
        const addressResponse = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.addressName,
            email: formData.addressEmail,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country
          }),
        })

        if (!addressResponse.ok) {
          const errorData = await addressResponse.json()
          console.error('Failed to create address:', errorData)
          errorMessage = errorData.error || 'Failed to create address'
          success = false
        }
      }

      if (success) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        fetchAddresses()
      } else {
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original values
    if (session?.user) {
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId)
      setFormData({
        userName: session.user.name || '',
        userEmail: session.user.email || '',
        addressName: selectedAddress?.name || '',
        addressEmail: selectedAddress?.email || '',
        phone: selectedAddress?.phone || '',
        street: selectedAddress?.street || '',
        city: selectedAddress?.city || '',
        state: selectedAddress?.state || '',
        zip: selectedAddress?.zip || '',
        country: selectedAddress?.country || ''
      })
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your profile</h1>
          <a href="/auth/signin" className="text-orange-500 hover:text-orange-600 font-medium">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                  <p className="text-gray-500">Manage your account information</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            {/* Address Selector */}
            {addresses.length > 1 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Address to Edit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      onClick={() => {
                        setSelectedAddressId(address.id)
                        setFormData(prev => ({
                          ...prev,
                          addressName: address.name || '',
                          addressEmail: address.email || '',
                          phone: address.phone || '',
                          street: address.street || '',
                          city: address.city || '',
                          state: address.state || '',
                          zip: address.zip || '',
                          country: address.country || ''
                        }))
                      }}
                      className={`p-3 text-left border rounded-lg transition-colors duration-200 ${
                        selectedAddressId === address.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{address.name}</div>
                      <div className="text-sm text-gray-600">
                        {address.street}, {address.city}, {address.state} {address.zip}
                      </div>
                      <div className="text-sm text-gray-500">{address.country}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  Personal Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">User name cannot be changed here</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">User email cannot be changed here</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  Address Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Name</label>
                  <input
                    type="text"
                    name="addressName"
                    value={formData.addressName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="e.g., Home, Office, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Email</label>
                  <input
                    type="email"
                    name="addressEmail"
                    value={formData.addressEmail}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Email for this address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
