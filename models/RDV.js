class RDV {

    constructor( Date= new Date(), Heure, Type='', Etat='', Cabinet, Patient){

        this.Date = Date;
        this.Heure = Heure;
        this.Type = Type;
        this.Etat = Etat;
        this.Cabinet = Cabinet;
        this.Patient = Patient;
    
    }
}

exports.RDV = RDV;