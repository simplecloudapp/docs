#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const staged = process.argv.includes("--staged");
const selfTest = process.argv.includes("--self-test");
const maxStandaloneWords = 35;
const maxParagraphCharacters = 350;
const maxParagraphSentences = 3;

const legacyGermanRedirects = new Set([
  "de/developer/controller/events.mdx",
  "de/developer/controller/groups.mdx",
  "de/developer/controller/initialization.mdx",
  "de/developer/controller/servers.mdx",
  "de/developer/droplets/player/adventure-integration.mdx",
  "de/developer/droplets/player/initialization.mdx",
  "de/developer/droplets/player/player-management.mdx",
  "de/developer/getting-started/bungeecord.mdx",
  "de/developer/getting-started/other.mdx",
  "de/developer/getting-started/paper.mdx",
  "de/developer/getting-started/velocity.mdx",
]);

const sharedTechnicalWords = new Set([
  "api", "bungeecord", "cli", "cloud", "command", "configurator", "configurators", "dashboard",
  "essentials", "minecraft", "notify", "npcs", "paper", "plugin", "plugins", "prefixes", "proxy",
  "proxies", "secret", "secrets", "server", "servers", "serverhost", "serverhosts", "signs",
  "simplecloud", "template", "templates", "update", "velocity", "workflow", "workflows",
]);

const englishWords = new Set([
  "a", "add", "after", "an", "and", "are", "as", "automatically", "backups", "before",
  "can", "change", "check", "choose", "configure", "connect", "copy", "create", "created",
  "credentials", "delete", "deployment", "does", "during", "encrypted", "every", "find",
  "available", "between", "files", "for", "from", "has", "have", "how", "if", "in", "install",
  "is", "it", "its", "keep",
  "manage", "must", "of", "on", "open", "or", "read", "remain", "remove", "restart", "run",
  "restarts", "save", "select", "should", "shutdown", "start", "stop", "storage", "that", "the", "then",
  "this", "to", "update", "use", "view", "what", "when", "where", "which", "why", "will",
  "with", "you", "your",
]);

const germanWords = new Set([
  "aktualisieren", "als", "anschließend", "anzeigen", "auf", "aus", "ausführen", "auswählen",
  "automatisch", "beim", "bevor", "bei", "das", "dein", "deine", "dem", "den", "der", "die",
  "du", "ein", "eine", "einem", "einen", "einer", "entfernen", "erstellen", "erstellt",
  "finden", "für", "hat", "hinzufügen", "installieren", "ist", "kannst", "konfigurieren",
  "kopieren", "löschen", "mit", "muss", "nach", "neu", "noch", "öffnen", "oder", "prüfen",
  "reparieren", "schlägt", "speichern", "sich", "soll", "starten", "stoppen", "und", "verwalten",
  "von", "vor", "was", "wenn", "werden", "wie", "wird", "wo", "warum", "wählen", "zu", "zum",
  "zur", "fehl",
]);

const languageSamples = {
  en: `Use the dashboard to create and manage servers. Choose a group or persistent server, then
    configure its software and resources. Before you start, connect a serverhost to your network.
    The command installs SimpleCloud and starts the server. If the server does not start, check its
    status and logs. Store passwords and authentication credentials as secrets. Server connections
    require authentication credentials. Open the settings page, select the option, and save your
    changes. You can update, remove, restart, or troubleshoot the server. Copy files, read the output,
    and verify the result. The default permission allows a player to enter during maintenance.
    Backups run automatically after shutdown. Restart every proxy after deployment. Credentials remain
    encrypted during storage. Files remain available between restarts.`,
  de: `Verwende das Dashboard, um Server zu erstellen und zu verwalten. Wähle eine Gruppe oder einen
    persistenten Server und konfiguriere danach Software und Ressourcen. Verbinde einen Serverhost mit
    deinem Netzwerk, bevor du beginnst. Der Befehl installiert SimpleCloud und startet den Server. Wenn
    der Server nicht startet, prüfe seinen Status und seine Logs. Speichere Passwörter und Zugangsdaten
    als Secrets. Erstelle Sicherungskopien automatisch nach jedem Herunterfahren. Öffne die Einstellungen,
    wähle die Option aus und speichere deine Änderungen. Du kannst den Server aktualisieren, entfernen,
    neu starten oder Probleme untersuchen. Kopiere Dateien, lies die Ausgabe und prüfe das Ergebnis.
    Die Standardberechtigung erlaubt einem Spieler den Beitritt während Wartungsarbeiten.`,
};

