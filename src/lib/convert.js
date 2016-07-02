import { parse as parseUrl } from 'url'
import { entries } from 'quiver-util/object'
import { ImmutableMap } from 'quiver-util/immutable'

import { RequestHead, ResponseHead } from 'quiver-http-head'

const responseHeaders = function*(response) {
  yield [':status', response.statusCode.toString()]

  const { headers={} } = response
  for(let key of Object.keys(headers)) {
    yield [key.toLowerCase(), headers[key]]
  }
}

const setScheme = function(options) {
  let requestHead = this
  const { protocol } = options

  if(!protocol) {
    return requestHead.setScheme('http')
  } else {
    // omit colon (:) presence at the end
    return requestHead.setScheme(protocol.replace(':', ''))
  }
}

const setHost = function(options) {
  let requestHead = this
  const { host, hostname, port } = options

  if(host) return requestHead.setAuthority(host)

  if(hostname) {
    requestHead = requestHead.setHostname(hostname)
  }

  if(port) {
    requestHead = requestHead.setPort(port)
  }

  return requestHead
}

const setPath = function(options) {
  let requestHead = this
  const {
    path, pathname, search, query
  } = options

  if(path) return requestHead.setPath(path)

  if(pathname) {
    requestHead = requestHead.setPathname(pathname)
  }

  if(search) {
    requestHead = requestHead.setSearch(search)
  } else if(query) {
    requestHead = requestHead.setQuery(query)
  }

  return requestHead
}

export const setUrlOptions = function(options) {
  return this
    ::setScheme(options)
    ::setHost(options)
    ::setPath(options)
}

const setHeaders = function(rawHeaders) {
  let requestHead = this

  for(const [header, value] of entries(rawHeaders)) {
    requestHead = requestHead.setHeader(header.toLowerCase(), value)
  }

  return requestHead
}

export const nodeRequestToRequestHead = request => {
  const {
    url='',
    method='GET',
    headers={}
  } = request

  const urlOptions = parseUrl(url)

  return new RequestHead()
    .setMethod(method)
    ::setUrlOptions(urlOptions)
    ::setHeaders(headers)
}

export const nodeResponseToResponseHead = response => {
  const { statusCode, headers={} } = response

  return new ResponseHead()
    .setStatus(statusCode)
    ::setHeaders(headers)
}

export const requestHeadToRequestOptions = requestHead => {
  const rawHeaders = requestHead.headerObject()

  const {
    scheme='http',
    hostname,
    port,
    method,
    path,
  } = requestHead

  return {
    protocol: scheme + ':',
    hostname,
    port,
    method,
    path,
    headers: rawHeaders
  }
}