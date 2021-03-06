import * as mongoose from 'mongoose'
import {Schema} from 'mongoose'
import * as bluebird from 'bluebird'

// 单个事务演示 执行abort回滚
async function run () {
  const connection = await mongoose.createConnection('mongodb://localhost:27017,localhost:27018,localhost:27019/temp?replicaSet=rs',  { useNewUrlParser: true })
  const model = connection.model('transactionTest2', new Schema({}, {strict: false}), 'transactionTest2')
  await model.deleteMany({})

  const session = await connection.startSession()
  const [record] = await model.create([{version: 1}], {session})
  session.startTransaction()
  const id = record.id
  const beforeCommit = await model.findById(id).session(session).lean()
  console.log(`beforeCommit: ${JSON.stringify(beforeCommit)}`)
  await model.findByIdAndUpdate(id, {$inc: {version: 1}}, {new: true}).session(session).lean()
  const beforeCommitModify = await model.findById(id).session(session).lean()
  console.log(`beforeCommitModify: ${JSON.stringify(beforeCommitModify)}`)

  await session.abortTransaction()

  const afterCommit = await model.findById(id).lean()
  console.log(`afterCommit: ${JSON.stringify(afterCommit)}`)
}

run()
