module.exports = function (req, res, next) {
  if (req.method === 'GET') {
    if (req.url.endsWith('/tutorial/')) {
      res.writeHead(302, { Location: '/tutorial/welcome-to-redwood.html' })
      res.end()
    } else if (req.url.endsWith('/docs/')) {
      res.writeHead(302, { Location: '/docs/introduction.html' })
      res.end()
    }
  }

  next()
}
