use crate::types::Endpoints;

#[derive(Clone, Debug)]
pub struct Endpoint {
    pub path: &'static str,
    pub version: &'static str,
}

#[derive(Clone, Debug)]
pub struct NagaEndpoints {
    pub handshake: Endpoint,
    pub sign_session_key: Endpoint,
    pub execute_js: Endpoint,
    pub pkp_sign: Endpoint,
    pub pkp_claim: Endpoint,
    pub encryption_sign: Endpoint,
}

pub const NAGA_ENDPOINTS: NagaEndpoints = NagaEndpoints {
    handshake: Endpoint { path: "/web/handshake", version: "/" },
    sign_session_key: Endpoint { path: "/web/sign_session_key", version: "/v2" },
    execute_js: Endpoint { path: "/web/execute", version: "/v2" },
    pkp_sign: Endpoint { path: "/web/pkp/sign", version: "/v2" },
    pkp_claim: Endpoint { path: "/web/pkp/claim", version: "/" },
    encryption_sign: Endpoint { path: "/web/encryption/sign", version: "/v2" },
};

#[derive(Clone, Debug)]
pub struct NetworkConfig {
    pub network: &'static str,
    pub rpc_url: Option<String>,
    pub http_protocol: &'static str,
    pub bootstrap_urls: Vec<String>,
    pub minimum_threshold: usize,
    pub required_attestation: bool,
    pub abort_timeout_ms: u64,
    pub endpoints: NagaEndpoints,
}

impl NetworkConfig {
    pub fn endpoints(&self) -> Endpoints {
        Endpoints { naga: self.endpoints.clone() }
    }

    pub fn with_bootstrap_urls<I, S>(mut self, urls: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        self.bootstrap_urls = urls.into_iter().map(Into::into).collect();
        self
    }

    pub fn with_rpc_url(mut self, rpc_url: impl Into<String>) -> Self {
        self.rpc_url = Some(rpc_url.into());
        self
    }
}

pub fn naga_dev() -> NetworkConfig {
    NetworkConfig {
        network: "naga-dev",
        rpc_url: None,
        http_protocol: "https://",
        bootstrap_urls: vec![],
        minimum_threshold: 3,
        required_attestation: false,
        abort_timeout_ms: 20_000,
        endpoints: NAGA_ENDPOINTS,
    }
}

pub fn naga_test() -> NetworkConfig {
    NetworkConfig {
        network: "naga-test",
        rpc_url: None,
        http_protocol: "https://",
        bootstrap_urls: vec![],
        minimum_threshold: 3,
        required_attestation: true,
        abort_timeout_ms: 20_000,
        endpoints: NAGA_ENDPOINTS,
    }
}

pub fn naga_staging() -> NetworkConfig {
    NetworkConfig {
        network: "naga-staging",
        rpc_url: None,
        http_protocol: "https://",
        bootstrap_urls: vec![],
        minimum_threshold: 3,
        required_attestation: true,
        abort_timeout_ms: 20_000,
        endpoints: NAGA_ENDPOINTS,
    }
}

pub fn naga_proto() -> NetworkConfig {
    NetworkConfig {
        network: "naga-proto",
        rpc_url: None,
        http_protocol: "https://",
        bootstrap_urls: vec![],
        minimum_threshold: 3,
        required_attestation: true,
        abort_timeout_ms: 20_000,
        endpoints: NAGA_ENDPOINTS,
    }
}

pub fn naga_mainnet() -> NetworkConfig {
    NetworkConfig {
        network: "naga",
        rpc_url: None,
        http_protocol: "https://",
        bootstrap_urls: vec![],
        minimum_threshold: 3,
        required_attestation: true,
        abort_timeout_ms: 20_000,
        endpoints: NAGA_ENDPOINTS,
    }
}

pub fn naga_local() -> NetworkConfig {
    NetworkConfig {
        network: "naga-local",
        rpc_url: None,
        http_protocol: "http://",
        bootstrap_urls: vec![],
        minimum_threshold: 3,
        required_attestation: false,
        abort_timeout_ms: 20_000,
        endpoints: NAGA_ENDPOINTS,
    }
}
