
const jwt = require("jsonwebtoken")


exports.Access = (req, res) =>{

    const Header_token = req.headers['authorization']
    const token = Header_token && Header_token.split(' ')[1]
    if(token === null ) return res.sendStatus(403)
    let result =  jwt.verify(token, process.env.ACCESS_TOKEN)
    
   return result
}   