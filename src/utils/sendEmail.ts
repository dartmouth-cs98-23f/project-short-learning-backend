import { createTransporter } from './createTransporter'
import mjml2html from 'mjml'

export const sendEmail = async (user) => {
  const transporter = createTransporter()
  const content = mjml2html(`
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>

              <mj-image width="100px" src="https://i.imgur.com/xWwmcoV.png"></mj-image>
              <mj-divider border-color="#00008B"></mj-divider>

              <mj-text font-size="12px" color="black" font-family="helvetica">Hi ${user.firstName}, your accont verification code is: <b>${user.emailVerificationCode}</b></mj-text>

            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `)

  const info = await transporter.sendMail({
    from: '"No Reply" <no-reply-short-form-learning@outlook.com>',
    to: user.email,
    subject: 'Short Form Learning - Verify your email',
    html: content.html
  })
}
