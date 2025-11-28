'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ChevronLeftIcon, ChevronRightIcon, UserIcon, MapPinIcon, PhoneIcon } from 'lucide-react'

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Contact Info
    phone: '',
    // Step 3: Address Info
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.password && formData.confirmPassword
      case 2:
        return formData.phone
      case 3:
        return formData.street && formData.city && formData.state && formData.zip
      default:
        return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (currentStep < 3) {
      if (currentStep === 1) {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Les mots de passe ne correspondent pas')
          return
        }
        if (formData.password.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères')
          return
        }
      }
      nextStep()
      return
    }

    // Final submission
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country
          }
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Compte créé avec succès !')
        // Auto sign in after registration
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push('/')
          router.refresh()
        }
      } else {
        toast.error(data.error || 'Échec de l\'inscription')
      }
    } catch (error) {
      toast.error('Quelque chose s\'est mal passé')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      toast.error('Échec de la connexion Google')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <UserIcon className="h-8 w-8 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Informations de base</h3>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Entrez votre nom complet"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Entrez votre e-mail"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Créez un mot de passe (min 6 caractères)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Confirmez votre mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <PhoneIcon className="h-8 w-8 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Informations de contact</h3>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Entrez votre numéro de téléphone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <MapPinIcon className="h-8 w-8 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Adresse de livraison</h3>
            </div>
            
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Adresse de rue
              </label>
              <input
                id="street"
                name="street"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Entrez votre adresse de rue"
                value={formData.street}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Ville
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ville"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  État/Province
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="État/Province"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                  Code postal
                </label>
                <input
                  id="zip"
                  name="zip"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Code postal"
                  value={formData.zip}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Pays
                </label>
                <select
                  id="country"
                  name="country"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="United States">États-Unis</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">Royaume-Uni</option>
                  <option value="Australia">Australie</option>
                  <option value="Other">Autre</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                J\'accepte les{' '}
                <a href="#" className="text-green-600 hover:text-green-500">
                  Conditions générales
                </a>{' '}
                et la{' '}
                <a href="#" className="text-green-600 hover:text-green-500">
                  Politique de confidentialité
                </a>
              </label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl font-bold text-green-600">go</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créez votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Étape {currentStep} sur 3
          </p>
          <p className="mt-1 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signin" className="font-medium text-green-600 hover:text-green-500">
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {renderStepContent()}

          <div className="flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Précédent
              </button>
            )}
            
            <div className="flex-1"></div>
            
            <button
              type="submit"
              disabled={loading || !validateStep(currentStep)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création du compte...' : currentStep === 3 ? 'Créer le compte' : 'Suivant'}
              {currentStep < 3 && <ChevronRightIcon className="h-4 w-4 ml-1" />}
            </button>
          </div>
        </form>

        {/* Google Sign Up - Only show on first step */}
        {currentStep === 1 && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">S\'inscrire avec Google</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
