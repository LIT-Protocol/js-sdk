use std::collections::BTreeMap;

use js_sys::Uint8Array;
use sev::certs::snp::Certificate;
use sev::firmware::host::TcbVersion;
use sha2::{Digest, Sha512};
use wasm_bindgen::prelude::*;

use sev::certs::snp::{builtin::milan, ca, Chain, Verifiable};
use sev::firmware::guest::AttestationReport;

use crate::abi::{from_js, JsResult};

/// Gets the vcek url for the given attestation report.  You can fetch this certificate yourself, and pass it in to verify_attestation_report
#[wasm_bindgen(js_name = "sevSnpGetVcekUrl")]
pub fn sev_snp_get_vcek_url(attestation_report: &[u8]) -> JsResult<String> {
    let attestation_report = parse_attestation_report(attestation_report)?;
    let url = get_vcek_url(attestation_report);
    Ok(url)
}

fn get_vcek_url(attestation_report: AttestationReport) -> String {
    const KDS_CERT_SITE: &str = "https://kdsintf.amd.com";
    #[allow(dead_code)]
    const KDS_DEV_CERT_SITE: &str = "https://kdsintfdev.amd.com";

    #[allow(dead_code)]
    const KDS_CEK: &str = "/cek/id/";

    const KDS_VCEK: &str = "/vcek/v1/"; // KDS_VCEK/{product_name}/{hwid}?{tcb parameter list}
    #[allow(dead_code)]
    const KDS_VCEK_CERT_CHAIN: &str = "cert_chain"; // KDS_VCEK/{product_name}/cert_chain
    #[allow(dead_code)]
    const KDS_VCEK_CRL: &str = "crl"; // KDS_VCEK/{product_name}/crl"

    const PRODUCT_NAME: &str = "Milan";

    let AttestationReport {
        chip_id,
        reported_tcb:
            TcbVersion {
                bootloader,
                tee,
                snp,
                microcode,
                ..
            },
        ..
    } = attestation_report;

    format!(
        "{}{}{}/{}?blSPL={bootloader:0>2}&teeSPL={tee:0>2}&snpSPL={snp:0>2}&ucodeSPL={microcode:0>2}",
        KDS_CERT_SITE, KDS_VCEK, PRODUCT_NAME, hex::encode(chip_id)
    )
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "Record<string, Uint8Array>")]
    pub type AttestationData;
}

#[wasm_bindgen(js_name = "sevSnpVerify")]
pub fn sev_snp_verify(
    attestation_report: &[u8],
    attestation_data: AttestationData,
    signatures: Vec<Uint8Array>,
    challenge: &[u8],
    vcek_certificate: &[u8],
) -> JsResult<()> {
    let attestation_report = parse_attestation_report(attestation_report)?;
    let attestation_data = from_js(attestation_data)?;
    let signatures = signatures
        .into_iter()
        .map(from_js::<Vec<u8>>)
        .collect::<JsResult<Vec<_>>>()?;
    let vcek_certificate = parse_certificate(vcek_certificate)?;

    verify_certificate(vcek_certificate, attestation_report)?;
    verify_challenge(challenge, attestation_data, signatures, attestation_report)?;

    Ok(())
}

fn parse_attestation_report(attestation_report: &[u8]) -> JsResult<AttestationReport> {
    let report = unsafe { std::ptr::read(attestation_report.as_ptr() as *const _) };
    // TODO: run some validation here?
    Ok(report)
}

fn parse_certificate(vcek_certificate: &[u8]) -> JsResult<Certificate> {
    Certificate::from_der(vcek_certificate).map_err(|e| JsError::new(e.to_string().as_str()))
}

fn verify_certificate(vcek: Certificate, report: AttestationReport) -> JsResult<()> {
    let ark = milan::ark().unwrap();
    let ask = milan::ask().unwrap();

    let ca = ca::Chain { ark, ask };

    let chain = Chain { ca, vcek };

    (&chain, &report)
        .verify()
        .map_err(|e| JsError::new(e.to_string().as_str()))
}

fn verify_challenge(
    challenge: &[u8],
    data: BTreeMap<String, Vec<u8>>,
    signatures: Vec<Vec<u8>>,
    attestation_report: AttestationReport,
) -> JsResult<()> {
    let expected_report_data = get_expected_report_data(data, signatures, challenge);

    if attestation_report.report_data != expected_report_data {
        return Err(
            JsError::new(
                "Report data does not match.  This generally indicates that the data, challenge/nonce, or signatures are bad."
            )
        );
    }
    Ok(())
}

fn get_expected_report_data(
    data: BTreeMap<String, Vec<u8>>,
    signatures: Vec<Vec<u8>>,
    challenge: &[u8],
) -> [u8; 64] {
    let mut hasher = Sha512::new();

    hasher.update("noonce");
    hasher.update(challenge);

    hasher.update("data");
    for (key, value) in data {
        hasher.update(key);
        hasher.update(value);
    }

    // FIXME: can we really have `signatures.len() == 0`?
    if signatures.is_empty() {
        hasher.update("signatures");

        // FIXME: why is the slice needed?
        for s in &signatures[..signatures.len() - 1] {
            hasher.update(s);
        }
    }

    let result = hasher.finalize();
    let mut array = [0u8; 64];
    array.copy_from_slice(&result[..]);
    array
}
