#include "keyderive.h"
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <string.h>
#include <stdio.h>

int generate_salt(unsigned char *salt)
{
  if (RAND_bytes(salt, SALT_LEN) != 1)
  {
    fprintf(stderr, "generate_salt: RAND_bytes failed\n");
    return -1;
  }
  return 0;
}

int derive_key(const char *password, const unsigned char *salt, unsigned char *key)
{
  int result = PKCS5_PBKDF2_HMAC(
      password, (int)strlen(password),
      salt, SALT_LEN,
      PBKDF2_ITERATIONS,
      EVP_sha256(),
      KEY_LEN, key);

  if (result != 1)
  {
    fprintf(stderr, "derive_key: PKCS5_PBKDF2_HMAC failed\n");
    return -1;
  }

  return 0;
}
