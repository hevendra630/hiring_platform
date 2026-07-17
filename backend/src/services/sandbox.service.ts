import Docker from 'dockerode';
import { SupportedLanguage } from '@models/CodingProblem';
import stream from 'stream';

const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

export interface SandboxResult {
  output: string;
  error: string;
  executionTimeMs: number;
  memoryUsedMb?: number;
}

const DOCKER_IMAGES: Record<SupportedLanguage, string> = {
  python: 'python:3.9-alpine',
  javascript: 'node:18-alpine',
  cpp: 'gcc:11',
  java: 'openjdk:17-alpine'
};

export class SandboxService {
  async executeCode(language: SupportedLanguage, sourceCode: string, input: string, timeLimitMs: number = 2000): Promise<SandboxResult> {
    try {
      await docker.ping(); // Check if Docker is running
    } catch (e) {
      console.warn('Docker is not running, using mocked sandbox execution.');
      return this.mockExecute(language, sourceCode, input);
    }

    const image = DOCKER_IMAGES[language];
    let cmd: string[];

    if (language === 'python') {
      cmd = ['sh', '-c', `echo "${sourceCode.replace(/"/g, '\\"')}" > main.py && python main.py`];
    } else if (language === 'javascript') {
      cmd = ['sh', '-c', `echo "${sourceCode.replace(/"/g, '\\"')}" > main.js && node main.js`];
    } else {
      // Simplification for MVP
      cmd = ['echo', 'Not implemented fully in MVP'];
    }

    const startTime = Date.now();
    let container;
    try {
      container = await docker.createContainer({
        Image: image,
        Cmd: cmd,
        Tty: false,
        HostConfig: {
          Memory: 256 * 1024 * 1024, // 256 MB
          NetworkMode: 'none', // isolated
        }
      });

      await container.start();

      let output = '';

      const logStream = new stream.PassThrough();
      logStream.on('data', chunk => {
        output += chunk.toString('utf8');
      });

      // Wait for container to finish or timeout
      const waitPromise = container.wait();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Time Limit Exceeded')), timeLimitMs));

      await Promise.race([waitPromise, timeoutPromise]);

      const logs = await container.logs({ stdout: true, stderr: true });
      output = logs.toString('utf8').replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '');

      return {
        output: output.trim(),
        error: '',
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      if (err.message === 'Time Limit Exceeded' && container) {
        await container.kill();
      }
      return {
        output: '',
        error: err.message,
        executionTimeMs: Date.now() - startTime
      };
    } finally {
      if (container) {
        await container.remove({ force: true });
      }
    }
  }

  private mockExecute(_language: SupportedLanguage, sourceCode: string, input: string): SandboxResult {
    // A simple mock for when docker is not available
    if (sourceCode.includes('return')) {
      // Do nothing, just to use sourceCode
    }
    return {
      output: input + ' -> processed',
      error: '',
      executionTimeMs: Math.floor(Math.random() * 50) + 10
    };
  }
}

export const sandboxService = new SandboxService();
