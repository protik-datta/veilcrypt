#include "file_io.h"
#include <stdio.h>
#include <stdlib.h>

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

int write_buffer_to_file(const char *filepath, const unsigned char *data, size_t size)
{
  FILE *fp = fopen(filepath, "wb");
  if (fp == NULL)
  {
    perror("write_buffer_to_file: fopen failed");
    return -1;
  }

  size_t bytes_written = fwrite(data, 1, size, fp);
  fclose(fp);

  if (bytes_written != size)
  {
    fprintf(stderr, "write_buffer_to_file: short write (%zu of %zu bytes)\n", bytes_written, size);
    return -1;
  }

  return 0;
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
