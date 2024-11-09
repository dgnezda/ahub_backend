export default function getEmailString(restLink: string): string {
  return `
    <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #F6F6F4;
                  color: #071015;
                  margin: 0;
                  padding: 20px;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #FFFFFF;
                  padding: 20px;
                  border-radius: 8px;
                  text-align: center;
              }
              .header {
                  margin-bottom: 20px;
              }
              .logo-container {
                  display: inline-block;
                  width: 64px;
                  height: 64px;
                  background-color: #F4FF47;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 10px auto;
              }
              .content {
                  font-size: 16px;
                  line-height: 1.5;
                  margin-bottom: 20px;
                  text-align: left;
              }
              .btn-container {
                  text-align: center;
              }
              .btn {
                  display: inline-block;
                  background-color: #F4FF47;
                  color: #071015;
                  text-decoration: none;
                  padding: 4px 20px;
                  border-radius: 20px;
                  font-size: 16px;
                  font-weight: 700;
                  width: auto;
                  height: 40px;
                  line-height: 40px;
                  text-align: center;
              }
              .footer {
                  font-size: 14px;
                  color: #777777;
                  text-align: center;
                  margin-top: 30px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo-container">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M28.8589 26.2287C28.6583 26.2287 28.4752 26.2202 28.3074 26.2054V1.09427H22.3019V5.18828C21.4322 3.568 20.1482 2.29839 18.4501 1.37946C16.752 0.460523 14.8054 0 12.6125 0C10.2627 0 8.12643 0.621072 6.20163 1.8611C4.27684 3.10114 2.76403 4.77634 1.65886 6.88461C0.551499 8.99287 0 11.2955 0 13.7924C0 16.3063 0.549319 18.6174 1.64578 20.7256C2.74223 22.8339 4.25722 24.5049 6.18856 25.7365C8.12207 26.968 10.2714 27.5849 12.6387 27.5849C14.8142 27.5849 16.752 27.1286 18.448 26.2181C20.146 25.3076 21.43 24.0422 22.2997 22.422C22.2997 23.6514 22.267 24.883 22.3128 26.1125C22.3237 26.4188 22.3433 26.723 22.3717 27.0293C22.5025 28.375 22.8033 29.8495 23.8975 30.779C24.1787 31.0177 24.4948 31.2142 24.8327 31.3663C25.77 31.7887 27.1106 32 28.8567 32H31.9978V26.2287H28.8589ZM20.9962 17.9055C20.2986 19.1455 19.346 20.1236 18.1362 20.8397C16.9264 21.558 15.5989 21.915 14.1537 21.915C12.7259 21.915 11.4114 21.5854 10.2104 20.9284C9.00926 20.2715 8.05232 19.3251 7.33733 18.0935C6.62234 16.8619 6.26703 15.4275 6.26703 13.7924C6.26703 12.206 6.62016 10.799 7.32425 9.56536C8.02834 8.33377 8.98311 7.37682 10.1842 6.69237C11.3853 6.01003 12.7084 5.66781 14.1537 5.66781C15.5989 5.66781 16.9221 6.03116 18.1232 6.75574C19.3243 7.48033 20.2768 8.46475 20.9831 9.70478C21.6872 10.9448 22.0403 12.3074 22.0403 13.7924C22.0403 15.2944 21.6916 16.6654 20.9962 17.9055Z" fill="#071015"/>
                      </svg>
                  </div>
                  <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                  <p>Hello,</p>
                  <p>You have requested to reset your password. Please click the button below to proceed:</p>
              </div>
              <div class="btn-container">
                  <a href="${restLink}" class="btn">Reset Password</a>
              </div>
              <div class="content">
                  <p>If you did not request this, please ignore this email. Your password will remain unchanged, and no further action is required.</p>
              </div>
              <div class="footer">
                  <p>Thank you for using our service!</p>
              </div>
          </div>
      </body>
    </html>`
}
