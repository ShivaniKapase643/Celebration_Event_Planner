# Security policy

## Reporting a vulnerability

Please report vulnerabilities privately to the project maintainer. Include the affected route or component, steps to reproduce, and the impact. Do not include real API keys or personal guest data in a report.

## Application safeguards

- Gemini credentials are read only by server route handlers and are never serialized into browser code.
- Event and AI output payloads are parsed with shared Zod schemas before use.
- User text is sent as delimited data in the model prompt and rendered as text, never as HTML.
- AI routes apply per-process, per-IP rate limits and generic client errors.
- CSP uses a per-request nonce for Next.js scripts. Other response headers restrict framing, MIME sniffing, referrers, and browser permissions.
- Guest and event drafts are stored in the current browser's local storage. Avoid entering sensitive information on shared devices.

## Dependency review

Run `npm audit` before releases and update vulnerable dependencies. API keys belong in deployment environment variables, never in source control.
