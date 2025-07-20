const { Worker } = require("worker_threads")
const logger = require("../utils/log.adapter")

const processes = {}, cancelled = new Set()

/**
 * Spawn a new thread asynchronously
 * @param {string} id - Unique ID, used to abort an active process
 * @param {string} threadPath - Path to a file that implements onMessage function
 *  - onMessage(data) should call parentPort.close()
 * @param {any} data - Argument to send to thread
 */
function spawnAsync(id, threadPath, data) {
    if (id in processes) throw new Error(`Process already active: ${id}`)
    cancelled.delete(id) // clear

    const thread = new Worker(threadPath)

    const terminate = () => (thread?.terminate ? thread.terminate() : Promise.resolve(0))
        .finally(() => { delete processes[id] })
    processes[id] = terminate

    let hasExited = false
    thread.on('message', (msg) => logger.log(`Message from thread ${id}:`, msg))
    thread.on('error', (err) => logger.error(`Error from thread ${id}:`, err))
    thread.on('messageerror', (err) => logger.error(`Error from thread ${id}:`, err))
    thread.on('exit', (code) => {
        if (!hasExited && code) logger.error(`Thread ${id} ended with exit code: ${code}`)
        hasExited = true
        return terminate()
    })

    // Spawn
    thread.postMessage(data)
}

const isActive = (id) => id in processes

const isAborted = (id) => cancelled.has(id)

const abort = async (id) => {
    if (id in processes) return processes[id]().then((res) => {
        cancelled.add(id)
        return res
    })
    throw new Error(`Process not found: ${id}`)
}

module.exports = { spawnAsync, abort, isActive, isAborted }