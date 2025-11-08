import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import AuthorBanner from "../components/author"
import Seo from "../components/seo"
import { rhythm } from "../utils/typography"

class BlogPostTemplate extends React.Component {
  render() {
    const {
      data: {
        markdownRemark: post,
        site: {
          siteMetadata: { title: siteTitle, author, social },
        },
      },
      pageContext: { previous, next },
    } = this.props

    const timeToRead = `${post.timeToRead} minute${
      post.timeToRead === 1 ? "" : "s"
    }`

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
          {post.frontmatter.date} &mdash; &#x1F550; {timeToRead}
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

        <hr />
        <AuthorBanner author={author} social={social} />
        <hr />
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
          github
          linkedin
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
      fields {
        slug
      }
    }
  }
`
