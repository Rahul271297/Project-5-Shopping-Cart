const jwt = require("jsonwebtoken")

const middleWare = async function(req, res, next) {

    try {
        let token = req.headers['x-api-key']

        if (!token) {
            return res.send({ status: false, Message: 'No token found' })
        } else {
            //  console.log("jfb")
            let decodedtoken = jwt.verify(token, 'Group2')
                // console.log(decodedtoken)
            if (decodedtoken) {
                req.decodedtoken = decodedtoken; // this is for authorization later
                next();
            } else {
                res.status(404).send({ Message: "Not valid Token" })
            }
        }
    } catch (err) {
        res.status(404).send({ status: false, msg: err.message })
    }
}

module.exports.middleWare = middleWare;