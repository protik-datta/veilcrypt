#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <sys/stat.h>
#include <termios.h>
#include <unistd.h>
#include <openssl/crypto.h>

#include "file_io.h"
#include "keyderive.h"
#include "crypto.h"
#include "format.h"

#define MAX_PASSWORD_LEN 1024

static void print_usage(const char *prog_name)
{
  fprintf(stderr, "Usage:\n");
  fprintf(stderr, "  %s encrypt <input_file> --password-stdin\n", prog_name);
  fprintf(stderr, "  %s decrypt <input_file%s> --password-stdin\n", prog_name, VEIL_EXTENSION);
  fprintf(stderr, "  %s encrypt|decrypt <file> <password>   (legacy: password is visible in the process list)\n", prog_name);
}

// Reads the password from stdin: hidden prompt on a terminal, whole stdin when piped.
static int read_password_stdin(char *buf, size_t size)
{
  int tty = isatty(STDIN_FILENO);
  struct termios oldt;
  int restore = 0;
  size_t n = 0;

  if (tty)
  {
    fprintf(stderr, "Password: ");
    if (tcgetattr(STDIN_FILENO, &oldt) == 0)
    {
      struct termios newt = oldt;
      newt.c_lflag &= ~(tcflag_t)ECHO;
      restore = (tcsetattr(STDIN_FILENO, TCSANOW, &newt) == 0);
    }
    if (fgets(buf, (int)size, stdin) != NULL)
      n = strlen(buf);
    if (restore)
      tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
    fprintf(stderr, "\n");
  }
  else
  {
    n = fread(buf, 1, size - 1, stdin);
  }
  buf[n] = '\0';

  if (n > 0 && buf[n - 1] == '\n')
    buf[--n] = '\0';
  if (n > 0 && buf[n - 1] == '\r')
    buf[--n] = '\0';

  return (strlen(buf) == n) ? 0 : -1; // reject embedded NUL bytes
}

static int file_exists(const char *path)
{
  struct stat buffer;
  return (stat(path, &buffer) == 0);
}

static int confirm_overwrite(const char *path)
{
  printf("Warning: '%s' already exists. Overwrite? (y/n): ", path);
  fflush(stdout);

  char response[8];
  if (fgets(response, sizeof(response), stdin) == NULL)
  {
    return 0;
  }

  return (response[0] == 'y' || response[0] == 'Y');
}

static void build_encrypted_name(const char *input_path, char *out_path, size_t out_size)
{
  const char *last_slash = strrchr(input_path, '/');
  const char *search_start = last_slash ? last_slash + 1 : input_path;
  const char *last_dot = strrchr(search_start, '.');

  size_t base_len;
  if (last_dot != NULL)
  {
    base_len = (size_t)(last_dot - input_path);
  }
  else
  {
    base_len = strlen(input_path);
  }

  if (base_len >= out_size)
  {
    base_len = out_size - 1;
  }

  memcpy(out_path, input_path, base_len);
  out_path[base_len] = '\0';

  size_t remaining = out_size - base_len;
  snprintf(out_path + base_len, remaining, "%s", VEIL_EXTENSION);
}

static int do_encrypt(const char *input_path, const char *password)
{
  if (strlen(password) == 0)
  {
    fprintf(stderr, "Error: password cannot be empty\n");
    return 1;
  }

  // Store only the file name, never the directories it was found in
  const char *stored_name = path_basename(input_path);
  if (!is_safe_filename(stored_name))
  {
    fprintf(stderr, "Error: input file name is not valid\n");
    return 1;
  }

  char output_path[1024];
  build_encrypted_name(input_path, output_path, sizeof(output_path));

  if (strcmp(input_path, output_path) == 0)
  {
    fprintf(stderr, "Error: output path would be identical to input path\n");
    return 1;
  }

  if (file_exists(output_path))
  {
    if (!confirm_overwrite(output_path))
    {
      printf("Encryption cancelled.\n");
      return 1;
    }
  }

  size_t plaintext_len = 0;
  unsigned char *plaintext = read_file_to_buffer(input_path, &plaintext_len);
  if (plaintext == NULL)
  {
    fprintf(stderr, "Error: could not read input file '%s'\n", input_path);
    return 1;
  }

  if (plaintext_len > (size_t)INT_MAX)
  {
    fprintf(stderr, "Error: file too large (limit is 2 GiB)\n");
    free(plaintext);
    return 1;
  }

  unsigned char salt[SALT_LEN];
  unsigned char key[KEY_LEN];

  if (generate_salt(salt) != 0)
  {
    fprintf(stderr, "Error: salt generation failed\n");
    free(plaintext);
    return 1;
  }
  if (derive_key(password, salt, key) != 0)
  {
    fprintf(stderr, "Error: key derivation failed\n");
    free(plaintext);
    return 1;
  }

  unsigned char iv[IV_LEN];
  unsigned char tag[TAG_LEN];
  unsigned char aad[AAD_MAX];

  if (generate_iv(iv) != 0)
  {
    fprintf(stderr, "Error: IV generation failed\n");
    OPENSSL_cleanse(key, sizeof(key));
    OPENSSL_cleanse(plaintext, plaintext_len);
    free(plaintext);
    return 1;
  }
  size_t aad_len = build_aad(aad, salt, iv, stored_name);

  unsigned char *ciphertext = malloc(plaintext_len > 0 ? plaintext_len : 1);
  if (ciphertext == NULL)
  {
    fprintf(stderr, "Error: memory allocation failed\n");
    free(plaintext);
    return 1;
  }

  int ciphertext_len = encrypt_data(key, plaintext, (int)plaintext_len, iv,
                                    aad, (int)aad_len, ciphertext, tag);
  OPENSSL_cleanse(key, sizeof(key));
  OPENSSL_cleanse(plaintext, plaintext_len);
  free(plaintext);

  if (ciphertext_len < 0)
  {
    fprintf(stderr, "Error: encryption failed\n");
    free(ciphertext);
    return 1;
  }

  if (write_vlt_file(output_path, salt, iv, tag, stored_name,
                     ciphertext, (size_t)ciphertext_len) != 0)
  {
    fprintf(stderr, "Error: could not write output file '%s'\n", output_path);
    free(ciphertext);
    return 1;
  }

  free(ciphertext);
  printf("Encrypted successfully: %s -> %s\n", input_path, output_path);
  return 0;
}

