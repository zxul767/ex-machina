/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import { rhythm } from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author
          social {
            twitter
          }
        }
      }
    }
  `)

  const { author, social } = data.site.siteMetadata
  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(1 / 2),
      }}
    >
      <StaticImage
        className="bio-avatar"
        src="../images/ex-machina.png"
        alt="ex-machina"
        layout="fixed"
      />

      <p style={{ fontSize: `0.90rem` }}>
        Written by <strong>{author}</strong>, programmer and machine learning enthusiast.
        You can reach him on <a href={`https://twitter.com/${social.twitter}`}>Twitter</a>.
      </p>
    </div>
  )
}

export default Bio
