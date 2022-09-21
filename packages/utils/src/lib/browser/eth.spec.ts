import * as ethModule from './eth';
import { ABI_LIT, ABI_ERC20 } from "@litprotocol-dev/core";

describe('eth.ts', () => {

    it('should convert chain hex to chane name', async () => {
        
        const test = ethModule.chainHexIdToChainName("0x1");

        expect(test).toBe("ethereum");

    })
    
    it('should convert chain hex to chane name', async () => {
        
        const test = ethModule.chainHexIdToChainName("0x89");

        expect(test).toBe("polygon");

    })

    // TODO: Test other chains, uncomment console.log("hexIds:", hexIds) to check all chain hex ids


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


});