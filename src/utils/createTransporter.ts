import nodeMailer from 'nodemailer';

export const createTransporter = () => {
  return nodeMailer.createTransport({
      service: 'hotmail',
      auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
      }
  })
}
