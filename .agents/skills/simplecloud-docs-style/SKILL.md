---
name: simplecloud-docs-style
description: Create, rewrite, or review user-facing SimpleCloud documentation in MDX, including guides, concepts, product philosophy, navigation, examples, and troubleshooting. Use for English or German documentation pages when Codex must preserve product accuracy and intent while making content understandable, task-complete, consistent, and appropriately detailed for users and documentation agents.
---

# SimpleCloud documentation style

Write documentation that helps users understand a concept or complete a task. Optimize for comprehension and successful use, never for fewer words or lines.

## Follow this workflow

### 1. Define the page's job

State the primary reader, question, and outcome before editing.

Classify the page as a tutorial, how-to guide, explanation, or reference. Give one type priority. Do not make every page explain the concept, teach the entire workflow, and list every option at equal depth.

Preserve the page's actual subject. A product philosophy page explains the philosophy of the entire SimpleCloud product, not the documentation site or one user workflow. For positioning, philosophy, and other intentional product messaging, preserve the maintainer's meaning and voice. Inspect the previous approved version in Git when a rewrite may have changed that meaning.

### 2. Establish product truth

Treat current product behavior as authoritative. Inspect relevant source code and UI when a claim, command, label, path, default, or lifecycle behavior is uncertain.

Use these canonical repositories:

- Serverhost: `https://github.com/simplecloudapp/platform-serverhost`
- CLI: `https://github.com/simplecloudapp/cli`
- Dashboard: `https://github.com/simplecloudapp/platform-dashboard`
- Controller: `https://github.com/simplecloudapp/platform-controller`

Prefer an existing local checkout when its `origin` matches the canonical repository; do not assume a particular parent directory or checkout name. Otherwise inspect the canonical remote. Read the applicable `AGENTS.md` before inspecting an external repository. Use the dashboard and CLI source for user-visible labels and flows. Use runtime/controller source to verify behavior, not as a template for prose.

Write the normal user journey around the dashboard, CLI, serverhost, and plugins. Do not turn internal coordination, storage, polling, or transport behavior into user instructions unless the user must act on it.

### 3. Build the information hierarchy

Lead with the result or answer. Explain the normal path completely before optional paths.

Give detail space according to importance:

- Explain information required to choose, act, verify, recover, or avoid meaningful risk.
- Keep optional and uncommon cases short or place them in progressive disclosure.
- Link to a focused page instead of repeating a second guide.
- Remove implementation details that do not change user behavior.
- Add context back when removing it would create a hidden assumption.

Task-complete does not mean exhaustive. Do not add every requirement, option, failure mode, implementation boundary, or confirmation that can be discovered in source code. Add it only when a typical reader needs it to follow the primary path or avoid a likely, consequential mistake. A possible question is not automatically a documentation gap.

Do not measure quality through line count or word count. A longer page is correct when the task requires the added context. A shorter page is correct only when removed content was irrelevant, duplicated, or actively confusing.

### 4. Write from the user's perspective

Use second person, active voice, present tense, short paragraphs, and sentence-case headings.

Prefer user-visible outcomes over implementation narration:

- Write “The dashboard detects the serverhost automatically,” not “The dashboard checks every few seconds.”
- Write “Choose **Custom** and fill in the required fields,” unless the custom fields are the page's main topic.
- Explain a controller only as far as needed for the user's mental model; do not teach its infrastructure on a normal manual page.

Use exact, consistent terms and current UI labels. Describe the same action the same way across related pages, including server groups and persistent servers.

### 5. Use one task-complete example

Prefer one realistic example that users can run or follow completely. Explain the concept through that same example instead of showing one example and then restarting with a second abstract example.

For every example:

- Verify commands, paths, fields, and defaults against current source.
- Show where the file or command belongs.
- Explain the expected result.
- State limitations that affect correctness or safety.
- Avoid placeholders that hide required structure.

Do not call a file copy a safe backup without explaining consistency, restore testing, and retention. Do not describe a destructive action without stating what is and is not deleted.

### 6. Apply Mintlify components intentionally

- Use `<Steps>` only for actions that must happen in sequence.
- Use `<Accordion>` for useful secondary details, not to hide missing core explanation.
- Use `<Warning>` for data loss, credential exposure, downtime, or similarly meaningful risk.
- Use `<Note>` for context that is safe to skip.
- Use `<Check>` only when it provides a useful success criterion; do not repeat the preceding step.
- Prefer a readable list over a table when cells become path-heavy or difficult to scan.
- Do not create an accordion for one small fact that belongs in the main list.

Keep internal links root-relative and language-prefixed, such as `/en/manual/setup/installation`.

## Review for understanding

Review the finished page as a first-time user. Confirm that the reader can answer:

1. What does this page help me accomplish or understand?
2. What must already be true before I begin?
3. What is the normal path?
4. What choices must I make, and what changes between them?
5. How do I know the task succeeded?
6. What likely failure can I recover from?
7. What can cause data loss, downtime, or credential exposure?

If any answer depends on knowledge that exists only in source code or the author's head, add the missing context.

Treat these questions as relevance tests, not required sections. Omit a prerequisite, recovery path, success check, or risk when the product handles it automatically, the outcome is already obvious, or the information would not change what the reader does. Do not manufacture completeness by listing speculative edge cases.

Then review proportional emphasis:

- Does the main workflow receive more explanation than rare cases?
- Did source-code details leak into prose without changing user action?
- Did an attempt to shorten the page remove a prerequisite, distinction, safety boundary, or success criterion?
- Are repeated concepts phrased and styled consistently across pages?

## Validate independently

For substantial changes, give representative finished pages to a context-free reader or subagent. Pass only the page and a realistic reader role. Ask whether the reader can complete the task and identify genuine blockers. Do not tell the reviewer the expected answer or suspected problem.

Use feedback as evidence, not an automatic edit list. Reject suggestions that merely expose more source behavior, add a redundant confirmation, or answer a question outside the page's primary job. Add detail when evidence shows it unblocks the normal path or prevents a likely and meaningful harm. Do not expand a secondary edge case merely because a reviewer can imagine more detail.

Before finishing:

- Compile or validate every changed MDX page.
- Check internal page targets and heading anchors.
- Parse runnable YAML or JSON examples.
- Confirm documented examples still match authoritative source artifacts.
- Check `docs.json` when navigation changes.
- Run `git diff --check`.
- Confirm the task did not modify excluded sections.

Report successful task coverage and validation. Do not present fewer lines or words as evidence of documentation quality.
