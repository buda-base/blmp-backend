import httpStatus from 'http-status';
import is from 'is_js'

const Log = require('debug-level')
const Boom = require('@hapi/boom')
const jsonld = require('jsonld');

const config = require('../../../config/env');

const debug = new Log('bdrc:resource');
function arrayify(x) { return Array.isArray(x) ? x : [x]; }

const rootFinder = (graph, id) => {
  if (!graph['@graph']) return graph

  // else seek for isRoot or primary key
  const rootSelector = graph['@graph'].filter(e => e.isRoot)
  const root = is.not.empty(rootSelector) ? rootSelector[0] : graph['@graph'].filter(e => e['@id'] === `bdr:${id}`)[0]

  // adapters
  if (root && !Array.isArray(root['skos:prefLabel'])) root['skos:prefLabel'] = [root['skos:prefLabel']]
  return root
}

/**
 * Get Resource
 * @returns {Resource}
 */
// eslint-disable-next-line consistent-return
async function get(req, res) {
  // allow if it matches user session or admin session
  debug.info('Invoked by', req.user)
  const allowed = !config.requireAuth
                  || ['bdrc-admin', 'bdrc-viewer'].some(scope => req.user && req.user.scope.includes(scope))
  if (!allowed) {
    return res.status(httpStatus.FORBIDDEN).json(Boom.forbidden('Not authorized'))
  }

  const { id } = req.params

  try {
    const compacted = await jsonld.compact(
      `${config.BUDA_RESOURCE_URL}/resource/${id}.jsonld`, 'http://purl.bdrc.io/context.jsonld'
    );

    const root = rootFinder(compacted, id)

    return res.json({
      id,
      prefix: 'bdr',
      data: compacted['@graph'] || [compacted],
      prefLabel: root['skos:prefLabel'] || undefined,
      root,
    })
  } catch (error) {
    debug.error('%O', error)
    return res.status(httpStatus.NOT_FOUND).json(Boom.notFound(error))
  }
}

async function getOne(id) { // sample async action
  const shortId = id.startsWith('bdr:') ? id.substring(4) : id
  try {
    const compacted = await jsonld.compact(
      `${config.BUDA_RESOURCE_URL}/resource/${shortId}.jsonld`, 'http://purl.bdrc.io/context.jsonld'
    );

    const root = rootFinder(compacted, shortId)
    return {
      id: `bdr:${shortId}`,
      prefix: 'bdr',
      data: compacted['@graph'] || [compacted],
      prefLabel: root['skos:prefLabel'] || undefined,
      root,
    }
  } catch (error) {
    debug.error('%O', error)
    return {}
  }
}

/**
 * Get Resource list.
 * @returns {Resource[]}
 */
// eslint-disable-next-line consistent-return
async function list(req, res) {
  const query = req.query.id || undefined
  // allow if it matches user session or admin session
  debug.info('Invoked by', req.user)

  const allowed = !config.requireAuth || ['bdrc-admin', 'bdrc-viewer'].some(scope => req.user.scope.includes(scope))
  if (!allowed) {
    return res.status(httpStatus.FORBIDDEN).json(Boom.forbidden('Not authorized'))
  }

  const queries = arrayify(query)
  debug.info('Query:', queries)

  // map over forEach since it returns
  const actions = queries.map(getOne); // run the function over all items

  // we now have a promises array and we want to wait for it
  const results = Promise.all(actions); // pass array of promises

  results.then((data) => {
    debug.log('%O', data)
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
    res.setHeader('X-Total-Count', data.length)
    res.json(data)
  })
}

export default { get, list };
