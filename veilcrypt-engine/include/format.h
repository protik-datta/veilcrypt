#ifndef FORMAT_H
#define FORMAT_H

#include <stddef.h>
#include <stdint.h>
#include "keyderive.h"
#include "crypto.h"

#define MAGIC_BYTES "VLT1"
#define MAGIC_LEN 4
#define VEIL_EXTENSION ".veil"
#define MAX_FILENAME_LEN 255

typedef struct
{
  unsigned char magic[MAGIC_LEN];
  unsigned char salt[SALT_LEN];
  unsigned char iv[IV_LEN];
  unsigned char tag[TAG_LEN];
} VeilcryptHeader;

#define HEADER_SIZE sizeof(VeilcryptHeader)

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
    unsigned char **ciphertext, size_t *ciphertext_len);

#endif
