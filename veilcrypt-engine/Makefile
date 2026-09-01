CC = gcc
CFLAGS = -Wall -Wextra -g -Iinclude
LDLIBS = -lssl -lcrypto

TARGET = build/veilcrypt
SRCS = src/main.c src/file_io.c src/keyderive.c src/crypto.c src/format.c src/error.c
OBJS = $(SRCS:src/%.c=build/%.o)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJS) $(LDLIBS)

build/%.o: src/%.c
	@mkdir -p build
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -rf build

.PHONY: clean
