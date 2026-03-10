export default function BillingPage() {
  return (
    <div className="space-y-10">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
          <p className="text-gray-500 mt-1">
            Manage your subscription, invoices and payment methods.
          </p>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Upgrade Plan
        </button>
      </div>

      {/* Current Plan */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
        <p className="text-gray-500 mt-1">You are currently on the <strong>Starter</strong> plan.</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">$9<span className="text-lg text-gray-500">/month</span></p>
            <p className="text-gray-500 text-sm mt-1">Billed monthly</p>
          </div>

          <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            Manage Plan
          </button>
        </div>
      </section>

      {/* Payment Method */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
        <p className="text-gray-500 mt-1">Your active payment method.</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              💳
            </div>
            <div>
              <p className="font-medium text-gray-900">Visa ending in 4242</p>
              <p className="text-gray-500 text-sm">Expires 04/28</p>
            </div>
          </div>

          <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            Update Card
          </button>
        </div>
      </section>

      {/* Invoices */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
        <p className="text-gray-500 mt-1">Your billing history.</p>

        <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">

          {/* Invoice Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Invoice #00124</p>
              <p className="text-gray-500 text-sm">January 2026</p>
            </div>
            <div className="flex items-center gap-6">
              <p className="font-medium text-gray-900">$9.00</p>
              <button className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm">
                Download
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Invoice #00123</p>
              <p className="text-gray-500 text-sm">December 2025</p>
            </div>
            <div className="flex items-center gap-6">
              <p className="font-medium text-gray-900">$9.00</p>
              <button className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm">
                Download
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}