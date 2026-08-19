# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Official documentation for SimpleCloud, a Minecraft server network management system. Built with Mintlify and deployed at docs.simplecloud.app.

## Development Commands

```bash
# Install Mintlify CLI globally
npm i -g mint

# Start local development server (runs at http://localhost:3000)
mint dev

# Run documentation style checks
node scripts/lint-docs.mjs

# Enable the repository's pre-commit hook once per clone
./scripts/install-git-hooks.sh
```

## Architecture

### Multi-Language Structure

- `en/` - English documentation (primary)
- `de/` - German documentation (translations may be placeholders)
- `docs.json` - Central navigation configuration for all languages and tabs
- `snippets/` - Reusable content snippets

### Tab Organization (per language)

| Tab | Purpose |
|-----|---------|
| Manual | User guides: setup, droplets, plugins, guides |
| Concepts | Core concept explanations: controller, CLI, serverhost |
| Developer | API documentation: Controller API, Player API |
| Course | Video-based learning (English only) |

### Internal Link Format

All internal links must use the language prefix:
- English: `/en/manual/setup/installation`
- German: `/de/manual/setup/installation`

## Adding New Pages

1. Create `.mdx` file with YAML frontmatter:
   ```yaml
   ---
   title: "Page Title"
   description: "Brief description"
   ---
   ```
2. Add page path to `docs.json` under appropriate navigation group
3. For bilingual content, create matching file in both `en/` and `de/`

---

## Technical Writing Guidelines

### Language and Style

- Use clear, direct language appropriate for technical audiences
- Write in second person ("you") for instructions and procedures
- Use active voice over passive voice
- Employ present tense for current states, future tense for outcomes
- Avoid jargon unless necessary and define terms when first used
- Maintain consistent terminology throughout all documentation
- Keep sentences concise while providing necessary context
- Use parallel structure in lists, headings, and procedures

### Content Organization

- Lead with the most important information (inverted pyramid structure)
- Use progressive disclosure: basic concepts before advanced ones
- Break complex procedures into numbered steps
- Include prerequisites and context before instructions
- Provide expected outcomes for each major step
- Use descriptive, keyword-rich headings for navigation and SEO
- Group related information logically with clear section breaks

### User-Centered Approach

- Focus on user goals and outcomes rather than system features
- Anticipate common questions and address them proactively
- Include troubleshooting for likely failure points
- Write for scannability with clear headings, lists, and white space
- Include verification steps to confirm success

---

## Mintlify Component Reference

### Callout Components

#### Note - Additional helpful information

```mdx
<Note>
Supplementary information that supports the main content without interrupting flow
</Note>
```

#### Tip - Best practices and pro tips

```mdx
<Tip>
Expert advice, shortcuts, or best practices that enhance user success
</Tip>
```

#### Warning - Important cautions

```mdx
<Warning>
Critical information about potential issues, breaking changes, or destructive actions
</Warning>
```

#### Info - Neutral contextual information

```mdx
<Info>
Background information, context, or neutral announcements
</Info>
```

#### Check - Success confirmations

```mdx
<Check>
Positive confirmations, successful completions, or achievement indicators
</Check>
```

### Code Components

#### Single code block

```javascript config.js
const apiConfig = {
  baseURL: "https://api.example.com",
  timeout: 5000,
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
};
```

#### Code group with multiple languages

````mdx
<CodeGroup>
```javascript Node.js
const response = await fetch('/api/endpoint', {
  headers: { Authorization: `Bearer ${apiKey}` }
});
```

```python Python
import requests
response = requests.get('/api/endpoint',
  headers={'Authorization': f'Bearer {api_key}'})
```

```curl cURL
curl -X GET '/api/endpoint' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```
</CodeGroup>
````

#### Request/response examples

````mdx
<RequestExample>
```bash cURL
curl -X POST 'https://api.example.com/users' \
  -H 'Content-Type: application/json' \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```
</RequestExample>

<ResponseExample>
```json Success
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```
</ResponseExample>
````

### Structural Components

#### Steps for procedures

````mdx
<Steps>
<Step title="Install dependencies">
  Run `npm install` to install required packages.

  <Check>
  Verify installation by running `npm list`.
  </Check>
</Step>

<Step title="Configure environment">
  Create a `.env` file with your API credentials.

  ```bash
  API_KEY=your_api_key_here
  ```

  <Warning>
  Never commit API keys to version control.
  </Warning>
</Step>
</Steps>
````

#### Tabs for alternative content

````mdx
<Tabs>
<Tab title="macOS">
  ```bash
  brew install node
  npm install -g package-name
  ```
</Tab>

<Tab title="Windows">
  ```powershell
  choco install nodejs
  npm install -g package-name
  ```
</Tab>

<Tab title="Linux">
  ```bash
  sudo apt install nodejs npm
  npm install -g package-name
  ```