const genericAnnouncementPatterns = {
  en: /\b(?:learn (?:how|what|about)|this (?:page|guide) (?:shows|explains|covers|helps)|in this (?:page|guide)|here you (?:learn|will))\b/i,
  de: /\b(?:lerne,? (?:wie|was)|erfahre,? (?:wie|was)|diese seite (?:zeigt|erklärt|behandelt)|in diesem (?:leitfaden|artikel)|hier erfährst du)\b/i,
};

const allowedOpeningComponents = new Set([
  "AccordionGroup", "Card", "CardGroup", "Columns", "Frame", "Steps", "Tabs", "Warning",
  "iframe", "video",
]);

function runGit(args, { trim = true } = {}) {
  const output = execFileSync("git", args, { cwd: root, encoding: "utf8" });
  return trim ? output.trim() : output;
}

function runGitList(args) {
  return runGit(args, { trim: false }).split("\0").filter(Boolean);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function repositoryPages() {
  if (staged) {
    return runGitList([
      "diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z", "--", "en", "de",
    ]).filter((path) => /^(en|de)\/.*\.mdx$/.test(path));
  }

  return ["en", "de"].flatMap((language) =>
    walk(join(root, language))
      .filter((path) => path.endsWith(".mdx"))
      .map((path) => relative(root, path)),
  );
}

function allIndexedPages() {
  if (!staged) {
    return new Set(repositoryPages());
  }

  return new Set(runGitList(["ls-files", "--cached", "-z", "--", "en", "de"])
    .filter((path) => /^(en|de)\/.*\.mdx$/.test(path)));
}

function readPage(path) {
  if (staged) {
    return runGit(["show", `:${path}`], { trim: false });
  }

  return readFileSync(join(root, path), "utf8");
}

function parseFrontmatter(lines) {
  if (lines[0]?.trim() !== "---") {
    return { end: -1, values: new Map() };
  }

  const values = new Map();
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "---") {
      return { end: index, values };
    }

    const match = line.match(/^([a-zA-Z][\w-]*):\s*["']?(.*?)["']?\s*$/);
    if (match) {
      values.set(match[1], { line: index + 1, value: match[2] });
    }
  }

  return { end: -1, values };
}

function cleanMarkdown(text) {
  return text
    .replace(/\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+\([^)]*\)/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`[^`]*`/g, " ")
    .replace(/\{\{[^}]*\}\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_~]/g, "")
    .replace(/&[a-zA-Z#0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(text) {
  return text.match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

function countSentences(text, language) {
  const locale = language === "de" ? "de-DE" : "en-US";
  return [...new Intl.Segmenter(locale, { granularity: "sentence" }).segment(text)]
    .filter(({ segment }) => /[\p{L}\p{N}]/u.test(segment)).length;
}

function fenceMarker(line) {
  return line.match(/^\s*(`{3,}|~{3,})/)?.[1] ?? null;
}

function nextFenceState(line, currentFence) {
  const marker = fenceMarker(line);
  if (!marker) return currentFence;
  if (!currentFence) return marker;
  const closingFence = new RegExp(`^${currentFence[0]}{${currentFence.length},}\\s*$`);
  if (closingFence.test(line.trim())) return null;
  return currentFence;
}

function isIndentedCodeLine(line, baseIndent = 0) {
  const leadingWhitespace = line.match(/^[ \t]*/)?.[0] ?? "";
  if (leadingWhitespace.includes("\t")) return line.trim() !== "";
  return leadingWhitespace.length >= baseIndent + 4 && line.trim() !== "";
}

function isImport(line) {
  return /^\s*(import|export)\s/.test(line);
}

function isPureTag(line) {
  const trimmed = line.trim();
  return /^<\/?[A-Za-z][^>]*>\s*$/.test(trimmed) || /^<[^>]*\/?>\s*$/.test(trimmed);
}

