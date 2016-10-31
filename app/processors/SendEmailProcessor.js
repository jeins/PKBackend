import mailer from 'nodemailer';
import mainConf from '../constants/MainConfig';

class SendEmailProcessor{
    constructor(){
        this.smtpTransport = mailer.createTransport('smtps://'+mainConf.gmail_account.email+':'+mainConf.gmail_account.password+'@smtp.gmail.com');
    }

    sendEmail(userMail, activationCode, callback){
        this.smtpTransport.sendMail(this._mailTemplate(userMail, activationCode), (error, response)=>{
            if(error){
                callback(error.message, null);
            }else{
                callback(null, response);
            }
        });
    }

    /**
     *
     * @param userMail
     * @param activationCode
     * @returns {{from: string, to: *, subject: string, text: string}}
     * @private
     */
    _mailTemplate(userMail, activationCode){
        var mail = {
            from: mainConf.gmail_account.email,
            to: userMail,
            subject: "User Activation",
            html: "Hallo, <br>" +
                "<p>You've successfully created a PetaKami account. To activate it, please click below to verify your email address. </p>" +
                "<a href='"+mainConf.emailActivationUri+activationCode+"'>Activated My Account</a>"
        };

        return mail;
    }
}

module.exports = SendEmailProcessor;