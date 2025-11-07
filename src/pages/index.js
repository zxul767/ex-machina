import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Bio from "../components/bio"
import Seo from "../components/seo"

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
        <Seo title="Blog" />
        <Bio />
        {posts.map(({ node: post }) => {
          const title = post.frontmatter.title || post.fields.slug
          const timeToRead = `${post.timeToRead} minute${
            post.timeToRead === 1 ? "" : "s"
          }`

          return (
            <div key={post.fields.slug}>
              <h4 style={{ marginBottom: `5px` }}>
                <Link style={{ boxShadow: `none` }} to={post.fields.slug}>
                  {title}
                </Link>
              </h4>
              <small>
                {post.frontmatter.date} &mdash; &#x1F550; {timeToRead}
              </small>
              <p
                dangerouslySetInnerHTML={{
                  __html: post.frontmatter.description || post.excerpt,
                }}
              />
            </div>
          )
        })}
      </Layout>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
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