function componentDepthAfter(line, depth) {
  const trimmed = line.trim();
  if (!isPureTag(line) || /^<[^>]+\/\s*>$/.test(trimmed)) return depth;
  if (/^<\//.test(trimmed)) return Math.max(0, depth - 1);
  if (/^<[A-Za-z][^>]*>.*<\/[A-Za-z][^>]*>$/.test(trimmed)) return depth;
  return depth + 1;
}

function isOpeningStructure(line) {
  const trimmed = line.trim();
  if (/^#{2,6}\s/.test(trimmed) || /^!\[/.test(trimmed)) return true;

  const component = trimmed.match(/^<([A-Za-z][\w.]*)\b/)?.[1];
  return component ? allowedOpeningComponents.has(component) : false;
}

function findOpening(lines, start) {
  let index = start;
  while (index < lines.length && (lines[index].trim() === "" || isImport(lines[index]))) {
    index += 1;
  }

  const first = index;
  if (first >= lines.length) {
    return { first, end: first, text: "", startsWithStructure: false, next: first };
  }

  const startsWithStructure = isOpeningStructure(lines[first]);
  const block = [];
  while (index < lines.length && lines[index].trim() !== "") {
    block.push(lines[index]);
    index += 1;
  }

  let next = index;
  while (next < lines.length && (lines[next].trim() === "" || isImport(lines[next]))) {
    next += 1;
  }

  return {
    first,
    end: index,
    text: cleanMarkdown(block.join(" ")),
    startsWithStructure,
    next,
  };
}

function proseParagraphs(lines, start) {
  const paragraphs = [];
  let paragraph = [];
  let paragraphStart = start;
  let activeFence = null;
  let inComment = false;
  let inMultilineTag = false;
  let componentDepth = 0;

  const flush = () => {
    if (paragraph.length > 0) {
      const text = cleanMarkdown(paragraph.join(" "));
      if (text) {
        paragraphs.push({ line: paragraphStart + 1, text });
      }
      paragraph = [];
    }
  };

  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (fenceMarker(line)) {
      flush();
      activeFence = nextFenceState(line, activeFence);
      continue;
    }
    if (activeFence) continue;

    if (inMultilineTag) {
      if (trimmed.endsWith(">")) inMultilineTag = false;
      continue;
    }
    if (trimmed.startsWith("<") && !trimmed.includes(">")) {
      flush();
      inMultilineTag = true;
      continue;
    }

    if (trimmed.startsWith("{/*")) {
      flush();
      inComment = !trimmed.includes("*/}");
      continue;
    }
    if (inComment) {
      if (trimmed.includes("*/}")) inComment = false;
      continue;
    }

    if (componentDepth === 0 && isIndentedCodeLine(line)) {
      flush();
      continue;
    }

    const boundary = trimmed === ""
      || isImport(line)
      || isPureTag(line)
      || /^(#{1,6}\s|[-*+]\s|\d+[.)]\s|\||!\[)/.test(trimmed);

    if (boundary) {
      flush();
      componentDepth = componentDepthAfter(line, componentDepth);
      continue;
    }

    if (paragraph.length === 0) paragraphStart = index;
    paragraph.push(trimmed.replace(/^>\s?/, ""));
  }

  flush();
  return paragraphs;
}

function languageWords(text) {
  return text.toLocaleLowerCase().match(/\p{L}+/gu) ?? [];
}

function ngramProfile(text) {
  const profile = new Map();
  const words = languageWords(text).filter((word) => !sharedTechnicalWords.has(word));

  for (const word of words) {
    const padded = `_${word}_`;
    for (let size = 2; size <= 4; size += 1) {
      for (let index = 0; index <= padded.length - size; index += 1) {
        const ngram = padded.slice(index, index + size);
        profile.set(ngram, (profile.get(ngram) ?? 0) + 1);
      }
    }
  }

  return profile;
}

function cosineSimilarity(left, right) {
  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (const value of left.values()) leftMagnitude += value ** 2;
  for (const value of right.values()) rightMagnitude += value ** 2;
  for (const [ngram, value] of left) dotProduct += value * (right.get(ngram) ?? 0);

  if (leftMagnitude === 0 || rightMagnitude === 0) return 0;
  return dotProduct / Math.sqrt(leftMagnitude * rightMagnitude);
}

const languageProfiles = {
  en: ngramProfile(languageSamples.en),
  de: ngramProfile(languageSamples.de),
};

function languageScore(text) {
  const words = languageWords(text);
  const languageSpecificWords = words.filter((word) => !sharedTechnicalWords.has(word));

  return {
    words: words.length,
    enWords: languageSpecificWords.filter((word) => englishWords.has(word)).length,
    deWords: languageSpecificWords.filter((word) => germanWords.has(word)).length,
  };
}

function hasLanguageMismatch(text, expectedLanguage, profiles = languageProfiles) {
  const score = languageScore(text);

  const expectedWords = expectedLanguage === "de" ? score.deWords : score.enWords;
  const unexpectedWords = expectedLanguage === "de" ? score.enWords : score.deWords;
  if (unexpectedWords >= 2 && unexpectedWords >= expectedWords * 2 + 1) return true;

  if (score.words <= 4 && expectedWords === 0 && unexpectedWords >= 1) {
    const unexpectedDictionary = expectedLanguage === "de" ? englishWords : germanWords;
    const hasDistinctiveWord = languageWords(text)
      .some((word) => !sharedTechnicalWords.has(word) && word.length >= 5 && unexpectedDictionary.has(word));
    if (hasDistinctiveWord) return true;
  }

  if (score.words <= 4 && expectedWords >= 1 && unexpectedWords === 0) return false;

  const profile = ngramProfile(text);
  const enSimilarity = cosineSimilarity(profile, profiles.en);
  const deSimilarity = cosineSimilarity(profile, profiles.de);
  const expectedSimilarity = expectedLanguage === "de" ? deSimilarity : enSimilarity;
  const unexpectedSimilarity = expectedLanguage === "de" ? enSimilarity : deSimilarity;
  return unexpectedSimilarity >= 0.25 && unexpectedSimilarity - expectedSimilarity >= 0.12;
}

function visibleLineChunks(lines, start) {
  const chunks = [];
  let activeFence = null;
  let inComment = false;
  let inMultilineTag = false;
  let componentDepth = 0;

  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (fenceMarker(line)) {
      activeFence = nextFenceState(line, activeFence);
      continue;
    }
    if (activeFence) continue;

    for (const match of trimmed.matchAll(/(?:title|alt|caption|label|description)=["']([^"']+)["']/g)) {
      chunks.push({ line: index + 1, text: cleanMarkdown(match[1]), kind: "attribute" });
    }

    if (inMultilineTag) {
      if (trimmed.endsWith(">")) inMultilineTag = false;
      continue;
    }
    if (trimmed.startsWith("<") && !trimmed.includes(">")) {
      inMultilineTag = true;
      continue;
    }

    if (trimmed.startsWith("{/*")) {
      inComment = !trimmed.includes("*/}");
      continue;
    }
    if (inComment) {
      if (trimmed.includes("*/}")) inComment = false;
      continue;
    }

    if (componentDepth === 0 && isIndentedCodeLine(line)) continue;

    if (
      trimmed === ""
      || isImport(line)
      || isPureTag(line)
      || trimmed.startsWith("<")
      || /^[A-Za-z][\w-]*=/.test(trimmed)
      || /^[A-Za-z][\w-]*\s*:/.test(trimmed)
      || /^[-:|\s]+$/.test(trimmed)
    ) {
      componentDepth = componentDepthAfter(line, componentDepth);
      continue;
    }

    const text = cleanMarkdown(trimmed
      .replace(/^#{1,6}\s+/, "")
      .replace(/^[-*+]\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .replace(/^>\s?/, "")
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .replace(/\|/g, " "));

    const kind = /^(?:[-*+]\s|\d+[.)]\s|\|)/.test(trimmed)
      ? "item"
      : /^#{1,6}\s/.test(trimmed) ? "heading" : "line";
    if (text) chunks.push({ line: index + 1, text, kind });
  }

  return chunks;
}

function listAndTableEntries(lines, start) {
  const entries = [];
  let activeFence = null;
  let inComment = false;
  let current = null;

  const flush = () => {
    if (current) {
      const text = cleanMarkdown(current.parts.join(" "));
      if (text) entries.push({ line: current.line, text, kind: "item" });
      current = null;
    }
  };

  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (fenceMarker(line)) {
      flush();
      activeFence = nextFenceState(line, activeFence);
      continue;
    }
    if (activeFence) continue;

    if (trimmed.startsWith("{/*")) {
      flush();
      inComment = !trimmed.includes("*/}");
      continue;
    }
    if (inComment) {
      if (trimmed.includes("*/}")) inComment = false;
      continue;
    }

    const listMatch = line.match(/^(\s*)(?:[-*+]|\d+[.)])\s+(.+)$/);
    if (listMatch) {
      flush();
      current = {
        indent: listMatch[1].length,
        line: index + 1,
        parts: [listMatch[2]],
      };
      continue;
    }

    if (/^\s*\|/.test(line)) {
      flush();
      const text = cleanMarkdown(trimmed.replace(/^\|/, "").replace(/\|$/, "").replace(/\|/g, " "));
      if (text && !/^[-:\s]+$/.test(text)) entries.push({ line: index + 1, text, kind: "item" });
      continue;
    }

    const indentation = line.match(/^\s*/)?.[0].length ?? 0;
    if (current && isIndentedCodeLine(line, current.indent)) {
      flush();
      continue;
    }
    if (current && trimmed && indentation > current.indent && !isPureTag(line)) {
      current.parts.push(trimmed.replace(/^>\s?/, ""));
      continue;
    }

    flush();
  }

  flush();
  return entries;
}

