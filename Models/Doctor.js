class Doctor{

    constructor(nom='', prénom='', specialite='', CIN='', tel='', email='', Cabinet, Account){

        this.nom = nom;
        this.prénom = prénom;
        this.spécialité = specialite;
        this.CIN = CIN;
        this.tel = tel;
        this.email = email;
        this.Cabinet = Cabinet;
        this.Account = Account;


    }


}

exports.Doctor = Doctor;