static int do_decrypt(const char *input_path, const char *password)
{
  if (strlen(password) == 0)
  {
    fprintf(stderr, "Error: password cannot be empty\n");
    return 1;
  }

  unsigned char salt[SALT_LEN];
  unsigned char iv[IV_LEN];
  unsigned char tag[TAG_LEN];
  char *original_filename = NULL;
  unsigned char *ciphertext = NULL;
  size_t ciphertext_len = 0;
  int version = 0;

  if (read_vlt_file(input_path, salt, iv, tag, &original_filename,
                    &ciphertext, &ciphertext_len, &version) != 0)
  {
    fprintf(stderr, "Error: could not read or parse '%s'\n", input_path);
    return 1;
  }

  if (file_exists(original_filename))
  {
    if (!confirm_overwrite(original_filename))
    {
      printf("Decryption cancelled.\n");
      free(original_filename);
      free(ciphertext);
      return 1;
    }
  }

  unsigned char key[KEY_LEN];
  if (derive_key(password, salt, key) != 0)
  {
    fprintf(stderr, "Error: key derivation failed\n");
    free(original_filename);
    free(ciphertext);
    return 1;
  }

  unsigned char *plaintext = malloc(ciphertext_len > 0 ? ciphertext_len : 1);
  if (plaintext == NULL)
  {
    fprintf(stderr, "Error: memory allocation failed\n");
    free(original_filename);
    free(ciphertext);
    return 1;
  }

  // VLT2 authenticates the header and file name; legacy VLT1 files have no AAD
  unsigned char aad[AAD_MAX];
  size_t aad_len = (version == 2) ? build_aad(aad, salt, iv, original_filename) : 0;

  int plaintext_len = decrypt_data(key, ciphertext, (int)ciphertext_len, iv, tag,
                                   aad, (int)aad_len, plaintext);
  OPENSSL_cleanse(key, sizeof(key));
  free(ciphertext);

  if (plaintext_len < 0)
  {
    fprintf(stderr, "Error: decryption failed (wrong password or corrupted file)\n");
    free(original_filename);
    free(plaintext);
    return 1;
  }

  if (write_buffer_to_file(original_filename, plaintext, (size_t)plaintext_len) != 0)
  {
    fprintf(stderr, "Error: could not write output file '%s'\n", original_filename);
    free(original_filename);
    free(plaintext);
    return 1;
  }

  printf("Decrypted successfully: %s -> %s\n", input_path, original_filename);
  free(original_filename);
  OPENSSL_cleanse(plaintext, (size_t)plaintext_len);
  free(plaintext);
  return 0;
}

int main(int argc, char *argv[])
{
  if (argc != 4)
  {
    print_usage(argv[0]);
    return 1;
  }

  const char *command = argv[1];
  const char *input_path = argv[2];
  const char *password = argv[3];

  char pw_buf[MAX_PASSWORD_LEN + 1];
  if (strcmp(argv[3], "--password-stdin") == 0)
  {
    if (read_password_stdin(pw_buf, sizeof(pw_buf)) != 0)
    {
      fprintf(stderr, "Error: could not read password\n");
      return 1;
    }
    password = pw_buf;
  }

  int rc;
  if (strcmp(command, "encrypt") == 0)
  {
    rc = do_encrypt(input_path, password);
  }
  else if (strcmp(command, "decrypt") == 0)
  {
    rc = do_decrypt(input_path, password);
  }
  else
  {
    fprintf(stderr, "Error: unknown command '%s'\n", command);
    print_usage(argv[0]);
    rc = 1;
  }

  OPENSSL_cleanse(pw_buf, sizeof(pw_buf));
  return rc;
}
