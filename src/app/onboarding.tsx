"use client";
import { useState } from "react";
import client from "./appwriteClient";

export default function PingButton() {
  const [result, setResult] = useState<string | null>(null);

  const handlePing = async () => {
    try {
      // This will throw if the connection fails
      await client.call("get", "/health");
      setResult("Ping successful!");
    } catch (error) {
      setResult("Ping failed: " + (error as Error).message);
    }
  };

  return (
    <div>
      <button onClick={handlePing}>Send a ping</button>
      {result && <p>{result}</p>}
    </div>
  );
}

export function OnboardingPage() {
  return <div className="p-8">Onboarding Page</div>;
}