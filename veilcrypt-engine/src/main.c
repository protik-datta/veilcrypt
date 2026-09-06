#include <stdio.h>
#include <openssl/opensslv.h>
#include <openssl/evp.h>
#include "file_io.h"

int main(void)
{
  printf("Veilcrypt engine starting...\n");
  printf("OpenSSL version: %s\n", OPENSSL_VERSION_TEXT);

  const EVP_CIPHER *cipher = EVP_aes_256_gcm();

  if (cipher == NULL)
  {
    fprintf(stderr, "Error: AES-256-GCM cipher not available.\n");
    return 1;
  }

  printf("AES-256-GCM cipher loaded successfully.\n");
  printf("Setup OK.\n");

  // --- Phase 2 test ---
  if (copy_file_chunked("test_input.txt", "test_output.txt") == 0)
  {
    printf("File copy successful.\n");
  }
  else
  {
    printf("File copy failed.\n");
    return 1;
  }

  return 0;
}
