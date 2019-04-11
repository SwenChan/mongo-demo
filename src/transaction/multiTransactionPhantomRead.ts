import * as mongoose from 'mongoose'
import {Schema} from 'mongoose'
import * as bluebird from 'bluebird'

// 多个事务演示 幻读 出现
async function run () {
  const connection = await mongoose.createConnection('mongodb://localhost:27017,localhost:27018,localhost:27019/temp?replicaSet=rs',  { useNewUrlParser: true })
  const model = connection.model('transactionTest', new Schema({}, {strict: false}), 'transactionTest')
  await model.deleteMany({})
  const [record] = await model.create([{version: 1}])

  const [sessionA, sessionB] = await bluebird.all([
    connection.startSession(),
    connection.startSession()
  ])

  await bluebird.all([sessionA.startTransaction(), sessionB.startTransaction()])
  await model.create([{version: 1}], {session: sessionA})

  const BeforeACommitSessionBResult = await model.find().session(sessionB).lean()
  console.log(`BeforeACommitSessionBResult: ${JSON.stringify(BeforeACommitSessionBResult)}`)
  
  await sessionA.commitTransaction()

  const result = await model.find({}).lean()
  console.log(`total: ${JSON.stringify(result)}`)

  await model.updateMany({}, {$set: {sessionB: true}}).session(sessionB).lean()
  const sessionBResult = await model.find().session(sessionB).lean()
  console.log(`sessionBResult: ${JSON.stringify(sessionBResult)}`)
  await sessionB.commitTransaction()
  const sessionBCommitResult = await model.find().lean()
  console.log(`sessionBCommitResult: ${JSON.stringify(sessionBCommitResult)}`)

}

run()
