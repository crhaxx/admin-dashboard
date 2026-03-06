import { ShoppingCart, DollarSign, Users, Package } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Orders */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Orders</p>
              <h2 className="text-2xl font-bold mt-1">169
              </h2>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="text-blue-600" size={26} />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Revenue</p>
              <h2 className="text-2xl font-bold mt-1">$4,896</h2>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={26} />
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Users</p>
              <h2 className="text-2xl font-bold mt-1">67</h2>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="text-purple-600" size={26} />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Products</p>
              <h2 className="text-2xl font-bold mt-1">12</h2>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Package className="text-orange-600" size={26} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}