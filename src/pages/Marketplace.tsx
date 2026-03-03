import Layout from "@/components/layout/Layout";
import { Search } from "lucide-react";

const categories = [
  { name: "AI Tools", count: 24 },
  { name: "Templates", count: 18 },
  { name: "Courses", count: 12 },
  { name: "E-books", count: 31 },
  { name: "Plugins", count: 9 },
  { name: "Assets", count: 45 },
];

const Marketplace = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground mt-1">Discover and purchase digital products</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-secondary text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-card border border-border rounded-xl p-6 cursor-pointer card-hover"
            >
              <h3 className="text-lg font-bold text-foreground">{cat.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">{cat.count} products</p>
            </div>
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
