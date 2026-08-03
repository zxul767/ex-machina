const fs = require("fs")
const path = require("path")
const visit = require("unist-util-visit")

const DEFAULT_THEME = "github-light"

const languageAliases = {
  bash: "shellscript",
  lisp: "common-lisp",
  shell: "shellscript",
}

const highlightLineMarker =
  /\s*(?:#|\/\/|;|<!--)\s*highlight-line\s*(?:-->)?\s*$/

function loadBundledJson(packageName, moduleName) {
  const packageDirectory = path.dirname(require.resolve(packageName))
  const modulePath = path.join(packageDirectory, `${moduleName}.mjs`)
  const source = fs.readFileSync(modulePath, "utf8")
  const match = source.match(/JSON\.parse\(("(?:\\.|[^"\\])*")\)/)

  if (!match) {
    throw new Error(`Could not load Shiki module: ${modulePath}`)
  }

  return JSON.parse(JSON.parse(match[1]))
}

const highlighterPromises = new Map()

function getHighlighter(theme) {
  if (!highlighterPromises.has(theme)) {
    highlighterPromises.set(
      theme,
      import("shiki").then(
      ({ createHighlighterCoreSync, createJavaScriptRegexEngine }) =>
        createHighlighterCoreSync({
          engine: createJavaScriptRegexEngine(),
          themes: [loadBundledJson("@shikijs/themes", theme)],
          langs: [
            loadBundledJson("@shikijs/langs", "common-lisp"),
            loadBundledJson("@shikijs/langs", "shellscript"),
            loadBundledJson("@shikijs/langs", "python"),
            loadBundledJson("@shikijs/langs", "java"),
            loadBundledJson("@shikijs/langs", "go"),
          ],
        })
      )
    )
  }

  return highlighterPromises.get(theme)
}

module.exports = async function remarkShiki({ markdownAST }, options = {}) {
  const theme = options.theme || DEFAULT_THEME
  const highlighter = await getHighlighter(theme)

  visit(markdownAST, "code", (node) => {
    const requestedLanguage = node.lang || "text"
    const language = languageAliases[requestedLanguage] || requestedLanguage
    const lang = highlighter.getLoadedLanguages().includes(language)
      ? language
      : "text"

    const highlightLines = new Set()
    const source = node.value
      .split("\n")
      .map((line, index) => {
        if (highlightLineMarker.test(line)) {
          highlightLines.add(index + 1)
          return line.replace(highlightLineMarker, "")
        }
        return line
      })
      .join("\n")

    let html = highlighter.codeToHtml(source, {
      lang,
      theme,
    })

    let lineNumber = 0
    html = html.replace(/<span class="line">/g, (match) => {
      lineNumber += 1
      return highlightLines.has(lineNumber)
        ? '<span class="line highlighted">'
        : match
    })

    node.type = "html"
    node.value = html
  })
}
