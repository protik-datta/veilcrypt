#ifndef CRYPTO_H
#define CRYPTO_H

#include <stddef.h>

#define IV_LEN 12
#define TAG_LEN 16

int encrypt_data(
    const unsigned char *key,
    const unsigned char *plaintext, int plaintext_len,
    unsigned char *iv,
    unsigned char *ciphertext,
    unsigned char *tag);

int decrypt_data(
    const unsigned char *key,
    const unsigned char *ciphertext, int ciphertext_len,
    const unsigned char *iv,
    const unsigned char *tag,
    unsigned char *plaintext);

#endif
