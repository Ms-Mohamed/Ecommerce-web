'use client'

import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useCart } from "@/lib/contexts/DatabaseCartContext";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const { cartItems, addToCart } = useCart();
    const router = useRouter()

    const [mainImage, setMainImage] = useState(product.images[0]);

    const addToCartHandler = () => {
        addToCart(product, 1)
    }

    const averageRating = product.rating && product.rating.length > 0 
        ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
        : 0;
    
    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {product.images.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(product.images[index])} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
                    <Image src={mainImage} alt="" width={250} height={250} />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{product.rating?.length || 0} Avis</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{product.price} </p>
                    <p className="text-xl text-slate-500 line-through">{currency}{product.mrp}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>Économisez {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% maintenant</p>
                </div>
                <div className="flex items-end gap-5 mt-10">
                    {
                        cartItems[productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">Quantité</p>
                                <Counter productId={productId} />
                            </div>
                        )
                    }
                    <button 
                        onClick={() => !cartItems[productId] ? addToCartHandler() : router.push('/cart')} 
                        disabled={!product.inStock || (product.stockInfo && product.stockInfo.quantity === 0)}
                        className={`px-10 py-3 text-sm font-medium rounded transition ${
                            !product.inStock || (product.stockInfo && product.stockInfo.quantity === 0)
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'
                        }`}
                    >
                        {!product.inStock || (product.stockInfo && product.stockInfo.quantity === 0)
                            ? 'Rupture de stock'
                            : !cartItems[productId] 
                                ? 'Ajouter au panier' 
                                : 'Voir le panier'
                        }
                    </button>
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Livraison gratuite dans le monde entier </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> Paiement 100% sécurisé </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Fait confiance par les grandes marques </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails