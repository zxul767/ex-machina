import React from "react"
import { Link } from "gatsby"
import * as styles from "./layout.module.css"

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props

    return (
      <div className={styles.shell}>
        <header>{buildHeader(location, title)}</header>
        <main>{children}</main>
        <footer className={styles.footer}>
          © {new Date().getFullYear()}. Built using
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    )
  }
}

function buildHeader(location, title) {
  const rootPath = `${__PATH_PREFIX__}/`
  if (location.pathname === rootPath) {
    return (
      <h1>
        <Link className={styles.titleLink} to={`/`}>
          {title}
        </Link>
      </h1>
    )
  }
  // in non-root pages, we make the website title smaller so that the title
  // of the corresponding page stands out
  return (
    <h3>
      <Link className={styles.titleLink} to={`/`}>
        {title}
      </Link>
    </h3>
  )
}

export default Layout
