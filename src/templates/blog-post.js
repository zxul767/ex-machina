import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import AuthorBanner from "../components/author"
import Seo from "../components/seo"
import * as styles from "./blog-post.module.css"

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
        <h1 className={styles.title}>{post.frontmatter.title}</h1>
        <h4 className={styles.description}>{post.frontmatter.description}</h4>
        <p className={styles.meta}>
          {post.frontmatter.date} &mdash; &#x1F550; {timeToRead}
        </p>

        <hr />

        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <hr className={styles.divider} />

        <ul className={styles.navigation}>
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="previous">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
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

export const Head = ({ data }) => {
  const post = data.markdownRemark
  return (
    <Seo
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
    />
  )
}
