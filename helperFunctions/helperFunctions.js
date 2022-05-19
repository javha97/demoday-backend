export const errorHandler = (fn) => {
    return async (req, res, next) => {
        try {
            return await fn(req, res, next)
        } catch (e) {
            next()
        }
    }
}
export const isAuthenticated = async (req, res, next) => {
    const { user } = req.headers
    const adminToken = `aDIDaUx37HeyoREIZDL39MLFfv23`
    if (user === adminToken) {
        next()
    } else {
        return res.status(403).send('lmao')
    }
}