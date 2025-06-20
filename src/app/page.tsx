"use client";
import { useState } from "react";
import client from "./appwriteClient";

export default function PingButton() {
  const [result, setResult] = useState<string | null>(null);

  const handlePing = async () => {
    try {
      await client.ping();
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