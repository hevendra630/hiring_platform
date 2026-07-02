# Sandbox runner for Java submissions. The orchestrator compiles Main.java
# then runs it with the same locked-down `docker run` flags described in
# python.Dockerfile.
FROM eclipse-temurin:21-jdk-alpine
RUN adduser -D -u 1000 runner
WORKDIR /sandbox
USER runner
CMD ["sh", "-c", "javac Main.java && java Main"]
