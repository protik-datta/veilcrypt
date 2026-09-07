# Security Policy

## About Veilcrypt

Veilcrypt is a privacy-focused file encryption system built around a native C/OpenSSL cryptographic engine and a web interface.

The project uses authenticated encryption and password-derived encryption keys to protect file confidentiality and integrity.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

If you discover a security vulnerability in Veilcrypt, please do not publicly disclose it through GitHub Issues.

Instead, contact the maintainer privately with:

- A description of the vulnerability
- Steps to reproduce it
- Potential security impact
- Relevant logs or proof-of-concept, if available

Please allow reasonable time for the issue to be investigated and fixed before public disclosure.

## Security Architecture

Veilcrypt currently uses:

- AES-256-GCM for authenticated encryption
- PBKDF2-HMAC-SHA256 for password-based key derivation
- Random salts for key derivation
- Random IVs/nonces for encryption
- Authentication tags for ciphertext integrity
- A custom `.veil` encrypted file format
- A native C/OpenSSL cryptographic engine
- Temporary processing directories for file operations

## Data Handling

Uploaded files may be temporarily stored during server-side processing.

Temporary processing data should be removed after the operation completes or fails.

Veilcrypt does not intentionally store user passwords.

Users should not upload highly sensitive data to a deployment they do not control unless they understand and trust its server-side processing model.

## Threat Model

Veilcrypt is designed primarily to protect encrypted files against unauthorized access and ciphertext tampering.

The following are outside the security guarantees of the application:

- A compromised client device
- Malware or keyloggers on the user's device
- Weak or compromised passwords
- A compromised server or hosting environment
- Compromised operating-system libraries or cryptographic dependencies
- Vulnerabilities in third-party dependencies

## Cryptographic Disclaimer

Veilcrypt has not undergone an independent professional security audit.

The cryptographic implementation should not be considered a substitute for independently audited security software.

Security claims are limited to the documented implementation and architecture.

## Responsible Disclosure

Security researchers are encouraged to report vulnerabilities responsibly and privately.

Please avoid accessing, modifying, or deleting data that does not belong to you while investigating a vulnerability.
