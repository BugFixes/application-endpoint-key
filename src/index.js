const bugfixes = require('bugfixes')
const ApplicationModel = require('bugfixes-application-models')
const AccountModel = require('bugfixes-account-models')
const Logs = require('bugfixes-account-logging')

const bugfunctions = bugfixes.functions

module.exports = (event, context, callback) => {
  let log = new Logs()
  log.action = 'Get Key from ID'
  log.content = {
    apiKey: event.requestContext.identity.apiKey,
    applicationId: event.pathParameters.applicationId
  }
  log.authyId = event.headers.authyId
  log.requestId = event.headers.requestId

  let account = new AccountModel()
  account.authyId = parseInt(event.headers.authyId)
  account.getAccount((error, result) => {
    if (error) {
      log.content.error = error
      log.send()

      bugfixes.error('Get Key from ID', 'Account Check', error)

      return callback(error)
    }

    if (result.accountId) {
      let accountId = result.accountId

      log.accountId = accountId

      let application = new ApplicationModel()
      application.accountId = accountId
      application.applicationId = event.pathParameters.applicationId
      application.getKey((error, result) => {
        if (error) {
          log.content.error = error
          log.send()

          bugfixes.error('Get Key from ID', 'List', error)

          return callback(error)
        }

        log.send()

        return callback(null, bugfunctions.lambdaResult(5000, result))
      })
    } else {
      return callback(null, bugfunctions.lambdaError(5001, 'Invalid Account'))
    }
  })
}
