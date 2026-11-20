#include "format.h"
#include "file_io.h"
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

const char *path_basename(const char *path)
{
  const char *slash = strrchr(path, '/');
  return slash ? slash + 1 : path;
}

// A stored name must be a plain file name: no directories, no "..", no control chars.
int is_safe_filename(const char *name)
{
  size_t len = strlen(name);
  if (len == 0 || len > MAX_FILENAME_LEN)
    return 0;
  if (strcmp(name, ".") == 0 || strcmp(name, "..") == 0)
    return 0;

  for (size_t i = 0; i < len; i++)
  {
    unsigned char c = (unsigned char)name[i];
    if (c == '/' || c == '\\' || c < 0x20 || c == 0x7f)
      return 0;
  }
  return 1;
}

size_t build_aad(unsigned char *out,
                 const unsigned char *salt,
                 const unsigned char *iv,
                 const char *filename)
{
  size_t n = 0;
  size_t flen = strlen(filename);

  memcpy(out + n, MAGIC_BYTES, MAGIC_LEN);
  n += MAGIC_LEN;
  memcpy(out + n, salt, SALT_LEN);
  n += SALT_LEN;
  memcpy(out + n, iv, IV_LEN);
  n += IV_LEN;
  out[n++] = (unsigned char)(flen & 0xff); // explicit little-endian length
  out[n++] = (unsigned char)((flen >> 8) & 0xff);
  memcpy(out + n, filename, flen);
  n += flen;
  return n;
}

int write_vlt_file(
    const char *filepath,
    const unsigned char *salt,
    const unsigned char *iv,
    const unsigned char *tag,
    const char *original_filename,
    const unsigned char *ciphertext, size_t ciphertext_len)
{
  if (!is_safe_filename(original_filename))
  {
    fprintf(stderr, "write_vlt_file: invalid filename\n");
    return -1;
  }

  char tmp_path[1100];
  FILE *fp = secure_tmp_open(filepath, tmp_path, sizeof(tmp_path));
  if (fp == NULL)
    return -1;

  VeilcryptHeader header;
  memcpy(header.magic, MAGIC_BYTES, MAGIC_LEN);
  memcpy(header.salt, salt, SALT_LEN);
  memcpy(header.iv, iv, IV_LEN);
  memcpy(header.tag, tag, TAG_LEN);

  size_t fname_len = strlen(original_filename);
  unsigned char len_bytes[2] = {
      (unsigned char)(fname_len & 0xff),
      (unsigned char)((fname_len >> 8) & 0xff)};

  if (fwrite(&header, 1, HEADER_SIZE, fp) != HEADER_SIZE ||
      fwrite(len_bytes, 1, 2, fp) != 2 ||
      fwrite(original_filename, 1, fname_len, fp) != fname_len ||
      (ciphertext_len > 0 && fwrite(ciphertext, 1, ciphertext_len, fp) != ciphertext_len))
  {
    fprintf(stderr, "write_vlt_file: write failed\n");
    secure_tmp_abort(fp, tmp_path);
    return -1;
  }

  return secure_tmp_commit(fp, tmp_path, filepath);
}

int read_vlt_file(
    const char *filepath,
    unsigned char *salt,
    unsigned char *iv,
    unsigned char *tag,
    char **original_filename,
    unsigned char **ciphertext, size_t *ciphertext_len,
    int *version)
{
  char *fname_buf = NULL;
  unsigned char *ct_buf = NULL;

  FILE *fp = fopen(filepath, "rb");
  if (fp == NULL)
  {
    perror("read_vlt_file: fopen failed");
    return -1;
  }

  if (fseek(fp, 0, SEEK_END) != 0)
    goto bad_read;
  long total_size = ftell(fp);
  if (total_size < 0 || fseek(fp, 0, SEEK_SET) != 0)
    goto bad_read;

  if (total_size < (long)(HEADER_SIZE + 2))
  {
    fprintf(stderr, "read_vlt_file: invalid file format (file too small)\n");
    goto fail;
  }

  VeilcryptHeader header;
  unsigned char len_bytes[2];
  if (fread(&header, 1, HEADER_SIZE, fp) != HEADER_SIZE ||
      fread(len_bytes, 1, 2, fp) != 2)
    goto bad_read;

  if (memcmp(header.magic, MAGIC_BYTES, MAGIC_LEN) == 0)
    *version = 2;
  else if (memcmp(header.magic, MAGIC_BYTES_V1, MAGIC_LEN) == 0)
    *version = 1;
  else
  {
    fprintf(stderr, "read_vlt_file: invalid file format (bad magic bytes)\n");
    goto fail;
  }

  size_t fname_len = (size_t)len_bytes[0] | ((size_t)len_bytes[1] << 8);
  long remaining = total_size - (long)HEADER_SIZE - 2;
  if (fname_len == 0 || fname_len > MAX_FILENAME_LEN || remaining < (long)fname_len)
  {
    fprintf(stderr, "read_vlt_file: invalid file format (bad filename length)\n");
    goto fail;
  }

  fname_buf = malloc(fname_len + 1);
  if (fname_buf == NULL || fread(fname_buf, 1, fname_len, fp) != fname_len)
    goto bad_read;
  fname_buf[fname_len] = '\0';

  if (strlen(fname_buf) != fname_len) // embedded NUL
  {
    fprintf(stderr, "read_vlt_file: invalid file format (bad filename)\n");
    goto fail;
  }

  // Old VLT1 files stored whatever path was typed on the command line; keep only the name.
  if (*version == 1)
  {
    const char *base = path_basename(fname_buf);
    memmove(fname_buf, base, strlen(base) + 1);
  }

  if (!is_safe_filename(fname_buf))
  {
    fprintf(stderr, "read_vlt_file: invalid file format (unsafe filename)\n");
    goto fail;
  }

  size_t ct_len = (size_t)(remaining - (long)fname_len);
  if (ct_len > (size_t)INT_MAX)
  {
    fprintf(stderr, "read_vlt_file: invalid file format (file too large)\n");
    goto fail;
  }

  ct_buf = malloc(ct_len > 0 ? ct_len : 1);
  if (ct_buf == NULL || (ct_len > 0 && fread(ct_buf, 1, ct_len, fp) != ct_len))
    goto bad_read;

  fclose(fp);
  memcpy(salt, header.salt, SALT_LEN);
  memcpy(iv, header.iv, IV_LEN);
  memcpy(tag, header.tag, TAG_LEN);
  *original_filename = fname_buf;
  *ciphertext = ct_buf;
  *ciphertext_len = ct_len;
  return 0;

bad_read:
  fprintf(stderr, "read_vlt_file: failed to read file\n");
fail:
  free(fname_buf);
  free(ct_buf);
  fclose(fp);
  return -1;
}
