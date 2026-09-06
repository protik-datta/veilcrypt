# Veilcrypt Engine

A local-first, zero-knowledge file encryption engine written in C, using AES-256-GCM authenticated encryption. Files are encrypted entirely on the local machine — nothing is uploaded, nothing is stored on a server.

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Requirements](#requirements)
- [Build](#build)
- [Usage](#usage)
- [File Format](#file-format-veil)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Security Notes](#security-notes)
- [License](#license)

## Features

- **AES-256-GCM authenticated encryption** — provides both confidentiality and tamper detection. If an encrypted file is modified or the wrong password is used, decryption fails cleanly instead of silently producing garbage output.
- **PBKDF2-HMAC-SHA256 key derivation** — 200,000 iterations, with a fresh random salt per file, to make brute-force password guessing computationally expensive.
- **Custom `.veil` file format** — a compact binary format storing the salt, IV, auth tag, and the original filename (as metadata) alongside the ciphertext.
- **Automatic output naming** — encrypting `secret.txt` produces `secret.veil`; decrypting `secret.veil` restores the original filename and extension (`secret.txt`), recovered from the embedded metadata.
- **Overwrite protection** — prompts for confirmation before overwriting an existing file during encryption or decryption.
- **Chunked file I/O** — reads and writes files without loading unnecessarily large buffers into memory at once.
- **No dependencies beyond OpenSSL** — no databases, no network calls, no third-party frameworks.

## How It Works

1. You provide a file and a password.
2. A random 16-byte salt is generated, and PBKDF2-HMAC-SHA256 derives a 256-bit key from the password and that salt.
3. A random 12-byte IV (nonce) is generated, and the file is encrypted with AES-256-GCM, producing ciphertext and a 16-byte authentication tag.
4. The salt, IV, tag, original filename, and ciphertext are packed into a `.veil` file.
5. To decrypt, the same password re-derives the same key (using the salt stored in the file), the ciphertext is decrypted, and the authentication tag is verified — if it doesn't match, decryption is rejected.

## Requirements

- A C compiler (GCC or Clang)
- `make`
- OpenSSL 3.x (development headers and libraries)

**macOS (Homebrew):**
```bash
brew install openssl@3
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install libssl-dev
```

## Build

```bash
git clone <your-repo-url>
cd veilcrypt-engine
make
```

This produces the binary at `build/veilcrypt`.

### macOS OpenSSL path issues

macOS does not expose OpenSSL headers globally by default. If `make` fails with a "file not found" error for `<openssl/evp.h>`, find the OpenSSL install path:

```bash
brew --prefix openssl@3
```

Then update the `Makefile`:

```makefile
CFLAGS = -Wall -Wextra -g -Iinclude -I<path-from-above>/include
LDLIBS = -lssl -lcrypto -L<path-from-above>/lib
```

(Apple Silicon Macs typically resolve to `/opt/homebrew/opt/openssl@3`, Intel Macs to `/usr/local/opt/openssl@3`.)

## Usage

**Encrypt a file:**
```bash
./build/veilcrypt encrypt <input_file> <password>
```
Produces `<input_file_without_extension>.veil` in the same directory.

**Decrypt a file:**
```bash
./build/veilcrypt decrypt <input_file.veil> <password>
```
Restores the original file, using the filename embedded in the `.veil` file's metadata.

**Example:**
```bash
./build/veilcrypt encrypt report.pdf "correct horse battery staple"
# → Encrypted successfully: report.pdf -> report.veil

./build/veilcrypt decrypt report.veil "correct horse battery staple"
# → Decrypted successfully: report.veil -> report.pdf
```

If the output file already exists, you'll be prompted to confirm before it's overwritten.

## File Format (`.veil`)

```
┌─────────────┬───────────┬──────────┬───────────┬──────────────────┬──────────────┬─────────────┐
│ magic (4B)  │ salt (16B)│  iv (12B)│ tag (16B) │ filename_len (2B)│ filename (N) │ ciphertext  │
│  "VLT1"     │           │          │           │                  │              │             │
└─────────────┴───────────┴──────────┴───────────┴──────────────────┴──────────────┴─────────────┘
```

- **magic** — 4-byte identifier (`"VLT1"`) confirming the file is a valid Veilcrypt archive and marking the format version.
- **salt** — 16 random bytes used in key derivation.
- **iv** — 12-byte nonce used by AES-GCM.
- **tag** — 16-byte GCM authentication tag, verified on decryption.
- **filename_len / filename** — the original file's name, stored so it can be restored automatically on decrypt.
- **ciphertext** — the encrypted file contents (same length as the original plaintext; GCM does not add padding).

## Project Structure

```
veilcrypt-engine/
├── src/
│   ├── main.c          # CLI entry point
│   ├── file_io.c        # Chunked file read/write
│   ├── keyderive.c      # PBKDF2 key derivation + salt generation
│   ├── crypto.c         # AES-256-GCM encrypt/decrypt (OpenSSL EVP)
│   ├── format.c         # .veil header read/write
│   └── error.c          # Shared error helpers
├── include/              # Corresponding headers
├── tests/
│   ├── run_tests.sh      # Automated test suite
│   └── fixtures/
├── build/                # Compiled objects and binary (gitignored)
├── Makefile
└── README.md
```

## Testing

An automated test suite covers the core functionality:

```bash
cd tests
./run_tests.sh
```

Covered cases:
- Basic encrypt/decrypt round-trip
- Wrong password rejection
- Empty file handling
- Non-existent input file
- Invalid argument count
- Empty password rejection
- Tampered ciphertext detection
- Invalid/corrupted file format detection
- Filename/extension restoration via metadata
- Binary file integrity

### Memory safety

The build has been checked with AddressSanitizer for memory leaks and undefined behavior:

```bash
gcc -Wall -Wextra -g -fsanitize=address -Iinclude \
    -o build/veilcrypt_debug \
    src/main.c src/file_io.c src/keyderive.c src/crypto.c src/format.c \
    -lssl -lcrypto
```

## Security Notes

- **Key derivation:** PBKDF2-HMAC-SHA256 with 200,000 iterations and a unique random salt per file.
- **Encryption:** AES-256-GCM — an authenticated encryption mode providing both confidentiality and integrity. Any tampering with the ciphertext, or an incorrect password, causes decryption to fail rather than returning corrupted data silently.
- **Nothing leaves this program.** It performs no network requests and stores nothing outside the files explicitly created.
- **Password strength matters.** PBKDF2 raises the cost of brute-forcing a password but does not make a weak password safe. Use a long, unique passphrase.

This engine has not undergone a professional third-party security audit. Evaluate independently before relying on it for sensitive production data.

## License

*(Add your chosen license here — e.g. MIT.)*
