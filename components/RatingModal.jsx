'use client'

import { Star } from 'lucide-react';
import React, { useState } from 'react'
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

const RatingModal = ({ ratingModal, setRatingModal }) => {

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: session } = useSession();

    const handleSubmit = async () => {
        if (rating < 1 || rating > 5) {
            return toast.error('Please select a rating between 1 and 5');
        }
        if (review && review.length < 5) {
            return toast.error('Please write a review with at least 5 characters or leave it empty');
        }

        if (!session?.user?.id) {
            return toast.error('Please sign in to rate products');
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rating: rating,
                    review: review,
                    productId: ratingModal.productId,
                    orderId: ratingModal.orderId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit rating');
            }

            toast.success('Rating submitted successfully!');
            setRatingModal(null);
            setRating(0);
            setReview('');
            
            // Refresh the page to show the updated rating
            window.location.reload();
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error(error.message || 'Failed to submit rating');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className='fixed inset-0 z-120 flex items-center justify-center bg-black/10'>
            <div className='bg-white p-8 rounded-lg shadow-lg w-96 relative'>
                <button onClick={() => setRatingModal(null)} className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'>
                    <XIcon size={20} />
                </button>
                <h2 className='text-xl font-medium text-slate-600 mb-4'>Rate Product</h2>
                <div className='flex items-center justify-center mb-4'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-8 cursor-pointer ${rating > i ? "text-green-400 fill-current" : "text-gray-300"}`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>
                <textarea
                    className='w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-400'
                    placeholder='Write your review (optional)'
                    rows='4'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                ></textarea>
                <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
            </div>
        </div>
    )
}

export default RatingModal