function openingVisibleText(lines, opening) {
  if (opening.first >= lines.length) return "";
  const source = lines.slice(opening.first, opening.end).join(" ");
  const attributes = [...source.matchAll(/(?:title|alt|caption|label|description)=["']([^"']+)["']/g)]
    .map((match) => match[1]);
  return cleanMarkdown(`${source} ${attributes.join(" ")}`);
}

function buildRepositoryLanguageProfiles(paths) {
  const corpus = { en: [languageSamples.en], de: [languageSamples.de] };

  for (const path of paths) {
    const language = path.startsWith("de/") ? "de" : "en";
    const lines = readPage(path).replace(/\r\n/g, "\n").split("\n");
    const frontmatter = parseFrontmatter(lines);
    if (frontmatter.end < 0) continue;

    for (const field of ["title", "description"]) {
      const value = frontmatter.values.get(field)?.value;
      if (value) corpus[language].push(cleanMarkdown(value));
    }

    corpus[language].push(...proseParagraphs(lines, frontmatter.end + 1).map(({ text }) => text));
    corpus[language].push(...visibleLineChunks(lines, frontmatter.end + 1)
      .filter(({ kind }) => kind !== "line")
      .map(({ text }) => text));
  }

  return {
    en: ngramProfile(corpus.en.join("\n")),
    de: ngramProfile(corpus.de.join("\n")),
  };
}

