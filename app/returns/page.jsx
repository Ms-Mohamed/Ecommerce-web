import PageTitle from '@/components/PageTitle';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title="Returns & Exchanges" />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Returns & Exchanges</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Return Policy</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-medium text-green-800 mb-2">30-Day Return Window</h3>
                <p className="text-green-700">You have 30 days from the delivery date to return or exchange your items.</p>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">Eligible Items</h3>
                  <p className="text-gray-600 mt-1">All electronics and accessories in original condition with original packaging and accessories.</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">Return Process</h3>
                  <p className="text-gray-600 mt-1">Contact our support team to initiate a return. We'll provide you with a return label and instructions.</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">Refund Timeline</h3>
                  <p className="text-gray-600 mt-1">Refunds are processed within 5-7 business days after we receive your returned item.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
