

class Patient{


    constructor( Nom='', prénom='', Civilité='', CIN='', Date_naissance , Tel ='', Situation_familiale = '', Adresse ='', Email='', Mutuelle = '', Avatar = '', Account = null ){
        
        this.Nom  = Nom ;
        this.prénom = prénom;
        this.Civilité = Civilité;
        this.CIN = CIN;
        this.Date_naissance  = Date_naissance ;
        this.Tel  = Tel ;
        this.Situation_familiale = Situation_familiale;
        this.Adresse   = Adresse  ;
        this.Email  = Email ;
        this.Mutuelle  = Mutuelle ;
        this.Avatar   =  Avatar  ;
        this.Account  =  Account ;
       

    }


}

exports.Patient = Patient;