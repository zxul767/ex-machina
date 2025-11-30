import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"

function SEO({ description, lang, meta, title }) {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          author
        }
      }
    }
  `)

  const defaultTitle = site.siteMetadata?.title
  const metaDescription = description || site.siteMetadata.description

  const baseMeta = [
    {
      name: `description`,
      content: metaDescription,
    },
    {
      property: `og:title`,
      content: title,
    },
    {
      property: `og:description`,
      content: metaDescription,
    },
    {
      property: `og:type`,
      content: `website`,
    },
    {
      name: `twitter:card`,
      content: `summary`,
    },
    {
      name: `twitter:creator`,
      content: site.siteMetadata.author,
    },
    {
      name: `twitter:title`,
      content: title,
    },
    {
      name: `twitter:description`,
      content: metaDescription,
    },
  ]

  const mergedMeta = baseMeta.concat(meta)

  return (
    <>
      {/* document title with template, same behavior as before */}
      <title>{defaultTitle ? `${title} | ${defaultTitle}` : title}</title>

      {/* meta tags */}
      {mergedMeta.map((m, i) => (
        <meta key={m.name || m.property || i} {...m} />
      ))}
    </>
  )
}

SEO.defaultProps = {
  lang: `en`, // currently unused by Head (see below)
  meta: [],
  description: ``,
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
}

export default SEO
