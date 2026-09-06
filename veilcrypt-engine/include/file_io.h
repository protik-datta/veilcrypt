#ifndef FILE_IO_H
#define FILE_IO_H

#include <stddef.h>

unsigned char *read_file_to_buffer(const char *filePath, size_t *out_size);
int write_buffer_to_file(const char *filepath, const unsigned char *data, size_t size);
int copy_file_chunked(const char *src_path, const char *dest_path);

#endif
