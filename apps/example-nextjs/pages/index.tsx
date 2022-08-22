import { ALL_LIT_CHAINS, LIT_CHAINS } from '@lit-js-sdk-v2/constants';

const Index = () => {

  return (
    <>
      <h1>Testing app for Next.js</h1><br/>
      <button onClick={() => console.log("[Example NextJS]: import<LIT_CHAINS>:", LIT_CHAINS)}>Show LIT_CHAINS</button><br/>
      <button onClick={() => console.log("[Example NextJS]: import<ALL_LIT_CHAINS>:", ALL_LIT_CHAINS)}>Show ALL_LIT_CHAINS</button><br/>
    </>
  )
}
export default Index;