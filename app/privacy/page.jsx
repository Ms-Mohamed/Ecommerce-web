import PageTitle from '@/components/PageTitle';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title="Privacy Policy" />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="space-y-8">
            <section>
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> January 2025
              </p>
              <p className="text-gray-600">
                At GoCart, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Name and contact information (email, phone number)</li>
                    <li>Shipping and billing addresses</li>
                    <li>Payment information (processed securely through our payment partners)</li>
                    <li>Account credentials and preferences</li>
                  </ul>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">
                  <strong>Email:</strong> privacy@gocart.com
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
