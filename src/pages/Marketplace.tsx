import Layout from "@/components/layout/Layout";
import { ShoppingBag, Search } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { name: "AI Tools", count: 24, color: "from-blue-500 to-cyan-500" },
  { name: "Templates", count: 18, color: "from-purple-500 to-pink-500" },
  { name: "Courses", count: 12, color: "from-green-500 to-emerald-500" },
  { name: "E-books", count: 31, color: "from-orange-500 to-amber-500" },
  { name: "Plugins", count: 9, color: "from-rose-500 to-red-500" },
  { name: "Assets", count: 45, color: "from-indigo-500 to-violet-500" },
];

const Marketplace = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <ShoppingBag className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
            <p className="text-muted-foreground">Discover and purchase digital products</p>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-secondary text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-br ${cat.color} rounded-2xl p-6 text-white cursor-pointer`}
            >
              <h3 className="text-lg font-bold">{cat.name}</h3>
              <p className="text-white/80 text-sm">{cat.count} products</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center text-muted-foreground">
          <p>More products coming soon. Stay tuned!</p>
        </div>
      </div>
    </Layout>
  );
};

export default Marketplace;