if (selfTest) {
  const cases = [
    { expected: "de", text: "Server connections require authentication credentials." },
    { expected: "de", text: "Backups run automatically after shutdown." },
    { expected: "de", text: "Restart every proxy after deployment." },
    { expected: "de", text: "Credentials remain encrypted during storage." },
    { expected: "de", text: "Files remain available between restarts." },
    { expected: "de", text: "Create a server" },
    { expected: "en", text: "Erstelle Sicherungskopien automatisch nach jedem Herunterfahren." },
    { expected: "en", text: "Server erstellen" },
    { expected: "en", text: "Open Settings and save the secret.", valid: true },
    { expected: "de", text: "Öffne Settings und speichere das Secret.", valid: true },
  ];

  for (const testCase of cases) {
    const mismatch = hasLanguageMismatch(testCase.text, testCase.expected);
    const expectedMismatch = !testCase.valid;
    if (mismatch !== expectedMismatch) {
      throw new Error(`Language self-test failed for: ${testCase.text}`);
    }
  }

  const frontmatterWithLeadingBlank = parseFrontmatter([
    "", "---", "title: Test", "description: Test", "---",
  ]);
  if (frontmatterWithLeadingBlank.end !== -1) {
    throw new Error("Frontmatter self-test accepted content before the opening delimiter.");
  }

  if (!genericAnnouncementPatterns.en.test("Learn how to configure this page.")) {
    throw new Error("Generic English opening self-test failed.");
  }
  if (!genericAnnouncementPatterns.de.test("Hier erfährst du, wie die Seite funktioniert.")) {
    throw new Error("Generic German opening self-test failed.");
  }

  for (const source of [
    ["## Learn how to configure the server"],
    ["<Card title=\"Learn how to configure this page\" href=\"/en/example\" />"],
  ]) {
    const opening = findOpening(source, 0);
    if (!genericAnnouncementPatterns.en.test(openingVisibleText(source, opening))) {
      throw new Error(`Structured generic opening self-test failed for: ${source[0]}`);
    }
  }

  for (const source of [
    ["## Create a server"],
    ["- Create a server"],
    ["<Card title=\"Create a server\" href=\"/de/example\" />"],
  ]) {
    const chunk = visibleLineChunks(source, 0)[0];
    if (!chunk || !hasLanguageMismatch(chunk.text, "de")) {
      throw new Error(`Structured language self-test failed for: ${source[0]}`);
    }
  }

  if (!findOpening(["## Configure the server"], 0).startsWithStructure) {
    throw new Error("Heading opening self-test failed.");
  }
  if (findOpening(["<Note>", "  Learn how this works.", "</Note>"], 0).startsWithStructure) {
    throw new Error("Non-substantive callout opening self-test failed.");
  }
  if (findOpening(["Learn how this works.", "", "## Configure the server"], 0).startsWithStructure) {
    throw new Error("Introductory prose opening self-test failed.");
  }


  const multilineItem = listAndTableEntries([
    `- ${"a".repeat(300)}`,
    `  ${"b".repeat(300)}`,
  ], 0)[0];
  if (!multilineItem || multilineItem.text.length <= maxParagraphCharacters) {
    throw new Error("Multiline list-item self-test failed.");
  }

  for (const source of [
    "    Backups run automatically after shutdown.",
    "        Backups run automatically after shutdown.",
    "\tBackups run automatically after shutdown.",
  ]) {
    if (proseParagraphs([source], 0).length !== 0) {
      throw new Error(`Indented code self-test failed for: ${JSON.stringify(source)}`);
    }
  }

  const listWithCode = listAndTableEntries([
    "- Short item",
    "    console.log('This code should not count toward the item.');",
  ], 0)[0];
  if (!listWithCode || listWithCode.text !== "Short item") {
    throw new Error("List-relative indented code self-test failed.");
  }

  console.log("Documentation linter self-test passed.");
  process.exit(0);
}

