import httpStatus from 'http-status';
import is from 'is_js'
import { DEFAULT_PERSONS, DEFAULT_WORKS } from '../../data-files/app-data'

const Log = require('debug-level')
const Boom = require('@hapi/boom')
const jsonld = require('jsonld');

const config = require('../../../config/env');

const debug = new Log('bdrc:person');

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
 * Get Person
 * @returns {Person}
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

/**
 * Create new Person
 * @returns {Person}
 */
function create(req, res) {
  // allow if it matches user session or admin session
  debug.info('Invoked by', req.user)
  const allowed = !config.requireAuth || ['bdrc-admin'].every(scope => req.user && req.user.scope.includes(scope))
  if (!allowed) {
    return res.status(httpStatus.FORBIDDEN).json(Boom.forbidden('Not authorized'))
  }

  return res.status(httpStatus.NOT_IMPLEMENTED).json(Boom.notImplemented('Not implemented'))
}

/**
 * Update existing Person
 * @returns {Person}
 */
// eslint-disable-next-line consistent-return
function update(req, res, next) {
  // allow if it matches user session or admin session
  debug.info('Invoked by', req.user)
  const allowed = !config.requireAuth || ['bdrc-admin'].every(scope => req.user && req.user.scope.includes(scope))
  if (!allowed) {
    return res.status(httpStatus.FORBIDDEN).json(Boom.forbidden('Not authorized'))
  }

  const { item } = req;

  const updatedItem = { ...req.body }
  delete updatedItem.createdAt

  // eslint-disable-next-line array-callback-return
  Object.keys(updatedItem).map((key) => {
    if (!key.startsWith('_')) item[key] = updatedItem[key]
  });

  item.save()
    .then(savedItem => res.json(savedItem))
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        debug.error('Duplicate entry in Persons', err.errmsg)
        res.status(httpStatus.CONFLICT).json(Boom.conflict(err))
      } else next(err); // Some other error
    });
}

/**
 * Get Person list.
 * @returns {Person[]}
 */
// eslint-disable-next-line consistent-return
async function mocklist(req, res) {
  const query = req.query.q || undefined
  // allow if it matches user session or admin session
  debug.info(req.user)
  const allowed = !config.requireAuth || ['bdrc-admin', 'bdrc-viewer'].some(scope => req.user.scope.includes(scope))
  if (!allowed) {
    return res.status(httpStatus.FORBIDDEN).json(Boom.forbidden('Not authorized'))
  }

  if (query) {
    const id = req.query.q.startsWith('bdr:') ? req.query.q.substring(4) : req.query.q
    try {
      const compacted = await jsonld.compact(
        `${config.BUDA_RESOURCE_URL}/resource/${id}.jsonld`, 'http://purl.bdrc.io/context.jsonld'
      );

      const root = rootFinder(compacted, id)

      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
      res.setHeader('X-Total-Count', 1)
      return res.json([{
        id,
        prefix: 'bdr',
        data: compacted['@graph'] || [compacted],
        prefLabel: root['skos:prefLabel'] || undefined,
        root,
      }])
    } catch (error) {
      debug.error('%O', error)
      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
      res.setHeader('X-Total-Count', 0)
      return res.json([])
    }
  } else {
    // mock datasets
    let dataset = DEFAULT_PERSONS
    if (req.baseUrl.startsWith('/api/works')) dataset = DEFAULT_WORKS

    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
    res.setHeader('X-Total-Count', DEFAULT_PERSONS.length)
    res.json(dataset)
  }
}

/**
 * Delete Person.
 * @returns {Person}
 */
// eslint-disable-next-line consistent-return
function remove(req, res, next) {
  // allow if it matches user session or admin session
  debug.info('Invoked by', req.user)
  const allowed = !config.requireAuth || ['bdrc-admin'].every(scope => req.user && req.user.scope.includes(scope))
  if (!allowed) {
    return res.status(httpStatus.FORBIDDEN).json(Boom.forbidden('Not authorized'))
  }

  const { item } = req;
  item.remove()
    .then(deletedItem => res.json(deletedItem))
    .catch(e => next(e));
}

export default { get, create, update, remove, mocklist };
