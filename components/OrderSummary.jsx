import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import AddressModal from './AddressModal';
import StripeProvider from './StripeProvider';
import CheckoutForm from './CheckoutForm';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/contexts/DatabaseCartContext';
import { useSession } from 'next-auth/react';

const OrderSummary = ({ totalPrice }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const { cartItems, clearCart } = useCart();
    const router = useRouter();
    const { data: session } = useSession();

    const [addressList, setAddressList] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [showStripeCheckout, setShowStripeCheckout] = useState(false);

    // Fetch user addresses
    const fetchAddresses = async () => {
        if (!session?.user?.id) return;
        
        try {
            const response = await fetch('/api/addresses');
            if (response.ok) {
                const addresses = await response.json();
                setAddressList(addresses);
                if (addresses.length > 0 && !selectedAddress) {
                    setSelectedAddress(addresses[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [session]);

    const handleAddressAdded = (newAddress) => {
        setAddressList(prev => [newAddress, ...prev]);
        setSelectedAddress(newAddress);
    };

    const handleCouponCode = async (event) => {
        event.preventDefault();
        
        if (!couponCodeInput.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        try {
            const response = await fetch(`/api/coupons/${couponCodeInput.trim()}`);
            const data = await response.json();

            if (response.ok) {
                // Check if coupon is valid and active
                if (!data.isActive) {
                    toast.error('This coupon is not active');
                    return;
                }

                if (new Date() > new Date(data.expiresAt)) {
                    toast.error('This coupon has expired');
                    return;
                }

                if (data.maxUsage && data.usageCount >= data.maxUsage) {
                    toast.error('This coupon has reached its usage limit and is no longer available');
                    return;
                }

                // Check if user is eligible for this coupon
                if (data.forNewUser) {
                    // Check if user has any previous orders
                    const ordersResponse = await fetch('/api/orders');
                    if (ordersResponse.ok) {
                        const orders = await ordersResponse.json();
                        if (orders.length > 0) {
                            toast.error('This coupon is only for new users');
                            return;
                        }
                    }
                }

                // Apply the coupon
                setCoupon(data);
                setCouponCodeInput('');
                toast.success(`Coupon "${data.code}" applied successfully! ${data.discount}% off`);
            } else {
                toast.error(data.error || 'Invalid coupon code');
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            toast.error('Failed to apply coupon. Please try again.');
        }
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (paymentMethod === 'STRIPE') {
            setShowStripeCheckout(true);
        } else {
            // Handle COD order
            try {
                // Get the store ID from the first cart item
                const storeId = cartItems.length > 0 ? cartItems[0].product?.storeId : null;
                
                if (!storeId) {
                    toast.error('No store information found. Please try again.');
                    return;
                }

                // Check if user has an address
                if (!selectedAddress) {
                    toast.error('Please select or add an address before placing an order.');
                    setShowAddressModal(true);
                    return;
                }

                const finalTotal = coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)) : totalPrice;
                
                const orderData = {
                    total: finalTotal,
                    storeId: storeId,
                    addressId: selectedAddress.id,
                    paymentMethod: 'COD',
                    isCouponUsed: !!coupon,
                    coupon: coupon ? {
                        code: coupon.code,
                        discount: coupon.discount,
                        description: coupon.description
                    } : {},
                    orderItems: cartItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }

                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                })

                if (response.ok) {
                    const orderResult = await response.json();
                    
                    // Track coupon usage if a coupon was used
                    if (coupon && orderResult.id) {
                        try {
                            await fetch(`/api/coupons/${coupon.code}/use`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    orderId: orderResult.id
                                })
                            });
                        } catch (error) {
                            console.error('Error tracking coupon usage:', error);
                            // Don't fail the order if coupon tracking fails
                        }
                    }
                    
                    // Clear the cart after successful order
                    await clearCart();
                    toast.success('Order placed successfully! You will pay on delivery.');
                    router.push('/orders');
                } else {
                    toast.error('Failed to place order. Please try again.');
                }
            } catch (error) {
                console.error('Error placing COD order:', error)
                toast.error('Failed to place order. Please try again.');
            }
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>COD</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-gray-500' />
                <label htmlFor="STRIPE" className='cursor-pointer'>Stripe Payment</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select 
                                        className='border border-slate-400 p-2 w-full my-3 outline-none rounded' 
                                        onChange={(e) => setSelectedAddress(addressList[e.target.value])} 
                                        value=""
                                    >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>Free</p>
                        {coupon && <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}</p>
            </div>
            <button onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'placing Order...' })} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all'>Place Order</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} onAddressAdded={handleAddressAdded} />}

            {showStripeCheckout && (
                <div className="mt-6">
                    <StripeProvider>
                        <CheckoutForm 
                            totalPrice={coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)) : totalPrice}
                            coupon={coupon}
                        />
                    </StripeProvider>
                    <button 
                        onClick={() => setShowStripeCheckout(false)}
                        className="w-full mt-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>
                </div>
            )}

        </div>
    )
}

export default OrderSummary