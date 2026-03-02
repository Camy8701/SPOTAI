import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const tipPresets = [10, 15, 18, 20, 25, 30];

const TipCalculator = () => {
  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState("");
  const [splitCount, setSplitCount] = useState(1);

  const bill = parseFloat(billAmount) || 0;
  const activeTip = customTip ? parseFloat(customTip) || 0 : tipPercent;
  const tipAmount = bill * (activeTip / 100);
  const total = bill + tipAmount;
  const perPerson = splitCount > 0 ? total / splitCount : total;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-foreground mb-2 text-center">Tip Calculator</h1>
          <p className="text-muted-foreground text-center mb-10">Calculate tips quickly and split the bill with ease</p>

          <div className="bg-card rounded-2xl shadow-lg p-8 space-y-8 border border-border">
            {/* Bill Amount */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Bill Amount ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="text-2xl h-14 font-semibold"
              />
            </div>

            {/* Tip Percentage Presets */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Tip Percentage</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {tipPresets.map((pct) => (
                  <Button
                    key={pct}
                    variant={tipPercent === pct && !customTip ? "default" : "outline"}
                    className={tipPercent === pct && !customTip ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0" : ""}
                    onClick={() => { setTipPercent(pct); setCustomTip(""); }}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
              <div className="mt-3">
                <Input
                  type="number"
                  min="0"
                  placeholder="Custom %"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                />
              </div>
            </div>

            {/* Split */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Split Between</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setSplitCount(Math.max(1, splitCount - 1))}>−</Button>
                <span className="text-2xl font-bold text-foreground w-12 text-center">{splitCount}</span>
                <Button variant="outline" size="icon" onClick={() => setSplitCount(splitCount + 1)}>+</Button>
                <span className="text-muted-foreground text-sm">people</span>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-6 text-white space-y-4">
              <div className="flex justify-between">
                <span className="opacity-90">Tip Amount</span>
                <span className="text-2xl font-bold">${tipAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Total</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>
              {splitCount > 1 && (
                <div className="flex justify-between border-t border-white/30 pt-4">
                  <span className="opacity-90">Per Person</span>
                  <span className="text-3xl font-bold">${perPerson.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => { setBillAmount(""); setTipPercent(15); setCustomTip(""); setSplitCount(1); }}
            >
              Reset
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default TipCalculator;
