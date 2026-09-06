#include <stdio.h>
#include <openssl/opensslv.h>
#include <openssl/evp.h>
#include "file_io.h"
#include "keyderive.h"
#include "crypto.h"
#include <string.h>

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

  // // --- Phase 2 test ---
  // if (copy_file_chunked("test_input.txt", "test_output.txt") == 0)
  // {
  //   printf("File copy successful.\n");
  // }
  // else
  // {
  //   printf("File copy failed.\n");
  //   return 1;
  // }

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

  // --- Phase 4 test ---
  const char *message = "This is a secret message for Veilcrypt.";
  int message_len = (int)strlen(message);

  unsigned char iv[IV_LEN];
  unsigned char tag[TAG_LEN];
  unsigned char ciphertext[256]; // big enough for this test

  int ciphertext_len = encrypt_data(key, (const unsigned char *)message, message_len, iv, ciphertext, tag);

  if (ciphertext_len < 0)
  {
    printf("Encryption failed.\n");
    return 1;
  }

  printf("Plaintext: %s\n", message);
  printf("Ciphertext (hex): ");
  for (int i = 0; i < ciphertext_len; i++)
    printf("%02x", ciphertext[i]);
  printf("\n");
  printf("IV (hex): ");
  for (int i = 0; i < IV_LEN; i++)
    printf("%02x", iv[i]);
  printf("\n");
  printf("Tag (hex): ");
  for (int i = 0; i < TAG_LEN; i++)
    printf("%02x", tag[i]);
  printf("\n");

  // --- Phase 5 test: correct password ---
  unsigned char decrypted[256];
  int decrypted_len = decrypt_data(key, ciphertext, ciphertext_len, iv, tag, decrypted);

  if (decrypted_len < 0)
  {
    printf("Decryption failed (correct password test)!\n");
  }
  else
  {
    decrypted[decrypted_len] = '\0'; // null-terminate to print as string
    printf("Decrypted: %s\n", decrypted);
    if (strcmp((char *)decrypted, message) == 0)
    {
      printf("Round-trip SUCCESS: decrypted text matches original.\n");
    }
    else
    {
      printf("Round-trip FAILED: text doesn't match!\n");
    }
  }

  // --- Phase 5 test: wrong password (should fail) ---
  unsigned char wrong_key[KEY_LEN];
  unsigned char wrong_salt[SALT_LEN];
  generate_salt(wrong_salt); // different salt just to get a different key easily
  derive_key("wrongpassword", wrong_salt, wrong_key);

  unsigned char decrypted2[256];
  int decrypted_len2 = decrypt_data(wrong_key, ciphertext, ciphertext_len, iv, tag, decrypted2);

  if (decrypted_len2 < 0)
  {
    printf("Wrong password correctly REJECTED (as expected).\n");
  }
  else
  {
    printf("WARNING: wrong password was accepted — something is wrong!\n");
  }

  return 0;
}
