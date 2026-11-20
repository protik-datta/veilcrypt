#ifndef FILE_IO_H
#define FILE_IO_H

#include <stddef.h>
#include <stdio.h>

unsigned char *read_file_to_buffer(const char *filePath, size_t *out_size);
int write_buffer_to_file(const char *filepath, const unsigned char *data, size_t size);
int copy_file_chunked(const char *src_path, const char *dest_path);

// Atomic, owner-only (0600) output: write to a temp file, then rename into place.
FILE *secure_tmp_open(const char *final_path, char *tmp_path, size_t tmp_size);
int secure_tmp_commit(FILE *fp, const char *tmp_path, const char *final_path);
void secure_tmp_abort(FILE *fp, const char *tmp_path);

#endif
