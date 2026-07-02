# Sandbox runner for C++ submissions. Compiles with g++ then runs the binary
# under the same locked-down `docker run` flags described in python.Dockerfile.
FROM gcc:13-bookworm
RUN useradd -m -u 1000 runner
WORKDIR /sandbox
USER runner
CMD ["sh", "-c", "g++ -O2 -o main main.cpp && ./main"]
