#include "crypto.h"
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <stdio.h>

int generate_iv(unsigned char *iv)
{
  if (RAND_bytes(iv, IV_LEN) != 1)
  {
    fprintf(stderr, "generate_iv: RAND_bytes failed\n");
    return -1;
  }
  return 0;
}

int encrypt_data(
    const unsigned char *key,
    const unsigned char *plaintext, int plaintext_len,
    const unsigned char *iv,
    const unsigned char *aad, int aad_len,
    unsigned char *ciphertext,
    unsigned char *tag)
{
  EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
  if (ctx == NULL)
  {
    fprintf(stderr, "encrypt_data: EVP_CIPHER_CTX_new failed\n");
    return -1;
  }

  int len = 0;
  int ciphertext_len = 0;
  int ret = -1;

  if (EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, NULL, NULL) != 1 ||
      EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, IV_LEN, NULL) != 1 ||
      EVP_EncryptInit_ex(ctx, NULL, NULL, key, iv) != 1)
  {
    fprintf(stderr, "encrypt_data: cipher setup failed\n");
    goto done;
  }

  // AAD must be fed before any plaintext
  if (aad_len > 0 && EVP_EncryptUpdate(ctx, NULL, &len, aad, aad_len) != 1)
  {
    fprintf(stderr, "encrypt_data: AAD update failed\n");
    goto done;
  }

  if (EVP_EncryptUpdate(ctx, ciphertext, &len, plaintext, plaintext_len) != 1)
  {
    fprintf(stderr, "encrypt_data: EncryptUpdate failed\n");
    goto done;
  }
  ciphertext_len = len;

  if (EVP_EncryptFinal_ex(ctx, ciphertext + len, &len) != 1)
  {
    fprintf(stderr, "encrypt_data: EncryptFinal failed\n");
    goto done;
  }
  ciphertext_len += len;

  if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, TAG_LEN, tag) != 1)
  {
    fprintf(stderr, "encrypt_data: get tag failed\n");
    goto done;
  }

  ret = ciphertext_len;

done:
  EVP_CIPHER_CTX_free(ctx);
  return ret;
}

int decrypt_data(
    const unsigned char *key,
    const unsigned char *ciphertext, int ciphertext_len,
    const unsigned char *iv,
    const unsigned char *tag,
    const unsigned char *aad, int aad_len,
    unsigned char *plaintext)
{
  EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
  if (ctx == NULL)
  {
    fprintf(stderr, "decrypt_data: EVP_CIPHER_CTX_new failed\n");
    return -1;
  }

  int len = 0;
  int plaintext_len = 0;
  int ret = -1;

  if (EVP_DecryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, NULL, NULL) != 1 ||
      EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, IV_LEN, NULL) != 1 ||
      EVP_DecryptInit_ex(ctx, NULL, NULL, key, iv) != 1)
  {
    fprintf(stderr, "decrypt_data: cipher setup failed\n");
    goto done;
  }

  if (aad_len > 0 && EVP_DecryptUpdate(ctx, NULL, &len, aad, aad_len) != 1)
  {
    fprintf(stderr, "decrypt_data: AAD update failed\n");
    goto done;
  }

  if (EVP_DecryptUpdate(ctx, plaintext, &len, ciphertext, ciphertext_len) != 1)
  {
    fprintf(stderr, "decrypt_data: DecryptUpdate failed\n");
    goto done;
  }
  plaintext_len = len;

  if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_TAG, TAG_LEN, (void *)tag) != 1)
  {
    fprintf(stderr, "decrypt_data: set tag failed\n");
    goto done;
  }

  if (EVP_DecryptFinal_ex(ctx, plaintext + len, &len) <= 0)
  {
    fprintf(stderr, "decrypt_data: authentication failed (wrong password or corrupted file)\n");
    goto done;
  }

  ret = plaintext_len + len;

done:
  EVP_CIPHER_CTX_free(ctx);
  return ret;
}
