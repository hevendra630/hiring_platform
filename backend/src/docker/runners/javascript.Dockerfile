# Sandbox runner for JavaScript submissions. Same security posture as the
# other language runners - see python.Dockerfile for the full rationale.
FROM node:20-alpine
RUN adduser -D -u 1000 runner
WORKDIR /sandbox
USER runner
CMD ["node", "main.js"]
