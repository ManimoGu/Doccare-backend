

class fiche_medical{


    constructor(Poids, Taille, Maladie_chronique='', Groupe_sanguin='', Maladie_infectueuse = '' , Allergie ='', Habitude_toxique = '', Chirurgie_antérieure ='', Maladie_héréditaire = '', Autre_antécédants ='',  Patient){

        this.Poids  =  	Poids;
        this.Taille  = Taille ;
        this.Maladie_chronique = Maladie_chronique;
        this.Groupe_sanguin = Groupe_sanguin;
        this.Maladie_infectueuse   = Maladie_infectueuse  ;
        this.Allergie   = Allergie  ;
        this.Habitude_toxique  = Habitude_toxique ;
        this.Chirurgie_antérieure   = Chirurgie_antérieure ;
        this.Maladie_héréditaire   = Maladie_héréditaire  ;
        this.Autre_antécédants  = Autre_antécédants ;
        this.Patient   =  Patient  ;


    }


}

exports.fiche_medical = fiche_medical;