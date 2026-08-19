---
name: simplecloud-docs-style
description: Use when writing, rewriting, or reviewing user-facing SimpleCloud documentation in English or German.
---

# SimpleCloud documentation style

Help the reader understand one idea or finish one task. Judge the page by whether the reader can use it, not by how short it is.

## Decide what the page must do

Before editing, identify the primary reader, their question, and the result they need. Give the page one main role: tutorial, how-to guide, explanation, or reference.

Keep the page about its real subject. A product philosophy page explains SimpleCloud's philosophy, not the documentation site or a single workflow. Preserve deliberate product language and the maintainer's point of view. If a rewrite may have changed the meaning, compare it with the last approved version in Git.

## Verify product claims

Treat current product behavior as the source of truth. Check any uncertain command, label, path, default, requirement, or lifecycle claim against the product.

Use these canonical repositories:

- Serverhost: `https://github.com/simplecloudapp/platform-serverhost`
- CLI: `https://github.com/simplecloudapp/cli`
- Dashboard: `https://github.com/simplecloudapp/platform-dashboard`
- Controller: `https://github.com/simplecloudapp/platform-controller`

Prefer a local checkout whose `origin` matches the canonical repository. Do not assume its name or location. If no matching checkout exists, inspect the canonical remote. Read the applicable `AGENTS.md` before working in a repository outside the current project.

Use dashboard and CLI source for visible labels and user flows. Use serverhost and controller source to confirm behavior. Source code is evidence, not a model for the prose.

Document what the user sees, chooses, runs, and verifies. Leave out polling, storage, transport, and internal coordination unless those details change what the user must do or explain a user-visible limit.

## Build around the normal path

Lead with the answer or result. Explain the normal path completely before alternatives and rare cases.

Include information when it helps the reader:

- decide what to choose;
- perform the next action;
- recognize success;
- recover from a likely failure; or
- avoid data loss, downtime, or credential exposure.

Cut details that do not change the reader's decision or action. Link to a focused page instead of embedding a second guide. Use progressive disclosure for useful secondary material.

Task-complete does not mean exhaustive. Do not copy every option, implementation boundary, or possible failure from source code. A question that someone could ask is not automatically a gap in the page. Add detail when a typical reader needs it for the main path or to avoid a likely, consequential mistake.

## Write like a person who knows the product

Use second person, active voice, present tense, sentence-case headings, and short paragraphs. Name the actor when it matters. Repeat the same product term instead of cycling through synonyms.

Prefer a visible result to implementation narration:

- Write "The dashboard detects the serverhost automatically," not "The dashboard checks every few seconds."
- Write "Choose **Custom** and fill in the required fields" when the fields are not the page's subject.
- Explain the controller only as far as the reader needs to understand the task.

Use exact UI labels. Describe the same action the same way across related pages, especially actions involving server groups and persistent servers.

Cut writing that sounds polished but says little:

- Remove filler, puffery, promotional adjectives, and generic conclusions.
- Replace vague claims such as "seamless," "powerful," "robust," or "flexible" with a behavior, requirement, limit, or result.
- Avoid stock phrases such as "delve into," "serves as," "it is important to note," and "not just X, but Y."
- Remove superficial clauses built around "ensuring," "highlighting," "showcasing," or "fostering." State the fact or action instead.
- Do not force ideas into groups of three or invent a "from X to Y" range for unrelated topics.
- Do not use em dashes. Start a new sentence when a thought needs room.
- Use bold only when it improves scanning. Do not add decorative emojis.

A human voice comes from judgment about what the reader needs. It does not require jokes, chatter, personal opinion, or marketing language.

## Use one complete example

Prefer one realistic example that the reader can follow from start to finish. Reuse it when explaining related parts of the page instead of restarting with abstract placeholders.

For each example:

- verify commands, paths, fields, and defaults against current source;
- show where the command runs or where the file belongs;
- state the expected result;
- include limits that affect correctness or safety; and
- expose required structure instead of hiding it behind placeholders.

Do not call a copied file a safe backup without covering consistency, restore testing, and retention. When an action deletes data, state exactly what it deletes and what it leaves intact.

## Use Mintlify components for a reason

- Use `<Steps>` when actions must happen in order.
- Use `<Accordion>` for useful secondary detail, not missing core explanation.
- Use `<Warning>` for data loss, credential exposure, downtime, or comparable risk.
- Use `<Note>` for context the reader can safely skip.
- Use `<Check>` for a useful success criterion, not a restatement of the previous step.
- Prefer a list when a table becomes difficult to scan.
- Keep one small fact in the main text instead of placing it in an accordion by itself.

### Decide placement before presentation

Decide whether the information belongs on the page before choosing a component. Remove it when it repeats another section, answers an unlikely question, or does not change what the reader understands or does.

If it belongs, put it where the reader needs it:

- Match the structural pattern of neighboring pages unless the content requires a different one.
- Put prerequisites before the procedure.
- Put instructions and action-specific cautions beside the action they affect.
- Put behavior that applies to most readers in the relevant explanation.
- Put optional secondary detail in an accordion when hiding it makes the main path easier to follow.

Do not mechanically replace a rejected callout with a paragraph in the same location. Move it, merge it with related content, or remove it when that produces a clearer page.

Use a callout only when interrupting the flow helps the reader notice something at the moment it matters. Most pages need none or one.

Use `<Note>` only for optional context that a reader can skip without missing the task or misunderstanding the feature. Do not use it for scope, prerequisites, transitions, summaries, or details that belong in the surrounding paragraph.

Use `<Warning>` only when ignoring the text creates a realistic risk of data loss, credential exposure, downtime, or another costly failure. State the concrete consequence and the action that avoids it.

Review callouts across the whole page before finishing. If more than one remains, confirm that each marks a different interruption and is placed beside the decision or action it affects.

Keep internal links root-relative and language-prefixed, such as `/en/manual/setup/installation`.

## Read the result as a first-time user

Check whether the page answers the questions that matter for its job:

1. What will I understand or accomplish?
2. What must be true before I start?
3. What is the normal path?
4. Where must I choose, and what changes with that choice?
5. How do I recognize success?
6. Which likely failure can I recover from?
7. What can cause data loss, downtime, or credential exposure?

Use these as relevance tests, not mandatory sections. Omit a prerequisite, recovery path, success check, or warning when the product handles it, the outcome is obvious, or the information would not change the reader's behavior. Do not manufacture completeness with speculative edge cases.

Then read the prose once more. Ask: "What makes this sound AI-generated?" Remove any generic transition, padded sentence, repeated conclusion, or abstract claim that remains. Confirm that the edit has not removed a necessary distinction, safety boundary, or success criterion.

## Validate the finished work

For substantial page changes, ask a context-free reader to use the finished page for a realistic task. Give them the page and reader role, not the expected answer or your diagnosis. Treat their feedback as evidence. Fix genuine blockers, but reject requests to expose irrelevant internals or expand unrelated edge cases.

Before finishing:

- compile or validate every changed MDX page;
- check internal page targets and heading anchors;
- parse runnable YAML or JSON examples;
- compare documented examples with authoritative source artifacts;
- check `docs.json` after navigation changes;
- run `git diff --check`; and
- confirm that excluded sections remain unchanged.

Report what the page now covers and what you validated. Never cite a lower word or line count as proof of quality.
