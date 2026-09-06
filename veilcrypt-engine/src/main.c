#include <stdio.h>
#include <openssl/opensslv.h>
#include <openssl/evp.h>
#include "file_io.h"
#include "keyderive.h"

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

  // --- Phase 3 test ---
  unsigned char salt[SALT_LEN];
  unsigned char key[KEY_LEN];

  if (generate_salt(salt) != 0)
  {
    printf("Salt generation failed.\n");
    return 1;
  }

  printf("Salt: ");
  for (int i = 0; i < SALT_LEN; i++)
    printf("%02x", salt[i]);
  printf("\n");

  if (derive_key("mypassword123", salt, key) != 0)
  {
    printf("Key derivation failed.\n");
    return 1;
  }

  printf("Derived key: ");
  for (int i = 0; i < KEY_LEN; i++)
    printf("%02x", key[i]);
  printf("\n");

  return 0;
}
