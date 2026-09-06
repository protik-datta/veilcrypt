#ifndef KEYDRIVE_H
#define KEYDRIVE_H

#include <stddef.h>

#define SALT_LEN 16
#define KEY_LEN 32 // AES-256 needs a 32-byte key
#define PBKDF2_ITERATIONS 200000

int generate_salt(unsigned char *salt);
int derive_key(const char *password, const unsigned char *salt, unsigned char *key);

#endif
