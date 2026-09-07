# Veilcrypt

A local-first, zero-knowledge file encryption tool. Files are encrypted using a native C engine (AES-256-GCM via OpenSSL) — nothing is stored, no accounts, no tracking of what you encrypt.

```
veilcrypt/
├── veilcrypt-engine/       # C — the encryption core
├── web/
│   ├── server/             # Node.js/Express backend
│   └── client/             # React/Vite/TypeScript frontend
└── README.md                # this file
```

## Table of Contents

- [Architecture](#architecture)
- [Why a C core?](#why-a-c-core)
- [The `.veil` File Format](#the-veil-file-format)
- [Getting Started](#getting-started)
- [C Engine](#c-engine)
- [Backend (Node/Express)](#backend-nodeexpress)
- [Frontend (React)](#frontend-react)
- [Security Notes](#security-notes)
- [Project Status](#project-status)
- [License](#license)

## Architecture

```
┌─────────────┐   HTTP (multipart/form-data)   ┌──────────────────┐   child_process.execFile   ┌───────────────┐
│   React     │ ─────────────────────────────▶ │  Express backend │ ─────────────────────────▶ │  C engine      │
│  frontend   │ ◀───────────────────────────── │  (Node.js)       │ ◀───────────────────────── │  (veilcrypt)   │
└─────────────┘   encrypted/decrypted file      └──────────────────┘      stdout / stderr        └───────────────┘
```

1. The user uploads a file and a password from the browser.
2. The Express backend saves the upload into a fresh, per-request temporary directory (a random UUID folder), then invokes the compiled `veilcrypt` C binary with `child_process.execFile()`. The password is passed as a real argument, never through a shell, so special characters in a password can't cause shell injection.
3. Using a brand-new temp directory per request means the output file can never already exist, which avoids the CLI's interactive overwrite prompt — something that would otherwise hang a server request indefinitely.
4. The C engine derives a key from the password (PBKDF2-HMAC-SHA256), encrypts or decrypts the file (AES-256-GCM), and writes the result into that same temp directory.
5. The backend parses the CLI's stdout to find the output filename, streams that file back to the browser as a download, and deletes the temporary directory.

No file, password, or derived key is ever persisted beyond the lifetime of a single request, and nothing is sent to any third-party service.

## Why a C core?

The actual cryptography — key derivation, AES-256-GCM encryption/decryption, and the `.veil` file format — is implemented in C using OpenSSL's EVP API, rather than in JavaScript. The Express layer is a thin wrapper whose only job is receiving uploads and invoking the binary; the encryption logic itself is portable, independently testable via its own CLI and test suite, and has no dependency on Node or the web stack at all.

## The `.veil` File Format

```
┌────────────┬───────────┬──────────┬───────────┬───────────────────┬──────────────┬─────────────┐
│ magic (4B) │ salt (16B)│  iv (12B)│ tag (16B) │ filename_len (2B) │ filename (N) │ ciphertext  │
│  "VLT1"    │           │          │           │                   │              │             │
└────────────┴───────────┴──────────┴───────────┴───────────────────┴──────────────┴─────────────┘
```

- **magic** — 4-byte identifier (`"VLT1"`) confirming the file is a valid Veilcrypt archive, and marking the format version.
- **salt** — 16 random bytes used in PBKDF2 key derivation.
- **iv** — 12-byte nonce used by AES-GCM.
- **tag** — 16-byte GCM authentication tag, verified on decryption.
- **filename_len / filename** — the original file's name (including its extension), stored so it can be restored automatically on decrypt. This is why encrypting `photo.jpg` produces `photo.veil`, and decrypting `photo.veil` restores `photo.jpg` — the extension isn't lost, it's recovered from this metadata.
- **ciphertext** — the encrypted file contents. GCM is a stream cipher mode, so ciphertext length always equals plaintext length; no padding is added.

## Getting Started

### Prerequisites

- GCC or Clang, and `make`
- OpenSSL 3.x (development headers and libraries)
- Node.js and npm

```bash
# macOS
brew install openssl@3

# Debian/Ubuntu
sudo apt install libssl-dev
```

### 1. Build the C engine

```bash
cd veilcrypt-engine
make
```

Produces the binary at `veilcrypt-engine/build/veilcrypt`. If `make` fails to find OpenSSL headers (common on macOS), see [C Engine → Build](#build) below.

### 2. Configure and run the backend

```bash
cd web/server
npm install
cp .env.example .env
```

Edit `.env` and set `VEILCRYPT_BINARY_PATH` to the **absolute path** of the binary built above:

```bash
# find the exact path
cd ../../veilcrypt-engine && echo "$(pwd)/build/veilcrypt"
```

```
VEILCRYPT_BINARY_PATH=/absolute/path/to/veilcrypt-engine/build/veilcrypt
```

```bash
cd ../web/server
npm run dev
```

### 3. Run the frontend

```bash
cd web/client
npm install
npm run dev
```

---

## C Engine

Located in `veilcrypt-engine/`.

### Features

- AES-256-GCM authenticated encryption — tampering or a wrong password causes decryption to fail cleanly rather than returning corrupted data silently.
- PBKDF2-HMAC-SHA256 key derivation, 200,000 iterations, fresh random salt per file.
- Custom `.veil` format with embedded original-filename metadata.
- Automatic output naming — `secret.txt` → `secret.veil` → restores `secret.txt`.
- Overwrite protection with an interactive `(y/n)` confirmation prompt (bypassed by the backend via unique per-request temp directories, since a hanging prompt would block a server request).
- Chunked file I/O — files are read/written without loading unnecessarily large buffers into memory at once.
- No dependencies beyond OpenSSL — no database, no network calls.

### Build

```bash
cd veilcrypt-engine
make
```

**macOS OpenSSL path issues:** macOS doesn't expose OpenSSL headers globally. If `make` fails on `<openssl/evp.h>`, find your install path:

```bash
brew --prefix openssl@3
```

Then update the `Makefile`:

```makefile
CFLAGS = -Wall -Wextra -g -Iinclude -I<path>/include
LDLIBS = -lssl -lcrypto -L<path>/lib
```

(Apple Silicon typically resolves to `/opt/homebrew/opt/openssl@3`, Intel Macs to `/usr/local/opt/openssl@3`.)

### CLI Usage

```bash
./build/veilcrypt encrypt <input_file> <password>
./build/veilcrypt decrypt <input_file.veil> <password>
```

```bash
./build/veilcrypt encrypt report.pdf "correct horse battery staple"
# → Encrypted successfully: report.pdf -> report.veil

./build/veilcrypt decrypt report.veil "correct horse battery staple"
# → Decrypted successfully: report.veil -> report.pdf
```

### Project Structure

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

### Testing

```bash
cd veilcrypt-engine/tests
./run_tests.sh
```

Covers: basic round-trip, wrong-password rejection, empty file handling, non-existent input, invalid argument count, empty password rejection, tampered ciphertext detection, invalid file format detection, filename/extension restoration, and binary file integrity.

**Memory safety** (checked with AddressSanitizer):

```bash
gcc -Wall -Wextra -g -fsanitize=address -Iinclude \
    -o build/veilcrypt_debug \
    src/main.c src/file_io.c src/keyderive.c src/crypto.c src/format.c \
    -lssl -lcrypto
```

---

## Backend (Node/Express)

Located in `web/server/`.

### Environment Variables (`.env`)

```
PORT=5005
VEILCRYPT_BINARY_PATH=/absolute/path/to/veilcrypt-engine/build/veilcrypt
MAX_FILE_SIZE_MB=100
```

### API Endpoints

**`GET /health`**
Returns `{ "status": "ok" }` — used to confirm the server is running.

**`POST /api/encrypt`**
`multipart/form-data` with fields:
- `file` — the file to encrypt
- `password` — the encryption password

Returns the encrypted `.veil` file as a download on success.

**`POST /api/decrypt`**
`multipart/form-data` with fields:
- `file` — the `.veil` file to decrypt
- `password` — the decryption password

Returns the original file (its name and extension restored from the `.veil` metadata) as a download on success.

**Error responses** are JSON, e.g.:
```json
{ "error": "Wrong password or corrupted file" }
```

| Status | Cause |
|---|---|
| 400 | No file uploaded, missing/empty password, or the uploaded file isn't a valid `.veil` archive |
| 401 | Wrong password, or a `.veil` file that's been tampered with (GCM auth tag mismatch) |
| 500 | Unexpected server-side failure |

### Project Structure

```
web/server/
├── src/
│   ├── config/
│   │   └── env.config.js        # Loads .env, resolves the binary path
│   ├── middleware/
│   │   ├── upload.middleware.js       # Multer disk storage, per-request temp dirs
│   │   └── errorHandler.middleware.js
│   ├── services/
│   │   └── veilcrypt.service.js       # execFile wrapper around the C binary
│   ├── controllers/
│   │   └── crypto.controller.js
│   ├── routes/
│   │   └── crypto.routes.js
│   ├── utils/
│   │   └── tempDir.util.js            # Per-request UUID temp directories
│   └── app.js
├── uploads/                            # gitignored — per-request temp dirs, cleaned up after each request
├── server.js
├── .env
└── package.json
```

### Testing (via curl)

```bash
echo "hello backend test" > test.txt

curl -X POST http://localhost:5005/api/encrypt \
  -F "file=@test.txt" \
  -F "password=mypassword123" \
  --output test.veil

curl -X POST http://localhost:5005/api/decrypt \
  -F "file=@test.veil" \
  -F "password=mypassword123" \
  --output decrypted_test.txt

diff test.txt decrypted_test.txt   # exit code 0 = identical
```

---

## Frontend (React)

Located in `web/client/`.

- **Stack:** React + Vite + TypeScript + Tailwind CSS + React Router
- **No authentication** — Veilcrypt has no accounts or login; the tool is open-access.
- **Structure:** a marketing landing page (`Home`) separate from the actual encrypt/decrypt tool, which lives on its own route.

### Landing Page Sections

Navbar → Hero → Features → How It Works → Use Cases → Trust/Security section → Footer.

- **Navbar** — desktop nav (Encrypt / Decrypt / My Keys) plus a distinct mobile "Seal Dock": a floating bottom capsule with a raised lock/unlock seal button that opens a slide-up navigation sheet.
- **Features / How It Works / Use Cases / Trust** — consistent visual language across sections: a dot-pattern background, centered layout, and an icon hover-translate micro-interaction.

### Development

```bash
cd web/client
npm install
npm run dev
```

---

## Security Notes

- **Encryption:** AES-256-GCM — authenticated encryption, so tampering or an incorrect password causes decryption to fail rather than silently returning corrupted data.
- **Key derivation:** PBKDF2-HMAC-SHA256, 200,000 iterations, unique random salt per file.
- **No accounts, no server-side storage.** Uploaded files exist only inside a per-request temp directory and are deleted immediately after the response is sent.
- **Password strength matters.** PBKDF2 raises the cost of brute-forcing a password but does not make a weak password safe — use a long, unique passphrase.
- This project has not undergone a professional third-party security audit. Treat it as a learning/portfolio project and evaluate independently before relying on it for sensitive production data.

