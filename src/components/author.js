import React from "react"
import { SocialIcon } from "react-social-icons"

const AuthorBanner = ({ author, social }) => {
  return (
    <div className="author">
      Written by {author}, software engineer and machine learning enthusiast.
      <div className="social-networks">
        <SocialIcon
          className="social-mini-icon"
          url={`https://github.com/${social.github}`}
        />
        <SocialIcon
          className="social-mini-icon"
          url={`https://linkedin.com/in/${social.linkedin}`}
        />
      </div>
    </div>
  )
}

export default AuthorBanner
