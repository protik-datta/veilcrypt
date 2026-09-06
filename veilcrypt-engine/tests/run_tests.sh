#!/bin/bash

VEILCRYPT=../build/veilcrypt
PASS=0
FAIL=0

pass() { echo "  ✓ PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "  ✗ FAIL: $1"; FAIL=$((FAIL+1)); }

cleanup() {
    rm -f test_*.txt test_*.veil test_*.decrypted tampered.veil fake.veil
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

cleanup

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
if [ $FAIL -gt 0 ]; then
    exit 1
fi
exit 0
