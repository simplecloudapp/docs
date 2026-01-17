import { useState, useEffect } from 'react';

export const DependencySnippet = ({
  dependencies = [],
  repositories = [
    { id: "simplecloud", url: "https://repo.simplecloud.app/snapshots" },
    { id: "buf", url: "https://buf.build/gen/maven" }
  ],
  type = "snapshot"
}) => {
  const [versions, setVersions] = useState({});

  useEffect(() => {
    dependencies.forEach(dep => {
      if (dep.version) return;

      const fetchVersion = async () => {
        try {
          const url = type === "snapshot"
            ? `https://repo.simplecloud.app/api/maven/latest/version/snapshots/${dep.groupId.replace(/\./g, "/")}/${dep.artifactId}?type=raw`
            : `https://search.maven.org/solrsearch/select?q=g:${dep.groupId}+AND+a:${dep.artifactId}&rows=1&wt=json`;

          const res = await fetch(url);
          if (type === "snapshot") {
            const version = await res.text();
            setVersions(prev => ({ ...prev, [`${dep.groupId}:${dep.artifactId}`]: version.trim() }));
          } else {
            const data = await res.json();
            const version = data.response?.docs?.[0]?.latestVersion;
            if (version) {
              setVersions(prev => ({ ...prev, [`${dep.groupId}:${dep.artifactId}`]: version }));
            }
          }
        } catch (e) {
          console.error("Failed to fetch version", e);
        }
      };
      fetchVersion();
    });
  }, [dependencies, type]);

  const getVersion = (dep) => {
    if (dep.version) return dep.version;
    return versions[`${dep.groupId}:${dep.artifactId}`] || "LATEST";
  };

  const generateKotlin = () => {
    const repoLines = repositories.map(r => `    maven("${r.url}")`).join("\n");
    const depLines = dependencies.map(dep => {
      const depType = dep.type || "implementation";
      return `    ${depType}("${dep.groupId}:${dep.artifactId}:${getVersion(dep)}")`;
    }).join("\n");
    return `repositories {\n${repoLines}\n}\n\ndependencies {\n${depLines}\n}`;
  };

  const generateGroovy = () => {
    const repoLines = repositories.map(r => `    maven { url '${r.url}' }`).join("\n");
    const depLines = dependencies.map(dep => {
      const depType = dep.type || "implementation";
      return `    ${depType} '${dep.groupId}:${dep.artifactId}:${getVersion(dep)}'`;
    }).join("\n");
    return `repositories {\n${repoLines}\n}\n\ndependencies {\n${depLines}\n}`;
  };

  const generateMaven = () => {
    const repoLines = repositories.map(r => `    <repository>
      <id>${r.id || 'repo'}</id>
      <url>${r.url}</url>
    </repository>`).join("\n");
    const depLines = dependencies.map(dep => {
      const scope = dep.type === "compileOnly" ? "provided" : "compile";
      return `    <dependency>
      <groupId>${dep.groupId}</groupId>
      <artifactId>${dep.artifactId}</artifactId>
      <version>${getVersion(dep)}</version>
      <scope>${scope}</scope>
    </dependency>`;
    }).join("\n");
    return `<repositories>\n${repoLines}\n</repositories>\n\n<dependencies>\n${depLines}\n</dependencies>`;
  };

  return (
    <Tabs>
      <Tab title="Gradle (Kotlin)">
        <CodeBlock language="kotlin">
          {generateKotlin()}
        </CodeBlock>
      </Tab>
      <Tab title="Gradle (Groovy)">
        <CodeBlock language="groovy">
          {generateGroovy()}
        </CodeBlock>
      </Tab>
      <Tab title="Maven">
        <CodeBlock language="xml">
          {generateMaven()}
        </CodeBlock>
      </Tab>
    </Tabs>
  );
};
