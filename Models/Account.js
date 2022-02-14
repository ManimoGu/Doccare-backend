

class Account {

    constructor(login='', password='', fonction='', token='', isverified=false, expirationDat= new Date(), id = null ){

        this.login = login;
        this.password = password;
        this.fonction = fonction;
        this.token = token;
        this.isverified = isverified;
        this.expirationDat = expirationDat; 
        this.id = id;      
    
    }
}

exports.Account = Account;