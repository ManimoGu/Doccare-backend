
const jwt = require("jsonwebtoken")


exports.Access = (req, res, next) =>{

    const Header_token = req.headers['authorization']
    const token = Header_token && Header_token.split(' ')[1]
    if(token === null ) return res.sendStatus(403)
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, result) =>{

        if (err)  return  res.sendStatus(403)
        req.user = result
        req.ID = Header_token && Header_token.split(' ')[2]
        next()
    })
    
   
}   