</Tab>
</Tabs>
````

#### Accordions for collapsible content

````mdx
<AccordionGroup>
<Accordion title="Troubleshooting connection issues">
  - **Firewall blocking**: Ensure ports 80 and 443 are open
  - **Proxy configuration**: Set HTTP_PROXY environment variable
  - **DNS resolution**: Try using 8.8.8.8 as DNS server
</Accordion>

<Accordion title="Advanced configuration">
  ```javascript
  const config = {
    performance: { cache: true, timeout: 30000 },
    security: { encryption: 'AES-256' }
  };
  ```
</Accordion>
</AccordionGroup>
````

### Cards and Navigation

```mdx
<Card title="Getting started guide" icon="rocket" href="/quickstart">
Complete walkthrough from installation to your first API call in under 10 minutes.
</Card>

<CardGroup cols={2}>
<Card title="Authentication" icon="key" href="/auth">
  Learn how to authenticate requests using API keys or JWT tokens.
</Card>

<Card title="Rate limiting" icon="clock" href="/rate-limits">
  Understand rate limits and best practices for high-volume usage.
</Card>
</CardGroup>
```

### API Documentation Components

#### Parameter fields

```mdx
<ParamField path="user_id" type="string" required>
Unique identifier for the user. Must be a valid UUID v4 format.
</ParamField>

<ParamField body="email" type="string" required>
User's email address. Must be valid and unique within the system.
</ParamField>

<ParamField query="limit" type="integer" default="10">
Maximum number of results to return. Range: 1-100.
</ParamField>

<ParamField header="Authorization" type="string" required>
Bearer token for API authentication. Format: `Bearer YOUR_API_KEY`
</ParamField>
```

#### Response fields

```mdx
<ResponseField name="user_id" type="string" required>
Unique identifier assigned to the newly created user.
</ResponseField>

<ResponseField name="created_at" type="timestamp">
ISO 8601 formatted timestamp of when the user was created.
</ResponseField>

<ResponseField name="permissions" type="array">
List of permission strings assigned to this user.
</ResponseField>
```

#### Expandable nested fields

```mdx
<ResponseField name="user" type="object">
Complete user object with all associated data.

<Expandable title="User properties">
  <ResponseField name="profile" type="object">
  User profile information including personal details.

  <Expandable title="Profile details">
    <ResponseField name="first_name" type="string">
    User's first name as entered during registration.
    </ResponseField>

    <ResponseField name="avatar_url" type="string | null">
    URL to user's profile picture. Returns null if no avatar is set.
    </ResponseField>
  </Expandable>
  </ResponseField>
</Expandable>
</ResponseField>
```

### Media Components

#### Frames for images

```mdx
<Frame>
<img src="/images/dashboard.png" alt="Main dashboard showing analytics overview" />
</Frame>

<Frame caption="The analytics dashboard provides real-time insights">
<img src="/images/analytics.png" alt="Analytics dashboard with charts" />
</Frame>
```

#### Videos

Self-hosted video:
```mdx
<video
  controls
  className="w-full aspect-video rounded-xl"
  src="link-to-your-video.com"
></video>
```

YouTube embed:
```mdx
<iframe
  className="w-full aspect-video rounded-xl"
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
></iframe>
```

#### Tooltips

```mdx
<Tooltip tip="Application Programming Interface - protocols for building software">
API
</Tooltip>
```

#### Updates (changelogs)

```mdx
<Update label="Version 2.1.0" description="Released March 15, 2024">
## New features
- Added bulk user import functionality
- Improved error messages with actionable suggestions

## Bug fixes
- Fixed pagination issue with large datasets
- Resolved authentication timeout problems
</Update>
```

---

## Component Selection Logic

- Use **Steps** for procedures and sequential instructions
- Use **Tabs** for platform-specific content or alternative approaches
- Use **CodeGroup** when showing the same concept in multiple programming languages
- Use **Accordions** for progressive disclosure of information
- Use **RequestExample/ResponseExample** specifically for API endpoint documentation
- Use **ParamField** for API parameters, **ResponseField** for API responses
- Use **Expandable** for nested object properties or hierarchical information

## Content Quality Standards

### Code Examples
- Always include complete, runnable examples that users can copy and execute
- Show proper error handling and edge case management
- Use realistic data instead of placeholder values
- Include expected outputs and results for verification
- Specify language and include filename when relevant

### API Documentation
- Document all parameters including optional ones with clear descriptions
- Show both success and error response examples with realistic data
- Include rate limiting information with specific limits
- Provide authentication examples showing proper format

### Accessibility
- Include descriptive alt text for all images and diagrams
- Use specific, actionable link text instead of "click here"
- Ensure proper heading hierarchy starting with H2
- Structure content for easy scanning with headers and lists
