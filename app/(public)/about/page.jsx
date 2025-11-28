'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CheckCircle, Users, Shield, Wrench, Code, Headphones, ArrowRight, Star, Zap, Globe, Award, TrendingUp } from 'lucide-react'

export default function AboutPage() {
    const [isVisible, setIsVisible] = useState(false)
    const [currentService, setCurrentService] = useState(0)

    useEffect(() => {
        setIsVisible(true)
        const interval = setInterval(() => {
            setCurrentService((prev) => (prev + 1) % 3)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Animated Hero Section */}
            <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                </div>

                {/* Floating Tech Icons */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 animate-bounce">
                        <Code className="w-8 h-8 text-white opacity-40" />
                    </div>
                    <div className="absolute top-40 right-20 animate-bounce delay-1000">
                        <Shield className="w-6 h-6 text-white opacity-40" />
                    </div>
                    <div className="absolute bottom-40 left-20 animate-bounce delay-2000">
                        <Wrench className="w-7 h-7 text-white opacity-40" />
                    </div>
                    <div className="absolute bottom-20 right-10 animate-bounce delay-500">
                        <Headphones className="w-6 h-6 text-white opacity-40" />
                    </div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="mb-8">
                            <img 
                                src="/uploads/logo.png" 
                                alt="VAL DE SEINE SERVICE" 
                                className="h-20 w-auto mx-auto mb-6"
                            />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-tight">
                            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                VAL DE SEINE
                            </span>
                            <br />
                            <span className="text-gray-900">SERVICE</span>
                        </h1>
                        <p className="text-2xl text-gray-800 max-w-4xl mx-auto leading-relaxed mb-12">
                            Votre Partenaire de Confiance pour Toutes Vos Technologies
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link 
                                href="/contact" 
                                className="group bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Découvrir Nos Services
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="/shop" 
                                className="group border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Voir Nos Produits
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-gray-900 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-gray-900 rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Dynamic Services Section */}
            <div className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-semibold mb-6">
                            NOS EXPERTISES
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            Services <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Exceptionnels</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Des solutions technologiques de pointe pour transformer votre entreprise
                        </p>
                    </div>

                    {/* Interactive Service Cards */}
                    <div className="grid lg:grid-cols-3 gap-8 mb-20">
                        {[
                            {
                                title: "Vente & Distribution",
                                icon: Headphones,
                                gradient: "from-yellow-500 to-orange-500",
                                bgGradient: "from-yellow-50 to-orange-50",
                                description: "Matériel informatique de qualité professionnelle avec conseil expert",
                                features: ["Équipements haut de gamme", "Conseil personnalisé", "Garantie étendue", "Support technique"],
                                link: "/shop"
                            },
                            {
                                title: "Services IT",
                                icon: Wrench,
                                gradient: "from-orange-500 to-red-500",
                                bgGradient: "from-orange-50 to-red-50",
                                description: "Maintenance et dépannage informatique par nos experts certifiés",
                                features: ["Dépannage 24/7", "Installation logiciels", "Maintenance préventive", "Formation utilisateurs"],
                                link: "/contact"
                            },
                            {
                                title: "Développement",
                                icon: Code,
                                gradient: "from-red-500 to-pink-500",
                                bgGradient: "from-red-50 to-pink-50",
                                description: "Solutions sur mesure et infogérance clés en main",
                                features: ["Développement custom", "Infogérance complète", "Migration cloud", "Sécurité renforcée"],
                                link: "/contact"
                            }
                        ].map((service, index) => (
                            <div 
                                key={index}
                                className={`group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 ${
                                    currentService === index ? 'scale-105 shadow-3xl' : ''
                                }`}
                            >
                                {/* Animated Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                
                                {/* Floating Icon */}
                                <div className={`relative z-10 w-20 h-20 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <service.icon className="w-10 h-10 text-white" />
                                </div>

                                <h3 className="relative z-10 text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800">
                                    {service.title}
                                </h3>
                                
                                <p className="relative z-10 text-gray-600 mb-6 leading-relaxed">
                                    {service.description}
                                </p>

                                {/* Features List */}
                                <ul className="relative z-10 space-y-2 mb-8">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-gray-600">
                                            <div className={`w-2 h-2 bg-gradient-to-r ${service.gradient} rounded-full mr-3`}></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Link 
                                    href={service.link}
                                    className={`relative z-10 inline-flex items-center gap-2 bg-gradient-to-r ${service.gradient} text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-all duration-300 group-hover:shadow-lg`}
                                >
                                    Découvrir
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                {/* Decorative Elements */}
                                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute bottom-4 left-4 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats & Achievements Section */}
            <div className="py-32 bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10"></div>
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-semibold mb-6">
                            NOS RÉALISATIONS
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                            Pourquoi <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Nous Choisir</span> ?
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Des chiffres qui parlent d'eux-mêmes
                        </p>
                    </div>

                    {/* Animated Stats Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                        {[
                            { number: "500+", label: "Clients Satisfaits", icon: Users, color: "from-yellow-500 to-orange-500" },
                            { number: "15+", label: "Années d'Expérience", icon: Award, color: "from-orange-500 to-red-500" },
                            { number: "99.9%", label: "Disponibilité", icon: Zap, color: "from-red-500 to-pink-500" },
                            { number: "24/7", label: "Support Technique", icon: Shield, color: "from-pink-500 to-purple-500" }
                        ].map((stat, index) => (
                            <div 
                                key={index}
                                className="group text-center p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105"
                            >
                                <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300">
                                    {stat.number}
                                </div>
                                <p className="text-gray-300 font-semibold">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "Équipe d'Experts",
                                description: "Des professionnels certifiés avec une expertise reconnue dans le domaine IT",
                                gradient: "from-yellow-500 to-orange-500"
                            },
                            {
                                icon: Shield,
                                title: "Sécurité Maximale",
                                description: "Protection avancée de vos données avec les dernières technologies de sécurité",
                                gradient: "from-orange-500 to-red-500"
                            },
                            {
                                icon: Zap,
                                title: "Performance Optimale",
                                description: "Solutions optimisées pour des performances exceptionnelles et une fiabilité maximale",
                                gradient: "from-red-500 to-pink-500"
                            },
                            {
                                icon: Globe,
                                title: "Innovation Continue",
                                description: "Toujours à la pointe des dernières technologies pour vous offrir le meilleur",
                                gradient: "from-pink-500 to-purple-500"
                            },
                            {
                                icon: TrendingUp,
                                title: "Croissance Accompagnée",
                                description: "Solutions évolutives qui s'adaptent à la croissance de votre entreprise",
                                gradient: "from-purple-500 to-indigo-500"
                            },
                            {
                                icon: Award,
                                title: "Qualité Certifiée",
                                description: "Standards de qualité élevés avec certifications et garanties étendues",
                                gradient: "from-indigo-500 to-blue-500"
                            }
                        ].map((feature, index) => (
                            <div 
                                key={index}
                                className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Epic CTA Section */}
            <div className="relative py-32 bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 3}s`
                            }}
                        ></div>
                    ))}
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                    <div className="mb-12">
                        <div className="inline-block px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg font-semibold mb-8 border border-white/30">
                            🚀 PRÊT POUR LA TRANSFORMATION ?
                        </div>
                        <h2 className="text-6xl md:text-7xl font-black text-white mb-8 leading-tight">
                            Transformez Votre
                            <br />
                            <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                                Infrastructure IT
                            </span>
                        </h2>
                        <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
                            Rejoignez plus de <span className="font-bold text-yellow-200">500 entreprises</span> qui nous font confiance. 
                            Consultation gratuite et solutions sur mesure garanties.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 justify-center items-center mb-16">
                        <Link 
                            href="/contact" 
                            className="group relative bg-white text-gray-900 px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center gap-3"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                            </div>
                            Consultation Gratuite
                        </Link>
                        <Link 
                            href="/shop" 
                            className="group relative border-3 border-white text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-white hover:text-gray-900 transition-all duration-300 backdrop-blur-sm bg-white/10 flex items-center gap-3"
                        >
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                                <ArrowRight className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                            </div>
                            Découvrir Nos Produits
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl font-black text-white mb-2">24h</div>
                            <div className="text-white/80">Réponse Garantie</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl font-black text-white mb-2">100%</div>
                            <div className="text-white/80">Satisfaction Client</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl font-black text-white mb-2">15+</div>
                            <div className="text-white/80">Années d'Expérience</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final Brand Section */}
            <div className="py-24 bg-white relative overflow-hidden">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
                    <div className="mb-12">
                        <img 
                            src="/uploads/logo.png" 
                            alt="VAL DE SEINE SERVICE" 
                            className="h-24 w-auto mx-auto mb-8"
                        />
                    </div>
                    
                    <h3 className="text-5xl font-black text-gray-900 mb-6">
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                            VAL DE SEINE SERVICE
                        </span>
                    </h3>
                    
                    <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
                        Votre Partenaire de Confiance pour Toutes Vos Technologies
                    </p>

                    <div className="grid md:grid-cols-2 gap-12 text-left">
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-lg">
                            <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                                    📞
                                </div>
                                Contact Direct
                            </h4>
                            <div className="space-y-4">
                                <p className="text-gray-700 text-lg">📞 <span className="font-semibold">+212-539-38-89-65</span></p>
                                <p className="text-gray-700 text-lg">✉️ <span className="font-semibold">valedeseineservice@gmail.com</span></p>
                                <p className="text-gray-700 text-lg">🕒 <span className="font-semibold">Lun-Ven: 9h-18h | Sam: 9h-13h</span></p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-lg">
                            <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                    ⚡
                                </div>
                                Nos Services
                            </h4>
                            <div className="space-y-4">
                                <p className="text-gray-700 text-lg">🛒 <span className="font-semibold">Vente de matériel informatique</span></p>
                                <p className="text-gray-700 text-lg">🔧 <span className="font-semibold">Services de maintenance IT</span></p>
                                <p className="text-gray-700 text-lg">💻 <span className="font-semibold">Développement et infogérance</span></p>
                                <p className="text-gray-700 text-lg">🛡️ <span className="font-semibold">Sécurisation des systèmes</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16">
                        <p className="text-gray-600 text-lg">
                            © 2024 VAL DE SEINE SERVICE. Tous droits réservés. | 
                            <span className="text-yellow-600 font-semibold"> Votre succès, notre priorité.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
