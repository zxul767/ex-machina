import Typography from "typography"
import moragaTheme from "typography-theme-moraga"

moragaTheme.googleFonts = [
  ...moragaTheme.googleFonts,
  {
    name: "Merriweather",
    styles: ["200", "400"],
  },
  {
    name: "JetBrains Mono",
    styles: ["400"],
  },
]
moragaTheme.headerFontFamily = ["Merriweather", "serif"]

const typography = new Typography(moragaTheme)

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
