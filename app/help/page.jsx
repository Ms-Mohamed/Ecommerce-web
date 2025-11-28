import PageTitle from '@/components/PageTitle';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title="Centre d'aide" />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Centre d'aide</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Questions fréquemment posées</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">Comment passer une commande ?</h3>
                  <p className="text-gray-600 mt-1">Parcourez simplement nos produits, ajoutez des articles à votre panier et procédez au paiement. Vous pouvez payer par carte de crédit ou choisir le paiement à la livraison.</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">Quels modes de paiement acceptez-vous ?</h3>
                  <p className="text-gray-600 mt-1">Nous acceptons toutes les principales cartes de crédit, cartes de débit et paiement à la livraison (PAD) pour votre commodité.</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">Combien de temps prend la livraison ?</h3>
                  <p className="text-gray-600 mt-1">La livraison standard prend 3-5 jours ouvrables. La livraison express est disponible pour 1-2 jours ouvrables.</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">Puis-je suivre ma commande ?</h3>
                  <p className="text-gray-600 mt-1">Oui ! Une fois votre commande expédiée, vous recevrez un numéro de suivi par e-mail pour surveiller le progrès de votre colis.</p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contacter le support</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Support par e-mail</h3>
                  <p className="text-gray-600 mb-3">Obtenez de l'aide par e-mail dans les 24 heures</p>
                  <a href="mailto:support@gocart.com" className="text-green-600 hover:underline">
                    support@gocart.com
                  </a>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Support téléphonique</h3>
                  <p className="text-gray-600 mb-3">Appelez-nous pour une assistance immédiate</p>
                  <a href="tel:+15550123" className="text-green-600 hover:underline">
                    +1-555-0123
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
