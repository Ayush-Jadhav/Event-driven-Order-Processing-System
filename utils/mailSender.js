const nodemailer = require("nodemailer");
const {ses} = require("../config/awsSesConfig");

/* exports.SendMail = async ({to,subject,body})=>{

  const params = {
    Source: process.env.SES_VERIFIED_EMAIL, 
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: body } },
    },
  };

  try{
    const result = await ses.sendEmail(params).promise();
    console.log("Email sent successfully!", result.MessageId);
  } 
  catch (error) {
    console.error("Error sending email:", error);
  }

} */


exports.SendMail = async ({to,subject,body})=>{
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            auth:{
                user: process.env.USER,
                pass: process.env.PASS,
            }
        })
        
        const mailResponse = await transporter.sendMail({
            from: `Property On Rent`,
            to: `${to}`,
            subject: `${subject}`,
            html: `${body}`,
        })

        return mailResponse;
    }
    catch(err){
        console.log("error in nodemailer",err);
    }
}


