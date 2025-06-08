const { Worker } = require("worker_threads")

/**
 * Multithreads a process
 * @param {string} threadPath - Path to a file that implements onMessage function
 *  - onMessage(arg) arg is { data: { value: generator.next(), base: baseData } }
 *  - onMessage(arg) should call postMessage(result) followed by close()
 * @param {number} threadCount - Maximum number of threads to allow running concurrently
 * @param {Generator} dataGenerator - Generator to generate 'value' input for onMessage
 * @param {Functionc} resultCb - Called each time a new result is returned from a thread with value of 'result'
 * @param {any} [extra] - Additional static data to pass to each thread
 * @returns - Promise that will resolve when all threads are complete
 */
async function multithread(threadPath, threadCount, dataGenerator, resultCb, extra) {

    Worker.setMaxListeners(threadCount + 1)

    const threadBuffer = new Array(threadCount).fill(null)

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
        if (threadBuffer[index]) await threadBuffer[index]

        // Add thread to promises array
        const current = index
        threadBuffer[current] = getThread(value)
            .then((thread) => thread.terminate())
            .finally(() => threadBuffer[current] = null)

        // Increment index
        index = (index + 1) % threadCount
    }

    await Promise.all(threadBuffer.filter(Boolean))
}

module.exports = multithread