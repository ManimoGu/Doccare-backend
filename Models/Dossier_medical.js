
class dossier_medical{


    constructor(Date_creation , Maladie_traitée = '', Patient, Cabinet){

        this.Date_creation = Date_creation,
        this.Maladie_traitée = Maladie_traitée,
        this.Patient = Patient,
        this.Cabinet = Cabinet

    }


}

exports.dossier_medical = dossier_medical;