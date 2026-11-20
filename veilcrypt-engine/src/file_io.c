#include "file_io.h"
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <unistd.h>

#define CHUNK_SIZE 4096

unsigned char *read_file_to_buffer(const char *filepath, size_t *out_size)
{
  FILE *fp = fopen(filepath, "rb");
  if (fp == NULL)
  {
    perror("read_file_to_buffer: fopen failed");
    return NULL;
  }

  // Find file size
  if (fseek(fp, 0, SEEK_END) != 0)
  {
    perror("read_file_to_buffer: fseek failed");
    fclose(fp);
    return NULL;
  }
  long size = ftell(fp);
  if (size < 0)
  {
    perror("read_file_to_buffer: ftell failed");
    fclose(fp);
    return NULL;
  }
  rewind(fp);

  unsigned char *buffer = malloc((size_t)size);
  if (buffer == NULL)
  {
    fprintf(stderr, "read_file_to_buffer: malloc failed\n");
    fclose(fp);
    return NULL;
  }

  size_t bytes_read = fread(buffer, 1, (size_t)size, fp);
  fclose(fp);

  if (bytes_read != (size_t)size)
  {
    fprintf(stderr, "read_file_to_buffer: short read (%zu of %ld bytes)\n", bytes_read, size);
    free(buffer);
    return NULL;
  }

  *out_size = bytes_read;
  return buffer;
}

FILE *secure_tmp_open(const char *final_path, char *tmp_path, size_t tmp_size)
{
  int n = snprintf(tmp_path, tmp_size, "%s.tmp.XXXXXX", final_path);
  if (n < 0 || (size_t)n >= tmp_size)
  {
    fprintf(stderr, "secure_tmp_open: path too long\n");
    return NULL;
  }

  int fd = mkstemp(tmp_path); // creates the file with mode 0600
  if (fd < 0)
  {
    perror("secure_tmp_open: mkstemp failed");
    return NULL;
  }

  FILE *fp = fdopen(fd, "wb");
  if (fp == NULL)
  {
    perror("secure_tmp_open: fdopen failed");
    close(fd);
    unlink(tmp_path);
    return NULL;
  }
  return fp;
}

void secure_tmp_abort(FILE *fp, const char *tmp_path)
{
  fclose(fp);
  unlink(tmp_path);
}

int secure_tmp_commit(FILE *fp, const char *tmp_path, const char *final_path)
{
  // Surface disk-full / I/O errors instead of reporting a false success
  if (fflush(fp) != 0 || ferror(fp) || fsync(fileno(fp)) != 0)
  {
    perror("secure_tmp_commit: write failed");
    secure_tmp_abort(fp, tmp_path);
    return -1;
  }
  if (fclose(fp) != 0)
  {
    perror("secure_tmp_commit: fclose failed");
    unlink(tmp_path);
    return -1;
  }
  if (rename(tmp_path, final_path) != 0)
  {
    perror("secure_tmp_commit: rename failed");
    unlink(tmp_path);
    return -1;
  }
  return 0;
}

int write_buffer_to_file(const char *filepath, const unsigned char *data, size_t size)
{
  char tmp_path[1100];
  FILE *fp = secure_tmp_open(filepath, tmp_path, sizeof(tmp_path));
  if (fp == NULL)
    return -1;

  if (size > 0 && fwrite(data, 1, size, fp) != size)
  {
    fprintf(stderr, "write_buffer_to_file: short write\n");
    secure_tmp_abort(fp, tmp_path);
    return -1;
  }

  return secure_tmp_commit(fp, tmp_path, filepath);
}

int copy_file_chunked(const char *src_path, const char *dest_path)
{
  FILE *src = fopen(src_path, "rb");
  if (src == NULL)
  {
    perror("copy_file_chunked: fopen (src) failed");
    return -1;
  }

  FILE *dest = fopen(dest_path, "wb");
  if (dest == NULL)
  {
    perror("copy_file_chunked: fopen (dest) failed");
    fclose(src);
    return -1;
  }

  unsigned char buffer[CHUNK_SIZE];
  size_t bytes_read;

  while ((bytes_read = fread(buffer, 1, CHUNK_SIZE, src)) > 0)
  {
    size_t bytes_written = fwrite(buffer, 1, bytes_read, dest);
    if (bytes_written != bytes_read)
    {
      fprintf(stderr, "copy_file_chunked: short write\n");
      fclose(src);
      fclose(dest);
      return -1;
    }
  }

  // Check if the loop stopped due to an error, not just EOF
  if (ferror(src))
  {
    perror("copy_file_chunked: read error");
    fclose(src);
    fclose(dest);
    return -1;
  }

  fclose(src);
  fclose(dest);
  return 0;
}
