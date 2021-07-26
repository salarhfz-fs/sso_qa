const fs = require('fs')
const http = require('http')
const url = require('url')
const { parse } = require('querystring')
const httpProxy = require('http-proxy')
const fetch = require("node-fetch")

const proxy = httpProxy.createProxyServer({})

const API_ENDPOINT = 'https://qadev06.deriv.dev/sso_be/users/verify'

const server = http.createServer((req, res) => {
	if (req.url === '/favicon.ico') {
		proxy.web(req, res, { target: 'http://127.0.0.1:8181' })
	} else if (req.url === '/login.html') {
		fs.readFile(__dirname + req.url, (err, data) => {
			if (err) {
				res.writeHead(404)
				res.end(JSON.stringify(err))
				return
			}
			res.setHeader('Content-Type', 'text/html')
			res.writeHead(200)
			res.end(data)
		})
	} else if (req.url.includes('/ide.html')) {
		const queryObj = url.parse(req.url, true).query
		const token = queryObj.c9_token
		const username = queryObj.username
		const payload = { username, token }
		fetch(API_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		}).then(res => res.json())
			.then(data => {
				if (data.is_error) {
					res.writeHead(302, { Location: '/ide/login.html' })
					res.end()
				} else {
					proxy.web(req, res, { target: 'http://127.0.0.1:8181' })
				}
			})
	} else {
		res.end('Page not found! Please try again later...')
	}
})

server.listen(8585)
