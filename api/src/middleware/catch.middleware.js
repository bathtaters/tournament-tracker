// Catch async errors in controllers
// (Wrap each controller in this)

function catchWrapper(handler) {
  return (req, res, next) => Promise.resolve().then(() => 
      handler(req, res, next)
    ).catch(next);
}

module.exports = catchWrapper;