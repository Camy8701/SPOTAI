import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Calculator } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
};

const TipCalculator = () => {
  const [billAmount, setBillAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(8.5);
  const [tipPercentage, setTipPercentage] = useState<number>(18);
  const [customTipAmount, setCustomTipAmount] = useState<number>(0);
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [serviceQuality, setServiceQuality] = useState<"poor" | "good" | "excellent">("good");
  const [tipMode, setTipMode] = useState<"percentage" | "custom">("percentage");

  const calculatedTax = (billAmount * taxPercentage) / 100;
  const finalTaxAmount = taxAmount > 0 ? taxAmount : calculatedTax;
  const tipAmount = tipMode === "percentage" ? (billAmount * tipPercentage) / 100 : customTipAmount;
  const totalBill = billAmount + finalTaxAmount + tipAmount;
  const perPerson = totalBill / peopleCount;

  const serviceOptions = [
    { key: "poor", label: "Poor", percentage: 10 },
    { key: "good", label: "Good", percentage: 18 },
    { key: "excellent", label: "Excellent", percentage: 22 },
  ];

  const handleServiceQualityChange = (quality: "poor" | "good" | "excellent") => {
    setServiceQuality(quality);
    const option = serviceOptions.find((opt) => opt.key === quality);
    if (option) {
      setTipPercentage(option.percentage);
      setTipMode("percentage");
    }
  };

  const adjustPeople = (change: number) => {
    const newCount = peopleCount + change;
    if (newCount >= 1 && newCount <= 100) {
      setPeopleCount(newCount);
    }
  };

  const roundUpBill = () => {
    if (billAmount <= 0) return;
    const roundedTotal = Math.ceil(totalBill);
    const newTipAmount = roundedTotal - billAmount - finalTaxAmount;
    setCustomTipAmount(newTipAmount);
    setTipMode("custom");
  };

  const resetCalculator = () => {
    setBillAmount(0);
    setTaxAmount(0);
    setTaxPercentage(8.5);
    setTipPercentage(18);
    setCustomTipAmount(0);
    setPeopleCount(1);
    setServiceQuality("good");
    setTipMode("percentage");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                <Calculator className="h-4 w-4" />
                Utility Tool
              </div>
              <h1 className="text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Tip Calculator
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Calculate tips, tax, and per-person totals
              </p>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-border">
              <CardContent className="space-y-8 p-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Bill Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={billAmount || ""}
                      onChange={(e) => setBillAmount(Number.parseFloat(e.target.value) || 0)}
                      className="h-12 pl-8 text-lg"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tax</label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Tax Percentage</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={taxPercentage}
                          onChange={(e) => setTaxPercentage(Number.parseFloat(e.target.value) || 0)}
                          className="h-11 pr-8"
                          step="0.1"
                          min="0"
                          max="50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Tax Amount (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          placeholder={calculatedTax.toFixed(2)}
                          value={taxAmount || ""}
                          onChange={(e) => setTaxAmount(Number.parseFloat(e.target.value) || 0)}
                          className="h-11 pl-8"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Service Quality</label>
                  <div className="grid grid-cols-3 gap-3">
                    {serviceOptions.map((option) => {
                      const isActive = serviceQuality === option.key && tipMode === "percentage";
                      return (
                        <Button
                          key={option.key}
                          variant={isActive ? "default" : "outline"}
                          onClick={() => handleServiceQualityChange(option.key as "poor" | "good" | "excellent")}
                          className={isActive ? "h-14 bg-blue-600 text-white hover:bg-blue-700" : "h-14"}
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">{option.label}</span>
                            <span className="text-xs opacity-80">{option.percentage}%</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tip Input</label>
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                    <Button
                      variant={tipMode === "custom" ? "default" : "outline"}
                      onClick={() => setTipMode("custom")}
                      className={tipMode === "custom" ? "h-11 bg-violet-600 text-white hover:bg-violet-700" : "h-11"}
                    >
                      Custom Amount
                    </Button>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={customTipAmount || ""}
                        onChange={(e) => {
                          setCustomTipAmount(Number.parseFloat(e.target.value) || 0);
                          setTipMode("custom");
                        }}
                        className="h-11 pl-8"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Split Between</label>
                  <div className="flex items-center justify-center gap-5 rounded-xl border border-border bg-secondary p-5">
                    <Button variant="outline" size="icon" onClick={() => adjustPeople(-1)} disabled={peopleCount <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[64px] text-center text-3xl font-bold text-blue-600">{peopleCount}</span>
                    <Button variant="outline" size="icon" onClick={() => adjustPeople(1)} disabled={peopleCount >= 100}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border">
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-xl font-semibold tracking-tight">Bill Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">{formatCurrency(billAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-semibold">{formatCurrency(finalTaxAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tip</span>
                      <span className="font-semibold">{formatCurrency(tipAmount)}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex items-center justify-between text-base">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-blue-600">{formatCurrency(totalBill)}</span>
                      </div>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex items-center justify-between text-base">
                        <span className="font-semibold">Per Person</span>
                        <span className="font-bold text-violet-600">{formatCurrency(perPerson)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="space-y-3 p-6">
                  <Button
                    onClick={roundUpBill}
                    className="h-11 w-full bg-orange-500 text-white hover:bg-orange-600"
                    disabled={billAmount <= 0}
                  >
                    Round Up Total
                  </Button>
                  <Button onClick={resetCalculator} variant="outline" className="h-11 w-full">
                    Reset Calculator
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default TipCalculator;
