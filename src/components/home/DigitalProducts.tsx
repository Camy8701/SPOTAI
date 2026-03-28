import AnimateInView from "@/components/AnimateInView";

const DigitalProducts = () => (
  <section className="py-12 sm:py-16 bg-background" id="digital-products">
    <AnimateInView>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Digital Products</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover premium digital products crafted to enhance your AI journey
          </p>
        </div>
        <div className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-lg">
          Coming soon — Digital products will be available here
        </div>
      </div>
    </AnimateInView>
  </section>
);

export default DigitalProducts;
