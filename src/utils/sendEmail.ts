const brevo = require('@getbrevo/brevo');

export const sendEmail = async (user) => {
  let defaultClient = brevo.ApiClient.instance;
  let apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  let apiInstance = new brevo.TransactionalEmailsApi();
  let sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.templateId = 1;
  sendSmtpEmail.to = [
    { "email": user.email }
  ];
  sendSmtpEmail.params = { "name": user.firstName, "code": user.emailVerificationCode, "time": new Date() };


  apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  }, function (error) {
    console.error(error);
  });
}