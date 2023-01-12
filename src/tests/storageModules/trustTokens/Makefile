CC := gcc
CFLAGS := -I./boringssl/include -L./boringssl/build/crypto -lcrypto -lpthread
OBJS = src/util.o src/issue.o src/redeem.o src/key_generator.o
MAIN = bin/main
.SUFFIXES: .c .o

.c.o:
	$(CC) $(CFLAGS) -c $< -o $@

all: main

main: $(OBJS) src/config.h
	$(CC) src/main.c -o $(MAIN) $(OBJS) $(CFLAGS)

example: src/example.c src/config.h
	$(CC) src/example.c -o ./bin/example src/util.o $(CFLAGS)
	./bin/example

example.v2: src/example.v2.c src/config.h
	$(CC) src/example.v2.c -o ./bin/example src/util.o $(CFLAGS)
	./bin/example

.PHONY: generate_key, clean, test
generate_key:
	$(MAIN) --key-generate

test:
	$(MAIN) --issue AAMErExYr55oHCnfKWmOOuhfH/AKjoTDq7y+mzPPSh/BrxlXI/oRlKVhn5pTot1h+JKrWo13F8qpxN683sN22DP4/NXEUaAPVuZTOLf3+zODMnH+mz7ZTcje5a5bYYp8l/D9BJZ1SiqK/3MaTF3anPNpRwA1XsuaE70gNTu1XmPBJUU4S82B+xnw3RsoOBAgfsOiaR1Cg47xbaG7FtsjTptmZUHgTo3VijRZCOXJosYavRQ6Bm6XHHtoc/6hTRSLG7g+JgRZ0nJZeX93Egn4Ws2awzXvb2rC7gTp/4WMbca8T25bW6iPxzIZuskuOd+Gm6CHxRlPvX2PVDDyMAbZcB/iAhLQ29AnHHe1MmUyIFyYQb9OdTuTlv+qfzWCMRga2l3HqCw=
	$(MAIN) --redeem AKUAAAABwgKMPQHp/v20uCNbhgW37K37SPgyqmB+IT+TkQSXg5YtSR0aXx6oV3n4iVNF4t3s0F1/ipOgVhQE3poN5WzTyATtQou6J9fnzv1K3TSjV0nzwpbWD0CxDa6AcE/PaMYGKCY5LOmqkJgLxLj/Pl8+rC23X2iQEJgKGa4yD0Uy11JqJIeH796yAthm7Wq/hKjtVJGRMEK9Uq77YRDJ6zFEPcsAgqNoa2V5LWhhc2hYINFrdt0pgOGSCkLEsDjbPiu8Q56eBlHL70zX2SPCJklFcHJlZGVlbWluZy1vcmlnaW54KWh0dHBzOi8vdHJ1c3QtdG9rZW4taXNzdWVyLWRlbW8uZ2xpdGNoLm1ldHJlZGVtcHRpb24tdGltZXN0YW1wGmAMQww=

clean:
	$(RM) $(OBJS) bin/*
