# Minimal, locked-down runner used by the code-execution worker (dockerode)
# to execute untrusted candidate Python submissions.
#
# Security posture (enforced by the orchestrator in services/codeExecution.service.ts,
# built in the Coding Platform module):
#   - container run with --network none
#   - --memory / --cpus limits from env.codeExec
#   - --read-only root filesystem, writable /tmp only
#   - non-root user, no new privileges, dropped capabilities
#   - hard wall-clock timeout enforced by the orchestrator (kills the container)
FROM python:3.12-alpine
RUN adduser -D -u 1000 runner
WORKDIR /sandbox
USER runner
CMD ["python3", "main.py"]
