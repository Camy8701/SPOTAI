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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-teal-400 px-4 py-2 text-sm font-medium text-white">
                <Calculator className="h-4 w-4" />
                Smart Calculator
              </div>
              <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">Smart Tip Calculator</h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Calculate tips with precision and split bills easily
              </p>
            </div>

            <Card className="border-0 bg-gradient-to-br from-white to-slate-50 p-6 shadow-xl dark:from-slate-800 dark:to-slate-900">
              <CardContent className="space-y-8 p-0">
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-slate-900 dark:text-white">Bill Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-slate-500">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={billAmount || ""}
                      onChange={(e) => setBillAmount(Number.parseFloat(e.target.value) || 0)}
                      className="h-14 border-slate-200 pl-8 text-xl font-semibold focus:border-teal-500 dark:border-slate-700 dark:focus:border-teal-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-lg font-semibold text-slate-900 dark:text-white">Tax</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Percentage</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={taxPercentage}
                          onChange={(e) => setTaxPercentage(Number.parseFloat(e.target.value) || 0)}
                          className="border-slate-200 pr-8 focus:border-teal-500 dark:border-slate-700 dark:focus:border-teal-500"
                          step="0.1"
                          min="0"
                          max="50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <Input
                          type="number"
                          placeholder={calculatedTax.toFixed(2)}
                          value={taxAmount || ""}
                          onChange={(e) => setTaxAmount(Number.parseFloat(e.target.value) || 0)}
                          className="border-slate-200 pl-8 focus:border-teal-500 dark:border-slate-700 dark:focus:border-teal-500"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-slate-900 dark:text-white">Service Quality</label>
                  <div className="grid grid-cols-3 gap-3">
                    {serviceOptions.map((option) => (
                      <Button
                        key={option.key}
                        variant={serviceQuality === option.key && tipMode === "percentage" ? "default" : "outline"}
                        onClick={() => handleServiceQualityChange(option.key as "poor" | "good" | "excellent")}
                        className={`h-16 flex-col ${
                          serviceQuality === option.key && tipMode === "percentage"
                            ? "bg-gradient-to-r from-teal-600 to-teal-400 text-white hover:from-teal-700 hover:to-teal-500"
                            : "border-slate-200 hover:border-teal-500 dark:border-slate-700 dark:hover:border-teal-500"
                        }`}
                      >
                        <span className="font-semibold">{option.label}</span>
                        <span className="text-sm opacity-70">{option.percentage}%</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-slate-900 dark:text-white">Custom Tip</label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={tipMode === "custom" ? "default" : "outline"}
                      onClick={() => setTipMode("custom")}
                      className={`h-12 flex-1 ${
                        tipMode === "custom"
                          ? "bg-slate-700 hover:bg-slate-800"
                          : "border-slate-200 hover:border-slate-500 dark:border-slate-700 dark:hover:border-slate-400"
                      }`}
                    >
                      Custom Amount
                    </Button>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={customTipAmount || ""}
                        onChange={(e) => {
                          setCustomTipAmount(Number.parseFloat(e.target.value) || 0);
                          setTipMode("custom");
                        }}
                        className="h-12 border-slate-200 pl-8 focus:border-slate-500 dark:border-slate-700 dark:focus:border-slate-400"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-slate-900 dark:text-white">Split Between</label>
                  <div className="flex items-center justify-center gap-6 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustPeople(-1)}
                      disabled={peopleCount <= 1}
                      className="h-12 w-12 rounded-full border-slate-200 hover:border-teal-500 dark:border-slate-700 dark:hover:border-teal-500"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="min-w-[60px] text-center text-3xl font-bold text-teal-500">{peopleCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustPeople(1)}
                      disabled={peopleCount >= 100}
                      className="h-12 w-12 rounded-full border-slate-200 hover:border-teal-500 dark:border-slate-700 dark:hover:border-teal-500"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-700 dark:text-slate-300">Subtotal:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(billAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-700 dark:text-slate-300">Tax:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(finalTaxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-700 dark:text-slate-300">Tip Amount:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(tipAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-3 text-xl font-bold dark:border-slate-600">
                    <span className="text-slate-900 dark:text-white">Total:</span>
                    <span className="text-teal-500">{formatCurrency(totalBill)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-3 text-xl font-bold dark:border-slate-600">
                    <span className="text-slate-900 dark:text-white">Per Person:</span>
                    <span className="text-slate-700 dark:text-slate-300">{formatCurrency(perPerson)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={roundUpBill}
                    variant="outline"
                    className="h-12 border-slate-200 hover:border-teal-500 dark:border-slate-700 dark:hover:border-teal-500"
                    disabled={billAmount <= 0}
                  >
                    Round Up Total
                  </Button>
                  <Button
                    onClick={resetCalculator}
                    variant="outline"
                    className="h-12 border-slate-200 hover:border-slate-500 dark:border-slate-700 dark:hover:border-slate-400"
                  >
                    Reset Calculator
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default TipCalculator;
