'use client';
import { LitLogo } from '@/components/LitLogo'
import { useState } from 'react';

export default function Home() {

  const [status, setStatus] = useState('');
  const [response, setResponse] = useState('');

  async function go() {
    // ...your code here
    setStatus('Getting started...');
    
    const foo = { 'foo': 'bar' };
    setResponse(`foo: ${JSON.stringify(foo)}`);
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

      <div className="flex justify-center mt-10 text-white">
        <p>{status}</p>
      </div>

      <div className="flex justify-center mt-10 text-white">
        <p>{response}</p>
      </div>

    </main>
  )
}
