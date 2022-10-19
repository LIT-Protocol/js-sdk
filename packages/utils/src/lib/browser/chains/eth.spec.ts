import * as ethModule from './eth';

describe('eth.ts', () => {

    it('should convert chain hex to chane name', async () => {
        
        const test = ethModule.chainHexIdToChainName("0x1");

        expect(test).toBe("ethereum");

    })
    
    it('should convert chain hex to chane name', async () => {
        
        const test = ethModule.chainHexIdToChainName("0x89");

        expect(test).toBe("polygon");

    })

    // TEST: Test other chains, uncomment console.log("hexIds:", hexIds) to check all chain hex ids


    it('should return error if string doesnt include 0x', async () => {

        console.log = jest.fn();
        
        try{
            ethModule.chainHexIdToChainName("2329");
        }catch(e){
            console.log(e);
        }

        expect((console.log as any).mock.calls[0][0].errorCode).toBe('wrong_param_format_exception');

    })
    
    it('should return error if chain hex id not found', async () => {

        console.log = jest.fn();
        
        try{
            ethModule.chainHexIdToChainName("0x9999");
        }catch(e){
            console.log(e);
        }

        expect((console.log as any).mock.calls[0][0].errorCode).toBe('unsupported_chain');

    })

    it('should get RPCS Urls in the correct format', async () => {

        const rpcUrls = ethModule.getRPCUrls();

        expect(rpcUrls).toStrictEqual({"1": "https://eth-mainnet.alchemyapi.io/v2/EuGnkVlzVoEkzdg0lpCarhm8YHOxWVxE", "10": "https://mainnet.optimism.io", "100": "https://rpc.gnosischain.com", "1313161554": "https://mainnet.aurora.dev", "137": "https://polygon-rpc.com", "1666600000": "https://api.harmony.one", "25": "https://evm-cronos.org", "250": "https://rpcapi.fantom.network", "3": "https://ropsten.infura.io/v3/96dffb3d8c084dec952c61bd6230af34", "4": "https://rinkeby.infura.io/v3/96dffb3d8c084dec952c61bd6230af34", "42": "https://kovan.infura.io/v3/ddf1ca3700f34497bca2bf03607fde38", "42161": "https://arb1.arbitrum.io/rpc", "42220": "https://forno.celo.org", "43113": "https://api.avax-test.network/ext/bc/C/rpc", "43114": "https://api.avax.network/ext/bc/C/rpc", "44787": "https://alfajores-forno.celo-testnet.org", "5": "https://goerli.infura.io/v3/96dffb3d8c084dec952c61bd6230af34", "50": "https://rpc.xinfin.network", "56": "https://bsc-dataseed.binance.org/", "80001": "https://rpc-mumbai.maticvigil.com/v1/96bf5fa6e03d272fbd09de48d03927b95633726c", "9000": "https://eth.bd.evmos.dev:8545", "9001": "https://eth.bd.evmos.org:8545", "955305": "https://host-76-74-28-226.contentfabric.io/eth"});

    })

});