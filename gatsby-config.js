module.exports = {
  siteMetadata: {
    title: `Ex Machina`,
    author: `W. Gómez`,
    description: `A blog on AI, ML, algorithmics and programming.`,
    siteUrl: `https://zxul767.dev`,
    social: {
      github: `zxul767`,
      linkedin: `wgomezj`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-fonts-with-attributes`,
      options: {
        fonts: [
          `JetBrains Mono`,
          `Merriweather`,
          `Source Sans Pro\:200,400,400i,700`,
        ],
        display: "swap",
        attributes: {
          rel: "stylesheet preload prefetch",
          as: "style",
        },
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-numbered-footnotes`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: `gatsby-remark-vscode`,
            options: {
              theme: "azure-light",
              extensions: ["common-lisp", "rainglow"],
              inlineCode: {
                marker: "•",
              },
            },
          },
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          {
            resolve: `gatsby-remark-katex`,
            options: {
              // Add any KaTeX options from https://github.com/KaTeX/KaTeX/blob/master/docs/options.md here
              strict: `ignore`,
            },
          },
        ],
      },
    },
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Ex-Machina`,
        short_name: `Ex-Machina`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/ex-machina.png`,
      },
    },
    `gatsby-plugin-remove-serviceworker`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    {
      resolve: `gatsby-plugin-page-progress`,
      options: {
        includePaths: [],
        excludePaths: ["/"],
        height: 4,
        color: `#81bfe6`,
      },
    },
  ],
}
