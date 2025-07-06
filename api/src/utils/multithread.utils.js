const { Worker } = require("worker_threads")
const logger = require("../utils/log.adapter")

const processes = {}, cancelled = new Set()

/**
 * Multithreads a process, while awaiting its return
 * @param {string} id - Unique ID, used to abort an active process
 * @param {string} threadPath - Path to a file that implements onMessage function
 *  - onMessage(arg) arg is { data: { value: generator.next(), base: baseData } }
 *  - onMessage(arg) should call postMessage(result) followed by close()
 * @param {number} threadCount - Maximum number of threads to allow running concurrently
 * @param {Generator} dataGenerator - Generator to generate 'value' input for onMessage
 * @param {Functionc} resultCb - Called each time a new result is returned from a thread with value of 'result'
 * @param {any} [extra] - Additional static data to pass to each thread
 * @returns - Promise that will resolve when all threads are complete
 */
async function multithread(id, threadPath, threadCount, dataGenerator, resultCb, extra) {
    if (id in processes) throw new Error(`Process already active: ${id}`)
    cancelled.delete(id) // clear

    Worker.setMaxListeners(threadCount + 1)

    const threadBuffer = new Array(threadCount).fill(null)
    const terminateAll = () => Promise.allSettled(threadBuffer.map(
        (thread) => thread?.terminate ? thread.terminate() : Promise.resolve(thread)
    )).finally(() => { delete processes[id] })
    processes[id] = terminateAll

    function getThread(value) {
        return new Promise((res, rej) => {
            const thread = new Worker(threadPath)

            thread.on('message', (data) => {
                try {
                    resultCb(data)
                    res(thread)
                } catch (err) {
                    rej(err)
                }
            })
            thread.on('error', rej)
            thread.on('messageerror', rej)
            thread.on('exit', (code) => code !== 0 && rej(new Error(`Thread ended with exit code ${code}`)))
    
            thread.postMessage({ value, extra })
        })
    }

    let index = 0
    for (const value of dataGenerator) {
        // Wait for thread to complete
        try {
            if (threadBuffer[index]) await threadBuffer[index]
        } catch (err) {
            await terminateAll()
            throw err
        }

        // Add thread to promises array
        const current = index
        threadBuffer[current] = getThread(value)
            .then((thread) => thread.terminate())
            .finally(() => threadBuffer[current] = null)

        // Increment index
        index = (index + 1) % threadCount
        if (isAborted(id)) throw new Error("Aborted by user")
    }

    await Promise.all(threadBuffer.filter(Boolean)).catch(terminateAll)
    if (isAborted(id)) throw new Error("Aborted by user")
    delete processes[id]
}

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

    thread.on('message', (msg) => logger.log(`Message from thread ${id}:`, msg))
    thread.on('error', (err) => logger.error(`Error from thread ${id}:`, err))
    thread.on('messageerror', (err) => logger.error(`Error from thread ${id}:`, err))
    thread.on('exit', (code) => {
        if (code) logger.error(`Thread ${id} ended with exit code: ${code}`)
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

module.exports = { spawnAsync, multithread, abort, isActive, isAborted }