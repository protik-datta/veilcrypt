#include "format.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int write_vlt_file(
    const char *filepath,
    const unsigned char *salt,
    const unsigned char *iv,
    const unsigned char *tag,
    const char *original_filename,
    const unsigned char *ciphertext, size_t ciphertext_len)
{
  FILE *fp = fopen(filepath, "wb");
  if (fp == NULL)
  {
    perror("write_vlt_file: fopen failed");
    return -1;
  }

  VeilcryptHeader header;
  memcpy(header.magic, MAGIC_BYTES, MAGIC_LEN);
  memcpy(header.salt, salt, SALT_LEN);
  memcpy(header.iv, iv, IV_LEN);
  memcpy(header.tag, tag, TAG_LEN);

  // Write fixed header
  if (fwrite(&header, 1, HEADER_SIZE, fp) != HEADER_SIZE)
  {
    fprintf(stderr, "write_vlt_file: failed to write header\n");
    fclose(fp);
    return -1;
  }

  // Write filename length (2 bytes) + filename bytes
  size_t fname_len = strlen(original_filename);
  if (fname_len > MAX_FILENAME_LEN)
  {
    fprintf(stderr, "write_vlt_file: filename too long\n");
    fclose(fp);
    return -1;
  }
  uint16_t fname_len16 = (uint16_t)fname_len;

  if (fwrite(&fname_len16, sizeof(fname_len16), 1, fp) != 1)
  {
    fprintf(stderr, "write_vlt_file: failed to write filename length\n");
    fclose(fp);
    return -1;
  }
  if (fwrite(original_filename, 1, fname_len, fp) != fname_len)
  {
    fprintf(stderr, "write_vlt_file: failed to write filename\n");
    fclose(fp);
    return -1;
  }

  // Write ciphertext
  if (fwrite(ciphertext, 1, ciphertext_len, fp) != ciphertext_len)
  {
    fprintf(stderr, "write_vlt_file: failed to write ciphertext\n");
    fclose(fp);
    return -1;
  }

  fclose(fp);
  return 0;
}

int read_vlt_file(
    const char *filepath,
    unsigned char *salt,
    unsigned char *iv,
    unsigned char *tag,
    char **original_filename,
    unsigned char **ciphertext, size_t *ciphertext_len)
{
  FILE *fp = fopen(filepath, "rb");
  if (fp == NULL)
  {
    perror("read_vlt_file: fopen failed");
    return -1;
  }

  fseek(fp, 0, SEEK_END);
  long total_size = ftell(fp);
  rewind(fp);

  if (total_size < (long)(HEADER_SIZE + sizeof(uint16_t)))
  {
    fprintf(stderr, "read_vlt_file: file too small to be a valid .vlt file\n");
    fclose(fp);
    return -1;
  }

  // Read fixed header
  VeilcryptHeader header;
  if (fread(&header, 1, HEADER_SIZE, fp) != HEADER_SIZE)
  {
    fprintf(stderr, "read_vlt_file: failed to read header\n");
    fclose(fp);
    return -1;
  }

  if (memcmp(header.magic, MAGIC_BYTES, MAGIC_LEN) != 0)
  {
    fprintf(stderr, "read_vlt_file: invalid file format (bad magic bytes)\n");
    fclose(fp);
    return -1;
  }

  memcpy(salt, header.salt, SALT_LEN);
  memcpy(iv, header.iv, IV_LEN);
  memcpy(tag, header.tag, TAG_LEN);

  // Read filename length
  uint16_t fname_len16;
  if (fread(&fname_len16, sizeof(fname_len16), 1, fp) != 1)
  {
    fprintf(stderr, "read_vlt_file: failed to read filename length\n");
    fclose(fp);
    return -1;
  }

  // Sanity check: does the file even have enough bytes left for the filename?
  long remaining = total_size - (long)HEADER_SIZE - (long)sizeof(uint16_t);
  if (remaining < (long)fname_len16)
  {
    fprintf(stderr, "read_vlt_file: corrupted file (filename length invalid)\n");
    fclose(fp);
    return -1;
  }

  // Read filename
  char *fname_buf = malloc(fname_len16 + 1); // +1 for null terminator
  if (fname_buf == NULL)
  {
    fprintf(stderr, "read_vlt_file: malloc failed (filename)\n");
    fclose(fp);
    return -1;
  }
  if (fname_len16 > 0 && fread(fname_buf, 1, fname_len16, fp) != fname_len16)
  {
    fprintf(stderr, "read_vlt_file: failed to read filename\n");
    free(fname_buf);
    fclose(fp);
    return -1;
  }
  fname_buf[fname_len16] = '\0';

  // Read ciphertext (everything remaining)
  size_t ct_len = (size_t)(remaining - fname_len16);
  unsigned char *ct_buf = malloc(ct_len > 0 ? ct_len : 1);
  if (ct_buf == NULL)
  {
    fprintf(stderr, "read_vlt_file: malloc failed (ciphertext)\n");
    free(fname_buf);
    fclose(fp);
    return -1;
  }
  if (ct_len > 0 && fread(ct_buf, 1, ct_len, fp) != ct_len)
  {
    fprintf(stderr, "read_vlt_file: failed to read ciphertext\n");
    free(fname_buf);
    free(ct_buf);
    fclose(fp);
    return -1;
  }

  fclose(fp);
  *original_filename = fname_buf;
  *ciphertext = ct_buf;
  *ciphertext_len = ct_len;
  return 0;
}
