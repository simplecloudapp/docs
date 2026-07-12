export const DependencySnippet = ({
  dependencies = [],
  repositories = [
    { id: "simplecloud", url: "https://repo.simplecloud.app/snapshots" },
    { id: "buf", url: "https://buf.build/gen/maven" },
  ],
  language = "en",
  type = "snapshot",
}) => {
  const [versions, setVersions] = useState({});
  const [failed, setFailed] = useState({});
  const dependencyKey = dependencies
    .map((dep) => `${dep.groupId}:${dep.artifactId}:${dep.version || ""}`)
    .join("|");
  const copy = {
    en: {
      loading: "Loading the latest dependency version from the Maven repository...",
      failed:
        "The latest version could not be loaded. The examples below use dynamic version selectors that resolve the newest available artifact during dependency resolution.",
    },
    de: {
      loading: "Die neueste Dependency-Version wird aus dem Maven-Repository geladen...",
      failed:
        "Die neueste Version konnte nicht geladen werden. Die Beispiele unten verwenden dynamische Versionsselektoren, die beim Auflösen der Dependency das neueste verfügbare Artefakt verwenden.",
    },
  };
  const text = copy[language] || copy.en;

  useEffect(() => {
    let cancelled = false;

    dependencies.forEach((dep) => {
      if (dep.version) return;

      const key = `${dep.groupId}:${dep.artifactId}`;

      const fetchVersion = async () => {
        try {
          const url =
            type === "snapshot"
              ? `https://repo.simplecloud.app/api/maven/latest/version/snapshots/${dep.groupId.replace(/\./g, "/")}/${dep.artifactId}?type=raw`
              : `https://search.maven.org/solrsearch/select?q=g:${dep.groupId}+AND+a:${dep.artifactId}&rows=1&wt=json`;

          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error(`Version request failed: ${response.status}`);

          if (type === "snapshot") {
            const version = (await response.text()).trim();
            if (!cancelled && version) {
              setVersions((current) => ({ ...current, [key]: version }));
            }
            return;
          }

          const data = await response.json();
          const version = data.response?.docs?.[0]?.latestVersion;
          if (!cancelled && version) {
            setVersions((current) => ({ ...current, [key]: version }));
          }
        } catch (error) {
          if (!cancelled) {
            setFailed((current) => ({ ...current, [key]: true }));
          }
        }
      };

      fetchVersion();
    });

    return () => {
      cancelled = true;
    };
  }, [dependencyKey, type]);

  const keyFor = (dep) => `${dep.groupId}:${dep.artifactId}`;

  const hasPendingVersion = dependencies.some(
    (dep) => !dep.version && !versions[keyFor(dep)] && !failed[keyFor(dep)]
  );

  const hasFailedVersion = dependencies.some((dep) => failed[keyFor(dep)]);

  const getVersion = (dep, buildTool) => {
    if (dep.version) return dep.version;

    const version = versions[keyFor(dep)];
    if (version) return version;

    return buildTool === "maven" ? "[0,)" : "latest.integration";
  };

  const generateKotlin = () => {
    const repoLines = repositories.map((repo) => `    maven("${repo.url}")`).join("\n");
    const depLines = dependencies
      .map((dep) => {
        const depType = dep.type || "implementation";
        return `    ${depType}("${dep.groupId}:${dep.artifactId}:${getVersion(dep, "gradle")}")`;
      })
      .join("\n");

    return `repositories {\n${repoLines}\n}\n\ndependencies {\n${depLines}\n}`;
  };

  const generateGroovy = () => {
    const repoLines = repositories.map((repo) => `    maven { url '${repo.url}' }`).join("\n");
    const depLines = dependencies
      .map((dep) => {
        const depType = dep.type || "implementation";
        return `    ${depType} '${dep.groupId}:${dep.artifactId}:${getVersion(dep, "gradle")}'`;
      })
      .join("\n");

    return `repositories {\n${repoLines}\n}\n\ndependencies {\n${depLines}\n}`;
  };

  const generateMaven = () => {
    const repoLines = repositories
      .map(
        (repo) => `    <repository>
      <id>${repo.id || "repo"}</id>
      <url>${repo.url}</url>
    </repository>`
      )
      .join("\n");
    const depLines = dependencies
      .map((dep) => {
        const scope = dep.type === "compileOnly" ? "provided" : "compile";
        return `    <dependency>
      <groupId>${dep.groupId}</groupId>
      <artifactId>${dep.artifactId}</artifactId>
      <version>${getVersion(dep, "maven")}</version>
      <scope>${scope}</scope>
    </dependency>`;
      })
      .join("\n");

    return `<repositories>\n${repoLines}\n</repositories>\n\n<dependencies>\n${depLines}\n</dependencies>`;
  };

  if (hasPendingVersion) {
    return <Info>{text.loading}</Info>;
  }

  return (
    <>
      {hasFailedVersion && (
        <Warning>
          {text.failed}
        </Warning>
      )}

      <Tabs>
        <Tab title="Gradle (Kotlin)">
          <CodeBlock language="kotlin">{generateKotlin()}</CodeBlock>
        </Tab>
        <Tab title="Gradle (Groovy)">
          <CodeBlock language="groovy">{generateGroovy()}</CodeBlock>
        </Tab>
        <Tab title="Maven">
          <CodeBlock language="xml">{generateMaven()}</CodeBlock>
        </Tab>
      </Tabs>
    </>
  );
};
