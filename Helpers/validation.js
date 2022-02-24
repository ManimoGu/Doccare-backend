exports.validationRegister = (Doctor, Account, Cabinet) => {

     // FirstName
    if (Doctor.nom.length < 4 || Doctor.nom.length > 20) {
        return "firstname should contain from 4 to 20 caracters"
      }
  
      //LastName
      if (Doctor.prénom.length < 4 || Doctor.prénom.length > 20) {
        return "<h1>lastname should contain from 4 to 20 caracters</h1>"
        
      }

       //LastName
       if (Account.login.length < 8 ) {
        return "login should be more than 8 caracter"
        
        }

      //PassWord
      let pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/
  
      if ( pattern.test(Account.password) === false ) {
          
        return "The password should contain minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"
        
      }
  
      //Username Email
      let pattern_email = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
  
     if ( pattern_email.test(Cabinet.email) === false  ) {
          
            return "Email Should be like : Example@Example.com"
        
      }

     // var pattern_tel = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      
      //if ( pattern_tel.test(Cabinet.tel) === false  ) {
          
       // return "<h1>You should enter a valide phone format</h1>"
    
     // }

}
