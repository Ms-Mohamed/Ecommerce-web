'use client'
import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        toast.success('Message envoyé avec succès ! Nous vous répondrons bientôt.')
        setFormData({ name: '', email: '', subject: '', message: '' })
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 py-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="mb-8">
                        <img 
                            src="/uploads/logo.png" 
                            alt="VAL DE SEINE SERVICE" 
                            className="h-20 w-auto mx-auto mb-6"
                        />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                        Contactez <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">VAL DE SEINE SERVICE</span>
                    </h1>
                    <p className="text-xl text-gray-800 max-w-3xl mx-auto">
                        Nous sommes là pour répondre à toutes vos questions et vous accompagner 
                        dans vos projets technologiques.
                    </p>
                </div>
            </div>

            {/* Contact Section */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">
                                Informations de Contact
                            </h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-lg mr-4">
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                                        <p className="text-gray-600">+212-539-38-89-65</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg mr-4">
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                        <p className="text-gray-600">valedeseineservice@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-lg mr-4">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Notre Adresse</h3>
                                        <p className="text-gray-600 mb-3">Local n°1, Rue Hammadi Ameziane, Tanger 90000, Maroc</p>
                                        <a 
                                            href="https://www.google.com/maps?q=35.756160,-5.838991"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Ouvrir dans Google Maps
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                                        🕒
                                    </div>
                                    Horaires d'Ouverture
                                </h3>
                                <div className="space-y-2 text-gray-600">
                                    <p>Lundi - Vendredi: 9h00 - 18h00</p>
                                    <p>Samedi: 9h00 - 13h00</p>
                                    <p>Dimanche: Fermé</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">
                                Envoyez-nous un Message
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom complet *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Sujet *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Sujet de votre message"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Décrivez votre projet ou votre demande..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <Send className="w-5 h-5" />
                                    Envoyer le Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services CTA */}
            <div className="py-16 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Besoin d'un <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Devis Personnalisé</span> ?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Contactez-nous pour discuter de vos besoins spécifiques et obtenir 
                        une solution sur mesure.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a 
                            href="tel:+212539388965" 
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Appeler Maintenant
                        </a>
                        <a 
                            href="mailto:valedeseineservice@gmail.com" 
                            className="border-2 border-yellow-500 text-yellow-600 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-500 hover:text-white transition-all duration-300"
                        >
                            Envoyer un Email
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
