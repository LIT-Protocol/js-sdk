'use client';
import { LitLogo } from '@/components/LitLogo'

export default function Home() {

  async function go() {
    // ...your code here
  }

  return (
    <main>
      <div className="flex justify-center mt-10">
        <LitLogo />
      </div>

      <div className="flex justify-center mt-10">
        <h1 className="text-5xl font-bold">
          Lit Protocol:: Session Sigs
        </h1>
      </div>

      <div className="flex justify-center mt-10">
        <button onClick={go} className="lit-button">Go</button>
      </div>

    </main>
  )
}
