'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"

export default function StoreAddProduct() {

    const [categories, setCategories] = useState([])
    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: "",
        price: "",
        categoryId: "",
        inStock: true,
        stockQuantity: 0
    })
    const [loading, setLoading] = useState(false)
    const [categoriesLoading, setCategoriesLoading] = useState(true)

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories')
            if (response.ok) {
                const data = await response.json()
                // Ensure data is an array
                if (Array.isArray(data)) {
                    setCategories(data)
                } else {
                    console.error('Categories data is not an array:', data)
                    setCategories([])
                }
            } else {
                toast.error('Failed to fetch categories')
                setCategories([])
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Error fetching categories')
            setCategories([])
        } finally {
            setCategoriesLoading(false)
        }
    }


    const onChangeHandler = (e) => {
        const { name, value, type, checked } = e.target
        setProductInfo({ 
            ...productInfo, 
            [name]: type === 'checkbox' ? checked : value 
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            // For now, we'll use a default store ID
            // In a real app, you'd get this from the user's store
            const storeId = 'cmgjcptbp0001vt40le7ox6we' // Default store ID
            
            const productData = {
                name: productInfo.name,
                description: productInfo.description,
                mrp: parseFloat(productInfo.mrp),
                price: parseFloat(productInfo.price),
                categoryId: productInfo.categoryId,
                inStock: productInfo.inStock,
                stockQuantity: parseInt(productInfo.stockQuantity),
                storeId: storeId,
                images: ['/assets/product_img1.png'] // Default image for now
            }
            
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            })
            
            if (response.ok) {
                toast.success('Product added successfully!')
                // Reset form
                setProductInfo({
                    name: "",
                    description: "",
                    mrp: "",
                    price: "",
                    categoryId: "",
                    inStock: true,
                    stockQuantity: 0
                })
                setImages({ 1: null, 2: null, 3: null, 4: null })
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to add product')
            }
        } catch (error) {
            console.error('Error adding product:', error)
            toast.error('Failed to add product')
        } finally {
            setLoading(false)
        }
    }


    return (
        <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })} className="text-slate-500 mb-28">
            <h1 className="text-2xl">Add New <span className="text-slate-800 font-medium">Products</span></h1>
            <p className="mt-7">Product Images</p>

            <div htmlFor="" className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image width={300} height={300} className='h-15 w-auto border border-slate-200 rounded cursor-pointer' src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt="" />
                        <input type="file" accept='image/*' id={`images${key}`} onChange={e => setImages({ ...images, [key]: e.target.files[0] })} hidden />
                    </label>
                ))}
            </div>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Name
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" required />
            </label>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Description
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
            </label>

            <div className="flex gap-5">
                <label htmlFor="" className="flex flex-col gap-2 ">
                    MRP - Maximum Retail Price ($)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="Enter original price" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                    <small className="text-xs text-slate-400">Original price before discount</small>
                </label>
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Selling Price ($)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="Enter selling price" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                    <small className="text-xs text-slate-400">Price customers will pay</small>
                </label>
            </div>

            <select onChange={e => setProductInfo({ ...productInfo, categoryId: e.target.value })} value={productInfo.categoryId} className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded" required disabled={categoriesLoading}>
                <option value="">{categoriesLoading ? 'Loading categories...' : 'Select a category'}</option>
                {Array.isArray(categories) && categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>

            <div className="flex gap-5 my-6">
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Stock Quantity
                    <input type="number" name="stockQuantity" onChange={onChangeHandler} value={productInfo.stockQuantity} placeholder="Enter stock quantity" min="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                </label>
                <div className="flex flex-col gap-2 justify-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            name="inStock" 
                            checked={productInfo.inStock}
                            onChange={onChangeHandler}
                            className="w-4 h-4 text-slate-600 bg-gray-100 border-gray-300 rounded focus:ring-slate-500"
                        />
                        <span className="text-slate-700">In Stock</span>
                    </label>
                </div>
            </div>

            <br />

            <button disabled={loading} className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition">Add Product</button>
        </form>
    )
}