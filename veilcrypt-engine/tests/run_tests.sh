#!/bin/bash

VEILCRYPT=../build/veilcrypt
PASS=0
FAIL=0

pass() { echo "  ✓ PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "  ✗ FAIL: $1"; FAIL=$((FAIL+1)); }

cleanup() {
    rm -rf test_*.txt test_*.veil test_*.decrypted test_sandbox tampered.veil fake.veil
}

echo "=== Veilcrypt Test Suite ==="
cleanup

# Test 1: Basic round-trip
echo "Test 1: Basic encrypt/decrypt round-trip"
echo "Hello, this is a test file." > test_basic.txt
$VEILCRYPT encrypt test_basic.txt testpass123 > /dev/null 2>&1
rm test_basic.txt
$VEILCRYPT decrypt test_basic.veil testpass123 > /dev/null 2>&1
if [ -f test_basic.txt ] && diff -q <(echo "Hello, this is a test file.") test_basic.txt > /dev/null; then
    pass "round-trip content matches"
else
    fail "round-trip content mismatch or file missing"
fi

# Test 2: Wrong password rejected
echo "Test 2: Wrong password rejection"
echo "Secret content" > test_wrongpass.txt
$VEILCRYPT encrypt test_wrongpass.txt correctpass > /dev/null 2>&1
rm test_wrongpass.txt
$VEILCRYPT decrypt test_wrongpass.veil incorrectpass > /dev/null 2>&1
if [ -f test_wrongpass.txt ]; then
    fail "wrong password should NOT have produced output"
else
    pass "wrong password correctly rejected"
fi

# Test 3: Empty file
echo "Test 3: Empty file handling"
touch test_empty.txt
$VEILCRYPT encrypt test_empty.txt testpass123 > /dev/null 2>&1
rm test_empty.txt
$VEILCRYPT decrypt test_empty.veil testpass123 > /dev/null 2>&1
if [ -f test_empty.txt ] && [ ! -s test_empty.txt ]; then
    pass "empty file round-trip works"
else
    fail "empty file handling broken"
fi

# Test 4: Non-existent input file
echo "Test 4: Non-existent input file"
$VEILCRYPT encrypt test_doesnotexist.txt testpass123 > /tmp/veilcrypt_test_out 2>&1
if grep -q "Error" /tmp/veilcrypt_test_out; then
    pass "non-existent file properly rejected with error"
else
    fail "non-existent file did not produce expected error"
fi

# Test 5: Wrong argument count
echo "Test 5: Wrong argument count"
$VEILCRYPT encrypt onlyonearg > /tmp/veilcrypt_test_out 2>&1
if grep -q "Usage" /tmp/veilcrypt_test_out; then
    pass "usage message shown for wrong arg count"
else
    fail "usage message not shown"
fi

# Test 6: Empty password
echo "Test 6: Empty password rejection"
echo "content" > test_emptypass.txt
$VEILCRYPT encrypt test_emptypass.txt "" > /tmp/veilcrypt_test_out 2>&1
if grep -q "password cannot be empty" /tmp/veilcrypt_test_out; then
    pass "empty password correctly rejected"
else
    fail "empty password was not rejected"
fi
rm -f test_emptypass.txt

# Test 7: Tampered ciphertext detected
echo "Test 7: Tampered file detection"
echo "Data that should be protected" > test_tamper.txt
$VEILCRYPT encrypt test_tamper.txt testpass123 > /dev/null 2>&1
rm test_tamper.txt
cp test_tamper.veil tampered.veil
printf '\xFF' | dd of=tampered.veil bs=1 seek=40 count=1 conv=notrunc 2>/dev/null
$VEILCRYPT decrypt tampered.veil testpass123 > /tmp/veilcrypt_test_out 2>&1
if grep -q "Error" /tmp/veilcrypt_test_out && [ ! -f test_tamper.txt ]; then
    pass "tampered file correctly rejected"
else
    fail "tampered file was NOT rejected — security issue!"
fi

# Test 8: Invalid magic bytes (not a real .veil file)
echo "Test 8: Invalid file format detection"
echo "just some random text, not a real vlt file" > fake.veil
$VEILCRYPT decrypt fake.veil testpass123 > /tmp/veilcrypt_test_out 2>&1
if grep -q "Error" /tmp/veilcrypt_test_out; then
    pass "invalid file format correctly rejected"
else
    fail "invalid file format was not rejected"
fi

# Test 9: Filename extension preserved via metadata
echo "Test 9: Original extension preserved through metadata"
echo "pdf-like content" > test_metadata.pdf
$VEILCRYPT encrypt test_metadata.pdf testpass123 > /dev/null 2>&1
rm test_metadata.pdf
$VEILCRYPT decrypt test_metadata.veil testpass123 > /dev/null 2>&1
if [ -f test_metadata.pdf ]; then
    pass "original filename/extension restored from metadata"
else
    fail "original filename was not restored"
fi
rm -f test_metadata.pdf

# Test 10: Binary file integrity (not just text)
echo "Test 10: Binary file round-trip"
dd if=/dev/urandom of=test_binary.bin bs=1024 count=10 > /dev/null 2>&1
cp test_binary.bin test_binary_original.bin
$VEILCRYPT encrypt test_binary.bin testpass123 > /dev/null 2>&1
rm test_binary.bin
$VEILCRYPT decrypt test_binary.veil testpass123 > /dev/null 2>&1
if diff -q test_binary_original.bin test_binary.bin > /dev/null 2>&1; then
    pass "binary file integrity preserved"
else
    fail "binary file corrupted during round-trip"
fi
rm -f test_binary_original.bin test_binary.bin

# ---------------------------------------------------------------
# Security tests (VLT2): path traversal, filename authentication,
# stdin password, file permissions
# ---------------------------------------------------------------

# forge_veil <good.veil> <new_filename> <out.veil>
# Rebuilds a .veil with a different stored filename (header and ciphertext untouched).
# Layout: 48-byte header | 2-byte LE name length | name | ciphertext
forge_veil() {
    local src="$1" newname="$2" out="$3"
    local old_len new_len
    old_len=$(( $(od -An -tu1 -j48 -N1 "$src" | tr -d ' ') + 256 * $(od -An -tu1 -j49 -N1 "$src" | tr -d ' ') ))
    new_len=${#newname}
    {
        head -c 48 "$src"
        printf "\\x$(printf '%02x' $((new_len % 256)))\\x$(printf '%02x' $((new_len / 256)))"
        printf '%s' "$newname"
        tail -c +$((48 + 2 + old_len + 1)) "$src"
    } > "$out"
}

# Test 11: stored filename never contains directories
echo "Test 11: Directory part is not stored in the header"
mkdir -p test_sandbox/sub
echo "nested" > test_sandbox/sub/test_nested.txt
$VEILCRYPT encrypt test_sandbox/sub/test_nested.txt testpass123 > /dev/null 2>&1
if [ -f test_sandbox/sub/test_nested.veil ] && ! grep -a -q "sub/" test_sandbox/sub/test_nested.veil \
   && grep -a -q "test_nested.txt" test_sandbox/sub/test_nested.veil; then
    pass "only the bare file name is stored"
else
    fail "directory path leaked into the .veil header"
fi

# Test 12: forged '../' filename is rejected and nothing escapes the folder
echo "Test 12: Path traversal filename rejected"
mkdir -p test_sandbox/inner
echo "payload" > test_sandbox/test_pt.txt
( cd test_sandbox && ../$VEILCRYPT encrypt test_pt.txt testpass123 > /dev/null 2>&1 )
forge_veil test_sandbox/test_pt.veil "../escaped.txt" test_sandbox/inner/forged.veil
( cd test_sandbox/inner && ../../$VEILCRYPT decrypt forged.veil testpass123 > /tmp/veilcrypt_test_out 2>&1 )
if grep -q "Error" /tmp/veilcrypt_test_out && [ ! -f test_sandbox/escaped.txt ] && [ ! -f test_sandbox/inner/escaped.txt ]; then
    pass "'../' filename rejected, nothing written"
else
    fail "path traversal NOT blocked — security issue!"
fi

# Test 13: absolute path and backslash filenames rejected
echo "Test 13: Absolute path / backslash filename rejected"
forge_veil test_sandbox/test_pt.veil "/tmp/veilcrypt_abs_escape.txt" test_sandbox/inner/abs.veil
forge_veil test_sandbox/test_pt.veil "..\\win.txt" test_sandbox/inner/bs.veil
rm -f /tmp/veilcrypt_abs_escape.txt
( cd test_sandbox/inner && ../../$VEILCRYPT decrypt abs.veil testpass123 > /tmp/veilcrypt_test_out1 2>&1 )
( cd test_sandbox/inner && ../../$VEILCRYPT decrypt bs.veil testpass123 > /tmp/veilcrypt_test_out2 2>&1 )
if grep -q "Error" /tmp/veilcrypt_test_out1 && grep -q "Error" /tmp/veilcrypt_test_out2 \
   && [ ! -f /tmp/veilcrypt_abs_escape.txt ]; then
    pass "absolute and backslash filenames rejected"
else
    fail "unsafe filename accepted — security issue!"
    rm -f /tmp/veilcrypt_abs_escape.txt
fi

# Test 14: a harmless-looking filename swap is caught by authentication
echo "Test 14: Filename is authenticated"
forge_veil test_sandbox/test_pt.veil "other.txt" test_sandbox/inner/swap.veil
( cd test_sandbox/inner && ../../$VEILCRYPT decrypt swap.veil testpass123 > /tmp/veilcrypt_test_out 2>&1 )
if grep -q "authentication failed" /tmp/veilcrypt_test_out && [ ! -f test_sandbox/inner/other.txt ]; then
    pass "renamed file fails authentication"
else
    fail "filename tampering was NOT detected — security issue!"
fi

# Test 15: password via stdin round-trip, and wrong stdin password rejected
echo "Test 15: --password-stdin"
echo "stdin secret" > test_stdin.txt
printf 'p@ss "w0rd" $(x)' | $VEILCRYPT encrypt test_stdin.txt --password-stdin > /dev/null 2>&1
rm test_stdin.txt
printf 'wrong' | $VEILCRYPT decrypt test_stdin.veil --password-stdin > /dev/null 2>&1
WRONG_LEFT=$([ -f test_stdin.txt ] && echo yes || echo no)
printf 'p@ss "w0rd" $(x)\n' | $VEILCRYPT decrypt test_stdin.veil --password-stdin > /dev/null 2>&1
if [ "$WRONG_LEFT" = "no" ] && [ -f test_stdin.txt ] && diff -q <(echo "stdin secret") test_stdin.txt > /dev/null; then
    pass "stdin password works; wrong one rejected"
else
    fail "--password-stdin misbehaved"
fi
rm -f test_stdin.txt

# Test 16: output files are owner-only (0600)
echo "Test 16: Output file permissions"
echo "private" > test_perm.txt
$VEILCRYPT encrypt test_perm.txt testpass123 > /dev/null 2>&1
rm test_perm.txt
$VEILCRYPT decrypt test_perm.veil testpass123 > /dev/null 2>&1
if [ "$(ls -l test_perm.veil | cut -c1-10)" = "-rw-------" ] && [ "$(ls -l test_perm.txt | cut -c1-10)" = "-rw-------" ]; then
    pass "encrypted and decrypted files are 0600"
else
    fail "output files are not owner-only"
fi
rm -f test_perm.txt

rm -rf test_sandbox /tmp/veilcrypt_test_out1 /tmp/veilcrypt_test_out2

cleanup

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
if [ $FAIL -gt 0 ]; then
    exit 1
fi
exit 0
