import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import Logging from 'lib/Logging'

@Injectable()
export class EmailService {
  constructor(private readonly emailService: MailerService) {}

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const from = process.env.FROM
    try {
      await this.emailService.sendMail({
        to,
        from,
        subject,
        text: '',
        html,
      })
    } catch (err) {
      Logging.error(err)
    }
  }
}
