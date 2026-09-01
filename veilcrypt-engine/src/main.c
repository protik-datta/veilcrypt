#include <stdio.h>
#include <openssl/opensslv.h>
#include <openssl/evp.h>

int main(void)
{
  printf("Veilcrypt engine starting...\n");
  printf("OpenSSL version: %s\n", OPENSSL_VERSION_TEXT);

  const EVP_CIPHER *cipher = EVP_aes_256_cbc();

  if (cipher == NULL)
  {
    fprintf(stderr, "Error: AES-256-GCM cipher not available.\n");
    return 1;
  }

  printf("AES-256-GCM cipher loaded successfully.\n");
  printf("Setup OK.\n");

  return 0;
}
