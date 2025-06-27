"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export function OnboardingPage() {
  return (
    <div className="p-8">
      <OnboardingForm onComplete={() => console.log("Onboarding complete")} />
    </div>
  );
}

export function PreviousButton({ currentStep, prevStep }: { currentStep: number; prevStep: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={prevStep}
      disabled={currentStep === 1}
      aria-disabled={currentStep === 1}
      className={`border-[#444] text-white hover:bg-[#333] min-w-[100px] w-full sm:w-auto ${currentStep === 1 ? 'bg-[#2a2a2a] text-[#bbb] border-[#666] cursor-not-allowed' : ''}`}
    >
      <ChevronLeft size={16} className="mr-2" />
      Previous
    </Button>
  );
}