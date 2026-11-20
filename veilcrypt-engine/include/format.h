#ifndef FORMAT_H
#define FORMAT_H

#include <stddef.h>
#include <stdint.h>
#include "keyderive.h"
#include "crypto.h"

#define MAGIC_BYTES "VLT2"    // written by this version
#define MAGIC_BYTES_V1 "VLT1" // legacy: readable, but filename was not authenticated
#define MAGIC_LEN 4
#define VEIL_EXTENSION ".veil"
#define MAX_FILENAME_LEN 255

// magic + salt + iv + filename_len(2) + filename
#define AAD_MAX (MAGIC_LEN + SALT_LEN + IV_LEN + 2 + MAX_FILENAME_LEN)

typedef struct
{
    unsigned char magic[MAGIC_LEN];
    unsigned char salt[SALT_LEN];
    unsigned char iv[IV_LEN];
    unsigned char tag[TAG_LEN];
} VeilcryptHeader;

#define HEADER_SIZE sizeof(VeilcryptHeader)

const char *path_basename(const char *path);
int is_safe_filename(const char *name); // 1 = ok, 0 = reject

// Builds the data GCM authenticates alongside the ciphertext. Returns its length.
size_t build_aad(unsigned char *out,
                 const unsigned char *salt,
                 const unsigned char *iv,
                 const char *filename);

int write_vlt_file(
    const char *filepath,
    const unsigned char *salt,
    const unsigned char *iv,
    const unsigned char *tag,
    const char *original_filename,
    const unsigned char *ciphertext, size_t ciphertext_len);

int read_vlt_file(
    const char *filepath,
    unsigned char *salt,
    unsigned char *iv,
    unsigned char *tag,
    char **original_filename,
    unsigned char **ciphertext, size_t *ciphertext_len,
    int *version);

#endif
