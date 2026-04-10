import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Bio from "../components/bio"
import Seo from "../components/seo"
import * as styles from "./index.module.css"

class BlogIndex extends React.Component {
  render() {
    const {
      data: {
        site: {
          siteMetadata: { title: siteTitle },
        },
        allMarkdownRemark: { edges: posts },
      },
    } = this.props

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <Bio />
        {posts.map(({ node: post }) => {
          const title = post.frontmatter.title || post.fields.slug
          const timeToRead = `${post.timeToRead} minute${
            post.timeToRead === 1 ? "" : "s"
          }`

          return (
            <article className={styles.postPreview} key={post.fields.slug}>
              <h4 className={styles.postTitle}>
                <Link to={post.fields.slug}>{title}</Link>
              </h4>
              <small className={styles.postMeta}>
                {post.frontmatter.date} &mdash; &#x1F550; {timeToRead}
              </small>
              <p
                className={styles.postDescription}
                dangerouslySetInnerHTML={{
                  __html: post.frontmatter.description || post.excerpt,
                }}
              />
            </article>
          )
        })}
      </Layout>
    )
  }
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      edges {
        node {
          excerpt
          timeToRead
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`

export default BlogIndex
export const Head = (props) => <Seo title="Blog" />
