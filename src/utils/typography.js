import Typography from "typography"
import theme from "typography-theme-moraga"

const typography = new Typography(theme)

typography.injectStyles()

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
