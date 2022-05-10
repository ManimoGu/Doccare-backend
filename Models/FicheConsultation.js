class FicheConsultation {

    constructor(Observation='', Ordonnance='', Certificat='', Analyse='', Autre='', Date_création= new Date(), id = null ){

        this.login = login;
        this.password = password;
        this.fonction = fonction;
        this.token = token;
        this.isverified = isverified;
        this.expirationDat = expirationDat; 
        this.id = id;      
    
    }
}

exports.FicheConsultation = FicheConsultation;