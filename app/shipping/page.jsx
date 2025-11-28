import PageTitle from '@/components/PageTitle';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title="Shipping Information" />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Information</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Options</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-2">Standard Shipping</h3>
                  <p className="text-gray-600 mb-3">3-5 business days</p>
                  <p className="text-sm text-gray-500">Free on orders over $50</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-2">Express Shipping</h3>
                  <p className="text-gray-600 mb-3">1-2 business days</p>
                  <p className="text-sm text-gray-500">$9.99 flat rate</p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Areas</h2>
              <p className="text-gray-600 mb-4">We currently ship to the following areas:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>United States (All 50 states)</li>
                <li>Canada (Major cities)</li>
                <li>United Kingdom</li>
                <li>Australia</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
