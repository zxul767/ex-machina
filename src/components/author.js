import React from "react"
import { SocialIcon } from "react-social-icons"
import * as styles from "./author.module.css"

const AuthorBanner = ({ author, social }) => {
  return (
    <div className={styles.root}>
      Written by {author}, software engineer and machine learning enthusiast.
      <div className={styles.socialLinks}>
        <SocialIcon
          className={styles.icon}
          url={`https://github.com/${social.github}`}
        />
        <SocialIcon
          className={styles.icon}
          url={`https://linkedin.com/in/${social.linkedin}`}
        />
      </div>
    </div>
  )
}

export default AuthorBanner
