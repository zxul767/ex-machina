import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { rhythm } from "../utils/typography"

class BlogPostTemplate extends React.Component {
  render() {
    const data = this.props.data
    const post = data.markdownRemark
    const siteTitle = data.site.siteMetadata.title
    const { author, social } = data.site.siteMetadata
    const { previous, next } = this.props.pageContext
    const readingTime = post.fields.readingTime.text

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <Seo
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <h2
          style={{
            marginTop: rhythm(1),
            marginBottom: 0,
          }}
        >
          {post.frontmatter.title}
        </h2>
        <h4
          style={{
            marginTop: rhythm(0.5),
            marginBottom: rhythm(0.5),
          }}
        >
          {post.frontmatter.description}
        </h4>
        <small>
          {post.frontmatter.date} &mdash; &#x1F550; {readingTime}
        </small>

        <hr />

        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />

        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="previous">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li style={{ marginLeft: `2rem`, marginRight: `2rem` }}>
            <Link to="/" rel="home">
              Home
            </Link>
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>

        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />

        <p style={{ fontSize: `0.90rem` }}>
          Written by <strong>{author}</strong>. You can usually find him hanging
          out on
          <a href={`https://twitter.com/${social.twitter}`}> Twitter</a>.
        </p>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        social {
          twitter
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
      fields {
        slug
        readingTime {
          text
        }
      }
    }
  }
`
