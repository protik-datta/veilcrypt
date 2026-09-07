# Security Policy

## Security Issues

Veilcrypt is an open-source security project. We take security vulnerabilities seriously.

If you discover a vulnerability, please avoid opening a public GitHub issue with sensitive security details.

Instead, report the issue privately to the project maintainer with:

- A clear description of the vulnerability
- Steps to reproduce
- Security impact
- Proof-of-concept, if available
- Suggested mitigation, if known

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |
| < 1.0   | No        |

## Security Architecture

Veilcrypt currently uses:

- AES-256-GCM authenticated encryption
- PBKDF2-HMAC-SHA256 password-based key derivation
- Random salts
- Random IVs/nonces
- Authentication tags
- A custom `.veil` file format
- Native C/OpenSSL cryptographic operations
- Temporary processing directories

## Security Scope

Veilcrypt is designed to provide:

- File confidentiality
- Ciphertext integrity
- Authentication of encrypted data
- Protection against incorrect passwords
- Detection of ciphertext tampering

## Limitations

Veilcrypt cannot protect against:

- A compromised user's device
- Malware or keyloggers
- Weak or compromised passwords
- A compromised server or hosting environment
- Vulnerabilities in OpenSSL or other dependencies
- Vulnerabilities in the operating system
- Malicious browser extensions

## Data Processing

In the current server-side architecture, files may be temporarily processed on the server during encryption or decryption.

Temporary processing data is intended to be removed after the operation completes.

Passwords are not intentionally stored by the application.

## Security Audit

Veilcrypt has not yet undergone an independent professional security audit.

Therefore, the project should not be considered a replacement for professionally audited cryptographic software.

## Responsible Disclosure

Please give the maintainers reasonable time to investigate and address security vulnerabilities before publicly disclosing them.

Security researchers should avoid accessing, modifying, or deleting data that does not belong to them during security testing.

## Open Source

Veilcrypt is released under the MIT License.

Contributions that improve the security, reliability, testing, and maintainability of the project are welcome.
