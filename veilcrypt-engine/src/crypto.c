#include "crypto.h"
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <stdio.h>

int encrypt_data(
    const unsigned char *key,
    const unsigned char *plaintext, int plaintext_len,
    unsigned char *iv,
    unsigned char *ciphertext,
    unsigned char *tag)
{
  if (RAND_bytes(iv, IV_LEN) != 1)
  {
    fprintf(stderr, "encrypt_data: RAND_bytes (IV) failed\n");
    return -1;
  }

  EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
  if (ctx == NULL)
  {
    fprintf(stderr, "encrypt_data: EVP_CIPHER_CTX_new failed\n");
    return -1;
  }

  int len = 0;
  int ciphertext_len = 0;

  if (EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, NULL, NULL) != 1)
  {
    fprintf(stderr, "encrypt_data: EncryptInit (cipher) failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }

  if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, IV_LEN, NULL) != 1)
  {
    fprintf(stderr, "encrypt_data: set IV length failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }

  if (EVP_EncryptInit_ex(ctx, NULL, NULL, key, iv) != 1)
  {
    fprintf(stderr, "encrypt_data: EncryptInit (key/iv) failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }

  if (EVP_EncryptUpdate(ctx, ciphertext, &len, plaintext, plaintext_len) != 1)
  {
    fprintf(stderr, "encrypt_data: EncryptUpdate failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }
  ciphertext_len = len;

  if (EVP_EncryptFinal_ex(ctx, ciphertext + len, &len) != 1)
  {
    fprintf(stderr, "encrypt_data: EncryptFinal failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }
  ciphertext_len += len;

  if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, TAG_LEN, tag) != 1)
  {
    fprintf(stderr, "encrypt_data: get tag failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }

  EVP_CIPHER_CTX_free(ctx);
  return ciphertext_len;
}

int decrypt_data(
    const unsigned char *key,
    const unsigned char *ciphertext, int ciphertext_len,
    const unsigned char *iv,
    const unsigned char *tag,
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

  if (EVP_DecryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, NULL, NULL) != 1)
  {
    fprintf(stderr, "decrypt_data: DecryptInit (cipher) failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }

  if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, IV_LEN, NULL) != 1)
  {
    fprintf(stderr, "decrypt_data: set IV length failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }

  if (EVP_DecryptInit_ex(ctx, NULL, NULL, key, iv) != 1)
  {
    fprintf(stderr, "decrypt_data: DecryptInit (key/iv) failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }

  if (EVP_DecryptUpdate(ctx, plaintext, &len, ciphertext, ciphertext_len) != 1)
  {
    fprintf(stderr, "decrypt_data: DecryptUpdate failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }
  plaintext_len = len;

  if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_TAG, TAG_LEN, (void *)tag) != 1)
  {
    fprintf(stderr, "decrypt_data: set tag failed\n");
    EVP_CIPHER_CTX_free(ctx);
    return -1;
  }

  int ret = EVP_DecryptFinal_ex(ctx, plaintext + len, &len);
  EVP_CIPHER_CTX_free(ctx);

  if (ret <= 0)
  {
    fprintf(stderr, "decrypt_data: authentication failed (wrong password or corrupted file)\n");
    return -1;
  }

  plaintext_len += len;
  return plaintext_len;
}
