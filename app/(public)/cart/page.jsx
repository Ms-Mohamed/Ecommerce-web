'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { useCart } from "@/lib/contexts/DatabaseCartContext";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Cart() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const { cartItems, totalPrice, removeFromCart, updateQuantity, loading } = useCart();

    const handleDeleteItemFromCart = (cartItemId) => {
        removeFromCart(cartItemId);
    }

    const handleQuantityChange = (cartItemId, newQuantity) => {
        updateQuantity(cartItemId, newQuantity);
    }

    // Redirect to sign in if not authenticated
    if (status === 'loading') {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        router.push('/auth/signin');
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Chargement de votre panier...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen mx-6 text-slate-800">
                <div className="max-w-7xl mx-auto">
                    <PageTitle heading="Mon panier" text="0 articles dans votre panier" />
                    <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
                        <div className="text-center">
                            <h1 className="text-2xl sm:text-4xl font-semibold mb-4">Votre panier est vide</h1>
                            <p className="text-lg mb-8">Il semble que vous n'ayez pas encore ajouté d'articles à votre panier.</p>
                            <a href="/shop" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                                Continuer les achats
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto">
                {/* Title */}
                <PageTitle heading="Mon panier" text={`${cartItems.length} articles dans votre panier`} linkText="Ajouter plus" />

                <div className="flex items-start justify-between gap-5 max-lg:flex-col">
                    <table className="w-full max-w-4xl text-slate-600 table-auto">
                        <thead>
                            <tr className="max-sm:text-sm">
                                <th className="text-left">Produit</th>
                                <th>Quantité</th>
                                <th>Prix total</th>
                                <th className="max-md:hidden">Supprimer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => (
                                <tr key={item.cartItemId} className="space-x-2">
                                    <td className="flex gap-3 my-4">
                                        <div className="flex gap-3 items-center justify-center bg-slate-100 size-18 rounded-md">
                                            <Image 
                                                src={item.image} 
                                                className="h-14 w-auto" 
                                                alt={item.name} 
                                                width={45} 
                                                height={45} 
                                            />
                                        </div>
                                        <div>
                                            <p className="max-sm:text-sm">{item.name}</p>
                                            <p className="text-xs text-slate-500">Électronique</p>
                                            <p>{currency}{item.price}</p>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <Counter 
                                            productId={item.id} 
                                            cartItemId={item.cartItemId}
                                            onQuantityChange={handleQuantityChange}
                                        />
                                    </td>
                                    <td className="text-center">{currency}{(item.price * item.quantity).toLocaleString()}</td>
                                    <td className="text-center max-md:hidden">
                                        <button 
                                            onClick={() => handleDeleteItemFromCart(item.cartItemId)} 
                                            className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all"
                                        >
                                            <Trash2Icon size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Order Summary */}
                    <OrderSummary totalPrice={totalPrice} />
                </div>
            </div>
        </div>
    );
}