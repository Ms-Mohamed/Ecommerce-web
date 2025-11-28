import PageTitle from '@/components/PageTitle';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title="Terms of Service" />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="space-y-8">
            <section>
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> January 2025
              </p>
              <p className="text-gray-600">
                Welcome to GoCart! These Terms of Service ("Terms") govern your use of our website and services. 
                By accessing or using GoCart, you agree to be bound by these Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Information</h2>
              <p className="text-gray-600">
                We strive to provide accurate product information, but we do not warrant that product descriptions or other content 
                is accurate, complete, reliable, current, or error-free. Product images are for illustrative purposes only.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">
                  <strong>Email:</strong> legal@gocart.com
                </p>
                <p className="text-gray-600">
                  <strong>Phone:</strong> +1-555-0123
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
