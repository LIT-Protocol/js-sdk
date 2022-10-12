import { AccsCOSMOSParams, AccsDefaultParams, AccsEVMParams, AccsRegularParams, AccsSOLV2Params } from "./interfaces";

export type Accs = Array<
    AccsRegularParams | 
    AccsDefaultParams
>;

export type EVMAccs = Array<AccsEVMParams>

export type SOLAccs = Array<AccsSOLV2Params>;

export type UnifiedAccs = Array<
    AccsRegularParams | 
    AccsDefaultParams | 
    AccsSOLV2Params | 
    AccsEVMParams | 
    AccsCOSMOSParams
>;