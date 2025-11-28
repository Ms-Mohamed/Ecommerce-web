'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import Loading from "@/components/Loading";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Product() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/products/${productId}`);
            
            if (!response.ok) {
                throw new Error('Produit non trouvé');
            }
            
            const data = await response.json();
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (productId) {
            fetchProduct();
            scrollTo(0, 0);
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="mx-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center py-20">
                        <Loading />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-20">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
                        <p className="text-gray-600 mb-8">{error}</p>
                        <a href="/shop" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                            Retour à la boutique
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumbs */}
                <div className="text-gray-600 text-sm mt-8 mb-5">
                    Accueil / Produits / {product?.category?.name || 'Aucune catégorie'}
                </div>

                {/* Product Details */}
                {product && (<ProductDetails product={product} />)}

                {/* Description & Reviews */}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}