const pages = repositoryPages();
const indexedPages = allIndexedPages();
const repositoryLanguageProfiles = buildRepositoryLanguageProfiles([...indexedPages]);
const errors = [];
const errorKeys = new Set();

function report(path, line, rule, message) {
  const key = `${path}:${line}:${rule}:${message}`;
  if (errorKeys.has(key)) return;
  errorKeys.add(key);
  errors.push({ path, line, rule, message });
}

for (const path of pages) {
  const language = path.startsWith("de/") ? "de" : "en";
  const lines = readPage(path).replace(/\r\n/g, "\n").split("\n");
  const frontmatter = parseFrontmatter(lines);

  if (frontmatter.end < 0) {
    report(path, 1, "frontmatter", "Add valid YAML frontmatter at the start of the page.");
    continue;
  }

  for (const field of ["title", "description"]) {
    if (!frontmatter.values.get(field)?.value) {
      report(path, 1, "frontmatter", `Add a non-empty ${field} field.`);
    }
  }

  const opening = findOpening(lines, frontmatter.end + 1);
  if (opening.startsWithStructure) {
    // The title and description can lead directly into a heading or visual component.
  } else if (!opening.text) {
    report(path, opening.first + 1, "opening", "Start the page with a useful heading, component, or standalone message.");
  } else if (!opening.startsWithStructure && opening.next < lines.length) {
    report(path, opening.first + 1, "opening", "Start with the first useful heading or component instead of an introductory paragraph.");
  } else if (!opening.startsWithStructure) {
    const sentences = countSentences(opening.text, language);
    const words = countWords(opening.text);
    if (sentences !== 1 || !/[.!?]["')\]]?$/.test(opening.text)) {
      report(path, opening.first + 1, "opening", "Keep a prose-only page to one complete standalone sentence.");
    }
    if (words > maxStandaloneWords) {
      report(path, opening.first + 1, "opening", `Shorten the standalone message from ${words} words to ${maxStandaloneWords} or fewer.`);
    }
  }

  if (/^##\s+(?:Introduction|Overview|Einführung|Übersicht)\s*$/i.test(lines[opening.first]?.trim())) {
    report(path, opening.first + 1, "opening", "Replace the generic opening heading with the first specific section.");
  }

  const openingCopy = openingVisibleText(lines, opening);
  if (openingCopy && genericAnnouncementPatterns[language].test(openingCopy)) {
    report(path, opening.first + 1, "opening-copy", "Replace the opening announcement with useful content.");
  }

  const title = frontmatter.values.get("title");
  const description = frontmatter.values.get("description");
  const prose = proseParagraphs(lines, frontmatter.end + 1);
  const visible = visibleLineChunks(lines, frontmatter.end + 1);
  const entries = listAndTableEntries(lines, frontmatter.end + 1);
  const languageChunks = [
    ...(title ? [{ line: title.line, text: cleanMarkdown(title.value) }] : []),
    ...(description ? [{ line: description.line, text: cleanMarkdown(description.value) }] : []),
    ...prose,
    ...visible.filter((chunk) => chunk.kind !== "line"),
  ];

  if (prose[0] && genericAnnouncementPatterns[language].test(prose[0].text)) {
    report(path, prose[0].line, "opening-copy", "Remove prose that only announces what the page covers.");
  }

  for (const paragraph of prose) {
    const characters = paragraph.text.length;
    const sentences = countSentences(paragraph.text, language);
    if (characters > maxParagraphCharacters || sentences > maxParagraphSentences) {
      report(
        path,
        paragraph.line,
        "paragraph-size",
        `Simplify this ${sentences}-sentence, ${characters}-character paragraph.`,
      );
    }
  }

  for (const item of entries) {
    const characters = item.text.length;
    const sentences = countSentences(item.text, language);
    if (characters > maxParagraphCharacters || sentences > maxParagraphSentences) {
      report(
        path,
        item.line,
        "text-block-size",
        `Simplify this ${sentences}-sentence, ${characters}-character list or table entry.`,
      );
    }
  }

  for (const chunk of [
    ...(title ? [{ line: title.line, text: cleanMarkdown(title.value) }] : []),
    ...(description ? [{ line: description.line, text: cleanMarkdown(description.value) }] : []),
    ...visible,
  ]) {
    if (chunk.text.includes("—")) {
      report(path, chunk.line, "style", "Replace the em dash with a period or comma.");
    }
  }

  for (const chunk of languageChunks) {
    if (hasLanguageMismatch(chunk.text, language, repositoryLanguageProfiles)) {
      const expectedName = language === "de" ? "German" : "English";
      report(path, chunk.line, "language", `Rewrite this prose in ${expectedName}.`);
    }
  }
}

for (const path of indexedPages) {
  if (path.startsWith("en/")) {
    const counterpart = `de/${path.slice(3)}`;
    if (!indexedPages.has(counterpart)) {
      report(path, 1, "translation", `Add the German counterpart at ${counterpart}.`);
    }
    continue;
  }

  if (!path.startsWith("de/")) continue;
  const counterpart = `en/${path.slice(3)}`;
  if (indexedPages.has(counterpart)) continue;

  const content = readPage(path);
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const frontmatter = parseFrontmatter(lines);
  const opening = findOpening(lines, frontmatter.end + 1);
  const legacyRedirect = legacyGermanRedirects.has(path)
    && !opening.startsWithStructure
    && opening.next >= lines.length
    && /\]\(\/de\/developer\//.test(content);

  if (!legacyRedirect) {
    report(path, 1, "translation", `Add the English counterpart at ${counterpart}.`);
  }
}

errors.sort((left, right) =>
  left.path.localeCompare(right.path) || left.line - right.line || left.rule.localeCompare(right.rule),
);

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`${error.path}:${error.line} [${error.rule}] ${error.message}`);
  }
  console.error(`\nDocumentation lint failed with ${errors.length} error${errors.length === 1 ? "" : "s"}.`);
  process.exit(1);
}

console.log(`Documentation lint passed for ${pages.length} page${pages.length === 1 ? "" : "s"}.`);
