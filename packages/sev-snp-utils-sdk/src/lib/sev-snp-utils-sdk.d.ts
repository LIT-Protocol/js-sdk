/**
 *Initialize function for the wasm library
 */
export function initWasmSevSnpUtilsSdk(): void;

/**
 * Checks a base64 encoded attestation report and challenge.  Throws an error if it is invalid.
 * @param {String} report
 */
export function verify_attestation_report_and_check_challenge(
  report: String,
  data: Object,
  signatures: Array<String>,
  challenge: String
): Promise<undefined>;

/**
 * Checks a base64 encoded attestation report.  Throws an error if it is invalid.
 * @param {String} report
 */
export function verify_attestation_report(report: String): Promise<undefined>;

export function parse_attestation_report(report: String): Object;

export function get_vcek_url(report: String): String;
